// borrowed_books.js — connects to Django API

const API_BASE = "http://127.0.0.1:8000/api";
const tableBody = document.querySelector("tbody");

async function apiFetch(url, options = {}) {
  const res = await fetch(url, { headers: { "Content-Type": "application/json" }, ...options });
  return res.json();
}

async function loadBorrowed() {
  const userEmail = localStorage.getItem("user_email") || "";
  const url = userEmail
    ? `${API_BASE}/borrow/?user_email=${encodeURIComponent(userEmail)}`
    : `${API_BASE}/borrow/`;
  const data = await apiFetch(url);

  if (data.status !== "success") {
    tableBody.innerHTML = "<tr><td colspan='4'>Failed to load borrowed books.</td></tr>";
    return;
  }

  const list = data.data;
  if (list.length === 0) {
    tableBody.innerHTML = "<tr><td colspan='4'>No borrowed books.</td></tr>";
    return;
  }

  tableBody.innerHTML = list.map(b => `
    <tr>
      <td>${b.title}</td>
      <td>${b.author}</td>
      <td>${b.borrow_date}</td>
      <td>
        <button class="btn return-btn" data-borrow-id="${b.borrow_id}">Return Book</button>
      </td>
    </tr>
  `).join('');
}

document.addEventListener("click", async function(e) {
  if (!e.target.classList.contains("return-btn")) return;
  const borrowId = e.target.getAttribute("data-borrow-id");
  if (!borrowId) return;

  const data = await apiFetch(`${API_BASE}/borrow/return/${borrowId}/`, { method: "POST" });
  if (data.status === "success") {
    alert("Book returned successfully!");
    loadBorrowed();
  } else {
    alert("Error: " + data.message);
  }
});

loadBorrowed();
