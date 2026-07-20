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

  # Protect the LIVE imported instance from disruptive changes:
  #   - ami / user_data: a change would force a destroy/recreate of the running
  #     production server.
  #   - vpc_security_group_ids: the live instance was launched with the account
  #     `default` security group, not the dedicated `techtoday-server-sg` this
  #     module defines. Ignoring it means `apply` never re-points the live
  #     instance's networking. The dedicated SG is still created and is used
  #     automatically on a fresh disaster-recovery rebuild.
  # For a true DR REBUILD, remove these ignores (or `terraform taint` the
  # instance) so a fresh instance launches with user_data + techtoday-server-sg.
  lifecycle {
    ignore_changes = [ami, user_data, vpc_security_group_ids]
  }
}

resource "aws_eip" "server" {
  domain   = "vpc"
  instance = aws_instance.server.id

  tags = {
    Name = "techtoday-server-eip"
  }
}
