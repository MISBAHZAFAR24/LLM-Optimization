import os
import unittest
from unittest.mock import patch

from fastapi.testclient import TestClient

os.environ["AI_SERVICE_TOKEN"] = "test-service-token"

from app.main import app
from app.schemas import UsageRecord
from app.services.token_analyzer import analyze_tokens


class TokenAnalyzerTests(unittest.TestCase):
    def test_aggregates_usage_and_weighted_latency(self) -> None:
        records = [
            UsageRecord(
                provider="OpenAI", model="gpt-4o-mini", requests=2,
                input_tokens=10, output_tokens=5, cost=0.2, latency_ms=100,
            ),
            UsageRecord(
                provider="OpenAI", model="gpt-4o-mini", requests=1,
                input_tokens=3, output_tokens=4, cost=0.1, latency_ms=200,
            ),
        ]
        self.assertEqual(analyze_tokens(records), [{
            "provider": "OpenAI",
            "model": "gpt-4o-mini",
            "requests": 3,
            "input_tokens": 13,
            "output_tokens": 9,
            "cost": 0.3,
            "average_latency_ms": 133,
        }])


class AiApiTests(unittest.TestCase):
    def setUp(self) -> None:
        self.client = TestClient(app)
        self.headers = {"Authorization": "Bearer test-service-token"}
        self.records = [{
            "provider": "OpenAI",
            "model": "gpt-4o-mini",
            "requests": 1,
            "input_tokens": 10,
            "output_tokens": 5,
            "cost": 0.1,
            "latency_ms": 100,
        }]

    def test_rejects_missing_service_token(self) -> None:
        response = self.client.post("/api/optimization/recommendations", json={"records": self.records})
        self.assertEqual(response.status_code, 401)

    def test_rejects_invalid_usage(self) -> None:
        records = [{**self.records[0], "requests": -1}]
        response = self.client.post(
            "/api/optimization/recommendations", json={"records": records}, headers=self.headers,
        )
        self.assertEqual(response.status_code, 422)

    def test_generates_recommendations_without_cloud_api_key(self) -> None:
        records = [
            {
                **self.records[0],
                "provider": "Provider A",
                "model": "expensive-model",
                "cost": 1.0,
                "input_tokens": 1000,
                "output_tokens": 100,
                "requests": 10,
            },
            {
                **self.records[0],
                "provider": "Provider B",
                "model": "cheap-model",
                "cost": 0.1,
                "input_tokens": 1000,
                "output_tokens": 100,
                "requests": 10,
            },
        ]
        with patch.dict("os.environ", {"AI_SERVICE_TOKEN": "test-service-token"}, clear=True):
            response = self.client.post(
                "/api/optimization/recommendations",
                json={"records": records},
                headers=self.headers,
            )
        self.assertEqual(response.status_code, 200)
        recommendation = next(
            item for item in response.json()["recommendations"]
            if item["category"] == "Model selection"
        )
        self.assertEqual(recommendation["category"], "Model selection")
        self.assertEqual(recommendation["estimated_monthly_savings"], 0.23)
