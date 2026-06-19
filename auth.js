// auth.js — handles login, signup, and logout via Django API

const API_BASE = "http://127.0.0.1:8000/api";

async function apiFetch(url, body) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  return res.json();
}

// ─── User Login ──────────────────────────────────────────────
async function handleUserLogin(event) {
  event.preventDefault();
  const email    = document.querySelector('input[name="email"]').value.trim();
  const password = document.querySelector('input[name="password"]').value;

  const data = await apiFetch(`${API_BASE}/users/login/`, { email, password });
  if (data.status === "success") {
    localStorage.setItem("user_email", data.data.email);
    localStorage.setItem("user_name",  data.data.username);
    localStorage.setItem("user_type",  data.data.user_type);
    window.location.href = "home_user.html";
  } else {
    alert("Login failed: " + data.message);
  }
}

// ─── Admin Login ─────────────────────────────────────────────
async function handleAdminLogin(event) {
  event.preventDefault();
  const email    = document.querySelector('input[name="email"]').value.trim();
  const password = document.querySelector('input[name="password"]').value;

  const data = await apiFetch(`${API_BASE}/admin/login/`, { email, password });
  if (data.status === "success") {
    localStorage.setItem("user_email", data.data.email || email);
    localStorage.setItem("user_name",  data.data.username);
    localStorage.setItem("user_type",  "admin");
    window.location.href = "home_admin.html";
  } else {
    alert("Admin login failed: " + data.message);
  }
}

// ─── Sign Up ─────────────────────────────────────────────────
async function handleSignup(event) {
  event.preventDefault();
  const username  = document.querySelector('input[name="username"]').value.trim();
  const email     = document.querySelector('input[name="email"]').value.trim();
  const password  = document.getElementById("password").value;
  const confirm   = document.getElementById("confirmPassword").value;
  const user_type = document.querySelector('input[name="user_type"]:checked')?.value || "user";

  if (password !== confirm) { alert("Passwords do not match!"); return; }
  if (password.length < 8)  { alert("Password must be at least 8 characters."); return; }

  const data = await apiFetch(`${API_BASE}/users/signup/`, { username, email, password, user_type });
  if (data.status === "success") {
    alert("Account created! Please log in.");
    window.location.href = "login.html";
  } else {
    alert("Signup failed: " + data.message);
  }
}

// ─── Auto-wire forms based on page ───────────────────────────
window.addEventListener("load", function() {
  const form = document.querySelector("form");
  if (!form) return;

  if (window.location.pathname.includes("login.html") || window.location.pathname === "/" ) {
    form.addEventListener("submit", handleUserLogin);
  } else if (window.location.pathname.includes("admin.html")) {
    form.addEventListener("submit", handleAdminLogin);
  } else if (window.location.pathname.includes("signin.html")) {
    // Replace existing inline listener
    form.addEventListener("submit", handleSignup);
  }
});
