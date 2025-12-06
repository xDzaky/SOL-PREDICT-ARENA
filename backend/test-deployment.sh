#!/bin/bash

# Test Railway Deployment
# Make sure to set RAILWAY_URL environment variable

RAILWAY_URL="${RAILWAY_URL:-https://your-railway-app.up.railway.app}"

echo "🧪 Testing Railway Deployment..."
echo "URL: $RAILWAY_URL"
echo ""

# Test health endpoint
echo "1️⃣ Testing health endpoint..."
curl -s "$RAILWAY_URL/api/health" | jq . || echo "❌ Health check failed"
echo ""

# Test root endpoint
echo "2️⃣ Testing root endpoint..."
curl -s "$RAILWAY_URL/" | jq . || echo "❌ Root endpoint failed"
echo ""

# Test with X-Forwarded-For header (simulate proxy)
echo "3️⃣ Testing with X-Forwarded-For header..."
curl -s -H "X-Forwarded-For: 1.2.3.4" "$RAILWAY_URL/api/health" | jq . || echo "❌ X-Forwarded-For test failed"
echo ""

echo "✅ Deployment test completed!"
echo ""
echo "📊 Check Railway logs for any errors:"
echo "railway logs --project=580841be-95d3-471e-bed2-01b590c5dc21 --environment=c4d6b9b8-33a5-43a0-b7e6-a7aabc2737ab --service=83f5f7db-d301-4615-a5de-1dc8f0911fce"
