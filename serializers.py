from rest_framework import serializers
from .models import Book, LibraryUser, BorrowedBook


class BookSerializer(serializers.ModelSerializer):
    class Meta:
        model = Book
        fields = ['id', 'book_id', 'title', 'author', 'category', 'description', 'status', 'image', 'details']


class LibraryUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = LibraryUser
        fields = ['id', 'username', 'email', 'user_type', 'created_at']


class BorrowedBookSerializer(serializers.ModelSerializer):
    title = serializers.CharField(source='book.title', read_only=True)
    author = serializers.CharField(source='book.author', read_only=True)
    book_id = serializers.CharField(source='book.book_id', read_only=True)

    class Meta:
        model = BorrowedBook
        fields = ['id', 'book_id', 'title', 'author', 'user_email', 'borrow_date', 'return_date', 'is_returned']
