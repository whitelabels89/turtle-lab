class TurtleCanvas {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.turtle = {
            x: this.canvas.width / 2,
            y: this.canvas.height / 2,
            angle: 0, // 0 degrees = facing right
            penDown: true,
            color: 'black',
            fillColor: 'black',
            penSize: 1,
            filling: false,
            visible: true
        };
        this.speed = 5;
        this.animationQueue = [];
        this.isAnimating = false;
        this.fillPath = [];
        this.isFilling = false;
        
        this.reset();
    }
    
    reset() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Reset turtle position and state
        this.turtle.x = this.canvas.width / 2;
        this.turtle.y = this.canvas.height / 2;
        this.turtle.angle = 0;
        this.turtle.penDown = true;
        this.turtle.color = 'black';
        this.turtle.fillColor = 'black';
        this.turtle.penSize = 1;
        this.turtle.filling = false;
        this.turtle.visible = true;
        this.turtle.shape = 'turtle'; // Default shape
        
        // Clear animation queue
        this.animationQueue = [];
        this.isAnimating = false;
        this.fillPath = [];
        
        // Draw initial turtle
        this.drawTurtle();
    }
    
    drawTurtle() {
        if (!this.turtle.visible) return;
        
        const ctx = this.ctx;
        const size = 15;
        
        ctx.save();
        ctx.translate(this.turtle.x, this.turtle.y);
        ctx.rotate((this.turtle.angle - 90) * Math.PI / 180);
        
        const turtleColor = this.turtle.color || '#228B22';
        
        switch (this.turtle.shape) {
            case 'arrow':
                this.drawArrow(ctx, size, turtleColor);
                break;
            case 'circle':
                this.drawCircle(ctx, size, turtleColor);
                break;
            case 'square':
                this.drawSquare(ctx, size, turtleColor);
                break;
            case 'triangle':
                this.drawTriangle(ctx, size, turtleColor);
                break;
            default: // 'turtle'
                this.drawTurtleShape(ctx, size, turtleColor);
                break;
        }
        
        ctx.restore();
    }
    
    drawTurtleShape(ctx, size, color) {
        // Draw turtle shell (main body)
        ctx.fillStyle = color;
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(0, 0, size, size * 0.8, 0, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
        
        // Draw turtle head (lighter shade)
        const headColor = this.lightenColor(color, 30);
        ctx.fillStyle = headColor;
        ctx.beginPath();
        ctx.ellipse(0, -size * 0.6, size * 0.4, size * 0.6, 0, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
        
        // Draw shell pattern
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.beginPath();
        const hexSize = size * 0.3;
        for (let i = 0; i < 6; i++) {
            const angle = i * Math.PI / 3;
            const x = Math.cos(angle) * hexSize;
            const y = Math.sin(angle) * hexSize;
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.closePath();
        ctx.stroke();
        
        // Draw eyes
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(-3, -size * 0.8, 1.5, 0, 2 * Math.PI);
        ctx.arc(3, -size * 0.8, 1.5, 0, 2 * Math.PI);
        ctx.fill();
    }
    
    drawArrow(ctx, size, color) {
        ctx.fillStyle = color;
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, -size);
        ctx.lineTo(-size * 0.5, size * 0.5);
        ctx.lineTo(-size * 0.2, size * 0.5);
        ctx.lineTo(-size * 0.2, size);
        ctx.lineTo(size * 0.2, size);
        ctx.lineTo(size * 0.2, size * 0.5);
        ctx.lineTo(size * 0.5, size * 0.5);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }
    
    drawCircle(ctx, size, color) {
        ctx.fillStyle = color;
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, size, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
        
        // Direction indicator
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(0, -size * 0.5, 2, 0, 2 * Math.PI);
        ctx.fill();
    }
    
    drawSquare(ctx, size, color) {
        ctx.fillStyle = color;
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.fillRect(-size, -size, size * 2, size * 2);
        ctx.strokeRect(-size, -size, size * 2, size * 2);
        
        // Direction indicator
        ctx.fillStyle = '#000000';
        ctx.fillRect(-2, -size, 4, 4);
    }
    
    drawTriangle(ctx, size, color) {
        ctx.fillStyle = color;
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, -size);
        ctx.lineTo(-size, size);
        ctx.lineTo(size, size);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }
    
    // Helper function to lighten colors
    lightenColor(color, percent) {
        if (color.startsWith('#')) {
            const num = parseInt(color.replace("#", ""), 16);
            const amt = Math.round(2.55 * percent);
            const R = (num >> 16) + amt;
            const B = (num >> 8 & 0x00FF) + amt;
            const G = (num & 0x0000FF) + amt;
            return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 + 
                         (B < 255 ? B < 1 ? 0 : B : 255) * 0x100 + 
                         (G < 255 ? G < 1 ? 0 : G : 255)).toString(16).slice(1);
        }
        return color; // Return original if not hex
    }
    
    drawDot(size, color) {
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.arc(this.turtle.x, this.turtle.y, size / 2, 0, 2 * Math.PI);
        this.ctx.fill();
    }
    
    async executeCommands(commands) {
        if (this.isAnimating) {
            console.log('Animation already running, stopping previous animation');
            this.stopAnimation();
            await new Promise(resolve => setTimeout(resolve, 100)); // Wait for stop
        }
        
        console.log(`Starting animation with ${commands.length} commands`);
        this.isAnimating = true;
        this.animationQueue = [...commands];
        
        let commandIndex = 0;
        while (this.animationQueue.length > 0 && this.isAnimating) {
            const command = this.animationQueue.shift();
            commandIndex++;
            console.log(`Executing command ${commandIndex}/${commands.length}: ${command.type}`);
            
            try {
                await this.executeCommand(command);
            } catch (error) {
                console.error(`Error executing command ${command.type}:`, error);
                break;
            }
            
            // Add small delay to prevent browser freezing
            if (commandIndex % 10 === 0) {
                await new Promise(resolve => setTimeout(resolve, 1));
            }
        }
        
        console.log('Animation completed');
        this.isAnimating = false;
    }
    
    async executeCommand(command) {
        return new Promise(resolve => {
            const delay = Math.max(50, 500 - (this.speed * 50));
            
            switch (command.type) {
                case 'bgcolor':
                    // Set canvas background color
                    this.canvas.style.backgroundColor = command.color;
                    setTimeout(resolve, delay / 4);
                    break;
                case 'forward':
                    this.animateMovement(command.distance, resolve);
                    break;
                case 'backward':
                    this.animateMovement(-command.distance, resolve);
                    break;
                case 'left':
                    this.animateRotation(-command.angle, resolve);
                    break;
                case 'right':
                    this.animateRotation(command.angle, resolve);
                    break;
                case 'color':
                    this.turtle.color = command.color;
                    this.turtle.fillColor = command.color;
                    setTimeout(resolve, delay / 4);
                    break;
                case 'fillcolor':
                    this.turtle.fillColor = command.color;
                    setTimeout(resolve, delay / 4);
                    break;
                case 'penup':
                    this.turtle.penDown = false;
                    setTimeout(resolve, delay / 4);
                    break;
                case 'pendown':
                    this.turtle.penDown = true;
                    setTimeout(resolve, delay / 4);
                    break;
                case 'pensize':
                    this.turtle.penSize = command.size;
                    setTimeout(resolve, delay / 4);
                    break;
                case 'goto':
                    // Transform Python turtle coordinates to canvas coordinates
                    // Python turtle: (0,0) at center, Y+ up
                    // Canvas: (0,0) at top-left, Y+ down
                    const canvasX = command.x + this.canvas.width / 2;
                    const canvasY = this.canvas.height / 2 - command.y;
                    this.animateGoto(canvasX, canvasY, resolve);
                    break;
                case 'circle':
                    this.animateCircle(command.radius, resolve);
                    break;
                case 'begin_fill':
                    this.turtle.filling = true;
                    this.fillPath = [{x: this.turtle.x, y: this.turtle.y}];
                    setTimeout(resolve, delay / 4);
                    break;
                case 'end_fill':
                    if (this.turtle.filling && this.fillPath.length > 2) {
                        this.drawFill();
                    }
                    this.turtle.filling = false;
                    this.fillPath = [];
                    setTimeout(resolve, delay / 4);
                    break;
                case 'dot':
                    this.drawDot(command.size || 5, command.color || 'black');
                    setTimeout(resolve, delay / 4);
                    break;
                case 'setheading':
                    this.turtle.angle = command.angle || 0;
                    this.redraw();
                    setTimeout(resolve, delay / 4);
                    break;
                case 'hideturtle':
                    this.turtle.visible = false;
                    this.redraw();
                    setTimeout(resolve, delay / 4);
                    break;
                case 'showturtle':
                    this.turtle.visible = true;
                    this.redraw();
                    setTimeout(resolve, delay / 4);
                    break;
                case 'shape':
                    this.turtle.shape = command.shape || 'turtle';
                    this.redraw();
                    setTimeout(resolve, delay / 4);
                    break;
                case 'start_loop':
                    // Handle loop start - this is managed by the parser
                    setTimeout(resolve, delay / 4);
                    break;
                case 'begin_fill':
                    this.fillPath = [];
                    this.turtle.filling = true;
                    this.fillPath.push({x: this.turtle.x, y: this.turtle.y});
                    setTimeout(resolve, delay / 4);
                    break;
                case 'end_fill':
                    this.drawFill();
                    this.turtle.filling = false;
                    setTimeout(resolve, delay / 4);
                    break;
                default:
                    setTimeout(resolve, delay / 4);
            }
        });
    }
    
    animateMovement(distance, callback) {
        const steps = Math.max(10, Math.abs(distance) / 5);
        const stepDistance = distance / steps;
        const delay = Math.max(20, 300 - (this.speed * 30));
        let currentStep = 0;
        
        const animate = () => {
            if (currentStep >= steps) {
                this.redraw();
                callback();
                return;
            }
            
            const oldX = this.turtle.x;
            const oldY = this.turtle.y;
            
            this.turtle.x += Math.cos(this.turtle.angle * Math.PI / 180) * stepDistance;
            this.turtle.y += Math.sin(this.turtle.angle * Math.PI / 180) * stepDistance;
            
            if (this.turtle.penDown) {
                this.ctx.strokeStyle = this.turtle.color;
                this.ctx.lineWidth = this.turtle.penSize;
                this.ctx.lineCap = 'round';
                this.ctx.beginPath();
                this.ctx.moveTo(oldX, oldY);
                this.ctx.lineTo(this.turtle.x, this.turtle.y);
                this.ctx.stroke();
                
                if (this.turtle.filling) {
                    this.fillPath.push({x: this.turtle.x, y: this.turtle.y});
                }
            }
            
            this.redraw();
            currentStep++;
            setTimeout(animate, delay);
        };
        
        animate();
    }
    
    animateRotation(angle, callback) {
        const steps = Math.max(5, Math.abs(angle) / 10);
        const stepAngle = angle / steps;
        const delay = Math.max(20, 200 - (this.speed * 20));
        let currentStep = 0;
        
        const animate = () => {
            if (currentStep >= steps) {
                callback();
                return;
            }
            
            this.turtle.angle += stepAngle;
            this.redraw();
            currentStep++;
            setTimeout(animate, delay);
        };
        
        animate();
    }
    
    animateGoto(x, y, callback) {
        const distance = Math.sqrt((x - this.turtle.x) ** 2 + (y - this.turtle.y) ** 2);
        const steps = Math.max(10, distance / 10);
        const stepX = (x - this.turtle.x) / steps;
        const stepY = (y - this.turtle.y) / steps;
        const delay = Math.max(20, 300 - (this.speed * 30));
        let currentStep = 0;
        
        const animate = () => {
            if (currentStep >= steps) {
                this.turtle.x = x;
                this.turtle.y = y;
                this.redraw();
                callback();
                return;
            }
            
            const oldX = this.turtle.x;
            const oldY = this.turtle.y;
            
            this.turtle.x += stepX;
            this.turtle.y += stepY;
            
            if (this.turtle.penDown) {
                this.ctx.strokeStyle = this.turtle.color;
                this.ctx.lineWidth = this.turtle.penSize;
                this.ctx.lineCap = 'round';
                this.ctx.beginPath();
                this.ctx.moveTo(oldX, oldY);
                this.ctx.lineTo(this.turtle.x, this.turtle.y);
                this.ctx.stroke();
                
                if (this.turtle.filling) {
                    this.fillPath.push({x: this.turtle.x, y: this.turtle.y});
                }
            }
            
            this.redraw();
            currentStep++;
            setTimeout(animate, delay);
        };
        
        animate();
    }
    
    animateCircle(radius, callback) {
        // If filling, draw solid circle immediately
        if (this.turtle.filling) {
            this.ctx.fillStyle = this.turtle.fillColor;
            this.ctx.beginPath();
            this.ctx.arc(this.turtle.x, this.turtle.y - radius, Math.abs(radius), 0, 2 * Math.PI);
            this.ctx.fill();
            // Also draw outline if pen is down
            if (this.turtle.penDown) {
                this.ctx.strokeStyle = this.turtle.color;
                this.ctx.lineWidth = this.turtle.penSize;
                this.ctx.stroke();
            }
            callback();
            return;
        }
        
        // Normal circle animation
        const circumference = 2 * Math.PI * Math.abs(radius);
        const steps = Math.max(20, circumference / 5);
        const angleStep = 360 / steps;
        const delay = Math.max(10, 200 - (this.speed * 20));
        let currentStep = 0;
        
        const centerX = this.turtle.x;
        const centerY = this.turtle.y - radius;
        
        const animate = () => {
            if (currentStep >= steps) {
                callback();
                return;
            }
            
            const oldX = this.turtle.x;
            const oldY = this.turtle.y;
            
            const angle = (currentStep * angleStep) * Math.PI / 180;
            this.turtle.x = centerX + Math.abs(radius) * Math.cos(angle);
            this.turtle.y = centerY + Math.abs(radius) * Math.sin(angle);
            
            if (this.turtle.penDown) {
                this.ctx.strokeStyle = this.turtle.color;
                this.ctx.lineWidth = this.turtle.penSize;
                this.ctx.lineCap = 'round';
                this.ctx.beginPath();
                this.ctx.moveTo(oldX, oldY);
                this.ctx.lineTo(this.turtle.x, this.turtle.y);
                this.ctx.stroke();
            }
            
            this.redraw();
            currentStep++;
            setTimeout(animate, delay);
        };
        
        animate();
    }
    
    drawFill() {
        if (this.fillPath.length < 3) return;
        
        this.ctx.fillStyle = this.turtle.fillColor;
        this.ctx.beginPath();
        this.ctx.moveTo(this.fillPath[0].x, this.fillPath[0].y);
        
        for (let i = 1; i < this.fillPath.length; i++) {
            this.ctx.lineTo(this.fillPath[i].x, this.fillPath[i].y);
        }
        
        this.ctx.closePath();
        this.ctx.fill();
    }
    
    redraw() {
        // Redraw only the turtle (the drawing remains on canvas)
        this.clearTurtle();
        this.drawTurtle();
    }
    
    clearTurtle() {
        // This is a simple implementation - in a more complex version,
        // we'd save the canvas state and restore it
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.putImageData(imageData, 0, 0);
    }
    
    setSpeed(speed) {
        this.speed = Math.max(1, Math.min(10, speed));
    }
    
    stopAnimation() {
        console.log('Stopping animation');
        this.isAnimating = false;
        this.animationQueue = [];
        
        // Clear any pending timeouts
        if (this.currentTimeout) {
            clearTimeout(this.currentTimeout);
            this.currentTimeout = null;
        }
    }
}

// Initialize the turtle canvas when the page loads
let turtleCanvas;
document.addEventListener('DOMContentLoaded', function() {
    turtleCanvas = new TurtleCanvas('turtleCanvas');
});
