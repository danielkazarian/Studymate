# VPC Outputs
output "vpc_id" {
  description = "VPC ID"
  value       = module.vpc.vpc_id
}

output "vpc_cidr_block" {
  description = "VPC CIDR block"
  value       = module.vpc.vpc_cidr_block
}

output "public_subnet_ids" {
  description = "Public subnet IDs"
  value       = module.vpc.public_subnet_ids
}

output "private_subnet_ids" {
  description = "Private subnet IDs"
  value       = module.vpc.private_subnet_ids
}

# Database Outputs
output "database_endpoint" {
  description = "RDS instance endpoint"
  value       = module.database.endpoint
  sensitive   = true
}

output "database_port" {
  description = "RDS instance port"
  value       = module.database.port
}

# Cache Outputs
output "redis_endpoint" {
  description = "Redis endpoint"
  value       = module.cache.endpoint
  sensitive   = true
}

output "redis_port" {
  description = "Redis port"
  value       = module.cache.port
}

# Storage Outputs
output "s3_bucket_name" {
  description = "S3 bucket name"
  value       = module.storage.bucket_name
}

output "s3_bucket_arn" {
  description = "S3 bucket ARN"
  value       = module.storage.bucket_arn
}

# ECS Outputs
output "ecs_cluster_name" {
  description = "ECS cluster name"
  value       = module.ecs.cluster_name
}

output "ecs_cluster_arn" {
  description = "ECS cluster ARN"
  value       = module.ecs.cluster_arn
}

output "alb_dns_name" {
  description = "Application Load Balancer DNS name"
  value       = module.ecs.alb_dns_name
}

output "alb_zone_id" {
  description = "Application Load Balancer zone ID"
  value       = module.ecs.alb_zone_id
}

# Application URLs
output "application_url" {
  description = "Application URL"
  value       = var.domain_name != "" ? "https://${var.domain_name}" : "http://${module.ecs.alb_dns_name}"
}

output "api_url" {
  description = "API URL"
  value       = var.domain_name != "" ? "https://api.${var.domain_name}" : "http://${module.ecs.alb_dns_name}/api"
}

# DNS Outputs (if domain configured)
output "domain_name" {
  description = "Domain name"
  value       = var.domain_name
}

output "certificate_arn" {
  description = "SSL certificate ARN"
  value       = var.domain_name != "" ? module.dns[0].certificate_arn : null
}

# CDN Outputs (if enabled)
output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID"
  value       = var.enable_cdn ? module.cdn[0].distribution_id : null
}

output "cloudfront_domain_name" {
  description = "CloudFront domain name"
  value       = var.enable_cdn ? module.cdn[0].domain_name : null
}

# Security Group IDs
output "alb_security_group_id" {
  description = "ALB security group ID"
  value       = module.security.alb_security_group_id
}

output "ecs_security_group_id" {
  description = "ECS security group ID"
  value       = module.security.ecs_security_group_id
}

output "rds_security_group_id" {
  description = "RDS security group ID"
  value       = module.security.rds_security_group_id
}

output "redis_security_group_id" {
  description = "Redis security group ID"
  value       = module.security.redis_security_group_id
}

# Task Definition ARNs
output "backend_task_definition_arn" {
  description = "Backend task definition ARN"
  value       = module.ecs.backend_task_definition_arn
}

output "frontend_task_definition_arn" {
  description = "Frontend task definition ARN"
  value       = module.ecs.frontend_task_definition_arn
}

# Service ARNs
output "backend_service_arn" {
  description = "Backend service ARN"
  value       = module.ecs.backend_service_arn
}

output "frontend_service_arn" {
  description = "Frontend service ARN"
  value       = module.ecs.frontend_service_arn
} 