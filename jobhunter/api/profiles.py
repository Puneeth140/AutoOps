from fastapi import APIRouter
from models.profile import SearchProfile
from database.mongodb import MongoDB

router = APIRouter(
    prefix="/profiles",
    tags=["Profiles"]
)

database = MongoDB()


@router.post("/")
def create_profile(profile: SearchProfile):
    profile_data = profile.model_dump()

    result = database.candidate_profiles.insert_one(
        profile_data
    )

    return {
        "message": "Profile created",
        "id": str(result.inserted_id),
        "profile": profile_data
    }


@router.get("/")
def get_profiles():
    return database.get_candidate_profiles()