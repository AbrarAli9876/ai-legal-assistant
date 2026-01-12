# --- Imports ---
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

# Import your API routers
from app.api import chatbot_routes
from app.api import document_routes
from app.api import summarizer_routes
from app.api import analyzer_routes
from app.api import notice_routes
from app.api import learning_routes
from app.api import faq_routes
from app.api import auth_routes  # <-- 1. IMPORT THE NEW ROUTER

# --- App Initialization ---
app = FastAPI(title="KanoonAI API")

# --- CORS Configuration ---
# Allow both localhost and 127.0.0.1 to avoid "Failed to fetch" from browser when the
# frontend is served on a different host alias of the same machine.
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Mount Static Files Directory ---
APP_DIR = os.path.dirname(os.path.abspath(__file__))
STATIC_DIR = os.path.join(APP_DIR, "static")
os.makedirs(STATIC_DIR, exist_ok=True)

# --- 1. CREATE THE OUTPUTS SUB-DIRECTORY ---
OUTPUT_DIR = os.path.join(STATIC_DIR, "outputs")
os.makedirs(OUTPUT_DIR, exist_ok=True)

app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")


# --- API Endpoints ---
@app.get("/")
async def read_root():
    """
    Root endpoint for the API.
    Provides a simple welcome message.
    """
    return {"message": "Welcome to the KanoonAI API!"}

# --- Include all API routers ---
app.include_router(chatbot_routes.router)
app.include_router(document_routes.router)
app.include_router(summarizer_routes.router)
app.include_router(analyzer_routes.router)
app.include_router(notice_routes.router)
app.include_router(learning_routes.router)
app.include_router(faq_routes.router)
app.include_router(auth_routes.router) # <-- 2. INCLUDE THE NEW ROUTER