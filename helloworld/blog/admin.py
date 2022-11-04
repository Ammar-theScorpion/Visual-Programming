from django.contrib import admin
from .models import *
# Register your models here.
class PostAdmin(admin.ModelAdmin):
    pass
class CategoryAdmin(admin.ModelAdmin):
    pass
admin.site.register(Post, PostAdmin)
admin.site.register(Category, CategoryAdmin)