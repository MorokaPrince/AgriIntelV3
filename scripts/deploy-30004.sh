#!/bin/bash

# Deployment script for AgriIntel on port 30004
echo "🚀 Starting AgriIntel deployment on port 30004..."

# Set port environment variable
export PORT=30004

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Build the application
echo "🔨 Building application..."
npm run build

# Start the production server
echo "🌐 Starting server on port 30004..."
npm start