import os
from pathlib import Path
from tempfile import gettempdir
from types import SimpleNamespace

import pytest

from app.services.rate_limit import clear_rate_limits


TEST_DATABASE_PATH = Path(gettempdir()) / "supersqa_job_tracker_pytest.db"
if TEST_DATABASE_PATH.exists():
    TEST_DATABASE_PATH.unlink()
os.environ["DATABASE_PATH"] = str(TEST_DATABASE_PATH)


@pytest.fixture(autouse=True)
def reset_rate_limits():
    clear_rate_limits()
    yield
    clear_rate_limits()


@pytest.fixture
def mock_request():
    return SimpleNamespace(headers={}, client=SimpleNamespace(host="testclient"))
