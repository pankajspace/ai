# Remote state backend.
#
# Create the bucket and lock table FIRST with the bootstrap module
# (see ./bootstrap), then run `terraform init` here. If the values below differ
# from the bootstrap outputs, update them to match.
#
# You cannot use variables in a backend block, so these are hard-coded on
# purpose. If you change the bucket/table names in bootstrap/variables.tf,
# change them here too.
terraform {
  backend "s3" {
    bucket         = "techtoday-terraform-state"
    key            = "techtoday/infra.tfstate"
    region         = "us-east-1"
    dynamodb_table = "techtoday-terraform-locks"
    encrypt        = true
  }
}
