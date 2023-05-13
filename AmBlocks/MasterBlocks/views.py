from django.shortcuts import render
from django.http import Http404
from .models import Problem
import socket
import pickle
# Create your views here.

def error_404(request, exception=None):
    return render(request, '404.html')


def renderProblems(request):
    context = {'problems': Problem.objects.all()}
    return render(request, 'MasterBlocks/Am-html/problemsList.html', context)


def problem(request, pname):
    
    problem = Problem.objects.get(pname=pname)
    context = {'problem':problem}
    dic = [ 'eachBlock', 'listBlock', 'counterBlock','printBlock' ,'conditionalBlock','multiConditionBlock', 'functionBlock','classBlock', 'ifBlock', 'assigmnemtBlock', 'operationBlock', 'elseBlock','whileBlock', 'makeVarBlock']
    context = {'id':dic}
    return render(request, 'blocks.html', context)
        #raise Http404('problem does not exist')
    
    

def mainCompiler(request): # web request -> web response
    dic = ['printBlock', 'ifBlock', 'conditionalBlock', 'operationBlock', 'whileBlock', 'elseBlock', 'createVarBlock', 'makeVarBlock', 'multiConditionBlock']
    context = {'id':dic}
    return render(request, 'blocks.html', context)
