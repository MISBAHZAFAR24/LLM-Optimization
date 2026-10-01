from fastapi import APIRouter, Depends

from app.middleware.service_auth import verify_backend_token
from app.schemas import OptimizationRequest
from app.services.cost_optimizer import optimize_costs

router = APIRouter()


@router.post("/recommendations", dependencies=[Depends(verify_backend_token)])
def get_recommendations(payload: OptimizationRequest) -> dict[str, list[dict[str, str | float]]]:
    return {"recommendations": optimize_costs(payload.records)}
