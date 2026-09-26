from datetime import datetime
from pathlib import Path
import uuid
import re

from fastapi import APIRouter, UploadFile, File, HTTPException

from database.mongodb import MongoDB
from resume.analyzer import analyze_resume
from resume.parser import extract_resume_text
from resume.profiler import generate_profiles

router = APIRouter(prefix="/resume", tags=["Resume"])

UPLOAD_DIR = Path("uploads/resumes")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
ALLOWED_EXTENSIONS = {".pdf", ".docx"}
MAX_FILE_SIZE = 5 * 1024 * 1024

def extract_candidate_name(text: str) -> str | None:
    """
    Extract a likely candidate name from the beginning of a resume.

    The parser checks the first few non-empty lines and looks for a line
    that resembles a person's name rather than a contact detail or section
    heading.
    """
    ignored = {
        "resume",
        "curriculum vitae",
        "cv",
        "profile",
        "contact",
        "contact information",
        "technical skills",
        "skills",
        "education",
        "experience",
        "projects",
        "summary",
        "objective",
        "professional summary",
    }

    lines = [
        re.sub(r"\s+", " ", line).strip()
        for line in text.splitlines()
        if line.strip()
    ]

    for line in lines[:12]:
        candidate = line.strip(" |,-:")

        lower = candidate.lower()

        if not candidate or lower in ignored:
            continue

        if any(char.isdigit() for char in candidate):
            continue

        if "@" in candidate:
            continue

        if "http://" in lower or "https://" in lower:
            continue

        # Avoid lines that look like contact/location information.
        if "|" in candidate:
            continue

        words = candidate.split()

        if not 2 <= len(words) <= 5:
            continue

        if not all(
            re.fullmatch(r"[A-Za-z][A-Za-z.'-]*", word)
            for word in words
        ):
            continue

        return candidate.title()

    return None

def _public_profile(profile: dict | None):
    if not profile:
        return None
    profile = dict(profile)
    profile.pop("_id", None)
    return profile


@router.get("/profile")
def get_latest_profile():
    return _public_profile(MongoDB().get_latest_candidate_profile())


@router.post("/upload")
async def upload_resume(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided.")

    print(f"Received resume upload: {file.filename}")

    extension = Path(file.filename).suffix.lower()
    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Only PDF and DOCX resumes are supported.")

    unique_name = f"{uuid.uuid4()}{extension}"
    file_path = UPLOAD_DIR / unique_name

    try:
        with file_path.open("wb") as buffer:
            size = 0
            while chunk := await file.read(1024 * 1024):
                size += len(chunk)
                if size > MAX_FILE_SIZE:
                    raise HTTPException(status_code=413, detail="Resume file must be 5 MB or smaller.")
                buffer.write(chunk)

        text = extract_resume_text(str(file_path))
        if not text.strip():
            raise HTTPException(status_code=400, detail="Could not extract text from resume.")

        name = extract_candidate_name(text)

        candidate = analyze_resume(text)
        suggested_profiles = generate_profiles(candidate["skills"], candidate["projects"])
        candidate_profile = {
            "name": name,
            "filename": file.filename,
            "skills": candidate["skills"],
            "projects": candidate["projects"],
            "education": candidate["education"],
            "suggested_profiles": suggested_profiles,
            "created_at": datetime.now(),
        }
        db = MongoDB()
        db.save_candidate_profile(candidate_profile)

        return _public_profile(candidate_profile)
    
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Resume processing failed: {exc}")
    finally:
        file_path.unlink(missing_ok=True)
