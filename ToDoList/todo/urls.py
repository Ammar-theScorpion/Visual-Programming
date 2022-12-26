from django.contrib import admin
from django.urls import path
from todo import views

urlpatterns = [
    path("",
    views.ListListView.as_view(), name="index"),
    path("list/<int:list_id>/",
    views.ItemListView.as_view(), name="list"),
    path("list/add/", views.ListCreate.as_view(), name="list-add"),
    # CRUD patterns for ToDoItems
    path(
    "list/<int:list_id>/item/add/",
    views.ItemCreate.as_view(),
    name="item-add",
    ),
    path(
    "list/<int:list_id>/item/<int:pk>/",
    views.ItemUpdate.as_view(),
    name="item-update",
    ),
]