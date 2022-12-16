from django.shortcuts import render
from datetime import datetime
# Create your views here.

def say_hi(requset, x):
    dinos = {
        'l':[
            'AL',
            'Ao',
            'Av',
            'Ae',
            'A ',
            'Am',
            'Ja',
            'Jm',
            'Ja',
            'J💕',
        ],
        'now':datetime.now()
    }
    return render(requset, x+'.html', {'dinos':dinos})

