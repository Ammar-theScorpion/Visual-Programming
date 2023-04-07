"""AmBlocks URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from .views import test_code
urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('mainBlocks.urls')),
    path('game/', include('GameBlocks.urls')),
    path('users/', include("mainBlocks.urls")),
    path('stepbystep/', include("StepBlock.urls")),
    path('problems/', include("MasterBlocks.urls")),
    path('tutorial/', include("TutorialsBlocks.urls")),
    path('test_code/', test_code, name='test_code'),

]

handler404 = 'MasterBlocks.views.error_404'