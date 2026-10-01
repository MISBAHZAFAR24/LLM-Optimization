from collections import defaultdict

from app.schemas import UsageRecord


def analyze_tokens(records: list[UsageRecord]) -> list[dict[str, str | float]]:
    groups: dict[tuple[str, str], dict[str, float]] = defaultdict(
        lambda: {
            "requests": 0,
            "input_tokens": 0,
            "output_tokens": 0,
            "cost": 0,
            "weighted_latency_ms": 0,
        }
    )
    for record in records:
        group = groups[(record.provider, record.model)]
        group["requests"] += record.requests
        group["input_tokens"] += record.input_tokens
        group["output_tokens"] += record.output_tokens
        group["cost"] += record.cost
        group["weighted_latency_ms"] += record.latency_ms * record.requests

    summaries: list[dict[str, str | float]] = []
    for (provider, model), group in groups.items():
        requests = group["requests"]
        summaries.append(
            {
                "provider": provider,
                "model": model,
                "requests": requests,
                "input_tokens": group["input_tokens"],
                "output_tokens": group["output_tokens"],
                "cost": round(group["cost"], 6),
                "average_latency_ms": round(group["weighted_latency_ms"] / requests) if requests else 0,
            }
        )
    return summaries
