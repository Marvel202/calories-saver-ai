#!/bin/bash

# Quick test script for the n8n workflow
# This bypasses the file upload and directly tests the analyze-meal endpoint

echo "🧪 Testing n8n workflow with mock image URL..."

# Use a publicly accessible image URL for testing
curl -X POST http://localhost:3000/api/analyze-meal \
  -H "Content-Type: application/json" \
  -d '{
    "imageUrl": "https://example.com/test-image.jpg"
  }' \
  --verbose

echo ""
echo "✅ Test completed. Check the server logs for n8n communication."
