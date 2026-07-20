output "instance_id" {
  description = "EC2 instance ID."
  value       = aws_instance.server.id
}

output "elastic_ip" {
  description = "Public Elastic IP associated with the instance."
  value       = aws_eip.server.public_ip
}

output "eip_allocation_id" {
  description = "Elastic IP allocation ID."
  value       = aws_eip.server.allocation_id
}
