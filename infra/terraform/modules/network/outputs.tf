output "security_group_id" {
  description = "ID of the shared server security group."
  value       = aws_security_group.server.id
}

output "vpc_id" {
  description = "Default VPC ID."
  value       = data.aws_vpc.default.id
}
