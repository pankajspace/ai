# Northwind Logistics — Shipment Exception Desk

An automated shipment exception triage system built with **LangChain**, **Python**, and a **custom HTML / CSS / JavaScript** interface served via **FastAPI**, containerized with **Docker**.

---

## Table of Contents
- [System Architecture](#system-architecture)
- [Prerequisites](#prerequisites)
- [Configuration](#configuration)
- [How to Run with Docker (Recommended)](#how-to-run-with-docker-recommended)
  - [1. Start the Web Application](#1-start-the-web-application)
  - [2. Run Automated Verification Tests](#2-run-automated-verification-tests)
  - [3. Run Component Unit Tests](#3-run-component-unit-tests)
  - [4. Run Terminal CLI Demo](#4-run-terminal-cli-demo)
  - [5. Stop the Application](#5-stop-the-application)
- [How to Run Locally (Without Docker)](#how-to-run-locally-without-docker)
- [Using the Web Application](#using-the-web-application)
- [REST API Endpoints](#rest-api-endpoints)
- [Project File Structure](#project-file-structure)

---

## System Architecture

```
                               ┌─────────────────────────┐
                               │ Incoming Exception Claim│
                               └────────────┬────────────┘
                                            │
                                            ▼
                                ┌──────────────────────┐
                                │ classify_chain (LLM) │
                                └───────────┬──────────┘
                                            │
               ┌────────────────────────────┼───────────────────────────┐
               ▼                            ▼                           ▼
        ┌─────────────┐              ┌──────────────┐            ┌─────────────┐
        │   delayed   │              │   damaged    │            │    lost     │
        └──────┬──────┘              └──────┬───────┘            └──────┬──────┘
               │                            │                           │
               ▼                            ▼                           ▼
      ┌─────────────────┐          ┌──────────────────┐        ┌────────────────┐
      │ calculate_delay │          │ calculate_damage │        │ calculate_lost │
      └────────┬────────┘          └────────┬─────────┘        └────────┬───────┘
               │                            │                           │
               └────────────────────────────┼───────────────────────────┘
                                            │
                                            ▼
                             ┌──────────────────────────────┐
                             │ Escalation Decision Policy   │
                             │ • unknown -> Auto-Escalate   │
                             │ • Standard Tier: > $100      │
                             │ • Premium Tier:  > $50       │
                             └──────────────┬───────────────┘
                                            │
                         ┌──────────────────┴──────────────────┐
                         │                                     │
                 [If Escalated]                        [If Auto-Resolved]
                         │                                     │
                         ▼                                     ▼
             ┌──────────────────────┐              ┌───────────────────────┐
             │ escalate_chain (LLM) │              │ draft_email_chain(LLM)│
             │ Manager Briefing     │              │ Customer Email        │
             └──────────┬───────────┘              └───────────┬───────────┘
                         │                                     │
                         └──────────────────┬──────────────────┘
                                            │
                                            ▼
                                ┌───────────────────────┐
                                │  session.py Ledger    │
                                │  Daily Aggregation    │
                                └───────────────────────┘
```

---

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Docker & Docker Compose)
- An OpenAI API Key with access to `gpt-4o-mini` (or equivalent model)

---

## Configuration

Create or verify the `.env` file in the root directory:

```bash
OPENAI_API_KEY=your_openai_api_key_here
```

*(Optional configuration keys)*:
```bash
OPENAI_MODEL=gpt-4o-mini
PORT=8080
```

---

## How to Run with Docker (Recommended)

Docker provides a reproducible environment with all Python and system dependencies pre-installed.

### 1. Start the Web Application

Build the Docker image and start the application container:

```bash
docker compose up --build
```

- To run in the background (detached mode):
  ```bash
  docker compose up -d --build
  ```

Once started, open your web browser and navigate to:
**[http://localhost:8080](http://localhost:8080)**

### 2. Run Automated Verification Tests

Run the official 4-scenario verification harness (`triage_check.py`), which validates all four core flows (mild delay, high-value loss, minor damage, and unclassifiable garbled report) as well as daily session aggregation:

```bash
docker compose run --rm app python src/triage_check.py
```

### 3. Run Component Unit Tests

Execute the unit tests for standalone compensation calculators, tier escalation thresholds, and session costliest-category calculation:

```bash
docker compose run --rm app python -m unittest tests/test_components.py
```

### 4. Run Terminal CLI Demo

Run the command-line interface directly in Docker:

- **Run default demo:**
  ```bash
  docker compose run --rm app python src/main.py --demo
  ```

- **Run a custom report:**
  ```bash
  docker compose run --rm app python src/main.py \
    --report "Pallet delivered to loading dock was missing 2 crates" \
    --value 350.00 \
    --tier standard
  ```

### 5. Stop the Application

To shut down the running containers:

```bash
docker compose down
```

---

## How to Run Locally (Without Docker)

If you prefer to run Python directly on your host machine:

1. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Start the Web UI server:**
   ```bash
   python app.py
   ```
   Open **[http://localhost:8080](http://localhost:8080)** in your browser.

3. **Run the verification checks:**
   ```bash
   python triage_check.py
   ```

4. **Run unit tests:**
   ```bash
   python -m unittest tests/test_components.py
   ```

5. **Run CLI runner:**
   ```bash
   python main.py --demo
   ```

---

## Using the Web Application

1. **Quick Presets**: Click any preset button (*Mild Delay*, *High Loss*, *Minor Damage*, *Garbled*, *Premium Damage*) to auto-populate the intake form with real-world scenarios.
2. **Submit Claim**: Adjust the report text, enter shipment value ($), select Standard or Premium tier, and click **🚀 Triage & Process Exception**.
3. **Review Audit Trail**:
   - View the **Status Banner** (Green `AUTO-RESOLVED` vs Red `ESCALATED TO OPERATIONS MANAGER`).
   - Inspect the **Pipeline Execution Steps** showing each decision point.
   - Review the generated **Customer Resolution Email** or **Manager Escalation Briefing**, and click **📋 Copy Draft** to copy it.
4. **Daily Triage Log**: View the live table of all exceptions processed in this session.
5. **Daily Aggregation Summary**: Click the **📊 Daily Aggregation Summary** tab to view real aggregation metrics:
   - Total exceptions processed
   - Total compensation paid ($)
   - Escalation rate (%)
   - **Costliest category** (aggregates total dollars paid so high-volume smaller payouts accurately outrank isolated claims)
   - Category payout breakdown table with percentage shares.

---

## REST API Endpoints

The FastAPI backend exposes the following REST endpoints:

| Endpoint | Method | Description |
|---|---|---|
| `/` | `GET` | Serves the HTML / CSS / JS frontend application |
| `/api/health` | `GET` | Health check endpoint (`{"status": "ok"}`) |
| `/api/triage` | `POST` | Processes an exception report through the LangChain pipeline |
| `/api/log` | `GET` | Returns all session records in the triage ledger |
| `/api/summary` | `GET` | Returns real aggregated KPI summary and category breakdown |
| `/api/reset` | `POST` | Clears the current in-memory session ledger |

---

## Project File Structure

```
exceptiondesk/
├── Dockerfile                  # Container definition (Python 3.11-slim)
├── docker-compose.yml          # Compose orchestration (ports, volume mounts, env)
├── .dockerignore               # Container build ignore rules
├── .gitignore                  # Git ignore rules for cache, .env, etc.
├── .env                        # Environment variables (OPENAI_API_KEY)
├── requirements.txt            # Root dependencies pointer
├── app.py                      # Root launcher for the web application
├── main.py                     # Root launcher for the CLI runner
├── triage_check.py             # Root launcher for the test harness
├── Problem_Statement_and_Milestones.md  # Requirements and specifications
├── README.md                   # System documentation and execution guide
├── tests/
│   └── test_components.py     # Unit tests for tools and aggregation
└── src/
    ├── __init__.py
    ├── llm.py                  # LangChain ChatOpenAI initialization
    ├── chains.py               # Prompt | Model | Parser LangChain chains
    ├── tools.py                # Compensation calculation logic (dict outputs)
    ├── pipeline.py             # Main triage pipeline (process_exception)
    ├── session.py              # In-memory ledger and real daily aggregation
    ├── app.py                  # FastAPI server and REST endpoints
    ├── main.py                 # CLI runner implementation
    ├── triage_check.py         # Verification test harness implementation
    ├── requirements.txt        # Python package requirements
    └── static/                 # Custom web frontend
        ├── index.html          # HTML dashboard interface
        ├── css/
        │   └── style.css       # Northwind theme styling
        └── js/
            └── app.js          # Asynchronous frontend application logic
```
