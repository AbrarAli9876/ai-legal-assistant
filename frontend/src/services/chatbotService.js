// This is the URL of our running backend.
const API_BASE_URL = "http://localhost:8000";

/**
 * Sends a query to the backend chatbot API.
 * @param {string} query - The user's question.
 * @returns {Promise<object>} - A promise that resolves to the API response (e.g., { ai_response: "...", relevant_law: "..." }).
 */
export async function postQuery(query) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/chatbot/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // The body must match the 'ChatQuery' pydantic model in FastAPI
      body: JSON.stringify({ query: query }),
    });

    if (!response.ok) {
      // Handle HTTP errors (e.g., 500, 404)
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error("Failed to post query:", error);
    // Return a structured error object so the UI can handle it
    return {
      ai_response: "Sorry, I couldn't connect to the AI. Please check the backend server and try again.",
      relevant_law: "Connection Error",
      error: true,
    };
  }
}