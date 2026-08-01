import json
import httpx

from app.core.config import FAQ_BUILDER_API_KEY


# ============================================================
# Gemini Configuration
# ============================================================

GEMINI_MODEL = "gemini-3.1-flash-lite"

GEMINI_API_URL = (
    "https://generativelanguage.googleapis.com/v1beta/"
    f"models/{GEMINI_MODEL}:generateContent"
)


# ============================================================
# System Prompt
# ============================================================

FAQ_SYSTEM_PROMPT = """
You are KanoonAI, a legal content assistant specializing in Indian law.

Your task is to generate useful Frequently Asked Questions about
the Indian legal topic supplied by the user.

Follow these rules carefully:

1. Generate between 5 and 7 FAQs.

2. Questions should represent realistic questions that an ordinary
person, client, student, employee, consumer, tenant, business owner,
or citizen might ask.

3. Answers must be:
- Simple
- Clear
- Concise
- Legally informative
- Easy for a non-lawyer to understand

4. Base the answers on Indian law.

5. Where useful, mention the relevant Act or legal provision.

6. Do not invent:
- Acts
- Sections
- Court decisions
- Legal rights
- Government authorities

7. Be careful with current Indian criminal law. IPC, CrPC and the
Indian Evidence Act have been replaced for current matters by BNS,
BNSS and BSA respectively.

However, if the user specifically asks about an older law or section,
explain that law accurately instead of silently replacing it.

8. Do not claim that the information is personalized legal advice.

9. Do not use Markdown formatting inside the answers.

10. Return ONLY valid JSON.

Do not include ```json or any explanation outside the JSON.

The response must have exactly this structure:

{
    "faqs": [
        {
            "question": "",
            "answer": ""
        }
    ]
}
"""


# ============================================================
# Clean Gemini JSON
# ============================================================

def clean_json_response(text: str) -> str:

    text = text.strip()

    if text.startswith("```json"):
        text = text[7:]

    elif text.startswith("```"):
        text = text[3:]

    if text.endswith("```"):
        text = text[:-3]

    return text.strip()


# ============================================================
# Validate FAQ Response
# ============================================================

def validate_faq_response(data: dict) -> dict:

    if not isinstance(data, dict):
        raise ValueError(
            "Gemini returned an invalid FAQ response."
        )

    faqs = data.get("faqs")

    if not isinstance(faqs, list):
        raise ValueError(
            "Gemini response does not contain a valid FAQ list."
        )

    cleaned_faqs = []

    for faq in faqs:

        if not isinstance(faq, dict):
            continue

        question = str(
            faq.get("question", "")
        ).strip()

        answer = str(
            faq.get("answer", "")
        ).strip()

        if question and answer:

            cleaned_faqs.append(
                {
                    "question": question,
                    "answer": answer
                }
            )

    if not cleaned_faqs:

        raise ValueError(
            "Gemini did not generate any valid FAQs."
        )

    return {
        "faqs": cleaned_faqs
    }


# ============================================================
# Generate FAQs
# ============================================================

async def generate_faqs(topic: str) -> dict:

    if not FAQ_BUILDER_API_KEY:

        raise ValueError(
            "FAQ_BUILDER_API_KEY not found."
        )

    topic = topic.strip()

    if not topic:

        raise ValueError(
            "FAQ topic cannot be empty."
        )

    # --------------------------------------------------------
    # User Prompt
    # --------------------------------------------------------

    user_prompt = (
        "Generate 5 to 7 frequently asked questions "
        "and answers about the following Indian legal topic:\n\n"
        f"{topic}"
    )

    # --------------------------------------------------------
    # Gemini Payload
    # --------------------------------------------------------

    payload = {

        "systemInstruction": {
            "parts": [
                {
                    "text": FAQ_SYSTEM_PROMPT
                }
            ]
        },

        "contents": [
            {
                "role": "user",
                "parts": [
                    {
                        "text": user_prompt
                    }
                ]
            }
        ],

        "generationConfig": {
            "temperature": 0.2,
            "maxOutputTokens": 8192,
            "responseMimeType": "application/json"
        }
    }

    headers = {
        "Content-Type": "application/json",
        "x-goog-api-key": FAQ_BUILDER_API_KEY
    }

    try:

        print(
            f"[faq] calling {GEMINI_MODEL}"
        )

        async with httpx.AsyncClient(
            timeout=120.0
        ) as client:

            response = await client.post(
                GEMINI_API_URL,
                headers=headers,
                json=payload
            )

            response.raise_for_status()

        result = response.json()

        # ----------------------------------------------------
        # Extract candidates
        # ----------------------------------------------------

        candidates = result.get(
            "candidates",
            []
        )

        if not candidates:

            print(
                "[faq] Gemini returned no candidates:",
                result
            )

            raise ValueError(
                "Gemini returned no FAQ response."
            )

        # ----------------------------------------------------
        # Extract text
        # ----------------------------------------------------

        parts = (
            candidates[0]
            .get("content", {})
            .get("parts", [])
        )

        response_text = "".join(
            part.get("text", "")
            for part in parts
            if isinstance(part, dict)
        ).strip()

        if not response_text:

            raise ValueError(
                "Gemini returned an empty FAQ response."
            )

        # ----------------------------------------------------
        # Clean JSON
        # ----------------------------------------------------

        response_text = clean_json_response(
            response_text
        )

        # ----------------------------------------------------
        # Parse JSON
        # ----------------------------------------------------

        try:

            faq_data = json.loads(
                response_text
            )

        except json.JSONDecodeError as e:

            print(
                "\n===== INVALID FAQ JSON ====="
            )

            print(response_text)

            print(
                "============================\n"
            )

            raise ValueError(
                f"Gemini returned invalid JSON: {str(e)}"
            )

        # ----------------------------------------------------
        # Validate
        # ----------------------------------------------------

        faq_data = validate_faq_response(
            faq_data
        )

        print(
            "[faq] FAQ generation successful"
        )

        return faq_data


    # ========================================================
    # Gemini HTTP Errors
    # ========================================================

    except httpx.HTTPStatusError as e:

        status = e.response.status_code

        print(
            "\n===== FAQ GEMINI ERROR ====="
        )

        print(
            "Status Code:",
            status
        )

        print(
            "Response:",
            e.response.text
        )

        print(
            "============================\n"
        )

        if status == 400:

            raise ValueError(
                "Gemini rejected the FAQ request."
            )

        if status == 401:

            raise ValueError(
                "FAQ Builder API key is invalid."
            )

        if status == 403:

            raise ValueError(
                "FAQ Builder API key does not have "
                "permission to access Gemini."
            )

        if status == 404:

            raise ValueError(
                f"The configured Gemini model "
                f"{GEMINI_MODEL} is unavailable."
            )

        if status == 429:

            raise ValueError(
                "FAQ Builder Gemini API quota or "
                "rate limit exceeded."
            )

        if status >= 500:

            raise ValueError(
                "Gemini is temporarily unavailable."
            )

        raise ValueError(
            f"Gemini API returned status {status}."
        )


    # ========================================================
    # Network Errors
    # ========================================================

    except httpx.RequestError as e:

        print(
            "[faq] network error:",
            str(e)
        )

        raise ValueError(
            "Unable to connect to Gemini."
        )


    except ValueError:
        raise


    except Exception as e:

        print(
            "[faq] unexpected error:",
            type(e).__name__,
            str(e)
        )

        raise ValueError(
            f"FAQ generation failed: {str(e)}"
        )