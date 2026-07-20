# Security group in the account's default VPC, matching SETUP.md § 2.4.

data "aws_vpc" "default" {
  default = true
}

resource "aws_security_group" "server" {
  name        = "techtoday-server-sg"
  description = "EC2 app server - allow SSH, HTTP, HTTPS"
  vpc_id      = data.aws_vpc.default.id

  # SSH — terminal access to the instance.
  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # HTTP — Let's Encrypt ACME challenges + HTTP->HTTPS redirects.
  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # HTTPS — serves all production traffic.
  ingress {
    description = "HTTPS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    description = "All outbound"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "techtoday-server-sg"
  }
}
