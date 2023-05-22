from django.shortcuts import render

def home(request):
    dic = ['colorBlock','moveBlock','turnBlock', 'eachBlock', 'listBlock', 'counterBlock','printBlock' ,'conditionalBlock','multiConditionBlock', 'functionBlock','classBlock', 'ifBlock', 'assigmnemtBlock', 'operationBlock','makeListBlock', 'makeHashBlock', 'elseBlock','whileBlock', 'makeVarBlock', 'conditionalBlock']
    context = {'id':dic,  'my_template': 'GameBlocks/game_board.html'}
    return render(request, 'blocks.html', context)