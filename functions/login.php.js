import { redirect } from "./_auth.js";

export function onRequest() {
    return redirect("/login.html", 301);
}
