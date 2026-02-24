#!/bin/bash
# Startup script for Render deployment
# Seeds the database then starts the FastAPI server

echo "Seeding database..."
python seed.py

echo "Starting server..."
uvicorn main:app --host 0.0.0.0 --port $PORT
