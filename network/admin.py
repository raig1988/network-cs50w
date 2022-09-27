from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Post, Profile

class ProfileInline(admin.StackedInline):
    model = Profile
    can_delete = False
    verbose_name_plural = 'Profiles'

class CustomizedUserAdmin (UserAdmin):
    inlines = (ProfileInline, )

admin.site.register(User, CustomizedUserAdmin)
admin.site.register(Post)
admin.site.register(Profile)