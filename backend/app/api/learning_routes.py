import google.generativeai as genai
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Dict
import json

# Import the API keys
# We now import a specific key for the research tool as requested
from app.core.config import LEARNING_HUB_API_KEY, LEGAL_RESEARCH_API_KEY

# --- API Router ---
router = APIRouter(
    prefix="/api/v1/learning",
    tags=["LearningHub"]
)

# ----------------------------------------------------------------------
# 🎓 TOOL 1: BARE ACT SIMPLIFIER
# ----------------------------------------------------------------------

# --- Model Configuration for Tool 1 ---
if not LEARNING_HUB_API_KEY:
    raise HTTPException(status_code=500, detail="Learning Hub API Key not found.")

# We configure the default 'genai' object with the main key
genai.configure(api_key=LEARNING_HUB_API_KEY)

# --- Pydantic Schema for Tool 1 ---
SIMPLIFIER_SCHEMA = {
    "type": "OBJECT",
    "properties": {
        "section_title": {"type": "STRING"},
        "simplified_meaning": {"type": "STRING"},
        "legal_ingredients": {
            "type": "ARRAY",
            "items": {"type": "STRING"}
        },
        "exceptions": {
            "type": "ARRAY",
            "items": {"type": "STRING"}
        },
        # --- REMOVED FLOWCHART ---
        "real_life_illustration": {"type": "STRING"},
        "landmark_cases": {
            "type": "ARRAY",
            "items": {
                "type": "OBJECT",
                "properties": {
                    "case_name": {"type": "STRING"},
                    "citation": {"type": "STRING"},
                    "summary": {"type": "STRING"}
                },
                "required": ["case_name", "citation", "summary"]
            }
        },
        "memory_trick": {"type": "STRING"}
    },
    "required": [
        "section_title", 
        "simplified_meaning", 
        "legal_ingredients", 
        "exceptions", 
        # "flowchart", <-- REMOVED
        "real_life_illustration", 
        "landmark_cases", 
        "memory_trick"
    ]
}

# --- System Prompt for Tool 1 ---
SIMPLIFIER_SYSTEM_PROMPT = """
You are an expert Law Professor for first-year Indian law students. Your task is to take a complex legal section and break it down into a simple, 6-point JSON object.

You MUST adhere to the following rules:
1.  **Tone:** Simple, clear, and encouraging. Avoid overly complex legal jargon.
2.  **Ingredients/Exceptions:** Return as a list of strings. If there are none, return an empty list [].
3.  **Landmark Cases:** Provide 2-3 key cases.
4.  **Illustration:** Create a simple, modern, real-life story to explain the section.
5.  **Memory Trick:** Provide a simple mnemonic or acroynym.
6.  **JSON Only:** Your ENTIRE response must be a single, valid JSON object matching the provided schema. Do not add any text before or after the JSON.
7.  **NO FORMATTING:** Do not use any markdown formatting (like **bold** or *italics*), nor single or double quotation marks for emphasis within the string values. All JSON values must be plain, unformatted text.
"""

# --- Generation Configuration for Tool 1 ---
generation_config_simplifier = {
    "temperature": 0.2,
    "max_output_tokens": 8192,
    "response_mime_type": "application/json", 
    "response_schema": SIMPLIFIER_SCHEMA,
}

# --- AI Model for Tool 1 ---
simplifier_model = genai.GenerativeModel(
    model_name="gemini-2.5-flash", 
    generation_config=generation_config_simplifier,
    system_instruction=SIMPLIFIER_SYSTEM_PROMPT
)

# --- Pydantic Request Model for Tool 1 ---
class BareActRequest(BaseModel):
    section: str = Field(..., min_length=3, description="The legal section to simplify, e.g., 'IPC 304' or 'Evidence Act Section 113B'")

@router.post("/simplify-bare-act")
async def handle_simplify_bare_act(request: BareActRequest):
    try:
        user_prompt = f"Please simplify and explain this section: {request.section}"
        chat_session = simplifier_model.start_chat()
        response = chat_session.send_message(user_prompt)
        if not response.candidates:
            raise HTTPException(status_code=400, detail="Response was blocked by safety filters.")
        json_response = json.loads(response.text)
        return json_response
    except Exception as e:
        if isinstance(e, HTTPException): raise e
        print(f"An error occurred with Gemini: {e}")
        raise HTTPException(status_code=500, detail=f"Error processing text with AI: {str(e)}")

# ----------------------------------------------------------------------
# 🎓 TOOL 2: AI ANSWER WRITING EVALUATOR (Completed)
# ----------------------------------------------------------------------

# ... (Tool 2 Schema, Prompt, Config, Model, Request, and Endpoint remain UNCHANGED) ...
# I am keeping Tool 2 exactly as it was in your previous code to save space.
# It uses the default 'genai' configuration (LEARNING_HUB_API_KEY).

# --- Pydantic Schema for Tool 2 Response ---
EVALUATOR_SCHEMA = {
    "type": "OBJECT",
    "properties": {
        "marks_out_of_10": {"type": "NUMBER"},
        "evaluation_criteria": {
            "type": "OBJECT",
            "properties": {
                "structure": {"type": "STRING"},
                "case_usage": {"type": "STRING"},
                "bare_act_accuracy": {"type": "STRING"},
                "grammar": {"type": "STRING"},
                "legal_reasoning": {"type": "STRING"}
            },
            "required": ["structure", "case_usage", "bare_act_accuracy", "grammar", "legal_reasoning"]
        },
        "mistakes": {
            "type": "ARRAY",
            "items": {"type": "STRING"}
        },
        "improved_answer": {"type": "STRING"},
        "suggestion_to_score_more": {"type": "STRING"}
    },
    "required": ["marks_out_of_10", "evaluation_criteria", "mistakes", "improved_answer", "suggestion_to_score_more"]
}

EVALUATOR_SYSTEM_PROMPT = """
You are a strict, fair, and helpful Indian Law Professor. Your task is to evaluate a student's answer to a law exam question.
The user will provide the 'question' and the student's 'answer'.
You MUST return a single, valid JSON object that adheres to the provided schema.

Your evaluation MUST follow these rules:
1.  **Marks:** Be critical but fair. A perfect answer is 10/10. A decent answer with good structure but missing cases might be a 6/10. A poor answer is 2-3/10.
2.  **Evaluation Criteria:** Provide 1-2 sentences of *constructive* feedback (what they did right, what they did wrong) for each of the 5 criteria.
3.  **Mistakes:** List the 3-5 *most important* factual, structural, or legal mistakes.
4.  **Improved Answer:** Rewrite the student's answer to be an 'A+' (9-10 mark) response.
5.  **Suggestion:** Give one high-level, actionable tip to help them improve next time.
6.  **NO FORMATTING:** Do not use any markdown (like **bold** or *italics*) or 'quotes' for emphasis. All JSON values must be plain text.
"""

generation_config_evaluator = {
    "temperature": 0.2,
    "max_output_tokens": 8192,
    "response_mime_type": "application/json", 
    "response_schema": EVALUATOR_SCHEMA,
}

evaluator_model = genai.GenerativeModel(
    model_name="gemini-2.5-flash", 
    generation_config=generation_config_evaluator,
    system_instruction=EVALUATOR_SYSTEM_PROMPT
)

class AnswerEvaluationRequest(BaseModel):
    question: str = Field(..., min_length=10, description="The exam question")
    answer: str = Field(..., min_length=20, description="The student's answer to the question")

@router.post("/evaluate-answer")
async def handle_evaluate_answer(request: AnswerEvaluationRequest):
    try:
        user_prompt = f"Question: {request.question}\n\nStudent's Answer: {request.answer}"
        chat_session = evaluator_model.start_chat()
        response = chat_session.send_message(user_prompt)
        if not response.candidates:
            raise HTTPException(status_code=400, detail="Response was blocked by safety filters.")
        json_response = json.loads(response.text)
        return json_response
    except Exception as e:
        if isinstance(e, HTTPException): raise e
        print(f"An error occurred with Gemini: {e}")
        raise HTTPException(status_code=500, detail=f"Error processing text with AI: {str(e)}")


# ----------------------------------------------------------------------
# 🎓 TOOL 3: LEGAL RESEARCH ASSISTANT
# ----------------------------------------------------------------------

# --- Check for Tool 3 API Key ---
if not LEGAL_RESEARCH_API_KEY:
    raise HTTPException(status_code=500, detail="Legal Research API Key not found.")

# We DO NOT call genai.configure() again globally, as that would overwrite Tool 1 & 2.
# Instead, we pass the api_key directly when creating the GenerativeModel for this tool?
# Actually, the Python SDK uses a global config. To use a different key, 
# we must instantiate a separate client or re-configure.
# Since these are separate requests, we can re-configure locally or pass the `api_key` 
# argument to the `GenerativeModel` constructor (if supported) or `start_chat`.
#
# **CORRECTION:** The `genai.GenerativeModel` constructor does NOT accept an API key.
# The standard way to handle multiple keys in this library is to configure a specific 
# client for this model instance. However, the simplest way in this synchronous
# route handling is to configure the global `genai` right before we need it.

# --- Pydantic Schema for Tool 3 Response ---
RESEARCHER_SCHEMA = {
    "type": "OBJECT",
    "properties": {
        "topic_definition": {"type": "STRING"},
        "bare_act_section": {"type": "STRING"},
        "legal_ingredients": {
            "type": "ARRAY",
            "items": {"type": "STRING"}
        },
        "important_cases": {
            "type": "ARRAY",
            "items": {
                "type": "OBJECT",
                "properties": {
                    "case_name": {"type": "STRING"},
                    "facts": {"type": "STRING"},
                    "ratio": {"type": "STRING"}
                },
                "required": ["case_name", "facts", "ratio"]
            }
        },
        "flowchart": {"type": "STRING"},
        "comparison": {"type": "STRING"},
        "model_answer_10_marks": {"type": "STRING"},
        "viva_questions": {
            "type": "ARRAY",
            "items": {"type": "STRING"}
        }
    },
    "required": [
        "topic_definition",
        "bare_act_section",
        "legal_ingredients",
        "important_cases",
        "flowchart",
        "comparison",
        "model_answer_10_marks",
        "viva_questions"
    ]
}

# --- System Prompt for Tool 3 ---
RESEARCHER_SYSTEM_PROMPT = """
You are an expert Legal Research Assistant for Indian law students. Your task is to generate a complete set of notes for a given legal topic.
The user will provide the 'topic'.
You MUST return a single, valid JSON object that adheres to the provided schema.

Your generated notes MUST follow these rules:
1.  **Definition:** Provide a clear, concise definition of the topic.
2.  **Bare Act:** State the primary bare act section(s). If none, say "Not defined by a single section, but..."
3.  **Ingredients:** List the key legal ingredients or elements. If none, return [].
4.  **Cases:** Provide 2-3 landmark cases. Include brief facts and the 'ratio decidendi' (reason for the decision).
5.  **Flowchart:** Provide a simple, Top-Down ("graph TD;") Mermaid-syntax flowchart for the concept. Each step MUST be on a new line.
6.  **Comparison:** Compare the topic to a similar legal concept (e.g., Culpable Homicide vs. Murder; Res Judicata vs. Res Sub-Judice).
7.  **Model Answer:** Write a well-structured 10-mark model exam answer for the topic.
8.  **Viva Questions:** List 3-5 short viva-style questions about the topic.
9.  **NO FORMATTING:** Do not use any markdown (like **bold** or *italics*) or 'quotes' for emphasis. All JSON values must be plain text.
"""

# --- Generation Configuration for Tool 3 ---
generation_config_researcher = {
    "temperature": 0.2,
    "max_output_tokens": 8192,
    "response_mime_type": "application/json", 
    "response_schema": RESEARCHER_SCHEMA,
}

# --- AI Model for Tool 3 ---
# Note: We don't instantiate the model globally here because we need to switch keys.
# We will instantiate it inside the request handler.

# --- Pydantic Request Model for Tool 3 ---
class ResearchRequest(BaseModel):
    topic: str = Field(..., min_length=5, description="The legal topic to research")

@router.post("/research-topic")
async def handle_research_topic(request: ResearchRequest):
    """
    Accepts a legal topic and returns a comprehensive 8-point
    set of notes, including cases, flowchart, and model answer.
    """
    try:
        # --- CRITICAL: Switch to the Research API Key ---
        genai.configure(api_key=LEGAL_RESEARCH_API_KEY)
        
        # Instantiate the model with the new config
        researcher_model = genai.GenerativeModel(
            model_name="gemini-2.5-flash", 
            generation_config=generation_config_researcher,
            system_instruction=RESEARCHER_SYSTEM_PROMPT
        )
        
        user_prompt = f"Please generate a complete set of notes for the following legal topic: {request.topic}"
        
        chat_session = researcher_model.start_chat()
        response = chat_session.send_message(user_prompt)
        
        if not response.candidates:
            raise HTTPException(status_code=400, detail="Response was blocked by safety filters.")
        
        json_response = json.loads(response.text)
        return json_response

    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        print(f"An error occurred with Gemini: {e}")
        raise HTTPException(status_code=500, detail=f"Error processing text with AI: {str(e)}")