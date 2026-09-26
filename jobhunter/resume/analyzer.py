import re
from typing import Dict, List


SKILL_DATABASE = {
    "python": ["python"],
    "java": ["java"],
    "javascript": ["javascript", "js"],
    "typescript": ["typescript", "ts"],
    "sql": ["sql", "mysql", "postgres", "postgresql"],
    "react": ["react", "react.js", "reactjs"],
    "nextjs": ["next.js", "nextjs", "next js"],
    "html": ["html", "html5"],
    "css": ["css", "css3"],
    "scss": ["scss", "sass"],
    "fastapi": ["fastapi", "fast api"],
    "rest_api": ["rest api", "rest apis", "restful api", "restful apis"],
    "mongodb": ["mongodb", "mongo db", "mongo"],
    "playwright": ["playwright"],
    "web_automation": ["web automation", "browser automation"],
    "web_scraping": ["web scraping", "web scraping", "web scraper"],
    "pandas": ["pandas"],
    "numpy": ["numpy"],
    "pytorch": ["pytorch", "torch"],
    "opencv": ["opencv"],
    "mediapipe": ["mediapipe", "media pipe"],
    "git": ["git", "github"],
    "json": ["json"],
    "postman": ["postman"],
    "computer_vision": ["computer vision"],
    "data_structures": ["data structures", "data structures & algorithms"],
    "full_stack": ["full-stack", "full stack"],
}


def detect_skills(text: str) -> List[str]:
    text_lower = text.lower()
    detected = []

    for skill, keywords in SKILL_DATABASE.items():
        for keyword in keywords:
            pattern = r"(?<!\w)" + re.escape(keyword.lower()) + r"(?!\w)"
            if re.search(pattern, text_lower):
                detected.append(skill)
                break

    return detected


def extract_projects(text: str) -> List[Dict]:
    projects = []

    project_section = re.search(
        r"PROJECTS(.*?)(EXPERIENCE & ACHIEVEMENTS|$)",
        text,
        re.IGNORECASE | re.DOTALL,
    )

    if not project_section:
        return projects

    section = project_section.group(1)

    lines = [
        line.strip(" ●")
        for line in section.splitlines()
        if line.strip()
    ]

    current_project = None

    for line in lines:

        # Project heading usually contains "|"
        if "|" in line and not line.startswith("-"):
            parts = line.split("|", 1)

            if len(parts) == 2:
                if current_project:
                    projects.append(current_project)

                current_project = {
                    "name": parts[0].strip(),
                    "technologies": [
                        tech.strip()
                        for tech in parts[1].split(",")
                    ],
                    "description": [],
                }

        elif current_project:
            current_project["description"].append(line)

    if current_project:
        projects.append(current_project)

    return projects


def detect_education(text: str) -> List[str]:
    education = []

    for line in text.splitlines():
        line = line.strip()

        if "Master of Computer Applications" in line:
            education.append("MCA")

        elif "Bachelor of Science" in line:
            education.append("BSc")

    return education


def analyze_resume(text: str) -> Dict:
    skills = detect_skills(text)
    projects = extract_projects(text)
    education = detect_education(text)

    return {
        "skills": skills,
        "projects": projects,
        "education": education,
    }