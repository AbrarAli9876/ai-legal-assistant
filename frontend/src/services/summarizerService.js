// This is the URL of our running backend.
const API_BASE_URL = "http://localhost:8000";

/**
 * Uploads a file to the backend for summarization.
 * @param {File} file - The file to upload (PDF, DOCX, or TXT).
 * @returns {Promise<object>} - A promise that resolves to the structured JSON summary.
 */
export async function uploadAndSummarize(file) {
  // 1. Create a FormData object to hold the file
  const formData = new FormData();
  formData.append("file", file); // The key "file" must match the backend's 'UploadFile = File(...)'

  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/summarizer/upload-and-summarize`, {
      method: 'POST',
      body: formData,
      // NOTE: DO NOT set 'Content-Type': 'multipart/form-data'.
      // The browser will automatically set it correctly (with the boundary)
      // when it sees you are sending a FormData object.
    });

    const data = await response.json();

    if (!response.ok) {
      // If we get an error, 'data' will be { "detail": "Error message..." }
      throw new Error(data.detail || "An unknown error occurred.");
    }

    return data;

  } catch (error) {
    console.error("Failed to upload and summarize:", error);
    // We re-throw the error so the UI component can catch it
    throw error;
  }
}