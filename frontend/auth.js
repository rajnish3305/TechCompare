// REGISTER
const registerForm = document.getElementById("registerForm");
if (registerForm) {
    registerForm.addEventListener("submit", async function (event) {
        event.preventDefault();
        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;
        const message = document.getElementById("registerMessage");
        message.textContent = "Registering...";
        message.style.color = "black";
        try {
            const response = await fetch(
                "https://techcompare-1.onrender.com/api/register",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        name: name,
                        email: email,
                        password: password
                    })
                }
            );
            const data = await response.json();
            console.log("Register response:", data);
            message.textContent = data.message;
            if (response.ok) {
                registerForm.reset();
                message.style.color = "green";
            } else {
                message.style.color = "red";
            }
        } catch (error) {
            console.error("Register error:", error);
            message.textContent = "Server connection failed";
            message.style.color = "red";
        }
    });
}

// LOGIN
const loginForm = document.getElementById("loginForm");
if (loginForm) {
    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault();
        const email = document.getElementById("loginEmail").value.trim();
        const password = document.getElementById("loginPassword").value;
        const message = document.getElementById("loginMessage");
        message.textContent = "Logging in...";
        message.style.color = "black";
        try {
            const response = await fetch(
                "https://techcompare-1.onrender.com/api/login",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        email: email,
                        password: password
                    })
                }
            );
            console.log("Login status:", response.status);
            const data = await response.json();
            console.log("Login response:", data);
            message.textContent = data.message;
            if (response.ok) {
                message.style.color = "green";
                localStorage.setItem(
                    "loggedInUser",
                    JSON.stringify(data.user)
                );
                if (data.user.role === "admin") {
                    window.location.href = "admin.html";

                } else {

                    window.location.href = "index.html";

                }

            } else {
                message.style.color = "red";
            }
        } catch (error) {
            console.error("Login error:", error);
            message.textContent = "Server connection failed";
            message.style.color = "red";
        }
    });
}

// Login password eye
const toggleLogin = document.getElementById("toggleLoginPassword");
if (toggleLogin) {
    toggleLogin.addEventListener("click", function () {
        const passwordInput = document.getElementById("loginPassword");
        if (passwordInput.type === "password") {
            passwordInput.type = "text";
            this.textContent = "🙈";
        } else {
            passwordInput.type = "password";
            this.textContent = "👁";
        }
    });
}

// Register password eye
const toggleRegister = document.getElementById("toggleRegisterPassword");
if (toggleRegister) {
    toggleRegister.addEventListener("click", function () {
        const passwordInput = document.getElementById("password");
        if (passwordInput.type === "password") {
            passwordInput.type = "text";
            this.textContent = "🙈";
        } else {
            passwordInput.type = "password";
            this.textContent = "👁";
        }
    });
}