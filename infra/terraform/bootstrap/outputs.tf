output "state_bucket_name" {
  description = "Set this as `bucket` in the main configuration's backend.tf."
  value       = aws_s3_bucket.state.id
}

output "lock_table_name" {
  description = "Set this as `dynamodb_table` in the main configuration's backend.tf."
  value       = aws_dynamodb_table.lock.name
}

output "region" {
  description = "Set this as `region` in the main configuration's backend.tf."
  value       = var.aws_region
}
