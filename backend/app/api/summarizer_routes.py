from fastapi import (
    APIRouter,
    HTTPException,
    UploadFile,
    File
)

import io
import os
import re
import time

import pypdf
import docx

from docxtpl import DocxTemplate

import pythoncom
import win32com.client


# ============================================================
# Import Summarizer Service
# ============================================================

from app.services.case_summarizer import (
    summarize_case
)


# ============================================================
# Router
# ============================================================

router = APIRouter(
    prefix="/api/v1/summarizer",
    tags=["CaseSummarizer"]
)


# ============================================================
# Paths
# ============================================================

BASE_DIR = os.path.dirname(
    os.path.abspath(__file__)
)

APP_DIR = os.path.dirname(
    BASE_DIR
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
# Template Loader
# ============================================================

def get_template(
    template_name: str
):

    template_path = os.path.join(
        TEMPLATE_DIR,
        template_name
    )

    if not os.path.exists(
        template_path
    ):

        print(
            "[summarizer] template not found:",
            template_path
        )

        return None

    return DocxTemplate(
        template_path
    )


# ============================================================
# Filename Sanitization
# ============================================================

def sanitize_filename(
    text: str
) -> str:

    if not text:

        return "case"

    text = re.sub(
        r"[^\w\s-]",
        "",
        text
    ).strip()

    text = re.sub(
        r"[-\s]+",
        "-",
        text
    )

    if not text:

        return "case"

    return text[:100]


# ============================================================
# PDF Text Extraction
# ============================================================

def extract_text_from_pdf(
    file_stream: io.BytesIO
) -> str:

    try:

        reader = pypdf.PdfReader(
            file_stream
        )

        text_parts = []

        for page in reader.pages:

            page_text = (
                page.extract_text()
                or ""
            )

            text_parts.append(
                page_text
            )

        text = "\n".join(
            text_parts
        )

        return text.replace(
            "\x00",
            ""
        )

    except Exception as e:

        print(
            "[summarizer] PDF extraction error:",
            str(e)
        )

        raise HTTPException(
            status_code=400,
            detail=f"PDF Error: {str(e)}"
        )


# ============================================================
# DOCX Text Extraction
# ============================================================

def extract_text_from_docx(
    file_stream: io.BytesIO
) -> str:

    try:

        document = docx.Document(
            file_stream
        )

        paragraphs = []

        for paragraph in document.paragraphs:

            if paragraph.text:

                paragraphs.append(
                    paragraph.text
                )

        return "\n".join(
            paragraphs
        ).replace(
            "\x00",
            ""
        )

    except Exception as e:

        print(
            "[summarizer] DOCX extraction error:",
            str(e)
        )

        raise HTTPException(
            status_code=400,
            detail=f"DOCX Error: {str(e)}"
        )


# ============================================================
# DOCX → PDF
# ============================================================

def convert_docx_to_pdf(
    docx_path: str,
    pdf_path: str
):
    """
    Converts DOCX to PDF using Microsoft Word.

    Microsoft Word desktop must be installed
    and activated on Windows.
    """

    pythoncom.CoInitialize()

    word = None

    word_document = None

    try:

        docx_path = os.path.abspath(
            docx_path
        )

        pdf_path = os.path.abspath(
            pdf_path
        )

        print(
            "[summarizer] starting Word PDF conversion"
        )

        word = (
            win32com.client.DispatchEx(
                "Word.Application"
            )
        )

        word.Visible = False

        word.DisplayAlerts = 0

        word_document = (
            word.Documents.Open(
                docx_path,
                ReadOnly=True
            )
        )

        # 17 = PDF

        word_document.SaveAs(
            pdf_path,
            FileFormat=17
        )

        print(
            "[summarizer] PDF conversion complete"
        )

    finally:

        if word_document is not None:

            try:

                word_document.Close(
                    False
                )

            except Exception:
                pass

        if word is not None:

            try:

                word.Quit()

            except Exception:
                pass

        pythoncom.CoUninitialize()


# ============================================================
# Generate Summary DOCX + PDF
# ============================================================

def generate_and_save_files(
    doc: DocxTemplate,
    context: dict,
    base_filename: str
):

    timestamp = int(
        time.time()
    )

    unique_filename = (
        f"{base_filename}_{timestamp}"
    )

    output_docx_name = (
        f"{unique_filename}.docx"
    )

    output_pdf_name = (
        f"{unique_filename}.pdf"
    )

    output_docx_path = (
        os.path.abspath(
            os.path.join(
                OUTPUT_DIR,
                output_docx_name
            )
        )
    )

    output_pdf_path = (
        os.path.abspath(
            os.path.join(
                OUTPUT_DIR,
                output_pdf_name
            )
        )
    )


    # --------------------------------------------------------
    # Generate DOCX
    # --------------------------------------------------------

    print(
        "[summarizer] generating summary DOCX"
    )

    doc.render(
        context
    )

    doc.save(
        output_docx_path
    )

    if not os.path.exists(
        output_docx_path
    ):

        raise RuntimeError(
            "Summary DOCX was not created."
        )

    print(
        "[summarizer] DOCX created:",
        output_docx_path
    )


    # --------------------------------------------------------
    # Generate PDF
    # --------------------------------------------------------

    pdf_url = None

    try:

        convert_docx_to_pdf(
            output_docx_path,
            output_pdf_path
        )

        if os.path.exists(
            output_pdf_path
        ):

            pdf_url = (
                f"/static/outputs/"
                f"{output_pdf_name}"
            )

        else:

            print(
                "[summarizer] PDF file "
                "was not created."
            )

    except Exception as pdf_error:

        print(
            "\n===== SUMMARY PDF ERROR ====="
        )

        print(
            type(pdf_error).__name__
        )

        print(
            str(pdf_error)
        )

        print(
            "=============================\n"
        )


    # --------------------------------------------------------
    # Return URLs
    # --------------------------------------------------------

    return {

        "docx_url": (
            f"/static/outputs/"
            f"{output_docx_name}"
        ),

        "pdf_url": pdf_url
    }


# ============================================================
# Upload + Summarize Endpoint
# ============================================================

@router.post(
    "/upload-and-summarize"
)
async def handle_summarize_upload(
    file: UploadFile = File(...)
):

    print(
        "\n[summarizer] request start"
    )


    # ========================================================
    # Validate File
    # ========================================================

    if not file.filename:

        raise HTTPException(
            status_code=400,
            detail="No file was provided."
        )


    try:

        contents = await file.read()

        if not contents:

            raise HTTPException(
                status_code=400,
                detail="Uploaded file is empty."
            )


        # ----------------------------------------------------
        # File size
        # ----------------------------------------------------

        MAX_FILE_SIZE = (
            20 * 1024 * 1024
        )

        if len(contents) > MAX_FILE_SIZE:

            raise HTTPException(
                status_code=413,
                detail=(
                    "File is too large. "
                    "Maximum size is 20 MB."
                )
            )


        file_stream = io.BytesIO(
            contents
        )


        # ----------------------------------------------------
        # Determine file type
        # ----------------------------------------------------

        content_type = (
            file.content_type
            or ""
        ).lower()

        filename = (
            file.filename
            or ""
        ).lower()


        # ----------------------------------------------------
        # PDF
        # ----------------------------------------------------

        if (
            content_type
            == "application/pdf"
            or filename.endswith(".pdf")
        ):

            print(
                "[summarizer] reading PDF"
            )

            document_text = (
                extract_text_from_pdf(
                    file_stream
                )
            )


        # ----------------------------------------------------
        # DOCX
        # ----------------------------------------------------

        elif (
            "wordprocessingml"
            in content_type
            or filename.endswith(".docx")
        ):

            print(
                "[summarizer] reading DOCX"
            )

            document_text = (
                extract_text_from_docx(
                    file_stream
                )
            )


        # ----------------------------------------------------
        # TXT
        # ----------------------------------------------------

        elif (
            content_type.startswith(
                "text/"
            )
            or filename.endswith(".txt")
        ):

            print(
                "[summarizer] reading text"
            )

            try:

                document_text = (
                    contents
                    .decode("utf-8")
                    .replace(
                        "\x00",
                        ""
                    )
                )

            except UnicodeDecodeError:

                document_text = (
                    contents
                    .decode(
                        "utf-8",
                        errors="ignore"
                    )
                    .replace(
                        "\x00",
                        ""
                    )
                )


        # ----------------------------------------------------
        # Unsupported
        # ----------------------------------------------------

        else:

            raise HTTPException(
                status_code=400,
                detail=(
                    "Invalid file type. "
                    "Upload PDF, DOCX or TXT."
                )
            )


        if not document_text.strip():

            raise HTTPException(
                status_code=400,
                detail=(
                    "No readable text could "
                    "be extracted from the file."
                )
            )


    except HTTPException:
        raise

    except Exception as e:

        print(
            "[summarizer] file error:",
            str(e)
        )

        raise HTTPException(
            status_code=500,
            detail=(
                f"File processing error: {str(e)}"
            )
        )


    # ========================================================
    # Limit Input Size
    # ========================================================

    MAX_CHARS = 400000

    if len(
        document_text
    ) > MAX_CHARS:

        print(
            "[summarizer] truncating text:",
            len(document_text),
            "→",
            MAX_CHARS
        )

        document_text = (
            document_text[
                :MAX_CHARS
            ]
        )


    # ========================================================
    # Call Case Summarizer Service
    # ========================================================

    try:

        print(
            "[summarizer] calling summarizer service"
        )

        summary_data = await summarize_case(
            document_text
        )

        print(
            "[summarizer] model response OK"
        )


    except ValueError as e:

        print(
            "[summarizer] AI error:",
            str(e)
        )

        raise HTTPException(
            status_code=500,
            detail=f"AI Error: {str(e)}"
        )


    except Exception as e:

        print(
            "[summarizer] unexpected AI error:",
            str(e)
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "An unexpected error occurred "
                "while summarizing the case."
            )
        )


    # ========================================================
    # Load Summary Template
    # ========================================================

    try:

        doc = get_template(
            "summary_template.docx"
        )

        if doc is None:

            raise HTTPException(
                status_code=500,
                detail=(
                    "summary_template.docx "
                    "was not found."
                )
            )


        # ====================================================
        # Template Context
        # ====================================================

        case_title = (
            summary_data.get(
                "case_title_info",
                {}
            )
        )

        parties = (
            summary_data.get(
                "parties_involved",
                {}
            )
        )

        dates = (
            summary_data.get(
                "dates",
                {}
            )
        )


        template_context = {

            "case_name":
                case_title.get(
                    "case_name",
                    ""
                ),

            "case_number":
                case_title.get(
                    "case_number",
                    ""
                ),

            "court_name":
                case_title.get(
                    "court_name",
                    ""
                ),

            "jurisdiction":
                case_title.get(
                    "jurisdiction",
                    ""
                ),

            "citations":
                case_title.get(
                    "citations",
                    ""
                ),


            "petitioner":
                parties.get(
                    "petitioner",
                    ""
                ),

            "respondent":
                parties.get(
                    "respondent",
                    ""
                ),

            "adv_petitioner":
                parties.get(
                    "advocates_petitioner",
                    ""
                ),

            "adv_respondent":
                parties.get(
                    "advocates_respondent",
                    ""
                ),


            "judgment_date":
                dates.get(
                    "date_of_judgment",
                    ""
                ),

            "filing_date":
                dates.get(
                    "date_of_filing",
                    ""
                ),


            "sections":
                summary_data.get(
                    "sections_invoked",
                    ""
                ),

            "issues":
                summary_data.get(
                    "legal_issues",
                    []
                ),

            "final_judgment":
                summary_data.get(
                    "final_judgment",
                    ""
                )
        }


        # ====================================================
        # Filename
        # ====================================================

        safe_case_name = (
            sanitize_filename(
                template_context[
                    "case_name"
                ]
            )
        )

        base_filename = (
            f"summary_{safe_case_name}"
        )


        # ====================================================
        # Generate Files
        # ====================================================

        download_links = (
            generate_and_save_files(
                doc,
                template_context,
                base_filename
            )
        )


        # ====================================================
        # Successful Response
        # ====================================================

        return {

            "summary_data":
                summary_data,

            "download_links":
                download_links
        }


    except HTTPException:
        raise


    except Exception as e:

        print(
            "\n===== SUMMARY GENERATION ERROR ====="
        )

        print(
            type(e).__name__
        )

        print(
            str(e)
        )

        print(
            "====================================\n"
        )

        raise HTTPException(
            status_code=500,
            detail=(
                f"Summary document generation "
                f"failed: {str(e)}"
            )
        )