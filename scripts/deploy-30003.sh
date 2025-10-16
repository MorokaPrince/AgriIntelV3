#!/bin/bash

# Deployment script for AgriIntel on port 30003
echo "🚀 Starting AgriIntel deployment on port 30003..."

# Set port environment variable
export PORT=30003

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Build the application
echo "🔨 Building application..."
npm run build

# Start the production server
echo "🌐 Starting server on port 30003..."
npm start