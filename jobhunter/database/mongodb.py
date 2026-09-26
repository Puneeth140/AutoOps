import os
from pathlib import Path

from dotenv import load_dotenv
from pymongo import MongoClient


# Load jobhunter/.env regardless of the directory
# from which the application is started.
ENV_FILE = Path(__file__).resolve().parents[1] / ".env"
load_dotenv(ENV_FILE)


class MongoDB:
    """MongoDB repository used by the JobHunter API."""

    def __init__(self):
        mongo_url = os.getenv("MONGODB_URI")

        if not mongo_url:
            raise RuntimeError(
                "MONGODB_URI is not configured. "
                "Add it to jobhunter/.env."
            )

        database_name = os.getenv(
            "MONGODB_DATABASE",
            "jobhunter",
        )

        self.client = MongoClient(
            mongo_url,
            serverSelectionTimeoutMS=5000,
        )

        self.db = self.client[database_name]

        self.jobs = self.db["jobs"]
        self.candidate_profiles = self.db["candidate_profiles"]

        self.jobs.create_index(
            "url",
            unique=True,
        )

        self.candidate_profiles.create_index(
            [("created_at", -1)]
        )

    def health_check(self) -> bool:
        self.client.admin.command("ping")
        return True

    def insert_job(self, job: dict):
        return self.jobs.update_one(
            {"url": job["url"]},
            {"$set": job},
            upsert=True,
        )

    def get_jobs(self, limit: int = 50):
        return list(
            self.jobs.find(
                {},
                {"_id": 0},
            )
            .sort("collected_at", -1)
            .limit(limit)
        )

    def save_candidate_profile(self, profile: dict):
        return self.candidate_profiles.insert_one(
            profile
        )

    def get_candidate_profiles(self, limit: int = 20):
        return list(
            self.candidate_profiles.find(
                {},
                {"_id": 0},
            )
            .sort("created_at", -1)
            .limit(limit)
        )

    def get_latest_candidate_profile(self):
        return self.candidate_profiles.find_one(
            {},
            {"_id": 0},
            sort=[("created_at", -1)],
        )