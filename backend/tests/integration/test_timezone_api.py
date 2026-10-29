import os

import httpx
import pytest


pytestmark = pytest.mark.integration


API_BASE_URL = os.getenv("CADENCE_API_BASE_URL", "http://127.0.0.1:8000")
GOALS_PATH = os.getenv("CADENCE_GOALS_PATH", "/api/v1/goals")
TEST_TOKEN = os.getenv("CADENCE_TEST_TOKEN")


if not TEST_TOKEN:
    pytest.skip(
        "Set CADENCE_TEST_TOKEN before running integration tests.",
        allow_module_level=True,
    )


def get_daily(client: httpx.Client, timezone: str | None) -> httpx.Response:
    headers = {"Authorization": f"Bearer {TEST_TOKEN}"}

    if timezone is not None:
        headers["X-Timezone"] = timezone

    return client.get(f"{GOALS_PATH}/progress/daily", headers=headers)


@pytest.mark.parametrize(
    ("header", "expected"),
    [
        ("Europe/Warsaw", "Europe/Warsaw"),
        ("America/New_York", "America/New_York"),
        ("Pacific/Kiritimati", "Pacific/Kiritimati"),
        ("not-a-timezone", "UTC"),
        (None, "UTC"),
    ],
)
def test_daily_progress_reports_requested_timezone(header, expected):
    with httpx.Client(base_url=API_BASE_URL, timeout=15.0) as client:
        response = get_daily(client, header)

    assert response.status_code == 200, response.text
    assert response.json()["timezone"] == expected
