import { clearSessionCookie, json, redirect } from "../_auth.js";

export function onRequestGet() {
    return redirect("/login.html", 302, {
        "set-cookie": clearSessionCookie()
    });
}

export function onRequestPost() {
    return json(
        {
            ok: true,
            redirect: "/login.html"
        },
        200,
        {
            "set-cookie": clearSessionCookie()
        }
    );
}
