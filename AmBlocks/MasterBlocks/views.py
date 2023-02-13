from django.shortcuts import render

# Create your views here.


def mainCompiler(request):
    return render(request, 'MasterBlocks/Am-html/main.html', {})