from django.urls import path

from . import views

urlpatterns =[
    path("", views.index, name="index"),
    path("<int:post_id>", views.get_post, name="post"),
    path("cat/", views.get_category, name="post"),
    path("cat/<int:cat_id>/", views.get_category_id, name="post"),
]