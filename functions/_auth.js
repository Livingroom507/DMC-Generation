const COOKIE_NAME = "__Host-dmc_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;
const encoder = new TextEncoder();

function encodeBase64Url(input) {
    const bytes = typeof input === "string" ? encoder.encode(input) : input;
    let binary = "";
    for (const byte of bytes) {
        binary += String.fromCharCode(byte);
    }

    return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function decodeBase64Url(input) {
    const padded = input.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(input.length / 4) * 4, "=");
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);

    for (let index = 0; index < binary.length; index += 1) {
        bytes[index] = binary.charCodeAt(index);
    }

    return bytes;
}

function parseCookies(headerValue) {
    const cookies = {};

    for (const part of (headerValue || "").split(";")) {
        const trimmed = part.trim();
        if (!trimmed) {
            continue;
        }

        const separatorIndex = trimmed.indexOf("=");
        if (separatorIndex === -1) {
            continue;
        }

        const name = trimmed.slice(0, separatorIndex);
        const value = trimmed.slice(separatorIndex + 1);
        cookies[name] = value;
    }

    return cookies;
}

async function importSigningKey(secret) {
    return crypto.subtle.importKey(
        "raw",
        encoder.encode(secret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign", "verify"]
    );
}

async function signPayload(payloadPart, secret) {
    const key = await importSigningKey(secret);
    const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payloadPart));
    return encodeBase64Url(new Uint8Array(signature));
}

function decodePayload(payloadPart) {
    const payloadBytes = decodeBase64Url(payloadPart);
    const payloadJson = new TextDecoder().decode(payloadBytes);
    return JSON.parse(payloadJson);
}

export function json(data, status = 200, headers = {}) {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            "cache-control": "no-store",
            "content-type": "application/json; charset=UTF-8",
            ...headers
        }
    });
}

export function redirect(location, status = 302, headers = {}) {
    return new Response(null, {
        status,
        headers: {
            "cache-control": "no-store",
            location,
            ...headers
        }
    });
}

export function sanitizeNextPath(candidate) {
    if (typeof candidate !== "string" || candidate.length === 0) {
        return "/portal.html";
    }

    if (!candidate.startsWith("/") || candidate.startsWith("//") || candidate.startsWith("/api/")) {
        return "/portal.html";
    }

    return candidate;
}

export function getConfiguredCredentials(env) {
    if (!env.ADMIN_USERNAME || !env.ADMIN_PASSWORD || !env.SESSION_SECRET) {
        throw new Error("Missing ADMIN_USERNAME, ADMIN_PASSWORD, or SESSION_SECRET.");
    }

    return {
        username: env.ADMIN_USERNAME,
        password: env.ADMIN_PASSWORD,
        secret: env.SESSION_SECRET
    };
}

export async function createSessionToken(username, secret, maxAge = SESSION_MAX_AGE) {
    const payload = {
        username,
        exp: Math.floor(Date.now() / 1000) + maxAge
    };
    const payloadPart = encodeBase64Url(JSON.stringify(payload));
    const signaturePart = await signPayload(payloadPart, secret);

    return `${payloadPart}.${signaturePart}`;
}

export async function readSession(request, secret) {
    const cookies = parseCookies(request.headers.get("cookie"));
    const token = cookies[COOKIE_NAME];

    if (!token) {
        return null;
    }

    const [payloadPart, signaturePart] = token.split(".");
    if (!payloadPart || !signaturePart) {
        return null;
    }

    try {
        const key = await importSigningKey(secret);
        const isValid = await crypto.subtle.verify(
            "HMAC",
            key,
            decodeBase64Url(signaturePart),
            encoder.encode(payloadPart)
        );

        if (!isValid) {
            return null;
        }

        const payload = decodePayload(payloadPart);
        if (!payload?.username || typeof payload.exp !== "number") {
            return null;
        }

        if (payload.exp <= Math.floor(Date.now() / 1000)) {
            return null;
        }

        return payload;
    } catch {
        return null;
    }
}

export function buildSessionCookie(token, maxAge = SESSION_MAX_AGE) {
    return `${COOKIE_NAME}=${token}; HttpOnly; Max-Age=${maxAge}; Path=/; SameSite=Strict; Secure`;
}

export function clearSessionCookie() {
    return `${COOKIE_NAME}=; HttpOnly; Max-Age=0; Path=/; SameSite=Strict; Secure`;
}

export function notFound() {
    return new Response("Not found", {
        status: 404,
        headers: {
            "cache-control": "no-store"
        }
    });
}
