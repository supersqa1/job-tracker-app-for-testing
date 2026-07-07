from app.services.users import normalize_email


def test_normalize_email_strips_whitespace_and_lowercases():
    assert normalize_email("  Student@Example.COM ") == "student@example.com"
