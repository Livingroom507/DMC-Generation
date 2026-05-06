import { notFound } from "./_auth.js";

export function onRequest() {
    return notFound();
}
