# General Configuration
variable "project_name" {
  description = "Name of the project"
  type        = string
  default     = "studymate"
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "prod"
}

variable "owner" {
  description = "Owner of the resources"
  type        = string
  default     = "studymate-team"
}

variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "us-east-1"
}

# Network Configuration
variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

# Database Configuration
variable "db_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.micro"
}

variable "db_allocated_storage" {
  description = "Allocated storage for RDS instance"
  type        = number
  default     = 20
}

variable "db_name" {
  description = "Database name"
  type        = string
  default     = "studymate"
}

variable "db_username" {
  description = "Database username"
  type        = string
  default     = "studymate"
}

variable "db_password" {
  description = "Database password"
  type        = string
  sensitive   = true
}

variable "backup_retention_period" {
  description = "Backup retention period in days"
  type        = number
  default     = 7
}

variable "backup_window" {
  description = "Backup window"
  type        = string
  default     = "07:00-09:00"
}

variable "maintenance_window" {
  description = "Maintenance window"
  type        = string
  default     = "sun:09:00-sun:11:00"
}

# Redis Configuration
variable "redis_node_type" {
  description = "ElastiCache node type"
  type        = string
  default     = "cache.t3.micro"
}

variable "redis_num_nodes" {
  description = "Number of cache nodes"
  type        = number
  default     = 1
}

variable "redis_parameter_group" {
  description = "Redis parameter group"
  type        = string
  default     = "default.redis7"
}

# ECS Configuration
variable "backend_image" {
  description = "Backend Docker image"
  type        = string
  default     = "studymate/backend:latest"
}

variable "backend_port" {
  description = "Backend port"
  type        = number
  default     = 3001
}

variable "backend_cpu" {
  description = "Backend CPU units"
  type        = number
  default     = 512
}

variable "backend_memory" {
  description = "Backend memory (MB)"
  type        = number
  default     = 1024
}

variable "backend_desired_count" {
  description = "Desired number of backend tasks"
  type        = number
  default     = 2
}

variable "frontend_image" {
  description = "Frontend Docker image"
  type        = string
  default     = "studymate/frontend:latest"
}

variable "frontend_port" {
  description = "Frontend port"
  type        = number
  default     = 3000
}

variable "frontend_cpu" {
  description = "Frontend CPU units"
  type        = number
  default     = 256
}

variable "frontend_memory" {
  description = "Frontend memory (MB)"
  type        = number
  default     = 512
}

variable "frontend_desired_count" {
  description = "Desired number of frontend tasks"
  type        = number
  default     = 2
}

# Secrets
variable "jwt_secret" {
  description = "JWT secret key"
  type        = string
  sensitive   = true
}

variable "refresh_token_secret" {
  description = "Refresh token secret key"
  type        = string
  sensitive   = true
}

variable "encryption_key" {
  description = "Encryption key for API keys"
  type        = string
  sensitive   = true
}

variable "google_client_id" {
  description = "Google OAuth client ID"
  type        = string
  default     = ""
}

variable "google_client_secret" {
  description = "Google OAuth client secret"
  type        = string
  sensitive   = true
  default     = ""
}

# DNS and SSL
variable "domain_name" {
  description = "Domain name for the application"
  type        = string
  default     = ""
}

variable "enable_cdn" {
  description = "Enable CloudFront CDN"
  type        = bool
  default     = false
}

# Logging
variable "log_retention_days" {
  description = "CloudWatch log retention in days"
  type        = number
  default     = 14
} 