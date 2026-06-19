// ============================================================
//  Library Frontend — Script.js  (API-connected version)
//  Backend: http://127.0.0.1:8000
// ============================================================

const API_BASE = "http://127.0.0.1:8000/api";

// In-memory cache (still used for display helpers, NOT localStorage)
var books = [];
var borrowedBooks = [];

// ─── Generic fetch helpers ───────────────────────────────────

async function apiFetch(url, options = {}) {
  const defaults = { headers: { "Content-Type": "application/json" } };
  const res = await fetch(url, { ...defaults, ...options });
  return res.json();
}

// ─── Load all books from DB ──────────────────────────────────

async function loadData() {
  const data = await apiFetch(`${API_BASE}/books/`);
  if (data.status === "success") {
    books = data.data;
    borrowedBooks = books.filter(b => b.status === "borrowed");
  }
}

// ─── Add Book ────────────────────────────────────────────────

async function addBook(Id, Title, Author, Category, Description) {
  if (!Id || !Title || !Author || !Category || !Description) {
    window.alert("Please fill in all required fields.");
    return;
  }
  const data = await apiFetch(`${API_BASE}/books/add/`, {
    method: "POST",
    body: JSON.stringify({ id: Id, title: Title, author: Author, category: Category, description: Description })
  });
  if (data.status === "success") {
    alert("Book added successfully!");
    window.location.href = "admin_dash.html";
  } else {
    alert("Error: " + data.message);
  }
}

// ─── Edit Book ───────────────────────────────────────────────

async function editBook(Id, Title, Author, Category, Description) {
  if (!Id) { alert("Book ID is required."); return; }
  const data = await apiFetch(`${API_BASE}/books/update/${Id}/`, {
    method: "PUT",
    body: JSON.stringify({ title: Title, author: Author, category: Category, description: Description })
  });
  if (data.status === "success") {
    alert("Book updated successfully!");
    window.location.href = "admin_dash.html";
  } else {
    alert("Error: " + data.message);
  }
}

// ─── Delete Book ─────────────────────────────────────────────

async function deleteBook(bookId) {
  if (!bookId) {
    var idInput = document.getElementById("id_edit") || document.querySelector("input[type='text']");
    bookId = idInput ? idInput.value.trim() : null;
  }
  if (!bookId) { alert("Please enter a book ID"); return; }

  const confirmDelete = confirm("Are you sure you want to delete this book?");
  if (!confirmDelete) return;

  const data = await apiFetch(`${API_BASE}/books/delete/${bookId}/`, { method: "DELETE" });
  if (data.status === "success") {
    alert("Book deleted successfully!");
    window.location.href = "admin_dash.html";
  } else {
    alert("Error: " + data.message);
  }
}

// ─── Search ──────────────────────────────────────────────────

async function searchBooks() {
  const q      = document.getElementById("searchInput").value.trim();
  const filter = document.getElementById("filterType").value;
  const data   = await apiFetch(`${API_BASE}/books/search/?q=${encodeURIComponent(q)}&filter=${filter}`);
  if (data.status === "success") desplay(data.data);
}

async function searchBooks2() {
  const q    = document.getElementById("search123").value.trim();
  const data = await apiFetch(`${API_BASE}/books/search/?q=${encodeURIComponent(q)}&filter=title`);
  if (data.status === "success") desplay(data.data);
}

// ─── Display helpers ─────────────────────────────────────────

function desplay(bookList) {
  var container = document.getElementById("books");
  if (!container) return;
  if (!bookList || bookList.length === 0) { container.innerHTML = "<p>No books found.</p>"; return; }

  container.innerHTML = bookList.map(book => {
    const available  = book.status === "available";
    const hasImg     = book.image && book.image !== "";
    const hasDetails = book.details && book.details !== "";
    return (
      '<div class="book">' +
      (hasImg ? `<img src="${book.image}">` : '<h2>No Image</h2>') +
      `<h3 class="title">Title: ${book.title}</h3>` +
      `<p class="author">Author: ${book.author}</p>` +
      `<p class="category">Category: ${book.category}</p>` +
      `<p>Status: ${book.status}</p>` +
      (hasDetails ? `<a class="btn" href="${book.details}">👀 View Details</a>` : `<p>Description: ${book.description}</p>`) +
      (available
        ? `<a class="btn borrow-btn" data-id="${book.book_id}" data-title="${book.title}" data-author="${book.author}">🤝🏻 Borrow Book</a>`
        : `<a class="btn" style="opacity:0.5;pointer-events:none">🤝🏻 Borrow Book</a>`) +
      '<hr>' +
      '<link rel="stylesheet" href="user_dashboard_style.css">' +
      '</div>'
    );
  }).join('');
}

async function desplay2() {
  await loadData();
  var container = document.getElementById("admin_book");
  if (!container) return;
  if (books.length === 0) { container.innerHTML = "<tr><td colspan='6'>No books found.</td></tr>"; return; }

  container.innerHTML = books.map(book => `
    <tr>
      <td>${book.book_id}</td>
      <td>${book.title}</td>
      <td>${book.author}</td>
      <td>${book.category}</td>
      <td>${book.status}</td>
      <td>
        <a class="btn btn-edit" href="edit_book.html?id=${book.book_id}">✍️ Edit</a>
        <a style="margin-left:20px" class="btn btn-delete" data-id="${book.book_id}">🗑️ Delete</a>
      </td>
    </tr>
    <style>th{background:#1e1a12;color:#c9a84c;border:1px solid #7a6030;padding:12px 16px;}
    td{background:#1e1a12;color:#d4c5a0;border:1px solid #4a3c20;padding:11px 16px;}</style>
  `).join('');
  // Update stats
  const statsData = await apiFetch(`${API_BASE}/stats/`);
  if (statsData.status === "success") {
    const s = statsData.data;
    if (document.getElementById("stat_total"))  document.getElementById("stat_total").textContent  = s.total_books;
    if (document.getElementById("stat_avail"))  document.getElementById("stat_avail").textContent  = s.available;
    if (document.getElementById("stat_borrow")) document.getElementById("stat_borrow").textContent = s.borrowed;
    if (document.getElementById("stat_users"))  document.getElementById("stat_users").textContent  = s.registered_users;
  }
}

// ─── Load edit form from URL param ───────────────────────────

async function loadEditForm() {
  var urlParams = new URLSearchParams(window.location.search);
  var bookId = urlParams.get("id");
  if (!bookId) return;

  const data = await apiFetch(`${API_BASE}/books/search/?q=${encodeURIComponent(bookId)}&filter=title`);
  // Use direct book list instead
  const allData = await apiFetch(`${API_BASE}/books/`);
  if (allData.status !== "success") return;

  const book = allData.data.find(b => b.book_id === bookId);
  if (!book) return;

  if (document.getElementById("id_edit"))          document.getElementById("id_edit").value          = book.book_id;
  if (document.getElementById("name_edit"))         document.getElementById("name_edit").value         = book.title;
  if (document.getElementById("author_edit"))       document.getElementById("author_edit").value       = book.author;
  if (document.getElementById("category_edit"))     document.getElementById("category_edit").value     = book.category;
  if (document.getElementById("descreption_edit"))  document.getElementById("descreption_edit").value  = book.description || "";
}

// ─── Stats (home_admin) ───────────────────────────────────────

async function loadStats() {
  const data = await apiFetch(`${API_BASE}/stats/`);
  if (data.status !== "success") return;
  const s = data.data;
  if (document.getElementById("total_cell"))     document.getElementById("total_cell").querySelector("p").textContent     = s.total_books;
  if (document.getElementById("Available_cell")) document.getElementById("Available_cell").querySelector("p").textContent = s.available;
  if (document.getElementById("Borrow_cell"))    document.getElementById("Borrow_cell").querySelector("p").textContent    = s.borrowed;
  if (document.getElementById("User_cell"))      document.getElementById("User_cell").querySelector("p").textContent      = s.registered_users;
}

// ─── Borrow via inline search results (home_user.html) ───────

document.addEventListener("click", async function(e) {
  if (!e.target.classList.contains("borrow-btn")) return;
  const bookId = e.target.dataset.id;
  const title  = e.target.dataset.title;
  if (!bookId) return;

  const userEmail = localStorage.getItem("user_email") || "";
  const data = await apiFetch(`${API_BASE}/borrow/add/`, {
    method: "POST",
    body: JSON.stringify({ book_id: bookId, user_email: userEmail })
  });
  if (data.status === "success") {
    alert("Book Borrowed!");
    e.target.style.pointerEvents = "none";
    e.target.style.opacity = "0.2";
    // Update status text if present
    const parent = e.target.closest(".book") || e.target.closest(".bookinfo");
    if (parent) {
      const statusEl = parent.querySelector(".status") || parent.querySelector("p");
      if (statusEl) statusEl.textContent = "Status: borrowed";
    }
  } else {
    alert("Error: " + data.message);
  }
});

// ─── Admin dashboard delete handler ──────────────────────────

document.addEventListener("click", async function(e) {
  if (!e.target.classList.contains("btn-delete")) return;
  const bookId = e.target.getAttribute("data-id");
  if (!bookId) return;
  const confirmDel = confirm("Are you sure you want to delete this book?");
  if (!confirmDel) return;

  const data = await apiFetch(`${API_BASE}/books/delete/${bookId}/`, { method: "DELETE" });
  if (data.status === "success") {
    alert("Book deleted!");
    desplay2();
  } else {
    alert("Error: " + data.message);
  }
});

// ─── Page-specific init ───────────────────────────────────────

window.addEventListener("load", async function() {
  // home_admin stats
  if (document.getElementById("total_cell")) await loadStats();

  // admin_dash table
  if (document.getElementById("admin_book")) await desplay2();

  // edit_book pre-fill
  if (document.getElementById("id_edit")) await loadEditForm();

  // home_user book display (show all by default)
  if (document.getElementById("books") && !document.getElementById("admin_book")) {
    await loadData();
    desplay(books);
  }

  // delete_book page wire-up
  var deleteBtn = document.querySelector(".add_btn");
  if (deleteBtn && deleteBtn.textContent.includes("Delete")) {
    deleteBtn.onclick = () => deleteBook(null);
  }
});
