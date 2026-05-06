import { getConfiguredCredentials, readSession, redirect, sanitizeNextPath } from "./_auth.js";

const protectedRoutes = new Set(["/portal.html"]);

export async function onRequest(context) {
    const url = new URL(context.request.url);

    if (url.pathname.startsWith("/api/")) {
        return context.next();
    }

    let secret;
    try {
        ({ secret } = getConfiguredCredentials(context.env));
    } catch {
        if (protectedRoutes.has(url.pathname)) {
            return new Response("Authentication is not configured.", { status: 500 });
        }

        return context.next();
    }

    const session = await readSession(context.request, secret);

    if (url.pathname === "/login.html" && session) {
        return redirect("/portal.html");
    }

    if (protectedRoutes.has(url.pathname) && !session) {
        const next = sanitizeNextPath(`${url.pathname}${url.search}`);
        return redirect(`/login.html?next=${encodeURIComponent(next)}`);
    }

    return context.next();
}
