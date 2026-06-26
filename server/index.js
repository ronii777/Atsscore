import express from 'express';
import cors from 'cors';
import multer from 'multer';
import dotenv from 'dotenv';
import { extractTextFromPDF } from './utils/pdfParser.js';
import { analyzeResume } from './services/aiService.js';
import { createReportPdf } from './services/reportService.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Enable CORS for the frontend connection
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// Set up Multer for memory storage and file size limits (5MB)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are supported. Please upload a PDF resume.'));
    }
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    provider: process.env.AI_PROVIDER || 'openai'
  });
});

// Main resume analysis upload endpoint
app.post('/api/analyze-resume', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No resume file uploaded. Please upload a PDF file.' });
    }

    console.log(`[SERVER] Received upload request for file: ${req.file.originalname} (${req.file.size} bytes)`);

    // 1. Extract text from PDF buffer
    const textContent = await extractTextFromPDF(req.file.buffer);
    console.log(`[SERVER] Successfully extracted text content (${textContent.length} characters)`);

    // 2. Perform AI analysis
    const analysisResult = await analyzeResume(textContent);
    console.log(`[SERVER] Resume analysis complete.`);

    res.json({
      success: true,
      filename: req.file.originalname,
      characterCount: textContent.length,
      ...analysisResult
    });
  } catch (error) {
    console.error(`[SERVER] Error in /api/analyze-resume:`, error);
    res.status(500).json({
      success: false,
      error: error.message || 'An error occurred during resume analysis.'
    });
  }
});


// Report PDF endpoint (from analysis JSON)
app.post('/api/report-pdf', async (req, res) => {
  try {
    const analysis = req.body;
    if (!analysis || typeof analysis !== 'object') {
      return res.status(400).json({ error: 'Missing analysis payload. Send a valid JSON analysis object.' });
    }

    const pdfBuffer = await createReportPdf(analysis);
    const safeName = (analysis.filename || 'resume-report').replace(/[^a-zA-Z0-9-_\.]/g, '_');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="resume-audit-${safeName.replace(/\.[^/.]+$/, '')}.pdf"`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('[SERVER] Error in /api/report-pdf:', error);
    res.status(500).json({ error: error.message || 'Failed to generate PDF report.' });
  }
});


// Global error handler
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File is too large. Maximum size is 5MB.' });
    }
    return res.status(400).json({ error: `Upload error: ${err.message}` });
  } else if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
});

app.listen(port, () => {
  console.log(`==================================================`);
  console.log(` AI Resume Analyzer Backend is running on port ${port}`);
  console.log(` Health check available at http://localhost:${port}/api/health`);
  console.log(`==================================================`);
});
