output "secret_arn" {
  description = "ARN of the shared techtoday/secrets secret."
  value       = aws_secretsmanager_secret.app.arn
}

output "secret_name" {
  description = "Name of the shared secret."
  value       = aws_secretsmanager_secret.app.name
}
