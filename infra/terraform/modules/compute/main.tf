# Shared EC2 app server + Elastic IP (SETUP.md § 2.4 – § 2.6).

# Latest Amazon Linux 2023 x86_64 AMI.
data "aws_ami" "al2023" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-*-x86_64"]
  }

  filter {
    name   = "state"
    values = ["available"]
  }
}

resource "aws_instance" "server" {
  ami                    = data.aws_ami.al2023.id
  instance_type          = var.instance_type
  key_name               = var.key_name
  vpc_security_group_ids = [var.security_group_id]
  iam_instance_profile   = var.instance_profile

  user_data = templatefile("${path.module}/../../templates/user_data.sh.tftpl", {
    domain_name = var.domain_name
    www_fqdn    = var.www_fqdn
    app_fqdn    = var.app_fqdn
  })

  tags = {
    Name = "techtoday-server"
  }

  # Protect the LIVE imported instance: changing user_data or the AMI would
  # force a destroy/recreate of the running production server. Ignore those so
  # `apply` never replaces the box in place. For a true disaster-recovery
  # REBUILD, remove these ignores (or `terraform taint` the instance) so the
  # user_data bootstrap runs on a fresh instance.
  lifecycle {
    ignore_changes = [ami, user_data]
  }
}

resource "aws_eip" "server" {
  domain   = "vpc"
  instance = aws_instance.server.id

  tags = {
    Name = "techtoday-server-eip"
  }
}
