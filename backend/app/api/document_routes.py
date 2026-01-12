from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Literal, Union
from docxtpl import DocxTemplate
import docx2pdf
import os
import re
from datetime import date
import time

# Import our API keys from the config file
from app.core.config import DOCUMENT_GENERATOR_API_KEY, RENT_SALE_API_KEY, LEASE_DEED_API_KEY

# --- File Path Configuration ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
APP_DIR = os.path.dirname(BASE_DIR)
TEMPLATE_DIR = os.path.join(APP_DIR, "templates")
OUTPUT_DIR = os.path.join(APP_DIR, "static/outputs")
os.makedirs(OUTPUT_DIR, exist_ok=True)

# --- Template Loader ---
def get_template(template_name):
    """ Loads a DocxTemplate from disk. """
    template_path = os.path.join(TEMPLATE_DIR, template_name)
    if not os.path.exists(template_path):
        print(f"Template file not found at: {template_path}")
        return None
    return DocxTemplate(template_path)

# --- API Configuration ---
router = APIRouter(
    prefix="/api/v1/document",
    tags=["DocumentGenerator"]
)

# --- Pydantic Models for Validation ---

class Party(BaseModel):
    name: str = Field(..., min_length=1)
    address: str = Field(..., min_length=1)

class NDARequest(BaseModel):
    disclosing_party: Party
    receiving_parties: List[Party] = Field(..., min_items=1)
    purpose_of_disclosure: str = Field(..., min_length=1)
    business_purpose: str = Field(..., min_length=1)
    duration_years: int = Field(..., gt=0)
    jurisdiction_city: str = Field(..., min_length=1)

class AffidavitRequest(BaseModel):
    deponent_full_name: str = Field(..., min_length=1)
    deponent_age: int = Field(..., gt=0)
    relation_name: str = Field(..., min_length=1)
    deponent_address: str = Field(..., min_length=1)
    purpose_of_affidavit: str = Field(..., min_length=1)
    verification_place: str = Field(..., min_length=1)
    identifier_name: str = Field(..., min_length=1)
    notary_name: str = Field(..., min_length=1)
    notary_reg_no: str = Field(..., min_length=1)
    notary_office_address: str = Field(..., min_length=1)

class RentAgreementRequest(BaseModel):
    agreement_city: str = Field(..., min_length=1)
    landlord_full_name: str = Field(..., min_length=1)
    landlord_age: int = Field(..., gt=0)
    landlord_relation_name: str = Field(..., min_length=1)
    landlord_address: str = Field(..., min_length=1)
    landlord_phone: str = Field(..., min_length=1)
    tenant_full_name: str = Field(..., min_length=1)
    tenant_age: int = Field(..., gt=0)
    tenant_relation_name: str = Field(..., min_length=1)
    tenant_address: str = Field(..., min_length=1)
    tenant_phone: str = Field(..., min_length=1)
    property_address: str = Field(..., min_length=1)
    property_description: str = Field(..., min_length=1)
    start_date: str = Field(..., min_length=1)
    duration_months: int = Field(..., gt=0)
    monthly_rent: int = Field(..., gt=0)
    monthly_rent_words: str = Field(..., min_length=1)
    due_day: int = Field(..., gt=0, lt=32)
    payment_mode: str = Field(..., min_length=1)
    payment_address: str = Field(..., min_length=1)
    security_amount: int = Field(..., gt=0)
    usage_type: str = Field(..., min_length=1)
    notice_period: int = Field(..., gt=0)
    jurisdiction_city: str = Field(..., min_length=1)

class SaleDeedRequest(BaseModel):
    execution_city: str = Field(..., min_length=1)
    seller_full_name: str = Field(..., min_length=1)
    seller_age: int = Field(..., gt=0)
    seller_relation_name: str = Field(..., min_length=1)
    seller_address: str = Field(..., min_length=1)
    seller_phone: str = Field(..., min_length=1)
    buyer_full_name: str = Field(..., min_length=1)
    buyer_age: int = Field(..., gt=0)
    buyer_relation_name: str = Field(..., min_length=1)
    buyer_address: str = Field(..., min_length=1)
    buyer_phone: str = Field(..., min_length=1)
    property_address: str = Field(..., min_length=1)
    ownership_details: str = Field(..., min_length=1)
    sale_amount: int = Field(..., gt=0)
    sale_amount_words: str = Field(..., min_length=1)
    payment_mode: str = Field(..., min_length=1)
    payment_reference: Union[str, None] = Field(default=None)
    payment_date: str = Field(..., min_length=1)
    payment_amount: int = Field(..., gt=0)
    property_type: str = Field(..., min_length=1)
    boundary_east: str = Field(..., min_length=1)
    boundary_west: str = Field(..., min_length=1)
    boundary_north: str = Field(..., min_length=1)
    boundary_south: str = Field(..., min_length=1)
    property_area: str = Field(..., min_length=1)
    jurisdiction_city: str = Field(..., min_length=1)
    property_description: str = Field(..., min_length=1)
    survey_number: str = Field(..., min_length=1)

# --- MODEL FOR LEASE DEED (FIXED) ---
class LeaseDeedRequest(BaseModel):
    execution_city: str = Field(..., min_length=1)
    lessor_full_name: str = Field(..., min_length=1)
    lessor_age: int = Field(..., gt=0)
    lessor_relation_name: str = Field(..., min_length=1)
    lessor_address: str = Field(..., min_length=1)
    lessor_phone: str = Field(..., min_length=1)
    lessee_full_name: str = Field(..., min_length=1)
    lessee_age: int = Field(..., gt=0)
    lessee_relation_name: str = Field(..., min_length=1)
    lessee_address: str = Field(..., min_length=1)
    lessee_phone: str = Field(..., min_length=1)
    property_address: str = Field(..., min_length=1)
    property_description: str = Field(..., min_length=1)
    lease_purpose: str = Field(..., min_length=1)
    lease_start_date: str = Field(..., min_length=1)
    lease_duration_years: int = Field(..., gt=0)
    lease_end_date: str = Field(..., min_length=1)
    lease_rent_amount: int = Field(..., gt=0)
    lease_rent_words: str = Field(..., min_length=1)
    rent_due_day: int = Field(..., gt=0, lt=32)
    payment_mode: str = Field(..., min_length=1)
    # --- THIS IS THE FIX ---
    payment_reference: Union[str, None] = Field(default=None)
    # --- END OF FIX ---
    security_deposit_amount: int = Field(..., gt=0)
    termination_notice_period: int = Field(..., gt=0)
    default_months: int = Field(..., gt=0)
    registration_borne_by: str = Field(..., min_length=1)
    jurisdiction_city: str = Field(..., min_length=1)

# Helper function
def sanitize_filename(text):
    text = re.sub(r'[^\w\s-]', '', text).strip()
    text = re.sub(r'[-\s]+', '-', text)
    return text

# --- ENDPOINT 1: GENERATE NDA ---
@router.post("/generate-nda")
def handle_nda_generation(request: NDARequest):
    try:
        doc = get_template("nda_template.docx")
        if doc is None:
            raise HTTPException(status_code=500, detail="NDA template file not found on server.")
        context = request.dict()
        context['agreement_date'] = date.today().strftime("%B %d, %Y")
        timestamp = int(time.time())
        disclosing_safe = sanitize_filename(request.disclosing_party.name)
        base_filename = f"nda_{disclosing_safe}_{timestamp}"
        return generate_and_save_files(doc, context, base_filename)
    except Exception as e:
        print(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"Error generating NDA: {str(e)}")


# --- ENDPOINT 2: GENERATE AFFIDAVIT ---
@router.post("/generate-affidavit")
def handle_affidavit_generation(request: AffidavitRequest):
    try:
        doc = get_template("affidavit_template.docx")
        if doc is None:
            raise HTTPException(status_code=500, detail="Affidavit template file not found on server.")
        current_date_str = date.today().strftime("%B %d, %Y")
        context = request.dict()
        context['verification_date'] = current_date_str
        context['agreement_date'] = current_date_str 
        timestamp = int(time.time())
        deponent_safe = sanitize_filename(request.deponent_full_name)
        base_filename = f"affidavit_{deponent_safe}_{timestamp}"
        return generate_and_save_files(doc, context, base_filename)
    except Exception as e:
        print(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"Error generating Affidavit: {str(e)}")

# --- ENDPOINT 3: GENERATE RENT AGREEMENT ---
@router.post("/generate-rent-agreement")
def handle_rent_agreement_generation(request: RentAgreementRequest):
    try:
        doc = get_template("rent_agreement_template.docx")
        if doc is None:
            raise HTTPException(status_code=500, detail="Rent Agreement template file not found on server.")
        context = request.dict()
        context['agreement_date'] = date.today().strftime("%B %d, %Y")
        timestamp = int(time.time())
        landlord_safe = sanitize_filename(request.landlord_full_name)
        tenant_safe = sanitize_filename(request.tenant_full_name)
        base_filename = f"rent_{landlord_safe}_x_{tenant_safe}_{timestamp}"
        return generate_and_save_files(doc, context, base_filename)
    except Exception as e:
        print(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"Error generating Rent Agreement: {str(e)}")

# --- ENDPOINT 4: GENERATE SALE DEED ---
@router.post("/generate-sale-deed")
def handle_sale_deed_generation(request: SaleDeedRequest):
    try:
        doc = get_template("sale_deed_template.docx")
        if doc is None:
            raise HTTPException(status_code=500, detail="Sale Deed template file not found on server.")
        context = request.dict()
        context['execution_date'] = date.today().strftime("%B %d, %Y")
        if context['payment_reference'] is None:
            context['payment_reference'] = "N/A"
        timestamp = int(time.time())
        seller_safe = sanitize_filename(request.seller_full_name)
        buyer_safe = sanitize_filename(request.buyer_full_name)
        base_filename = f"sale_deed_{seller_safe}_x_{buyer_safe}_{timestamp}"
        return generate_and_save_files(doc, context, base_filename)
    except Exception as e:
        print(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"Error generating Sale Deed: {str(e)}")

# --- ENDPOINT 5: GENERATE LEASE DEED (FIXED) ---
@router.post("/generate-lease-deed")
def handle_lease_deed_generation(request: LeaseDeedRequest):
    """ Generates a .docx and .pdf for a Lease Deed. """
    try:
        template_name = "lease_deed_template.docx"
        doc = get_template(template_name)
        if doc is None:
            raise HTTPException(status_code=500, detail="Lease Deed template file not found on server.")
            
        context = request.dict()
        context['execution_date'] = date.today().strftime("%B %d, %Y")
        
        # --- THIS IS THE FIX ---
        # Handle optional 'payment_reference'
        if context['payment_reference'] is None:
            context['payment_reference'] = "N/A" # Or just an empty string ""
        # --- END OF FIX ---
        
        timestamp = int(time.time())
        lessor_safe = sanitize_filename(request.lessor_full_name)
        lessee_safe = sanitize_filename(request.lessee_full_name)
        base_filename = f"lease_deed_{lessor_safe}_x_{lessee_safe}_{timestamp}"
        
        return generate_and_save_files(doc, context, base_filename)

    except Exception as e:
        print(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"Error generating Lease Deed: {str(e)}")


# --- Helper function for file generation ---
def generate_and_save_files(doc: DocxTemplate, context: dict, base_filename: str):
    """
    Renders, saves, and converts a doc template.
    Returns a dictionary of download links.
    """
    output_docx_name = f"{base_filename}.docx"
    output_pdf_name = f"{base_filename}.pdf"
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