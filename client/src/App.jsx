import React, { useState, useEffect } from 'react';
import { Sparkles, AlertCircle, FileText } from 'lucide-react';
import UploadZone from './components/UploadZone';
import Dashboard from './components/Dashboard';

const LOADING_STEPS = [
  'Uploading PDF resume to analyzer...',
  'Extracting raw text contents...',
  'Evaluating resume against ATS standards...',
  'Structuring AI recommendation report...'
];

export default function App() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState(null);

  // Animate loading step progression
  useEffect(() => {
    let interval;
    if (loading) {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep((prevStep) => {
          if (prevStep < LOADING_STEPS.length - 1) {
            return prevStep + 1;
          }
          return prevStep;
        });
      }, 1500);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleFileSelected = async (selectedFile) => {
    setFile(selectedFile);
    setLoading(true);
    setError(null);
    setAnalysisResult(null);

    const formData = new FormData();
    formData.append('resume', selectedFile);

    try {
      const response = await fetch('/api/analyze-resume', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Server error occurred during analysis.');
      }

      setAnalysisResult(data);
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err.message || 'Failed to connect to the backend server. Make sure it is running.');
      setFile(null); // Reset file selection on failure so they can retry
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setAnalysisResult(null);
    setError(null);
  };

  return (
    <div className="app-container">
      
      {/* Header */}
      <header className="app-header">
        <div className="app-logo">
          <Sparkles fill="white" size={26} />
        </div>
        <h1 className="app-title">AI Resume Analyzer</h1>
        <p className="app-subtitle">
          Optimize your resume for applicant tracking systems. Upload your CV in PDF format and receive detailed ratings, highlights, and structural feedback.
        </p>
      </header>

      {/* Main Content Area */}
      <main style={{ flex: 1 }}>
        {error && (
          <div className="error-banner">
            <AlertCircle size={20} style={{ flexShrink: 0 }} />
            <div>
              <strong>Analysis Failed:</strong> {error}
            </div>
          </div>
        )}

        {loading ? (
          <div className="glass-card loading-box">
            <div className="spinner-glow"></div>
            <h3 className="loading-title">Analyzing Resume</h3>
            <p style={{ color: 'var(--text-secondary)' }}>
              This takes about 5-10 seconds as our AI inspects your resume sections.
            </p>
            
            <div className="loading-steps">
              {LOADING_STEPS.map((step, idx) => (
                <div 
                  key={idx} 
                  className={`loading-step-item ${idx === loadingStep ? 'active' : ''}`}
                  style={{ opacity: idx > loadingStep ? 0.4 : 1 }}
                >
                  <div className="step-dot"></div>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>
        ) : analysisResult ? (
          <Dashboard result={analysisResult} onReset={handleReset} />
        ) : (
          <UploadZone onFileSelected={handleFileSelected} onError={setError} />
        )}
      </main>

      {/* Footer */}
      <footer style={{ marginTop: '5rem', borderTop: '1px solid var(--border-glass)', padding: '1.5rem 0', textOrigin: 'center', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
        <p>© 2026 AI Resume Analyzer. Built for rapid, intelligent ATS optimization.</p>
      </footer>

    </div>
  );
}
