# Backend

FastAPI backend for the AI Interview Question Generator project.

## Run

```bash
py -3.11 -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload
```

## Notes

- Uses SQLite by default for local development.
- Set `ALLOWED_ORIGINS` to a comma-separated list such as `http://localhost:5173,https://your-vercel-project.vercel.app`.
- If `GEMINI_API_KEY` is missing, the AI service falls back to deterministic sample outputs so the app remains usable during setup.
- Use Python 3.11 or 3.12 for local development.
