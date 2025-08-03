terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# Data sources
data "aws_availability_zones" "available" {
  state = "available"
}

data "aws_caller_identity" "current" {}

# Random suffix for unique resource naming
resource "random_string" "suffix" {
  length  = 8
  special = false
  upper   = false
}

# Local values
locals {
  name_prefix = "${var.project_name}-${var.environment}"
  common_tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "terraform"
    Owner       = var.owner
  }
}

# VPC and Networking
module "vpc" {
  source = "./modules/vpc"
  
  name_prefix         = local.name_prefix
  cidr_block         = var.vpc_cidr
  availability_zones = slice(data.aws_availability_zones.available.names, 0, 2)
  
  tags = local.common_tags
}

# Security Groups
module "security" {
  source = "./modules/security"
  
  vpc_id      = module.vpc.vpc_id
  name_prefix = local.name_prefix
  
  tags = local.common_tags
}

# RDS Database
module "database" {
  source = "./modules/database"
  
  name_prefix           = local.name_prefix
  vpc_id               = module.vpc.vpc_id
  subnet_ids           = module.vpc.private_subnet_ids
  security_group_ids   = [module.security.rds_security_group_id]
  
  db_instance_class    = var.db_instance_class
  db_allocated_storage = var.db_allocated_storage
  db_name             = var.db_name
  db_username         = var.db_username
  db_password         = var.db_password
  
  backup_retention_period = var.backup_retention_period
  backup_window          = var.backup_window
  maintenance_window     = var.maintenance_window
  
  tags = local.common_tags
}

# ElastiCache Redis
module "cache" {
  source = "./modules/cache"
  
  name_prefix        = local.name_prefix
  vpc_id            = module.vpc.vpc_id
  subnet_ids        = module.vpc.private_subnet_ids
  security_group_ids = [module.security.redis_security_group_id]
  
  node_type          = var.redis_node_type
  num_cache_nodes    = var.redis_num_nodes
  parameter_group    = var.redis_parameter_group
  
  tags = local.common_tags
}

# S3 Bucket for file storage
module "storage" {
  source = "./modules/storage"
  
  name_prefix = local.name_prefix
  suffix     = random_string.suffix.result
  
  tags = local.common_tags
}

# ECS Cluster and Services
module "ecs" {
  source = "./modules/ecs"
  
  name_prefix = local.name_prefix
  vpc_id     = module.vpc.vpc_id
  
  public_subnet_ids  = module.vpc.public_subnet_ids
  private_subnet_ids = module.vpc.private_subnet_ids
  
  alb_security_group_id = module.security.alb_security_group_id
  ecs_security_group_id = module.security.ecs_security_group_id
  
  # Backend configuration
  backend_image       = var.backend_image
  backend_port        = var.backend_port
  backend_cpu         = var.backend_cpu
  backend_memory      = var.backend_memory
  backend_desired_count = var.backend_desired_count
  
  # Frontend configuration
  frontend_image       = var.frontend_image
  frontend_port        = var.frontend_port
  frontend_cpu         = var.frontend_cpu
  frontend_memory      = var.frontend_memory
  frontend_desired_count = var.frontend_desired_count
  
  # Environment variables
  database_url = module.database.connection_string
  redis_url    = module.cache.connection_string
  s3_bucket    = module.storage.bucket_name
  
  # Secrets
  jwt_secret                = var.jwt_secret
  refresh_token_secret      = var.refresh_token_secret
  encryption_key           = var.encryption_key
  google_client_id         = var.google_client_id
  google_client_secret     = var.google_client_secret
  
  tags = local.common_tags
}

# CloudWatch Log Groups
resource "aws_cloudwatch_log_group" "backend" {
  name              = "/ecs/${local.name_prefix}-backend"
  retention_in_days = var.log_retention_days
  
  tags = local.common_tags
}

resource "aws_cloudwatch_log_group" "frontend" {
  name              = "/ecs/${local.name_prefix}-frontend"
  retention_in_days = var.log_retention_days
  
  tags = local.common_tags
}

# Route53 and SSL Certificate (optional)
module "dns" {
  source = "./modules/dns"
  count  = var.domain_name != "" ? 1 : 0
  
  domain_name         = var.domain_name
  alb_dns_name       = module.ecs.alb_dns_name
  alb_zone_id        = module.ecs.alb_zone_id
  
  tags = local.common_tags
}

# CloudFront Distribution (optional)
module "cdn" {
  source = "./modules/cdn"
  count  = var.enable_cdn ? 1 : 0
  
  name_prefix = local.name_prefix
  alb_dns_name = module.ecs.alb_dns_name
  s3_bucket_domain = module.storage.bucket_domain_name
  
  domain_name = var.domain_name
  certificate_arn = var.domain_name != "" ? module.dns[0].certificate_arn : null
  
  tags = local.common_tags
} 