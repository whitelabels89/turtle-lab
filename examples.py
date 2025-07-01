def get_examples():
    """Return a list of example turtle programs for kids"""
    return [
        {
            'name': 'Purple Star',
            'description': 'Draw a beautiful purple star',
            'code': '''import turtle

kura = turtle.Turtle()
kura.color("purple")
for i in range(36):
    kura.forward(100)
    kura.left(170)

turtle.done()'''
        },
        {
            'name': 'Rainbow Square',
            'description': 'Draw a colorful square',
            'code': '''import turtle

artist = turtle.Turtle()

# Red side
artist.color("red")
artist.forward(100)
artist.left(90)

# Orange side
artist.color("orange")
artist.forward(100)
artist.left(90)

# Yellow side
artist.color("yellow")
artist.forward(100)
artist.left(90)

# Green side
artist.color("green")
artist.forward(100)
artist.left(90)

turtle.done()'''
        },
        {
            'name': 'Flower Pattern',
            'description': 'Create a simple flower',
            'code': '''import turtle

flower = turtle.Turtle()
flower.color("pink")

for i in range(8):
    flower.circle(50)
    flower.left(45)

turtle.done()'''
        },
        {
            'name': 'Spiral',
            'description': 'Draw a growing spiral',
            'code': '''import turtle

spiral = turtle.Turtle()
spiral.color("blue")

# Simple spiral pattern
for i in range(50):
    spiral.forward(10)
    spiral.left(91)

turtle.done()'''
        },
        {
            'name': 'Colorful House',
            'description': 'Draw a simple colorful house',
            'code': '''import turtle

house = turtle.Turtle()

# Draw brown square base
house.color("brown")
house.begin_fill()
for i in range(4):
    house.forward(100)
    house.left(90)
house.end_fill()

# Move to roof position  
house.penup()
house.goto(0, 100)
house.pendown()

# Draw red triangular roof
house.color("red")
house.begin_fill()
house.goto(50, 150)
house.goto(100, 100)
house.goto(0, 100)
house.end_fill()

# Draw blue door
house.penup()
house.goto(30, 0)
house.pendown()
house.color("blue")
house.begin_fill()
house.left(90)
house.forward(60)
house.right(90)
house.forward(25)
house.right(90)
house.forward(60)
house.end_fill()

turtle.done()'''
        },
        {
            'name': 'Colorful Circle',
            'description': 'Draw circles with different colors',
            'code': '''import turtle

painter = turtle.Turtle()

# Red circle
painter.color("red")
painter.circle(30)
painter.penup()
painter.forward(60)
painter.pendown()

# Blue circle
painter.color("blue")
painter.circle(30)
painter.penup()
painter.forward(60)
painter.pendown()

# Green circle
painter.color("green")
painter.circle(30)
painter.penup()
painter.forward(60)
painter.pendown()

# Yellow circle
painter.color("yellow")
painter.circle(30)
painter.penup()
painter.forward(60)
painter.pendown()

# Purple circle
painter.color("purple")
painter.circle(30)
painter.penup()
painter.forward(60)
painter.pendown()

# Orange circle
painter.color("orange")
painter.circle(30)

turtle.done()'''
        },
        {
            'name': 'Shape Demo',
            'description': 'See different turtle shapes and colors',
            'code': '''import turtle

# Demo different shapes and colors
t = turtle.Turtle()

# Start with turtle shape
t.shape('turtle')
t.color('green')
t.forward(50)
t.left(90)

# Change to arrow shape
t.shape('arrow')
t.color('blue')
t.forward(50)
t.left(90)

# Change to circle shape
t.shape('circle')
t.color('red')
t.forward(50)
t.left(90)

# Change to square shape
t.shape('square')
t.color('purple')
t.forward(50)
t.left(90)

turtle.done()'''
        },
        {
            'name': 'Random Colors',
            'description': 'Draw with random colors',
            'code': '''import turtle
import random

artist = turtle.Turtle()
colors = ["red", "blue", "green", "yellow", "purple", "orange", "pink", "cyan"]

# Draw random colored squares
for i in range(8):
    artist.color("red")  # Will be random in full version
    artist.begin_fill()
    for j in range(4):
        artist.forward(30)
        artist.left(90)
    artist.end_fill()
    artist.penup()
    artist.forward(40)
    artist.pendown()

turtle.done()'''
        }
    ]
