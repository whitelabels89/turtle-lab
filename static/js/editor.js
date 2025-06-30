// Global variables
let codeEditor;
let savedPrograms = [];

// Debug console function
function debugLog(message, type = 'info') {
    const console = document.getElementById('debugConsole');
    if (!console) return;
    
    const timestamp = new Date().toLocaleTimeString();
    const colorClass = {
        'info': 'text-info',
        'success': 'text-success',
        'warning': 'text-warning',
        'error': 'text-danger'
    }[type] || 'text-light';
    
    const logEntry = document.createElement('div');
    logEntry.className = colorClass;
    logEntry.innerHTML = `[${timestamp}] ${message}`;
    
    console.appendChild(logEntry);
    console.scrollTop = console.scrollHeight;
}

function clearDebugConsole() {
    const console = document.getElementById('debugConsole');
    if (console) {
        console.innerHTML = '<div class="text-success">Console cleared...</div>';
    }
}

function showStopButton() {
    document.getElementById('stopBtn').style.display = 'inline-block';
    document.getElementById('runBtn').style.display = 'none';
}

function hideStopButton() {
    document.getElementById('stopBtn').style.display = 'none';
    document.getElementById('runBtn').style.display = 'inline-block';
}

// Initialize CodeMirror editor
document.addEventListener('DOMContentLoaded', function() {
    // Initialize CodeMirror
    codeEditor = CodeMirror.fromTextArea(document.getElementById('codeEditor'), {
        mode: 'python',
        theme: 'dracula',
        lineNumbers: true,
        indentUnit: 4,
        indentWithTabs: false,
        lineWrapping: true,
        autoCloseBrackets: true,
        matchBrackets: true,
        extraKeys: {
            'Tab': function(cm) {
                cm.replaceSelection('    ');
            },
            'Ctrl-Enter': runCode,
            'Cmd-Enter': runCode
        }
    });

    // Load saved programs from localStorage
    loadSavedPrograms();

    // Event listeners
    setupEventListeners();
    
    // Show welcome message
    showWelcomeMessage();
});

function setupEventListeners() {
    // Run button
    document.getElementById('runBtn').addEventListener('click', runCode);
    
    // Clear button
    document.getElementById('clearBtn').addEventListener('click', clearCanvas);
    
    // Save button
    document.getElementById('saveBtn').addEventListener('click', saveProgram);
    
    // Clear console button
    document.getElementById('clearConsoleBtn').addEventListener('click', clearDebugConsole);
    
    // Stop button
    document.getElementById('stopBtn').addEventListener('click', function() {
        debugLog('Stop button clicked', 'warning');
        if (turtleCanvas) {
            turtleCanvas.stopAnimation();
        }
        hideStopButton();
        showSuccessMessage('Animation stopped!');
    });
    
    // Example buttons
    document.querySelectorAll('.example-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const code = this.getAttribute('data-code');
            codeEditor.setValue(code);
            showSuccessMessage('Example loaded! Click "Run Code" to see it in action.');
        });
    });
    
    // Quick command buttons
    document.querySelectorAll('.quick-cmd').forEach(btn => {
        btn.addEventListener('click', function() {
            const cmd = this.getAttribute('data-cmd');
            insertQuickCommand(cmd);
        });
    });
    
    // Color buttons
    document.querySelectorAll('.color-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const color = this.getAttribute('data-color');
            insertColorCommand(color);
        });
    });
    
    // Speed slider
    document.getElementById('speedSlider').addEventListener('input', function() {
        const speed = parseInt(this.value);
        if (turtleCanvas) {
            turtleCanvas.setSpeed(speed);
        }
    });
    
    // Undo/Redo buttons
    document.getElementById('undoBtn').addEventListener('click', function() {
        codeEditor.undo();
    });
    
    document.getElementById('redoBtn').addEventListener('click', function() {
        codeEditor.redo();
    });
}

async function runCode() {
    const runBtn = document.getElementById('runBtn');
    const code = codeEditor.getValue();
    
    debugLog('Starting code execution...', 'info');
    
    if (!code.trim()) {
        debugLog('No code provided', 'warning');
        showError('Please write some turtle code first!');
        return;
    }
    
    // Add loading state
    runBtn.classList.add('loading');
    runBtn.disabled = true;
    
    try {
        debugLog('Sending code to parser...', 'info');
        
        // Parse the code
        const response = await fetch('/api/parse-code', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code: code })
        });
        
        const result = await response.json();
        debugLog(`Parser response: ${result.success ? 'Success' : 'Failed'}`, result.success ? 'success' : 'error');
        
        if (result.success) {
            debugLog(`Parsed ${result.commands.length} commands`, 'info');
            
            // Show stop button during execution
            showStopButton();
            
            // Clear canvas and execute commands
            turtleCanvas.reset();
            
            // Expand loops in commands
            const expandedCommands = expandLoops(result.commands);
            debugLog(`Expanded to ${expandedCommands.length} total commands`, 'info');
            
            // Execute the turtle commands
            debugLog('Executing turtle commands...', 'info');
            await turtleCanvas.executeCommands(expandedCommands);
            
            debugLog('Execution completed successfully!', 'success');
            hideStopButton();
            showSuccessMessage('Code executed successfully! 🐢');
        } else {
            debugLog(`Parse error: ${result.error}`, 'error');
            showError(result.error || 'Failed to parse the code');
        }
    } catch (error) {
        debugLog(`Runtime error: ${error.message}`, 'error');
        console.error('Error running code:', error);
        showError('Failed to run the code. Please check your syntax.');
    } finally {
        // Remove loading state
        runBtn.classList.remove('loading');
        runBtn.disabled = false;
        hideStopButton();
    }
}

function expandLoops(commands) {
    const expanded = [];
    let i = 0;
    
    while (i < commands.length) {
        const command = commands[i];
        
        if (command.type === 'start_loop') {
            // Find the commands inside the loop
            const loopCommands = [];
            let loopDepth = 1;
            i++; // Move past the start_loop command
            
            while (i < commands.length && loopDepth > 0) {
                if (commands[i].type === 'start_loop') {
                    loopDepth++;
                } else if (commands[i].type === 'end_loop') {
                    loopDepth--;
                }
                
                if (loopDepth > 0) {
                    loopCommands.push(commands[i]);
                }
                i++;
            }
            
            // Expand the loop
            for (let j = 0; j < command.iterations; j++) {
                expanded.push(...expandLoops(loopCommands));
            }
        } else {
            expanded.push(command);
            i++;
        }
    }
    
    return expanded;
}

function clearCanvas() {
    if (turtleCanvas) {
        turtleCanvas.reset();
        showSuccessMessage('Canvas cleared! 🧹');
    }
}

function insertQuickCommand(command) {
    const cursor = codeEditor.getCursor();
    const line = codeEditor.getLine(cursor.line);
    
    // Insert the command with proper indentation
    let insertion = command;
    if (line.trim() === '') {
        insertion = 'my_turtle.' + command;
    } else {
        insertion = '\nmy_turtle.' + command;
    }
    
    codeEditor.replaceRange(insertion, cursor);
    codeEditor.focus();
}

function insertColorCommand(color) {
    const cursor = codeEditor.getCursor();
    const insertion = `my_turtle.color("${color}")`;
    
    codeEditor.replaceRange('\n' + insertion, cursor);
    codeEditor.focus();
    
    showSuccessMessage(`Added ${color} color command!`);
}

function saveProgram() {
    const code = codeEditor.getValue();
    if (!code.trim()) {
        showError('Nothing to save! Write some code first.');
        return;
    }
    
    const name = prompt('Enter a name for your program:');
    if (!name) return;
    
    const program = {
        name: name,
        code: code,
        timestamp: Date.now()
    };
    
    savedPrograms.push(program);
    localStorage.setItem('turtlePrograms', JSON.stringify(savedPrograms));
    
    showSuccessMessage(`Program "${name}" saved successfully! 💾`);
}

function loadSavedPrograms() {
    const saved = localStorage.getItem('turtlePrograms');
    if (saved) {
        savedPrograms = JSON.parse(saved);
    }
}

function showError(message) {
    const errorModal = new bootstrap.Modal(document.getElementById('errorModal'));
    document.getElementById('errorMessage').textContent = message;
    errorModal.show();
}

function showSuccessMessage(message) {
    // Create success message element
    const successDiv = document.createElement('div');
    successDiv.className = 'alert alert-success alert-dismissible fade show success-message';
    successDiv.innerHTML = `
        <i class="fas fa-check-circle me-2"></i>
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(successDiv);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
        if (successDiv.parentNode) {
            successDiv.remove();
        }
    }, 3000);
}

function showWelcomeMessage() {
    setTimeout(() => {
        showSuccessMessage('Welcome to Turtle Graphics Playground! 🐢 Try running the example code or pick one from the examples above.');
    }, 500);
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + Enter to run code
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        runCode();
    }
    
    // Escape to stop animation
    if (e.key === 'Escape' && turtleCanvas) {
        turtleCanvas.stopAnimation();
        showSuccessMessage('Animation stopped!');
    }
});

// Auto-save code to localStorage
setInterval(() => {
    if (codeEditor) {
        localStorage.setItem('currentTurtleCode', codeEditor.getValue());
    }
}, 5000);

// Load auto-saved code on page load
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        const autoSaved = localStorage.getItem('currentTurtleCode');
        if (autoSaved && codeEditor && !codeEditor.getValue().trim()) {
            codeEditor.setValue(autoSaved);
        }
    }, 100);
});
