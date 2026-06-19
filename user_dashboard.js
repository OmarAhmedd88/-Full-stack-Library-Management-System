// user_dashboard.js — connects to Django API

const API_BASE = "http://127.0.0.1:8000/api";

async function apiFetch(url, options = {}) {
  const res = await fetch(url, { headers: { "Content-Type": "application/json" }, ...options });
  return res.json();
}

async function loadAndDisplay() {
  const data = await apiFetch(`${API_BASE}/books/`);
  if (data.status !== "success") return;

  const borrowed = await getBorrowed();
  const userEmail = localStorage.getItem("user_email") || "";

  data.data.forEach(book => {
    const bookEl = document.querySelector(`.book${book.book_id === "1" ? "1" : book.book_id === "2" ? "2" : "3"}`);
    if (!bookEl) return;
    const statusEl = bookEl.querySelector(".status");
    const borrowBtn = bookEl.querySelector(".borrow-btn");
    if (!statusEl || !borrowBtn) return;

    const isAlreadyBorrowed = borrowed.some(b => b.book_id === book.book_id);
    if (book.status === "borrowed" || isAlreadyBorrowed) {
      statusEl.textContent = "Status: borrowed";
      borrowBtn.style.pointerEvents = "none";
      borrowBtn.style.opacity = "0.2";
    } else {
      statusEl.textContent = "Status: available";
      borrowBtn.setAttribute("data-id", book.book_id);
      borrowBtn.setAttribute("data-title", book.title);
      borrowBtn.setAttribute("data-author", book.author);
    }
  });
}

async function getBorrowed() {
  const userEmail = localStorage.getItem("user_email") || "";
  const url = userEmail
    ? `${API_BASE}/borrow/?user_email=${encodeURIComponent(userEmail)}`
    : `${API_BASE}/borrow/`;
  const data = await apiFetch(url);
  return data.status === "success" ? data.data : [];
}

// Search
async function searchBooks() {
  const q      = document.getElementById("searchInput").value.trim();
  const filter = document.getElementById("filterType").value;
  const data   = await apiFetch(`${API_BASE}/books/search/?q=${encodeURIComponent(q)}&filter=${filter}`);
  if (data.status === "success" && typeof desplay === "function") desplay(data.data);
}

// Borrow button click (static cards)
document.body.addEventListener("click", async function(e) {
  const btn = e.target.closest(".borrow-btn");
  if (!btn) return;

  const bookId = btn.getAttribute("data-id");
  if (!bookId) return;
  const userEmail = localStorage.getItem("user_email") || "";

  const data = await apiFetch(`${API_BASE}/borrow/add/`, {
    method: "POST",
    body: JSON.stringify({ book_id: bookId, user_email: userEmail })
  });

  if (data.status === "success") {
    alert("Book Borrowed!");
    const parent = btn.closest(".bookinfo");
    if (parent) {
      const statusEl = parent.querySelector(".status");
      if (statusEl) statusEl.textContent = "Status: borrowed";
    }
    btn.style.pointerEvents = "none";
    btn.style.opacity = "0.2";
  } else {
    alert("Error: " + data.message);
  }
});

window.addEventListener("load", loadAndDisplay);
