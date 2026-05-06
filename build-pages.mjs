import { cp, mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outputDir = path.join(__dirname, "public");

const filesToCopy = [
    "_routes.json",
    "index.html",
    "index-session.js",
    "login.html",
    "login.js",
    "portal.html",
    "portal-static.js",
    "script.js",
    "style.css"
];

async function buildPagesOutput() {
    await rm(outputDir, { recursive: true, force: true });
    await mkdir(outputDir, { recursive: true });

    for (const file of filesToCopy) {
        const source = path.join(__dirname, file);
        const destination = path.join(outputDir, file);
        await cp(source, destination, { recursive: true });
    }
}

await buildPagesOutput();
