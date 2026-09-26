# AutoOps — Automated Job Discovery & Matching Platform

AutoOps is a full-stack job discovery and matching platform that automates the process of finding relevant job opportunities, analyzing a candidate's resume, and matching available jobs against the candidate's skills and profile.

The project combines a **Next.js dashboard**, **FastAPI backend**, **MongoDB**, and **Playwright-based job collection** into a single workflow.

## Features

### Automated Job Discovery
- Collects job listings from supported job sources.
- Uses Playwright for browser-based job extraction.
- Supports keyword and location-based searches.
- Stores discovered jobs in MongoDB.
- Avoids unnecessary duplicate job entries.

### Resume Analysis
- Upload resumes in **PDF** or **DOCX** format.
- Extracts resume text automatically.
- Identifies candidate skills, education, and projects.
- Builds a structured candidate profile.
- Generates relevant job profiles based on extracted skills.

### Job Matching
- Compares candidate skills with job requirements.
- Calculates a match score for discovered jobs.
- Identifies matched skills, missing skills, and keyword matches.

### Dashboard
- Job discovery
- Job matches
- Candidate profile
- Resume management
- Job statistics
- Match scores
- Search and refresh controls

## Tech Stack

**Frontend**
- Next.js
- React
- TypeScript
- CSS
- Next.js App Router

**Backend**
- Python
- FastAPI
- Uvicorn
- Pydantic

**Automation**
- Playwright
- Web scraping / browser automation

**Database**
- MongoDB
- MongoDB Atlas

**Development**
- Git
- GitHub
- VS Code
- npm

## System Architecture

```text
                         ┌─────────────────────┐
                         │      Next.js        │
                         │     Dashboard       │
                         └─────────┬───────────┘
                                   │
                                   │ REST API
                                   ▼
                         ┌─────────────────────┐
                         │       FastAPI       │
                         │      Backend        │
                         └───────┬─────┬───────┘
                                 │     │
                    ┌────────────┘     └──────────────┐
                    ▼                                 ▼
          ┌─────────────────┐               ┌─────────────────┐
          │    Playwright   │               │    Resume       │
          │  Job Collector  │               │    Analyzer     │
          └────────┬────────┘               └────────┬────────┘
                   │                                 │
                   ▼                                 ▼
          ┌─────────────────────────────────────────────────┐
          │                    MongoDB                       │
          │      Jobs • Candidate Profiles • Matches        │
          └─────────────────────────────────────────────────┘
                                   │
                                   ▼
                         ┌─────────────────────┐
                         │   Matching Engine   │
                         │ Skills + Keywords   │
                         └─────────────────────┘
```

## Project Structure

```text
AutoOps/
│
├── app/
│   ├── api.ts
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
│
├── components/
│   └── ui/
│       └── button.tsx
│
├── lib/
│   └── utils.ts
│
├── public/
│
├── jobhunter/
│   ├── main.py
│   ├── requirements.txt
│   ├── README.md
│   │
│   ├── api/
│   │   ├── profiles.py
│   │   ├── resume.py
│   │   ├── routes.py
│   │   └── __init__.py
│   │
│   ├── collectors/
│   │   ├── base.py
│   │   ├── remoteok.py
│   │   └── __init__.py
│   │
│   ├── database/
│   │   ├── mongodb.py
│   │   └── __init__.py
│   │
│   ├── job_profiles/
│   │   └── profiles.json
│   │
│   ├── matcher/
│   │   ├── job_matcher.py
│   │   ├── skill_normalizer.py
│   │   └── __init__.py
│   │
│   ├── models/
│   │   ├── job.py
│   │   ├── profile.py
│   │   └── __init__.py
│   │
│   └── resume/
│       ├── analyzer.py
│       ├── parser.py
│       ├── profiler.py
│       └── __init__.py
│
├── .gitignore
├── package.json
├── package-lock.json
├── README.md
└── ...
```

## How It Works

### 1. Resume Upload

```text
Resume
   ↓
Text Extraction
   ↓
Resume Analysis
   ↓
Skill Extraction
   ↓
Project / Education Extraction
   ↓
Candidate Profile
```

The resulting profile is stored in MongoDB and used by the matching engine.

### 2. Job Discovery

The user enters a search keyword and optional location.

Example:

```text
Keyword: Python Backend
Location: Remote
```

The backend triggers the job collector and retrieves available listings.

Collected jobs are stored in MongoDB with information such as:
- Job title
- Company
- Location
- Description
- Job URL
- Source
- Collection metadata

### 3. Skill Matching

```text
Candidate Profile
        +
Job Requirements
        ↓
Matching Engine
        ↓
Match Score
```

The matcher identifies:
- Matched skills
- Missing skills
- Keyword matches
- Match score

## API

### Health

```http
GET /
GET /health
```

Example health response:

```json
{
  "status": "healthy",
  "service": "jobhunter",
  "database": "connected"
}
```

### Jobs

```http
GET /jobs
POST /jobs/search
```

### Job Matching

```http
GET /jobs/match
```

### Resume

```http
GET /resume/profile
POST /resume/upload
```

### Profiles

Profile-related endpoints provide access to available job profiles and candidate profile information.

## Local Setup

### Prerequisites

- Python 3.11+
- Node.js
- npm
- MongoDB or MongoDB Atlas
- Git

### Backend

```bash
cd jobhunter
python -m venv .venv
```

Windows:

```bash
.venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
playwright install
```

Create `jobhunter/.env`:

```env
MONGODB_URI=your_mongodb_connection_string
MONGODB_DATABASE=jobhunter
ALLOWED_ORIGINS=http://localhost:3000
```

Start the backend:

```bash
python -m uvicorn main:app --reload
```

Backend:

```text
http://localhost:8000
```

FastAPI docs:

```text
http://localhost:8000/docs
```

### Frontend

From the project root:

```bash
npm install
```

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Start the application:

```bash
npm run dev
```

Frontend:

```text
http://localhost:3000
```

## Environment Variables

### Backend

```env
MONGODB_URI=
MONGODB_DATABASE=jobhunter
ALLOWED_ORIGINS=
```

### Frontend

```env
NEXT_PUBLIC_API_URL=
```

Never commit real environment files or database credentials.

## Database

AutoOps uses MongoDB for persistent storage.

The project separates job-hunting data into its own database:

```text
MongoDB Atlas Cluster
        │
        ├── price_tracker
        │
        └── jobhunter
```

## Deployment

```text
Next.js
   ↓
Vercel

FastAPI
   ↓
Render

MongoDB
   ↓
MongoDB Atlas
```

### Frontend

Configure:

```env
NEXT_PUBLIC_API_URL=https://your-api-url.onrender.com
```

### Backend

Build command:

```text
pip install -r requirements.txt
```

Start command:

```text
uvicorn main:app --host 0.0.0.0 --port $PORT
```

Configure the MongoDB and CORS environment variables on the backend.

## Core Workflow

```text
Upload Resume
      ↓
Analyze Candidate
      ↓
Generate Candidate Profile
      ↓
Search Jobs
      ↓
Collect Job Listings
      ↓
Store Jobs
      ↓
Match Skills
      ↓
Calculate Match Scores
      ↓
Display Relevant Opportunities
```

## What This Project Demonstrates

### Python
- Modular Python architecture
- API development
- File processing
- Data extraction
- Automation
- Environment configuration

### Backend Engineering
- FastAPI REST APIs
- MongoDB integration
- Data models
- Service separation
- CORS configuration
- Error handling

### Browser Automation
- Playwright
- Automated job collection
- Dynamic web interaction

### Full-Stack Development
- Next.js
- React
- TypeScript
- API integration
- Dashboard state management

### Automation Architecture

```text
Collect → Process → Store → Match → Present
```

## Future Improvements

- Additional job sources
- Scheduled job collection
- Email notifications
- Saved searches
- Application tracking
- Job bookmarking
- More advanced semantic matching
- Skill-gap analysis
- Resume-to-job recommendations
- Authentication and multiple user profiles

## Project Status

**Status:** Active / Portfolio Project

AutoOps is being developed as a practical demonstration of:

**Python Automation + FastAPI + Playwright + MongoDB + Next.js**

## Author

**Puneeth U**

MCA | Python | Automation | Backend | Full-Stack Development

GitHub:

https://github.com/Puneeth140

## License

This project is licensed under the MIT License.
