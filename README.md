AI Resume Analyzer

AI Resume Analyzer is a full-stack web application that evaluates PDF resumes against Applicant Tracking System (ATS) standards using Artificial Intelligence. Users can upload a resume, which is parsed on the backend and analyzed using either OpenAI GPT-4o-mini or Google Gemini 1.5 Flash. The application returns an ATS score along with strengths, weaknesses, missing skills, and personalized improvement suggestions through a modern glassmorphic dashboard.

Features
Drag-and-drop PDF upload
AI-powered ATS resume analysis
Support for OpenAI and Gemini
Automatic Mock Mode when API keys are unavailable
Animated ATS score gauge
Resume strengths and weaknesses
Missing skills detection
Improvement recommendations
Copy report as Markdown
Download complete JSON report
Tech Stack
Frontend
React (Vite)
CSS3
SVG Animations
Backend
Node.js
Express.js
Multer
PDF Parser
AI
OpenAI GPT-4o-mini
Google Gemini 1.5 Flash
Project Structure
resume-analyzer/
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── App.jsx
│   │   └── index.css
│   ├── package.json
│   └── index.html
│
├── server/
│   ├── services/
│   ├── utils/
│   ├── index.js
│   ├── package.json
│   └── .env.example
│
├── README.md
├── tech.md
└── skill.md
Project Setup
1. Clone Repository
git clone <repository-url>
cd resume-analyzer
2. Backend Configuration

Create the environment file.

cp server/.env.example server/.env

Windows:

copy server\.env.example server\.env

Update the following variables:

AI_PROVIDER=openai

OPENAI_API_KEY=your_key

GEMINI_API_KEY=your_key

Choose either:

AI_PROVIDER=openai

or

AI_PROVIDER=gemini

If no API key is provided, the application automatically switches to Mock Mode.

3. Install Dependencies

Backend

cd server
npm install
npm run start

Frontend

cd client
npm install
npm run dev
4. Run Application

Frontend

http://localhost:3000

Backend

http://localhost:5000

The frontend proxies /api requests to the backend.

Application Workflow
User Uploads Resume
        │
        ▼
Frontend sends PDF
        │
        ▼
Express Backend
        │
        ▼
PDF Text Extraction
        │
        ▼
AI Service
(OpenAI / Gemini)
        │
        ▼
Structured JSON Response
        │
        ▼
React Dashboard
Architecture
                +----------------+
                | React Frontend |
                +-------+--------+
                        |
                     REST API
                        |
                +-------v--------+
                | Express Server |
                +-------+--------+
                        |
            PDF Parsing & Cleaning
                        |
                +-------v--------+
                | AI Service     |
                | OpenAI/Gemini  |
                +-------+--------+
                        |
                  JSON Analysis
                        |
                +-------v--------+
                | React UI       |
                +----------------+
AI Usage

The application integrates with Large Language Models to perform ATS-style resume evaluation.

The AI is responsible for:

ATS scoring
Resume summary
Strength identification
Weakness detection
Missing skills analysis
Improvement suggestions

The backend abstracts AI providers so switching between OpenAI and Gemini requires only changing one environment variable.

If neither API key is configured, a Mock AI service generates realistic responses for testing without external dependencies.

Prompt Used

The backend sends the extracted resume text to the AI using a structured prompt.

Example:

You are an ATS Resume Evaluator.

Analyze the following resume and return ONLY valid JSON.

Return:

{
  "score": number,
  "summary": "",
  "strengths": [],
  "weaknesses": [],
  "missingSkills": [],
  "improvements": []
}

Resume:

<resume_text>

Using a structured prompt ensures:

Consistent output
Easy JSON parsing
Reliable frontend rendering
Minimal post-processing
API Flow
Upload Resume
      │
POST /api/analyze
      │
PDF Extraction
      │
Prompt Generation
      │
AI Response
      │
JSON Validation
      │
Return Analysis
