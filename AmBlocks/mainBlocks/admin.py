from django.contrib import admin
from .models import Problem
from .models import Profile
# Register your models here.
admin.site.register(Profile)
admin.site.register(Problem)