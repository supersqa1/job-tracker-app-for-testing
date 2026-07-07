import pytest
from pydantic import ValidationError

from app.schemas.user import UserCreate


def test_create_user_strips_full_name():
    user = UserCreate(
        email="new.student@example.com",
        password="Password123!",
        full_name="  New Student  ",
    )

    assert user.full_name == "New Student"


@pytest.mark.parametrize("full_name", ["", "   "])
def test_create_user_rejects_blank_full_name(full_name):
    with pytest.raises(ValidationError):
        UserCreate(
            email="new.student@example.com",
            password="Password123!",
            full_name=full_name,
        )
