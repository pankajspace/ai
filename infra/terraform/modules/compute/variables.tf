variable "instance_type" {
  description = "EC2 instance type."
  type        = string
}

variable "key_name" {
  description = "Name of the existing EC2 key pair."
  type        = string
}

variable "security_group_id" {
  description = "Security group ID to attach to the instance."
  type        = string
}

variable "instance_profile" {
  description = "IAM instance profile name for ECR + Secrets access."
  type        = string
}

variable "domain_name" {
  description = "Root domain (for Nginx server_name)."
  type        = string
}

variable "app_fqdn" {
  description = "App subdomain FQDN (for Nginx server_name)."
  type        = string
}

variable "www_fqdn" {
  description = "www FQDN (for Nginx server_name)."
  type        = string
}
