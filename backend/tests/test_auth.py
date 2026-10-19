from conftest import ADMIN, login

from app.security import SESSION_COOKIE


async def test_login_sets_an_httponly_session_cookie(client):
    r = await login(client, *ADMIN)
    assert r.status_code == 200
    assert r.json()["email"] == ADMIN[0] and r.json()["is_admin"] is True
    assert "password_hash" not in r.json()
    cookie = r.headers["set-cookie"].lower()
    assert f"{SESSION_COOKIE}=" in cookie
    assert "httponly" in cookie and "samesite=lax" in cookie and "path=/api" in cookie


async def test_me_returns_the_signed_in_user(client):
    await login(client, *ADMIN)
    r = await client.get("/api/auth/me")
    assert r.status_code == 200 and r.json()["email"] == ADMIN[0]


async def test_me_without_session_is_401(client):
    assert (await client.get("/api/auth/me")).status_code == 401


async def test_email_is_case_and_space_insensitive(client):
    r = await login(client, "  ADMIN@Datalytics.Local ", ADMIN[1])
    assert r.status_code == 200


async def test_wrong_password_unknown_email_and_disabled_user_look_the_same(
    admin_client, new_client
):
    created = await admin_client.post(
        "/api/users", json={"email": "off@x.com", "password": "password-123"}
    )
    await admin_client.patch(f"/api/users/{created.json()['id']}", json={"is_active": False})
    async with new_client() as c:
        answers = [
            await login(c, ADMIN[0], "wrong-password"),
            await login(c, "nobody@x.com", "whatever-123"),
            await login(c, "off@x.com", "password-123"),
        ]
    assert {r.status_code for r in answers} == {401}
    assert {r.json()["detail"] for r in answers} == {"Invalid email or password."}
    assert all("set-cookie" not in r.headers for r in answers)


async def test_logout_ends_the_session(client):
    await login(client, *ADMIN)
    r = await client.post("/api/auth/logout")
    assert r.status_code == 204
    assert (await client.get("/api/auth/me")).status_code == 401


async def test_a_tampered_cookie_is_refused(client):
    await login(client, *ADMIN)
    token = client.cookies.get(SESSION_COOKIE)
    client.cookies.set(SESSION_COOKIE, token[:-2] + "xx", path="/api")
    assert (await client.get("/api/auth/me")).status_code == 401


async def test_writes_without_the_csrf_header_are_refused(client):
    r = await client.post(
        "/api/auth/login",
        json={"email": ADMIN[0], "password": ADMIN[1]},
        headers={"X-Requested-With": ""},
    )
    assert r.status_code == 403


async def test_password_reset_ends_existing_sessions(admin_client, new_client):
    created = (
        await admin_client.post("/api/users", json={"email": "u@x.com", "password": "password-123"})
    ).json()
    async with new_client() as user:
        await login(user, "u@x.com", "password-123")
        assert (await user.get("/api/auth/me")).status_code == 200
        # Sessions carry whole seconds; make the cut-off strictly later.
        import asyncio

        await asyncio.sleep(1.1)
        await admin_client.patch(f"/api/users/{created['id']}", json={"password": "new-password-1"})
        assert (await user.get("/api/auth/me")).status_code == 401
        assert (await login(user, "u@x.com", "password-123")).status_code == 401
        assert (await login(user, "u@x.com", "new-password-1")).status_code == 200


async def test_deactivation_ends_existing_sessions(admin_client, new_client):
    created = (
        await admin_client.post("/api/users", json={"email": "u@x.com", "password": "password-123"})
    ).json()
    async with new_client() as user:
        await login(user, "u@x.com", "password-123")
        await admin_client.patch(f"/api/users/{created['id']}", json={"is_active": False})
        assert (await user.get("/api/auth/me")).status_code == 401
