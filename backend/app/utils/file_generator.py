import os
import re
import time
from docxtpl import DocxTemplate
import docx2pdf
from functools import lru_cache

# --- File Path Configuration ---
# Get the absolute path of the current file (.../backend/app/utils)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# Go up one level to the 'app/' directory
APP_DIR = os.path.dirname(BASE_DIR)

TEMPLATE_DIR = os.path.join(APP_DIR, "templates")
OUTPUT_DIR = os.path.join(APP_DIR, "static/outputs")
os.makedirs(OUTPUT_DIR, exist_ok=True)


# --- Template Loader ---
# We are removing @lru_cache to prevent the "file not found" bug
def get_template(template_name):
    """ Loads a DocxTemplate from disk. """
    template_path = os.path.join(TEMPLATE_DIR, template_name)
    if not os.path.exists(template_path):
        print(f"Template file not found at: {template_path}")
        return None
    return DocxTemplate(template_path)


# --- Filename Sanitizer ---
def sanitize_filename(text):
    text = re.sub(r'[^\w\s-]', '', text).strip()
    text = re.sub(r'[-\s]+', '-', text)
    return text


# --- Shared File Generation Helper ---
def generate_and_save_files(doc: DocxTemplate, context: dict, base_filename: str):
    """
    Renders, saves, and converts a doc template.
    Returns a dictionary of download links.
    """
    # Add a unique timestamp to prevent file locking
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
        # We will keep this conversion, as it was working for you.
        docx2pdf.convert(output_docx_path, output_pdf_path)
        pdf_url = f"/static/outputs/{output_pdf_name}"
    except Exception as pdf_error:
        print(f"Warning: PDF conversion failed: {pdf_error}")
        # This can happen if Microsoft Word is not installed or permissions are wrong
        # We still return the .docx file
        pass

    return {
        "docx_url": f"/static/outputs/{output_docx_name}",
        "pdf_url": pdf_url
    }