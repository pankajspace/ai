variable "account_id" {
  description = "AWS account ID."
  type        = string
}

variable "aws_region" {
  description = "AWS region."
  type        = string
}

variable "github_org" {
  description = "GitHub org or username."
  type        = string
}

variable "github_repo" {
  description = "GitHub repository name."
  type        = string
}

variable "github_branch" {
  description = "Branch allowed to assume the deploy role."
  type        = string
  default     = "main"
}
