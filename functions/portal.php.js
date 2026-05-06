import { redirect } from "./_auth.js";

export function onRequest() {
    return redirect("/portal.html", 301);
}
