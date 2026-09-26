from pydantic import BaseModel, Field, HttpUrl
from typing import Optional, List
from datetime import datetime


class Job(BaseModel):
    title: str
    company: str
    location: Optional[str] = None
    salary: Optional[str] = None
    description: Optional[str] = None
    skills: List[str] = Field(default_factory=list)
    url: HttpUrl
    source: str
    posted_date: Optional[datetime] = None
    collected_at: datetime = Field(default_factory=datetime.now)
    status: str = "new"