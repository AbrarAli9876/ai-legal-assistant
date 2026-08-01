import os
import re
import time

import pythoncom
import win32com.client

from docxtpl import DocxTemplate


# ============================================================
# Paths
# ============================================================

BASE_DIR = os.path.dirname(
    os.path.dirname(os.path.abspath(__file__))
)

TEMPLATE_DIR = os.path.join(
    BASE_DIR,
    "templates"
)

OUTPUT_DIR = os.path.join(
    BASE_DIR,
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

def get_template(template_name: str) -> DocxTemplate:
    """
    Loads a DOCX template from the templates directory.
    """

    template_path = os.path.join(
        TEMPLATE_DIR,
        template_name
    )

    if not os.path.exists(template_path):
        raise FileNotFoundError(
            f"Template file not found: {template_name}"
        )

    return DocxTemplate(template_path)


# ============================================================
# Filename Sanitizer
# ============================================================

def sanitize_filename(text: str) -> str:
    """
    Removes unsafe characters from generated filenames.
    """

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

    return text or "document"


# ============================================================
# DOCX → PDF Conversion
# ============================================================

def convert_docx_to_pdf(
    docx_path: str,
    pdf_path: str
):
    """
    Converts DOCX to PDF using Microsoft Word COM.

    Microsoft Word desktop must be installed and activated.
    """

    word = None
    word_document = None

    # IMPORTANT:
    # FastAPI may execute this function in a worker thread.
    # COM must be initialized separately for that thread.
    pythoncom.CoInitialize()

    try:

        docx_path = os.path.abspath(
            docx_path
        )

        pdf_path = os.path.abspath(
            pdf_path
        )

        print(
            "[notice] Starting Word..."
        )

        word = win32com.client.DispatchEx(
            "Word.Application"
        )

        word.Visible = False
        word.DisplayAlerts = 0

        print(
            "[notice] Opening DOCX..."
        )

        word_document = word.Documents.Open(
            docx_path,
            ReadOnly=True
        )

        print(
            "[notice] Converting DOCX to PDF..."
        )

        # 17 = wdFormatPDF
        word_document.SaveAs(
            pdf_path,
            FileFormat=17
        )

        if not os.path.exists(pdf_path):
            raise RuntimeError(
                "Microsoft Word did not create the PDF file."
            )

        print(
            "[notice] PDF conversion successful."
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
            except Exception as e:
                print(
                    "[notice] Warning while closing document:",
                    e
                )

        # ----------------------------------------------------
        # Close Word
        # ----------------------------------------------------

        if word is not None:

            try:
                word.Quit()
            except Exception as e:
                print(
                    "[notice] Warning while closing Word:",
                    e
                )

        # ----------------------------------------------------
        # Release COM for this thread
        # ----------------------------------------------------

        pythoncom.CoUninitialize()


# ============================================================
# Generate Notice Files
# ============================================================

def generate_notice_files(
    template_name: str,
    context: dict,
    base_filename: str
) -> dict:
    """
    Loads the requested template, fills it with the supplied
    context, creates a DOCX and attempts to create a PDF.
    """

    # --------------------------------------------------------
    # Load template
    # --------------------------------------------------------

    document = get_template(
        template_name
    )

    # --------------------------------------------------------
    # Generate unique filename
    # --------------------------------------------------------

    timestamp = int(
        time.time()
    )

    safe_filename = sanitize_filename(
        base_filename
    )

    unique_filename = (
        f"{safe_filename}_{timestamp}"
    )

    output_docx_name = (
        f"{unique_filename}.docx"
    )

    output_pdf_name = (
        f"{unique_filename}.pdf"
    )

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
    # Render DOCX
    # --------------------------------------------------------

    print(
        "[notice] Rendering template..."
    )

    document.render(
        context
    )

    document.save(
        output_docx_path
    )

    if not os.path.exists(
        output_docx_path
    ):
        raise RuntimeError(
            "DOCX file was not created."
        )

    print(
        "[notice] DOCX created:",
        output_docx_path
    )

    # --------------------------------------------------------
    # PDF conversion
    # --------------------------------------------------------

    pdf_url = None

    try:

        convert_docx_to_pdf(
            output_docx_path,
            output_pdf_path
        )

        pdf_url = (
            f"/static/outputs/"
            f"{output_pdf_name}"
        )

    except Exception as pdf_error:

        print(
            "\n===== NOTICE PDF CONVERSION ERROR ====="
        )

        print(
            type(pdf_error).__name__
        )

        print(
            str(pdf_error)
        )

        print(
            "=======================================\n"
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