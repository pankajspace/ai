output "zone_id" {
  description = "Route 53 hosted zone ID."
  value       = data.aws_route53_zone.this.zone_id
}

output "records" {
  description = "FQDNs of the managed A records."
  value = [
    aws_route53_record.root.fqdn,
    aws_route53_record.www.fqdn,
    aws_route53_record.app.fqdn,
  ]
}
