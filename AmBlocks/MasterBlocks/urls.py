from django.urls import path
from .views import*

urlpatterns = [
    path('', renderProblems, name='renderProblems'),
    path('<str:pname>/', problem, name='problem'),
    path('free-style/', mainCompiler, name='mainCompiler')
]
