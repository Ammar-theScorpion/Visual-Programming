from django.shortcuts import render
from .models import Problem

# Create your views here.

def error_404(request, exception=None):
    return render(request, '404.html')


def renderProblems(request):
    context = {'problems': Problem.objects.all()}
    return render(request, 'MasterBlocks/Am-html/problemsList.html', context)


def problem(request, pname):
    
    problem = Problem.objects.get(tname=pname)
    context = {'problem':problem}
    tests = problem.testcode_set.all()
    dic = ['printBlock', 'eachBlock', 'breakBlock', 'returnBlock','listBlock','stringBlock', 'counterBlock','conditionBlock', 'functionBlock', 'ifBlock', 'assigmnemtBlock', 'operationBlock','create_listBlock','create_setBlock', 'makeHashBlock','mathBlock', 'elseBlock','whileBlock', 'make_varBlock']
    context = {'id':dic,
                'my_template': 'TutorialsBlocks/tutorials.html','tutorial':problem, 'tests':tests}
    return render(request, 'blocks.html', context)
 
        #raise Http404('problem does not exist')
    
    

def mainCompiler(request): # web request -> web response
    dic = ['printBlock', 'ifBlock', 'conditionalBlock', 'operationBlock', 'whileBlock', 'elseBlock', 'createVarBlock', 'makeVarBlock', 'multiConditionBlock']
    context = {'id':dic}
    return render(request, 'blocks.html', context)
