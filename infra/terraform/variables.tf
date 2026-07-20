# -----------------------------------------------------------------------------
# Core settings — mirror projects/SETUP.md defaults.
# -----------------------------------------------------------------------------

variable "aws_region" {
  description = "AWS region for all resources (SETUP.md uses us-east-1)."
  type        = string
  default     = "us-east-1"
}

variable "domain_name" {
  description = "Root domain served by the shared EC2 instance."
  type        = string
  default     = "techtoday.click"
}

variable "app_subdomain" {
  description = "Subdomain that fronts all container apps."
  type        = string
  default     = "app"
}

# -----------------------------------------------------------------------------
# EC2 / compute
# -----------------------------------------------------------------------------

variable "instance_type" {
  description = "EC2 instance type (t2.micro on Free Tier; t3.small for heavier loads)."
  type        = string
  default     = "t2.micro"
}

variable "key_name" {
  description = "Name of the EXISTING EC2 key pair used to launch the instance (SETUP.md § 2.4)."
  type        = string
  default     = "techtoday_PAIR"
}

variable "ssh_private_key_path" {
  description = "Local path to the .pem private key, used by the config module to push Nginx/Compose files over SSH."
  type        = string
  default     = "~/.ssh/techtoday.pem"
}

# -----------------------------------------------------------------------------
# GitHub OIDC (CI/CD)
# -----------------------------------------------------------------------------

variable "github_org" {
  description = "GitHub org or username that owns the repo (SETUP.md § 2.11)."
  type        = string
}

variable "github_repo" {
  description = "GitHub repository name that runs the deploy workflows."
  type        = string
}

variable "github_branch" {
  description = "Branch allowed to assume the deploy role."
  type        = string
  default     = "main"
}

# -----------------------------------------------------------------------------
# Projects — the single source of truth for container apps.
#
# The actual values live in the committed `projects.auto.tfvars.json`, which
# Terraform auto-loads. That file is edited by `scripts/new-project.sh`
# (via `make new-project`) so adding an app never requires hand-editing HCL.
# The default below is empty on purpose so the JSON file is authoritative.
#
# Each entry provisions everything a new container app needs on AWS + the EC2
# host: an ECR repo, an Nginx location block, a docker-compose service, and a
# secrets env file. The first CI/CD push then builds the image and starts it.
# -----------------------------------------------------------------------------

variable "container_projects" {
  description = "Map of container app name => settings. Managed in projects.auto.tfvars.json."
  type = map(object({
    host_port = number # unique EC2 host port (500x range)
  }))
  default = {}
}
