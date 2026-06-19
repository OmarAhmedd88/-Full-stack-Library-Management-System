from django.urls import path
from . import views

urlpatterns = [
    # Books
    path('books/',                    views.books_list,    name='books-list'),
    path('books/add/',                views.books_add,     name='books-add'),    #omar
    path('books/search/',             views.books_search,  name='books-search'),
    path('books/update/<str:book_id>/', views.books_update, name='books-update'), #omar (edit)
    path('books/delete/<str:book_id>/', views.books_delete, name='books-delete'),#omar

    # Users
    path('users/',                    views.users_list,    name='users-list'),
    path('users/signup/',             views.user_signup,   name='user-signup'),
    path('users/login/',              views.user_login,    name='user-login'),
    path('admin/login/',              views.admin_login,   name='admin-login'),

    # Borrowed books
    path('borrow/',                   views.borrowed_list, name='borrow-list'),
    path('borrow/add/',               views.borrow_book,   name='borrow-book'),
    path('borrow/return/<int:borrow_id>/', views.return_book, name='return-book'),

    # Stats
    path('stats/',                    views.stats,         name='stats'),
]
