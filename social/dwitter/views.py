from django.shortcuts import render, redirect
from  django.contrib import messages
from .models import Profile, Dweet
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.forms import UserCreationForm
from .forms import DweetForm
from django.contrib.auth.decorators import login_required

def logout_user(request):
    logout(request)
    return redirect ('dwitter:login_registor')

def registerPage(request):
    form = UserCreationForm()
    contex = {'form':form}

    if request.method == "POST":
        f = UserCreationForm(request.POST)
        if f.is_valid():
            user = f.save(commit=False)
            user.username = user.username
            user.save()
            login(request, user)
            return redirect('dwitter:dashboard')
        else:
            messages.error(request, "fix things")
    return render(request, 'dwitter/login_registor.html', contex)
    
def login_page(request):
    page = 'login'
    if request.user.is_authenticated:
        return redirect('dwitter:dashboard')

    context = {'page':page}
    if request.method == "POST":
        username = request.POST.get('username')
        password = request.POST.get('password')
        try:
            user = User.objects.get(username=username)
        except:
            messages.error(request, 'user not found!')
        user = authenticate(request, username=username, password=password)

        if user is not None:
            login(request, user)
            return redirect('dwitter:dashboard')

        else:
            messages.error(request, 'password is not valid!')

    return render(request, 'dwitter/login_registor.html', context)


@login_required(login_url="dwitter:login_registor")
def dashboard(request):
    form = DweetForm(request.POST or None)
    if request.method == "POST":
        if form.is_valid():
            dweet = form.save(commit=False)
            dweet.user = request.user
            dweet.save()
            return redirect("dwitter:dashboard")
    followed_dweets = Dweet.objects.filter(
    user__profile__in=request.user.profile.follows.all()
    ).order_by("-created_at")
    return render(
    request,
    "dwitter/dashboard.html",
    {"form": form, "dweets": followed_dweets},
    )

@login_required(login_url="dwitter:login_registor")
def profile_list(request):
    profiles = Profile.objects.exclude(user=request.user)
    return render(request, "dwitter/profile_list.html", {"profiles": profiles})
    
@login_required(login_url="dwitter:login_registor")
def profile(request, pk):
    profile = Profile.objects.get(pk=pk)
    if request.method == "POST":
        current_user_profile = request.user.profile
        data = request.POST
        action = data.get("follow")
        if action == "follow":
            current_user_profile.follows.add(profile)
        elif action == "unfollow":
            current_user_profile.follows.remove(profile)
        current_user_profile.save()
    return render(request, "dwitter/profile.html", {"profile": profile})