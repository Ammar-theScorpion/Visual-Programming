from django.shortcuts import render

def home(request):
    return render(request, 'GameBlocks/game_board.html', {})