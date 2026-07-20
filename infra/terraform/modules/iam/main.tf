# =============================================================================
# EC2 instance role + instance profile (SETUP.md § 2.10)
# Grants: read techtoday/* secrets, pull from ECR.
# =============================================================================

data "aws_iam_policy_document" "ec2_assume" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["ec2.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "ec2_server" {
  name               = "ec2-techtoday-server-role"
  assume_role_policy = data.aws_iam_policy_document.ec2_assume.json
}

data "aws_iam_policy_document" "ec2_app_secrets" {
  statement {
    sid       = "ReadAppSecrets"
    effect    = "Allow"
    actions   = ["secretsmanager:GetSecretValue"]
    resources = ["arn:aws:secretsmanager:*:*:secret:techtoday/*"]
  }

  statement {
    sid       = "PullFromEcr"
    effect    = "Allow"
    actions   = ["ecr:GetAuthorizationToken", "ecr:BatchGetImage", "ecr:GetDownloadUrlForLayer"]
    resources = ["*"]
  }
}

resource "aws_iam_role_policy" "ec2_app_secrets" {
  name   = "AllowAppSecrets"
  role   = aws_iam_role.ec2_server.id
  policy = data.aws_iam_policy_document.ec2_app_secrets.json
}

resource "aws_iam_instance_profile" "ec2_server" {
  name = "ec2-techtoday-server-profile"
  role = aws_iam_role.ec2_server.name
}

# =============================================================================
# GitHub Actions OIDC provider + deploy role (SETUP.md § 2.11)
# Grants: ECR auth + push to techtoday/* repositories.
# =============================================================================

resource "aws_iam_openid_connect_provider" "github" {
  url             = "https://token.actions.githubusercontent.com"
  client_id_list  = ["sts.amazonaws.com"]
  thumbprint_list = ["6938fd4d98bab03faadb97b34396831e3780aea1"]
}

data "aws_iam_policy_document" "github_assume" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRoleWithWebIdentity"]

    principals {
      type        = "Federated"
      identifiers = [aws_iam_openid_connect_provider.github.arn]
    }

    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:aud"
      values   = ["sts.amazonaws.com"]
    }

    condition {
      test     = "StringLike"
      variable = "token.actions.githubusercontent.com:sub"
      values   = ["repo:${var.github_org}/${var.github_repo}:ref:refs/heads/${var.github_branch}"]
    }
  }
}

resource "aws_iam_role" "github_deploy" {
  name               = "github-actions-deploy"
  assume_role_policy = data.aws_iam_policy_document.github_assume.json
}

data "aws_iam_policy_document" "github_ecr_push" {
  statement {
    sid       = "EcrAuth"
    effect    = "Allow"
    actions   = ["ecr:GetAuthorizationToken"]
    resources = ["*"]
  }

  statement {
    sid    = "EcrPush"
    effect = "Allow"
    actions = [
      "ecr:BatchCheckLayerAvailability",
      "ecr:PutImage",
      "ecr:InitiateLayerUpload",
      "ecr:UploadLayerPart",
      "ecr:CompleteLayerUpload",
    ]
    resources = ["arn:aws:ecr:*:${var.account_id}:repository/techtoday/*"]
  }
}

resource "aws_iam_role_policy" "github_ecr_push" {
  name   = "ECRPushAndSSH"
  role   = aws_iam_role.github_deploy.id
  policy = data.aws_iam_policy_document.github_ecr_push.json
}
