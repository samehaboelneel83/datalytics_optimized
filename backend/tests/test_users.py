import pytest
from conftest import ADMIN, login


async def make_user(admin_client, email="user@x.com", password="password-123", is_admin=False):
    r = await admin_client.post(
        "/api/users", json={"email": email, "password": password, "is_admin": is_admin}
    )
    assert r.status_code == 201, r.text
    return r.json()


async def test_admin_creates_a_user_who_can_sign_in(admin_client, new_client):
    created = await make_user(admin_client, email="  New.Person@X.com ")
    assert created["email"] == "new.person@x.com"
    assert created["is_admin"] is False and created["is_active"] is True
    async with new_client() as c:
        assert (await login(c, "new.person@x.com", "password-123")).status_code == 200


async def test_admin_lists_all_users(admin_client):
    await make_user(admin_client)
    emails = [u["email"] for u in (await admin_client.get("/api/users")).json()]
    assert emails == [ADMIN[0], "user@x.com"]


@pytest.mark.parametrize(
    "method,path", [("get", "/api/users"), ("post", "/api/users"), ("patch", "/api/users/1")]
)
async def test_normal_users_cannot_manage_users(admin_client, new_client, method, path):
    await make_user(admin_client)
    async with new_client() as c:
        await login(c, "user@x.com", "password-123")
        r = await getattr(c, method)(path, **({} if method == "get" else {"json": {}}))
    assert r.status_code == 403


@pytest.mark.parametrize(
    "method,path", [("get", "/api/users"), ("post", "/api/users"), ("patch", "/api/users/1")]
)
async def test_signed_out_callers_cannot_manage_users(client, method, path):
    r = await getattr(client, method)(path, **({} if method == "get" else {"json": {}}))
    assert r.status_code == 401


async def test_duplicate_email_is_refused(admin_client):
    await make_user(admin_client)
    r = await admin_client.post(
        "/api/users", json={"email": "USER@x.com", "password": "password-123"}
    )
    assert r.status_code == 409


@pytest.mark.parametrize(
    "email,password,message",
    [
        ("not-an-email", "password-123", "valid email"),
        ("a@x.com", "short", "at least 8"),
        ("a@x.com", "A@X.com ", "same as the email"),
    ],
)
async def test_bad_input_is_refused_with_a_reason(admin_client, email, password, message):
    r = await admin_client.post("/api/users", json={"email": email, "password": password})
    assert r.status_code == 400 and message in r.json()["detail"]


async def test_admin_can_promote_and_demote(admin_client):
    u = await make_user(admin_client)
    r = await admin_client.patch(f"/api/users/{u['id']}", json={"is_admin": True})
    assert r.json()["is_admin"] is True
    r = await admin_client.patch(f"/api/users/{u['id']}", json={"is_admin": False})
    assert r.json()["is_admin"] is False


async def test_admin_cannot_remove_own_admin_access(admin_client):
    await make_user(admin_client, email="other-admin@x.com", is_admin=True)
    for change in ({"is_admin": False}, {"is_active": False}):
        r = await admin_client.patch("/api/users/1", json=change)
        assert r.status_code == 400 and "your own" in r.json()["detail"]


async def test_one_admin_can_remove_another_but_never_themselves(admin_client, new_client):
    second = await make_user(admin_client, email="second@x.com", is_admin=True)
    async with new_client() as c:
        await login(c, "second@x.com", "password-123")
        assert (await c.patch("/api/users/1", json={"is_admin": False})).status_code == 200
        # "second" is now the only admin and cannot remove their own access,
        # so the system always keeps at least one active administrator.
        r = await c.patch(f"/api/users/{second['id']}", json={"is_active": False})
        assert r.status_code == 400
    # the first account lost admin rights at once
    assert (await admin_client.get("/api/users")).status_code == 403


async def test_unknown_user_is_404(admin_client):
    assert (
        await admin_client.patch("/api/users/999", json={"is_active": False})
    ).status_code == 404


async def test_password_hash_is_never_returned(admin_client):
    await make_user(admin_client)
    for u in (await admin_client.get("/api/users")).json():
        assert "password" not in str(u.keys())
