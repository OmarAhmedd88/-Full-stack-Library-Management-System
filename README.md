# Library Management System — Django Backend

## Setup Instructions

### 1. Install dependencies
```bash
pip install django djangorestframework django-cors-headers
```

### 2. Run migrations
```bash
cd library_backend
python manage.py migrate
```

### 3. Start server
```bash
python manage.py runserver
```
Server runs at: http://127.0.0.1:8000

### 4. Default admin account (pre-seeded)
- Email: admin@library.com
- Password: admin1234

---

## API Endpoints

| Method | URL | Description |
|--------|-----|-------------|
| GET    | /api/books/                    | List all books |
| POST   | /api/books/add/                | Add a new book |
| GET    | /api/books/search/?q=&filter=  | Search books |
| PUT    | /api/books/update/<book_id>/   | Update a book |
| DELETE | /api/books/delete/<book_id>/   | Delete a book |
| POST   | /api/users/login/              | User login |
| POST   | /api/admin/login/              | Admin login |
| POST   | /api/users/signup/             | Register new user |
| GET    | /api/users/                    | List all users |
| POST   | /api/borrow/add/               | Borrow a book |
| GET    | /api/borrow/?user_email=       | List borrowed books |
| POST   | /api/borrow/return/<id>/       | Return a book |
| GET    | /api/stats/                    | Library stats |

---

## Frontend JS Files to Replace

Copy these updated JS files into your frontend folder:
- `Script.js`       → replaces localStorage with API calls
- `user_dashboard.js` → borrow functionality via API
- `borrowed_books.js` → return books via API
- `admin_dash.js`    → admin table + filters via API
- `auth.js`          → NEW: handles login/signup (add to login.html, admin.html, signin.html)

### Add auth.js to HTML files
In `login.html`, `admin.html`, and `signin.html`, add before `</body>`:
```html
<script src="auth.js"></script>
```
And remove the `action="..."` attribute from the `<form>` tags.

---

## Database
SQLite database stored at `library_backend/library.db`
To use PostgreSQL/MySQL, update the DATABASES setting in `settings.py`.
