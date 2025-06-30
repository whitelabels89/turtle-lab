import os
import logging
from flask import Flask, render_template, request, jsonify
from werkzeug.middleware.proxy_fix import ProxyFix
import json
import re
from examples import get_examples

logging.basicConfig(level=logging.DEBUG)

app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "turtle-playground-secret-key")
app.wsgi_app = ProxyFix(app.wsgi_app, x_proto=1, x_host=1)

@app.route('/')
def index():
    """Main playground page"""
    examples = get_examples()
    return render_template('index.html', examples=examples)

@app.route('/api/parse-code', methods=['POST'])
def parse_code():
    """Parse Python turtle code and convert to JavaScript commands"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'error': 'No data provided'})
        code = data.get('code', '')
        if not code.strip():
            return jsonify({'success': False, 'error': 'No code provided'})
        
        # Parse the turtle commands
        commands = parse_turtle_code(code)
        return jsonify({'success': True, 'commands': commands})
    
    except Exception as e:
        logging.error(f"Error parsing code: {str(e)}")
        return jsonify({'success': False, 'error': str(e)})

def parse_turtle_code(code):
    """Parse Python turtle code and extract drawing commands"""
    commands = []
    
    # Clean up the code and expand function calls
    lines = code.split('\n')
    
    # Track turtle variable names, loop variables, and functions
    turtle_vars = set()
    loop_stack = []
    functions = {}
    current_function = None
    
    # First pass: extract function definitions
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        if line.startswith('def ') and line.endswith(':'):
            func_name = line.split('def ')[1].split('(')[0].strip()
            func_body = []
            i += 1
            # Collect function body
            while i < len(lines):
                func_line = lines[i]
                if func_line.strip() and not func_line.startswith(' ') and not func_line.startswith('\t'):
                    break
                if func_line.strip():
                    func_body.append(func_line.strip())
                i += 1
            functions[func_name] = func_body
            continue
        i += 1
    
    # Second pass: process main code and expand function calls
    for line in lines:
        original_line = line
        line = line.strip()
        if not line or line.startswith('#'):
            continue
            
        # Skip function definitions
        if line.startswith('def ') and line.endswith(':'):
            continue
        if line in ['turtle.done()', 'screen.mainloop()']:
            commands.append({'type': 'done'})
            continue
            
        # Import statements and setup
        if any(keyword in line for keyword in ['import', 'screen =', 'Screen()', 'bgcolor']):
            continue
            
        # Turtle creation
        if '= turtle.Turtle()' in line:
            var_name = line.split('=')[0].strip()
            turtle_vars.add(var_name)
            commands.append({'type': 'create_turtle'})
            continue
            
        # Handle for loops - skip them in function expansion
        if line.startswith('for '):
            continue
            
        # Function calls - expand them
        for func_name in functions:
            if line == f'{func_name}()' or line.startswith(f'{func_name}()'):
                # Expand function body
                for func_line in functions[func_name]:
                    # Process each line in the function
                    parsed_func_commands = parse_single_line(func_line, turtle_vars)
                    commands.extend(parsed_func_commands)
                break
        else:
            # Regular turtle commands
            parsed_commands = parse_single_line(line, turtle_vars)
            commands.extend(parsed_commands)
    
    return commands

def parse_single_line(line, turtle_vars):
    """Parse a single line of turtle code"""
    commands = []
    line = line.strip()
    
    if not line or line.startswith('#'):
        return commands
        
    # Direct turtle commands
    if line.startswith('turtle.'):
        command = line.replace('turtle.', '')
        parsed_commands = parse_turtle_command(command)
        commands.extend(parsed_commands)
        return commands
        
    # Variable-based turtle commands
    for var in turtle_vars:
        if line.startswith(f'{var}.'):
            command = line.replace(f'{var}.', '')
            parsed_commands = parse_turtle_command(command)
            commands.extend(parsed_commands)
            break
    
    return commands

def parse_turtle_command(command_line):
    """Parse individual turtle command"""
    commands = []
    
    # Extract command name and arguments
    if '(' in command_line:
        cmd_name = command_line.split('(')[0]
        args_str = command_line.split('(')[1].rstrip(')')
        
        # Parse arguments
        args = []
        if args_str:
            # Handle string arguments with quotes
            if '"' in args_str or "'" in args_str:
                args = [args_str.strip('"\'')]
            else:
                args = [arg.strip() for arg in args_str.split(',') if arg.strip()]
    else:
        cmd_name = command_line
        args = []
    
    # Map turtle commands to our format
    if cmd_name == 'forward' or cmd_name == 'fd':
        try:
            distance = int(args[0]) if args else 100
        except ValueError:
            # Handle variable expressions like 'i * 2'
            distance = 100  # Default fallback
        commands.append({'type': 'forward', 'distance': distance})
    elif cmd_name == 'backward' or cmd_name == 'bk':
        try:
            distance = int(args[0]) if args else 100
        except ValueError:
            distance = 100  # Default fallback
        commands.append({'type': 'backward', 'distance': distance})
    elif cmd_name == 'left' or cmd_name == 'lt':
        try:
            angle = int(args[0]) if args else 90
        except ValueError:
            angle = 90  # Default fallback
        commands.append({'type': 'left', 'angle': angle})
    elif cmd_name == 'right' or cmd_name == 'rt':
        try:
            angle = int(args[0]) if args else 90
        except ValueError:
            angle = 90  # Default fallback
        commands.append({'type': 'right', 'angle': angle})
    elif cmd_name == 'color':
        color = args[0] if args else 'black'
        commands.append({'type': 'color', 'color': color})
    elif cmd_name == 'penup' or cmd_name == 'pu':
        commands.append({'type': 'penup'})
    elif cmd_name == 'pendown' or cmd_name == 'pd':
        commands.append({'type': 'pendown'})
    elif cmd_name == 'goto':
        try:
            x = float(args[0]) if len(args) > 0 else 0
        except (ValueError, TypeError):
            # Handle variables like 'x', 'window_x', etc.
            x = 0  # Default fallback
        try:
            y = float(args[1]) if len(args) > 1 else 0
        except (ValueError, TypeError):
            # Handle variables like 'y', 'window_y', etc.
            y = 0  # Default fallback
        commands.append({'type': 'goto', 'x': x, 'y': y})
    elif cmd_name == 'circle':
        try:
            radius = int(args[0]) if args else 50
        except (ValueError, TypeError):
            radius = 50  # Default fallback for variables
        commands.append({'type': 'circle', 'radius': radius})
    elif cmd_name == 'speed':
        speed = args[0] if args else 'normal'
        commands.append({'type': 'speed', 'speed': speed})
    elif cmd_name == 'begin_fill':
        commands.append({'type': 'begin_fill'})
    elif cmd_name == 'end_fill':
        commands.append({'type': 'end_fill'})
    elif cmd_name == 'fillcolor':
        color = args[0] if args else 'black'
        commands.append({'type': 'fillcolor', 'color': color})
    elif cmd_name == 'pensize' or cmd_name == 'width':
        try:
            size = int(args[0]) if args else 1
        except (ValueError, TypeError):
            size = 1  # Default fallback for variables
        commands.append({'type': 'pensize', 'size': size})
    elif cmd_name == 'dot':
        try:
            size = int(args[0]) if args else 5
        except (ValueError, TypeError):
            size = 5  # Default fallback
        color = args[1] if len(args) > 1 else 'black'
        commands.append({'type': 'dot', 'size': size, 'color': color})
    elif cmd_name == 'setheading':
        try:
            angle = int(args[0]) if args else 0
        except (ValueError, TypeError):
            angle = 0  # Default fallback
        commands.append({'type': 'setheading', 'angle': angle})
    elif cmd_name == 'hideturtle' or cmd_name == 'ht':
        commands.append({'type': 'hideturtle'})
    elif cmd_name == 'showturtle' or cmd_name == 'st':
        commands.append({'type': 'showturtle'})
    
    return commands

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
