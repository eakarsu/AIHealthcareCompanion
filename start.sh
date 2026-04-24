#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${PURPLE}"
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                                                           ║"
echo "║           🏥 AI Healthcare Companion                      ║"
echo "║                                                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to kill process on port
kill_port() {
    local port=$1
    local pid=$(lsof -ti:$port 2>/dev/null)
    if [ ! -z "$pid" ]; then
        echo -e "${YELLOW}Killing process on port $port (PID: $pid)${NC}"
        kill -9 $pid 2>/dev/null
        sleep 1
    fi
}

# Step 1: Clean up ports
echo -e "${CYAN}[1/7] Cleaning up ports...${NC}"
kill_port 3001  # Backend
kill_port 5173  # Frontend (Vite)
kill_port 5174  # Alternative Vite port
echo -e "${GREEN}✓ Ports cleaned${NC}"

# Step 2: Check prerequisites
echo -e "${CYAN}[2/7] Checking prerequisites...${NC}"

if ! command_exists node; then
    echo -e "${RED}✗ Node.js is not installed. Please install Node.js first.${NC}"
    exit 1
fi

if ! command_exists npm; then
    echo -e "${RED}✗ npm is not installed. Please install npm first.${NC}"
    exit 1
fi

# Check if PostgreSQL is running
if command_exists psql; then
    if ! pg_isready -q 2>/dev/null; then
        echo -e "${YELLOW}PostgreSQL is not running. Attempting to start...${NC}"
        if command_exists brew; then
            brew services start postgresql 2>/dev/null || brew services start postgresql@14 2>/dev/null || brew services start postgresql@15 2>/dev/null
        fi
        sleep 2
    fi
fi

echo -e "${GREEN}✓ Prerequisites checked${NC}"

# Step 3: Install dependencies
echo -e "${CYAN}[3/7] Installing dependencies...${NC}"
npm install
if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Failed to install root dependencies${NC}"
    exit 1
fi

cd client
npm install
if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Failed to install client dependencies${NC}"
    exit 1
fi
cd ..

echo -e "${GREEN}✓ Dependencies installed${NC}"

# Step 4: Setup database
echo -e "${CYAN}[4/7] Setting up database...${NC}"

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${RED}✗ .env file not found. Please create one with DATABASE_URL${NC}"
    exit 1
fi

# Create database if it doesn't exist
if command_exists psql; then
    echo "Creating database if not exists..."
    psql -U postgres -c "CREATE DATABASE healthcare_companion;" 2>/dev/null || true
fi

# Generate Prisma client and push schema
echo "Generating Prisma client..."
npx prisma generate
if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Failed to generate Prisma client${NC}"
    exit 1
fi

echo "Pushing database schema..."
npx prisma db push --accept-data-loss
if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Failed to push database schema${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Database setup complete${NC}"

# Step 5: Seed the database
echo -e "${CYAN}[5/7] Seeding database with sample data...${NC}"
node server/seed.js
if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Failed to seed database${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Database seeded${NC}"

# Step 6: Display configuration info
echo -e "${CYAN}[6/7] Configuration${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "  Backend:    ${GREEN}http://localhost:3001${NC}"
echo -e "  Frontend:   ${GREEN}http://localhost:5173${NC}"
echo -e "  AI Model:   ${PURPLE}anthropic/claude-haiku-4.5${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${YELLOW}📌 Demo Credentials:${NC}"
echo -e "   Email:    ${GREEN}demo@healthcare.com${NC}"
echo -e "   Password: ${GREEN}demo123${NC}"
echo ""

# Step 7: Start the application with hot reload
echo -e "${CYAN}[7/7] Starting application with hot reload...${NC}"
echo ""
echo -e "${GREEN}🚀 Application starting...${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop${NC}"
echo ""

# Start the application (this will run both server and client with hot reload)
npm run dev
