const API_BASE = "http://127.0.0.1:8000/api";

async function apiFetch(url) {
  const res = await fetch(url, { headers: { "Content-Type": "application/json" } });
  return res.json();
}

async function desplay2(bookList) {
  var container = document.getElementById("admin_book");
  if (!container) return;

  if (!bookList || bookList.length === 0) {
    container.innerHTML = "<tr><td colspan='6'>No books found.</td></tr>";
    return;
  }

  container.innerHTML = bookList.map(book => `
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
  `).join('');
}

async function loadAll() {
  const data = await apiFetch(`${API_BASE}/books/`);
  if (data.status === "success") {
    allBooks = data.data;
    desplay2(allBooks);
  }

  const stats = await apiFetch(`${API_BASE}/stats/`);
  if (stats.status === "success") {
    const s = stats.data;
    if (document.getElementById("stat_total"))  document.getElementById("stat_total").textContent  = s.total_books;
    if (document.getElementById("stat_avail"))  document.getElementById("stat_avail").textContent  = s.available;
    if (document.getElementById("stat_borrow")) document.getElementById("stat_borrow").textContent = s.borrowed;
    if (document.getElementById("stat_users"))  document.getElementById("stat_users").textContent  = s.registered_users;
  }
}

var allBooks = [];

function filterBooks() {
  var searchValue   = document.querySelector(".searchInput").value.toLowerCase();
  var categoryValue = document.querySelector(".categorydropdown").value.toLowerCase();
  var statusValue   = document.querySelector(".statusdropdown").value.toLowerCase();

  var filtered = allBooks.filter(function(book) {
    var matchSearch   = !searchValue   || book.book_id.toLowerCase().includes(searchValue) || book.title.toLowerCase().includes(searchValue) || book.author.toLowerCase().includes(searchValue);
    var matchCategory = !categoryValue || book.category.toLowerCase().includes(categoryValue);
    var matchStatus = !statusValue || statusValue === "status" || book.status.toLowerCase().includes(statusValue.toLowerCase());
    return matchSearch && matchCategory && matchStatus;
  });

  desplay2(filtered);
}

document.addEventListener("click", async function(e) {
  if (!e.target.classList.contains("btn-delete")) return;
  const bookId = e.target.getAttribute("data-id");
  if (!bookId) return;
  if (!confirm("Are you sure you want to delete this book?")) return;

  const data = await fetch(`${API_BASE}/books/delete/${bookId}/`, {
    method: "DELETE", headers: { "Content-Type": "application/json" }
  }).then(r => r.json());

  if (data.status === "success") {
    alert("Book deleted!");
    loadAll();
  } else {
    alert("Error: " + data.message);
  }
});

window.addEventListener("load", function() {
  loadAll();

  var searchInput    = document.querySelector(".searchInput");
  var categoryFilter = document.querySelector(".categorydropdown");
  var statusFilter   = document.querySelector(".statusdropdown");

  if (searchInput)    searchInput.addEventListener("input", filterBooks);
  if (categoryFilter) categoryFilter.addEventListener("change", filterBooks);
  if (statusFilter)   statusFilter.addEventListener("change", filterBooks);
});