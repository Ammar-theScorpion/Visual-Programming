from TutorialsBlocks.models import Tutorial
from MasterBlocks.models import Problem
from django.http import HttpResponse
import urllib.parse
def test_code(request):
    body = request.body
    decoded_str = urllib.parse.unquote(body.decode('utf-8'))

    # Split the string on the '&' character to separate the parameters
    param_strings = decoded_str.split('&')
    print(param_strings)
    # Create a dictionary to store the parameter names and values
    params = {}

    # Split each parameter string on the '=' character to extract the name and value
    user_code = param_strings[0].split('=', 1)[1]
    tname = param_strings[1].split('=', 1)[1]

    # Extract the values of the text and tname parameters

    print(user_code)  # Output: user code
    print(tname)  # Output: 44
    valid_code=''
    try:
        valid_code = Tutorial.objects.get(tname=tname).valid_code
        valid_code = Problem.objects.get(pname=tname).valid_code
                
    except:
        pass
    
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
        valid_result = valid_output.getvalue() 
    with io.StringIO() as user_output, redirect_stdout(user_output):
        exec(compiled_user)
        user_result = user_output.getvalue()

    code = 'f'
    if user_result==valid_result:
        code = 't'
    return HttpResponse([user_result, code])  