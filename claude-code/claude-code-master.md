[<- Claude Code Quick](claude-code-quick.md)

# Comprehensive Study Guide: Mastering Claude Code

**Claude Code** is an AI-powered, agentic coding tool by Anthropic that operates directly within your terminal, setting it apart from IDE-embedded tools like Copilot or Cursor. It requires an Anthropic Pro ($17/month) or Max subscription. The tool is designed to integrate seamlessly into your existing development workflow, acting more like a junior or mid-level developer working alongside you rather than an entirely automated "vibe coding" solution.

## 1. Setup and Initialization

*   **Installation:** Install the tool globally using `npm install -g @anthropic-ai/claude-code`. Navigate to your project directory and run the command `claude` to start a session.
*   **VS Code Integration:** Running the `claude` command inside the VS Code terminal automatically installs a companion extension. This extension provides Claude with active tab awareness (knowing what file you are working on), text selection context, and diff viewing capabilities.
*   **The `/init` Command:** When bringing Claude into a project for the first time, run `/init`. Claude will scan your codebase, analyse folder structures, read your `package.json`, and generate a **`CLAUDE.md`** file.
*   **Maintaining Context:** The `CLAUDE.md` file acts as mini-documentation and baseline guidance for Claude's future decisions. You must actively manually update this file as your project's architecture, naming conventions, or packages change to prevent the AI from going off track.

## 2. Managing Memory and Context

Context management is crucial because Claude has a limit of up to 200,000 tokens; exceeding this limit causes the model's performance to degrade.

### Adding Context
*   **The `@` Symbol:** Use `@` followed by a file path to explicitly load files into Claude's context.
*   **Active Cursor & Highlighting:** Putting your cursor inside an open file or highlighting a block of code will automatically add it as context.
*   **Images:** You can drag and drop images directly into the terminal chat for Claude to use as visual context (e.g., styling a component based on a reference image).

### Adding Memories (`#`)
You can instantly store instructions and guidelines using the `#` symbol in the chat. Memories can be saved to three different scopes:
1.  **Project Memory (`CLAUDE.md`):** Saved to the project root. This should be tracked in version control so the entire team shares the same guidance.
2.  **Local Project Memory:** Saved locally (with "local" in the filename). Used for personal tool preferences not pushed to the team repo (Note: This feature is being deprecated in favour of tracking untracked files).
3.  **Global/User Memory:** Saved to a global directory on your machine for rules that apply to *all* your projects.
*You can manage these files directly using the `/memory` command.*

### Keeping Context Clean
To prevent Claude from getting confused by bloated, irrelevant chat history, use these built-in context management shortcuts:
*   **Double `Escape`:** Rewinds the chat to a previous point, clearing out all subsequent chat history and file context.
*   **`/compact`:** Summarises the entire session history into a dense, smaller chunk, deleting the granular chat history but retaining the core knowledge.
*   **`/clear`:** Completely wipes the session history back to a fresh state (your `CLAUDE.md` file remains as context).
*   **`/exit` and `/res`:** Exits the chat completely, or resumes a previous session.

## 3. Tools and Permissions

Claude Code automatically determines when to use built-in tools like `read`, `edit`, `bash`, and `todo` (which it uses to create step-by-step checklists for itself).
*   **Permissions:** Destructive or active tools (like `edit` or `bash`) require your permission. Selecting "yes and don't ask me again" will save the allowed command to an array inside a `.claude/settings.local.json` file.
*   **Auto-Accepting Edits:** Press **`Alt + M`** (or `Cmd + M` on Mac) to toggle an auto-accept feature, which stops Claude from asking permission for every single file edit during the session.
*   **Bash Mode:** Prefix a prompt with `?` to drop directly into a bash command execution (e.g., `? git status`).

## 4. Operational Modes: Planning & Thinking

*   **Planning Mode:** Toggled by pressing **`Alt + M` twice**. This mode is best used for tasks with a **wide breadth of changes** spanning multiple files. Claude will generate a detailed implementation plan for your approval before writing any code.
*   **Thinking Mode:** Best for tasks requiring **complex logic** or architectural reasoning. Triggered by including specific keywords in your prompt: "think", "think hard", "think harder", or "ultra think". The model consumes more tokens and takes longer, but works through the logic step-by-step before executing.

## 5. Extensibility: Commands, MCP Servers, and Subagents

### Slash Commands
Typing `/` reveals built-in commands (like `/add-dir` for multi-repo context, or `/model` to switch AI models).
You can create **Custom Commands** for repetitive tasks by making a markdown file inside the `.claude/commands/` directory.
*   Use **YAML frontmatter** at the top of the file to define the `description` and `argument_hint`.
*   You can pass arguments to your command using the `$[arguments]` variable, capturing them in the markdown file using a reference link syntax like `[name]`.

### MCP Servers (Model Context Protocol)
MCP servers allow Claude to interact with external data sources, APIs, and services (e.g., querying a Supabase database).
*   **Installation:** Installed locally via `claude mcp add <server-name> --scope project`. *Note: Windows users may need to append `cmd /c` before the execution command to prevent shell closure issues*.
*   **Examples:** The **Context 7** server provides up-to-date documentation for web frameworks, while the **Playwright** server allows Claude to open browsers, click elements, and take screenshots.
*   Configuration is saved inside an `mcp.json` file at the project root. Verify active servers using `/mcp`.

### Subagents
Subagents are isolated AI workers with specialised expertise, tools, and context windows.
*   Created using the `/agents` command, which saves an agent configuration file in the `.claude/agents/` directory.
*   **Delegation:** The main Claude Code thread acts as a senior developer, delegating tasks to subagents to keep its own context window clean.
*   **Example Workflow:** You could create a "UI/UX Reviewer" subagent equipped with the Playwright MCP. The main Claude thread writes a component, then explicitly asks the UI/UX subagent to view the component in a browser, test it, and provide visual feedback for further edits.

## 6. GitHub Integration Workflow

Claude Code offers a dedicated GitHub App to automate tasks directly in your remote repository.
*   **Prerequisites:** You must have the GitHub CLI installed and be authenticated (`gh auth login`).
*   **Installation:** Run `/install-github-app` within Claude to generate workflow action files.
*   **Capabilities:** Once merged, Claude will automatically review newly opened Pull Requests (checking for bugs, code quality, and performance). Furthermore, if you tag **`@Claude`** in the comments of a GitHub Issue, it will automatically clone the repository to a new branch, implement the fix, and provide a link to generate a Pull Request.
*

## TODO
Here is a step-by-step to-do list to help you test out the most powerful features of Claude Code once you have it running on your laptop:

**1. Initialize Your Project's Memory**
Start by navigating to a project directory and running the `/init` command. Claude will scan your codebase, check your folder structures, and create a `CLAUDE.md` file. This file acts as baseline context for the AI, so you should manually open it and add any personal coding preferences, architectures, or rules you want the AI to follow.

**2. Configure Terminal Keybindings**
Run the `/terminal-setup` command. This installs the `Shift + Enter` keybinding, allowing you to easily add new lines to your prompts within the terminal without accidentally sending the message prematurely.

**3. Practice Context Injection**
Try feeding Claude different types of context to see how it reacts. Use the **`@` symbol** followed by a file path to manually link a specific file to your prompt. You can also **drag and drop an image** directly into the terminal chat, and ask Claude to use it as a visual reference for styling a component.

**4. Keep Your Context Window Clean**
The AI performs poorly if it is overwhelmed with irrelevant chat history, so practice cleaning up your session.
*   Tap **double `Escape`** to rewind your chat history to a previous point.
*   Run the `/compact` command to have Claude summarize your entire session into a dense chunk, freeing up your context limit while retaining the core knowledge.

**5. Test Out "Planning Mode"**
Press **`Alt + M`** (or `Cmd + M` on Mac) twice to toggle planning mode on. Ask Claude to implement a feature that requires changes across multiple files. Instead of immediately writing code, it will provide a detailed, step-by-step implementation plan for you to approve or tweak before it begins.

**6. Trigger Extended "Thinking Mode"**
Give Claude a task that requires complex logic or architectural reasoning, and make sure to include keywords like **"think"**, **"think hard"**, or **"ultra think"** in your prompt. The model will consume more tokens but will output a grayed-out "thinking process" where it reasons through the logic before attempting to execute the code.

**7. Write a Custom Slash Command**
Automate a repetitive task by creating a `.claude/commands/` folder and adding a custom markdown file (e.g., `ui-component.md`). You can use YAML frontmatter to give the command a description and allow it to accept dynamic arguments (like a component name). Restart Claude, and you can now use this command by typing `/`.

**8. Install an MCP Server**
Give Claude the ability to interact with external tools by installing a Model Context Protocol (MCP) server. Try running `claude mcp add context-7 --scope project` to give Claude access to up-to-date web framework documentation, or install the `playwright` MCP to let Claude open browsers, click links, and take screenshots.

**9. Create an Isolated Subagent**
Run the `/agents` command to build a specialized AI worker. You can assign the subagent a specific task—like a "UI/UX Reviewer"—and give it exclusive access to the Playwright MCP server. The main Claude thread can then delegate component reviews to this subagent, keeping the main context window entirely clean.

**10. Automate GitHub Workflows**
If you have the GitHub CLI installed, type `/install-github-app`. This generates workflow files in your repository that allow Claude to automatically review newly opened Pull Requests. Once installed, try opening a GitHub Issue and tagging **`@Claude`** in the comments; it will automatically clone the repository, implement a fix, and open a Pull Request for you.