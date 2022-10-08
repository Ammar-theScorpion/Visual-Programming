from multiprocessing import context
from django.shortcuts import render
from django.http import HttpResponse
# Create your views here.

from .models import *
def index(request):
    posts = main_as_database.objects.all()
    '''
    output = ','.join([p.title for p in posts])
    content1 = '.'.join([p.content for p in posts])
    context = {'titles': output, 'content':content1}
    #return HttpResponse(output)
    return render(request,'posts/posts.html', context)
    '''
    context = {'posts':posts}
    return render(request, 'posts/posts.html', context)

def get_post(request, post_id):
    post = main_as_database.objects.get(id=post_id)
    context = {'post': post}
    return render(request, 'posts/post_id.html', context)

def page(re):
    return HttpResponse("I'm teird")


def get_category(request):
    cats = category.objects.all()
    context = {'cats': cats}
    return render(request, 'posts/disply_cat.html', context)

def get_category_id(request, cat_id):
    cat = category.objects.get(id = cat_id)
    context = {'cat_id':cat}
    return render(request, 'posts/disply_cat_id.html', context)
