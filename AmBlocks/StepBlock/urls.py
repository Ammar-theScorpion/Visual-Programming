from django.urls import path
from .views import*

urlpatterns = [
    path('', step_code, name='step_code'),
]
