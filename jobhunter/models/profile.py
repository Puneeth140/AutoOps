from pydantic import BaseModel, Field
from typing import List, Optional


class SearchProfile(BaseModel):
    name: str
    keywords: List[str] = Field(default_factory=list)
    locations: List[str] = Field(default_factory=list)
    min_salary: Optional[int] = None
    max_salary: Optional[int] = None
    experience: Optional[str] = None
    remote: bool = False
    active: bool = True