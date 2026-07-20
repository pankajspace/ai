# Shared Secrets Manager secret (SETUP.md § 2.12.2).
#
# Terraform manages the secret CONTAINER only. The JSON key/value pairs (API
# keys) are injected out-of-band so they never land in Terraform state. Update
# values with the CLI pattern in ADD_PROJECT.md § 6 or the AWS Console.

resource "aws_secretsmanager_secret" "app" {
  name        = "techtoday/secrets"
  description = "Shared API keys for techtoday container apps. Values managed outside Terraform."
}
