# AI Interview Question Generator & Mock Interview Coach

An end-to-end full-stack AI interview preparation platform built with React, Vite, Tailwind CSS, FastAPI, SQLAlchemy, and SQLite. The application helps candidates generate personalized interview questions, practice mock interviews, analyze resumes and job descriptions, save question history, and export preparation packs as PDF.

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
- Database: SQLite by default, switchable to PostgreSQL through `DATABASE_URL`
- AI: OpenAI API with a deterministic fallback mode for local setup

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
OPENAI_API_KEY=your_api_key_here
OPENAI_MODEL=gpt-4o-mini
DATABASE_URL=sqlite:///./interview_ai.db
JWT_SECRET_KEY=your_secret_key_here
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
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
