from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from docxtpl import DocxTemplate
import docx2pdf
import os
import re
from datetime import date
import time

# Import our new API key
from app.core.config import LEGAL_NOTICE_API_KEY

# --- Model Configuration ---
if not LEGAL_NOTICE_API_KEY:
    print("Warning: LEGAL_NOTICE_API_KEY is not set.")

# --- File Path Configuration (Local to this file) ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
APP_DIR = os.path.dirname(BASE_DIR)
TEMPLATE_DIR = os.path.join(APP_DIR, "templates")
OUTPUT_DIR = os.path.join(APP_DIR, "static/outputs")
os.makedirs(OUTPUT_DIR, exist_ok=True)

# --- API Configuration ---
router = APIRouter(
    prefix="/api/v1/notice",
    tags=["LegalNoticeGenerator"]
)

# --- Helper functions (Standalone) ---
def get_template(template_name):
    """ Loads a DocxTemplate from disk. """
    template_path = os.path.join(TEMPLATE_DIR, template_name)
    if not os.path.exists(template_path):
        print(f"Template file not found at: {template_path}")
        return None
    return DocxTemplate(template_path)

def sanitize_filename(text):
    text = re.sub(r'[^\w\s-]', '', text).strip()
    text = re.sub(r'[-\s]+', '-', text)
    return text

def generate_and_save_files(doc: DocxTemplate, context: dict, base_filename: str):
    """
    Renders, saves, and converts a doc template.
    Returns a dictionary of download links.
    """
    timestamp = int(time.time())
    unique_filename = f"{base_filename}_{timestamp}"

    output_docx_name = f"{unique_filename}.docx"
    output_pdf_name = f"{unique_filename}.pdf"
    output_docx_path = os.path.join(OUTPUT_DIR, output_docx_name)
    output_pdf_path = os.path.join(OUTPUT_DIR, output_pdf_name)

    doc.render(context)
    doc.save(output_docx_path)
    
    pdf_url = None
    try:
        docx2pdf.convert(output_docx_path, output_pdf_path)
        pdf_url = f"/static/outputs/{output_pdf_name}"
    except Exception as pdf_error:
        print(f"Warning: PDF conversion failed: {pdf_error}")

    return {
        "docx_url": f"/static/outputs/{output_docx_name}",
        "pdf_url": pdf_url
    }

# --- Pydantic Model for the Unpaid Salary Notice ---
class UnpaidSalaryNoticeRequest(BaseModel):
    recipient_name: str = Field(..., min_length=1)
    recipient_designation: str = Field(..., min_length=1)
    recipient_company_name: str = Field(..., min_length=1)
    recipient_company_address: str = Field(..., min_length=1)
    sender_name: str = Field(..., min_length=1)
    employee_id: str = Field(..., min_length=1)
    employee_company_name: str = Field(..., min_length=1)
    employee_company_address: str = Field(..., min_length=1)
    employment_start_date: str = Field(..., min_length=1)
    employment_end_date: str = Field(..., min_length=1)
    unpaid_salary_period: str = Field(..., min_length=1)
    unpaid_salary_amount: int = Field(..., gt=0)
    unpaid_salary_amount_words: str = Field(..., min_length=1)
    response_time_days: int = Field(..., gt=0)

# --- NEW Pydantic Model for Loan Repayment Notice ---
class LoanRepaymentNoticeRequest(BaseModel):
    borrower_name: str = Field(..., min_length=1)
    borrower_address: str = Field(..., min_length=1)
    lender_name: str = Field(..., min_length=1)
    lender_address: str = Field(..., min_length=1)
    lender_contact: str = Field(..., min_length=1)
    loan_amount: int = Field(..., gt=0)
    loan_amount_words: str = Field(..., min_length=1)
    loan_date: str = Field(..., min_length=1)
    repayment_period: int = Field(..., gt=0)
    loan_purpose: str = Field(..., min_length=1)
    installment_amount: int = Field(..., gt=0)
    outstanding_date: str = Field(..., min_length=1)
    outstanding_amount: int = Field(..., gt=0)
    outstanding_amount_words: str = Field(..., min_length=1)
    response_time_days: int = Field(..., gt=0)

# --- API Endpoint 1 ---
@router.post("/generate-unpaid-salary-notice")
def handle_salary_notice_generation(request: UnpaidSalaryNoticeRequest):
    """
    Generates a .docx and .pdf for an Unpaid Salary Legal Notice.
    """
    try:
        doc = get_template("unpaid_salary_notice_template.docx")
        if doc is None:
            raise HTTPException(status_code=500, detail="Unpaid Salary Notice template file not found on server.")

        context = request.dict()
        context['generation_date'] = date.today().strftime("%B %d, %Y")
        
        sender_safe = sanitize_filename(request.sender_name)
        recipient_safe = sanitize_filename(request.recipient_name)
        base_filename = f"notice_{sender_safe}_to_{recipient_safe}"
        
        return generate_and_save_files(doc, context, base_filename)

    except Exception as e:
        print(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"Error generating legal notice: {str(e)}")

# --- NEW API Endpoint 2 ---
@router.post("/generate-loan-repayment-notice")
def handle_loan_notice_generation(request: LoanRepaymentNoticeRequest):
    """
    Generates a .docx and .pdf for a Loan Repayment Legal Notice.
    """
    try:
        doc = get_template("loan_repayment_notice_template.docx")
        if doc is None:
            raise HTTPException(status_code=500, detail="Loan Repayment Notice template file not found on server.")

        context = request.dict()
        context['generation_date'] = date.today().strftime("%B %d, %Y")
        
        lender_safe = sanitize_filename(request.lender_name)
        borrower_safe = sanitize_filename(request.borrower_name)
        base_filename = f"notice_{lender_safe}_to_{borrower_safe}"
        
        return generate_and_save_files(doc, context, base_filename)

    except Exception as e:
        print(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"Error generating legal notice: {str(e)}")