# nano Cheat Sheet

Most commonly used `nano` shortcuts for editing config files on the EC2 host.

> **Notation** — `Ctrl` is the `Control` key (on macOS use `Ctrl`, **not** `Cmd`); `Alt` is `Option`. nano lists the most common shortcuts along the bottom of the screen, where `^` means `Ctrl` and `M-` means `Alt`.

> **macOS `Option`/`Alt` gotcha** — if pressing `Option+6` prints `§` (or other `Alt` combos print special characters) instead of running the shortcut, your terminal is treating `Option` as a compose key. Fix it either way:
> 1. **Tap `Esc`, release, then the key** — e.g. `Esc` then `6` instead of `Alt+6`. Works everywhere with no config.
> 2. **Make `Option` act as Meta** — Terminal.app: Settings → Profiles → **Keyboard** → check **Use Option as Meta key**. iTerm2: Settings → Profiles → **Keys** → set the Option key to **Esc+**. VS Code terminal: set `"terminal.integrated.macOptionIsMeta": true`.

## Copy & paste
1. `Ctrl+K` — cut the current line (repeat to stack multiple lines)
2. `Alt+6` (or `Esc` then `6`) — copy the current line without cutting it
3. `Ctrl+U` — paste (**u**ncut) the cut/copied text at the cursor; an error beep means the cutbuffer is empty — cut (`Ctrl+K`) or copy (`Esc` then `6`) something first
4. `Ctrl+Shift+V` (terminal paste) — paste from your **system** clipboard; nano does not auto-indent, so pasted blocks keep their formatting

## Save & quit
1. `Ctrl+O` then `Enter` — save (write **O**ut) to the current file
2. `Ctrl+X` — quit (prompts to save if there are unsaved changes)
3. `Ctrl+O` → change the name → `Enter` — save as a different file

## Move around
1. Arrow keys — move one character/line
2. `Ctrl+A` / `Ctrl+E` — jump to start / end of the line
3. `Ctrl+Y` / `Ctrl+V` — page up / page down
4. `Ctrl+_` then a line number → `Enter` — go to a specific line

## Search & replace
1. `Ctrl+W` — search (**w**here is); type the term → `Enter`, then `Alt+W` to repeat
2. `Ctrl+\` — search **and** replace; enter the term, the replacement, then `Y` / `N` / `A` for each match

## Undo & helpers
1. `Alt+U` / `Alt+E` — undo / redo the last action
2. `Alt+N` — toggle line numbers on/off (handy for matching an `nginx -t` error line)
3. `Ctrl+G` — open the built-in help; `Ctrl+X` to leave help
