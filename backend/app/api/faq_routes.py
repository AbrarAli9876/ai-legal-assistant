import google.generativeai as genai
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Dict, Any
import json
import os
import uuid
from docxtpl import DocxTemplate
from docx2pdf import convert
# --- 1. NEW IMPORTS ---
from fastapi.responses import FileResponse
from starlette.background import BackgroundTask

# Import the API key
from app.core.config import FAQ_BUILDER_API_KEY

# --- Define Paths ---
APP_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TEMPLATE_DIR = os.path.join(APP_DIR, "templates")
OUTPUT_DIR = os.path.join(APP_DIR, "static", "outputs")

# --- Model Configuration ---
if not FAQ_BUILDER_API_KEY:
    raise HTTPException(status_code=500, detail="FAQ Builder API Key not found.")

genai.configure(api_key=FAQ_BUILDER_API_KEY)

# --- API Router ---
router = APIRouter(
    prefix="/api/v1/faq",
    tags=["FAQBuilder"]
)

# ----------------------------------------------------------------------
# 🤖 AI-POWERED FAQ BUILDER
# ----------------------------------------------------------------------

# (... The FAQ_SCHEMA, FAQ_SYSTEM_PROMPT, and other model config is unchanged ...)

FAQ_SCHEMA = {
    "type": "OBJECT",
    "properties": {
        "faqs": {
            "type": "ARRAY",
            "items": {
                "type": "OBJECT",
                "properties": {
                    "question": {"type": "STRING"},
                    "answer": {"type": "STRING"}
                },
                "required": ["question", "answer"]
            }
        }
    },
    "required": ["faqs"]
}

FAQ_SYSTEM_PROMPT = """
You are a helpful legal content assistant. Your task is to generate 5 to 7 common, high-quality Frequently Asked Questions (FAQs) based on a given Indian legal topic.
You MUST adhere to the following rules:
1.  **Audience:** The questions should be what a layperson or potential client would ask. The answers should be simple, clear, and legally accurate, as if for a law firm's website.
2.  **Content:** Generate 5-7 FAQs.
3.  **JSON Only:** Your ENTIRE response must be a single, valid JSON object matching the provided schema. Do not add any text before or after the JSON.
4.  **NO FORMATTING:** Do not use any markdown (like **bold** or *italics*) in your string responses. All JSON values must be plain text.
"""

generation_config_faq = {
    "temperature": 0.2,
    "max_output_tokens": 8192,
    "response_mime_type": "application/json", 
    "response_schema": FAQ_SCHEMA,
}

faq_model = genai.GenerativeModel(
    model_name="gemini-2.5-flash", 
    generation_config=generation_config_faq,
    system_instruction=FAQ_SYSTEM_PROMPT
)

# --- Pydantic Request Model (for AI) ---
class FAQRequest(BaseModel):
    topic: str = Field(..., min_length=5, description="The legal topic to generate FAQs for")

@router.post("/generate-from-topic")
async def handle_generate_faq(request: FAQRequest):
    try:
        user_prompt = f"Please generate 5-7 FAQs for the following legal topic in India: {request.topic}"
        chat_session = faq_model.start_chat()
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
# ⬇️ UPDATED PDF DOWNLOAD ENDPOINT
# ----------------------------------------------------------------------

# --- Pydantic Model for PDF request ---
class FAQItem(BaseModel):
    question: str
    answer: str

class FAQDownloadRequest(BaseModel):
    topic: str
    faqs: List[FAQItem]

@router.post("/download-pdf")
async def handle_download_faq_pdf(request: FAQDownloadRequest):
    """Accepts topic & FAQs, generates a PDF, saves it, and returns a URL the client can fetch."""
    try:
        doc = DocxTemplate(os.path.join(TEMPLATE_DIR, "faq_template.docx"))

        context = {
            "topic": request.topic,
            "faqs": [faq.dict() for faq in request.faqs]
        }

        unique_id = str(uuid.uuid4())
        user_filename = f"FAQ_{request.topic.replace(' ', '_')}_{unique_id[:6]}.pdf"

        docx_path = os.path.join(OUTPUT_DIR, f"{unique_id}.docx")
        pdf_path = os.path.join(OUTPUT_DIR, f"{unique_id}.pdf")

        doc.render(context)
        doc.save(docx_path)

        convert(docx_path)  # generates PDF
        os.remove(docx_path)

        # Return a stable URL pointing to a download endpoint that sets attachment headers
        download_url = f"/api/v1/faq/download/{unique_id}"
        return {
            "pdf_url": download_url,
            "filename": user_filename
        }

    except Exception as e:
        print(f"Error generating PDF: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate PDF: {str(e)}")


@router.get("/download/{file_id}")
async def serve_faq_pdf(file_id: str):
    """Serves the generated FAQ PDF as an attachment so the browser downloads instead of previewing."""
    pdf_path = os.path.join(OUTPUT_DIR, f"{file_id}.pdf")
    if not os.path.exists(pdf_path):
        raise HTTPException(status_code=404, detail="File not found")

    user_filename = f"FAQ_{file_id}.pdf"
    return FileResponse(
        path=pdf_path,
        filename=user_filename,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={user_filename}"}
    )