import httpx
from dotenv import load_dotenv

from app.core.config import GENAI_API_KEY

# --- Configuration ---

# System instruction to guide the AI's persona and response style
SYSTEM_INSTRUCTION = """You are an expert AI legal assistant specializing in Indian law.
Your role is to provide clear, informative, and neutral explanations to a layperson.
1.  **Analyze the User's Query:** Understand the core legal question.
2.  **Provide Relevant Law:** Identify the primary act, section, or legal principle involved (e.g., "This relates to the RERA Act," "This falls under Section 420 of the IPC," "This is a matter of contract law.").
3.  **Explain Simply:** Explain the law or concept in simple, non-jargon terms.
4.  **Suggest Next Steps:** Provide practical, general-purpose next steps the user could consider (e.g., "You may want to consult a lawyer specializing in this area," "You can file a complaint with the consumer forum," "Gather all relevant documentation, such as...").
5.  **Disclaimer:** ALWAYS end your response with a clear disclaimer: "Please note: I am an AI assistant and this is not legal advice. You should consult with a qualified legal professional for advice specific to your situation."
6.  **Tone:** Be professional, empathetic, and helpful.
7.  **Grounding:** Base your answers on the provided search results to ensure accuracy. If the search results are not sufficient, state that you cannot provide a specific answer.
"""

GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent"

# --- Service Logic ---

async def get_chatbot_response(user_query: str, chat_history: list[dict]):
    """
    Calls the Gemini API with the user's query and chat history.
    Enables Google Search grounding to get up-to-date legal information.
    """
    # Securely get the API key from environment variables
    api_key = GENAI_API_KEY

    if not api_key:
        print("Error: GENAI_API_KEY not found in environment variables.")
        return {"error": "Server configuration error: API key not found."}

    full_api_url = f"{GEMINI_API_URL}?key={api_key}"

    # Prepare the conversation history for the API
    contents = [
        *chat_history,
        {"role": "user", "parts": [{"text": user_query}]}
    ]

    payload = {
        "contents": contents,
        "tools": [{"google_search": {}}],
        "systemInstruction": {
            "parts": [{"text": SYSTEM_INSTRUCTION}]
        },
    }

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                full_api_url,
                headers={"Content-Type": "application/json"},
                json=payload
            )

            # Raise an exception for bad status codes
            response.raise_for_status()

            result = response.json()
            candidate = result.get("candidates", [{}])[0]
            content = candidate.get("content", {}).get("parts", [{}])[0]
            text = content.get("text")

            if not text:
                print("Invalid API response:", result)
                return {"error": "Received an invalid response from the AI."}

            # Extract sources from grounding metadata
            sources = []
            grounding_metadata = candidate.get("groundingMetadata", {})
            if grounding_metadata and "groundingAttributions" in grounding_metadata:
                sources = [
                    {
                        "uri": attr.get("web", {}).get("uri"),
                        "title": attr.get("web", {}).get("title"),
                    }
                    for attr in grounding_metadata["groundingAttributions"]
                    if attr.get("web")
                ]
            
            return {"text": text, "sources": sources}

    except httpx.HTTPStatusError as e:
        print(f"HTTP error occurred: {e}")
        return {"error": f"API request failed with status {e.response.status}: {e.response.text}"}
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return {"error": f"An unexpected error occurred: {str(e)}"}