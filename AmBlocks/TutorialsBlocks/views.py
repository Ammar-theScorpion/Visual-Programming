from django.shortcuts import render, redirect, reverse
from .models import Tutorial
from .forms import UserCode
from io import StringIO
import sys
# Create your views here.

def renderTutorials(request, tname, result = None):
    form = UserCode()

    tutorial = Tutorial.objects.get(tname=tname)
    if request.method == 'POST':
        form = UserCode(request.POST)
        if form.is_valid():
            form.save()
            result = test_code(tutorial.valid_code, form.cleaned_data['user_code'])
            text = tutorial.block_id.split(' ')
            dic=[]
            for id in text:
                dic.append(id)
            context = {'tutorial': tutorial, 'id':dic, 'form': form, 'result':result[0]}
            return render(request, 'blocks.html', context)
            if result:
                next_tutorial = Tutorial.objects.filter(sequence__gt=tutorial.sequence).first()
                if next_tutorial:
                    return redirect(reverse('tutorial:renderTutorials', args=[next_tutorial.tname]))
            else:
                return render(request, '404.html', {})

        else:
            form = UserCode()

    text = tutorial.block_id.split(' ')
    dic=[]
    for id in text:
        dic.append(id)
    context = {'tutorial': tutorial, 'id':dic, 'form': form, 'result':result}

    return render(request, 'blocks.html', context)

def test_code(valid_code, user_code):
    print(user_code, valid_code)
    """
    Compiles and runs the given valid and user code, and checks if their output is the same.
    Returns True if they produce the same output, False otherwise.
    """
    # Try compiling the valid code
    try:
        compiled_valid = compile(valid_code, "<string>", "exec")
    except SyntaxError:
        # If there's a syntax error in the valid code, we can't continue
        return False
    
    # Try compiling the user code
    try:
        compiled_user = compile(user_code, "<string>", "exec")
    except SyntaxError:
        # If there's a syntax error in the user code, we can't continue
        return False
    
    # Run the compiled code and capture their output
    import io
    from contextlib import redirect_stdout
    
    with io.StringIO() as valid_output, redirect_stdout(valid_output):
        exec(compiled_valid)
        valid_result = valid_output.getvalue().strip()
    
    with io.StringIO() as user_output, redirect_stdout(user_output):
        exec(compiled_user)
        user_result = user_output.getvalue().strip()
    
    # Compare their output
    return (user_result, valid_result == user_result)
