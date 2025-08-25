# Created automatically by Cursor AI (2024-12-19)

from fastapi import APIRouter
from typing import List

router = APIRouter()


@router.get("/status")
async def get_workers_status():
    # TODO: Implement worker status monitoring
    return {
        "workers": [
            {"name": "source-ingest", "status": "running"},
            {"name": "claim-extractor", "status": "idle"},
            {"name": "pricing-normalizer", "status": "idle"},
            {"name": "criteria-planner", "status": "idle"},
            {"name": "scoring-engine", "status": "idle"},
            {"name": "pros-cons-synthesizer", "status": "idle"},
            {"name": "usecase-recommender", "status": "idle"},
            {"name": "narrative-writer", "status": "idle"},
            {"name": "seo-packager", "status": "idle"},
            {"name": "exporter", "status": "idle"},
        ]
    }

