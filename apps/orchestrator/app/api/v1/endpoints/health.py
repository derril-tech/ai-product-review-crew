# Created automatically by Cursor AI (2024-12-19)

from fastapi import APIRouter

router = APIRouter()


@router.get("/")
async def health_check():
    return {"status": "healthy", "service": "orchestrator"}

