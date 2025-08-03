variable "name_prefix" {
  description = "Name prefix for all resources"
  type        = string
}

variable "vpc_id" {
  description = "VPC ID"
  type        = string
}

variable "public_subnet_ids" {
  description = "List of public subnet IDs"
  type        = list(string)
}

variable "private_subnet_ids" {
  description = "List of private subnet IDs"
  type        = list(string)
}

variable "alb_security_group_id" {
  description = "ALB security group ID"
  type        = string
}

variable "ecs_security_group_id" {
  description = "ECS security group ID"
  type        = string
}

# Backend Configuration
variable "backend_image" {
  description = "Backend Docker image"
  type        = string
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

# Frontend Configuration
variable "frontend_image" {
  description = "Frontend Docker image"
  type        = string
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

# Environment Variables
variable "database_url" {
  description = "Database connection string"
  type        = string
  sensitive   = true
}

variable "redis_url" {
  description = "Redis connection string"
  type        = string
  sensitive   = true
}

variable "s3_bucket" {
  description = "S3 bucket name"
  type        = string
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

variable "tags" {
  description = "Common tags to apply to all resources"
  type        = map(string)
  default     = {}
} 