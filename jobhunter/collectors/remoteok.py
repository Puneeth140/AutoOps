import httpx
from typing import List

from models.job import Job
from collectors.base import JobCollector


class RemoteOKCollector(JobCollector):
    API_URL = "https://remoteok.com/api"

    async def search(self, keyword: str, location: str = "") -> List[Job]:
        async with httpx.AsyncClient(
            headers={"User-Agent": "JobHunter/1.0"},
            timeout=20.0,
        ) as client:
            response = await client.get(self.API_URL)
            response.raise_for_status()
            data = response.json()

        keyword = keyword.strip().lower()
        location = location.strip().lower()

        jobs = []

        for item in data:
            if not isinstance(item, dict):
                continue

            title = item.get("position") or ""
            company = item.get("company") or ""
            description = item.get("description") or ""
            raw_tags = item.get("tags") or []
            tags = [str(tag).strip() for tag in raw_tags if str(tag).strip()]
            url = item.get("url")

            searchable_text = (
                f"{title} {company} {description} {' '.join(tags)}"
            ).lower()

            if keyword and keyword not in searchable_text:
                continue

            # RemoteOK is a remote-only source. A non-empty location
            # is treated as an additional text filter rather than a
            # physical-location constraint.
            if location and location not in searchable_text:
                continue

            if not url:
                continue

            jobs.append(
                Job(
                    title=title,
                    company=company,
                    location="Remote",
                    description=description,
                    skills=tags,
                    url=url,
                    source="remoteok",
                )
            )

        return jobs
