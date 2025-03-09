import os
from flask import Flask, render_template, jsonify, request, session
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase

class Base(DeclarativeBase):
    pass

db = SQLAlchemy(model_class=Base)
app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "dev_secret_key")  # Fallback for development

# Configure SQLAlchemy
app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DATABASE_URL", "sqlite:///game.db")
app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
    "pool_recycle": 300,
    "pool_pre_ping": True,
}
db.init_app(app)

@app.route('/')
def index():
    try:
        # Initialize default settings if not present
        if 'difficulty' not in session:
            session['difficulty'] = 'medium'  # Now using fixed 3x3 grid
            session['use_keyboard'] = False
            session['high_contrast'] = False
            session['sound_enabled'] = True
            session['game_speed'] = 800
        return render_template('game.html', settings=session)
    except Exception as e:
        app.logger.error(f"Error in index route: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

@app.route('/settings')
def settings():
    try:
        return render_template('settings.html', settings=session)
    except Exception as e:
        app.logger.error(f"Error in settings route: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

@app.route('/documentation')
def documentation():
    try:
        return render_template('documentation.html')
    except Exception as e:
        app.logger.error(f"Error in documentation route: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

@app.route('/save_settings', methods=['POST'])
def save_settings():
    try:
        settings = request.get_json()
        if not settings:
            return jsonify({"error": "No data provided"}), 400

        session['use_keyboard'] = settings.get('use_keyboard', False)
        session['high_contrast'] = settings.get('high_contrast', False)
        session['sound_enabled'] = settings.get('sound_enabled', True)
        session['game_speed'] = settings.get('game_speed', 800)
        return jsonify({'status': 'success'})
    except Exception as e:
        app.logger.error(f"Error in save_settings route: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

# Initialize database
with app.app_context():
    db.create_all()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)