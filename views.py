import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from .models import Book, LibraryUser, BorrowedBook


def success(data=None, message=""):
    resp = {"status": "success"}
    if message:
        resp["message"] = message
    if data is not None:
        resp["data"] = data
    return JsonResponse(resp)


def error(message, status=400):
    return JsonResponse({"status": "error", "message": message}, status=status)


# ─────────────────────────────  BOOKS  ──────────────────────────────

@csrf_exempt
def books_list(request):
    """GET /api/books/  – list all books"""
    if request.method != 'GET':
        return error("Method not allowed", 405)
    books = Book.objects.all()
    data = [{
        "id": b.id, "book_id": b.book_id, "title": b.title,
        "author": b.author, "category": b.category,
        "description": b.description, "status": b.status,
        "image": b.image, "details": b.details
    } for b in books]
    return success(data)


@csrf_exempt
def books_add(request):
    """POST /api/books/add/"""
    if request.method != 'POST':
        return error("Method not allowed", 405)
    try:
        body = json.loads(request.body)
    except (json.JSONDecodeError, Exception):
        return error("Invalid JSON body")

    book_id = (body.get('id') or body.get('book_id') or '').strip()
    title   = body.get('title', '').strip()
    author  = body.get('author', '').strip()
    category = body.get('category', '').strip()
    description = body.get('description', '').strip()
    image   = body.get('image', '').strip()
    details = body.get('details', '').strip()

    if not all([book_id, title, author, category]):
        return error("book_id, title, author, and category are required")

    if Book.objects.filter(book_id=book_id).exists():
        return error(f"A book with ID '{book_id}' already exists")

    book = Book.objects.create(
        book_id=book_id, title=title, author=author,
        category=category, description=description,
        status='available', image=image, details=details
    )
    return success({"id": book.id, "book_id": book.book_id}, "Book added successfully")


@csrf_exempt
def books_update(request, book_id):
    """PUT /api/books/update/<book_id>/"""
    if request.method not in ('PUT', 'PATCH', 'POST'):
        return error("Method not allowed", 405)
    try:
        book = Book.objects.get(book_id=book_id)
    except Book.DoesNotExist:
        return error("Book not found", 404)
    try:
        body = json.loads(request.body)
    except Exception:
        return error("Invalid JSON body")

    book.title       = body.get('title', book.title).strip()
    book.author      = body.get('author', book.author).strip()
    book.category    = body.get('category', book.category).strip()
    book.description = body.get('description', book.description).strip()
    if body.get('status'):
        book.status  = body['status']
    if body.get('image'):
        book.image   = body['image']
    if body.get('details'):
        book.details = body['details']
    book.save()
    return success({"book_id": book.book_id}, "Book updated successfully")


@csrf_exempt
def books_delete(request, book_id):
    """DELETE /api/books/delete/<book_id>/"""
    if request.method not in ('DELETE', 'POST'):
        return error("Method not allowed", 405)
    try:
        book = Book.objects.get(book_id=book_id)
    except Book.DoesNotExist:
        return error("Book not found", 404)
    book.delete()
    return success(message="Book deleted successfully")


@csrf_exempt
def books_search(request):
    """GET /api/books/search/?q=&filter=title|author|category"""
    q      = request.GET.get('q', '').lower()
    filter_by = request.GET.get('filter', 'title')
    qs = Book.objects.all()
    if q:
        if filter_by == 'author':
            qs = qs.filter(author__icontains=q)
        elif filter_by == 'category':
            qs = qs.filter(category__icontains=q)
        else:
            qs = qs.filter(title__icontains=q)

    data = [{
        "id": b.id, "book_id": b.book_id, "title": b.title,
        "author": b.author, "category": b.category,
        "description": b.description, "status": b.status,
        "image": b.image, "details": b.details
    } for b in qs]
    return success(data)


# ─────────────────────────────  USERS  ──────────────────────────────

@csrf_exempt
def user_signup(request):
    """POST /api/users/signup/"""
    if request.method != 'POST':
        return error("Method not allowed", 405)
    try:
        body = json.loads(request.body)
    except Exception:
        return error("Invalid JSON body")

    username  = body.get('username', '').strip()
    email     = body.get('email', '').strip()
    password  = body.get('password', '').strip()
    user_type = body.get('user_type', 'user').strip()

    if not all([username, email, password]):
        return error("username, email and password are required")
    if len(password) < 8:
        return error("Password must be at least 8 characters")
    if LibraryUser.objects.filter(email=email).exists():
        return error("Email already registered")
    if LibraryUser.objects.filter(username=username).exists():
        return error("Username already taken")

    user = LibraryUser.objects.create(
        username=username, email=email,
        password=password, user_type=user_type
    )
    return success({"id": user.id, "username": user.username, "user_type": user.user_type}, "Account created successfully")


@csrf_exempt
def user_login(request):
    """POST /api/users/login/"""
    if request.method != 'POST':
        return error("Method not allowed", 405)
    try:
        body = json.loads(request.body)
    except Exception:
        return error("Invalid JSON body")

    email    = body.get('email', '').strip()
    password = body.get('password', '').strip()

    if not email or not password:
        return error("Email and password are required")
    try:
        user = LibraryUser.objects.get(email=email, password=password)
    except LibraryUser.DoesNotExist:
        return error("Invalid email or password", 401)

    return success({
        "id": user.id, "username": user.username,
        "email": user.email, "user_type": user.user_type
    }, "Login successful")


@csrf_exempt
def admin_login(request):
    """POST /api/admin/login/"""
    if request.method != 'POST':
        return error("Method not allowed", 405)
    try:
        body = json.loads(request.body)
    except Exception:
        return error("Invalid JSON body")

    email    = body.get('email', '').strip()
    password = body.get('password', '').strip()

    if not email or not password:
        return error("Email and password are required")
    try:
        user = LibraryUser.objects.get(email=email, password=password, user_type='admin')
    except LibraryUser.DoesNotExist:
        return error("Invalid admin credentials", 401)

    return success({"id": user.id, "username": user.username, "user_type": user.user_type}, "Admin login successful")


def users_list(request):
    """GET /api/users/"""
    users = LibraryUser.objects.all()
    data = [{"id": u.id, "username": u.username, "email": u.email, "user_type": u.user_type} for u in users]
    return success(data)


# ──────────────────────────  BORROWED BOOKS  ────────────────────────

@csrf_exempt
def borrow_book(request):
    """POST /api/borrow/"""
    if request.method != 'POST':
        return error("Method not allowed", 405)
    try:
        body = json.loads(request.body)
    except Exception:
        return error("Invalid JSON body")

    book_id    = (body.get('book_id') or '').strip()
    user_email = (body.get('user_email') or '').strip()

    if not book_id:
        return error("book_id is required")
    try:
        book = Book.objects.get(book_id=book_id)
    except Book.DoesNotExist:
        return error("Book not found", 404)
    if book.status == 'borrowed':
        return error("Book is already borrowed")

    # Check user hasn't already borrowed it
    if user_email and BorrowedBook.objects.filter(book=book, user_email=user_email, is_returned=False).exists():
        return error("You have already borrowed this book")

    borrow = BorrowedBook.objects.create(book=book, user_email=user_email)
    book.status = 'borrowed'
    book.save()

    return success({
        "borrow_id": borrow.id,
        "title": book.title,
        "author": book.author,
        "borrow_date": str(borrow.borrow_date)
    }, "Book borrowed successfully")


@csrf_exempt
def return_book(request, borrow_id):
    """POST /api/borrow/return/<borrow_id>/"""
    if request.method not in ('POST', 'DELETE'):
        return error("Method not allowed", 405)
    try:
        borrow = BorrowedBook.objects.get(id=borrow_id, is_returned=False)
    except BorrowedBook.DoesNotExist:
        return error("Borrow record not found", 404)

    borrow.is_returned = True
    from django.utils import timezone
    borrow.return_date = timezone.now().date()
    borrow.save()

    borrow.book.status = 'available'
    borrow.book.save()

    return success(message="Book returned successfully")


def borrowed_list(request):
    """GET /api/borrow/?user_email=xxx"""
    user_email = request.GET.get('user_email', '')
    qs = BorrowedBook.objects.filter(is_returned=False)
    if user_email:
        qs = qs.filter(user_email=user_email)
    data = [{
        "borrow_id": b.id,
        "book_id": b.book.book_id,
        "title": b.book.title,
        "author": b.book.author,
        "user_email": b.user_email,
        "borrow_date": str(b.borrow_date),
    } for b in qs]
    return success(data)


# ─────────────────────────────  STATS  ──────────────────────────────

def stats(request):
    """GET /api/stats/"""
    total     = Book.objects.count()
    available = Book.objects.filter(status='available').count()
    borrowed  = Book.objects.filter(status='borrowed').count()
    users     = LibraryUser.objects.count()
    return success({
        "total_books": total,
        "available": available,
        "borrowed": borrowed,
        "registered_users": users
    })
