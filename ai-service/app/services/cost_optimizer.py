from app.schemas import UsageRecord
from app.services.token_analyzer import analyze_tokens


def optimize_costs(records: list[UsageRecord]) -> list[dict[str, str | float]]:
    summaries = analyze_tokens(records)
    recommendations: list[dict[str, str | float]] = []

    input_tokens = sum(record.input_tokens for record in records)
    total_tokens = input_tokens + sum(record.output_tokens for record in records)
    if total_tokens and input_tokens / total_tokens >= 0.8:
        recommendations.append(
            {
                "title": "Reduce repeated prompt tokens",
                "category": "Prompt efficiency",
                "description": (
                    f"Input tokens make up {input_tokens / total_tokens:.0%} of recorded token usage. "
                    "Review repeated instructions and context. No dollar savings are estimated."
                ),
                "estimated_monthly_savings": 0,
                "impact": "medium",
            }
        )

    models = [
        item for item in summaries
        if item["requests"] > 0
        and item["input_tokens"] + item["output_tokens"] > 0
        and item["cost"] > 0
    ]
    if len(models) > 1:
        highest_rate = max(models, key=lambda item: item["cost"] / (item["input_tokens"] + item["output_tokens"]))
        lowest_rate = min(models, key=lambda item: item["cost"] / (item["input_tokens"] + item["output_tokens"]))
        expensive_unit_cost = highest_rate["cost"] / (highest_rate["input_tokens"] + highest_rate["output_tokens"])
        cheaper_unit_cost = lowest_rate["cost"] / (lowest_rate["input_tokens"] + lowest_rate["output_tokens"])

        if cheaper_unit_cost < expensive_unit_cost:
            savings = round(
                highest_rate["cost"] * 0.25 * (1 - cheaper_unit_cost / expensive_unit_cost),
                2,
            )
            recommendations.append(
                {
                    "title": "Route compatible requests to the lower-cost model",
                    "category": "Model selection",
                    "description": (
                        f"{lowest_rate['provider']} {lowest_rate['model']} had a lower observed blended "
                        f"cost per token than {highest_rate['provider']} {highest_rate['model']}. "
                        "The estimate assumes 25% of the higher-cost model's requests are compatible "
                        "with the lower-cost model; validate output quality before routing."
                    ),
                    "estimated_monthly_savings": savings,
                    "impact": "high" if savings >= 10 else "medium" if savings else "low",
                }
            )

    slowest = max(summaries, key=lambda item: item["average_latency_ms"], default=None)
    fastest = min(summaries, key=lambda item: item["average_latency_ms"], default=None)
    if slowest and fastest and slowest["model"] != fastest["model"] and slowest["average_latency_ms"] >= 2000:
        recommendations.append(
            {
                "title": "Review high-latency model traffic",
                "category": "Latency",
                "description": (
                    f"{slowest['provider']} {slowest['model']} averaged {slowest['average_latency_ms']} ms. "
                    f"Compare its quality with the faster {fastest['provider']} {fastest['model']} "
                    "for latency-sensitive requests."
                ),
                "estimated_monthly_savings": 0,
                "impact": "medium",
            }
        )

    return recommendations[:5]
