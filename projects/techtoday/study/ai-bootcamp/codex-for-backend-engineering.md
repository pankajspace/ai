<!--
Source: codex-for-backend-engineering.html
Title: TechToday - Codex for Backend Engineering | AI Bootcamp
Description: 26 hands-on guides: build an auction-house backend by directing the Codex coding agent.
Stylesheets: ../../style.css
-->

Navigation: [TechToday](../../index.html) · [← AI Bootcamp](ai-bootcamp-courses.html)

# Codex for Backend Engineering

26 hands-on guides: build an auction-house backend by directing the Codex coding agent

1. **[01. Introduction](codex-01-introduction.html)** — One-time setup: install the tools, get the course repo, and create the practice folder that every later guide works in.
2. **[02. Codex Overview](codex-02-codex-overview.html)** — A guided tour of the Codex app: the parts of the window, the permission level, model, effort and speed settings, and the built-in terminal.
3. **[03. Thinking Levels](codex-03-thinking-levels.html)** — The five effort levels and when each is worth its cost, custom instructions that save tokens, and a spend alert so your API bill never surprises you.
4. **[04. Specifying a Tech Stack](codex-04-specifying-a-tech-stack.html)** — Tour the course project: the folder layout, the stack and its parts, the Docker services and AGENTS.md, and why you choose the stack instead of the AI.
5. **[05. Install Custom Skills](codex-05-install-custom-skills.html)** — Your first real build: Codex creates a React site from nothing while you install the grilling skills used for the rest of the course.
6. **[06. Browser Use & AGENTS.md](codex-06-browser-use-and-agents-md.html)** — Let Codex open your site in a real Chrome window and click through it on its own, then generate an AGENTS.md file and trim it to the rules that matter.
7. **[07. Create Auctions & Bids Site](codex-07-create-auctions-and-bids-site.html)** — Read the rules file that steers Codex, add the workshop project, and get Part 1 of the real auction app running locally.
8. **[08. Plan Mode & Grilling](codex-08-plan-mode-and-grilling.html)** — Try Codex's plan mode, let the grill skills interview you about auctions, bids and users, and approve the build slices.
9. **[09. Auctions & Users](codex-09-auctions-and-users.html)** — Review an agent's work while it writes it: the database migration, the API and its tests, and the design record, then send your first follow-up change.
10. **[10. Bidding & Constraints](codex-10-bidding-and-constraints.html)** — Build posting auctions and bids, learn to read and shrink the context window, and prove the bid rules yourself in two browser tabs.
11. **[11. Understanding the Concurrency Problem](codex-11-understanding-the-concurrency-problem.html)** — Find the race condition in the bid code, then have Codex prove it with a four-window Bidding War Playwright test before anyone fixes it.
12. **[12. Concurrency Playwright Tests](codex-12-concurrency-playwright-tests.html)** — Finish the Bidding War test and watch the race happen, while you practise steering Codex mid-run with stops, queued messages and screenshots.
13. **[13. Create Plan for Fixing Concurrency](codex-13-create-plan-for-fixing-concurrency.html)** — Start Part 3: get grilled on the concurrency rules, use a side chat for your own questions, and finish with a written plan and two proposed slices.
14. **[14. Row Locking in PostgreSQL](codex-14-row-locking-in-postgresql.html)** — Build one transaction and one row lock per auction, learn how SELECT ... FOR UPDATE works, and watch the duplicate bids disappear.
15. **[15. Closing the Auction](codex-15-closing-the-auction.html)** — Add an injected app clock so auctions end exactly on time, learn isolation levels in side chats, and run a fully protected bidding war.
16. **[16. Code Reviews with Codex & Claude](codex-16-code-reviews-with-codex-and-claude.html)** — Run Codex's built-in code review, read the P1/P2 findings and decide what to fix, then get an optional second opinion from Claude.
17. **[17. Socket.io & Redis](codex-17-socket-io-and-redis.html)** — Start Part 4: plan real-time bid updates with WebSockets and a Redis backplane, and compare grilling with Plan mode side by side.
18. **[18. Implementing the Real-Time Updates](codex-18-implementing-the-real-time-updates.html)** — Question the architecture diagram, watch two browser windows update live without a reload, and fix the layout by showing Codex a screenshot.
19. **[19. Finding a Concurrency Defect](codex-19-finding-a-concurrency-defect.html)** — A game: a strong model plants a subtle concurrency bug and deletes its tests, then a small model in a fresh chat tries to find it.
20. **[20. Closing Auction Plan](codex-20-closing-auction-plan.html)** — Specify the architecture yourself: a close worker, RabbitMQ, a notification worker and a WebSocket popup, with an ADR for the transactional outbox.
21. **[21. Messaging with RabbitMQ](codex-21-messaging-with-rabbitmq.html)** — Build the close worker with its transactional outbox and the RabbitMQ notification flow, ending with popups for the winner and the seller.
22. **[22. Codex Goals](codex-22-codex-goals.html)** — Put the workshop on GitHub and let a Codex /goal pull an issue, work in its own worktree and open a pull request, like an agent on a team's ticket queue.
23. **[23. Stripe Checkout](codex-23-stripe-checkout.html)** — Start Part 7: plan and build winner checkout through a mock Stripe service so the auction winner can pay.
24. **[24. Reviewing the Pull Request](codex-24-reviewing-the-pull-request.html)** — Review the pull request your goal opened, catch the test it skipped, pay for a won auction yourself, and learn to verify before you accept.
25. **[25. Observability](codex-25-observability.html)** — Start Part 8: add OpenTelemetry tracing and Jaeger to the auction app with a single short grilling round, built as one slice.
26. **[26. Observability with Jaeger](codex-26-observability-with-jaeger.html)** — Read the traces in Jaeger, find an error span and its exception, and follow the winning bid's trace across three services.
27. **[27. Course Overview & All Guides](codex-index.html)** — The whole practice track on one page: what you build in each of the 8 parts, the prerequisites, and every guide with its step count.

---

© 2026 TechToday.
