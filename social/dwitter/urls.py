from django.urls import path
from .views import dashboard, profile_list, profile, login_page, logout_user,registerPage
app_name = "dwitter"
urlpatterns = [
    path("", dashboard, name="dashboard"),
    path("login/", login_page, name="login_registor"),
    path("logout/", logout_user, name="logout_user"),
    path("registor/", registerPage, name="registerPage"),
    path("profile_list/", profile_list, name="profile_list"),
    path("profile/<int:pk>", profile, name="profile"),
]