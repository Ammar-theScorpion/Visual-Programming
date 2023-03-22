from django.urls import path
from .views import*
appname='mainBlocks'
urlpatterns = [
    path('', home, name='home'),
    path('profile', profile_request, name='profile_request'),
    path('login/', login_request, name='login_request'),
    path('logout/', logout_request, name='logout_request'),
    path('register/', register_request, name='register_request'),
]
