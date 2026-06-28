[<- README](../README.md)

# Claude Code: Complete Practical Guide

## Links
1. [Claude Code Tutorial YT TNN](https://www.youtube.com/watch?v=SUysp3sJHbA&list=PL4cUxeGkcC9g4YJeBqChhFJwKQ9TRiivY)
2. [Claude Code Masterclass](https://netninja.dev/courses/enrolled/2931538)

### Commands · Skills · Subagents · MCP Servers · Hooks

> **Project**: We build a Node.js Express REST API (a Task Manager) and wire up every Claude Code feature along the way. By the end you have a fully configured project you can reuse as a template.

---

## Prerequisites

```bash
# Install Claude Code
npm install -g @anthropic-ai/claude-code

# Verify
claude --version

# Node.js 18+ required
node --version
```

---

## Step 0 — Bootstrap the Node.js Project

Start by creating the project we'll use throughout this guide.

```bash
mkdir task-manager-api && cd task-manager-api
npm init -y
npm install express uuid
npm install --save-dev nodemon jest supertest eslint
```

Create the entry point:

```javascript
// src/index.js
const express = require('express');
const { tasksRouter } = require('./routes/tasks');

const app = express();
app.use(express.json());
app.use('/tasks', tasksRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Task API running on port ${PORT}`));

module.exports = app;
```

```javascript
// src/routes/tasks.js
const { Router } = require('express');
const { v4: uuidv4 } = require('uuid');

const router = Router();
const tasks = [];

router.get('/', (req, res) => res.json(tasks));

router.post('/', (req, res) => {
  const { title, priority = 'medium' } = req.body;
  if (!title) return res.status(400).json({ error: 'title is required' });
  const task = { id: uuidv4(), title, priority, done: false, createdAt: new Date() };
  tasks.push(task);
  res.status(201).json(task);
});

router.patch('/:id/done', (req, res) => {
  const task = tasks.find(t => t.id === req.params.id);
  if (!task) return res.status(404).json({ error: 'Task not found' });
  task.done = true;
  res.json(task);
});

router.delete('/:id', (req, res) => {
  const index = tasks.findIndex(t => t.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Task not found' });
  tasks.splice(index, 1);
  res.status(204).send();
});

module.exports = { tasksRouter: router };
```

Add scripts to `package.json`:

```json
"scripts": {
  "start": "node src/index.js",
  "dev": "nodemon src/index.js",
  "test": "jest --runInBand",
  "lint": "eslint src/**/*.js"
}
```

---

## Step 1 — CLAUDE.md (Project Context)

`CLAUDE.md` is the first thing Claude reads in every session. It's your project's permanent memory.

**Create `.claude/CLAUDE.md` at the project root:**

```markdown
# Task Manager API

## Stack
- Runtime: Node.js 18+
- Framework: Express 4
- Test runner: Jest + Supertest
- Linter: ESLint

## Key Commands
- Start dev server: `npm run dev`
- Run tests: `npm test`
- Lint: `npm run lint`

## Conventions
1. All route handlers live in `src/routes/`
2. Business logic lives in `src/services/` — never inline in routes
3. Always validate request body before using it
4. Tests live next to source files as `*.test.js`
5. Use `uuidv4()` for all generated IDs — never auto-increment integers
6. HTTP errors use `{ error: "message" }` shape

## Architecture
src/
  index.js          → Express app entry point
  routes/           → Route handlers (thin — delegate to services)
  services/         → Business logic
  middleware/        → Shared middleware (auth, error handling)
  __tests__/        → Integration tests
```

**Try it:** Open Claude Code in the project root and run:

```
claude
> What does this project do and how is it structured?
```

Claude will use CLAUDE.md to answer accurately without reading every file.

---

## Step 2 — Slash Commands

Slash commands are saved prompts that trigger workflows with a single keystroke. They live in `.claude/commands/` (project-level) or `~/.claude/commands/` (global).

### 2.1 Create a `/review` command

```bash
mkdir -p .claude/commands
```

```markdown
<!-- .claude/commands/review.md -->
Review the code in $ARGUMENTS for:

1. **Correctness** — Does the logic do what it claims?
2. **Error handling** — Are edge cases and errors handled?
3. **Security** — Any injection risks, unvalidated input, or exposed secrets?
4. **Style** — Does it follow the conventions in CLAUDE.md?

For each issue found, show:
- The problematic code snippet
- Why it's a problem
- A corrected version

Be concise. Skip praise. Focus on actionable improvements.
```

**Use it:**

```
claude
> /review src/routes/tasks.js
```

### 2.2 Create a `/test` command

```markdown
<!-- .claude/commands/test.md -->
Write Jest + Supertest integration tests for $ARGUMENTS.

Requirements:
- Test happy path for every endpoint
- Test validation errors (missing fields, wrong types)
- Test 404 cases
- Test edge cases specific to the logic

Follow the conventions in CLAUDE.md. Save tests as `*.test.js` next to the source file.
Run `npm test` after writing to verify they pass.
```

**Use it:**

```
claude
> /test src/routes/tasks.js
```

### 2.3 Create a `/doc` command

```markdown
<!-- .claude/commands/doc.md -->
Generate JSDoc comments for every exported function in $ARGUMENTS.

For each function include:
- @description — what it does
- @param — each parameter with type and description
- @returns — return type and description
- @throws — errors it may throw
- @example — one short usage example

Do not rewrite the logic. Only add/update comments.
```

**Use it:**

```
claude
> /doc src/routes/tasks.js
```

### 2.4 Parameterized commands

`$ARGUMENTS` captures everything typed after the command name. You can also use it for structured workflows:

```markdown
<!-- .claude/commands/fix-issue.md -->
Fix issue #$ARGUMENTS in this codebase.

1. Understand what the issue describes
2. Find the relevant files
3. Implement the minimal fix
4. Write or update a test that would have caught this
5. Run `npm test` to confirm everything passes
```

```
claude
> /fix-issue 42
```

---

## Step 3 — Skills

Skills are markdown instruction folders that Claude **auto-loads** when they're relevant — unlike commands, you don't have to call them explicitly.

### 3.1 Create a testing skill

```bash
mkdir -p .claude/skills/testing
```

```markdown
<!-- .claude/skills/testing/SKILL.md -->
---
name: testing
description: Use when writing, running, or debugging Jest tests for this project
---

# Testing Conventions

## Test file location
Place `*.test.js` files next to the source file they test.

## Test structure
Use `describe` blocks per function/endpoint. Use `it` with a clear
sentence describing the expected behavior.

```javascript
const request = require('supertest');
const app = require('../../index');

describe('POST /tasks', () => {
  it('creates a task with valid body', async () => {
    const res = await request(app)
      .post('/tasks')
      .send({ title: 'Buy milk', priority: 'high' });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ title: 'Buy milk', done: false });
  });

  it('returns 400 when title is missing', async () => {
    const res = await request(app).post('/tasks').send({});
    expect(res.status).toBe(400);
  });
});
```

## Assertion patterns
- Use `toMatchObject` for partial shape checks
- Use `expect.any(String)` for UUIDs
- Never hardcode IDs in assertions
```

### 3.2 Create an error-handling skill

```bash
mkdir -p .claude/skills/error-handling
```

```markdown
<!-- .claude/skills/error-handling/SKILL.md -->
---
name: error-handling
description: Use when adding error handling, middleware, or try/catch blocks to this project
---

# Error Handling Patterns

## HTTP error shape
All errors must use this exact JSON shape:
```json
{ "error": "Human-readable message" }
```

## Async route handlers
Wrap all async routes with this helper to avoid unhandled rejections:

```javascript
const asyncHandler = fn => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
```

## Global error middleware
Register this as the last middleware in `src/index.js`:

```javascript
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});
```

## Validation errors
Return 400 with `{ error: "field is required" }` — never expose stack traces.

**How skills activate:** When you ask Claude to "add error handling" or "write tests", it scans skill descriptions and auto-loads the matching skill folder — giving it the exact patterns to follow without you having to explain them every time.

---

## Step 4 — Subagents

Subagents are specialized Claude instances with their own context window, tool permissions, and system prompt. They prevent your main chat from getting cluttered with deep analysis work.

### 4.1 Create a security-reviewer subagent

```bash
mkdir -p .claude/agents
```

```markdown
<!-- .claude/agents/security-reviewer.md -->
---
name: security-reviewer
description: Use PROACTIVELY for security audits and vulnerability detection in Express/Node.js code
tools: Read, Grep, Glob
---

You are a Node.js security specialist. When reviewing code, check for:

1. **Injection** — SQL injection, command injection, path traversal
2. **Input validation** — Unvalidated or unsanitized user input reaching logic
3. **Auth gaps** — Missing authentication or authorization checks
4. **Secrets exposure** — Hardcoded credentials, API keys, or connection strings
5. **Dependency risks** — Known-vulnerable packages (flag for `npm audit`)
6. **Error leakage** — Stack traces or internal paths exposed to clients

For each finding:
- Cite the exact file and line number
- Explain the risk in plain language
- Provide the secure version of the code

Output a structured report with findings grouped by severity: Critical / High / Medium / Low.
```

**Use it:**

```
claude
> @security-reviewer please audit src/routes/tasks.js
```

### 4.2 Create a test-writer subagent

```markdown
<!-- .claude/agents/test-writer.md -->
---
name: test-writer
description: Specialized agent for writing comprehensive Jest tests. Use when test coverage is needed.
tools: Read, Write, Bash
---

You are a test engineering specialist for Node.js Express APIs.

When asked to write tests for a file:
1. Read the source file completely
2. Identify every exported function and route
3. Write tests covering: happy path, validation errors, not-found cases, edge cases
4. Follow the project's testing conventions from `.claude/skills/testing/SKILL.md`
5. Run `npm test` to verify tests pass before finishing
6. Report the final coverage summary

Your tests must be deterministic — no `Date.now()` in assertions, no order-dependent state.
```

**Use it:**

```
claude
> @test-writer write tests for src/routes/tasks.js
```

### 4.3 Invoke subagents from a command (pipeline)

```markdown
<!-- .claude/commands/full-review.md -->
Run a full quality check on $ARGUMENTS:

1. Delegate a security audit to @security-reviewer
2. Delegate test coverage analysis to @test-writer
3. Review code style against CLAUDE.md conventions yourself
4. Produce a combined report with: Security findings, Test gaps, Style issues
5. Suggest a priority-ordered fix list
```

```
claude
> /full-review src/routes/tasks.js
```

---

## Step 5 — MCP Servers

MCP (Model Context Protocol) connects Claude Code to external tools — GitHub, databases, APIs — so it can perform real actions beyond the local filesystem.

### 5.1 Add the Filesystem MCP server

This is the best first MCP server: it lets Claude access directories outside the project.

```bash
# Add at project scope (only this project)
claude mcp add filesystem -- npx -y @modelcontextprotocol/server-filesystem /path/to/allowed/dir

# Or at user scope (all projects)
claude mcp add filesystem -s user -- npx -y @modelcontextprotocol/server-filesystem ~/Documents
```

**Verify it's connected:**

```
claude
> /mcp
```

### 5.2 Add the GitHub MCP server

```bash
# Requires a GitHub personal access token
export GITHUB_TOKEN=your_token_here

claude mcp add github -s user -- npx -y @modelcontextprotocol/server-github
```

**Use it to automate PR workflows:**

```
claude
> Fetch the latest open PRs in this repo and review them for issues
```

### 5.3 Chain MCP with a slash command

```markdown
<!-- .claude/commands/pr-review.md -->
Review the PR at $ARGUMENTS:

1. Fetch the PR diff using the GitHub MCP tool
2. Load project conventions from CLAUDE.md
3. Delegate security analysis to @security-reviewer
4. Check that tests exist for all changed files via @test-writer
5. Write a structured review comment summarizing: risks, missing tests, style issues
```

```
claude
> /pr-review https://github.com/yourname/task-manager-api/pull/7
```

### 5.4 Add an MCP server via `claude_mcp_config` (manual)

For advanced control, edit `.claude/settings.json` directly:

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/allowed/path"]
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_TOKEN": "${GITHUB_TOKEN}"
      }
    }
  }
}
```

---

## Step 6 — Hooks

Hooks are scripts that fire automatically at Claude Code lifecycle events. They're deterministic — no AI involved — just shell commands that run at the right moment.

### Hook events

| Event          | When it fires                                       |
| -------------- | --------------------------------------------------- |
| `PreToolUse`   | Before Claude runs a tool (Read, Write, Bash, etc.) |
| `PostToolUse`  | After a tool completes                              |
| `Notification` | When Claude sends a notification                    |
| `Stop`         | When a session ends                                 |

### 6.1 Auto-lint on every file write

Add hooks to `.claude/settings.json`:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write",
        "hooks": [
          {
            "type": "command",
            "command": "npm run lint -- --fix \"$CLAUDE_TOOL_INPUT_FILE_PATH\" 2>&1 || true"
          }
        ]
      }
    ]
  }
}
```

Now every time Claude writes a `.js` file, ESLint auto-runs and fixes it.

### 6.2 Block dangerous shell commands

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "node .claude/hooks/block-dangerous.js"
          }
        ]
      }
    ]
  }
}
```

```javascript
// .claude/hooks/block-dangerous.js
const input = JSON.parse(require('fs').readFileSync('/dev/stdin', 'utf8'));
const command = input.tool_input?.command || '';

const BLOCKED = ['rm -rf /', 'DROP TABLE', 'format c:', '> /dev/sda'];

const found = BLOCKED.find(pattern => command.includes(pattern));
if (found) {
  console.error(`Blocked: command contains forbidden pattern "${found}"`);
  process.exit(2); // exit code 2 = block + show error to Claude
}

process.exit(0); // allow
```

> **Exit codes:** `0` = allow, `1` = allow but log warning, `2` = block and show error to Claude.

### 6.3 Auto-run tests after writing test files

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write(*.test.js)",
        "hooks": [
          {
            "type": "command",
            "command": "npm test -- --testPathPattern=\"$CLAUDE_TOOL_INPUT_FILE_PATH\" 2>&1"
          }
        ]
      }
    ]
  }
}
```

### 6.4 Desktop notification when Claude finishes

```json
{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "node -e \"require('child_process').execSync('notify-send \\'Claude Code\\' \\'Task complete!\\'')\""
          }
        ]
      }
    ]
  }
}
```

---

## Step 7 — Putting It All Together

Here's the complete file structure after all steps:

```
task-manager-api/
├── src/
│   ├── index.js
│   ├── routes/
│   │   ├── tasks.js
│   │   └── tasks.test.js        ← generated by @test-writer
│   └── services/                ← extracted by Claude via /review
├── .claude/
│   ├── CLAUDE.md                ← Step 1: project memory
│   ├── settings.json            ← Steps 5 & 6: MCP + hooks config
│   ├── commands/
│   │   ├── review.md            ← Step 2.1
│   │   ├── test.md              ← Step 2.2
│   │   ├── doc.md               ← Step 2.3
│   │   ├── fix-issue.md         ← Step 2.4
│   │   ├── pr-review.md         ← Step 5.3
│   │   └── full-review.md       ← Step 4.3
│   ├── skills/
│   │   ├── testing/SKILL.md     ← Step 3.1
│   │   └── error-handling/SKILL.md ← Step 3.2
│   ├── agents/
│   │   ├── security-reviewer.md ← Step 4.1
│   │   └── test-writer.md       ← Step 4.2
│   └── hooks/
│       └── block-dangerous.js   ← Step 6.2
└── package.json
```

### A real end-to-end workflow

```
claude
> /full-review src/routes/tasks.js
```

What Claude does internally:
1. Loads CLAUDE.md for project context
2. Spawns `@security-reviewer` subagent — scans routes, returns security report
3. Spawns `@test-writer` subagent — checks coverage gaps
4. Reviews code style itself
5. `PostToolUse` hook fires ESLint on any file written
6. Returns consolidated report to your terminal

---

## Quick Reference

| Feature     | File Location               | Invoked                               |
| ----------- | --------------------------- | ------------------------------------- |
| CLAUDE.md   | `.claude/CLAUDE.md`         | Automatically, every session          |
| Commands    | `.claude/commands/*.md`     | `/command-name` in chat               |
| Skills      | `.claude/skills/*/SKILL.md` | Automatically by keyword match        |
| Subagents   | `.claude/agents/*.md`       | `@agent-name` or by description match |
| MCP servers | `.claude/settings.json`     | Tools available in every session      |
| Hooks       | `.claude/settings.json`     | Automatically on lifecycle events     |

### Decision guide

- **Need Claude to remember project context always?** → CLAUDE.md
- **Doing the same task repeatedly?** → Slash command
- **Teaching Claude a pattern it should always follow?** → Skill
- **Heavy analysis that would bloat your context?** → Subagent
- **Connecting to GitHub / Notion / databases?** → MCP server
- **Automatic enforcement without prompting?** → Hook

---

## Resources

- Official docs: https://code.claude.com/docs
- MCP server registry: https://github.com/modelcontextprotocol/servers
- Community guide: https://github.com/FlorianBruniaux/claude-code-ultimate-guide
- Awesome Claude Code: https://github.com/hesreallyhim/awesome-claude-code
