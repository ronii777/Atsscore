# AI Resume Analyzer

AI Resume Analyzer is a modern, full-stack web application that evaluates PDF resumes against ATS (Applicant Tracking System) standards. The backend extracts text from the uploaded PDF and sends it to an AI provider for analysis. The app supports either OpenAI or Google Gemini, and can also fall back to a built-in mock mode when no API key is configured.

---

## Key Features

- Drag-and-Drop Resume Uploader: Fast, validation-backed file ingestion supporting files up to 5MB.
- AI-Powered Evaluation: Works with OpenAI (default model: `gpt-4o-mini`) or Google Gemini (default model: `gemini-1.5-flash`).
- Auto-Mock Mode: If API keys are missing, the server automatically uses a smart local mock evaluation so you can test the full workflow immediately.
- Dynamic Score Gauge: Beautifully animated ATS score visualization.
- Developer Copy & Download Tools: Export feedback as markdown or download raw JSON.

---

## AI Tool and Model Setup

The AI provider and model are configured in the backend environment file:

- `server/.env`
- `server/services/aiService.js`

### Supported AI Options

- OpenAI
  - Provider value: `AI_PROVIDER=openai`
  - Model value: `OPENAI_MODEL=gpt-4o-mini`
- Google Gemini
  - Provider value: `AI_PROVIDER=gemini`
  - Model value: `GEMINI_MODEL=gemini-1.5-flash`

### How to Enable Real AI

1. Open `server/.env`.
2. Choose one provider:
   - `AI_PROVIDER=openai` and add `OPENAI_API_KEY=...`
   - or `AI_PROVIDER=gemini` and add `GEMINI_API_KEY=...`
3. Optionally change the model by setting:
   - `OPENAI_MODEL=gpt-4o-mini`
   - or `GEMINI_MODEL=gemini-1.5-flash`
4. Save the file and restart the backend server.

If you do not set an API key, the app will still run in mock mode.

---

## Folder Structure

```bash
ss12/
├── client/                 # React frontend (Vite)
│   ├── src/
│   │   ├── components/     # UI elements (Dashboard, UploadZone)
│   │   ├── App.jsx         # State container & layout controller
│   │   └── index.css       # Premium glassmorphic design system
│   ├── index.html          # Web page wrapper
│   └── package.json
├── server/                 # Express.js backend
│   ├── services/           # AI connections (OpenAI, Gemini)
│   ├── utils/              # Parsers & cleaners
│   ├── index.js            # Express server configuration
│   ├── .env.example        # Environment variables template
│   └── package.json
├── README.md               # Main instructions
├── tech.md                 # Technical stack explanation
└── skill.md                # Demonstrated skills documentation
```

---

## Quick Start Setup

### 1. Clone & Navigate

```bash
cd ss12
```

### 2. Configure Backend (.env)

Create the environment file from the example:

```bash
copy server\.env.example server\.env
```

Then edit `server/.env` and set:

- `AI_PROVIDER=openai` or `AI_PROVIDER=gemini`
- `OPENAI_API_KEY=...` if using OpenAI
- `GEMINI_API_KEY=...` if using Gemini
- Optional model values:
  - `OPENAI_MODEL=gpt-4o-mini`
  - `GEMINI_MODEL=gemini-1.5-flash`

### 3. Install Dependencies & Run

Open two terminals.

#### Terminal 1: Backend Server (Port 5000)

```bash
cd server
npm install
npm run start
```

#### Terminal 2: Frontend Client (Port 3000)

```bash
cd client
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

The frontend is pre-configured to proxy `/api` requests to the Express server running on port 5000.
