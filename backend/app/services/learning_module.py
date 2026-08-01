import json
import httpx

from app.core.config import (
    LEARNING_HUB_API_KEY,
    LEGAL_RESEARCH_API_KEY
)


# ============================================================
# Gemini Configuration
# ============================================================

GEMINI_MODEL = "gemini-3.1-flash-lite"

GEMINI_API_URL = (
    "https://generativelanguage.googleapis.com/v1beta/"
    f"models/{GEMINI_MODEL}:generateContent"
)


# ============================================================
# Tool 1 - Bare Act Simplifier Prompt
# ============================================================

SIMPLIFIER_SYSTEM_PROMPT = """
You are an expert Indian Law Professor teaching first-year law students.

Your task is to simplify a legal section and return structured
educational information.

Follow these rules:

1. SECTION TITLE
Identify the legal provision clearly.

2. SIMPLIFIED MEANING
Explain the provision in simple language that a beginner can understand.

3. LEGAL INGREDIENTS
List the important elements or requirements of the provision.

Return them as an array of strings.

4. EXCEPTIONS
List important exceptions if applicable.

If there are no exceptions, return [].

5. REAL-LIFE ILLUSTRATION
Give a simple modern example showing how the provision may operate.

6. LANDMARK CASES
Provide 2-3 important Indian cases where appropriate.

For each case provide:
- case_name
- citation
- summary

Do not invent case names or citations.

If reliable cases cannot be identified, return an empty array.

7. MEMORY TRICK
Give a simple mnemonic or memory technique.

8. CURRENT LAW
Be careful about changes in Indian criminal law.

The Indian Penal Code, Code of Criminal Procedure and Indian Evidence
Act have been replaced for current criminal-law matters by the
Bharatiya Nyaya Sanhita, Bharatiya Nagarik Suraksha Sanhita and
Bharatiya Sakshya Adhiniyam respectively.

However, if the user explicitly asks about an older provision such as
IPC Section 420, explain that provision accurately and do not silently
replace it with another section.

9. ACCURACY
Do not invent legal provisions, case names or citations.

10. OUTPUT
Return ONLY valid JSON.

Do not return Markdown or explanations outside the JSON.

Return exactly this structure:

{
    "section_title": "",
    "simplified_meaning": "",
    "legal_ingredients": [],
    "exceptions": [],
    "real_life_illustration": "",
    "landmark_cases": [
        {
            "case_name": "",
            "citation": "",
            "summary": ""
        }
    ],
    "memory_trick": ""
}
"""


# ============================================================
# Tool 2 - Answer Evaluator Prompt
# ============================================================

EVALUATOR_SYSTEM_PROMPT = """
You are a strict, fair and helpful Indian Law Professor.

Your task is to evaluate a student's answer to a law examination
question.

Follow these rules:

1. MARKS
Give marks out of 10.

Be critical but fair.

2. STRUCTURE
Evaluate whether the answer has a proper introduction, explanation,
legal provisions, analysis and conclusion.

3. CASE USAGE
Evaluate whether relevant cases have been used correctly.

Do not reward fabricated cases.

4. BARE ACT ACCURACY
Check whether Acts and sections mentioned in the answer are legally
appropriate.

5. GRAMMAR
Evaluate clarity, readability and professional legal writing.

6. LEGAL REASONING
Evaluate how well the student applies legal principles.

7. MISTAKES
Identify the most important factual, legal or structural mistakes.

8. IMPROVED ANSWER
Rewrite the answer into a strong examination answer capable of
receiving approximately 9-10 marks.

9. SUGGESTION
Provide one useful recommendation for improving future answers.

10. OUTPUT
Return ONLY valid JSON.

Do not return Markdown.

Return exactly:

{
    "marks_out_of_10": 0,
    "evaluation_criteria": {
        "structure": "",
        "case_usage": "",
        "bare_act_accuracy": "",
        "grammar": "",
        "legal_reasoning": ""
    },
    "mistakes": [],
    "improved_answer": "",
    "suggestion_to_score_more": ""
}
"""


# ============================================================
# Tool 3 - Legal Research Prompt
# ============================================================

RESEARCHER_SYSTEM_PROMPT = """
You are an expert Legal Research Assistant for Indian law students.

Generate comprehensive study notes about the legal topic supplied
by the user.

Follow these rules:

1. TOPIC DEFINITION
Explain the topic clearly and accurately.

2. BARE ACT
Identify the relevant Act and sections.

3. LEGAL INGREDIENTS
List the essential legal requirements.

4. IMPORTANT CASES
Provide 2-3 important Indian cases where applicable.

For every case provide:
- case_name
- facts
- ratio

Do not invent cases.

5. FLOWCHART
Provide a simple top-down Mermaid flowchart beginning with:

graph TD;

6. COMPARISON
Where appropriate, compare the topic with a closely related legal
concept.

7. MODEL ANSWER
Write a well-structured answer suitable for a 10-mark Indian law
examination question.

8. VIVA QUESTIONS
Generate 3-5 useful viva questions.

9. CURRENT LAW
Take account of current Indian law.

Where the topic concerns older criminal laws such as IPC, CrPC or
the Indian Evidence Act, distinguish them from BNS, BNSS and BSA
where relevant.

Do not automatically replace an old section when the user explicitly
asks about that historical provision.

10. ACCURACY
Do not invent:
- Sections
- Acts
- Cases
- Legal principles

11. OUTPUT
Return ONLY valid JSON.

Do not return Markdown outside JSON.

Return exactly:

{
    "topic_definition": "",
    "bare_act_section": "",
    "legal_ingredients": [],
    "important_cases": [
        {
            "case_name": "",
            "facts": "",
            "ratio": ""
        }
    ],
    "flowchart": "",
    "comparison": "",
    "model_answer_10_marks": "",
    "viva_questions": []
}
"""


# ============================================================
# JSON Cleaner
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
# Generic Gemini Request
# ============================================================

async def _call_gemini(
    api_key: str,
    system_prompt: str,
    user_prompt: str,
    max_output_tokens: int = 8192
) -> dict:

    if not api_key:
        raise ValueError(
            "Required Gemini API key was not found."
        )

    payload = {
        "systemInstruction": {
            "parts": [
                {
                    "text": system_prompt
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
            "maxOutputTokens": max_output_tokens,
            "responseMimeType": "application/json"
        }
    }

    headers = {
        "Content-Type": "application/json",
        "x-goog-api-key": api_key
    }

    try:

        print(
            f"[learning] calling {GEMINI_MODEL}"
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

        candidates = result.get(
            "candidates",
            []
        )

        if not candidates:

            print(
                "[learning] no candidates:",
                result
            )

            raise ValueError(
                "Gemini returned no response."
            )

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
                "Gemini returned an empty response."
            )

        response_text = clean_json_response(
            response_text
        )

        try:

            return json.loads(
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


    # ========================================================
    # HTTP Errors
    # ========================================================

    except httpx.HTTPStatusError as e:

        status = e.response.status_code

        print(
            "\n===== LEARNING GEMINI ERROR ====="
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
            "=================================\n"
        )

        if status == 400:

            raise ValueError(
                "Gemini rejected the request."
            )

        if status == 401:

            raise ValueError(
                "The Gemini API key is invalid."
            )

        if status == 403:

            raise ValueError(
                "The API key does not have permission "
                "to use Gemini."
            )

        if status == 404:

            raise ValueError(
                f"The configured Gemini model "
                f"{GEMINI_MODEL} is unavailable."
            )

        if status == 429:

            raise ValueError(
                "Gemini API quota or rate limit exceeded."
            )

        if status >= 500:

            raise ValueError(
                "Gemini is temporarily unavailable."
            )

        raise ValueError(
            f"Gemini API error: {status}"
        )


    # ========================================================
    # Network Error
    # ========================================================

    except httpx.RequestError as e:

        print(
            "[learning] network error:",
            str(e)
        )

        raise ValueError(
            "Unable to connect to Gemini."
        )


    except ValueError:
        raise


    except Exception as e:

        print(
            "[learning] unexpected error:",
            type(e).__name__,
            str(e)
        )

        raise ValueError(
            f"Gemini request failed: {str(e)}"
        )


# ============================================================
# Tool 1 - Bare Act Simplifier
# ============================================================

async def simplify_bare_act(
    section: str
) -> dict:

    print(
        "[learning] Bare Act Simplifier"
    )

    user_prompt = (
        "Simplify and explain the following Indian "
        "legal provision for a law student:\n\n"
        f"{section}"
    )

    result = await _call_gemini(
        api_key=LEARNING_HUB_API_KEY,
        system_prompt=SIMPLIFIER_SYSTEM_PROMPT,
        user_prompt=user_prompt
    )

    return result


# ============================================================
# Tool 2 - Answer Evaluator
# ============================================================

async def evaluate_answer(
    question: str,
    answer: str
) -> dict:

    print(
        "[learning] Answer Evaluator"
    )

    user_prompt = (
        "Evaluate the following law examination answer.\n\n"
        f"QUESTION:\n{question}\n\n"
        f"STUDENT ANSWER:\n{answer}"
    )

    result = await _call_gemini(
        api_key=LEARNING_HUB_API_KEY,
        system_prompt=EVALUATOR_SYSTEM_PROMPT,
        user_prompt=user_prompt
    )

    return result


# ============================================================
# Tool 3 - Legal Research
# ============================================================

async def research_legal_topic(
    topic: str
) -> dict:

    print(
        "[learning] Legal Research Assistant"
    )

    user_prompt = (
        "Generate comprehensive study notes for "
        "the following Indian legal topic:\n\n"
        f"{topic}"
    )

    result = await _call_gemini(
        api_key=LEGAL_RESEARCH_API_KEY,
        system_prompt=RESEARCHER_SYSTEM_PROMPT,
        user_prompt=user_prompt
    )

    return result