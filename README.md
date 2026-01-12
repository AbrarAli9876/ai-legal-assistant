AI Legal Assistant

## Overview
- Full-stack FastAPI + React app for legal Q&A, document drafting, FIR/notice analysis, and FAQ building.
- Includes LLM-powered services (summarizer, chatbot, embeddings) and domain-specific tools (learning hub, notice generator, lawyer recommender).
- Ships with a MySQL-backed API, Vite/Tailwind frontend, and utility scripts for training, embeddings, and data refreshes.

## Repository Layout
- backend/: FastAPI app (`app/main.py`), routers, services, database helpers, and static outputs.
- frontend/: Vite React client with feature pages/components.
- data/, database/: Local data seeds, samples, and database helpers (keep out of commits).
- scripts/: Offline utilities (training, embeddings, FAQ updates).
- deployments/: Docker Compose, NGINX, and Kubernetes manifests for containerized deploys.

## Prerequisites
- Python 3.11+ and Node.js 18+.
- MySQL instance reachable via credentials in `.env`.
- Access to required GENAI/LLM API keys (see below).

## Quickstart
### Backend (FastAPI)
1) `cd backend`
2) `python -m venv .venv` and activate it (`.venv\\Scripts\\activate` on Windows).
3) `pip install -r requirements.txt`
4) Create `backend/.env` with the variables in *Environment Variables*.
5) `uvicorn app.main:app --reload --host 0.0.0.0 --port 8000`

### Frontend (Vite React)
1) `cd frontend`
2) `npm install`
3) `npm run dev` (defaults to http://localhost:5173)

### Useful Scripts
- `python scripts/generate_embeddings.py` – build embeddings for retrieval tasks.
- `python scripts/train_summarizer.py` – train/update the summarizer model.
- `python scripts/update_faqs.py` – refresh FAQ sources.

## Environment Variables (backend/.env)
- Core: `GENAI_API_KEY` (shared default), `GOOGLE_API_KEY`
- Features: `DOCUMENT_GENERATOR_API_KEY`, `RENT_SALE_API_KEY`, `LEASE_DEED_API_KEY`, `CASE_SUMMARIZER_API_KEY`, `FIR_ANALYZER_API_KEY`, `LEGAL_NOTICE_API_KEY`, `FAQ_BUILDER_API_KEY`, `LEARNING_HUB_API_KEY`, `LEGAL_RESEARCH_API_KEY`
- Database: `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_NAME`

## Development Notes
- Static outputs write to `backend/app/static/outputs`; keep large/generated artifacts out of git.
- CORS allows the Vite dev server (localhost:5173). Adjust in `app/main.py` if your frontend host changes.
- Prefer feature-flagging API keys with `GENAI_API_KEY` to avoid drift across services.
