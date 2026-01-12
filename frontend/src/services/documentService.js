// The URL of your FastAPI backend
const API_BASE_URL = "http://localhost:8000/api/v1";

/**
 * Sends document details to the backend to generate a .docx file.
 * @param {string} docType - The type of document (e.g., "Non-Disclosure Agreement").
 * @param {Object} details - The form data (e.g., { party_a: "John", party_b: "Jane" }).
 * @returns {Promise<void>} - A promise that resolves when the download is triggered.
 */
export const generateDocument = async (docType, details) => {
  try {
    const response = await fetch(`${API_BASE_URL}/document/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        doc_type: docType,
        details: details,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }

    // 1. Get the filename from the Content-Disposition header
    const disposition = response.headers.get('content-disposition');
    let filename = `${docType.replace(' ', '_')}.docx`; // Default
    if (disposition && disposition.indexOf('attachment') !== -1) {
      const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
      const matches = filenameRegex.exec(disposition);
      if (matches != null && matches[1]) {
        filename = matches[1].replace(/['"]/g, '');
      }
    }

    // 2. Get the file content as a Blob
    const blob = await response.blob();

    // 3. Create a temporary link to trigger the download
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    
    // 4. Clean up the temporary link
    a.remove();
    window.URL.revokeObjectURL(url);

  } catch (error) {
    console.error("Error in documentService:", error);
    throw error;
  }
};