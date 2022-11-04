from django.urls import path 
from . import views
urlpatterns = [
    path('', views.all_view, name='all_view'),
    path('<int:pk>/', views.get_view, name='get_view'),
]