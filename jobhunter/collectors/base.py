from abc import ABC, abstractmethod
from typing import List

from models.job import Job


class JobCollector(ABC):

    @abstractmethod
    async def search(self, keyword: str, location: str) -> List[Job]:
        """
        Search a job source and return normalized Job objects.
        """
        pass