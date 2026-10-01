from fastapi import APIRouter

from app.controllers.optimization_controller import router as controller_router

router = APIRouter()
router.include_router(controller_router)
