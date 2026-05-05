import { buildSessionCookie, createSessionToken, getConfiguredCredentials, json, sanitizeNextPath } from "../_auth.js";

export async function onRequestPost(context) {
    let body;

    try {
        body = await context.request.json();
    } catch {
        return json({ ok: false, error: "Invalid request body." }, 400);
    }

    const username = typeof body?.username === "string" ? body.username.trim() : "";
    const password = typeof body?.password === "string" ? body.password : "";
    const next = sanitizeNextPath(body?.next);

    if (!username || !password) {
        return json({ ok: false, error: "Please enter both username and password." }, 400);
    }

    let credentials;
    try {
        credentials = getConfiguredCredentials(context.env);
    } catch {
        return json({ ok: false, error: "Authentication is not configured." }, 500);
    }

    if (username !== credentials.username || password !== credentials.password) {
        return json({ ok: false, error: "Invalid username or password." }, 401);
    }

    const token = await createSessionToken(credentials.username, credentials.secret);

    return json(
        {
            ok: true,
            redirect: next,
            username: credentials.username
        },
        200,
        {
            "set-cookie": buildSessionCookie(token)
        }
    );
}
