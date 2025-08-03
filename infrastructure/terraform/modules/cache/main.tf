# ElastiCache Redis Module

# ElastiCache Subnet Group
resource "aws_elasticache_subnet_group" "main" {
  name       = "${var.name_prefix}-cache-subnet-group"
  subnet_ids = var.subnet_ids

  tags = merge(var.tags, {
    Name = "${var.name_prefix}-cache-subnet-group"
  })
}

# ElastiCache Parameter Group
resource "aws_elasticache_parameter_group" "main" {
  family = "redis7.x"
  name   = "${var.name_prefix}-cache-params"

  parameter {
    name  = "maxmemory-policy"
    value = "allkeys-lru"
  }

  tags = merge(var.tags, {
    Name = "${var.name_prefix}-cache-params"
  })
}

# ElastiCache Replication Group
resource "aws_elasticache_replication_group" "main" {
  replication_group_id         = "${var.name_prefix}-redis"
  description                  = "Redis cluster for StudyMate"

  # Node configuration
  node_type                    = var.node_type
  port                         = 6379
  parameter_group_name         = aws_elasticache_parameter_group.main.name

  # Cluster configuration
  num_cache_clusters           = var.num_cache_nodes
  automatic_failover_enabled   = var.num_cache_nodes > 1
  multi_az_enabled            = var.num_cache_nodes > 1

  # Network configuration
  subnet_group_name           = aws_elasticache_subnet_group.main.name
  security_group_ids          = var.security_group_ids

  # Engine configuration
  engine                      = "redis"
  engine_version              = "7.0"
  
  # Backup configuration
  snapshot_retention_limit    = 5
  snapshot_window            = "03:00-05:00"
  maintenance_window         = "sun:05:00-sun:09:00"

  # Security
  at_rest_encryption_enabled = true
  transit_encryption_enabled = true
  auth_token                 = var.auth_token

  # Logging
  log_delivery_configuration {
    destination      = aws_cloudwatch_log_group.redis_slow.name
    destination_type = "cloudwatch-logs"
    log_format       = "text"
    log_type         = "slow-log"
  }

  tags = merge(var.tags, {
    Name = "${var.name_prefix}-redis"
  })

  depends_on = [aws_cloudwatch_log_group.redis_slow]
}

# CloudWatch Log Group for Redis slow logs
resource "aws_cloudwatch_log_group" "redis_slow" {
  name              = "/aws/elasticache/redis/${var.name_prefix}/slow-log"
  retention_in_days = 7

  tags = var.tags
} 