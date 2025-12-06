#!/bin/bash

# Comprehensive API Test Script
# Tests all backend endpoints

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
BACKEND_URL="${BACKEND_URL:-http://localhost:8080}"
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

echo "🧪 Testing Backend API Endpoints"
echo "================================="
echo "Backend URL: $BACKEND_URL"
echo ""

# Function to test endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local expected_status=${3:-200}
    local data=$4
    local description=$5
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    echo -n "[$TOTAL_TESTS] Testing $description... "
    
    if [ "$method" == "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" "$BACKEND_URL$endpoint")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$BACKEND_URL$endpoint")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" -eq "$expected_status" ]; then
        echo -e "${GREEN}✓ PASSED${NC} (HTTP $http_code)"
        PASSED_TESTS=$((PASSED_TESTS + 1))
        # Pretty print JSON if jq is available
        if command -v jq &> /dev/null; then
            echo "$body" | jq -C '.' 2>/dev/null || echo "$body"
        else
            echo "$body"
        fi
    else
        echo -e "${RED}✗ FAILED${NC} (Expected $expected_status, got $http_code)"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        echo "$body"
    fi
    echo ""
}

# ==========================================
# HEALTH & ROOT ENDPOINTS
# ==========================================
echo "🏥 Health Check Endpoints"
echo "-------------------------"

test_endpoint "GET" "/" 200 "" "Root endpoint"
test_endpoint "GET" "/api/health" 200 "" "Health check"

# ==========================================
# PLAYER ENDPOINTS
# ==========================================
echo "👤 Player Endpoints"
echo "-------------------"

# Test with a dummy Solana address
TEST_ADDRESS="11111111111111111111111111111111"

test_endpoint "GET" "/api/player/$TEST_ADDRESS" 200 "" "Get player by address"
test_endpoint "GET" "/api/player/$TEST_ADDRESS/stats" 200 "" "Get player stats"
test_endpoint "GET" "/api/player/$TEST_ADDRESS/match-history?limit=10" 200 "" "Get player match history"

# Test create/update player
PLAYER_DATA='{
  "walletAddress": "'$TEST_ADDRESS'",
  "username": "TestPlayer"
}'

test_endpoint "POST" "/api/player/create-or-update" 200 "$PLAYER_DATA" "Create/update player"

# ==========================================
# LEADERBOARD ENDPOINTS
# ==========================================
echo "🏆 Leaderboard Endpoints"
echo "------------------------"

test_endpoint "GET" "/api/leaderboard/global?limit=10" 200 "" "Global leaderboard"
test_endpoint "GET" "/api/leaderboard/season?limit=10" 200 "" "Season leaderboard"
test_endpoint "GET" "/api/leaderboard/top" 200 "" "Top players"

# ==========================================
# SEASON ENDPOINTS
# ==========================================
echo "📅 Season Endpoints"
echo "-------------------"

test_endpoint "GET" "/api/season/current" 200 "" "Current season info"
test_endpoint "GET" "/api/season/all" 200 "" "All seasons"

# Test create season (this might fail if not admin)
SEASON_DATA='{
  "name": "Test Season",
  "startDate": "2025-01-01T00:00:00Z",
  "endDate": "2025-03-31T23:59:59Z"
}'

test_endpoint "POST" "/api/season/create" 200 "$SEASON_DATA" "Create season (may require auth)"

# ==========================================
# CHALLENGE ENDPOINTS
# ==========================================
echo "🎮 Challenge Endpoints"
echo "----------------------"

test_endpoint "GET" "/api/challenge/active" 200 "" "Get active challenges"

# Test create challenge
CHALLENGE_DATA='{
  "type": "PRICE_PREDICTION",
  "difficulty": "EASY",
  "duration": 60
}'

test_endpoint "POST" "/api/challenge/create" 200 "$CHALLENGE_DATA" "Create challenge"

# ==========================================
# ERROR HANDLING TESTS
# ==========================================
echo "⚠️  Error Handling Tests"
echo "------------------------"

test_endpoint "GET" "/api/nonexistent" 404 "" "404 Not Found"
test_endpoint "POST" "/api/player/create-or-update" 400 '{"invalid":"data"}' "400 Bad Request"

# ==========================================
# RATE LIMITING TEST
# ==========================================
echo "🚦 Rate Limiting Test"
echo "---------------------"

echo "Testing rate limiter (60 requests/minute)..."
for i in {1..5}; do
    curl -s -o /dev/null -w "Request $i: %{http_code}\n" "$BACKEND_URL/api/health"
done

# ==========================================
# CORS TEST
# ==========================================
echo ""
echo "🌐 CORS Test"
echo "------------"

echo "Testing CORS headers..."
curl -s -I -X OPTIONS \
    -H "Origin: http://localhost:5173" \
    -H "Access-Control-Request-Method: POST" \
    "$BACKEND_URL/api/health" | grep -i "access-control"

# ==========================================
# SUMMARY
# ==========================================
echo ""
echo "================================="
echo "📊 Test Summary"
echo "================================="
echo "Total Tests:  $TOTAL_TESTS"
echo -e "Passed:       ${GREEN}$PASSED_TESTS${NC}"
echo -e "Failed:       ${RED}$FAILED_TESTS${NC}"
echo ""

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "${GREEN}✅ All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}❌ Some tests failed!${NC}"
    exit 1
fi
