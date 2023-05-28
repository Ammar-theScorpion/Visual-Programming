from django.shortcuts import render

# Create your views here.
def step_code(request):
    dic = [ 'eachBlock', 'listBlock', 'counterBlock','printBlock' ,'conditionalBlock','multiConditionBlock','classBlock', 'ifBlock', 'assigmnemtBlock', 'operationBlock','makeListBlock', 'makeHashBlock', 'elseBlock','whileBlock', 'makeVarBlock', 'conditionalBlock']
    context = {'id':dic,
                'my_template': 'TutorialsBlocks/tutorials.html', 'step':1}
    return render(request, 'blocks.html', context)   
