import React, { useState } from 'react';
import { UploadCloud, FileText, Loader2, AlertCircle, FileDown, File } from 'lucide-react';

// --- API Service (Embedded) ---
const API_BASE_URL = "http://localhost:8000";

async function uploadAndSummarize(file) {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/summarizer/upload-and-summarize`, {
      method: 'POST',
      body: formData,
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.detail || "An unknown error occurred.");
    }
    return data;
  } catch (error) {
    console.error("Failed to upload and summarize:", error);
    throw error;
  }
}

// --- A. File Upload Component ---
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
            <p className="mt-4 text-lg font-semibold text-legal-text-primary">Drag 'n' drop a file here</p>
            <p className="text-gray-500">or</p>
            <span className="mt-2 text-sm text-legal-blue-highlight hover:underline">Click to browse</span>
            <p className="mt-2 text-xs text-gray-400">Supports: .pdf, .docx, .txt</p>
            <p className="mt-1 text-xs text-gray-400">(Note: Analysis is optimized for documents up to ~80 pages.)</p>
          </>
        )}
      </label>
    </div>
  );
};

// --- B. Results Display Component (NEW 7-Point Version) ---
const SummaryDisplay = ({ data }) => {
  
  // Re-usable component for each of the sections
  const SummarySection = ({ title, emoji, children, defaultOpen = true }) => (
    <details className="border-b border-gray-200 pb-6 mb-6" open={defaultOpen}>
      <summary className="text-xl font-semibold text-legal-blue-primary mb-3 cursor-pointer list-none -ml-8 pl-8 relative">
        <span className="mr-3 absolute left-0 top-1 text-lg">{emoji}</span> {title}
      </summary>
      <div className="text-legal-text-primary space-y-4 pt-4 pl-8 border-t border-gray-100">
        {children}
      </div>
    </details>
  );

  // Re-usable component for list items
  const ListItem = ({ children }) => (
    <li className="relative pl-6">
      <span className="absolute left-0 top-1.5 h-2 w-2 rounded-full bg-legal-gold-primary"></span>
      {children}
    </li>
  );

  // Helper to render a list
  const renderList = (items) => {
    const validItems = items?.filter(item => item && item.trim() !== "");
    if (!validItems || validItems.length === 0) return <ListItem><i>Not specified / N/A</i></ListItem>;
    return validItems.map((item, i) => <ListItem key={i}>{item}</ListItem>);
  };

  // Helper to render a key-value pair
  const DetailPair = ({ title, value }) => (
    <div>
      <dt className="text-sm font-semibold text-gray-500 uppercase tracking-wider">{title}</dt>
      <dd className="mt-1">{value || <i>N/A</i>}</dd>
    </div>
  );

  return (
    <div className="mt-8 p-8 bg-white rounded-lg shadow-md border border-gray-200">
      
      {/* 1. Case Title */}
      <SummarySection title="1. Case Title" emoji="🧾">
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <div className="md:col-span-2"><DetailPair title="Case Name" value={<span className="text-lg font-semibold">{data.case_title_info.case_name}</span>} /></div>
          <DetailPair title="Case Number" value={data.case_title_info.case_number} />
          <DetailPair title="Court Name" value={data.case_title_info.court_name} />
          <DetailPair title="Jurisdiction" value={data.case_title_info.jurisdiction} />
          <DetailPair title="Citation(s)" value={data.case_title_info.citations} />
        </dl>
      </SummarySection>

      {/* 2. Parties Involved */}
      <SummarySection title="2. Parties Involved" emoji="👥">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <DetailPair title="Petitioner" value={data.parties_involved.petitioner} />
            <div className="mt-4"><DetailPair title="Advocates for Petitioner" value={data.parties_involved.advocates_petitioner} /></div>
          </div>
          <div>
            <DetailPair title="Respondent" value={data.parties_involved.respondent} />
            <div className="mt-4"><DetailPair title="Advocates for Respondent" value={data.parties_involved.advocates_respondent} /></div>
          </div>
        </div>
      </SummarySection>

      {/* 3. Date of Judgment */}
      <SummarySection title="3. Date of Judgment" emoji="📅">
        <DetailPair title="Date of Judgment" value={data.dates.date_of_judgment} />
      </SummarySection>

      {/* 4. Important Dates */}
      <SummarySection title="4. Important Dates" emoji="🗓️">
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <DetailPair title="Date of Filing" value={data.dates.date_of_filing} />
          <DetailPair title="Date of Judgment" value={data.dates.date_of_judgment} />
        </dl>
      </SummarySection>

      {/* 5. Sections Invoked */}
      <SummarySection title="5. Sections Invoked" emoji="⚖️">
        <p className="leading-relaxed bg-gray-50 p-4 rounded-lg border border-gray-100">
          {data.sections_invoked || <i>N/A</i>}
        </p>
      </SummarySection>

      {/* 6. Legal Issues / Questions */}
      <SummarySection title="6. Legal Issues / Questions Before the Court" emoji="❓">
        <ul className="list-none space-y-2">{renderList(data.legal_issues)}</ul>
      </SummarySection>

      {/* 7. Final Judgment */}
      <SummarySection title="7. Final Judgment" emoji="🏛️">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <p className="leading-relaxed whitespace-pre-wrap text-gray-800">{data.final_judgment || <i>No summary available.</i>}</p>
        </div>
      </SummarySection>
      
    </div>
  );
};

// --- C. Main Page Component ---
function CaseSummarizerPage() {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [summaryData, setSummaryData] = useState(null);
  const [downloadLinks, setDownloadLinks] = useState(null);
  
  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile);
    setFileName(selectedFile.name);
    setError(null);
    setSummaryData(null);
    setDownloadLinks(null);
  };

  const handleSubmit = async () => {
    if (!file) {
      setError("Please select a file to summarize.");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setSummaryData(null);
    setDownloadLinks(null);

    try {
      const data = await uploadAndSummarize(file);
      setSummaryData(data.summary_data);
      setDownloadLinks(data.download_links);
    } catch (err) {
      setError(err.message || "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-3xl font-semibold text-legal-text-primary mb-6">
        Case Law Summarizer
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
        {isLoading ? 'Analyzing Document...' : 'Summarize Document'}
      </button>

      {/* --- Results Section --- */}
      <div className="mt-8">
        {isLoading && (
          <div className="flex flex-col items-center justify-center p-12 text-gray-500">
            <Loader2 className="h-12 w-12 animate-spin text-legal-blue-primary" />
            <p className="mt-4 text-lg font-medium">Reading and analyzing your document...</p>
            <p className="text-sm">This may take a moment for large files.</p>
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

        {/* --- DOWNLOAD LINKS SECTION --- */}
        {downloadLinks && (
          <div className="mb-6 p-6 bg-green-50 border border-green-300 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-green-800 mb-3">
              Download Your Formatted Summary
            </h3>
            <div className="space-y-3">
              {downloadLinks.pdf_url && (
                <a
                  href={`${API_BASE_URL}${downloadLinks.pdf_url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex justify-between items-center gap-3 rounded-lg border-2 border-legal-blue-primary px-6 py-4 text-legal-blue-primary font-semibold hover:bg-legal-blue-primary/5 transition-colors"
                >
                  <div className="flex items-center gap-3"><File className="text-red-600" />Download PDF</div>
                  <FileDown />
                </a>
              )}
              {/* --- DOCX Button with Blue Border --- */}
              <a
                href={`${API_BASE_URL}${downloadLinks.docx_url}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex justify-between items-center gap-3 rounded-lg border-2 border-legal-blue-primary px-6 py-4 text-legal-blue-primary font-semibold hover:bg-legal-blue-primary/5 transition-colors"
              >
                <div className="flex items-center gap-3"><File className="text-blue-600" />Download .DOCX</div>
                <FileDown />
              </a>
            </div>
          </div>
        )}
        {/* --- END DOWNLOAD LINKS SECTION --- */}

        {summaryData && (
          <SummaryDisplay data={summaryData} />
        )}
      </div>
    </div>
  );
}

export default CaseSummarizerPage;