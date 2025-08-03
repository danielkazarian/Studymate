variable "name_prefix" {
  description = "Name prefix for all resources"
  type        = string
}

variable "suffix" {
  description = "Random suffix for unique bucket naming"
  type        = string
}

variable "tags" {
  description = "Common tags to apply to all resources"
  type        = map(string)
  default     = {}
} 