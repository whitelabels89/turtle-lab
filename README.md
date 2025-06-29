# 🐢 Turtle Graphics Playground

A web-based Python turtle graphics playground designed for kids to learn coding through interactive drawing and animation.

## Features

- **Interactive Code Editor**: Python syntax highlighting with CodeMirror
- **Live Turtle Graphics**: Animated turtle that draws on HTML5 canvas
- **Example Programs**: Pre-built examples like Purple Star, Rainbow Square, Flower Pattern
- **Quick Commands**: Buttons for common turtle commands
- **Color Picker**: Easy color selection for turtle drawings
- **Speed Control**: Adjustable animation speed
- **Mobile Responsive**: Works on desktop, tablet, and mobile devices

## Getting Started

### Local Development

1. Clone the repository:
```bash
git clone <your-repo-url>
cd turtle-graphics-playground
```

2. Install dependencies:
```bash
pip install flask gunicorn werkzeug
```

3. Run the application:
```bash
python main.py
```

4. Open your browser and navigate to `http://localhost:5000`

### Deployment on Render

1. Connect your GitHub repository to Render
2. Create a new Web Service
3. Use the following settings:
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn --bind 0.0.0.0:$PORT main:app`
   - **Environment**: Python 3

The application will automatically deploy with the included `render.yaml` configuration.

## Project Structure

```
├── app.py              # Main Flask application
├── main.py             # Application entry point
├── examples.py         # Sample turtle programs
├── templates/
│   └── index.html      # Main HTML template
├── static/
│   ├── css/
│   │   └── style.css   # Custom styles
│   └── js/
│       ├── editor.js   # Code editor functionality
│       └── turtle.js   # Turtle graphics engine
├── render.yaml         # Render deployment config
├── Procfile           # Process file for deployment
└── README.md          # This file
```

## Technologies Used

- **Backend**: Flask (Python)
- **Frontend**: HTML5, CSS3, JavaScript
- **Code Editor**: CodeMirror
- **Styling**: Bootstrap 5 (Dark Theme)
- **Icons**: Font Awesome
- **Deployment**: Render.com

## Educational Purpose

This playground is designed to make programming accessible and fun for children by:

- Visual feedback through turtle graphics
- Simple Python syntax introduction
- Interactive learning environment
- Immediate results and animations
- Pre-built examples to explore and modify

## Contributing

Feel free to submit issues, feature requests, or pull requests to improve the educational experience.

## License

This project is open source and available under the MIT License.