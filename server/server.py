from flask import Flask, request, jsonify
import hashlib
import jwt
import os
from datetime import datetime, timedelta
from pymongo import MongoClient
from bson.objectid import ObjectId
from flask_cors import CORS
from dotenv import load_dotenv
import ollama

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'fallback-secret-key')  # Get from env or use fallback

# MongoDB connection
mongodb_uri = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/')
db_name = os.getenv('DATABASE_NAME', 'invender')
client = MongoClient(mongodb_uri)
db = client[db_name]  # Database name
users_collection = db['users']  # Collection for users

@app.route('/api/signup', methods=['POST'])
def signup():
    if not request.is_json:
        return jsonify({"error": "Request must be JSON"}), 400
    
    data = request.get_json()
    
    # Validate required fields
    if not all(k in data for k in ('username', 'email', 'password')):
        return jsonify({"error": "Missing required fields"}), 400
    
    username = data['username']
    email = data['email']
    password = data['password']
    
    # Check if email already exists (primary check)
    if users_collection.find_one({"email": email}):
        return jsonify({"error": "Email already registered"}), 409
    
    # Optional username check if you still want to ensure unique usernames
    if users_collection.find_one({"username": username}):
        return jsonify({"error": "Username already exists"}), 409
    
    # Hash the password
    hashed_password = hashlib.sha256(password.encode()).hexdigest()
    
    # Create new user
    user_data = {
        'username': username,
        'email': email,
        'password': hashed_password,
        'created_at': datetime.now()
    }
    
    # Insert user into MongoDB
    result = users_collection.insert_one(user_data)
    user_id = str(result.inserted_id)
    
    # Generate JWT token
    token = jwt.encode({
        'user_id': user_id,
        'exp': datetime.utcnow() + timedelta(days=1)
    }, app.config['SECRET_KEY'], algorithm='HS256')
    
    return jsonify({
        "message": "User registered successfully",
        "user_id": user_id,
        "token": token
    }), 201

@app.route('/api/login', methods=['POST'])
def login():
    if not request.is_json:
        return jsonify({"error": "Request must be JSON"}), 400
    
    data = request.get_json()
    
    # Validate required fields - now expecting email instead of username
    if not all(k in data for k in ('username', 'password')):
        return jsonify({"error": "Missing email or password"}), 400
    
    email = data['username']
    password = data['password']
    hashed_password = hashlib.sha256(password.encode()).hexdigest()
    
    # Find user in MongoDB by email instead of username
    user = users_collection.find_one({"email": email, "password": hashed_password})
    
    if not user:
        return jsonify({"error": "Invalid email or password"}), 401
    
    user_id = str(user['_id'])
    
    # Generate JWT token
    token = jwt.encode({
        'user_id': user_id,
        'exp': datetime.utcnow() + timedelta(days=1)
    }, app.config['SECRET_KEY'], algorithm='HS256')
    
    return jsonify({
        "message": "Login successful",
        "user_id": user_id,
        "token": token,
        "username": user['username']  # Also return the username for the frontend
    })

# Helper function to verify JWT token
def verify_token(token):
    try:
        payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        return payload['user_id']
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

@app.route('/api/verify-token', methods=['GET'])
def verify_token_endpoint():
    # Get token from Authorization header
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({"error": "No token provided"}), 401
    
    token = auth_header.split(' ')[1]
    
    # Verify the token
    user_id = verify_token(token)
    if not user_id:
        return jsonify({"error": "Invalid or expired token"}), 401
    
    # Check if user exists in database
    user = users_collection.find_one({"_id": ObjectId(user_id)})
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    return jsonify({
        "valid": True,
        "user_id": user_id,
        "username": user['username']
    })

@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.get_json()
    response = ollama.chat(model='llama2', messages=data)
    print(response['message']['content'])
    return jsonify(response['message']['content']), 200

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
