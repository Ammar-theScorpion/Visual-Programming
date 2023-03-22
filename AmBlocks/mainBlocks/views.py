from django.shortcuts import render, redirect, reverse
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.decorators import login_required
from django.contrib import messages
# Create your views here.

def home(request):
    return render(request, 'mainBlocks/index.html', {})

def profile_request(request):
    return render(request, 'mainBlocks/profile.html', {})

def login_request(request):
    page = 'login'
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')

        try:
            user = User.objects.get(username=username)
        except:
            messages.error(request, 'user does not exist')
        
        user = authenticate(request,username=username, password=password)
        if user is not None:
            login(request, user)
            return redirect(reverse('login_request').replace('users/login/', ''))
        else:
            messages.error(request, 'pass or name')

    return render(request, 'mainBlocks/login.html', {'page':page})


def logout_request(request):
    logout(request)
    return redirect(reverse('renderSignIn').replace('logout/', ''))


def register_request(request):
    form = UserCreationForm()
    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        if form.is_valid():
            user = form.save(commit=False)
            '''changes'''
            user.save()
            return redirect('login_request')
        else:
            messages.error(request, 'fill all fields')

    return render(request, 'mainBlocks/login.html', {'form':form})
