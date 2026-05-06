document.addEventListener("DOMContentLoaded", async function() {
    const loginLinks = [
        document.getElementById("admin-login-link"),
        document.getElementById("footer-login-link")
    ];
    const portalLinks = [
        document.getElementById("portal-home-link"),
        document.getElementById("footer-portal-link")
    ];

    try {
        const response = await fetch("/api/session");
        const session = await response.json();

        if (!session.authenticated) {
            return;
        }

        portalLinks.forEach(function(link) {
            if (link) {
                link.classList.remove("is-hidden");
            }
        });

        loginLinks.forEach(function(link) {
            if (link) {
                link.classList.add("is-hidden");
            }
        });
    } catch {
        // Leave the signed-out links in place if the session check fails.
    }
});
