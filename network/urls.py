
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    #API calls
    path("post", views.post, name="post"),
    path("allposts/<str:counter>", views.allposts, name="allposts"),
    path("profile/<int:user>", views.profile, name="profile"),
    path("posts_by_user/<str:user>", views.post_by_user, name="post_by_user"),
    path("follow/<int:user>", views.follow, name="follow"),
    path("following_posts/<str:counter>", views.following_posts, name="following_posts"),
    path("edit_post/<int:post_id>", views.edit_post, name="edit_post"),
    path("like_post/<int:post_id>", views.like_post, name="like_post")
]
