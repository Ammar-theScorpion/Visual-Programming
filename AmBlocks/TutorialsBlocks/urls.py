from django.urls import path
from .views import*

urlpatterns = [
    path('<str:tname>/', renderTutorials, name='renderTutorials'),
]
