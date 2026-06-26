import React, { useState, useRef } from 'react';
import { UploadCloud } from 'lucide-react';

export default function UploadZone({ onFileSelected, onError }) {
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const validateAndSelectFile = (file) => {
    if (!file) return;

    if (file.type !== 'application/pdf') {
      onError('Only PDF resume files are supported. Please upload a PDF.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      onError('File size exceeds the 5MB limit. Please upload a smaller PDF resume.');
      return;
    }

    onError(null); // Clear previous errors if any
    onFileSelected(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSelectFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSelectFile(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="upload-container">
      <div 
        className={`upload-zone glass-card ${isDragActive ? 'drag-active' : ''}`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={triggerFileInput}
      >
        <input 
          type="file" 
          ref={fileInputRef}
          onChange={handleFileInput}
          accept="application/pdf"
          style={{ display: 'none' }}
        />
        
        <div className="upload-icon-container">
          <UploadCloud size={40} />
        </div>

        <h3 className="upload-text-primary">Drag & drop your resume here</h3>
        <p className="upload-text-secondary">or click to browse your local files</p>
        
        <span className="file-spec">
          PDF format only (Max 5MB)
        </span>
      </div>
    </div>
  );
}
