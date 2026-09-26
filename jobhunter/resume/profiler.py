import json
from pathlib import Path
from typing import Dict, List


def load_profiles() -> list:
    """Load job-profile definitions from profiles.json."""

    profile_path = (
        Path(__file__).parent.parent
        / "job_profiles"
        / "profiles.json"
    )

    if not profile_path.exists():
        raise FileNotFoundError(
            f"Profile configuration not found: {profile_path}"
        )

    with open(profile_path, "r", encoding="utf-8") as file:
        data = json.load(file)

    return data["profiles"]


def build_project_text(projects: List[Dict]) -> str:
    """Combine project information into searchable text."""

    parts = []

    for project in projects:
        parts.append(project.get("name", ""))

        parts.extend(
            project.get("technologies", [])
        )

        parts.extend(
            project.get("description", [])
        )

    return " ".join(parts).lower()


def calculate_profile_score(
    detected_skills: List[str],
    projects: List[Dict],
    rules: Dict,
) -> Dict:
    """
    Calculate a profile match and return the evidence
    behind the score.
    """

    detected = set(detected_skills)

    required = set(
        rules.get("required_skills", [])
    )

    bonus = set(
        rules.get("bonus_skills", [])
    )

    keywords = set(
        rules.get("project_keywords", [])
    )

    # -------------------------
    # Required skills
    # -------------------------

    required_matches = sorted(
        detected.intersection(required)
    )

    if required:
        core_score = (
            len(required_matches)
            / len(required)
        ) * 60
    else:
        core_score = 0

    # -------------------------
    # Bonus skills
    # -------------------------

    bonus_matches = sorted(
        detected.intersection(bonus)
    )

    if bonus:
        bonus_score = (
            len(bonus_matches)
            / len(bonus)
        ) * 15
    else:
        bonus_score = 0

    # -------------------------
    # Project evidence
    # -------------------------

    project_text = build_project_text(projects)

    matched_keywords = sorted(
        keyword
        for keyword in keywords
        if keyword.lower() in project_text
    )

    if keywords:
        project_score = (
            len(matched_keywords)
            / len(keywords)
        ) * 25
    else:
        project_score = 0

    # -------------------------
    # Supporting projects
    # -------------------------

    supporting_projects = []

    for project in projects:

        project_content = " ".join([
            project.get("name", ""),
            " ".join(
                project.get("technologies", [])
            ),
            " ".join(
                project.get("description", [])
            ),
        ]).lower()

        project_matches = [
            keyword
            for keyword in keywords
            if keyword.lower() in project_content
        ]

        if project_matches:
            supporting_projects.append({
                "name": project.get(
                    "name",
                    "Unknown Project"
                ),
                "evidence": sorted(
                    project_matches
                ),
            })

    # -------------------------
    # Final score
    # -------------------------

    total_score = (
        core_score
        + bonus_score
        + project_score
    )

    return {
        "match_score": round(
            min(total_score, 100),
            2
        ),
        "matched_skills": sorted(
            required_matches + bonus_matches
        ),
        "project_evidence": matched_keywords,
        "supporting_projects": supporting_projects,
    }


def generate_profiles(
    detected_skills: List[str],
    projects: List[Dict],
) -> List[Dict]:
    """Generate explainable job-profile suggestions."""

    profiles = []

    available_profiles = load_profiles()

    for rules in available_profiles:

        profile_name = rules["name"]

        result = calculate_profile_score(
            detected_skills,
            projects,
            rules,
        )

        if result["match_score"] <= 0:
            continue

        profiles.append({
            "profile": profile_name,
            **result,
        })

    profiles.sort(
        key=lambda item: item["match_score"],
        reverse=True,
    )

    return profiles

