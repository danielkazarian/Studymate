#!/bin/bash

# StudyMate Development Setup Script
# This script sets up the development environment for StudyMate

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check Node.js
    if ! command_exists node; then
        print_error "Node.js is required but not installed. Please install Node.js 18+ from https://nodejs.org/"
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js 18+ is required. Current version: $(node -v)"
        exit 1
    fi
    
    # Check npm
    if ! command_exists npm; then
        print_error "npm is required but not installed"
        exit 1
    fi
    
    # Check Docker
    if ! command_exists docker; then
        print_warning "Docker is recommended for database and Redis. Install from https://docs.docker.com/get-docker/"
    fi
    
    # Check Docker Compose
    if ! command_exists docker-compose && ! docker compose version >/dev/null 2>&1; then
        print_warning "Docker Compose is recommended for easy development setup"
    fi
    
    print_success "Prerequisites check completed"
}

# Function to setup environment files
setup_environment() {
    print_status "Setting up environment files..."
    
    # Root .env file
    if [ ! -f ".env" ]; then
        if [ -f ".env.example" ]; then
            cp .env.example .env
            print_success "Created .env from .env.example"
            print_warning "Please edit .env file with your configuration"
        else
            print_warning "No .env.example found. You'll need to create .env manually"
        fi
    else
        print_status ".env file already exists"
    fi
    
    # Backend .env file
    if [ ! -f "backend/.env" ]; then
        cat > backend/.env << EOF
NODE_ENV=development
DATABASE_URL="postgresql://studymate:studymate_password@localhost:5432/studymate"
TEST_DATABASE_URL="postgresql://studymate:studymate_password@localhost:5432/studymate_test"
JWT_SECRET="dev-jwt-secret-change-in-production"
REFRESH_TOKEN_SECRET="dev-refresh-secret-change-in-production"
ENCRYPTION_KEY="dev-encryption-key-32-chars-long"
CORS_ORIGIN="http://localhost:3000"
PORT=3001
LOG_LEVEL=debug
EOF
        print_success "Created backend/.env"
    else
        print_status "backend/.env file already exists"
    fi
    
    # Frontend .env.local file
    if [ ! -f "frontend/.env.local" ]; then
        cat > frontend/.env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=ws://localhost:3001
EOF
        print_success "Created frontend/.env.local"
    else
        print_status "frontend/.env.local file already exists"
    fi
}

# Function to install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    # Backend dependencies
    print_status "Installing backend dependencies..."
    cd backend
    npm install
    cd ..
    print_success "Backend dependencies installed"
    
    # Frontend dependencies
    print_status "Installing frontend dependencies..."
    cd frontend
    npm install
    cd ..
    print_success "Frontend dependencies installed"
}

# Function to setup database with Docker
setup_database_docker() {
    print_status "Setting up database with Docker..."
    
    if command_exists docker && (command_exists docker-compose || docker compose version >/dev/null 2>&1); then
        # Start only postgres and redis from docker-compose
        if command_exists docker-compose; then
            docker-compose up -d postgres redis
        else
            docker compose up -d postgres redis
        fi
        
        print_success "Database and Redis started with Docker"
        
        # Wait for database to be ready
        print_status "Waiting for database to be ready..."
        sleep 10
        
        # Run database setup
        cd backend
        npm run db:generate
        npm run db:migrate
        npm run db:seed || print_warning "Database seeding failed (this is okay for first setup)"
        cd ..
        
        print_success "Database setup completed"
    else
        print_warning "Docker not available. Please set up PostgreSQL and Redis manually"
        print_status "PostgreSQL connection: postgresql://studymate:studymate_password@localhost:5432/studymate"
        print_status "Redis connection: redis://localhost:6379"
    fi
}

# Function to setup database manually
setup_database_manual() {
    print_status "Setting up database manually..."
    print_warning "Make sure PostgreSQL is running and accessible"
    
    cd backend
    
    # Generate Prisma client
    print_status "Generating Prisma client..."
    npm run db:generate
    
    # Run migrations
    print_status "Running database migrations..."
    npm run db:migrate
    
    # Seed database
    print_status "Seeding database..."
    npm run db:seed || print_warning "Database seeding failed"
    
    cd ..
    print_success "Database setup completed"
}

# Function to run tests
run_tests() {
    print_status "Running tests..."
    
    # Backend tests
    print_status "Running backend tests..."
    cd backend
    npm test || print_warning "Some backend tests failed"
    cd ..
    
    # Frontend tests
    print_status "Running frontend tests..."
    cd frontend
    npm test -- --passWithNoTests || print_warning "Some frontend tests failed"
    cd ..
    
    print_success "Tests completed"
}

# Function to start development servers
start_dev_servers() {
    print_status "Development setup completed!"
    print_status "To start the development servers:"
    echo
    print_status "Option 1: Using Docker Compose (recommended)"
    echo "  docker-compose up"
    echo
    print_status "Option 2: Manual startup"
    echo "  # Terminal 1 - Backend"
    echo "  cd backend && npm run dev"
    echo
    echo "  # Terminal 2 - Frontend"
    echo "  cd frontend && npm run dev"
    echo
    print_status "Application will be available at:"
    print_status "  Frontend: http://localhost:3000"
    print_status "  Backend:  http://localhost:3001"
    print_status "  Docs:     http://localhost:3001/docs (if available)"
}

# Function to display help
show_help() {
    echo "StudyMate Development Setup Script"
    echo
    echo "Usage: $0 [option]"
    echo
    echo "Options:"
    echo "  env           Setup environment files only"
    echo "  deps          Install dependencies only"
    echo "  db            Setup database only"
    echo "  test          Run tests only"
    echo "  docker        Use Docker for database setup"
    echo "  manual        Manual database setup (no Docker)"
    echo "  --help, -h    Show this help message"
    echo
    echo "Default: Run full setup (env + deps + db + test)"
}

# Main setup function
main() {
    echo "🛠️  StudyMate Development Setup"
    echo "================================"
    
    check_prerequisites
    setup_environment
    install_dependencies
    
    # Choose database setup method
    if command_exists docker && (command_exists docker-compose || docker compose version >/dev/null 2>&1); then
        setup_database_docker
    else
        setup_database_manual
    fi
    
    run_tests
    start_dev_servers
}

# Handle script arguments
case "${1:-}" in
    "env")
        setup_environment
        ;;
    "deps")
        install_dependencies
        ;;
    "db")
        if command_exists docker; then
            setup_database_docker
        else
            setup_database_manual
        fi
        ;;
    "test")
        run_tests
        ;;
    "docker")
        setup_database_docker
        ;;
    "manual")
        setup_database_manual
        ;;
    "--help"|"-h")
        show_help
        ;;
    "")
        main
        ;;
    *)
        print_error "Unknown option: $1"
        show_help
        exit 1
        ;;
esac 