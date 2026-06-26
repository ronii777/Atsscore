import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const SYSTEM_PROMPT = `You are an expert ATS (Applicant Tracking System) optimizer and professional technical resume reviewer.
Analyze the provided resume text and generate structured constructive feedback in JSON format.
The JSON must strictly match the following schema:
{
  "score": 85,
  "summary": "Brief 2-3 sentence overview of the candidate's professional profile, core expertise, and impressions.",
  "strengths": [
    "Identified strength 1",
    "Identified strength 2"
  ],
  "weaknesses": [
    "Identified weakness 1",
    "Identified weakness 2"
  ],
  "missingSkills": [
    "Missing skill or section 1",
    "Missing skill or section 2"
  ],
  "suggestions": [
    "Specific improvement suggestion 1",
    "Specific improvement suggestion 2"
  ]
}

Only return the raw JSON object. Do not include markdown code block syntax (like \`\`\`json) or any pre/post text. Ensure it is a valid, parseable JSON string.`;

// ════════════════════════════════════════════════════════
// INTELLIGENT LOCAL ANALYSIS ENGINE (No API Key Required)
// Reads actual resume content and produces unique feedback
// ════════════════════════════════════════════════════════

function generateMockFeedback(resumeText) {
  const text = resumeText;
  const lower = text.toLowerCase();
  const lines = text.split('\n').filter(l => l.trim().length > 0);
  const wordCount = text.split(/\s+/).filter(w => w).length;

  // ── EXTRACT REAL CONTENT FROM RESUME ──

  // Extract candidate name (usually the first substantial line)
  const nameLine = lines.find(l => l.trim().length > 2 && l.trim().length < 50 && !/[@.|:\/]/.test(l));
  const candidateName = nameLine ? nameLine.trim() : 'the candidate';

  // Extract email
  const emailMatch = text.match(/[\w.+-]+@[\w.-]+\.\w{2,}/);
  const email = emailMatch ? emailMatch[0] : null;

  // Extract phone
  const phoneMatch = text.match(/(\+?\d[\d\s\-().]{7,}\d)/);
  const phone = phoneMatch ? phoneMatch[0].trim() : null;

  // Extract LinkedIn
  const linkedinMatch = text.match(/linkedin\.com\/in\/[\w-]+/i);
  const linkedin = linkedinMatch ? linkedinMatch[0] : null;
  const hasLinkedin = /linkedin/i.test(text);

  // Extract GitHub  
  const githubMatch = text.match(/github\.com\/[\w-]+/i);
  const github = githubMatch ? githubMatch[0] : null;
  const hasGithub = /github/i.test(text);

  // Extract portfolio/website
  const hasPortfolio = /portfolio|\.dev\/|\.io\/|\.me\/|personal\s*site|website/i.test(text);

  // ── EXTRACT JOB TITLES AND COMPANIES ──
  const jobPatterns = [
    /(?:^|\n)\s*([\w\s]+?(?:developer|engineer|designer|manager|analyst|lead|architect|intern|associate|consultant|specialist|administrator|coordinator))\s*(?:[-–|@,]|at)\s*([\w\s&.]+)/gi,
    /(?:^|\n)\s*([\w\s]+?(?:developer|engineer|designer|manager|analyst|lead|architect|intern|associate|consultant|specialist))\s*$/gim,
  ];
  
  const extractedJobs = [];
  const titleRegex = /\b((?:senior|junior|lead|staff|principal|full[\s-]?stack|front[\s-]?end|back[\s-]?end|software|web|mobile|data|cloud|devops|ml|ai|qa|test|ui\/ux|ux|ui|product|project|program|marketing|sales|business|system|network|database|security|it)\s*){0,3}(developer|engineer|designer|manager|analyst|lead|architect|intern|trainee|associate|consultant|specialist|administrator|coordinator|executive|officer|director|head)\b/gi;
  let titleMatch;
  while ((titleMatch = titleRegex.exec(text)) !== null) {
    extractedJobs.push(titleMatch[0].trim());
  }
  const uniqueJobs = [...new Set(extractedJobs.map(j => j.replace(/\s+/g, ' ')))];

  // Extract companies (look for "at <Company>" or lines with years)
  const companyMatches = [];
  const companyRegex = /(?:at|@|[-–|])\s+([A-Z][\w\s&.]+?)(?:\s*[-–|(]|\s*\d{4}|\s*$)/gm;
  let compMatch;
  while ((compMatch = companyRegex.exec(text)) !== null) {
    const name = compMatch[1].trim();
    if (name.length > 2 && name.length < 40) companyMatches.push(name);
  }

  // Extract date ranges and count roles
  const dateRanges = text.match(/\b(20\d{2}|19\d{2})\s*[-–]\s*(present|20\d{2}|19\d{2})\b/gi) || [];
  const jobCount = dateRanges.length;

  // ── EXTRACT EDUCATION ──
  const degreeMatch = text.match(/\b(b\.?\s*tech|m\.?\s*tech|b\.?\s*e\.?|m\.?\s*e\.?|b\.?\s*sc|m\.?\s*sc|b\.?\s*a\.?|m\.?\s*a\.?|b\.?\s*com|m\.?\s*com|mba|mca|bca|phd|bachelor|master|diploma|associate)/gi);
  const degrees = degreeMatch ? [...new Set(degreeMatch.map(d => d.trim()))] : [];

  const collegeRegex = /\b(university|college|institute|school|academy|iit|nit|iiit|bits|vit|srm|amity)\b.*$/gim;
  const collegeMatches = [];
  let colMatch;
  while ((colMatch = collegeRegex.exec(text)) !== null) {
    collegeMatches.push(colMatch[0].trim().substring(0, 60));
  }

  // ── SKILL DETECTION (with categories) ──
  const skillCategories = {
    'Frontend': {
      'React': /\breact(\.js|js)?\b/i, 'Angular': /\bangular(\.js|js)?\b/i,
      'Vue.js': /\bvue(\.js|js)?\b/i, 'Next.js': /\bnext(\.js|js)?\b/i,
      'HTML/CSS': /\bhtml\b|\bcss\b/i, 'Tailwind': /\btailwind\b/i,
      'Bootstrap': /\bbootstrap\b/i, 'Redux': /\bredux\b/i,
      'jQuery': /\bjquery\b/i, 'Sass/SCSS': /\bsass\b|\bscss\b/i,
    },
    'Backend': {
      'Node.js': /\bnode(\.js|js)?\b/i, 'Express': /\bexpress(\.js|js)?\b/i,
      'Python': /\bpython\b/i, 'Django': /\bdjango\b/i, 'Flask': /\bflask\b/i,
      'Java': /\bjava\b(?!script)/i, 'Spring Boot': /\bspring\s*boot\b/i,
      'PHP': /\bphp\b/i, 'Laravel': /\blaravel\b/i,
      'Ruby': /\bruby\b/i, 'Rails': /\brails\b/i,
      'C#': /\bc#\b|\bc\s*sharp\b/i, '.NET': /\.net\b|dotnet/i,
      'Go': /\bgolang\b/i, 'Rust': /\brust\b/i,
    },
    'Languages': {
      'JavaScript': /\bjavascript\b/i, 'TypeScript': /\btypescript\b/i,
      'C': /\bc\b(?!\+|#|s)/i, 'C++': /\bc\+\+\b/i,
      'Kotlin': /\bkotlin\b/i, 'Swift': /\bswift\b/i,
      'R': /\br\b(?!\s*&)/i, 'Scala': /\bscala\b/i,
      'Dart': /\bdart\b/i,
    },
    'Database': {
      'SQL': /\bsql\b/i, 'MySQL': /\bmysql\b/i, 'PostgreSQL': /\bpostgres(ql)?\b/i,
      'MongoDB': /\bmongo(db)?\b/i, 'Redis': /\bredis\b/i,
      'Firebase': /\bfirebase\b/i, 'SQLite': /\bsqlite\b/i,
      'Oracle': /\boracle\b/i, 'DynamoDB': /\bdynamo\s*db\b/i,
    },
    'DevOps/Cloud': {
      'Docker': /\bdocker\b/i, 'Kubernetes': /\bkubernetes\b|\bk8s\b/i,
      'AWS': /\baws\b|\bamazon\s*web/i, 'Azure': /\bazure\b/i,
      'GCP': /\bgcp\b|\bgoogle\s*cloud/i, 'Linux': /\blinux\b|\bubuntu\b/i,
      'Nginx': /\bnginx\b/i, 'CI/CD': /\bci\s*\/?\s*cd\b|\bgithub\s*actions\b|\bjenkins\b/i,
      'Terraform': /\bterraform\b/i, 'Ansible': /\bansible\b/i,
    },
    'Tools': {
      'Git': /\bgit\b(?!hub)/i, 'GitHub': /\bgithub\b/i, 'GitLab': /\bgitlab\b/i,
      'Jira': /\bjira\b/i, 'Postman': /\bpostman\b/i, 'VS Code': /\bvs\s*code\b/i,
      'Figma': /\bfigma\b/i, 'Webpack': /\bwebpack\b/i, 'Vite': /\bvite\b/i,
    },
    'Testing': {
      'Jest': /\bjest\b/i, 'Mocha': /\bmocha\b/i, 'Cypress': /\bcypress\b/i,
      'Selenium': /\bselenium\b/i, 'PyTest': /\bpytest\b/i, 'JUnit': /\bjunit\b/i,
    },
    'AI/ML': {
      'TensorFlow': /\btensorflow\b/i, 'PyTorch': /\bpytorch\b/i,
      'Pandas': /\bpandas\b/i, 'NumPy': /\bnumpy\b/i,
      'Scikit-learn': /\bscikit/i, 'OpenAI': /\bopenai\b/i,
      'NLP': /\bnlp\b|\bnatural\s*language/i,
    },
    'Soft Skills': {
      'Agile': /\bagile\b/i, 'Scrum': /\bscrum\b/i,
      'Leadership': /\bleadership\b|\bled\s+(?:a\s+)?team/i,
      'Communication': /\bcommunication\b/i,
      'Problem Solving': /\bproblem[\s-]solv/i,
    },
  };

  const allDetectedSkills = [];
  const skillsByCategory = {};
  for (const [category, skills] of Object.entries(skillCategories)) {
    skillsByCategory[category] = [];
    for (const [name, regex] of Object.entries(skills)) {
      if (regex.test(text)) {
        allDetectedSkills.push(name);
        skillsByCategory[category].push(name);
      }
    }
  }

  // ── SECTION DETECTION ──
  const sections = {
    'Professional Summary': /\b(summary|objective|profile|about\s*me|career\s*objective)\b/i,
    'Work Experience': /\b(experience|employment|work\s*history|professional\s*experience)\b/i,
    'Education': /\b(education|academic|qualification|degree)\b/i,
    'Skills': /\b(skills|technical\s*skills|technologies|tech\s*stack|competencies|proficiency)\b/i,
    'Projects': /\b(projects|personal\s*projects|key\s*projects|academic\s*projects)\b/i,
    'Certifications': /\b(certification|certified|certificate|license|credential)\b/i,
    'Awards': /\b(awards|honors|achievements|recognition|accomplishment)\b/i,
  };

  const foundSections = {};
  for (const [name, regex] of Object.entries(sections)) {
    foundSections[name] = regex.test(text);
  }

  // ── QUALITY ANALYSIS ──
  // Find actual bullet points from the resume
  const bulletLines = lines.filter(l => /^\s*[-•●►▪✓✔◆■]\s/.test(l) || /^\s*\d+[.)]\s/.test(l));
  const hasBullets = bulletLines.length > 0;

  // Metrics detection — find actual numbers
  const metricsFound = [];
  const metricPatterns = [
    { regex: /\b(\d+)\s*%/g, type: 'percentage' },
    { regex: /\$\s*([\d,]+)/g, type: 'dollar' },
    { regex: /\b(\d+)\s*\+?\s*(users|customers|clients|members|students|employees|requests|downloads|visitors)/gi, type: 'scale' },
    { regex: /\b(\d+)x\b/gi, type: 'multiplier' },
    { regex: /\b(reduced|increased|improved|boosted|grew|cut|saved)\s+.*?\b(\d+)/gi, type: 'impact' },
  ];
  for (const { regex, type } of metricPatterns) {
    let m;
    while ((m = regex.exec(text)) !== null) {
      metricsFound.push({ match: m[0].trim(), type });
    }
  }
  const hasMetrics = metricsFound.length > 0;

  // Action verb analysis — find the actual verbs used
  const strongVerbs = ['led', 'built', 'designed', 'developed', 'implemented', 'managed', 'created', 'optimized', 'reduced', 'increased', 'delivered', 'architected', 'spearheaded', 'launched', 'automated', 'streamlined', 'mentored', 'resolved', 'engineered', 'deployed', 'migrated', 'refactored', 'scaled', 'integrated', 'configured', 'established'];
  const weakVerbs = ['responsible for', 'worked on', 'helped with', 'assisted in', 'involved in', 'participated in', 'was part of', 'handled', 'did', 'used', 'utilized'];

  const usedStrongVerbs = strongVerbs.filter(v => new RegExp(`\\b${v}\\b`, 'i').test(lower));
  const usedWeakVerbs = weakVerbs.filter(v => lower.includes(v));

  // Find actual weak bullet points to quote
  const weakBullets = bulletLines.filter(l => weakVerbs.some(v => l.toLowerCase().includes(v))).slice(0, 3);
  const strongBullets = bulletLines.filter(l => strongVerbs.some(v => new RegExp(`\\b${v}\\b`, 'i').test(l.toLowerCase()))).slice(0, 3);

  // ── SCORE CALCULATION ──
  let score = 35;
  score += Math.min(allDetectedSkills.length * 1.5, 15);
  score += hasMetrics ? (Math.min(metricsFound.length * 2, 10)) : 0;
  score += Math.min(usedStrongVerbs.length * 1, 8);
  score -= Math.min(usedWeakVerbs.length * 2, 6);
  score += foundSections['Professional Summary'] ? 4 : 0;
  score += foundSections['Work Experience'] ? 5 : 0;
  score += foundSections['Education'] ? 3 : 0;
  score += foundSections['Skills'] ? 3 : 0;
  score += foundSections['Projects'] ? 4 : 0;
  score += foundSections['Certifications'] ? 3 : 0;
  score += foundSections['Awards'] ? 2 : 0;
  score += (email && phone) ? 3 : (email || phone) ? 1 : 0;
  score += hasLinkedin ? 2 : 0;
  score += hasGithub ? 2 : 0;
  score += hasPortfolio ? 1 : 0;
  score += hasBullets ? 2 : 0;
  score += (wordCount >= 300 && wordCount <= 800) ? 3 : (wordCount >= 200) ? 1 : 0;
  score += jobCount >= 2 ? 3 : jobCount === 1 ? 1 : 0;
  score += degrees.length > 0 ? 2 : 0;
  score = Math.max(25, Math.min(Math.round(score), 96));

  // ── BUILD PERSONALIZED SUMMARY ──
  const topSkills = allDetectedSkills.slice(0, 5).join(', ') || 'general skills';
  const roleDesc = uniqueJobs.length > 0 ? uniqueJobs[0] : 'professional';
  const eduDesc = degrees.length > 0 ? degrees[0].toUpperCase() : null;
  
  let summary = `${candidateName} presents as a ${roleDesc} with ${
    allDetectedSkills.length > 0 ? `demonstrated expertise in ${topSkills}` : 'a technical background'
  }. `;
  
  if (jobCount > 0) {
    summary += `The resume documents ${jobCount} role${jobCount > 1 ? 's' : ''} with date ranges${companyMatches.length > 0 ? ` including experience at ${companyMatches.slice(0, 2).join(' and ')}` : ''}. `;
  }
  
  if (hasMetrics) {
    summary += `Positive: the resume includes ${metricsFound.length} quantified achievement${metricsFound.length > 1 ? 's' : ''}, which strengthens ATS compatibility. `;
  } else {
    summary += `Key concern: no quantified metrics or measurable achievements were found — this significantly reduces ATS scoring potential. `;
  }

  if (score >= 80) summary += 'Overall, this is a strong resume that should perform well in most ATS systems.';
  else if (score >= 65) summary += 'With targeted improvements, this resume can perform much better in ATS filtering.';
  else summary += 'Significant structural and content improvements are needed to pass competitive ATS filters.';

  // ── BUILD STRENGTHS (referencing real content) ──
  const strengths = [];

  // Skills-based strengths
  const strongCategories = Object.entries(skillsByCategory).filter(([_, skills]) => skills.length >= 2);
  if (strongCategories.length > 0) {
    for (const [cat, skills] of strongCategories.slice(0, 2)) {
      strengths.push(`Strong ${cat.toLowerCase()} skills: ${skills.join(', ')} — these are in active market demand.`);
    }
  } else if (allDetectedSkills.length > 0) {
    strengths.push(`Technical skills detected: ${allDetectedSkills.join(', ')}.`);
  }

  // Job-based strengths
  if (uniqueJobs.length > 0) {
    strengths.push(`Clear professional positioning as a "${uniqueJobs[0]}"${uniqueJobs.length > 1 ? ` with progression through ${uniqueJobs.length} role levels` : ''}.`);
  }

  // Metrics-based strengths
  if (hasMetrics) {
    const metricExamples = metricsFound.slice(0, 2).map(m => `"${m.match}"`).join(' and ');
    strengths.push(`Uses quantified achievements (${metricExamples}) — this is exactly what recruiters look for.`);
  }

  // Action verb strengths
  if (usedStrongVerbs.length >= 3) {
    strengths.push(`Effective action verb usage: "${usedStrongVerbs.slice(0, 4).join('", "')}" — these create strong impressions of ownership.`);
  }

  // Structure strengths
  if (strongBullets.length > 0) {
    const example = strongBullets[0].trim().substring(0, 80);
    strengths.push(`Well-written bullet points like: "${example}..." demonstrate clear accomplishments.`);
  }

  if (foundSections['Projects']) {
    strengths.push('Includes a dedicated Projects section — this demonstrates initiative and practical application of skills.');
  }

  if (degrees.length > 0 && collegeMatches.length > 0) {
    strengths.push(`Education credentials clearly listed: ${degrees[0].toUpperCase()} from ${collegeMatches[0].substring(0, 50)}.`);
  }

  if (hasLinkedin || hasGithub) {
    const links = [linkedin && `LinkedIn (${linkedin})`, github && `GitHub (${github})`].filter(Boolean);
    strengths.push(`Professional online presence: ${links.join(', ')} — recruiters actively check these.`);
  }

  if (strengths.length === 0) {
    strengths.push('Resume contains relevant experience that can be restructured for better ATS performance.');
  }

  // ── BUILD WEAKNESSES (referencing real problems) ──
  const weaknesses = [];

  if (!hasMetrics) {
    weaknesses.push(`No quantified metrics found anywhere in the resume. None of your ${bulletLines.length || 'experience'} bullet points include numbers, percentages, or measurable outcomes — ATS systems rank metric-backed resumes 40% higher.`);
  }

  if (usedWeakVerbs.length > 0) {
    const exampleWeak = weakBullets.length > 0 
      ? `For example: "${weakBullets[0].trim().substring(0, 80)}..."` 
      : `Phrases like "${usedWeakVerbs[0]}" were detected`;
    weaknesses.push(`${usedWeakVerbs.length} passive/weak phrase(s) found ("${usedWeakVerbs.join('", "')}"). ${exampleWeak} — replace with action-driven language.`);
  }

  if (!foundSections['Professional Summary']) {
    weaknesses.push('No professional summary/objective section found at the top of the resume. This is the first 6 seconds of a recruiter\'s attention — you need a compelling 2-3 sentence pitch here.');
  }

  if (wordCount < 200) {
    weaknesses.push(`Resume is critically short (~${wordCount} words). Competitive resumes typically contain 400-600 words. This suggests missing details about your responsibilities and impact.`);
  } else if (wordCount > 900) {
    weaknesses.push(`Resume is quite long (~${wordCount} words). Unless you have 10+ years of experience, condense to 1 page (400-600 words). Remove older or less relevant roles.`);
  }

  if (!email) {
    weaknesses.push('No email address detected — this is critical missing contact information that every resume must have.');
  }
  if (!phone) {
    weaknesses.push('No phone number detected — recruiters need a direct contact method for scheduling interviews.');
  }

  if (!hasBullets && bulletLines.length === 0) {
    weaknesses.push('No bullet-point formatting detected. The resume appears to use paragraph-style text, which is harder for both ATS parsers and recruiters to scan quickly.');
  }

  if (allDetectedSkills.length < 3) {
    weaknesses.push(`Only ${allDetectedSkills.length} recognizable technical skill(s) detected. Either the skills section is missing, or skills are buried in paragraphs where ATS systems may not find them.`);
  }

  if (weaknesses.length === 0) {
    weaknesses.push('No critical issues detected, but review individual bullet points for maximum impact.');
  }

  // ── BUILD MISSING ITEMS (based on what's actually absent) ──
  const missingSkills = [];

  // Missing sections
  const criticalMissing = [];
  if (!foundSections['Professional Summary']) criticalMissing.push('Professional Summary/Objective');
  if (!foundSections['Projects']) criticalMissing.push('Projects');
  if (!foundSections['Certifications']) criticalMissing.push('Certifications');
  if (!foundSections['Awards']) criticalMissing.push('Awards/Achievements');
  if (criticalMissing.length > 0) {
    missingSkills.push(`Missing resume sections that boost ATS scores: ${criticalMissing.join(', ')}.`);
  }

  // Missing contact/links
  if (!hasLinkedin) {
    missingSkills.push('LinkedIn profile URL — 87% of recruiters verify candidates on LinkedIn before shortlisting.');
  }
  if (!hasGithub && allDetectedSkills.some(s => ['React', 'Node.js', 'Python', 'JavaScript', 'TypeScript', 'Java', 'C++', 'Go', 'Rust'].includes(s))) {
    missingSkills.push('GitHub profile link — for technical roles, visible open-source work or project repos are a strong differentiator.');
  }

  // Missing complementary technologies (smart suggestions based on what they DO have)
  const frontendSkills = skillsByCategory['Frontend'] || [];
  const backendSkills = skillsByCategory['Backend'] || [];
  const devopsSkills = skillsByCategory['DevOps/Cloud'] || [];
  const testingSkills = skillsByCategory['Testing'] || [];

  if (frontendSkills.length > 0 && !allDetectedSkills.includes('TypeScript')) {
    missingSkills.push(`TypeScript — you list ${frontendSkills.join(', ')} but TypeScript is now expected in 70%+ of frontend job postings.`);
  }
  if ((frontendSkills.length > 0 || backendSkills.length > 0) && !allDetectedSkills.includes('Docker')) {
    missingSkills.push('Docker/containerization — essential for modern deployment workflows and frequently listed in job requirements.');
  }
  if (testingSkills.length === 0) {
    missingSkills.push('Testing frameworks (Jest, PyTest, JUnit, Cypress) — demonstrates code quality discipline that employers actively look for.');
  }
  if (!devopsSkills.some(s => ['AWS', 'Azure', 'GCP'].includes(s))) {
    missingSkills.push('Cloud platform experience (AWS/Azure/GCP) — cloud skills appear in 65%+ of engineering job descriptions.');
  }
  if (!allDetectedSkills.includes('CI/CD') && devopsSkills.length === 0) {
    missingSkills.push('CI/CD pipeline experience (GitHub Actions, Jenkins) — shows you can automate deployment and testing.');
  }

  if (missingSkills.length === 0) {
    missingSkills.push('Resume coverage is solid — focus on deepening expertise signals in your strongest areas.');
  }

  // ── BUILD SUGGESTIONS (specific, actionable, referencing their content) ──
  const suggestions = [];

  // Rewrite weak bullets
  if (weakBullets.length > 0) {
    const original = weakBullets[0].trim().replace(/^[-•●►▪]\s*/, '').substring(0, 70);
    suggestions.push(`Rewrite weak bullet: "${original}..." → Start with a strong verb and add a metric. Example: "Developed [feature], resulting in [X]% improvement in [metric]."`);
  } else if (!hasMetrics) {
    suggestions.push('Add measurable impact to your top 3-5 bullet points. Example: "Optimized database queries, reducing API response time by 35% for 10K+ daily users."');
  }

  if (!foundSections['Professional Summary']) {
    const suggestedRole = uniqueJobs.length > 0 ? uniqueJobs[0] : (allDetectedSkills.length > 0 ? `${allDetectedSkills[0]} Developer` : 'Software Engineer');
    suggestions.push(`Add a professional summary at the top: "Results-driven ${suggestedRole} with ${jobCount > 0 ? jobCount + '+ years' : 'hands-on'} experience in ${topSkills}. Proven track record of [key achievement]."`);
  }

  if (allDetectedSkills.length > 0 && allDetectedSkills.length < 10) {
    const missingTools = ['Git', 'Docker', 'REST API', 'Agile'].filter(s => !allDetectedSkills.includes(s));
    if (missingTools.length > 0) {
      suggestions.push(`Expand your skills section — you currently list ${allDetectedSkills.length} skills. Consider adding: ${missingTools.slice(0, 3).join(', ')} if you have experience with them.`);
    }
  }

  if (!foundSections['Projects'] && allDetectedSkills.length > 0) {
    suggestions.push(`Add 2-3 personal/academic projects with: Project name, tech stack used (${allDetectedSkills.slice(0, 3).join(', ')}), your specific contribution, and a link to the live demo or repo.`);
  }

  if (jobCount <= 1 && !foundSections['Projects']) {
    suggestions.push('With limited work experience, compensate by adding internships, freelance work, hackathon participation, or open-source contributions.');
  }

  if (!foundSections['Certifications']) {
    const certMap = {
      'AWS': 'AWS Certified Cloud Practitioner',
      'Python': 'Google IT Automation with Python (Coursera)',
      'React': 'Meta Front-End Developer Certificate',
      'Java': 'Oracle Certified Java Programmer',
      'Azure': 'Microsoft Azure Fundamentals (AZ-900)',
      'GCP': 'Google Cloud Digital Leader',
    };
    const relevantCert = allDetectedSkills.find(s => certMap[s]);
    const certSuggestion = relevantCert ? certMap[relevantCert] : 'a relevant industry certification from Coursera, Google, or AWS';
    suggestions.push(`Consider adding certifications like "${certSuggestion}" — certified candidates are 25% more likely to pass ATS screening.`);
  }

  suggestions.push(`Formatting tip: Use a clean, single-column layout with standard headings ("Experience", "Skills", "Education"). Avoid tables, graphics, headers/footers, and multi-column designs — these break 60%+ of ATS text extractors.`);

  // Keep suggestions to a reasonable count
  const finalSuggestions = suggestions.slice(0, 6);

  return {
    score,
    summary,
    strengths: strengths.slice(0, 6),
    weaknesses: weaknesses.slice(0, 5),
    missingSkills: missingSkills.slice(0, 5),
    suggestions: finalSuggestions,
    isMock: true
  };
}


/**
 * Analyzes resume text using the configured AI model.
 * @param {string} resumeText - Cleaned text from resume.
 * @returns {Promise<object>} Parsed JSON analysis response.
 */
export async function analyzeResume(resumeText) {
  const provider = (process.env.AI_PROVIDER || 'openai').toLowerCase();
  const openAIKey = process.env.OPENAI_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  const isDefaultOpenAI = !openAIKey || openAIKey.includes('your_openai_api_key_here');
  const isDefaultGemini = !geminiKey || geminiKey.includes('your_gemini_api_key_here');

  if ((provider === 'openai' && isDefaultOpenAI) || (provider === 'gemini' && isDefaultGemini)) {
    console.warn(`[AI SERVICE] No API key configured. Running intelligent local analysis.`);
    return generateMockFeedback(resumeText);
  }

  if (provider === 'openai') {
    return analyzeWithOpenAI(resumeText, openAIKey);
  } else if (provider === 'gemini') {
    return analyzeWithGemini(resumeText, geminiKey);
  } else {
    throw new Error(`Unsupported AI Provider: ${provider}`);
  }
}

async function analyzeWithOpenAI(resumeText, apiKey) {
  const modelName = process.env.OPENAI_MODEL || 'gpt-4o-mini';
  console.log(`[AI SERVICE] Analyzing with OpenAI (${modelName})...`);

  const openai = new OpenAI({ apiKey });

  try {
    const response = await openai.chat.completions.create({
      model: modelName,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `Analyze this resume text:\n\n${resumeText}` }
      ],
      response_format: { type: 'json_object' }
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error('[AI SERVICE] OpenAI failed:', error);
    throw new Error(`OpenAI API failed: ${error.message}`);
  }
}

async function analyzeWithGemini(resumeText, apiKey) {
  const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
  console.log(`[AI SERVICE] Analyzing with Gemini (${modelName})...`);

  const genAI = new GoogleGenerativeAI(apiKey);

  try {
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: { responseMimeType: 'application/json' }
    });

    const prompt = `${SYSTEM_PROMPT}\n\nAnalyze this resume text:\n\n${resumeText}`;
    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text());
  } catch (error) {
    console.error('[AI SERVICE] Gemini failed:', error);
    throw new Error(`Gemini API failed: ${error.message}`);
  }
}
