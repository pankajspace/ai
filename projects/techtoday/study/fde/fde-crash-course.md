<!--
Source: fde-crash-course.html
Title: Forward Deployed Engineer Crash Course | TechToday
Description: A visual crash course in forward deployed engineering — the engagement loop, discovery, ontologies, grounding, evals, the integration wall, handover and the decomposition interview.
Theme-color: #0b0d10
Stylesheets: fde-study.css, ../../site-header.css
Scripts: fde-study.js
-->

Navigation: [TechToday](../../index.html) · [← FDE Courses](fde-courses.html)

<a id="fde-crash-course"></a>

# Forward Deployed Engineer

A forward deployed engineer is a software engineer who goes and sits with the customer until the thing actually works. This page teaches the job the way it is done: the engagement loop, the discovery work that decides everything, the build, the wall between a prototype and production, and the interview that gets you hired. Press **Play** on any animation to watch the idea move.

> **Key idea**
>
> One sentence holds the whole role together: **the model is the easy part.** Frontier models are commodities available to every competitor at the same price. What is scarce is the engineer who can get one wired into a forty-year-old claims system, prove it is right, pass a security review, and leave behind something the customer's own team can change. That gap — between what a platform *can* do and what a customer actually needs — is the entire job.

<a id="table-of-contents"></a>

## Table of Contents

1. [Why This Role Exists](#0-why-this-role-exists)
2. [What an FDE Actually Is](#1-what-an-fde-actually-is)
3. [The Engagement Loop](#2-the-engagement-loop)
4. [Discovery — Finding the Real Problem](#3-discovery)
5. [Ship on Day One](#4-ship-on-day-one)
6. [The Ontology](#5-the-ontology)
7. [Grounding in the Customer's Data](#6-grounding)
8. [Agents & Tool Calls](#7-agents-and-tools)
9. [Evals — Proving It Works](#8-evals)
10. [The Integration Wall](#9-the-integration-wall)
11. [Observability & Cost](#10-observability)
12. [Handover Without Rot](#11-handover)
13. [The Decomposition Interview](#12-the-decomposition-interview)
14. [The Whole Role on One Page](#13-the-whole-role-on-one-page)

<a id="0-why-this-role-exists"></a>

## Why This Role Exists

- **Enterprise AI pilots with no measurable impact** `~95%`
- **Of the work that is not the model** `~80%`
- **Growth in FDE job postings, 2025** `~800%`

Before any of the craft makes sense you need one idea, and it is the same idea Big-O is to algorithms: **deployment is the product.** A model that answers correctly in a notebook has produced nothing. Value appears only when the answer arrives inside a workflow a real person already uses, from data they already trust, fast enough that they do not open the old system instead.

MIT's 2025 study of enterprise generative-AI programmes found roughly **95% produced no measurable impact on profit and loss**. That number is easy to misread as "the models are not good enough". Watch what actually kills them.

> **Interactive animation:** `pilot-gap` — rendered by the page script in the HTML version.

> **Analogy** 🍽️
>
> **Picture it — a restaurant with a brilliant kitchen and no waiters**
>
> The chef is world class. The food is extraordinary. But nobody takes orders, nobody knows about the nut allergy on table six, and nothing leaves the pass. Diners leave hungry and conclude the restaurant is bad. The kitchen was never the constraint. Palantir's founders described the forward deployed role in exactly these terms — front-of-house staff so integrated with the kitchen that they are empowered to tell a customer they are ordering the wrong thing.

There is a structural reason the gap does not close on its own. The knowledge needed to ship enterprise AI is split across a contract, and neither side has the other half.

- **The vendor knows** how the model behaves at scale, which prompting patterns hold up, how retrieval fails, what an eval suite has to catch, and which failure modes only appear at volume.
- **The customer knows** the domain, the data schemas, which table is actually trusted, the compliance boundary, and the twelve edge cases that generate most of the exceptions.
- **Nobody bridges it** — a customer success manager cannot write the integration, a consultant does not ship production code, and documentation has never once closed a knowledge gap this wide.

> **Key idea**
>
> The FDE is the person who holds both halves at once. That is the whole design of the role, and every practice in this course follows from it.

---

<a id="1-what-an-fde-actually-is"></a>

## What an FDE Actually Is

- **Invented** `Palantir, ~2005`
- **Internal name** `"Delta"`
- **Typical travel** `25–50%`

*Forward deployed* is a military term: stationed at the front, not at headquarters. The engineering version means you work inside the customer's environment — on their site, on their Slack, in their cloud account, against their real data — and you write **production code** there, not recommendations about it.

The role was created at Palantir around 2005, selling Gotham into US intelligence agencies. The customers could not describe what they needed, could not share their data, and changed their workflows constantly. Two existing roles both failed: a consultant could not write production code, and a solutions engineer could not reshape the product. So Palantir invented a third — internally the "Delta" track — and by 2016 had **more forward deployed engineers than product engineers**, which for a software company is an extraordinary ratio.

> **Analogy** 🚒
>
> **Picture it — the fire engine, not the fire safety report**
>
> A consultant inspects the building and hands you a report recommending sprinklers. A solutions engineer demonstrates their sprinkler product and configures the standard package. The forward deployed engineer installs sprinklers in *your* building, discovers the pipework is non-standard, re-plumbs it, stays for the first fire, and then teaches your maintenance team to run the system.

Three properties separate the role from everything adjacent to it:

1. **They write production code.** Not slides, not architecture diagrams — pipelines, services, integrations that people depend on the next morning.
2. **They own the outcome, not the demo.** A sales engineer wins the deal. An FDE makes sure the deal still works in month nine, and gets paged when it does not.
3. **They translate between worlds.** The same person writes a Terraform module for an SRE on Tuesday and a one-page memo for a CFO on Wednesday, and both have to be good.

<a id="1-1-the-neighbouring-roles"></a>

### Against the neighbouring roles

| Role | Deliverable | Writes new production code? | Still there in month nine? |
| --- | --- | --- | --- |
| **Forward deployed engineer** | A running system in the customer's environment | Yes, that is the job | Yes — same person scopes it and maintains it |
| Management consultant | Report, recommendation, roadmap | No | No — engagement ends at delivery |
| Solutions / sales engineer | Demo, PoC, technical win | Rarely — configures what exists | No — hands off before production |
| Product engineer | Platform features for every customer | Yes | Yes, but one-to-many and never embedded |
| ML engineer | Models, training and serving pipelines | Yes | Platform-side, not customer-embedded |

> **Warning**
>
> **The distinction people get wrong.** "Customer-facing engineer" is not the definition — plenty of roles talk to customers. The definition is **end-to-end accountability for a system running in someone else's environment**. If you hand off before production, you are doing pre-sales. If you never write the code, you are consulting. The FDE does both halves and stays.

**Screening question**

*"Why do you want to be an FDE rather than a product engineer?"*

The answer that fails is "I like talking to people". The answer that works names the trade honestly: you are giving up depth in one codebase and an uninterrupted calendar, and buying a shorter feedback loop between a decision and its consequence. Say what you are giving up — interviewers are screening for someone who has understood the cost, because the people who have not are the ones who leave after eight months.

**The shape of the trade**

```text
PRODUCT ENGINEER                     FORWARD DEPLOYED ENGINEER
------------------------------       ------------------------------
one codebase, years                  five codebases, months each
requirements arrive filtered         you are the filter
success = feature shipped            success = workflow changed
failure found in a bug tracker       failure found by a person in the room
deep expertise, narrow               broad execution, deliberately shallow
calendar mostly yours                calendar mostly theirs
```

<a id="2-the-engagement-loop"></a>

## The Engagement Loop

- **Discover** `weeks 1–3`
- **Prototype** `weeks 2–8`
- **Harden** `months 3–6`
- **Hand off** `month 6+`

Every engagement, in every company running this model, is the same four stages with a fifth arrow that loops back to the platform team. The durations shift — a ten-day proof of concept at one end, a multi-year defence programme at the other — but the sequence does not.

> **Interactive animation:** `engagement-loop` — rendered by the page script in the HTML version.

- **Strength — compressed feedback** — The distance between "we built the wrong thing" and "we know we built the wrong thing" is a day, because the person who would tell you is sitting across the table.
- **Weakness — it does not parallelise** — One engineer, one account, one quarter. Scaling means more people, not more leverage — unless the fifth arrow works.

> **Tip**
>
> Match the cadence to the customer's reality, not to your roadmap. A hospital's clinical governance committee meets monthly; a trading desk wants it before the quarter closes. The stages are fixed, the clock is theirs.

<a id="3-discovery"></a>

## Discovery — Finding the Real Problem

- **Customer conversations per week** `5–15`
- **Share of an AI FDE's week** `30–40%`
- **Deliverable** `a testable hypothesis`

Discovery is the highest-leverage engineering work in the entire engagement, and it involves no code. You cannot eval, orchestrate, deploy or observe your way out of having built the wrong thing. Everything downstream is a multiplier on a decision made in week one.

The work is specific: sit with the people who do the job, watch them do it, and map the distance between the process on the wiki and the process in the room.

> **Interactive animation:** `discovery-gap` — rendered by the page script in the HTML version.

> **Key idea**
>
> "The model is usually the cleanest part. The hard part is finding the workflow nobody documented, the data source people actually trust, and the person who knows why the process works that way."

<a id="3-1-questions-that-work"></a>

### Questions that work

Bad discovery asks people to design software. Good discovery asks them to narrate history, because memory of last Tuesday is reliable and speculation about a hypothetical tool is not.

1. **"Walk me through the last one you did."** Not the typical one — the last one. Typical cases are reconstructions; the last one has the mess still attached.
2. **"What did you do just before that step, and just after?"** This is where the spreadsheet, the phone call and the second login appear.
3. **"When was the last time this went wrong, and what happened?"** Exceptions are where the cost is, and they are never in the process diagram.
4. **"Which number here do you actually trust?"** There are always two systems that disagree, and everybody knows which one is right without it being written down.
5. **"What would you stop doing if you could?"** The answer is rarely what the sponsor named in the kickoff.

> **Warning**
>
> **The sponsor is not the user.** The executive who signed the contract describes the problem they can see from their seat, which is usually a reporting problem. The operator four levels down has a workflow problem. Build for the sponsor and you get a dashboard nobody opens; build for the operator and let the sponsor watch the metric move.

**Field practice**

*How do you turn three days of conversations into something you can build against?*

Write the hypothesis down in a form that can be proved wrong by Friday. If it cannot be falsified with a week of code, it is not a hypothesis — it is a wish. Keep it to one page and get the operator, not the sponsor, to disagree with it.

**The one-page scoping doc**

```text
WHO          Claims handlers, Tier 2, Leeds office. 40 people.
TODAY        90 min median per exception claim. 1 in 3 reworked.
             38 min of the 90 is waiting on a phone call to Ops.
BELIEF       If the staffing check were automatic and surfaced at
             intake, median drops below 60 min and rework halves.
TEST         Week 1: read-only view joining claims + the Ops roster,
             shown to 4 handlers on live data. If they say "I still
             have to phone", the belief is wrong and we stop.
MEASURE      Median minutes to resolution; reopen rate within 14 days.
             Baseline pulled from 6 months of history BEFORE we build.
NOT DOING    Auto-approval. Anything touching payment. The mobile app.
```

> **Tip**
>
> **Pull the baseline before you build anything.** If you cannot state today's number, you will never be able to prove you improved it — and in month six, "it feels better" loses to a budget review every time.

<a id="4-ship-on-day-one"></a>

## Ship on Day One

- **First working artefact** `day 1`
- **First grounded answer** `day 3`
- **First eval set** `day 4`

"Ship on day one" is the phrase the discipline is built on, and it is not bravado. It is a claim about where risk lives: the expensive unknowns in an enterprise deployment are *access* and *fit*, and both are only discoverable by trying. A week spent writing a requirements document discovers neither.

> **Interactive animation:** `ship-day-one` — rendered by the page script in the HTML version.

> **Analogy** 🧗
>
> **Picture it — clipping the first bolt**
>
> A climber does not plan the whole route from the ground. They get the first piece of protection in early, because until they have, a fall costs everything. Day-one shipping is the first bolt: it proves you can reach their data, it gives the sponsor something to show, and it turns the relationship from a promise into a track record.

- **Strength — it finds the blockers while they are cheap** — You learn in week one that the table you need is owned by a team in another country, instead of in week nine.
- **Weakness — it invites shoddiness** — Shipping fast is not the same as shipping flimsy. Narrow and solid beats broad and broken; a demo that falls over in front of an operator costs more trust than a week of silence.

**The day-one artefact**

*What does "something working" actually look like on the first afternoon?*

A read-only connector and a list. No model, no inference, no cleverness. It is worth more than a diagram because it answers the only question that matters at that point — can we reach your data at all, with credentials that exist, through a network path that is open?

**Day one — prove you can reach the data**

```python
import os, sqlalchemy as sa
from fastapi import FastAPI, Query

# Read-only credentials, in their VPC, against a replica.
# Never ask for write access on day one - it triples the approval chain.
engine = sa.create_engine(os.environ["CLAIMS_RO_DSN"], pool_pre_ping=True)
app = FastAPI()

@app.get("/exceptions")
def exceptions(site: str | None = Query(None), limit: int = 50):
    sql = sa.text("""
        SELECT claim_id, opened_at, site_code, status, amount
        FROM   claims_exceptions
        WHERE  (:site IS NULL OR site_code = :site)
        ORDER  BY opened_at DESC
        LIMIT  :limit
    """)
    with engine.connect() as cx:
        rows = cx.execute(sql, {"site": site, "limit": limit}).mappings().all()
    return {"count": len(rows), "rows": [dict(r) for r in rows]}

# Day one is done when a handler opens this, filters to their site,
# and says "that one's wrong". That sentence is worth a month of specs.
```

```javascript
import express from "express";
import pg from "pg";

// Read-only pool, inside their network, pointed at a replica.
const pool = new pg.Pool({ connectionString: process.env.CLAIMS_RO_DSN });
const app = express();

app.get("/exceptions", async (req, res) => {
  const { site = null, limit = 50 } = req.query;
  const { rows } = await pool.query(
    `SELECT claim_id, opened_at, site_code, status, amount
       FROM claims_exceptions
      WHERE ($1::text IS NULL OR site_code = $1)
      ORDER BY opened_at DESC
      LIMIT $2`,
    [site, Number(limit)]
  );
  res.json({ count: rows.length, rows });
});

// The goal is not the endpoint. The goal is the conversation it starts.
app.listen(8080);
```

> **Warning**
>
> **Ask for read-only first, always.** Write access multiplies the number of people who must approve you, and you do not need it to prove anything in week one. Earn it in week four with a track record behind you.

---

<a id="5-the-ontology"></a>

## The Ontology

- **Built by** `day 2`
- **Entities to start** `3–6`
- **Owner after handover** `the customer`

An ontology is a plain name for something unglamorous: **a typed model of the customer's nouns and the verbs between them**, sitting on top of source systems that were named by people who have since left. `Order`, `Customer`, `Shipment`, and the fact that an order is `placed_by` a customer.

Palantir productised this in Foundry and every serious AI deployment has rediscovered it since, because a generic model has no idea what your company means by "active account". The domain knowledge has to live somewhere, and a prompt is the worst available place for it.

> **Interactive animation:** `ontology-build` — rendered by the page script in the HTML version.

> **Analogy** 🗺️
>
> **Picture it — a street map versus satellite photos**
>
> Satellite photos contain every fact but no structure; to find a route you must interpret pixels every time. A street map has already decided what counts as a road, a junction and a one-way system. Raw tables are the photographs. The ontology is the map — and a map is what you can hand to somebody else.

- **Strength — it is the thing that survives you** — Models change quarterly, prompts change weekly. A good domain model outlives both and is the artefact the customer's team can extend.
- **Strength — it is your permissions and audit boundary** — Access control and logging attach to entities and actions, not to strings in a prompt.
- **Weakness — it tempts you into a data-modelling project** — Six weeks of ontology and no working workflow is a failure. Three entities that support one real decision beats forty that support none.

**Field practice**

*How do you express an ontology in ordinary code, without a platform?*

Typed entities, explicit links, and functions over them. The point is not the framework — it is that there is exactly one definition of "overdue shipment" in the codebase, and both the UI and the model call the same one. The moment that definition exists twice, they diverge and an operator loses trust.

**Ontology — entities, links and actions**

```python
from dataclasses import dataclass
from datetime import datetime, timedelta

@dataclass(frozen=True)
class Shipment:
    id: str
    order_id: str          # link: fulfils -> Order
    carrier: str
    promised_at: datetime
    last_scan_at: datetime | None
    site_code: str

    # ONE definition of "late", used by the UI, the alerts and the model.
    @property
    def is_overdue(self) -> bool:
        return datetime.utcnow() > self.promised_at

    @property
    def is_dark(self) -> bool:
        """No carrier scan for 8h - the field name operators actually use."""
        if self.last_scan_at is None:
            return True
        return datetime.utcnow() - self.last_scan_at > timedelta(hours=8)

def find_shipments(site: str, overdue_only: bool = True) -> list[Shipment]:
    """An ACTION. This - not the table - is what the model may call."""
    rows = repo.query_shipments(site_code=site)
    return [s for s in rows if s.is_overdue] if overdue_only else rows
```

```javascript
const EIGHT_HOURS = 8 * 60 * 60 * 1000;

export class Shipment {
  constructor(row) { Object.assign(this, row); }

  // ONE definition of "late", shared by the UI, the alerts and the model.
  get isOverdue() { return Date.now() > this.promisedAt.getTime(); }

  // "Dark" is the word the operators use. Use their word, not yours.
  get isDark() {
    if (!this.lastScanAt) return true;
    return Date.now() - this.lastScanAt.getTime() > EIGHT_HOURS;
  }
}

// An ACTION. The model never sees SHIP_EVT; it sees this.
export async function findShipments(site, { overdueOnly = true } = {}) {
  const rows = await repo.queryShipments({ siteCode: site });
  const all = rows.map((r) => new Shipment(r));
  return overdueOnly ? all.filter((s) => s.isOverdue) : all;
}
```

> **Tip**
>
> **Use their words.** If dispatchers say "dark" for a vehicle with no recent ping, the field is called `is_dark`. Naming entities after the business's own vocabulary is the cheapest adoption win available, and renaming them later is surprisingly expensive.

<a id="6-grounding"></a>

## Grounding in the Customer's Data

- **Two pipelines** `ingest + serve`
- **Retrieve then pass** `20 → 5`
- **Permission check** `at retrieval`

Grounding is how a general model answers a question about a company it was never trained on: find the relevant passages from the customer's own corpus, put them in the prompt, and require the answer to come from them. Everyone calls this RAG. Almost everyone builds the happy path and stops.

> **Interactive animation:** `grounding-pipeline` — rendered by the page script in the HTML version.

> **Analogy** ⚖️
>
> **Picture it — a barrister and a junior**
>
> The barrister knows the law in general but nothing about this client. The junior pulls the relevant files and marks the paragraphs that matter. The barrister argues only from those pages, and cites them. If the junior pulls the wrong file, the barrister will argue the wrong case fluently and confidently — which is exactly what a badly retrieved passage does to a model.

- **Strength — no training required** — New documents are searchable the moment they are indexed, and you can cite sources, which is what makes the answer auditable.
- **Weakness — retrieval failures are invisible** — The model does not say "I found nothing useful". It answers anyway, from whatever it was given, in the same confident tone.

> **Warning**
>
> **The leak that ends deployments.** If the index does not carry permissions, retrieval will happily surface a passage from a document the asking user cannot open. You have then built a system that launders access control. Filter by the *user's* entitlements at query time, inside the search, not by asking the model to be discreet.

**Field practice**

*What does a defensible retrieval step look like?*

Permission filter inside the query, hybrid search so exact identifiers still work, rerank before you spend context on it, and citations on the way out. Four things, none of them clever, all of them missing from most first drafts.

**Retrieval with entitlements and reranking**

```python
def retrieve(question: str, user: User, k: int = 5) -> list[Chunk]:
    qv = embed(question)                       # SAME model used at ingest

    # 1. Permission filter is part of the query, not a post-filter.
    #    A post-filter can return zero rows and look like "no answer".
    candidates = index.search(
        vector=qv,
        text=question,                         # 2. hybrid: part numbers matter
        top_k=20,
        filter={"acl_groups": {"$in": user.groups}},
    )

    # 3. Rerank 20 -> 5. Usually worth more than upgrading the base model.
    ranked = reranker.rank(question, candidates)[:k]

    # 4. Keep provenance so the answer can be checked by a human.
    return [c.with_citation(c.doc_id, c.heading_path, c.page) for c in ranked]

SYSTEM = (
    "Answer ONLY from the passages provided. Cite the passage id after each "
    "claim. If the passages do not contain the answer, reply exactly: "
    "'Not covered by the documents I can see.'"
)
```

```javascript
export async function retrieve(question, user, k = 5) {
  const qv = await embed(question);            // SAME model used at ingest

  // 1. Entitlements go INSIDE the query. Post-filtering silently
  //    turns "you may not see this" into "there is no answer".
  const candidates = await index.search({
    vector: qv,
    text: question,                            // 2. hybrid: IDs and codes
    topK: 20,
    filter: { acl_groups: { $in: user.groups } },
  });

  // 3. Rerank 20 -> 5 before spending context on them.
  const ranked = (await reranker.rank(question, candidates)).slice(0, k);

  // 4. Provenance travels with the chunk, all the way to the UI.
  return ranked.map((c) => c.withCitation(c.docId, c.headingPath, c.page));
}

export const SYSTEM =
  "Answer ONLY from the passages provided. Cite the passage id after each " +
  "claim. If the passages do not contain the answer, reply exactly: " +
  "'Not covered by the documents I can see.'";
```

> **Tip**
>
> Before tuning anything, measure **retrieval** separately from **generation**. Ask: was the right passage in the top five? If it was not, no prompt change will save you, and you have just spent a week on the wrong half of the system.

<a id="7-agents-and-tools"></a>

## Agents & Tool Calls

- **Turn cap** `6–10`
- **Policy lives in** `code, not the prompt`
- **Autonomy** `a dial the customer sets`

An agent is a loop: the model proposes a tool call, you execute it, you feed the result back, repeat until it produces an answer or you stop it. The loop is trivial. Everything that matters is in the boundary around it — which tools exist, what they are allowed to do, and who approves the ones that cost money.

> **Interactive animation:** `agent-loop` — rendered by the page script in the HTML version.

> **Analogy** 🎓
>
> **Picture it — a capable intern on their first week**
>
> Bright, fast, and genuinely useful. You would not give them the company card and root access on day one. You give them four specific things they may do, a spending limit enforced by the card itself rather than by a memo, and a rule that anything above a threshold gets a signature. The constraints are not distrust — they are what makes the delegation safe enough to be worth doing.

- **Strength — it handles the branching real work has** — Fixed pipelines break on the exception cases; a loop can look something up and change its plan.
- **Weakness — every turn is a chance to diverge** — Cost, latency and failure modes all compound with turn count, and an unbounded loop is a way to spend a lot of money slowly.

> **Warning**
>
> **A prompt is not a control.** "Never spend more than £2,000" in a system prompt is a strong suggestion that fails under an unusual input or a prompt injection in a retrieved document. The cap belongs in the tool, where it is deterministic, testable and visible to an auditor.

**Field practice**

*Write the loop the way it survives a security review.*

Bounded turns, a whitelist of tools, validation before execution, and structured refusals fed back as observations so the model can replan rather than retry blindly. Note how little of this is about the model.

**Agent loop with enforced guardrails**

```python
MAX_TURNS = 8
COST_CAP_GBP = 2000

def run_agent(goal: str, ctx: Context) -> Result:
    messages = [{"role": "system", "content": SYSTEM},
                {"role": "user", "content": goal}]

    for turn in range(MAX_TURNS):
        reply = model.chat(messages, tools=TOOL_SCHEMAS)   # only these tools
        if not reply.tool_calls:
            return Result(answer=reply.content, turns=turn)

        for call in reply.tool_calls:
            verdict = guardrails.check(call, ctx, cap=COST_CAP_GBP)
            if not verdict.allowed:
                # Feed the REASON back. Told why, a model replans;
                # told only "denied", it retries the same thing.
                messages.append(tool_result(call, {
                    "error": "blocked_by_policy",
                    "reason": verdict.reason,
                }))
                continue

            if verdict.needs_human:
                return Result(pending=approval.request(call, ctx))

            messages.append(tool_result(call, TOOLS[call.name](**call.args)))

    raise TurnLimitExceeded(goal)   # bounded loops fail loudly, not silently
```

```javascript
const MAX_TURNS = 8;
const COST_CAP_GBP = 2000;

export async function runAgent(goal, ctx) {
  const messages = [
    { role: "system", content: SYSTEM },
    { role: "user", content: goal },
  ];

  for (let turn = 0; turn < MAX_TURNS; turn++) {
    const reply = await model.chat(messages, { tools: TOOL_SCHEMAS });
    if (!reply.toolCalls?.length) return { answer: reply.content, turns: turn };

    for (const call of reply.toolCalls) {
      const verdict = guardrails.check(call, ctx, { cap: COST_CAP_GBP });

      if (!verdict.allowed) {
        // The reason is the useful part - it lets the model replan.
        messages.push(toolResult(call, {
          error: "blocked_by_policy",
          reason: verdict.reason,
        }));
        continue;
      }
      if (verdict.needsHuman) return { pending: await approval.request(call, ctx) };

      messages.push(toolResult(call, await TOOLS[call.name](call.args)));
    }
  }
  throw new TurnLimitExceeded(goal);   // never loop forever on someone's bill
}
```

> **Tip**
>
> Start every agent at **propose-only**. It drafts the action, a human clicks approve, and you log both. After a few hundred approvals you have real evidence for where the threshold should sit — and the customer is the one who moves the dial, not you.

<a id="8-evals"></a>

## Evals — Proving It Works

- **Where cases come from** `real field failures`
- **Compare** `per case, not aggregate`
- **Gate** `CI, before merge`

Evaluation engineering is the single most-cited differentiator in forward deployed hiring, for one blunt reason: without it, nobody can tell whether this week's change made the system better or worse, so eventually nobody changes anything and the deployment freezes. An eval suite is what converts an argument about vibes into a number.

> **Interactive animation:** `eval-harness` — rendered by the page script in the HTML version.

> **Analogy** 🧪
>
> **Picture it — a blood test, not a vibe**
>
> "The patient seems better" is not a clinical finding. A panel of specific measurements, taken the same way each time, is. Evals are the blood panel for a probabilistic system: the same inputs, the same graders, every release, so that "better" is a claim you can defend rather than a feeling you have.

The set is not invented at a desk. Every case comes from a real one an operator walked you through, with the answer *they* said was right. When something fails in the field it becomes a case permanently — that is how the suite earns its keep.

- **Strength — it makes change safe** — With a suite you can swap models, rewrite prompts and refactor retrieval, because you will know within minutes what you broke.
- **Weakness — aggregate scores lie** — 5/6 to 5/6 can hide a fix and a new break. Always diff per case; a red-to-green-to-red cell is a release blocker.

**Field practice**

*What is the smallest eval harness worth having?*

A file of cases, a grader chosen per case type, and a CI job that fails the build on any regression. That is it. A spreadsheet is genuinely fine for the first ten cases; by fifty you want this.

**A minimal eval harness with CI gating**

```python
import json, sys

GRADERS = {
    "exact":  lambda got, want: got.strip() == want.strip(),
    "field":  lambda got, want: json.loads(got)["decision"] == want,
    "rubric": lambda got, want: judge(got, rubric=want).score >= 4,  # last resort
}

def run(cases_path: str, baseline_path: str) -> int:
    cases = [json.loads(l) for l in open(cases_path)]
    baseline = json.load(open(baseline_path))
    results, regressions = {}, []

    for c in cases:
        got = system.answer(c["input"], user=c["as_user"])
        ok = GRADERS[c["grader"]](got, c["expected"])
        results[c["id"]] = ok
        # A pass that becomes a fail blocks the merge. New failures do not
        # block - they are cases you had not solved yet and are honest about.
        if baseline.get(c["id"]) and not ok:
            regressions.append(c["id"])

    print(f"{sum(results.values())}/{len(cases)} pass")
    if regressions:
        print("REGRESSIONS:", ", ".join(regressions))
        return 1        # non-zero exit fails the pipeline
    return 0

if __name__ == "__main__":
    sys.exit(run("evals/cases.jsonl", "evals/baseline.json"))
```

```javascript
const GRADERS = {
  exact: (got, want) => got.trim() === want.trim(),
  field: (got, want) => JSON.parse(got).decision === want,
  rubric: async (got, want) => (await judge(got, want)).score >= 4, // last resort
};

export async function run(cases, baseline) {
  const results = {};
  const regressions = [];

  for (const c of cases) {
    const got = await system.answer(c.input, { user: c.asUser });
    const ok = await GRADERS[c.grader](got, c.expected);
    results[c.id] = ok;
    // Pass -> fail blocks the merge. Still-failing cases do not:
    // they are known gaps, tracked honestly rather than hidden.
    if (baseline[c.id] && !ok) regressions.push(c.id);
  }

  const passed = Object.values(results).filter(Boolean).length;
  console.log(`${passed}/${cases.length} pass`);
  if (regressions.length) {
    console.error("REGRESSIONS:", regressions.join(", "));
    process.exitCode = 1;    // fail the pipeline, not the customer
  }
}
```

> **Key idea**
>
> Hand the eval suite over with the system. A customer who inherits the code but not the tests can keep it running and can never safely change it — which means it freezes on the day you leave and rots from there.

---

<a id="9-the-integration-wall"></a>

## The Integration Wall

- **Gates between demo and prod** `5`
- **Run them** `in parallel, from week 2`
- **Cleared by** `people and documents, not code`

This is where forward deployed engineers earn their compensation, and it is the part no tutorial covers. Between a working prototype and a system real people use sits a series of organisational gates — each one a queue, each one owned by somebody who does not report to your sponsor.

> **Interactive animation:** `integration-wall` — rendered by the page script in the HTML version.

> **Analogy** 🛂
>
> **Picture it — customs, not the flight**
>
> The flight is the easy part and it is the part you planned for. Then comes passport control, baggage, the declaration form and the queue for the taxi. None of it is technically difficult; all of it is sequential, owned by different people, and impossible to hurry from inside the queue. The only winning move is to start every queue at once.

The topology you deploy into is the decision the gates force, so make it early and deliberately rather than discovering it during a security review. Switch between the three shapes below:

> **Interactive animation:** `deploy-topology` — rendered by the page script in the HTML version.

- **Do — get the constraints in writing in week one** — Where may data be processed? How long are prompts retained? Is the model provider an approved sub-processor? Three questions that each can invalidate an architecture.
- **Do not — treat the security team as an obstacle** — They are the only people who can actually approve you. Bring them a threat model in week two and they become your fastest route, rather than your last one.

> **Warning**
>
> **Every dependency is a question you will answer on a Thursday.** This is why experienced FDEs are conservative about frameworks — a first-party SDK and some code you wrote is easier to defend, debug in someone else's estate, and hand over than a stack of abstractions. Prototype with the framework, unwind it before production.

<a id="10-observability"></a>

## Observability & Cost

- **Per request** `trace + cost + outcome`
- **Traces live** `wherever the data lives`
- **Report** `cost per resolved case`

In a deterministic system, failure is loud: a stack trace, a 500, a page. A probabilistic system fails *quietly* — it keeps answering, in the same confident tone, slightly worse each week, until users stop trusting it and drift back to the old process. You cannot see that from an uptime dashboard.

So you instrument differently. Every request emits the full prompt, the retrieved chunks, every tool call, latency per span, tokens, cost, and — the part teams skip — **what happened to the answer**. Accepted? Edited? Ignored? That last field is the only real quality signal you have.

> **Interactive animation:** `trace-waterfall` — rendered by the page script in the HTML version.

> **Warning**
>
> **A trace contains the full prompt, and the full prompt contains the record.** Traces are personal data. If the customer's data may not leave their region, neither may your observability backend — this catches more teams than any other single rule.

**Field practice**

*What do you actually log per request?*

One structured event per request, with a correlation id that reaches the UI so a user can report "this answer was wrong" and you can find the exact run. Cost goes on the same record, tagged by team, so the month-end conversation is about unit economics rather than a single large bill.

**One trace record per request**

```python
import time, uuid

def answer_with_trace(question: str, user: User) -> Answer:
    span = {"run_id": str(uuid.uuid4()), "user_team": user.team, "t0": time.time()}

    chunks = retrieve(question, user)
    span["retrieved"] = [c.doc_id for c in chunks]     # WHAT was grounded on
    span["retrieval_ms"] = int((time.time() - span["t0"]) * 1000)

    out = model.generate(prompt(question, chunks))
    span |= {
        "model": out.model,
        "prompt_tokens": out.usage.prompt,
        "completion_tokens": out.usage.completion,
        "cost_gbp": price(out.model, out.usage),        # unit economics
        "total_ms": int((time.time() - span["t0"]) * 1000),
    }
    traces.emit(span)                                   # stays in-region

    # run_id goes to the UI so "this was wrong" maps to one exact run,
    # and the feedback later becomes an eval case.
    return Answer(text=out.text, citations=chunks, run_id=span["run_id"])
```

```javascript
import { randomUUID } from "node:crypto";

export async function answerWithTrace(question, user) {
  const t0 = Date.now();
  const span = { runId: randomUUID(), userTeam: user.team };

  const chunks = await retrieve(question, user);
  span.retrieved = chunks.map((c) => c.docId);        // WHAT was grounded on
  span.retrievalMs = Date.now() - t0;

  const out = await model.generate(prompt(question, chunks));
  Object.assign(span, {
    model: out.model,
    promptTokens: out.usage.prompt,
    completionTokens: out.usage.completion,
    costGbp: price(out.model, out.usage),             // unit economics
    totalMs: Date.now() - t0,
  });
  traces.emit(span);                                   // stays in-region

  // The runId reaches the UI, so a thumbs-down maps to one exact run.
  return { text: out.text, citations: chunks, runId: span.runId };
}
```

> **Tip**
>
> Report **cost per resolved case**, not cost per token. A finance director cannot evaluate "£0.004 per thousand tokens" but understands "£0.31 per claim, against £6.10 of handler time" immediately — and that sentence is what renews the contract.

<a id="11-handover"></a>

## Handover Without Rot

- **Target bus factor** `≥ 3`
- **Real test** `their first solo page`
- **Success measured** `90 days after you leave`

Eventually you leave. What happens next is the only honest measure of the engagement — and the failure mode is seductive, because it looks exactly like success while it is happening.

> **Interactive animation:** `handover` — rendered by the page script in the HTML version.

> **Warning**
>
> **The hero trap.** When the customer is delighted *with you* rather than with the system, when they refuse to talk to anyone else, when you are the only person who can deploy — that is not seniority. It is a single point of failure that converts into churn the moment you are reassigned. Good programmes force rotation for exactly this reason.

- **Do — give away the pager** — Let their engineer take primary on-call with you as secondary. The first page they handle alone is the real handover; everything before it is theatre.
- **Do — hand over the eval suite** — Without it they can keep it running but cannot safely change it, so it freezes and slowly diverges from the business.
- **Do not — write documentation at the end** — A runbook written in week twenty-four is fiction. Write it from your own incidents, as they happen.

**Field practice**

*What does a runbook that actually gets used look like?*

Symptom first, because that is what the person at 2am has. Not architecture, not rationale — the thing they can see, the thing to check, and the exact command. Five entries drawn from real incidents beat fifty speculative ones.

**Runbook — symptom first**

```text
SYMPTOM   "Answers say 'Not covered by the documents I can see'" (spike)
CHECK     grafana / retrieval_hits_p50   -- is it 0?
CAUSE     Nightly ingest failed; index is stale or empty.
FIX       kubectl -n claims logs job/ingest-nightly --tail=200
          make reindex CORPUS=policies      # ~25 min, safe to re-run
ESCALATE  #claims-ai-oncall, then data-platform if the SOURCE export is missing.

SYMPTOM   "It's slow" / p95 over 4s
CHECK     traces: which span dominates? (usually llm, sometimes ops-api)
FIX       If ops-api > 2s: it is their mainframe window, 06:00-06:30 daily.
          Nothing to fix. Banner already switches on automatically.

SYMPTOM   Decision looks wrong on ONE claim
DO NOT    change the prompt.
DO        take the run_id from the UI footer, add it to evals/cases.jsonl
          with the expected answer, then fix and prove it with `make eval`.
```

---

<a id="12-the-decomposition-interview"></a>

## The Decomposition Interview

- **Format** `60 min, ambiguous brief`
- **Scored on** `how you scope`
- **Most common failure** `solving too early`

The loop is usually four parts: a behavioural round on ownership, a practical coding round (parse this messy file, expose an API — not LeetCode), a data- or AI-heavy system design round, and the **decomposition case study**. Palantir invented the last one and everybody hiring FDEs now runs a version of it.

You get a vague, real-world brief and an hour. The single most common failure is a strong engineer reaching for a solution in the first ninety seconds.

> **Interactive animation:** `decomposition` — rendered by the page script in the HTML version.

> **Key idea**
>
> You are not scored on the answer. You are scored on: did you scope before solving, did you sequence by dependency, did you propose something genuinely shippable, and did you change your mind when handed new information. Naming a technology earns nothing.

**Interview question**

*"A logistics firm wants an AI agent that reroutes delayed shipments. They have SAP data, a weather API and 500 warehouse managers. How do you build the eval suite so the agent does not overspend while holding a 99% delivery rate?"*

The question has a trap in it: it sounds like it is about evals, but the two numbers — cost and delivery rate — are in tension, and nobody has told you the exchange rate between them. Find that first, then the eval design writes itself. Answer out loud in this order.

**The structure of a passing answer**

```text
1. SCOPE       "What is a delay worth? If a late pallet costs GBP 400 in
               penalties, spending GBP 300 to save it is correct and my
               eval must reward it. Without that number I cannot grade
               a single case." -- the whole design hangs on this.

2. USER        Who acts? A warehouse manager on a phone, or a central
               control tower? Propose-and-approve vs fully autonomous
               are different products with different eval sets.

3. DATA        SAP is batch, weather is real-time. What is the staleness
               of the shipment record at decision time? An agent acting
               on a 4-hour-old position is the actual failure mode.

4. DECOMPOSE   (a) detect delay  (b) decide reroute is warranted
               (c) choose option (d) execute booking. Four evals, not one.
               (a) is a plain accuracy metric; (d) needs an integration
               test, not a model eval. Do not grade them together.

5. EVAL SET    300 historical delays with what the human actually chose
               AND the realised outcome. Grade the agent against the
               OUTCOME, not against the human -- humans were guessing too.

6. GUARDRAIL   Cost cap and carrier allowlist in code. Then the eval
               question narrows to: within policy, did it pick well?

7. MVP         Ship propose-only for 6 weeks. 500 managers accepting or
               rejecting is a labelled dataset arriving for free, and it
               is how you earn the right to turn autonomy up.

8. TRADE-OFF   "99% delivery at any cost" is not a real objective. I would
               push back and ask for the tolerance, because the honest
               answer changes the system.
```

> **Tip**
>
> Three portfolio pieces move an application more than any amount of interview practice: something you deployed **in someone else's environment**, an **enterprise integration** with real OAuth and retries, and an **eval harness** you built for a system you shipped. Each maps directly onto a round of the loop.

<a id="13-the-whole-role-on-one-page"></a>

## The Whole Role on One Page

Everything above, compressed.

| Stage | You are doing | Output | Fails when |
| --- | --- | --- | --- |
| Discover | Watching people work; mapping documented vs lived process | A falsifiable hypothesis and a measured baseline | You build for the sponsor instead of the operator |
| Model the domain | Naming entities, links and actions in the business's words | An ontology the customer can extend | It becomes a six-week data-modelling project |
| Prototype | Shipping something narrow on real data in week one | A working artefact and a re-scoped week two | It is broad and flimsy instead of narrow and solid |
| Ground & orchestrate | Retrieval with entitlements; tools with guardrails | Answers that cite, actions that are bounded | Policy lives in a prompt instead of in code |
| Evaluate | Turning field failures into graded cases, gating CI | A suite that makes change safe | You compare aggregates instead of per-case diffs |
| Clear the wall | SSO, egress, residency, security review, change board | A production path, opened in parallel | You start the queues in series, in month four |
| Observe | Traces with cost and outcome, in-region | Cost per resolved case; a quality signal | Quality degrades silently and nobody notices |
| Hand off | Runbook, pairing, the pager, the eval suite | Bus factor ≥ 3 and a system that still changes | You became the hero and then got reassigned |
| Feed the platform | Extracting the pattern you have now built three times | A feature the next engagement starts with | Cost per customer stays flat — you are a consultancy |

> **Interactive animation:** `platform-feedback` — rendered by the page script in the HTML version.

<a id="13-1-the-four-ways-it-goes-wrong"></a>

### The four ways the model goes wrong

1. **Consultancy creep.** More custom code per account than patterns pushed back to the platform. Cost per customer never falls, and the business gets valued like a services firm.
2. **Hero culture.** One irreplaceable engineer per account. Delightful, then catastrophic.
3. **Platform–product mismatch.** If the platform cannot cover ~80% out of the box, the FDE builds bespoke software forever. FDEs cannot fix a weak product; they can only delay the reckoning.
4. **Burnout.** Travel, customer pressure, and a full context switch every quarter. The healthiest programmes plan rotation and rest deliberately rather than hoping.

> **Key idea**
>
> If you remember one thing: **the scarce skill is not building the system, it is building the system inside someone else's constraints and then leaving it working.** Everything in this course is a consequence of that sentence.

<a id="13-2-where-to-go-next"></a>

### Where to go next

1. [The FDE detailed course](fde-detailed-course.html) — thirty-five sections covering the same ground from first principles, plus engagement economics, qualification, data integration, compliance, on-call in someone else's estate, adoption measurement, writing, and the hiring loop in depth.
2. [All FDE courses](fde-courses.html) — the catalogue page for this topic.
3. [AI Engineering detailed course](../ai-engineering/ai-engineering-detailed-course.html) — the model-side depth this course deliberately skips: tokenisation, context windows, sampling, embeddings, reranking and serving.
4. Palantir's own product documentation for Foundry's ontology, and the job descriptions for forward deployed roles at Palantir, OpenAI and Anthropic. Read three postings side by side — the overlap is the real syllabus for this role.
5. MIT NANDA's *State of AI in Business* report, for the primary source behind the pilot-failure numbers in section 0.

---

TechToday Study Library — Forward Deployed Engineer
