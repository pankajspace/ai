# Convenience wrapper for the techtoday.click Terraform setup.
# Run from infra/terraform/. Uses OpenTofu if present, otherwise Terraform.

TF ?= $(shell command -v tofu >/dev/null 2>&1 && echo tofu || echo terraform)

# Args for `new-project`
NAME  ?=
LOCAL ?=
HOST  ?=

SCAFFOLD := ../../scripts/new-project.sh

.PHONY: help bootstrap init fmt validate plan apply output scaffold new-project

help:
	@echo "Targets (TF=$(TF)):"
	@echo "  make bootstrap    - create the S3 state bucket + DynamoDB lock (run once)"
	@echo "  make init         - terraform init (S3 backend)"
	@echo "  make fmt          - format all .tf files"
	@echo "  make validate     - fmt check + validate"
	@echo "  make plan         - show planned changes"
	@echo "  make apply        - apply changes"
	@echo "  make output       - show outputs (EIP, role ARN, ...)"
	@echo "  make scaffold NAME=x LOCAL=8083 HOST=5003   - repo files only"
	@echo "  make new-project NAME=x LOCAL=8083 HOST=5003 - scaffold + terraform apply"

bootstrap:
	cd bootstrap && $(TF) init && $(TF) apply

init:
	$(TF) init

fmt:
	$(TF) fmt -recursive

validate:
	$(TF) fmt -check -recursive && $(TF) validate

plan:
	$(TF) plan

apply:
	$(TF) apply

output:
	$(TF) output

# Repo-side scaffolding only (folder + workflow + register in tfvars json).
scaffold:
	@test -n "$(NAME)"  || { echo "NAME is required (e.g. NAME=insights)"; exit 1; }
	@test -n "$(LOCAL)" || { echo "LOCAL is required (e.g. LOCAL=8083)"; exit 1; }
	@test -n "$(HOST)"  || { echo "HOST is required (e.g. HOST=5003)"; exit 1; }
	$(SCAFFOLD) "$(NAME)" "$(LOCAL)" "$(HOST)"

# One command: scaffold repo files AND provision AWS/EC2.
new-project: scaffold
	$(TF) apply
