from django.shortcuts import render

# Create your views here.
def step_code(request):
    dic = ['printBlock', 'ifBlock', 'conditionalBlock', 'operationBlock', 'whileBlock', 'elseBlock', 'createVarBlock', 'makeVarBlock']
    context = {'id':dic, 'step':1}
    return render(request, 'blocks.html', context)