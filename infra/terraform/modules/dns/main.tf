# Route 53 A records for the root, www, and app hostnames (SETUP.md § 2.7).
# The hosted zone is assumed to already exist (created with the domain).

data "aws_route53_zone" "this" {
  name         = "${var.domain_name}."
  private_zone = false
}

resource "aws_route53_record" "root" {
  zone_id = data.aws_route53_zone.this.zone_id
  name    = var.domain_name
  type    = "A"
  ttl     = 300
  records = [var.elastic_ip]
}

resource "aws_route53_record" "www" {
  zone_id = data.aws_route53_zone.this.zone_id
  name    = var.www_fqdn
  type    = "A"
  ttl     = 300
  records = [var.elastic_ip]
}

resource "aws_route53_record" "app" {
  zone_id = data.aws_route53_zone.this.zone_id
  name    = var.app_fqdn
  type    = "A"
  ttl     = 300
  records = [var.elastic_ip]
}
