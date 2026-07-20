# =============================================================================
# EC2 in-box config push (replaces the manual steps in ADD_PROJECT.md § 7).
#
# Renders the Nginx location blocks, docker-compose.yml, and secrets-regen
# script from the container_projects map, then pushes them to the EC2 host over
# SSH and reloads Nginx. Re-runs whenever the rendered content changes.
#
# It does NOT start containers — image build + start stays with the per-project
# GitHub Actions workflow (projects/DAILY.md), which runs after the first push.
# =============================================================================

locals {
  app_locations = templatefile("${path.module}/../../templates/app-locations.conf.tftpl", {
    projects = var.container_projects
  })

  docker_compose = templatefile("${path.module}/../../templates/docker-compose.yml.tftpl", {
    projects   = var.container_projects
    account_id = var.account_id
    region     = var.aws_region
  })

  regen_secrets = templatefile("${path.module}/../../templates/regen-secrets.sh.tftpl", {
    region        = var.aws_region
    project_names = join(" ", keys(var.container_projects))
  })
}

resource "null_resource" "push_config" {
  # Re-run when any rendered artifact or the target host changes.
  triggers = {
    app_locations  = sha256(local.app_locations)
    docker_compose = sha256(local.docker_compose)
    regen_secrets  = sha256(local.regen_secrets)
    host           = var.elastic_ip
  }

  connection {
    type        = "ssh"
    host        = var.elastic_ip
    user        = "ec2-user"
    private_key = file(pathexpand(var.ssh_private_key_path))
  }

  # Upload rendered files to a staging area first.
  provisioner "file" {
    content     = local.app_locations
    destination = "/tmp/app-locations.conf"
  }

  provisioner "file" {
    content     = local.docker_compose
    destination = "/home/ec2-user/docker-compose.yml"
  }

  provisioner "file" {
    content     = local.regen_secrets
    destination = "/tmp/regen-secrets.sh"
  }

  # Move Nginx config into place, validate, reload, then regenerate env files.
  provisioner "remote-exec" {
    inline = [
      "set -e",
      "sudo mkdir -p /etc/nginx/app-locations",
      "sudo mv /tmp/app-locations.conf /etc/nginx/app-locations/projects.conf",
      "sudo nginx -t",
      "sudo systemctl reload nginx",
      "chmod +x /tmp/regen-secrets.sh",
      "/tmp/regen-secrets.sh",
      "rm -f /tmp/regen-secrets.sh",
    ]
  }
}
