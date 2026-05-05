import { clearSessionCookie, redirect } from "./_auth.js";

export function onRequest() {
    return redirect("/login.html", 302, {
        "set-cookie": clearSessionCookie()
    });
}
