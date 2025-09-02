#!/bin/bash

# Development startup script for Calories Saver AI

echo "🚀 Starting Calories Saver AI Development Environment..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Please create one based on .env.example"
    exit 1
fi

# Check if node_modules exists
if [ ! -d node_modules ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Start the development server
echo "🔥 Starting development server..."
npm run dev
