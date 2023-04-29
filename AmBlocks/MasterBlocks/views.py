from django.shortcuts import render
from django.http import Http404
from .models import Problem
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
        dic = [ 'functionBlock', 'callBlock']
        context = {'id':dic}
        return render(request, 'blocks.html', context)
    except:
        return error_404(request)
        #raise Http404('problem does not exist')
    
    

def mainCompiler(request): # web request -> web response
    dic = ['printBlock', 'ifBlock', 'conditionalBlock', 'operationBlock', 'whileBlock', 'elseBlock', 'createVarBlock', 'makeVarBlock', 'multiConditionBlock']
    context = {'id':dic}
    return render(request, 'blocks.html', context)
