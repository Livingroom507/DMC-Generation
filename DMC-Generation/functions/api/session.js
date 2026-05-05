import { getConfiguredCredentials, json, readSession } from "../_auth.js";

export async function onRequestGet(context) {
    let credentials;
    try {
        credentials = getConfiguredCredentials(context.env);
    } catch {
        return json({ authenticated: false, configured: false }, 200);
    }

    const session = await readSession(context.request, credentials.secret);

    if (!session) {
        return json({ authenticated: false, configured: true }, 200);
    }

    return json(
        {
            authenticated: true,
            configured: true,
            username: session.username,
            expiresAt: session.exp
        },
        200
    );
}
