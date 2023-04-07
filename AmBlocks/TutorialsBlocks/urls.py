from django.urls import path
from .views import*
app_name = "tutorial"

urlpatterns = [
    path('<str:tname>/', renderTutorials, name='renderTutorials'),
]
