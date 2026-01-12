import google.generativeai as genai
from fastapi import APIRouter, HTTPException, UploadFile, File
import pypdf
import docx
import io
import json
from datetime import date
from docxtpl import DocxTemplate
import docx2pdf
import os
import re
import time

from app.core.config import CASE_SUMMARIZER_API_KEY

if not CASE_SUMMARIZER_API_KEY:
    raise HTTPException(status_code=500, detail="Case Summarizer API Key not found.")

genai.configure(api_key=CASE_SUMMARIZER_API_KEY)

# --- NEW 7-POINT SCHEMA ---
SUMMARY_SCHEMA = {
    "type": "OBJECT",
    "properties": {
        "case_title_info": {
            "type": "OBJECT",
            "properties": {
                "case_name": {"type": "STRING"},
                "case_number": {"type": "STRING"},
                "court_name": {"type": "STRING"},
                "jurisdiction": {"type": "STRING"},
                "citations": {"type": "STRING"},
            },
            "required": ["case_name", "court_name"]
        },
        "parties_involved": {
            "type": "OBJECT",
            "properties": {
                "petitioner": {"type": "STRING"},
                "respondent": {"type": "STRING"},
                "advocates_petitioner": {"type": "STRING"},
                "advocates_respondent": {"type": "STRING"},
            }
        },
        "dates": {
            "type": "OBJECT",
            "properties": {
                "date_of_judgment": {"type": "STRING"},
                "date_of_filing": {"type": "STRING"},
            }
        },
        "sections_invoked": {"type": "STRING"},
        "legal_issues": {
            "type": "ARRAY", 
            "items": {"type": "STRING"}
        },
        "final_judgment": {"type": "STRING"},
    }
}

# --- NEW PROMPT FOR 7-POINT STRUCTURE ---
SUMMARIZER_SYSTEM_PROMPT = """
You are an expert legal AI. Analyze the Indian court judgment provided and extract the specific details required by the JSON schema.

**INSTRUCTIONS:**
1. **Case Number:** Look for "Civil Appeal No.", "Criminal Appeal No.", "SLP No.", etc.
2. **Jurisdiction:** E.g., "Civil Appellate Jurisdiction", "Criminal Original Jurisdiction".
3. **Advocates:** List the names of advocates appearing for both sides.
4. **Date of Filing:** Look for "Date of Filing" or "Instituted on". If NOT found, return empty string "".
5. **Sections Invoked:** List all Acts and Sections mentioned (e.g., "Section 302 IPC", "Article 14 Constitution").
6. **Synthesize:** If specific text is missing (like Final Judgment summary), read the document and generate a concise summary of the decision.
7. **Format:** Return ONLY valid JSON. No markdown.
"""

generation_config = {
    "temperature": 0.2, 
    "max_output_tokens": 8192,
    "response_mime_type": "application/json", 
    "response_schema": SUMMARY_SCHEMA,
}

summarizer_model = genai.GenerativeModel(
    model_name="gemini-2.5-flash",
    generation_config=generation_config,
    system_instruction=SUMMARIZER_SYSTEM_PROMPT
)

router = APIRouter(
    prefix="/api/v1/summarizer",
    tags=["CaseSummarizer"]
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
APP_DIR = os.path.dirname(BASE_DIR)
TEMPLATE_DIR = os.path.join(APP_DIR, "templates")
OUTPUT_DIR = os.path.join(APP_DIR, "static/outputs")
os.makedirs(OUTPUT_DIR, exist_ok=True)

def get_default_schema_dict():
    return {
        "case_title_info": {
            "case_name": "", "case_number": "", "court_name": "", "jurisdiction": "", "citations": ""
        },
        "parties_involved": {
            "petitioner": "", "respondent": "", "advocates_petitioner": "", "advocates_respondent": ""
        },
        "dates": {
            "date_of_judgment": "", "date_of_filing": ""
        },
        "sections_invoked": "",
        "legal_issues": [],
        "final_judgment": ""
    }

# --- Helpers (Unchanged) ---
def get_template(template_name):
    template_path = os.path.join(TEMPLATE_DIR, template_name)
    if not os.path.exists(template_path): return None
    return DocxTemplate(template_path)

def sanitize_filename(text):
    text = re.sub(r'[^\w\s-]', '', text).strip()
    text = re.sub(r'[-\s]+', '-', text)
    return text

def generate_and_save_files(doc: DocxTemplate, context: dict, base_filename: str):
    timestamp = int(time.time())
    unique_filename = f"{base_filename}_{timestamp}"
    output_docx_name = f"{unique_filename}.docx"
    output_pdf_name = f"{unique_filename}.pdf"
    output_docx_path = os.path.join(OUTPUT_DIR, output_docx_name)
    output_pdf_path = os.path.join(OUTPUT_DIR, output_pdf_name)

    doc.render(context)
    doc.save(output_docx_path)
    try:
        docx2pdf.convert(output_docx_path, output_pdf_path)
        pdf_url = f"/static/outputs/{output_pdf_name}"
    except Exception as pdf_error:
        print(f"Warning: PDF conversion failed: {pdf_error}")
        pdf_url = None

    return {
        "docx_url": f"/static/outputs/{output_docx_name}",
        "pdf_url": pdf_url
    }

def extract_text_from_pdf(file_stream: io.BytesIO) -> str:
    try:
        reader = pypdf.PdfReader(file_stream)
        text = ""
        for page in reader.pages: text += page.extract_text() or ""
        return text.replace('\x00', '')
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"PDF Error: {e}")

def extract_text_from_docx(file_stream: io.BytesIO) -> str:
    try:
        document = docx.Document(file_stream)
        text = ""
        for para in document.paragraphs: text += para.text + "\n"
        return text.replace('\x00', '')
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"DOCX Error: {e}")

@router.post("/upload-and-summarize")
async def handle_summarize_upload(file: UploadFile = File(...)):
    print("[summarizer] request start")
    try:
        contents = await file.read()
        if not contents:
            raise HTTPException(status_code=400, detail="Empty file.")
        
        file_stream = io.BytesIO(contents)
        if file.content_type == "application/pdf":
            print("[summarizer] reading pdf")
            document_text = extract_text_from_pdf(file_stream)
        elif "wordprocessingml" in file.content_type:
            print("[summarizer] reading docx")
            document_text = extract_text_from_docx(file_stream)
        elif "text" in file.content_type:
            print("[summarizer] reading text")
            document_text = contents.decode("utf-8").replace('\x00', '')
        else:
            raise HTTPException(status_code=400, detail="Invalid file type.")

        if not document_text.strip():
            raise HTTPException(status_code=400, detail="Extracted text is empty.")
    except Exception as e:
        print(f"File read error: {e}")
        raise HTTPException(status_code=500, detail=f"File Error: {str(e)}")

    MAX_CHARS = 400000 
    if len(document_text) > MAX_CHARS:
        print(f"[summarizer] truncating text from {len(document_text)} chars")
        document_text = document_text[:MAX_CHARS]

    try:
        print("[summarizer] calling model")
        chat_session = summarizer_model.start_chat()
        response = chat_session.send_message(document_text)
        if not response.candidates:
            raise HTTPException(status_code=400, detail="Blocked by safety filters.")
        json_response = json.loads(response.text)
        print("[summarizer] model response ok")
    except Exception as e:
        print(f"AI Error: {e}")
        raise HTTPException(status_code=500, detail=f"AI Error: {str(e)}")

    try:
        doc = get_template("summary_template.docx")
        if doc is None: raise HTTPException(status_code=500, detail="Template not found.")
        
        # Merge defaults
        full_ai_response = get_default_schema_dict()
        def deep_merge(source, destination):
            for key, value in source.items():
                if isinstance(value, dict):
                    node = destination.setdefault(key, {})
                    deep_merge(value, node)
                else:
                    destination[key] = value
            return destination
        full_ai_response = deep_merge(json_response, full_ai_response)

        # --- MAP TO TEMPLATE VARIABLES ---
        # This maps the AI JSON to your Docx template tags
        template_context = {
            'case_name': full_ai_response['case_title_info'].get('case_name', ''),
            'case_number': full_ai_response['case_title_info'].get('case_number', ''),
            'court_name': full_ai_response['case_title_info'].get('court_name', ''),
            'jurisdiction': full_ai_response['case_title_info'].get('jurisdiction', ''),
            'citations': full_ai_response['case_title_info'].get('citations', ''),
            
            'petitioner': full_ai_response['parties_involved'].get('petitioner', ''),
            'respondent': full_ai_response['parties_involved'].get('respondent', ''),
            'adv_petitioner': full_ai_response['parties_involved'].get('advocates_petitioner', ''),
            'adv_respondent': full_ai_response['parties_involved'].get('advocates_respondent', ''),
            
            'judgment_date': full_ai_response['dates'].get('date_of_judgment', ''),
            'filing_date': full_ai_response['dates'].get('date_of_filing', ''),
            
            'sections': full_ai_response.get('sections_invoked', ''),
            'issues': full_ai_response.get('legal_issues', []),
            'final_judgment': full_ai_response.get('final_judgment', ''),
        }
        
        base_filename = f"summary_{sanitize_filename(template_context['case_name'])}"
        download_links = generate_and_save_files(doc, template_context, base_filename)

        return {
            "summary_data": full_ai_response, 
            "download_links": download_links
        }

    except Exception as e:
        print(f"Gen Error: {e}")
        raise HTTPException(status_code=500, detail=f"Gen Error: {str(e)}")
