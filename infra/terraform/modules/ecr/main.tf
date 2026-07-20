# One private ECR repository per container project (ADD_PROJECT.md § 4).

resource "aws_ecr_repository" "this" {
  for_each = toset(var.repository_names)

  name                 = each.value
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    # Registry-level scanning is configured below; keep per-repo off to avoid
    # duplicate scans.
    scan_on_push = false
  }
}

# Registry-level enhanced scanning for all techtoday/* repositories
# (matches the "scanning configured at registry level" convention).
resource "aws_ecr_registry_scanning_configuration" "this" {
  scan_type = "BASIC"

  rule {
    scan_frequency = "SCAN_ON_PUSH"
    repository_filter {
      filter      = "techtoday/*"
      filter_type = "WILDCARD"
    }
  }
}
