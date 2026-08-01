import httpx

from app.core.config import GENAI_API_KEY


# ============================================================
# Configuration
# ============================================================

SYSTEM_INSTRUCTION = """
You are KanoonAI, an AI legal information assistant specializing in Indian law.

Your purpose is to provide clear, accurate, neutral, and easy-to-understand legal information about the Indian legal system.

Follow these rules for every response:

1. UNDERSTAND THE QUERY
Carefully identify the user's legal question before answering.
If the question is unclear or missing important facts, ask the user for clarification instead of making assumptions.

2. INDIAN LAW ONLY
Unless the user specifically asks about another jurisdiction, answer according to Indian law.

3. USE CURRENT LEGAL FRAMEWORK
When discussing Indian criminal law, take into account the current criminal law framework, including:
- Bharatiya Nyaya Sanhita, 2023 (BNS)
- Bharatiya Nagarik Suraksha Sanhita, 2023 (BNSS)
- Bharatiya Sakshya Adhiniyam, 2023 (BSA)

Do not incorrectly present repealed or replaced provisions of the IPC, CrPC, or Indian Evidence Act as the current law.

Where useful for understanding older cases or terminology, you may mention the corresponding older law, but clearly distinguish it from the current law.

4. IDENTIFY RELEVANT LAW
For legal questions, identify the relevant Act, section, rule, regulation, or legal principle when you are reasonably confident it applies.

Never invent:
- Acts
- Sections
- Rules
- Regulations
- Court judgments
- Case names
- Legal procedures
- Government authorities

If you are uncertain about an exact section number or legal provision, say so rather than guessing.

5. EXPLAIN IN SIMPLE LANGUAGE
Explain legal concepts in language that a person without legal training can understand.

Avoid unnecessary legal jargon.
When legal terminology is necessary, briefly explain what it means.

6. STRUCTURE THE ANSWER
For legal questions, generally structure the response as:

Relevant Law:
State the applicable Act, section, or legal principle.

What It Means:
Explain the law simply.

How It Applies:
Explain generally how the law may relate to the user's situation.

What You Can Do:
Provide practical next steps the user may consider.

Disclaimer:
Provide the required legal disclaimer.

Do not force this structure when a shorter answer would be clearer.

7. PRACTICAL NEXT STEPS
When appropriate, suggest practical actions such as:
- preserving documents and evidence,
- keeping copies of messages, emails, receipts, agreements, or notices,
- contacting the relevant authority,
- sending a legal notice where appropriate,
- using an applicable grievance or complaint mechanism,
- consulting a qualified advocate.

Do not tell the user that a particular legal outcome is guaranteed.

8. FACTUAL AND NON-LEGAL QUESTIONS
You may answer simple factual or general questions when appropriate.

If a question requires very recent or real-time information that you cannot reliably verify, clearly tell the user that the information may need to be checked from an authoritative and current source.

Do not pretend that you have searched the internet or verified current information when search tools are not available.

9. LEGAL UNCERTAINTY
Indian law can depend heavily on the specific facts of a case.

When the answer depends on missing information, explain what additional information matters.

Do not present uncertain legal conclusions as established facts.

10. COURT CASES AND JUDGMENTS
Only mention a specific judgment or case citation when you are sufficiently confident that it is accurate and relevant.

Never fabricate case names, citations, dates, courts, or holdings.

If verification of a recent judgment is necessary, tell the user that the judgment should be checked from an authoritative legal source.

11. SAFETY AND ILLEGAL ACTIVITY
You may explain what the law says about illegal conduct and its possible legal consequences.

Do not provide instructions designed to help someone commit a crime, evade law enforcement, destroy evidence, deceive authorities, or avoid legal accountability.

12. NEUTRALITY
Remain neutral and professional.

Do not automatically assume that the user's version of events is legally proven.
Clearly distinguish allegations, claims, evidence, and established facts where relevant.

13. RESPONSE FORMATTING
Return clean plain text.

Do not use Markdown formatting such as:
- **bold**
- *italics*
- ### headings
- markdown tables
- markdown links

Use simple headings and numbered or bulleted points when they improve readability.

14. DISCLAIMER
For legal questions, ALWAYS end the response with exactly:

Please note: I am an AI assistant and this is not legal advice. You should consult with a qualified legal professional for advice specific to your situation.

Do not omit this disclaimer for legal questions.
"""


# Gemini model
GEMINI_API_URL = (
    "https://generativelanguage.googleapis.com/v1beta/"
    "models/gemini-3.1-flash-lite:generateContent"
)



# ============================================================
# Chatbot Service
# ============================================================

async def get_chatbot_response(
    user_query: str,
    chat_history: list[dict]
):
    """
    Sends the user's query and conversation history to Gemini.

    Google Search grounding is enabled so that Gemini can retrieve
    current information when answering legal questions.
    """

    # --------------------------------------------------------
    # API Key
    # --------------------------------------------------------

    api_key = GENAI_API_KEY

    if not api_key:
        print("ERROR: GENAI_API_KEY not found.")

        return {
            "error": "Server configuration error: Gemini API key not found."
        }


    # --------------------------------------------------------
    # Prepare Conversation
    # --------------------------------------------------------

    contents = [
        *chat_history,
        {
            "role": "user",
            "parts": [
                {
                    "text": user_query
                }
            ]
        }
    ]


    # --------------------------------------------------------
    # Gemini Request Payload
    # --------------------------------------------------------
    payload = {
        "systemInstruction": {
        "parts": [
            {"text": SYSTEM_INSTRUCTION}
        ]
    },

    "contents": contents,

    "generationConfig": {
        "temperature": 0.3,
        "maxOutputTokens": 4096
    }
}

    # --------------------------------------------------------
    # Request Headers
    # --------------------------------------------------------

    headers = {
        "Content-Type": "application/json",

        # Pass API key through the recommended header
        "x-goog-api-key": api_key
    }


    # --------------------------------------------------------
    # Call Gemini API
    # --------------------------------------------------------

    try:

        async with httpx.AsyncClient(timeout=30.0) as client:

            response = await client.post(
                GEMINI_API_URL,
                headers=headers,
                json=payload
            )

            # Raise exception for 4xx / 5xx responses
            response.raise_for_status()

            result = response.json()


            # ------------------------------------------------
            # Get Candidates
            # ------------------------------------------------

            candidates = result.get("candidates", [])

            if not candidates:

                print("ERROR: Gemini returned no candidates.")
                print("Full response:", result)

                return {
                    "error": "The AI did not return a response."
                }


            candidate = candidates[0]


            # ------------------------------------------------
            # Extract Generated Text
            # ------------------------------------------------

            parts = candidate.get(
                "content", {}
            ).get(
                "parts", []
            )


            # Combine all text parts instead of assuming that
            # the response always contains only one part.
            text_parts = []

            for part in parts:

                if "text" in part:
                    text_parts.append(part["text"])


            text = "".join(text_parts).strip()


            if not text:

                print("ERROR: Gemini returned no text.")
                print("Full response:", result)

                return {
                    "error": "Received an invalid response from the AI."
                }


            # ------------------------------------------------
            # Extract Google Search Sources
            # ------------------------------------------------

            sources = []

            grounding_metadata = candidate.get(
                "groundingMetadata",
                {}
            )


            grounding_chunks = grounding_metadata.get(
                "groundingChunks",
                []
            )


            for chunk in grounding_chunks:

                web = chunk.get("web")

                if web:

                    uri = web.get("uri")
                    title = web.get("title")

                    if uri:

                        sources.append({
                            "uri": uri,
                            "title": title or uri
                        })


            # ------------------------------------------------
            # Remove Duplicate Sources
            # ------------------------------------------------

            unique_sources = []
            seen_urls = set()


            for source in sources:

                uri = source.get("uri")

                if uri and uri not in seen_urls:

                    seen_urls.add(uri)

                    unique_sources.append(source)


            # ------------------------------------------------
            # Successful Response
            # ------------------------------------------------

            return {
                "text": text,
                "sources": unique_sources
            }


    # ========================================================
    # Gemini HTTP Errors
    # ========================================================

    except httpx.HTTPStatusError as e:

        status_code = e.response.status_code

        print("\n===== GEMINI API ERROR =====")
        print("Status Code:", status_code)
        print("Response:", e.response.text)
        print("============================\n")


        if status_code == 400:

            return {
                "error": (
                    "Gemini rejected the request. "
                    f"Details: {e.response.text}"
                )
            }


        elif status_code == 401:

            return {
                "error": "Gemini API authentication failed."
            }


        elif status_code == 403:

            return {
                "error": (
                    "The Gemini API key does not have permission "
                    "to perform this request."
                )
            }


        elif status_code == 404:

            return {
                "error": (
                    "The requested Gemini model or API endpoint "
                    "was not found."
                )
            }


        elif status_code == 429:

            return {
                "error": (
                    "Gemini API rate limit or quota exceeded. "
                    "Please try again later."
                )
            }


        elif status_code >= 500:

            return {
                "error": (
                    "Gemini API is currently experiencing "
                    "a server-side error."
                )
            }


        return {
            "error": (
                f"Gemini API request failed with "
                f"status {status_code}."
            )
        }


    # ========================================================
    # Network Errors
    # ========================================================

    except httpx.RequestError as e:

        print("\n===== NETWORK ERROR =====")
        print(str(e))
        print("=========================\n")

        return {
            "error": (
                "Unable to connect to the Gemini API. "
                "Please check the network connection."
            )
        }


    # ========================================================
    # Unexpected Errors
    # ========================================================

    except Exception as e:

        print("\n===== UNEXPECTED ERROR =====")
        print(type(e).__name__)
        print(str(e))
        print("============================\n")

        return {
            "error": f"An unexpected error occurred: {str(e)}"
        }
    