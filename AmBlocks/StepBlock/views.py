from django.shortcuts import render

# Create your views here.
def step_code(request):
    dic = ['printBlock', 'eachBlock', 'breakBlock', 'returnBlock','listBlock','stringBlock', 'counterBlock','conditionBlock', 'functionBlock', 'ifBlock', 'assigmnemtBlock', 'operationBlock','create_listBlock','create_setBlock', 'makeHashBlock','mathBlock', 'elseBlock','whileBlock', 'make_varBlock']
    context = {'id':dic,
                'my_template': 'TutorialsBlocks/tutorials.html', 'step':1, 'debug':1}
    return render(request, 'blocks.html', context)   
