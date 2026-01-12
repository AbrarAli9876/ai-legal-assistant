import google.generativeai as genai
from fastapi import APIRouter, HTTPException, UploadFile, File
import pypdf
import docx
import io
import json

# Import our new API key
from app.core.config import FIR_ANALYZER_API_KEY

# --- Model Configuration ---
if not FIR_ANALYZER_API_KEY:
    raise HTTPException(status_code=500, detail="FIR Analyzer API Key not found.")

genai.configure(api_key=FIR_ANALYZER_API_KEY)

# --- NEW 11-POINT JSON OUTPUT STRUCTURE ---
ANALYSIS_SCHEMA = {
    "type": "OBJECT",
    "properties": {
        "fir_number": {"type": "STRING"},
        "police_station": {"type": "STRING"},
        "date_of_filing": {"type": "STRING"},
        "complainant": {"type": "STRING"},
        "date_and_time_of_incident": {"type": "STRING"},
        "place_of_incident": {"type": "STRING"},
        "accused_name": {"type": "STRING"},
        "witnesses": {"type": "ARRAY", "items": {"type": "STRING"}},
        "offence": {"type": "STRING"},
        "offences_mentioned": {"type": "STRING"},
        "investigating_officer": {"type": "STRING"},
    },
    "required": [
        "fir_number", "police_station", "date_of_filing", "complainant", 
        "date_and_time_of_incident", "place_of_incident", "accused_name", 
        "witnesses", "offence", "offences_mentioned", "investigating_officer"
    ]
}

# --- System Prompt for 11-POINT JSON Extraction ---
ANALYZER_SYSTEM_PROMPT = """
You are an AI assistant that extracts key details from an Indian First Information Report (FIR) or related police document.
The user will provide the full text.
Your task is to find the 11 key pieces of information.
You MUST respond *only* with a single, valid JSON object that adheres to the provided schema.
Do not add any conversational text.
If you cannot find information for a field, return the string "data is not present in the file".
For the 'witnesses' field, return an array of names. If no witnesses are mentioned, return an empty array [].
"""

generation_config = {
    "temperature": 0.0, 
    "max_output_tokens": 2048,
    "response_mime_type": "application/json", 
    "response_schema": ANALYSIS_SCHEMA,
}

analyzer_model = genai.GenerativeModel(
    # --- THIS IS THE FIX ---
    # We are changing to the faster, cheaper Flash model to avoid rate limits
    model_name="gemini-2.5-flash",
    # --- END OF FIX ---
    generation_config=generation_config,
    system_instruction=ANALYZER_SYSTEM_PROMPT
)

# --- API Configuration ---
router = APIRouter(
    prefix="/api/v1/analyzer",
    tags=["FIRAnalyzer"]
)

# --- Helper functions for file reading ---
def extract_text_from_pdf(file_stream: io.BytesIO) -> str:
    try:
        reader = pypdf.PdfReader(file_stream)
        text = ""
        for page in reader.pages:
            text += page.extract_text() or ""
        return text
    except Exception as e:
        print(f"Error reading PDF: {e}")
        raise HTTPException(status_code=400, detail=f"Could not read PDF. File may be corrupt or encrypted: {e}")

def extract_text_from_docx(file_stream: io.BytesIO) -> str:
    try:
        document = docx.Document(file_stream)
        text = ""
        for para in document.paragraphs:
            text += para.text + "\n"
        return text
    except Exception as e:
        print(f"Error reading DOCX: {e}")
        raise HTTPException(status_code=400, detail=f"Could not read DOCX file: {e}")

# --- Main API Endpoint ---
@router.post("/analyze-fir")
async def handle_fir_analysis(file: UploadFile = File(...)):
    """
    Accepts a PDF, DOCX, or TXT file, extracts text, and returns a
    structured JSON of key FIR details.
    """
    
    # 1. Check file type and extract text
    try:
        contents = await file.read()
        if not contents:
            raise HTTPException(status_code=400, detail="The uploaded file is empty.")
        
        file_stream = io.BytesIO(contents)
        
        if file.content_type == "application/pdf":
            document_text = extract_text_from_pdf(file_stream)
        elif file.content_type == "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
            document_text = extract_text_from_docx(file_stream)
        elif file.content_type == "text/plain":
            document_text = contents.decode("utf-8")
        else:
            raise HTTPException(status_code=400, detail="Invalid file type. Please upload a PDF, DOCX, or TXT file.")

        if not document_text.strip():
            raise HTTPException(status_code=400, detail="Uploaded file is empty or text could not be extracted.")
            
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        print(f"File read error: {e}")
        raise HTTPException(status_code=500, detail=f"Error reading file: {str(e)}")

    # 2. Send text to Gemini for structured JSON
    try:
        chat_session = analyzer_model.start_chat()
        response = chat_session.send_message(document_text)
        
        if not response.candidates:
            raise HTTPException(status_code=400, detail="Response was blocked by safety filters.")
        
        json_response = json.loads(response.text)
        
        return json_response

    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        print(f"An error occurred with Gemini: {e}")
        raise HTTPException(status_code=500, detail=f"Error processing document with AI: {str(e)}")