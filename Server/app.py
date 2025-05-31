from flask import Flask
from flask_cors import CORS
import os
from routes import main

app = Flask(__name__)
CORS(app, supports_credentials=True,origins=["http://localhost:5173"])
app.secret_key = os.urandom(24)
app.config.update(
    SESSION_COOKIE_SAMESITE='None',
    SESSION_COOKIE_SECURE=True
)

app.register_blueprint(main)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)