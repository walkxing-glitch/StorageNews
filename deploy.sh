#!/bin/bash

# Production Deployment Script for StorageNews

set -e

echo "🚀 Starting StorageNews Production Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required environment variables are set
check_env() {
    print_status "Checking environment variables..."

    required_vars=("POSTGRES_USER" "POSTGRES_PASSWORD" "POSTGRES_DB" "NEWSAPI_KEY")

    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            print_error "Required environment variable $var is not set"
            exit 1
        fi
    done

    print_status "Environment variables check passed"
}

# Create necessary directories
create_directories() {
    print_status "Creating necessary directories..."

    mkdir -p logs
    mkdir -p backups
    mkdir -p monitoring
    mkdir -p nginx/ssl

    print_status "Directories created"
}

# Build and start services
deploy_services() {
    print_status "Building and starting production services..."

    # Build custom images
    docker-compose -f docker-compose.prod.yml build

    # Start services
    docker-compose -f docker-compose.prod.yml up -d

    print_status "Services deployed successfully"
}

# Wait for services to be healthy
wait_for_services() {
    print_status "Waiting for services to be healthy..."

    # Wait for database
    print_status "Waiting for database..."
    docker-compose -f docker-compose.prod.yml exec -T database sh -c 'while ! pg_isready -U $POSTGRES_USER -d $POSTGRES_DB; do sleep 1; done'

    # Wait for backend
    print_status "Waiting for backend API..."
    timeout=60
    while [ $timeout -gt 0 ]; do
        if docker-compose -f docker-compose.prod.yml exec -T server curl -f http://localhost:3001/health > /dev/null 2>&1; then
            break
        fi
        sleep 2
        timeout=$((timeout - 2))
    done

    if [ $timeout -le 0 ]; then
        print_error "Backend service failed to start"
        exit 1
    fi

    print_status "All services are healthy"
}

# Run database migrations/initialization
init_database() {
    print_status "Initializing database..."

    docker-compose -f docker-compose.prod.yml exec -T server npm run init

    print_status "Database initialized"
}

# Run tests
run_tests() {
    print_status "Running tests..."

    docker-compose -f docker-compose.prod.yml exec -T server npm test

    print_status "Tests completed successfully"
}

# Show deployment status
show_status() {
    print_status "Deployment completed successfully!"
    echo ""
    echo "📊 Service Status:"
    docker-compose -f docker-compose.prod.yml ps
    echo ""
    echo "🌐 Access URLs:"
    echo "  - Dashboard: http://localhost:8080"
    echo "  - API: http://localhost:3001"
    echo "  - Grafana: http://localhost:3000 (admin/admin)"
    echo "  - Prometheus: http://localhost:9090"
    echo ""
    echo "🔧 Useful commands:"
    echo "  - View logs: docker-compose -f docker-compose.prod.yml logs -f [service]"
    echo "  - Stop services: docker-compose -f docker-compose.prod.yml down"
    echo "  - Restart services: docker-compose -f docker-compose.prod.yml restart"
}

# Main deployment process
main() {
    echo "🔧 StorageNews Production Deployment Script"
    echo "=========================================="

    check_env
    create_directories
    deploy_services
    wait_for_services
    init_database

    if [ "$RUN_TESTS" = "true" ]; then
        run_tests
    fi

    show_status

    print_status "🎉 Deployment completed successfully!"
}

# Handle command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --run-tests)
            RUN_TESTS=true
            shift
            ;;
        *)
            print_error "Unknown option: $1"
            exit 1
            ;;
    esac
done

main "$@"
