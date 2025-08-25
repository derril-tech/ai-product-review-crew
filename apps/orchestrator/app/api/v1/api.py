# Created automatically by Cursor AI (2024-12-19)

from fastapi import APIRouter

from app.api.v1.endpoints import reviews, workers, health

api_router = APIRouter()

api_router.include_router(health.router, prefix="/health", tags=["health"])
api_router.include_router(reviews.router, prefix="/reviews", tags=["reviews"])
api_router.include_router(workers.router, prefix="/workers", tags=["workers"])

