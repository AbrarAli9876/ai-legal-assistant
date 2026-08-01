from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional

from docxtpl import DocxTemplate

import os
import re
import time

import pythoncom
import win32com.client


# ============================================================
# Paths
# ============================================================

BASE_DIR = os.path.dirname(
    os.path.abspath(__file__)
)

APP_DIR = os.path.dirname(BASE_DIR)

TEMPLATE_DIR = os.path.join(
    APP_DIR,
    "templates"
)

OUTPUT_DIR = os.path.join(
    APP_DIR,
    "static",
    "outputs"
)

os.makedirs(
    OUTPUT_DIR,
    exist_ok=True
)


# ============================================================
# Router
# ============================================================

router = APIRouter(
    prefix="/api/v1/document",
    tags=["DocumentGenerator"]
)


# ============================================================
# Helper: Sanitize Filename
# ============================================================

def sanitize_filename(text: str) -> str:
    """
    Removes characters that are unsafe for filenames.
    """

    text = re.sub(
        r"[^\w\s-]",
        "",
        text
    ).strip()

    text = re.sub(
        r"[-\s]+",
        "_",
        text
    )

    return text or "document"


# ============================================================
# Helper: Load Template
# ============================================================

def get_template(
    template_name: str
) -> DocxTemplate:
    """
    Loads a DOCX template from app/templates.
    """

    template_path = os.path.join(
        TEMPLATE_DIR,
        template_name
    )

    if not os.path.exists(
        template_path
    ):
        raise FileNotFoundError(
            f"Template not found: {template_path}"
        )

    return DocxTemplate(
        template_path
    )


# ============================================================
# DOCX -> PDF Conversion
# ============================================================

def convert_docx_to_pdf(
    docx_path: str,
    pdf_path: str
):
    """
    Converts DOCX to PDF using Microsoft Word COM.

    Microsoft Word must be installed and activated.

    COM is initialized explicitly because FastAPI may execute
    synchronous endpoint code inside a worker thread.
    """

    word = None
    word_document = None

    print(
        "[document] Initializing COM"
    )

    pythoncom.CoInitialize()

    try:

        # ----------------------------------------------------
        # Absolute paths are important for Word COM
        # ----------------------------------------------------

        docx_path = os.path.abspath(
            docx_path
        )

        pdf_path = os.path.abspath(
            pdf_path
        )

        if not os.path.exists(
            docx_path
        ):
            raise FileNotFoundError(
                f"DOCX file not found: {docx_path}"
            )

        print(
            "[document] Starting Microsoft Word"
        )

        # ----------------------------------------------------
        # Start independent Word instance
        # ----------------------------------------------------

        word = win32com.client.DispatchEx(
            "Word.Application"
        )

        word.Visible = False
        word.DisplayAlerts = 0

        # ----------------------------------------------------
        # Open DOCX
        # ----------------------------------------------------

        print(
            "[document] Opening DOCX"
        )

        word_document = word.Documents.Open(
            docx_path,
            ReadOnly=True
        )

        # ----------------------------------------------------
        # Export PDF
        # ----------------------------------------------------

        print(
            "[document] Converting DOCX to PDF"
        )

        # 17 = wdFormatPDF
        word_document.SaveAs(
            pdf_path,
            FileFormat=17
        )

        # ----------------------------------------------------
        # Verify output
        # ----------------------------------------------------

        if not os.path.exists(
            pdf_path
        ):
            raise RuntimeError(
                "Microsoft Word did not create the PDF."
            )

        if os.path.getsize(
            pdf_path
        ) == 0:
            raise RuntimeError(
                "Microsoft Word created an empty PDF."
            )

        print(
            "[document] PDF conversion successful"
        )

    finally:

        # ----------------------------------------------------
        # Close opened document
        # ----------------------------------------------------

        if word_document is not None:

            try:

                word_document.Close(
                    SaveChanges=False
                )

            except Exception as close_error:

                print(
                    "[document] Warning closing DOCX:",
                    close_error
                )

        # ----------------------------------------------------
        # Quit Word
        # ----------------------------------------------------

        if word is not None:

            try:

                word.Quit()

            except Exception as quit_error:

                print(
                    "[document] Warning closing Word:",
                    quit_error
                )

        # ----------------------------------------------------
        # Release COM
        # ----------------------------------------------------

        pythoncom.CoUninitialize()

        print(
            "[document] COM released"
        )


# ============================================================
# Generate and Save Files
# ============================================================

def generate_and_save_files(
    doc: DocxTemplate,
    context: dict,
    base_filename: str
):
    """
    Renders the DOCX template, saves it, converts it to PDF,
    and returns URLs for both files.
    """

    timestamp = int(
        time.time()
    )

    safe_filename = sanitize_filename(
        base_filename
    )

    unique_filename = (
        f"{safe_filename}_{timestamp}"
    )

    # --------------------------------------------------------
    # File names
    # --------------------------------------------------------

    output_docx_name = (
        f"{unique_filename}.docx"
    )

    output_pdf_name = (
        f"{unique_filename}.pdf"
    )

    # --------------------------------------------------------
    # File paths
    # --------------------------------------------------------

    output_docx_path = os.path.abspath(
        os.path.join(
            OUTPUT_DIR,
            output_docx_name
        )
    )

    output_pdf_path = os.path.abspath(
        os.path.join(
            OUTPUT_DIR,
            output_pdf_name
        )
    )

    # --------------------------------------------------------
    # Render template
    # --------------------------------------------------------

    print(
        "[document] Rendering template"
    )

    doc.render(
        context
    )

    # --------------------------------------------------------
    # Save DOCX
    # --------------------------------------------------------

    doc.save(
        output_docx_path
    )

    if not os.path.exists(
        output_docx_path
    ):
        raise RuntimeError(
            "Failed to create DOCX file."
        )

    print(
        "[document] DOCX created:",
        output_docx_path
    )

    # --------------------------------------------------------
    # DOCX URL
    # --------------------------------------------------------

    docx_url = (
        f"/static/outputs/{output_docx_name}"
    )

    pdf_url = None

    # --------------------------------------------------------
    # PDF Conversion
    # --------------------------------------------------------

    try:

        convert_docx_to_pdf(
            output_docx_path,
            output_pdf_path
        )

        pdf_url = (
            f"/static/outputs/{output_pdf_name}"
        )

    except Exception as pdf_error:

        print(
            "\n===== DOCUMENT PDF ERROR ====="
        )

        print(
            "Type:",
            type(pdf_error).__name__
        )

        print(
            "Error:",
            str(pdf_error)
        )

        print(
            "==============================\n"
        )

        # DOCX still remains available if PDF conversion fails.
        pdf_url = None

    # --------------------------------------------------------
    # Response
    # --------------------------------------------------------

    return {
        "docx_url": docx_url,
        "pdf_url": pdf_url
    }


# ============================================================
# NDA Request
# ============================================================

class NDARequest(BaseModel):

    party_a_name: str = Field(
        ...,
        min_length=1
    )

    party_a_address: str = Field(
        ...,
        min_length=1
    )

    party_b_name: str = Field(
        ...,
        min_length=1
    )

    party_b_address: str = Field(
        ...,
        min_length=1
    )

    purpose: str = Field(
        ...,
        min_length=1
    )

    confidential_information: str = Field(
        ...,
        min_length=1
    )

    effective_date: str = Field(
        ...,
        min_length=1
    )

    duration: str = Field(
        ...,
        min_length=1
    )


# ============================================================
# Affidavit Request
# ============================================================

class AffidavitRequest(BaseModel):

    deponent_name: str = Field(
        ...,
        min_length=1
    )

    deponent_address: str = Field(
        ...,
        min_length=1
    )

    purpose: str = Field(
        ...,
        min_length=1
    )

    statement: str = Field(
        ...,
        min_length=1
    )

    place: str = Field(
        ...,
        min_length=1
    )

    date: str = Field(
        ...,
        min_length=1
    )


# ============================================================
# Rent Agreement Request
# ============================================================

class RentAgreementRequest(BaseModel):

    landlord_name: str = Field(
        ...,
        min_length=1
    )

    landlord_address: str = Field(
        ...,
        min_length=1
    )

    tenant_name: str = Field(
        ...,
        min_length=1
    )

    tenant_address: str = Field(
        ...,
        min_length=1
    )

    property_address: str = Field(
        ...,
        min_length=1
    )

    monthly_rent: str = Field(
        ...,
        min_length=1
    )

    security_deposit: str = Field(
        ...,
        min_length=1
    )

    agreement_duration: str = Field(
        ...,
        min_length=1
    )

    start_date: str = Field(
        ...,
        min_length=1
    )


# ============================================================
# Sale Deed Request
# ============================================================

class SaleDeedRequest(BaseModel):

    seller_name: str = Field(
        ...,
        min_length=1
    )

    seller_address: str = Field(
        ...,
        min_length=1
    )

    buyer_name: str = Field(
        ...,
        min_length=1
    )

    buyer_address: str = Field(
        ...,
        min_length=1
    )

    property_description: str = Field(
        ...,
        min_length=1
    )

    sale_amount: str = Field(
        ...,
        min_length=1
    )

    execution_date: str = Field(
        ...,
        min_length=1
    )


# ============================================================
# Lease Deed Request
# ============================================================

class LeaseDeedRequest(BaseModel):

    lessor_name: str = Field(
        ...,
        min_length=1
    )

    lessor_address: str = Field(
        ...,
        min_length=1
    )

    lessee_name: str = Field(
        ...,
        min_length=1
    )

    lessee_address: str = Field(
        ...,
        min_length=1
    )

    property_description: str = Field(
        ...,
        min_length=1
    )

    lease_duration: str = Field(
        ...,
        min_length=1
    )

    monthly_rent: str = Field(
        ...,
        min_length=1
    )

    security_deposit: str = Field(
        ...,
        min_length=1
    )

    commencement_date: str = Field(
        ...,
        min_length=1
    )


# ============================================================
# Generate NDA
# ============================================================

@router.post(
    "/generate-nda"
)
def generate_nda(
    request: NDARequest
):

    try:

        print(
            "\n[document] NDA generation request"
        )

        doc = get_template(
            "nda_template.docx"
        )

        context = request.model_dump()

        party_a = sanitize_filename(
            request.party_a_name
        )

        party_b = sanitize_filename(
            request.party_b_name
        )

        base_filename = (
            f"NDA_{party_a}_and_{party_b}"
        )

        result = generate_and_save_files(
            doc,
            context,
            base_filename
        )

        print(
            "[document] NDA generation completed"
        )

        return result

    except Exception as e:

        print(
            "[document] NDA error:",
            type(e).__name__,
            str(e)
        )

        raise HTTPException(
            status_code=500,
            detail=f"Error generating NDA: {str(e)}"
        )


# ============================================================
# Generate Affidavit
# ============================================================

@router.post(
    "/generate-affidavit"
)
def generate_affidavit(
    request: AffidavitRequest
):

    try:

        print(
            "\n[document] Affidavit generation request"
        )

        doc = get_template(
            "affidavit_template.docx"
        )

        context = request.model_dump()

        name = sanitize_filename(
            request.deponent_name
        )

        result = generate_and_save_files(
            doc,
            context,
            f"Affidavit_{name}"
        )

        return result

    except Exception as e:

        print(
            "[document] Affidavit error:",
            type(e).__name__,
            str(e)
        )

        raise HTTPException(
            status_code=500,
            detail=(
                f"Error generating affidavit: {str(e)}"
            )
        )


# ============================================================
# Generate Rent Agreement
# ============================================================

@router.post(
    "/generate-rent-agreement"
)
def generate_rent_agreement(
    request: RentAgreementRequest
):

    try:

        print(
            "\n[document] Rent agreement request"
        )

        doc = get_template(
            "rent_agreement_template.docx"
        )

        context = request.model_dump()

        landlord = sanitize_filename(
            request.landlord_name
        )

        tenant = sanitize_filename(
            request.tenant_name
        )

        result = generate_and_save_files(
            doc,
            context,
            f"Rent_Agreement_{landlord}_{tenant}"
        )

        return result

    except Exception as e:

        print(
            "[document] Rent agreement error:",
            type(e).__name__,
            str(e)
        )

        raise HTTPException(
            status_code=500,
            detail=(
                f"Error generating rent agreement: {str(e)}"
            )
        )


# ============================================================
# Generate Sale Deed
# ============================================================

@router.post(
    "/generate-sale-deed"
)
def generate_sale_deed(
    request: SaleDeedRequest
):

    try:

        print(
            "\n[document] Sale deed request"
        )

        doc = get_template(
            "sale_deed_template.docx"
        )

        context = request.model_dump()

        seller = sanitize_filename(
            request.seller_name
        )

        buyer = sanitize_filename(
            request.buyer_name
        )

        result = generate_and_save_files(
            doc,
            context,
            f"Sale_Deed_{seller}_{buyer}"
        )

        return result

    except Exception as e:

        print(
            "[document] Sale deed error:",
            type(e).__name__,
            str(e)
        )

        raise HTTPException(
            status_code=500,
            detail=(
                f"Error generating sale deed: {str(e)}"
            )
        )


# ============================================================
# Generate Lease Deed
# ============================================================

@router.post(
    "/generate-lease-deed"
)
def generate_lease_deed(
    request: LeaseDeedRequest
):

    try:

        print(
            "\n[document] Lease deed request"
        )

        doc = get_template(
            "lease_deed_template.docx"
        )

        context = request.model_dump()

        lessor = sanitize_filename(
            request.lessor_name
        )

        lessee = sanitize_filename(
            request.lessee_name
        )

        result = generate_and_save_files(
            doc,
            context,
            f"Lease_Deed_{lessor}_{lessee}"
        )

        return result

    except Exception as e:

        print(
            "[document] Lease deed error:",
            type(e).__name__,
            str(e)
        )

        raise HTTPException(
            status_code=500,
            detail=(
                f"Error generating lease deed: {str(e)}"
            )
        )