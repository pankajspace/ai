output "instance_profile_name" {
  description = "Name of the EC2 instance profile."
  value       = aws_iam_instance_profile.ec2_server.name
}

output "ec2_role_arn" {
  description = "ARN of the EC2 instance role."
  value       = aws_iam_role.ec2_server.arn
}

output "github_deploy_role_arn" {
  description = "ARN of the github-actions-deploy role."
  value       = aws_iam_role.github_deploy.arn
}

output "github_oidc_provider_arn" {
  description = "ARN of the GitHub OIDC provider."
  value       = aws_iam_openid_connect_provider.github.arn
}
