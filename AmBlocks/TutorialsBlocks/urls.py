from django.urls import path
from .views import*
app_name = "tutorial"

urlpatterns = [
    path('<str:tname>/', renderTutorials, name='renderTutorials'),
    path('test_code/<str:valid_code>/<str:code>', test_code, name='test_code'),
]
