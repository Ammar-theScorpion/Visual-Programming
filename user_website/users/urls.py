from django.urls import path, include
from users.views import dashboard,register

urlpatterns = [
path("dashboard/", dashboard, name="dashboard"),
path("accounts/", include("django.contrib.auth.urls")),
path("register/", register, name="register"),
]