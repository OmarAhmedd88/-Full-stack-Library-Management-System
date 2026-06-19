from django.db import models


class Book(models.Model):
    STATUS_CHOICES = [
        ('available', 'Available'),
        ('borrowed', 'Borrowed'),
    ]

    book_id = models.CharField(max_length=20, unique=True)
    title = models.CharField(max_length=255)
    author = models.CharField(max_length=255)
    category = models.CharField(max_length=100)
    description = models.TextField(blank=True, default='')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='available')
    image = models.CharField(max_length=255, blank=True, default='')
    details = models.CharField(max_length=255, blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.book_id} - {self.title}"

    class Meta:
        ordering = ['book_id']


class LibraryUser(models.Model):
    username = models.CharField(max_length=100, unique=True)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=255)  # plain text for demo; use hashing in production
    user_type = models.CharField(max_length=10, default='user')  # 'user' or 'admin'
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.username


class BorrowedBook(models.Model):
    book = models.ForeignKey(Book, on_delete=models.CASCADE, related_name='borrows')
    user = models.ForeignKey(LibraryUser, on_delete=models.CASCADE, related_name='borrowed_books', null=True, blank=True)
    user_email = models.EmailField(blank=True, default='')  # fallback when no session
    borrow_date = models.DateField(auto_now_add=True)
    return_date = models.DateField(null=True, blank=True)
    is_returned = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.book.title} borrowed by {self.user_email}"

    class Meta:
        ordering = ['-borrow_date']
