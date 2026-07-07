import pytest
from pydantic import ValidationError

from app.schemas.api_key import ApiKeyCreate, ApiKeyUpdate


def test_create_api_key_strips_name():
    payload = ApiKeyCreate(name="  Postman key  ")

    assert payload.name == "Postman key"


@pytest.mark.parametrize("name", ["", "   "])
def test_create_api_key_rejects_blank_name(name):
    with pytest.raises(ValidationError):
        ApiKeyCreate(name=name)


def test_update_api_key_rejects_blank_name():
    with pytest.raises(ValidationError):
        ApiKeyUpdate(name="   ")
