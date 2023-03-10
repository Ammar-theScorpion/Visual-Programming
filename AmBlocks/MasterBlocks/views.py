from django.shortcuts import render
from django.http import Http404
from .models import Code, Problem
# Create your views here.

def error_404(request, exception=None):
    return render(request, '404.html')


def renderProblems(request):
    context = {'problems': Problem.objects.all()}
    return render(request, 'MasterBlocks/Am-html/problemsList.html', context)


def problem(request, pname):
    try:
        problem = Problem.objects.get(pname=pname)
        context = {'problem':problem}
        return render(request, 'MasterBlocks/Am-html/problemPage.html', context)
    except:
        return error_404(request)
        #raise Http404('problem does not exist')
    
    

def mainCompiler(request): # web request -> web response
    return render(request, 'MasterBlocks/Am-html/main.html', {})