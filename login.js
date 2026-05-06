document.addEventListener("DOMContentLoaded", function() {
    const form = document.getElementById("login-form");
    const message = document.getElementById("login-message");
    const submitButton = document.getElementById("login-submit");
    const next = new URLSearchParams(window.location.search).get("next") || "/portal.html";

    function showMessage(text) {
        message.textContent = text;
        message.hidden = false;
    }

    form.addEventListener("submit", async function(event) {
        event.preventDefault();
        message.hidden = true;
        submitButton.disabled = true;
        submitButton.textContent = "Signing In...";

        try {
            const response = await fetch("/api/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    username: form.username.value.trim(),
                    password: form.password.value,
                    next
                })
            });

            const data = await response.json().catch(function() {
                return {};
            });

            if (!response.ok || !data.ok) {
                showMessage(data.error || "Login failed.");
                return;
            }

            window.location.href = data.redirect || "/portal.html";
        } catch {
            showMessage("Unable to reach the login service.");
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = "Secure Login";
        }
    });
});
