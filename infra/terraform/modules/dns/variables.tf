variable "domain_name" {
  description = "Root domain / hosted zone name (without trailing dot)."
  type        = string
}

variable "app_fqdn" {
  description = "App subdomain FQDN."
  type        = string
}

variable "www_fqdn" {
  description = "www FQDN."
  type        = string
}

variable "elastic_ip" {
  description = "Elastic IP that all A records point to."
  type        = string
}
