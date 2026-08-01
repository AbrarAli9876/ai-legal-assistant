import json
import httpx

from app.core.config import FIR_ANALYZER_API_KEY


# ============================================================
# Configuration
# ============================================================

API_KEY = FIR_ANALYZER_API_KEY

GEMINI_API_URL = (
    "https://generativelanguage.googleapis.com/v1beta/"
    "models/gemini-3.1-flash-lite:generateContent"
)


# ============================================================
# System Prompt
# ============================================================

ANALYZER_SYSTEM_PROMPT = """
You are KanoonAI, an AI assistant specializing in extracting
structured information from Indian First Information Reports (FIRs)
and related police documents.

Carefully analyze the supplied document and extract the required
information.

RULES:

1. FIR NUMBER
Extract the FIR number exactly as written in the document.

2. POLICE STATION
Extract the police station where the FIR was registered.

3. DATE OF FILING
Extract the FIR registration or filing date.

4. COMPLAINANT
Extract the full name of the complainant or informant.

5. DATE AND TIME OF INCIDENT
Extract the date and time of the alleged incident.

6. PLACE OF INCIDENT
Extract the location where the alleged incident occurred.

7. ACCUSED NAME
Extract the name or names of the accused persons.

If multiple accused persons are mentioned, include all names
separated by commas.

8. WITNESSES
Extract only witnesses specifically identified in the document.

Return witnesses as an array of strings.

If no witnesses are identified, return an empty array.

9. OFFENCE
Provide a short description of the alleged offence based only
on the contents of the FIR.

Do not determine or imply that the accused is guilty.

10. OFFENCES MENTIONED
Extract all legal provisions, Acts and sections specifically
mentioned in the FIR.

These may include provisions from laws such as:

- Bharatiya Nyaya Sanhita (BNS)
- Bharatiya Nagarik Suraksha Sanhita (BNSS)
- Bharatiya Sakshya Adhiniyam (BSA)
- Indian Penal Code (IPC)
- Code of Criminal Procedure (CrPC)
- Indian Evidence Act
- Information Technology Act
- Other applicable laws

Do not invent sections.

Do not automatically convert IPC sections into BNS sections or
CrPC sections into BNSS sections.

Extract the laws actually written in the document.

11. INVESTIGATING OFFICER
Extract the investigating officer's name if present.

ACCURACY:

Use ONLY information contained in the supplied document.

Never invent:

- FIR numbers
- Police stations
- Names
- Dates
- Locations
- Witnesses
- Legal sections
- Acts
- Investigating officers

If information for a string field cannot be found, return exactly:

data is not present in the file

For witnesses, return [] when no witnesses are identified.

Remember that an FIR contains allegations.
Do not treat allegations as proven facts or findings of guilt.

OUTPUT:

Return ONLY a valid JSON object.

Do not return Markdown.
Do not use ```json.
Do not include explanations before or after the JSON.

Return exactly this structure:

{
    "fir_number": "",
    "police_station": "",
    "date_of_filing": "",
    "complainant": "",
    "date_and_time_of_incident": "",
    "place_of_incident": "",
    "accused_name": "",
    "witnesses": [],
    "offence": "",
    "offences_mentioned": "",
    "investigating_officer": ""
}
"""


# ============================================================
# Default Response
# ============================================================

DEFAULT_VALUE = "data is not present in the file"


def get_default_analysis() -> dict:
    return {
        "fir_number": DEFAULT_VALUE,
        "police_station": DEFAULT_VALUE,
        "date_of_filing": DEFAULT_VALUE,
        "complainant": DEFAULT_VALUE,
        "date_and_time_of_incident": DEFAULT_VALUE,
        "place_of_incident": DEFAULT_VALUE,
        "accused_name": DEFAULT_VALUE,
        "witnesses": [],
        "offence": DEFAULT_VALUE,
        "offences_mentioned": DEFAULT_VALUE,
        "investigating_officer": DEFAULT_VALUE,
    }


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
# Normalize Gemini Response
# ============================================================

def normalize_analysis(data: dict) -> dict:

    default = get_default_analysis()

    if not isinstance(data, dict):
        return default

    for key in default:

        if key not in data:
            continue

        value = data[key]

        # Witnesses must always remain a list
        if key == "witnesses":

            if isinstance(value, list):

                default[key] = [
                    str(item).strip()
                    for item in value
                    if str(item).strip()
                ]

            continue

        # All other values are strings
        if value is not None and str(value).strip():

            default[key] = str(value).strip()

    return default


# ============================================================
# Gemini FIR Analyzer
# ============================================================

async def analyze_fir(document_text: str) -> dict:

    if not API_KEY:

        raise ValueError(
            "FIR_ANALYZER_API_KEY not found."
        )

    if not document_text or not document_text.strip():

        raise ValueError(
            "FIR document text cannot be empty."
        )

    # --------------------------------------------------------
    # Gemini Request
    # --------------------------------------------------------

    payload = {

        "systemInstruction": {
            "parts": [
                {
                    "text": ANALYZER_SYSTEM_PROMPT
                }
            ]
        },

        "contents": [
            {
                "role": "user",
                "parts": [
                    {
                        "text": (
                            "Analyze the following Indian FIR "
                            "or police document and extract the "
                            "required structured information.\n\n"
                            "DOCUMENT:\n\n"
                            + document_text
                        )
                    }
                ]
            }
        ],

        "generationConfig": {
            "temperature": 0.0,
            "maxOutputTokens": 4096,
            "responseMimeType": "application/json"
        }
    }

    headers = {
        "Content-Type": "application/json",
        "x-goog-api-key": API_KEY
    }

    try:

        print("[fir_analyzer] calling Gemini")

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
        # Candidates
        # ----------------------------------------------------

        candidates = result.get(
            "candidates",
            []
        )

        if not candidates:

            print(
                "[fir_analyzer] Gemini response:",
                result
            )

            raise ValueError(
                "Gemini returned no analysis."
            )

        candidate = candidates[0]

        # ----------------------------------------------------
        # Extract Response Text
        # ----------------------------------------------------

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
                "Gemini returned an empty analysis."
            )

        # ----------------------------------------------------
        # Clean Response
        # ----------------------------------------------------

        response_text = clean_json_response(
            response_text
        )

        # ----------------------------------------------------
        # Convert JSON String → Python Dictionary
        # ----------------------------------------------------

        try:

            analysis_data = json.loads(
                response_text
            )

        except json.JSONDecodeError as e:

            print(
                "\n===== INVALID GEMINI JSON ====="
            )

            print(response_text)

            print(
                "===============================\n"
            )

            raise ValueError(
                f"Gemini returned invalid JSON: {str(e)}"
            )

        # ----------------------------------------------------
        # Normalize
        # ----------------------------------------------------

        analysis_data = normalize_analysis(
            analysis_data
        )

        print(
            "[fir_analyzer] analysis completed"
        )

        return analysis_data


    # ========================================================
    # Gemini HTTP Errors
    # ========================================================

    except httpx.HTTPStatusError as e:

        status = e.response.status_code

        print(
            "\n===== FIR ANALYZER GEMINI ERROR ====="
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
            "=====================================\n"
        )

        if status == 400:

            raise ValueError(
                "Gemini rejected the FIR analysis request."
            )

        elif status == 401:

            raise ValueError(
                "Invalid FIR Analyzer API key."
            )

        elif status == 403:

            raise ValueError(
                "FIR Analyzer API key does not have "
                "permission to access Gemini."
            )

        elif status == 404:

            raise ValueError(
                "The configured Gemini FIR Analyzer "
                "model is unavailable."
            )

        elif status == 429:

            raise ValueError(
                "FIR Analyzer Gemini API quota or "
                "rate limit exceeded."
            )

        elif status >= 500:

            raise ValueError(
                "Gemini is temporarily unavailable."
            )

        else:

            raise ValueError(
                f"Gemini API returned status {status}."
            )


    # ========================================================
    # Network Errors
    # ========================================================

    except httpx.RequestError as e:

        print(
            "[fir_analyzer] network error:",
            str(e)
        )

        raise ValueError(
            "Unable to connect to Gemini API."
        )


    # ========================================================
    # Known Errors
    # ========================================================

    except ValueError:
        raise


    # ========================================================
    # Unexpected Errors
    # ========================================================

    except Exception as e:

        print(
            "[fir_analyzer] unexpected error:",
            type(e).__name__,
            str(e)
        )

        raise ValueError(
            f"FIR analysis failed: {str(e)}"
        )