from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse

from pydantic import BaseModel, Field
from typing import List

from docxtpl import DocxTemplate

import os
import uuid

# Windows COM
import pythoncom
import win32com.client

# FAQ AI service
from app.services.faq_builder import generate_faqs


# ============================================================
# Paths
# ============================================================

APP_DIR = os.path.dirname(
    os.path.dirname(
        os.path.abspath(__file__)
    )
)

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
    prefix="/api/v1/faq",
    tags=["FAQBuilder"]
)


# ============================================================
# Request Models
# ============================================================

class FAQRequest(BaseModel):
    topic: str = Field(
        ...,
        min_length=3,
        description="Indian legal topic to generate FAQs for"
    )


class FAQItem(BaseModel):
    question: str
    answer: str


class FAQDownloadRequest(BaseModel):
    topic: str
    faqs: List[FAQItem]


# ============================================================
# DOCX -> PDF Conversion
# ============================================================

def convert_docx_to_pdf(
    docx_path: str,
    pdf_path: str
):
    """
    Converts a DOCX file to PDF using Microsoft Word.

    This function explicitly initializes COM because FastAPI may
    execute synchronous code inside a worker thread.

    Microsoft Word must be installed and activated.
    """

    word = None
    word_document = None

    # IMPORTANT:
    # Initialize COM for the current thread.
    pythoncom.CoInitialize()

    try:

        docx_path = os.path.abspath(
            docx_path
        )

        pdf_path = os.path.abspath(
            pdf_path
        )

        print(
            "[faq] Starting Microsoft Word"
        )

        # Create a new independent Word instance.
        word = win32com.client.DispatchEx(
            "Word.Application"
        )

        word.Visible = False
        word.DisplayAlerts = 0

        print(
            "[faq] Opening generated DOCX"
        )

        word_document = word.Documents.Open(
            docx_path,
            ReadOnly=True
        )

        print(
            "[faq] Converting DOCX to PDF"
        )

        # 17 = wdFormatPDF
        word_document.SaveAs(
            pdf_path,
            FileFormat=17
        )

        if not os.path.exists(
            pdf_path
        ):
            raise RuntimeError(
                "Microsoft Word did not create the PDF."
            )

        print(
            "[faq] PDF conversion successful"
        )

    finally:

        # ----------------------------------------------------
        # Close document
        # ----------------------------------------------------

        if word_document is not None:

            try:

                word_document.Close(
                    SaveChanges=False
                )

            except Exception as close_error:

                print(
                    "[faq] Warning while closing document:",
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
                    "[faq] Warning while closing Word:",
                    quit_error
                )

        # ----------------------------------------------------
        # Release COM
        # ----------------------------------------------------

        pythoncom.CoUninitialize()


# ============================================================
# Generate FAQs
# ============================================================

@router.post(
    "/generate-from-topic"
)
async def handle_generate_faq(
    request: FAQRequest
):

    try:

        print(
            "\n[faq] generate request"
        )

        print(
            "[faq] topic:",
            request.topic
        )

        result = await generate_faqs(
            request.topic
        )

        print(
            "[faq] generation completed"
        )

        return result

    except ValueError as e:

        print(
            "[faq] generation error:",
            str(e)
        )

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

    except Exception as e:

        print(
            "[faq] unexpected error:",
            type(e).__name__,
            str(e)
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "An unexpected error occurred "
                "while generating FAQs."
            )
        )


# ============================================================
# Generate FAQ PDF
# ============================================================

@router.post(
    "/download-pdf"
)
async def handle_download_faq_pdf(
    request: FAQDownloadRequest
):

    docx_path = None

    try:

        print(
            "\n[faq] PDF generation request"
        )

        # ----------------------------------------------------
        # Locate Template
        # ----------------------------------------------------

        template_path = os.path.join(
            TEMPLATE_DIR,
            "faq_template.docx"
        )

        if not os.path.exists(
            template_path
        ):

            raise HTTPException(
                status_code=500,
                detail="FAQ template was not found."
            )

        # ----------------------------------------------------
        # Load Template
        # ----------------------------------------------------

        doc = DocxTemplate(
            template_path
        )

        # ----------------------------------------------------
        # Template Context
        # ----------------------------------------------------

        context = {

            "topic": request.topic,

            "faqs": [
                faq.model_dump()
                for faq in request.faqs
            ]
        }

        # ----------------------------------------------------
        # Generate Unique ID
        # ----------------------------------------------------

        unique_id = str(
            uuid.uuid4()
        )

        # ----------------------------------------------------
        # Paths
        # ----------------------------------------------------

        docx_path = os.path.abspath(
            os.path.join(
                OUTPUT_DIR,
                f"{unique_id}.docx"
            )
        )

        pdf_path = os.path.abspath(
            os.path.join(
                OUTPUT_DIR,
                f"{unique_id}.pdf"
            )
        )

        # ----------------------------------------------------
        # Generate DOCX
        # ----------------------------------------------------

        print(
            "[faq] Rendering DOCX"
        )

        doc.render(
            context
        )

        doc.save(
            docx_path
        )

        if not os.path.exists(
            docx_path
        ):

            raise RuntimeError(
                "DOCX file was not created."
            )

        print(
            "[faq] DOCX created:",
            docx_path
        )

        # ----------------------------------------------------
        # Convert DOCX -> PDF
        # ----------------------------------------------------

        convert_docx_to_pdf(
            docx_path,
            pdf_path
        )

        # ----------------------------------------------------
        # Verify PDF
        # ----------------------------------------------------

        if not os.path.exists(
            pdf_path
        ):

            raise RuntimeError(
                "PDF conversion failed."
            )

        print(
            "[faq] PDF created:",
            pdf_path
        )

        # ----------------------------------------------------
        # Remove Temporary DOCX
        # ----------------------------------------------------

        try:

            if os.path.exists(
                docx_path
            ):

                os.remove(
                    docx_path
                )

                print(
                    "[faq] Temporary DOCX removed"
                )

        except Exception as cleanup_error:

            print(
                "[faq] DOCX cleanup warning:",
                cleanup_error
            )

        # ----------------------------------------------------
        # Create Safe Filename
        # ----------------------------------------------------

        safe_topic = "".join(
            character
            if character.isalnum()
            or character in (
                " ",
                "_",
                "-"
            )
            else ""
            for character in request.topic
        ).strip()

        safe_topic = safe_topic.replace(
            " ",
            "_"
        )

        if not safe_topic:

            safe_topic = "Legal_FAQ"

        user_filename = (
            f"FAQ_{safe_topic}_"
            f"{unique_id[:6]}.pdf"
        )

        # ----------------------------------------------------
        # Download URL
        # ----------------------------------------------------

        download_url = (
            f"/api/v1/faq/download/"
            f"{unique_id}"
        )

        print(
            "[faq] PDF generation completed"
        )

        return {
            "pdf_url": download_url,
            "filename": user_filename
        }

    except HTTPException:
        raise

    except Exception as e:

        print(
            "\n===== FAQ PDF ERROR ====="
        )

        print(
            "Type:",
            type(e).__name__
        )

        print(
            "Error:",
            str(e)
        )

        print(
            "=========================\n"
        )

        raise HTTPException(
            status_code=500,
            detail=(
                f"Failed to generate PDF: {str(e)}"
            )
        )


# ============================================================
# Download Generated FAQ PDF
# ============================================================

@router.get(
    "/download/{file_id}"
)
async def serve_faq_pdf(
    file_id: str
):

    # --------------------------------------------------------
    # Validate UUID
    # --------------------------------------------------------

    try:

        uuid.UUID(
            file_id
        )

    except ValueError:

        raise HTTPException(
            status_code=400,
            detail="Invalid file ID."
        )

    # --------------------------------------------------------
    # Locate PDF
    # --------------------------------------------------------

    pdf_path = os.path.abspath(
        os.path.join(
            OUTPUT_DIR,
            f"{file_id}.pdf"
        )
    )

    if not os.path.exists(
        pdf_path
    ):

        raise HTTPException(
            status_code=404,
            detail="PDF file not found."
        )

    # --------------------------------------------------------
    # Download
    # --------------------------------------------------------

    user_filename = (
        f"FAQ_{file_id}.pdf"
    )

    return FileResponse(
        path=pdf_path,
        filename=user_filename,
        media_type="application/pdf"
    )