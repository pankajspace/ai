variable "elastic_ip" {
  description = "Public IP of the EC2 host to push config to."
  type        = string
}

variable "ssh_private_key_path" {
  description = "Local path to the .pem private key for SSH."
  type        = string
}

variable "aws_region" {
  description = "AWS region (used by the on-host regen script)."
  type        = string
}

variable "account_id" {
  description = "AWS account ID (used to build ECR image URLs)."
  type        = string
}

variable "container_projects" {
  description = "Map of container app name => settings."
  type = map(object({
    host_port = number
  }))
}
