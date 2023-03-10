from django.shortcuts import render

# Create your views here.

def renderSignIn(request):
    return render(request, 'mainBlocks/signin.html', {})