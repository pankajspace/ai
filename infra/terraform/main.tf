data "aws_caller_identity" "current" {}

locals {
  account_id     = data.aws_caller_identity.current.account_id
  app_fqdn       = "${var.app_subdomain}.${var.domain_name}"
  www_fqdn       = "www.${var.domain_name}"
  ecr_repo_names = [for name in keys(var.container_projects) : "techtoday/${name}"]
}

# --- Networking: security group in the default VPC -----------------------------
module "network" {
  source = "./modules/network"
}

# --- IAM: EC2 instance role, GitHub OIDC provider + deploy role ----------------
module "iam" {
  source = "./modules/iam"

  account_id    = local.account_id
  aws_region    = var.aws_region
  github_org    = var.github_org
  github_repo   = var.github_repo
  github_branch = var.github_branch
}

# --- ECR: one repository per container project ---------------------------------
module "ecr" {
  source = "./modules/ecr"

  repository_names = local.ecr_repo_names
}

# --- Secrets Manager: shared techtoday/secrets shell ---------------------------
module "secrets" {
  source = "./modules/secrets"
}

# --- Compute: EC2 instance + Elastic IP + instance profile ---------------------
module "compute" {
  source = "./modules/compute"

  instance_type     = var.instance_type
  key_name          = var.key_name
  security_group_id = module.network.security_group_id
  instance_profile  = module.iam.instance_profile_name
  domain_name       = var.domain_name
  app_fqdn          = local.app_fqdn
  www_fqdn          = local.www_fqdn
}

# --- DNS: Route 53 A records for root, www, and app ----------------------------
module "dns" {
  source = "./modules/dns"

  domain_name = var.domain_name
  app_fqdn    = local.app_fqdn
  www_fqdn    = local.www_fqdn
  elastic_ip  = module.compute.elastic_ip
}

# --- EC2 in-box config: render + push Nginx locations, docker-compose, env -----
module "config" {
  source = "./modules/config"

  elastic_ip           = module.compute.elastic_ip
  ssh_private_key_path = var.ssh_private_key_path
  aws_region           = var.aws_region
  account_id           = local.account_id
  container_projects   = var.container_projects

  # Ensure the instance and its ECR repos exist before we push config to it.
  depends_on = [module.compute, module.ecr]
}
