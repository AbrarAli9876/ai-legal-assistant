import os
from dotenv import load_dotenv

# Load the .env file
env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), '.env')
load_dotenv(dotenv_path=env_path)


def _get_api_key(*env_names, prefer_shared=True):
    """Return an API key, preferring the shared GENAI_API_KEY when set."""
    shared = os.getenv("GENAI_API_KEY") if prefer_shared else None
    if shared:
        return shared
    for name in env_names:
        value = os.getenv(name)
        if value:
            return value
    return shared


# Primary key to use across services (set GENAI_API_KEY once to avoid drift)
GENAI_API_KEY = os.getenv("GENAI_API_KEY")

# --- Get API keys with fallback to GENAI_API_KEY ---
GOOGLE_API_KEY = _get_api_key("GOOGLE_API_KEY")
DOCUMENT_GENERATOR_API_KEY = _get_api_key("DOCUMENT_GENERATOR_API_KEY")
RENT_SALE_API_KEY = _get_api_key("RENT_SALE_API_KEY")
LEASE_DEED_API_KEY = _get_api_key("LEASE_DEED_API_KEY")
CASE_SUMMARIZER_API_KEY = _get_api_key("CASE_SUMMARIZER_API_KEY")
FIR_ANALYZER_API_KEY = _get_api_key("FIR_ANALYZER_API_KEY")
LEGAL_NOTICE_API_KEY = _get_api_key("LEGAL_NOTICE_API_KEY")
FAQ_BUILDER_API_KEY = _get_api_key("FAQ_BUILDER_API_KEY")

# --- Learning Hub Keys ---
# Tool 1 & 2 (Simplifier & Evaluator)
LEARNING_HUB_API_KEY = _get_api_key("LEARNING_HUB_API_KEY")
# Tool 3 (Research Assistant)
LEGAL_RESEARCH_API_KEY = _get_api_key("LEGAL_RESEARCH_API_KEY")


def _warn_missing(name, value):
    if not value:
        print(f"Warning: {name} is not set in the environment; API calls will fail.")


# --- Validation Warnings ---
_warn_missing("GENAI_API_KEY", GENAI_API_KEY)
_warn_missing("GOOGLE_API_KEY", GOOGLE_API_KEY)
_warn_missing("DOCUMENT_GENERATOR_API_KEY", DOCUMENT_GENERATOR_API_KEY)
_warn_missing("RENT_SALE_API_KEY", RENT_SALE_API_KEY)
_warn_missing("LEASE_DEED_API_KEY", LEASE_DEED_API_KEY)
_warn_missing("CASE_SUMMARIZER_API_KEY", CASE_SUMMARIZER_API_KEY)
_warn_missing("FIR_ANALYZER_API_KEY", FIR_ANALYZER_API_KEY)
_warn_missing("LEGAL_NOTICE_API_KEY", LEGAL_NOTICE_API_KEY)
_warn_missing("FAQ_BUILDER_API_KEY", FAQ_BUILDER_API_KEY)
_warn_missing("LEARNING_HUB_API_KEY", LEARNING_HUB_API_KEY)
_warn_missing("LEGAL_RESEARCH_API_KEY", LEGAL_RESEARCH_API_KEY)