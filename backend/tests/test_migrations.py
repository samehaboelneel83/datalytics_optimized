"""The migration creates exactly the columns the model declares."""

import os
import subprocess
import sys
from pathlib import Path

from sqlalchemy import create_engine, inspect

from app.users.models import User

BACKEND = Path(__file__).resolve().parents[1]


def test_upgrade_head_matches_the_user_model(tmp_path):
    db_file = tmp_path / "m.db"
    env = {**os.environ, "DATABASE_URL": f"sqlite+aiosqlite:///{db_file}"}
    subprocess.run(  # noqa: S603 (fixed command, test only)
        [sys.executable, "-m", "alembic", "upgrade", "head"],
        cwd=BACKEND,
        env=env,
        check=True,
        capture_output=True,
    )
    columns = {
        c["name"] for c in inspect(create_engine(f"sqlite:///{db_file}")).get_columns("users")
    }
    assert columns == {c.name for c in User.__table__.columns}
