import json
from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse, HttpResponseNotFound
from django.shortcuts import render, get_object_or_404
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from django.core import serializers
from django.core.serializers.json import DjangoJSONEncoder
from django.core.paginator import Paginator
from django.views.generic import ListView


from .models import User, Post, Profile

def index(request):
    return render(request, "network/index.html")


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")

@csrf_exempt
@login_required
def post(request):
    if request.method == "POST":
        data = json.loads(request.body)
        newPostData = Post(user=request.user, content=data['content'])
        newPostData.save()
        return JsonResponse({"message": "Post created successfully."}, status=200)
    else:
        return HttpResponseNotFound('404')

def allposts(request, counter):
    if request.user.is_authenticated:
        viewing_user = Profile.objects.get(user=request.user)
        json_user = viewing_user.serialize_profile()
        posts = Post.objects.all()
        posts = posts.order_by("-date").all()
        paginator = Paginator(posts, 10)
        counter = request.GET.get('page')
        page_number = counter
        page_obj = paginator.get_page(page_number)
        return JsonResponse({
            "posts": [post.serialize_post() for post in page_obj],
            "pages": paginator.num_pages,
            "has_previous": page_obj.has_previous(),
            "has_next": page_obj.has_next(),
            "page_number": page_number,
            "viewing_user": json_user}
            ,safe=False)
    # no user logged in
    posts = Post.objects.all()
    posts = posts.order_by("-date").all()
    paginator = Paginator(posts, 10)
    counter = request.GET.get('page')
    page_number = counter
    page_obj = paginator.get_page(page_number)
    return JsonResponse({
        "posts": [post.serialize_post() for post in page_obj],
        "pages": paginator.num_pages,
        "has_previous": page_obj.has_previous(),
        "has_next": page_obj.has_next(),
        "page_number": page_number}
        ,safe=False)

@csrf_exempt
def following_posts(request, counter):
    profile = Profile.objects.get(user=request.user)
    follow_users = profile.follows.all()
    posts_list = []
    counter = request.GET.get('page')
    for user in follow_users:
        user_post = Post.objects.filter(user=user)
        user_post = user_post.order_by("-date").all()
        for post in user_post:
            ser_post = post.serialize_post()
            posts_list.append(ser_post)
    paginator = Paginator(posts_list, 10)
    page_obj = paginator.get_page(counter)
    context = {
        "following_posts" : [post for post in page_obj],
        "number_pages" : paginator.num_pages
    }
    return JsonResponse(context, safe=False)

def profile(request, user):
    try:
        user_profile = Profile.objects.get(user=user)
        f = user_profile.followers.all()
        print(f)
        
        context = {
            'user_profile' : user_profile.serialize_profile(),
            'same_user' : request.user,
            'following_users' : [user for user in f]
        }
        data = json.dumps(context, indent=4, sort_keys=True, default=str)
    except Profile.DoesNotExist:
        return JsonResponse({"error": "User does not exist"}, status=404)
    return HttpResponse(data, content_type='application/json')

def post_by_user(request, user):
    try:
        user = request.GET.get('user')
        user_post = Post.objects.filter(user=user)
        user_post = user_post.order_by("-date").all()
        paginator = Paginator(user_post, 10)
        counter = request.GET.get('page')
        page_number = counter
        page_obj = paginator.get_page(page_number)
    except Post.DoesNotExist:
        return JsonResponse({"error": "User has no posts."}, status=404)
    return JsonResponse({"posts": [post.serialize_post() for post in page_obj],
    "number_pages" : paginator.num_pages, "page_number": page_number}, safe=False)

@csrf_exempt
def follow(request, user):
    data = []
    if request.method == "PUT":
        # data received (request.user = Follower / user = Followed)
        data = json.loads(request.body)
        user = data.get("user")
        # user that is followed
        followed_user = User.objects.get(id=user)
        # check if Follower already follows user(Followed) in Followers list
        if Profile.objects.filter(user=request.user, follows=user).exists():
            # get Follower follows list & remove Followed from follows list
            profile_follower = Profile.objects.get(user=request.user)
            profile_follower.follows.remove(followed_user)
            # get Followed list & remove Follower from Followed followers list
            profile_followed = Profile.objects.get(user=followed_user)
            profile_followed.followers.remove(request.user)
            return JsonResponse({"success": 0,
            "remove_follow_count": profile_follower.follows.count(),
            "remove_follower_count": profile_followed.followers.count()}, status=200)
        # get Follower list & add Followed to the Follower follows list
        profile_follow = Profile.objects.get(user=request.user)
        profile_follow.follows.add(followed_user)
        # get Followed list & add Follower to Followed followers lists
        followed_list = Profile.objects.get(user=followed_user)
        followed_list.followers.add(request.user)
        return JsonResponse({'success': 1,
        "add_follow_count": profile_follow.follows.count() ,
        "add_follower_count": followed_list.followers.count()
        }, status=200)

@csrf_exempt
def like_post(request, post_id):
    if request.method == "PUT":
        # get data from form
        data = json.loads(request.body)
        post = data.get("post_id")
        # get user from list
        user = User.objects.get(id=request.user.id)
        if Post.objects.filter(id=post, likes=user).exists():
            post_remove = Post.objects.get(id=post)
            post_remove.likes.remove(user)
            return JsonResponse({"sucess": "post unliked", 
            "number_likes" : post_remove.likes.count()}, status=200)
        post_liked = Post.objects.get(id=post)
        post_liked.likes.add(user)
        
        return JsonResponse({"sucesss": "post liked", 
        "number_likes" : post_liked.likes.count()
        }, status=200)

@csrf_exempt
def edit_post(request, post_id):
    # identify post
    post = Post.objects.filter(id=post_id)
    # get form value to update post
    if request.method == 'POST':
        data = json.loads(request.body)
        #print(data["content"])
        post.update(content=data["content"])
        updated_post = Post.objects.get(id=post_id)
        return JsonResponse({"message": "Post created successfully.",
        "newpostcontent": updated_post.serialize_post()}, status=200)

