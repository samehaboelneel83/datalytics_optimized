from datetime import UTC, datetime, timedelta

import jwt
import pytest

from app.config import Settings, get_settings
from app.security import (
    create_session_token,
    hash_password,
    read_session_token,
    verify_password,
)


def test_password_hash_round_trip():
    h = hash_password("correct horse")
    assert h != "correct horse"
    assert verify_password("correct horse", h)
    assert not verify_password("wrong horse", h)


def test_very_long_password_does_not_crash():
    # bcrypt 5 raises on input over 72 bytes; we cut it ourselves.
    h = hash_password("x" * 150)
    assert verify_password("x" * 150, h)


def test_session_token_round_trip():
    claims = read_session_token(create_session_token(7))
    assert claims is not None and claims["sub"] == "7"


def test_forged_token_is_refused():
    forged = jwt.encode(
        {"sub": "1", "iat": 0, "exp": datetime.now(UTC) + timedelta(hours=1)},
        "a-different-secret-key-of-enough-length-000",
        algorithm="HS256",
    )
    assert read_session_token(forged) is None


def test_expired_token_is_refused():
    expired = jwt.encode(
        {"sub": "1", "iat": 0, "exp": datetime.now(UTC) - timedelta(seconds=1)},
        get_settings().secret_key,
        algorithm="HS256",
    )
    assert read_session_token(expired) is None


def test_unsigned_token_is_refused():
    unsigned = jwt.encode({"sub": "1", "iat": 0, "exp": 9999999999}, None, algorithm="none")
    assert read_session_token(unsigned) is None


@pytest.mark.parametrize("key", ["", "short", "x" * 31])
def test_weak_secret_key_stops_startup(key):
    with pytest.raises(RuntimeError, match="SECRET_KEY"):
        Settings(secret_key=key).check()
