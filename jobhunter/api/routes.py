from fastapi import APIRouter, Query, HTTPException

from collectors.remoteok import RemoteOKCollector
from database.mongodb import MongoDB
from matcher.job_matcher import calculate_job_match


router = APIRouter(prefix="/jobs", tags=["Jobs"])

database = MongoDB()
collector = RemoteOKCollector()


@router.post("/search")
async def search_jobs(
    keyword: str = Query(..., min_length=1),
    location: str = Query(""),
):
    """Search RemoteOK and upsert normalized jobs into MongoDB."""
    jobs = await collector.search(keyword=keyword, location=location)

    new_jobs = 0

    for job in jobs:
        result = database.insert_job(job.model_dump(mode="json"))
        if result.upserted_id:
            new_jobs += 1

    return {
        "source": "remoteok",
        "keyword": keyword,
        "location": location,
        "found": len(jobs),
        "new_jobs": new_jobs,
    }


@router.get("/")
def get_jobs(limit: int = Query(50, ge=1, le=200)):
    return database.get_jobs(limit)


@router.get("/match")
def match_jobs(limit: int = Query(20, ge=1, le=100)):
    """Rank stored jobs against the latest uploaded resume profile."""
    profile = database.get_latest_candidate_profile()

    if not profile:
        raise HTTPException(
            status_code=404,
            detail="No resume profile found. Upload a resume first.",
        )

    candidate_skills = profile.get("skills", [])
    jobs = database.get_jobs(limit=200)

    ranked = []
    for job in jobs:
        result = calculate_job_match(candidate_skills, job)
        ranked.append({
            "title": job.get("title"),
            "company": job.get("company"),
            "location": job.get("location"),
            "url": job.get("url"),
            "source": job.get("source"),
            **result,
        })

    ranked.sort(key=lambda item: item["match_score"], reverse=True)

    return {
        "profile_skills": candidate_skills,
        "total_jobs_considered": len(ranked),
        "matches": ranked[:limit],
    }
