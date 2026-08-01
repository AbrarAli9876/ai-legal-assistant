import json
import httpx

from app.core.config import CASE_SUMMARIZER_API_KEY


# ============================================================
# Configuration
# ============================================================

API_KEY = CASE_SUMMARIZER_API_KEY

GEMINI_API_URL = (
    "https://generativelanguage.googleapis.com/v1beta/"
    "models/gemini-3.1-flash-lite:generateContent"
)


# ============================================================
# System Instruction
# ============================================================

SUMMARIZER_SYSTEM_PROMPT = """
You are KanoonAI, an expert AI legal case summarizer specializing
in Indian court judgments.

Your task is to carefully analyze the supplied judgment text and
extract accurate structured information from the document.

Follow these rules:

1. CASE INFORMATION
Extract:
- Case name
- Case number
- Court name
- Jurisdiction
- Citation

For case numbers, look for formats such as:
- Civil Appeal No.
- Criminal Appeal No.
- SLP No.
- Writ Petition No.
- Criminal Petition No.
- Civil Petition No.
- Review Petition No.

2. PARTIES
Extract:
- Petitioner/Appellant
- Respondent
- Advocate(s) for petitioner/appellant
- Advocate(s) for respondent

Do not invent advocate names if they are not present.

3. DATES
Extract:
- Date of judgment
- Date of filing

If the date of filing is not present, return an empty string.

4. SECTIONS AND LAWS
Identify important Acts, constitutional provisions, rules and
sections specifically mentioned or materially relied upon in
the judgment.

Do not invent legal provisions.

5. LEGAL ISSUES
Identify the main legal questions or issues considered by the court.

Return them as a list of concise strings.

6. FINAL JUDGMENT
Provide a concise but sufficiently informative summary of the
court's final decision.

Explain:
- whether the petition/appeal was allowed, dismissed, disposed of,
  partly allowed, etc.,
- important directions issued by the court,
- important relief granted or denied.

7. ACCURACY
Use only information supported by the supplied judgment.

Do not invent:
- Case numbers
- Parties
- Advocates
- Dates
- Sections
- Citations
- Court names
- Holdings

If information is unavailable, return an empty string or empty list.

8. CURRENT AND OLD CRIMINAL LAWS
The document may refer to older Indian laws such as:
- Indian Penal Code, 1860
- Code of Criminal Procedure, 1973
- Indian Evidence Act, 1872

Do not automatically replace those references with BNS, BNSS or BSA.
Summarize the law actually discussed in the judgment.

9. OUTPUT FORMAT
Return ONLY valid JSON.

Do not return Markdown.
Do not use ```json.
Do not include explanations before or after the JSON.

The JSON MUST follow this structure:

{
    "case_title_info": {
        "case_name": "",
        "case_number": "",
        "court_name": "",
        "jurisdiction": "",
        "citations": ""
    },
    "parties_involved": {
        "petitioner": "",
        "respondent": "",
        "advocates_petitioner": "",
        "advocates_respondent": ""
    },
    "dates": {
        "date_of_judgment": "",
        "date_of_filing": ""
    },
    "sections_invoked": "",
    "legal_issues": [],
    "final_judgment": ""
}
"""


# ============================================================
# Default Schema
# ============================================================

def get_default_schema_dict():
    return {
        "case_title_info": {
            "case_name": "",
            "case_number": "",
            "court_name": "",
            "jurisdiction": "",
            "citations": ""
        },
        "parties_involved": {
            "petitioner": "",
            "respondent": "",
            "advocates_petitioner": "",
            "advocates_respondent": ""
        },
        "dates": {
            "date_of_judgment": "",
            "date_of_filing": ""
        },
        "sections_invoked": "",
        "legal_issues": [],
        "final_judgment": ""
    }


# ============================================================
# Merge Gemini Response With Default Schema
# ============================================================

def deep_merge(source: dict, destination: dict):
    """
    Merge Gemini's response into the default schema so missing
    fields do not cause KeyErrors later.
    """

    for key, value in source.items():

        if isinstance(value, dict):

            node = destination.setdefault(
                key,
                {}
            )

            deep_merge(
                value,
                node
            )

        else:

            destination[key] = value

    return destination


# ============================================================
# Clean Gemini JSON
# ============================================================

def clean_json_response(text: str) -> str:
    """
    Removes accidental Markdown JSON fences if Gemini returns them.
    """

    text = text.strip()

    if text.startswith("```json"):
        text = text[7:]

    elif text.startswith("```"):
        text = text[3:]

    if text.endswith("```"):
        text = text[:-3]

    return text.strip()


# ============================================================
# Gemini Summarization Service
# ============================================================

async def summarize_case(
    document_text: str
) -> dict:
    """
    Sends extracted judgment text to Gemini and returns
    structured case-summary JSON.
    """

    if not API_KEY:

        raise ValueError(
            "CASE_SUMMARIZER_API_KEY not found."
        )

    if not document_text:

        raise ValueError(
            "Document text cannot be empty."
        )

    payload = {

        "systemInstruction": {
            "parts": [
                {
                    "text": SUMMARIZER_SYSTEM_PROMPT
                }
            ]
        },

        "contents": [
            {
                "role": "user",
                "parts": [
                    {
                        "text": (
                            "Analyze the following Indian court "
                            "judgment and return the required "
                            "structured JSON.\n\n"
                            "JUDGMENT:\n\n"
                            + document_text
                        )
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
        "x-goog-api-key": API_KEY
    }

    try:

        print("[case_summarizer] calling Gemini")

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

        candidates = result.get(
            "candidates",
            []
        )

        if not candidates:

            print(
                "[case_summarizer] no candidates:",
                result
            )

            raise ValueError(
                "Gemini returned no summary."
            )

        candidate = candidates[0]

        parts = (
            candidate
            .get("content", {})
            .get("parts", [])
        )

        text_parts = []

        for part in parts:

            if "text" in part:
                text_parts.append(
                    part["text"]
                )

        response_text = "".join(
            text_parts
        ).strip()

        if not response_text:

            raise ValueError(
                "Gemini returned an empty summary."
            )

        response_text = clean_json_response(
            response_text
        )

        try:

            ai_response = json.loads(
                response_text
            )

        except json.JSONDecodeError as e:

            print(
                "[case_summarizer] invalid JSON:"
            )

            print(response_text)

            raise ValueError(
                f"Gemini returned invalid JSON: {e}"
            )

        # Merge missing fields with defaults

        full_response = deep_merge(
            ai_response,
            get_default_schema_dict()
        )

        print(
            "[case_summarizer] summary generated"
        )

        return full_response


    # ========================================================
    # Gemini HTTP Errors
    # ========================================================

    except httpx.HTTPStatusError as e:

        status = e.response.status_code

        print(
            "\n===== CASE SUMMARIZER GEMINI ERROR ====="
        )

        print(
            "Status:",
            status
        )

        print(
            "Response:",
            e.response.text
        )

        print(
            "========================================\n"
        )

        if status == 400:

            raise ValueError(
                "Gemini rejected the summarization request."
            )

        if status == 401:

            raise ValueError(
                "Invalid Case Summarizer API key."
            )

        if status == 403:

            raise ValueError(
                "Case Summarizer API key does not have "
                "permission to use Gemini."
            )

        if status == 404:

            raise ValueError(
                "The configured Gemini summarizer model "
                "is unavailable."
            )

        if status == 429:

            raise ValueError(
                "Case Summarizer Gemini quota or "
                "rate limit exceeded."
            )

        if status >= 500:

            raise ValueError(
                "Gemini is temporarily unavailable."
            )

        raise ValueError(
            f"Gemini API error: {status}"
        )


    # ========================================================
    # Network Errors
    # ========================================================

    except httpx.RequestError as e:

        print(
            "[case_summarizer] network error:",
            str(e)
        )

        raise ValueError(
            "Unable to connect to Gemini."
        )


    # ========================================================
    # Other Errors
    # ========================================================

    except ValueError:
        raise

    except Exception as e:

        print(
            "[case_summarizer] unexpected error:",
            type(e).__name__,
            str(e)
        )

        raise ValueError(
            f"Case summarization failed: {str(e)}"
        )