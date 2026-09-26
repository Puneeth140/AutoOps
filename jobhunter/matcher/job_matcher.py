from typing import Dict, List, Set

from matcher.skill_normalizer import SKILL_ALIASES, normalize_skill


def calculate_job_match(
    candidate_skills: List[str],
    job: Dict,
) -> Dict:

    candidate_skill_set: Set[str] = {
        normalize_skill(skill)
        for skill in candidate_skills
    }

    job_skill_set: Set[str] = {
        normalize_skill(skill)
        for skill in job.get("skills", [])
    }

    matched_skills = sorted(
        candidate_skill_set & job_skill_set
    )

    missing_skills = sorted(
        job_skill_set - candidate_skill_set
    )

    if job_skill_set:
        skill_score = (
            len(matched_skills) / len(job_skill_set)
        ) * 70
    else:
        skill_score = 0

    job_text = " ".join([
        job.get("title", ""),
        job.get("description", ""),
    ]).lower()

    keyword_matches = []

    for skill in candidate_skill_set:
        aliases = SKILL_ALIASES.get(skill, {skill})
        if any(alias in job_text for alias in aliases):
            keyword_matches.append(skill)

    keyword_score = min(
        len(keyword_matches) * 5,
        30
    )

    total_score = min(
        skill_score + keyword_score,
        100
    )

    return {
        "match_score": round(total_score, 2),
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "keyword_matches": sorted(keyword_matches),
    }