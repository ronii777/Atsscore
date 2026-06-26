import PDFDocument from 'pdfkit';
import fs from 'fs';

const doc = new PDFDocument();
doc.pipe(fs.createWriteStream('test-resume.pdf'));

// Header
doc.fontSize(24).text('Alex Rivera', 100, 80);
doc.fontSize(12).text('Senior React Developer | Web Architect', 100, 115);
doc.fontSize(10).text('Email: alex.rivera@email.com | Phone: 555-0199 | GitHub: github.com/alexrivera', 100, 135);

// Profile
doc.fontSize(14).text('Professional Summary', 100, 165);
doc.fontSize(10).text('Highly focused front-end developer with 5+ years of experience crafting dynamic React web interfaces. Passionate about page responsiveness, state management, and modern styling libraries.', 100, 185);

// Work History
doc.fontSize(14).text('Work Experience', 100, 230);
doc.fontSize(11).text('Lead Developer | Webflow Inc (2023 - Present)', 100, 255);
doc.fontSize(10).text('- Built core React views using state management patterns.\n- Mentored junior engineers and conducted code reviews.\n- Refactored legacy Javascript codebase into TypeScript.', 100, 275);

doc.fontSize(11).text('Frontend Developer | AppForge (2021 - 2023)', 100, 330);
doc.fontSize(10).text('- Designed interfaces with modular CSS grid structures.\n- Coordinated with product designers to implement interactive charts.\n- Fixed navigation bugs, reducing mobile drop-off rates.', 100, 350);

// Skills
doc.fontSize(14).text('Skills', 100, 410);
doc.fontSize(10).text('React, JavaScript, TypeScript, Node.js, Express, HTML, CSS, Git, Redux', 100, 430);

doc.end();
console.log('PDF test-resume.pdf generated successfully!');
