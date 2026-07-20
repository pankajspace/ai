provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project   = "techtoday"
      ManagedBy = "terraform"
    }
  }
}
