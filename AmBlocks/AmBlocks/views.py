from TutorialsBlocks.models import Tutorial
from MasterBlocks.models import Problem
from django.http import HttpResponse
import urllib.parse

import asyncio
import threading
from threading import Condition

import websockets
import asyncio
import io
from contextlib import redirect_stdout
import textwrap

from . import generateTests

prompt = None
response = None
cond_send = Condition()
cond_recv = Condition()

in_memory_shared_storage = {} ## used only in debug mode to store the state of each var

t = None
def run_validcode(pname, valid_code, test_cases):

    valid_code+='\n' +f'res=[]\nfor i in range(len(test_cases)):\n\tres.append({pname}(test_cases[i]))\nprint(res)'


    try:
        compiled_valid = compile(valid_code, "<string>", "exec")
    except SyntaxError:
        
        return False
    
    with io.StringIO() as user_outpt, redirect_stdout(user_outpt):# open a stream for the temp io.String..buffer and redirect the out their
        exec(compiled_valid)
        valid_result = user_outpt.getvalue()
    return valid_result.strip()

def extend_usercode(usercode, problem, state, valid_code):
    res = []
    
    if state == 'Run':
        tests = problem.testcode_set.all()
    else: # submit code # generate random test cases 
        tests = generateTests.generate(problem.test_directives.split(',')) 
        res = run_validcode(problem.tname, valid_code, tests)

    test = []

    for i in range(len(tests)):
        if state=='Run':
            test.append(tests[i].test)
            res.append(tests[i].expected_output)
        else:
            test.append(tests[i])

    usercode+='\n' +f'for i in range(len({test})):\n\tif {problem.tname}({test}[i]) != {res}[i]:\n\t\tprint("error at", ({test}[i]), "expected", ({res}[i]))\nprint(True)'
    return usercode


def store_in_memo(code):
    if '=' in code:
        dec = code.split('=')
        name = dec[0].strip()
        to = dec[1].strip()
        in_memory_shared_storage[name] = to


running = True
def test_code(request):
    async def server(socket):
        global response, prompt
        while running:
            with cond_send:
                while prompt is None: 
                    cond_send.wait()
            await socket.send(prompt)
            prompt = None
            response = await socket.recv()
            with cond_recv:
                cond_recv.notify()

    def start_server():
        asyncio.set_event_loop(asyncio.new_event_loop())
        serverc = websockets.serve(server, "localhost", 8080)
        asyncio.get_event_loop().run_until_complete(serverc)
        try:
            asyncio.get_event_loop().run_forever()
        finally:
            asyncio.get_event_loop().close()

    global t
    if t== None:
        print('threading')
        t = threading.Thread(target=start_server)
        t.start()

    body = request.body
    decoded_str = urllib.parse.unquote(body.decode('utf-8'))
    param_strings = decoded_str.split('&')
    # Create a dictionary to store the parameter names and values
    params = {}
    print(param_strings)


    user_code = param_strings[0].split('=', 1)[1]
    tname = ''
    try:
        tname = param_strings[1].split('=', 1)[1]
    except:
        pass
    valid_code=''   
    print(user_code)
    
    problem = None
    try:
        valid_code = Tutorial.objects.get(tname=tname).valid_code
    except:
        try:
            problem = Problem.objects.get(tname=tname)

            valid_code = problem.valid_code
            print(problem)
        except:
            pass

    
    # Run the compiled code and capture their output

    ##############################################    
    if problem!=None:
        state =  param_strings[2].split('=',1)[1].strip()
        user_code = extend_usercode(user_code, problem, state, valid_code)#
        print('code ',user_code)
    ##############################################   
    #  
    ################################
    #'store_in_memo(user_code)
    ################################
    

    """
    Compiles and runs the given valid and user code, and checks if their output is the same.
    Returns True if they produce the same output, False otherwise.
    """
    # Try compiling the valid code
    
    
    # Try compiling the user code
    try:
        compiled_user = compile(user_code, "<string>", "exec")
    except SyntaxError:
        return False
    


   # res = problem.testcode_set.expected_output
    #test = problem.testcode_set.test``
    user_output = io.StringIO()
    globals_dict = {'user_output': user_output, 'step': step}
    globals_dict.update(globals())

    
    with io.StringIO() as user_output, redirect_stdout(user_output): # open a stream for the temp io.String..buffer and redirect the out their
        exec(user_code, globals_dict)
        with cond_send:
            cond_send.notify()
        user_result = user_output.getvalue()

    print('dfdf',user_result)
    code = 't'
    if user_result.strip() == 'True':
        code = 't'
        
    return HttpResponse([user_result, code])  





def step(user_output, e):
    global prompt, response
    try:
        user_output = user_output.strip().splitlines()[-1]
    except:
        user_output = ''

    prompt = f'step {e} {user_output}'
    with cond_send:
        cond_send.notify()
    response = None
    with cond_recv:
        while response is None:
            cond_recv.wait()
        
    return response

def pen(col):
    todo = col

    global prompt, response
    prompt = f'pen {todo}'
    print(prompt)
    with cond_send:
        cond_send.notify()
    response = None
    with cond_recv:
        while response is None:
            cond_recv.wait()
        
    return response
def color(col):
    todo = col

    global prompt, response
    prompt = f'color {todo}'
    print(prompt)
    with cond_send:
        cond_send.notify()
    response = None
    with cond_recv:
        while response is None:
            cond_recv.wait()
        
    return response
def colour(r,g,b):

    global prompt, response
    prompt = f'colour {r},{g},{b}'
    print(prompt)
    with cond_send:
        cond_send.notify()
    response = None
    with cond_recv:
        while response is None:
            cond_recv.wait()
        
    return response

def move(d, b):
    todo = d
    doby = b

    global prompt, response
    prompt = f'move {todo} {doby}'

    with cond_send:
        cond_send.notify()
    response = None
    with cond_recv:
        while response is None:
            cond_recv.wait()
        
    return response

def turn(d, b):
    todo = d
    doby = b

    global prompt, response
    prompt = f'turn {todo} {doby}'

    with cond_send:
        cond_send.notify()
    response = None
    with cond_recv:
        while response is None:
            cond_recv.wait()
        
    return response

def custom_input(msg=''):
    global prompt, response
    prompt = msg
    with cond_send:
        cond_send.notify()
    response = None
    with cond_recv:
        while response is None:
            cond_recv.wait()

    return response