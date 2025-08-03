#!/bin/bash

# StudyMate Deployment Script
# This script deploys the StudyMate application to AWS using Terraform and Docker

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
AWS_REGION=${AWS_REGION:-us-east-1}
ENVIRONMENT=${ENVIRONMENT:-prod}
ECR_REGISTRY=""
TERRAFORM_DIR="infrastructure/terraform"

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

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check AWS CLI
    if ! command -v aws &> /dev/null; then
        print_error "AWS CLI is required but not installed"
        exit 1
    fi
    
    # Check Terraform
    if ! command -v terraform &> /dev/null; then
        print_error "Terraform is required but not installed"
        exit 1
    fi
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        print_error "Docker is required but not installed"
        exit 1
    fi
    
    # Check if logged into AWS
    if ! aws sts get-caller-identity &> /dev/null; then
        print_error "Not logged into AWS. Run 'aws configure' first"
        exit 1
    fi
    
    print_success "All prerequisites met"
}

# Function to setup ECR repositories
setup_ecr() {
    print_status "Setting up ECR repositories..."
    
    # Get AWS account ID
    AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
    ECR_REGISTRY="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
    
    # Create ECR repositories if they don't exist
    for repo in "studymate/backend" "studymate/frontend"; do
        if ! aws ecr describe-repositories --repository-names "$repo" --region "$AWS_REGION" &> /dev/null; then
            print_status "Creating ECR repository: $repo"
            aws ecr create-repository --repository-name "$repo" --region "$AWS_REGION"
        fi
    done
    
    # Login to ECR
    print_status "Logging into ECR..."
    aws ecr get-login-password --region "$AWS_REGION" | docker login --username AWS --password-stdin "$ECR_REGISTRY"
    
    print_success "ECR setup complete"
}

# Function to build and push Docker images
build_and_push() {
    print_status "Building and pushing Docker images..."
    
    # Build and push backend
    print_status "Building backend image..."
    docker build -t "studymate/backend:latest" \
                 -t "${ECR_REGISTRY}/studymate/backend:latest" \
                 -t "${ECR_REGISTRY}/studymate/backend:${ENVIRONMENT}" \
                 --target production \
                 ./backend
    
    print_status "Pushing backend image..."
    docker push "${ECR_REGISTRY}/studymate/backend:latest"
    docker push "${ECR_REGISTRY}/studymate/backend:${ENVIRONMENT}"
    
    # Build and push frontend
    print_status "Building frontend image..."
    docker build -t "studymate/frontend:latest" \
                 -t "${ECR_REGISTRY}/studymate/frontend:latest" \
                 -t "${ECR_REGISTRY}/studymate/frontend:${ENVIRONMENT}" \
                 --target production \
                 ./frontend
    
    print_status "Pushing frontend image..."
    docker push "${ECR_REGISTRY}/studymate/frontend:latest"
    docker push "${ECR_REGISTRY}/studymate/frontend:${ENVIRONMENT}"
    
    print_success "Docker images built and pushed"
}

# Function to deploy infrastructure with Terraform
deploy_infrastructure() {
    print_status "Deploying infrastructure with Terraform..."
    
    cd "$TERRAFORM_DIR"
    
    # Initialize Terraform
    print_status "Initializing Terraform..."
    terraform init
    
    # Validate configuration
    print_status "Validating Terraform configuration..."
    terraform validate
    
    # Plan deployment
    print_status "Planning Terraform deployment..."
    terraform plan \
        -var="backend_image=${ECR_REGISTRY}/studymate/backend:${ENVIRONMENT}" \
        -var="frontend_image=${ECR_REGISTRY}/studymate/frontend:${ENVIRONMENT}" \
        -var="environment=${ENVIRONMENT}" \
        -out=tfplan
    
    # Apply infrastructure
    print_status "Applying Terraform configuration..."
    terraform apply tfplan
    
    # Get outputs
    print_status "Getting Terraform outputs..."
    terraform output
    
    cd - > /dev/null
    
    print_success "Infrastructure deployment complete"
}

# Function to run database migrations
run_migrations() {
    print_status "Running database migrations..."
    
    # Get the backend task definition ARN
    CLUSTER_NAME=$(cd "$TERRAFORM_DIR" && terraform output -raw ecs_cluster_name)
    
    # Run migration task (this would need to be implemented with a one-time task)
    print_warning "Database migrations should be run manually after first deployment"
    print_status "To run migrations:"
    print_status "1. Connect to the RDS instance"
    print_status "2. Run: npm run db:migrate"
    
    print_success "Migration instructions provided"
}

# Function to update ECS services
update_services() {
    print_status "Updating ECS services..."
    
    # Get cluster name from Terraform output
    CLUSTER_NAME=$(cd "$TERRAFORM_DIR" && terraform output -raw ecs_cluster_name)
    
    # Force new deployment of services
    print_status "Updating backend service..."
    aws ecs update-service \
        --cluster "$CLUSTER_NAME" \
        --service "studymate-${ENVIRONMENT}-backend" \
        --force-new-deployment \
        --region "$AWS_REGION"
    
    print_status "Updating frontend service..."
    aws ecs update-service \
        --cluster "$CLUSTER_NAME" \
        --service "studymate-${ENVIRONMENT}-frontend" \
        --force-new-deployment \
        --region "$AWS_REGION"
    
    print_success "ECS services updated"
}

# Function to verify deployment
verify_deployment() {
    print_status "Verifying deployment..."
    
    # Get ALB DNS name
    ALB_DNS=$(cd "$TERRAFORM_DIR" && terraform output -raw alb_dns_name)
    
    # Wait for services to be stable
    print_status "Waiting for services to stabilize..."
    CLUSTER_NAME=$(cd "$TERRAFORM_DIR" && terraform output -raw ecs_cluster_name)
    
    aws ecs wait services-stable \
        --cluster "$CLUSTER_NAME" \
        --services "studymate-${ENVIRONMENT}-backend" "studymate-${ENVIRONMENT}-frontend" \
        --region "$AWS_REGION"
    
    # Test endpoints
    print_status "Testing application endpoints..."
    
    # Test backend health
    if curl -f "http://${ALB_DNS}/health" > /dev/null 2>&1; then
        print_success "Backend health check passed"
    else
        print_warning "Backend health check failed"
    fi
    
    # Test frontend
    if curl -f "http://${ALB_DNS}/" > /dev/null 2>&1; then
        print_success "Frontend health check passed"
    else
        print_warning "Frontend health check failed"
    fi
    
    print_success "Deployment verification complete"
    print_status "Application URL: http://${ALB_DNS}"
}

# Main deployment function
main() {
    echo "🚀 StudyMate Deployment Script"
    echo "==============================="
    
    check_prerequisites
    setup_ecr
    build_and_push
    deploy_infrastructure
    run_migrations
    update_services
    verify_deployment
    
    print_success "🎉 Deployment completed successfully!"
    print_status "Next steps:"
    print_status "1. Set up domain name and SSL certificate if needed"
    print_status "2. Configure monitoring and alerting"
    print_status "3. Set up backup and disaster recovery"
}

# Handle script arguments
case "${1:-}" in
    "ecr")
        setup_ecr
        ;;
    "build")
        setup_ecr
        build_and_push
        ;;
    "infrastructure")
        deploy_infrastructure
        ;;
    "services")
        update_services
        ;;
    "verify")
        verify_deployment
        ;;
    "")
        main
        ;;
    *)
        echo "Usage: $0 [ecr|build|infrastructure|services|verify]"
        echo "  ecr           - Setup ECR repositories only"
        echo "  build         - Build and push Docker images only"
        echo "  infrastructure - Deploy Terraform infrastructure only"
        echo "  services      - Update ECS services only"
        echo "  verify        - Verify deployment only"
        echo "  (no args)     - Run full deployment"
        exit 1
        ;;
esac 