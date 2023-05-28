from django.shortcuts import render, redirect, reverse
from .models import Tutorial
from mainBlocks.forms import UserCodeForm
from mainBlocks.models import Problem, Profile
from django.contrib.auth.models import User
# Create your views here.

def renderTutorials(request, tname):
  

    form = UserCodeForm()
    tutorial = Tutorial.objects.get(tname=tname)
    user = User.objects.get(username=request.user.username)
    if request.method == 'POST':
        form = UserCodeForm(request.POST)
        print(form)
        if form.is_valid():
            user_code = form.cleaned_data['user_code']
            p = Problem(problem_id=tname, submission_status="submitted", user_code=user_code)
            p.user = user
            p.save()
            next_tutorial = Tutorial.objects.filter(sequence__gt=tutorial.sequence).order_by('sequence').first()
            print('se', tutorial.sequence)
            print('se', next_tutorial)

            if next_tutorial:
                return redirect(reverse('tutorial:renderTutorials', args=[next_tutorial.tname]))
        else:
            print(form.errors)
    else:
        form = UserCodeForm()

    text = tutorial.block_id.split(' ')
    dic=[]
    profile = user.profile
    user_code = profile.problems.filter(problem_id = tname)
    if user_code.exists():
        user_code = user_code.first().user_code
    else:
        user_code = ''
    for id in text:
        dic.append(id)
    context = {
        'my_template': 'TutorialsBlocks/tutorials.html',
        'tutorial': tutorial,
        'id': dic,
        'form': form,
        'prev_code': user_code
    }

        
    return render(request, 'blocks.html', context)


