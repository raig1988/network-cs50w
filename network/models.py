from __future__ import unicode_literals
from django.contrib.auth.models import AbstractUser
from django.db.models.signals import *
from django.db import models
import datetime


class User(AbstractUser):
    pass


class Post(models.Model):
    user = models.ForeignKey(User,  on_delete=models.SET_DEFAULT, default="Anonymous", related_name="posts")
    content = models.TextField(max_length=250)
    date = models.DateTimeField(auto_now_add=True)
    likes = models.ManyToManyField(User, blank=True, related_name="likes")

    def __str__(self) -> str:
        return f"user : {self.user} - content: {self.content} - date: {self.date} - likes: {self.likes}"

    def serialize_post(self):
        return {
            "post_id" : self.id,
            "user_id" : self.user.id,
            "user": self.user.username,
            "content": self.content,
            "date": self.date.strftime("%b %d %Y, %I:%M %p"),
            "likes" : self.likes.count()
        }

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    date = models.DateTimeField(default=datetime.datetime.now)
    followers = models.ManyToManyField(User, related_name='followers', blank=True)
    follows = models.ManyToManyField(User, related_name='follows', blank=True)

    def __str__(self) -> str:
        return f"user: {self.user} - followers: {self.followers} - follows: {self.follows}"

    def serialize_profile(self):
        return {
            "user_id" : self.user.id,
            "user": self.user.username,
            "followers": self.followers.count(),
            "follows" : self.follows.count(),
        }
    
    def __unicode__(self):
        return unicode(self.username)

def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)

post_save.connect(create_user_profile, sender=User)
