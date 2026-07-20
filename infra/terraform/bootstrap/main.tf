# Bootstrap: creates the S3 bucket and DynamoDB lock table that hold the
# Terraform remote state for the main configuration.
#
# This module intentionally uses LOCAL state (there is no backend block here),
# because it is the thing that creates the remote-state backend itself — a
# classic chicken-and-egg. Run it once, commit nothing sensitive, and keep the
# generated bootstrap/terraform.tfstate file safe (it only tracks the bucket
# and table, both of which are trivially re-importable).
#
# Usage:
#   cd infra/terraform/bootstrap
#   terraform init
#   terraform apply
#
# Then configure the main project's backend.tf with the outputs below.

terraform {
  required_version = ">= 1.6.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

resource "aws_s3_bucket" "state" {
  bucket = var.state_bucket_name

  # Guard against accidental `terraform destroy` wiping your state history.
  lifecycle {
    prevent_destroy = true
  }
}

resource "aws_s3_bucket_versioning" "state" {
  bucket = aws_s3_bucket.state.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "state" {
  bucket = aws_s3_bucket.state.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "state" {
  bucket                  = aws_s3_bucket.state.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_dynamodb_table" "lock" {
  name         = var.lock_table_name
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "LockID"

  attribute {
    name = "LockID"
    type = "S"
  }
}
