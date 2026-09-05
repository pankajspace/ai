# Shipment Exception Desk

An AI-assisted shipment exception triage system that classifies incoming claims,
calculates compensation, applies escalation policy, drafts communication, and
tracks session-level KPI summaries.

Core logic is migrated from the study implementation under
study/07-project-shipment-exception-desk/shipment-exception-desk and adapted to
the shared Flask plus Docker container architecture used by this repository.

## Features

1. Custom triage pipeline run from a structured input message.
2. Preset scenario runner for delay, loss, damage, unknown, and premium flows.
3. Session triage log snapshot with latest ledger entries.
4. Daily summary with total compensation, escalation rate, and costliest category.
5. Session reset endpoint for clean reruns.

## Project Details

1. Project type: Container app (Flask + Docker).
2. Project folder: projects/shipment-exception-desk/.
3. Local URL: http://localhost:8086
4. Production URL: https://app.techtoday.click/shipment-exception-desk/
5. Local port: 8086 maps to container 5000.
6. EC2 host port: 5006 maps to container 5000.
7. ECR repository: techtoday/shipment-exception-desk.
8. Production service name: shipment-exception-desk.
9. PATH_PREFIX: /shipment-exception-desk.
10. Workflow filename: deploy-shipment-exception-desk.yml.
11. Trigger path: projects/shipment-exception-desk/**.

### Routes

1. GET / serves the single-page UI.
2. POST /triage expects {"message": "report text || shipment value || tier"}.
3. POST /preset expects {"message": "delay|loss|damage|unknown|premium"}.
4. POST /log expects {"message": "any text"} and returns formatted ledger rows.
5. POST /summary expects {"message": "any text"} and returns markdown summary text.
6. POST /reset expects {"message": "any text"} and clears session records.

## Project Structure

projects/shipment-exception-desk/
|- Dockerfile
|- docker-compose.yml
|- requirements.txt
|- .env.example
|- deploy.yml.template
|- README.md
|- tests/
|  |- test_components.py
|- src/
   |- index.html
   |- css/style.css
   |- js/main.js
   |- python/
      |- app.py
      |- config.py
      |- llm.py
      |- chains.py
      |- tools.py
      |- pipeline.py
      |- session.py
      |- main.py
      |- triage_check.py

## Environment Variables

1. OPENAI_API_KEY (required): API key used by LangChain OpenAI chat model.
2. OPENAI_MODEL (optional): model name override, defaults to gpt-4o-mini.
3. .env is gitignored and must never be committed.

## Prerequisites and First Run

Complete one-time setup in projects/SETUP.md, then ensure Docker is running and
verify with docker info.

1. cd projects/shipment-exception-desk
2. cp .env.example .env
3. Edit .env and add OPENAI_API_KEY
4. docker compose build web
5. docker compose up web

Open http://localhost:8086.

## Daily Local Development

Source files under src/ are bind-mounted, so normal code edits do not need image
rebuilds. Rebuild after Dockerfile or requirements.txt changes.

1. docker compose build web
2. docker compose logs -f web
3. docker compose run --rm cli
4. docker compose run --rm triage-check
5. docker compose run --rm web python -m unittest tests/test_components.py
6. docker compose ps
7. docker compose down

## Production Setup

The deploy workflow provisions and updates this project automatically: ECR repo,
seed image, EC2 env file at ~/secrets/shipment-exception-desk.env, Nginx path
location file, and project compose service.

Only one manual action can remain: if OPENAI_API_KEY is not already present in
techtoday/secrets, add it before first deploy as IAM user techtoday.

1. CURRENT=$(aws secretsmanager get-secret-value --secret-id techtoday/secrets --query SecretString --output text)
2. UPDATED=$(echo "$CURRENT" | python3 -c "import sys,json; d=json.load(sys.stdin); d['OPENAI_API_KEY']='your-key'; print(json.dumps(d))")
3. aws secretsmanager put-secret-value --secret-id techtoday/secrets --secret-string "$UPDATED"

## Commit and Automatic Deployment

1. git checkout main
2. git add projects/shipment-exception-desk .github/workflows/deploy-shipment-exception-desk.yml
3. git commit -m "Add shipment-exception-desk project"
4. git push origin main

The push under projects/shipment-exception-desk/** triggers workflow
deploy-shipment-exception-desk.yml.

## Production Verification and Troubleshooting

1. curl -I https://app.techtoday.click/shipment-exception-desk/
2. On EC2: docker compose -f ~/apps/shipment-exception-desk/docker-compose.yml ps
3. On EC2: docker compose -f ~/apps/shipment-exception-desk/docker-compose.yml logs --tail 100
4. On EC2: docker compose -f ~/apps/shipment-exception-desk/docker-compose.yml restart

## Rollback

1. aws ecr describe-images --repository-name techtoday/shipment-exception-desk --region us-east-1 --query 'imageDetails[*].imageTags' --output table
2. On EC2, set the desired image tag in ~/apps/shipment-exception-desk/docker-compose.yml.
3. On EC2: docker compose -f ~/apps/shipment-exception-desk/docker-compose.yml pull
4. On EC2: docker compose -f ~/apps/shipment-exception-desk/docker-compose.yml up -d
5. Verify: curl -I https://app.techtoday.click/shipment-exception-desk/

## Manual Deployment

1. cd projects/shipment-exception-desk
2. docker build --platform linux/amd64 -t shipment-exception-desk .
3. ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
4. REGION=us-east-1
5. ECR=$ACCOUNT.dkr.ecr.$REGION.amazonaws.com
6. aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $ECR
7. docker tag shipment-exception-desk $ECR/techtoday/shipment-exception-desk:latest
8. docker push $ECR/techtoday/shipment-exception-desk:latest
9. On EC2: docker compose -f ~/apps/shipment-exception-desk/docker-compose.yml pull
10. On EC2: docker compose -f ~/apps/shipment-exception-desk/docker-compose.yml up -d
11. Optional disk cleanup: docker image prune -af

## Deployment Status

Deployment automation is ready once .github/workflows/deploy-shipment-exception-desk.yml
exists and contains no template placeholder strings.
