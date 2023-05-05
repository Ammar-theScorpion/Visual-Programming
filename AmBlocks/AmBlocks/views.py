from TutorialsBlocks.models import Tutorial
from MasterBlocks.models import Problem
from django.http import HttpResponse
import urllib.parse

import asyncio
import threading
from threading import Condition

import websockets
import asyncio
import websockets
prompt = None
response = None
cond_send = Condition()
cond_recv = Condition()
def test_code(request):
    running = True
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

    t = threading.Thread(target=start_server)
    t.start()

    body = request.body
    decoded_str = urllib.parse.unquote(body.decode('utf-8'))

    # Split the string on the '&' character to separate the parameters
    param_strings = decoded_str.split('&')
    # Create a dictionary to store the parameter names and values
    params = {}

    # Split each parameter string on the '=' character to extract the name and value
    user_code = param_strings[0].split('=', 1)[1]
    tname = param_strings[1].split('=', 1)[1]

    # Extract the values of the text and tname parameters

    print(user_code)  # Output: user code
    valid_code=''
    try:
        valid_code = Tutorial.objects.get(tname=tname).valid_code
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
        return False
    
    # Run the compiled code and capture their output
    import io
    from contextlib import redirect_stdout
    
    '''with io.StringIO() as valid_output, redirect_stdout(valid_output):
        print("ds")
        exec(compiled_valid)
        print("ds")
        valid_result = valid_output.getvalue() '''
    with io.StringIO() as user_output, redirect_stdout(user_output): # open a stream for the temp io.String..buffer and redirect the out their
        exec(compiled_user)
        with cond_send:
            cond_send.notify()
            
        running = False
        user_result = user_output.getvalue()
 
    code = 'f'
    if user_result=='f':
        code = 't'
    return HttpResponse([user_result, code])  



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