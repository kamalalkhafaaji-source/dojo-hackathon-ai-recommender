#!/bin/bash

# Exit on error
set -e

echo "Starting DOJO AI Recommender Project..."

# Clean up existing processes on known ports
echo "Checking for existing processes on ports 5000 and 5173..."
lsof -ti :5000 | xargs kill -9 2>/dev/null || true
lsof -ti :5173 | xargs kill -9 2>/dev/null || true

# Start the .NET Backend in the background
echo "[1/2] Starting Backend (.NET Console App)..."
dotnet run --project backend/OptimalOfferAI/OptimalOfferAI/OptimalOfferAI.csproj &
BACKEND_PID=$!

# Start the Vite React Frontend in the background
echo "[2/2] Starting Frontend (React/Vite)..."
cd frontend
# npm install --silent # Commented out for speed on every run, uncomment if needed
npm run dev &
FRONTEND_PID=$!

# Navigate back to root
cd ..

echo "Both services are starting up. Press Ctrl+C to stop them."

# Trap SIGINT and SIGTERM to kill both background processes when the script exits
trap "echo 'Stopping services...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" SIGINT SIGTERM

# Wait for all background processes
wait $BACKEND_PID $FRONTEND_PID
