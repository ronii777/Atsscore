# Skills and Talking Points

## Skills Demonstrated in This Assignment
- **Full-Stack Web Development**: Created a fully decoupled frontend and backend ecosystem with Vite/React, Express.js, and API routing/proxy configuration.
- **API Integration**: Connected securely to OpenAI and Gemini LLMs, configuring system prompts and response MIME type schemas.
- **File Upload Handling**: Employed Multer for in-memory stream buffers to manage multipart files securely.
- **PDF Text Extraction**: Used `pdf-parse` to pull, normalize, and format unstructured text from PDF files.
- **Prompt Engineering**: Designed strict JSON-conforming instruction templates ensuring stable structural feedback reports.
- **AI Output Validation**: Implemented fail-safe guards and dynamic mock content generators to guarantee runtime resilience.
- **Error Handling**: Implemented multi-tier exceptions covering network timeouts, file type violations, file size limits, and invalid API keys.
- **Product Thinking**: Prioritized user-facing utilities (e.g. Markdown report copy, JSON file downloads, visual loading step indicators).
- **Rapid Prototyping**: Set up a clean local environment structure ready to scale or deploy quickly.

---

## Technical Skills Used

### Frontend
- React
- HTML5 (Semantic elements)
- CSS3 (Vanilla styles, responsive grids, HSL design palettes, glassmorphism)
- JavaScript (ES6+, asynchronous APIs)

### Backend
- Node.js
- Express.js
- REST API Design

### AI & Natural Language Processing
- OpenAI API Integration
- Gemini API Integration
- Prompt Engineering
- Structured Output Validation

### Utilities & Tools
- Git / GitHub
- npm packages (`pdf-parse`, `multer`, `dotenv`, `cors`, `lucide-react`)
- Vite

---

## What to Say If Asked "What skills did you use?"
You can answer:
> I utilized full-stack JavaScript skills to construct the Vite/React frontend and the Node.js/Express backend. I built file-upload pipelines to handle PDF streams directly in-memory, parsed text content, and integrated OpenAI/Gemini endpoints. I also designed system prompts to guarantee structured JSON output and added error-handling and fallback logic to ensure the application is reliable and easy to prototype.

## What to Say If Asked "Where did you use AI?"
You can answer:
> I used AI primarily for the resume analysis service. After parsing and cleaning the resume's raw text, it is sent to the LLM along with a strict system prompt. The model processes the text and outputs structured feedback (overall compatibility score, strengths, weakness indicators, missing requirements, and improvement suggestions). I also leveraged AI coding assistance to build and test this project rapidly.

## What to Say If Asked "What did you verify manually?"
You can answer:
> I manually tested the PDF parser to ensure it cleanly extracted text blocks. I also checked that the AI JSON parser held up under various formats, and verified that the score classification gauges render correctly across different screen sizes. I also tested missing key scenarios to confirm that the server fails gracefully and triggers mock reports correctly.

## What to Say If Asked "What product decisions did you make?"
You can answer:
> I focused on making the application immediate and valuable. Rather than introducing complex databases or accounts, it works directly as a single-session analyzer. I restricted the file formats to PDF because it is the standard for job applications, saving design overhead. I also added direct download tools and click-to-copy buttons so users can instantly save their analysis in readable formats.

## What to Say If Asked "What are the limitations?"
You can answer:
> - **Formatting Issues**: Highly visual, multi-column, or graphic-heavy resumes might parse with scrambled layout sequences.
> - **Scanned Resumes**: Since it reads pure text buffers, scanned images or non-OCR resumes are not supported in this version.
> - **No Deep ATS Parsing**: It checks for overall visual readability and keyword compatibility rather than matching against a specific ATS software's proprietary logic.
> - **No DOCX Support**: Standard Microsoft Word files are not processed in this initial prototype.
