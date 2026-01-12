import React, { useState } from 'react';
import { UploadCloud, FileText, Loader2, AlertCircle } from 'lucide-react';

// --- API Service (Embedded) ---
const API_BASE_URL = "http://localhost:8000";

async function uploadAndAnalyze(file) {
  const formData = new FormData();
  formData.append("file", file); // Key "file" must match backend

  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/analyzer/analyze-fir`, {
      method: 'POST',
      body: formData,
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.detail || "An unknown error occurred.");
    }
    return data;
  } catch (error) {
    console.error("Failed to upload and analyze:", error);
    throw error;
  }
}

// --- File Uploader Component ---
const FileUploader = ({ onFileSelect, fileName, error }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const allowedTypes = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain"
  ];

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && (allowedTypes.includes(file.type) || file.name.endsWith('.docx'))) {
      onFileSelect(file);
    } else {
      alert("Invalid file type. Please upload a PDF, DOCX, or TXT file.");
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && (allowedTypes.includes(file.type) || file.name.endsWith('.docx'))) {
      onFileSelect(file);
    } else {
      alert("Invalid file type. Please upload a PDF, DOCX, or TXT file.");
    }
  };
  
  return (
    <div 
      className={`p-8 border-4 border-dashed rounded-lg transition-colors
        ${isDragOver ? 'border-legal-blue-primary bg-legal-blue-primary/10' : 'border-gray-300'}
        ${error ? 'border-red-500 bg-red-50' : ''}`}
      onDragOver={(e) => {e.preventDefault(); setIsDragOver(true);}}
      onDragLeave={(e) => {e.preventDefault(); setIsDragOver(false);}}
      onDrop={handleDrop}
    >
      <input
        type="file"
        id="fileUpload"
        className="hidden"
        accept=".pdf,.docx,.txt"
        onChange={handleFileChange}
      />
      <label htmlFor="fileUpload" className="flex flex-col items-center justify-center cursor-pointer">
        {fileName ? (
          <>
            <FileText className="h-16 w-16 text-legal-blue-primary" />
            <p className="mt-4 text-lg font-semibold text-legal-text-primary">File Selected:</p>
            <p className="text-gray-600">{fileName}</p>
            <span className="mt-2 text-sm text-legal-blue-highlight hover:underline">Click to change file</span>
          </>
        ) : (
          <>
            <UploadCloud className={`h-16 w-16 ${isDragOver ? 'text-legal-blue-primary' : 'text-gray-400'}`} />
            <p className="mt-4 text-lg font-semibold text-legal-text-primary">Drag 'n' drop an FIR file here</p>
            <p className="text-gray-500">or</p>
            <span className="mt-2 text-sm text-legal-blue-highlight hover:underline">Click to browse</span>
            <p className="mt-2 text-xs text-gray-400">Supports: .pdf, .docx, .txt</p>
          </>
        )}
      </label>
    </div>
  );
};

// --- Results Display Component (UPDATED for 11 fields) ---
const AnalysisDisplay = ({ data }) => {
  
  // Helper to display array data (for Witnesses)
  const renderWitnesses = (witnesses) => {
    if (!witnesses || witnesses.length === 0) {
      return <i className="text-gray-500">No witnesses mentioned</i>;
    }
    return witnesses.join(', ');
  };

  // Helper to format any field
  const renderValue = (value) => {
    if (!value) {
      return <i className="text-gray-500">Not Found</i>;
    }
    if (value === "data is not present in the file") {
      return <i className="text-gray-500">{value}</i>;
    }
    return value;
  };

  // Define the 11 fields based on your new schema
  const displayFields = [
    { title: "FIR Number", value: data.fir_number },
    { title: "Police Station", value: data.police_station },
    { title: "Date of Filing", value: data.date_of_filing },
    { title: "Complainant / Informant", value: data.complainant },
    { title: "Date and Time of Incident", value: data.date_and_time_of_incident },
    { title: "Place of Incident", value: data.place_of_incident },
    { title: "Accused / Suspect(s)", value: data.accused_name }, // Note: key changed from 'accused'
    { title: "Witnesses", value: renderWitnesses(data.witnesses) }, // Special rendering
    { title: "Offence (Summary)", value: data.offence },
    { title: "Offences Mentioned (Sections)", value: data.offences_mentioned },
    { title: "Investigating Officer (I/O)", value: data.investigating_officer },
  ];

  return (
    <div className="mt-8 p-8 bg-white rounded-lg shadow-md border border-gray-200">
      <h3 className="text-2xl font-semibold text-legal-blue-primary mb-6">
        Extracted FIR Details
      </h3>
      <dl className="space-y-4">
        {displayFields.map((field) => (
          <div key={field.title} className="grid grid-cols-3 gap-4 py-3 border-b border-gray-100">
            <dt className="text-sm font-semibold text-gray-500">{field.title}</dt>
            <dd className="mt-1 text-legal-text-primary col-span-2">
              {/* Use the renderValue helper for all fields except Witnesses, which has its own */}
              {field.title === "Witnesses" ? field.value : renderValue(field.value)}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
};

// --- Main Page Component ---
function AnalyzerPage() {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analysisData, setAnalysisData] = useState(null);

  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile);
    setFileName(selectedFile.name);
    setError(null);
    setAnalysisData(null);
  };

  const handleSubmit = async () => {
    if (!file) {
      setError("Please select an FIR to analyze.");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setAnalysisData(null);

    try {
      const data = await uploadAndAnalyze(file);
      setAnalysisData(data);
    } catch (err) {
      setError(err.message || "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-3xl font-semibold text-legal-text-primary mb-6">
        FIR & Evidence Analyzer
      </h2>

      <FileUploader 
        onFileSelect={handleFileSelect} 
        fileName={fileName}
        error={!!error}
      />
      
      <button
        onClick={handleSubmit}
        disabled={!file || isLoading}
        className={`w-full flex justify-center items-center gap-2 rounded-lg px-6 py-4 text-lg font-semibold text-white transition-colors mt-6
          ${(!file || isLoading)
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-legal-blue-primary hover:bg-legal-blue-highlight shadow-lg'
          }`}
      >
        {isLoading ? (
          <Loader2 className="animate-spin" />
        ) : (
          <FileText />
        )}
        {isLoading ? 'Analyzing Document...' : 'Analyze FIR'}
      </button>

      {/* --- Results Section --- */}
      <div className="mt-8">
        {isLoading && (
          <div className="flex flex-col items-center justify-center p-12 text-gray-500">
            <Loader2 className="h-12 w-12 animate-spin text-legal-blue-primary" />
            <p className="mt-4 text-lg font-medium">Extracting key details...</p>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-lg bg-red-50 border border-red-300 text-red-700 flex items-center gap-3">
            <AlertCircle />
            <div>
              <h4 className="font-semibold">Error</h4>
              <p>{error}</p>
            </div>
          </div>
        )}

        {analysisData && (
          <AnalysisDisplay data={analysisData} />
        )}
      </div>
    </div>
  );
}

export default AnalyzerPage;