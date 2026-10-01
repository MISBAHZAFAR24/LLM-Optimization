from datetime import date as Date

from pydantic import BaseModel, ConfigDict, Field


class UsageRecord(BaseModel):
    model_config = ConfigDict(extra="forbid")

    provider: str = Field(min_length=1, max_length=100)
    model: str = Field(min_length=1, max_length=150)
    date: Date | None = None
    requests: float = Field(ge=0)
    input_tokens: float = Field(ge=0)
    output_tokens: float = Field(ge=0)
    cost: float = Field(ge=0)
    latency_ms: float = Field(ge=0)


class OptimizationRequest(BaseModel):
    records: list[UsageRecord] = Field(min_length=1, max_length=200)
