import React, { useState } from 'react';
import { Loader2, Search, AlertCircle, ChevronDown, Clipboard, Download } from 'lucide-react';

// --- API Service (Embedded) ---
// Prefer env override, otherwise match the current host to avoid CORS/mixed-host issues.
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  `${window.location.protocol}//${window.location.hostname}:8000`;

// --- API call for generating FAQs ---
async function generateFAQs(topic) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/faq/generate-from-topic`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic: topic }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.detail || "An unknown error occurred.");
    }
    return data;
  } catch (error) {
    console.error("Failed to generate FAQs:", error);
    throw error;
  }
}

// --- API call for downloading PDF ---
async function downloadFAQsAsPDF(topic, faqs) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/faq/download-pdf`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic: topic, faqs: faqs }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.detail || "An unknown error occurred while downloading.");
    }

    const { pdf_url, filename } = await response.json();
    return { pdf_url, filename: filename || `FAQ_${topic.replace(/ /g, '_')}.pdf` };
    
  } catch (error) {
    console.error("Failed to download PDF:", error);
    throw error;
  }
}


// --- Reusable FAQ Item (Accordion) Component ---
const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(answer);
    alert("Answer copied to clipboard!");
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-5 text-left bg-gray-50 hover:bg-gray-100 focus:outline-none"
      >
        <span className="text-lg font-semibold text-legal-blue-primary">{question}</span>
        <ChevronDown
          size={24}
          className={`transform transition-transform ${isOpen ? 'rotate-180' : 'rotate-0'}`}
        />
      </button>

      {isOpen && (
        <div className="p-5 border-t border-gray-200 bg-white">
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{answer}</p>
          <button
            onClick={handleCopy}
            className="mt-4 flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-legal-blue-primary bg-blue-100 rounded-md hover:bg-blue-200"
          >
            <Clipboard size={14} />
            Copy Answer
          </button>
        </div>
      )}
    </div>
  );
};


// --- Main Page Component ---
function FAQBuilderPage() {
  const [topic, setTopic] =useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadPDF = async () => {
    if (results.length === 0) return;
    setIsDownloading(true);
    try {
      const { pdf_url, filename } = await downloadFAQsAsPDF(topic, results);

      const link = document.createElement('a');
      link.href = `${API_BASE_URL}${pdf_url}`;
      link.setAttribute('download', filename);
      link.setAttribute('target', '_self');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);

    } catch (err) {
      alert(`Failed to download PDF: ${err.message}`);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!topic) {
      setError("Please enter a legal topic.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setResults([]);
    setHasSearched(true);
    try {
      const data = await generateFAQs(topic);
      setResults(data.faqs || []);
    } catch (err) {
      setError(err.message || "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-3xl font-semibold text-legal-text-primary mb-2">
         FAQ Builder
      </h2>
      <p className="text-gray-600 mb-6">
        Enter any legal topic (e.g., "Cheque Bounce", "RERA") to generate a list of common questions and answers.
      </p>

      <form onSubmit={handleSubmit} className="flex items-center gap-3 mb-8">
        <input
          type="text"
          value={topic}
          // --- THIS IS THE FIX ---
          // Changed 'e.targe.value' to 'e.target.value'
          onChange={(e) => setTopic(e.target.value)}
          className="flex-1 w-full rounded-lg border border-gray-300 px-4 py-3 shadow-sm focus:border-legal-blue-primary focus:ring-2 focus:ring-legal-blue-primary/50"
          placeholder="e.g., 'Cheque Bounce under Section 138'"
        />
        <button
          type="submit"
          disabled={isLoading}
          className={`flex justify-center items-center gap-2 rounded-lg px-6 py-3 text-lg font-semibold text-white transition-colors
            ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-legal-blue-primary hover:bg-legal-blue-highlight shadow-lg'}`}
        >
          {isLoading ? <Loader2 className="animate-spin" /> : <Search />}
          {isLoading ? 'Generating...' : 'Generate'}
        </button>
      </form>

      <div className="mt-6">
        {isLoading && (
          <div className="flex items-center justify-center p-8 text-gray-500">
            <Loader2 className="h-8 w-8 animate-spin text-legal-blue-primary" />
            <p className="ml-3 text-lg font-medium">Generating your FAQ list...</p>
          </div>
        )}
        {error && (
          <div className="p-4 rounded-lg bg-red-50 border border-red-300 text-red-700 flex items-center gap-3">
            <AlertCircle />
            <div><h4 className="font-semibold">Error</h4><p>{error}</p></div>
          </div>
        )}
        {!isLoading && results.length > 0 && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-semibold text-legal-text-primary">
                Generated FAQs for "{topic}"
              </h3>
              <button
                onClick={handleDownloadPDF}
                disabled={isDownloading}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-legal-blue-primary bg-blue-100 rounded-lg hover:bg-blue-200 disabled:bg-gray-200 disabled:text-gray-500"
              >
                {isDownloading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Download size={16} />
                )}
                {isDownloading ? 'Creating PDF...' : 'Download PDF'}
              </button>
            </div>
            {results.map((faq, i) => (
              <FAQItem key={i} question={faq.question} answer={faq.answer} />
            ))}
          </div>
        )}
        {!isLoading && hasSearched && results.length === 0 && !error && (
          <div className="p-12 text-center bg-white rounded-lg shadow-md border border-gray-200">
            <h3 className="text-xl font-semibold text-legal-text-primary">No FAQs Generated</h3>
            <p className="text-gray-600 mt-2">
              The AI could not generate FAQs for this topic. Please try a different or broader topic.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default FAQBuilderPage;