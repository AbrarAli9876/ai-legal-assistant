# ============================================================
# Imports
# ============================================================

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

import os


# ============================================================
# API Routers
# ============================================================

from app.api import chatbot_routes
from app.api import document_routes
from app.api import summarizer_routes
from app.api import analyzer_routes
from app.api import notice_routes
from app.api import learning_routes
from app.api import faq_routes
from app.api import auth_routes


# ============================================================
# FastAPI Application
# ============================================================

app = FastAPI(
    title="KanoonAI API",
    description="Backend API for the KanoonAI Legal Assistant",
    version="1.0.0"
)


# ============================================================
# CORS Configuration
# ============================================================

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


# ============================================================
# Static Files Configuration
# ============================================================

APP_DIR = os.path.dirname(
    os.path.abspath(__file__)
)


STATIC_DIR = os.path.join(
    APP_DIR,
    "static"
)


OUTPUT_DIR = os.path.join(
    STATIC_DIR,
    "outputs"
)


# Create directories if they do not exist

os.makedirs(
    STATIC_DIR,
    exist_ok=True
)

os.makedirs(
    OUTPUT_DIR,
    exist_ok=True
)


# Mount static directory

app.mount(
    "/static",
    StaticFiles(
        directory=STATIC_DIR
    ),
    name="static"
)


# ============================================================
# Root Endpoint
# ============================================================

@app.get("/")
async def read_root():

    return {
        "message": "Welcome to the KanoonAI API!",
        "status": "running"
    }


# ============================================================
# Register API Routers
# ============================================================

app.include_router(
    chatbot_routes.router
)

app.include_router(
    document_routes.router
)

app.include_router(
    summarizer_routes.router
)

app.include_router(
    analyzer_routes.router
)

app.include_router(
    notice_routes.router
)

app.include_router(
    learning_routes.router
)

app.include_router(
    faq_routes.router
)

app.include_router(
    auth_routes.router
)


# ============================================================
# Debug: Display Registered Routes
# ============================================================

print(
    "\n========== KANOONAI REGISTERED ROUTES =========="
)

for route in app.routes:

    methods = getattr(
        route,
        "methods",
        None
    )

    if methods:

        print(
            f"{','.join(sorted(methods)):15} {route.path}"
        )

    else:

        print(
            f"{'MOUNT':15} {route.path}"
        )


print(
    "================================================\n"
)