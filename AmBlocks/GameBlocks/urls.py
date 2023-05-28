from django.urls import path
from .views import*
appname='GameBlocks'
urlpatterns = [
    path('', home, name='home'),
]
