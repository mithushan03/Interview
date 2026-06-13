# AI Interview Question Generator & Mock Interview Coach

An end-to-end full-stack AI interview preparation platform built with React, Vite, Tailwind CSS, FastAPI, and SQLAlchemy. The application helps candidates generate personalized interview questions, practice mock interviews, analyze resumes and job descriptions, save question history, and export preparation packs as PDF.

## Features

- AI-generated interview questions by role, difficulty, and question type
- Resume PDF upload with extracted-text-based question generation
- Job description paste or PDF upload with targeted interview prep
- Mock interview mode with scoring, strengths, weaknesses, missing points, and improved answers
- Coding-question support with problem statements, examples, constraints, complexity, and Python solutions
- Dashboard metrics, saved questions, and full history tracking
- JWT authentication and protected frontend routes
- PDF export for generated question sets

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, React Router, Axios, Lucide React
- Backend: FastAPI, SQLAlchemy, Pydantic, JWT auth, ReportLab, PyMuPDF
- Database: SQLite by default, PostgreSQL in production through `DATABASE_URL`
- AI: Gemini API with a deterministic fallback mode when no API key is configured

## Screenshots

- Add screenshots of the landing page, dashboard, question generator, and mock interview flow here.

## Installation

### Backend setup

```bash
cd backend
py -3.11 -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload
```

### Frontend setup

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:5173` and calls `http://127.0.0.1:8000/api` by default.

Use Python 3.11 or 3.12 for the backend. Python 3.14 on this machine did not have a compatible `pydantic-core` wheel during verification.

## Production Deployment

Recommended setup:

- Frontend: Vercel
- Backend: Render Web Service
- Database: Render Postgres

### Render backend

- Root Directory: `backend`
- Build Command: `pip install -r requirements.txt`
- Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Python version: `3.11.9`

Required environment variables:

```env
DATABASE_URL=postgresql://...
GEMINI_API_KEY=your_api_key_here
GEMINI_MODEL=gemini-2.5-flash
JWT_SECRET_KEY=your_secret_here
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=0
ALLOWED_ORIGINS=https://your-vercel-project.vercel.app
```

Health check:

- `https://your-render-service.onrender.com/api/health`

### Vercel frontend

- Root Directory: `frontend`
- Build Command: `npm run build`
- Output Directory: `dist`

Required environment variable:

```env
VITE_API_URL=https://your-render-service.onrender.com/api
```

After changing `VITE_API_URL`, redeploy the Vercel project. Vite reads environment variables at build time.

## API Endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/questions/generate`
- `POST /api/questions/save`
- `POST /api/resume/upload`
- `POST /api/resume/generate-questions`
- `POST /api/job-description/generate-questions`
- `POST /api/job-description/upload`
- `POST /api/mock/start`
- `POST /api/mock/evaluate`
- `GET /api/history`
- `GET /api/dashboard`
- `GET /api/saved-questions`
- `POST /api/export/pdf`

## Environment Variables

Base values are in [backend/.env.example](/w:/Linkdin/Interview/backend/.env.example).

```env
GEMINI_API_KEY=your_api_key_here
GEMINI_MODEL=gemini-2.5-flash
DATABASE_URL=sqlite:///./interview_ai.db
JWT_SECRET_KEY=your_secret_here
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=0
ALLOWED_ORIGINS=http://localhost:5173,https://your-vercel-project.vercel.app
```

## Docker Compose

```bash
docker compose up
```

## Future Improvements

- Voice-based mock interview
- Speech-to-text answer input
- Webcam interview simulation
- LinkedIn profile analysis
- GitHub profile analysis
- Interview performance analytics
- Admin dashboard
- Multi-language interview support

## License

MIT
