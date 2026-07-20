output "elastic_ip" {
  description = "Public Elastic IP of the shared EC2 instance (EC2_HOST GitHub secret)."
  value       = module.compute.elastic_ip
}

output "instance_id" {
  description = "EC2 instance ID."
  value       = module.compute.instance_id
}

output "account_id" {
  description = "AWS account ID (AWS_ACCOUNT_ID GitHub secret)."
  value       = local.account_id
}

output "github_deploy_role_arn" {
  description = "ARN of the github-actions-deploy role (AWS_DEPLOY_ROLE_ARN GitHub secret)."
  value       = module.iam.github_deploy_role_arn
}

output "ecr_repository_urls" {
  description = "ECR repository URLs, one per container project."
  value       = module.ecr.repository_urls
}

output "app_url" {
  description = "Base URL that fronts all container apps."
  value       = "https://${local.app_fqdn}/"
}
