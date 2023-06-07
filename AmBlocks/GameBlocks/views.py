from django.shortcuts import render

def home(request):
    dic = ['colorBlock', 'colourBlock', 'moveBlock','turnBlock','penBlock', 'counterBlock','conditionBlock', 'functionBlock', 'ifBlock', 'assigmnemtBlock', 'operationBlock', 'elseBlock','whileBlock', 'make_varBlock']
    context = {'id':dic,  'my_template': 'GameBlocks/game_board.html', 'step': 'game'}
    return render(request, 'blocks.html', context)