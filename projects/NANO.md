# nano Cheat Sheet

Most commonly used `nano` shortcuts for editing config files on the EC2 host.

> **Notation** — `Ctrl` is the `Control` key (on macOS use `Ctrl`, **not** `Cmd`); `Alt` is `Option`. nano lists the most common shortcuts along the bottom of the screen, where `^` means `Ctrl` and `M-` means `Alt`.

> **macOS `Option`/`Alt` gotcha** — if pressing `Option+6` prints `§` (or other `Alt` combos print special characters) instead of running the shortcut, your terminal is treating `Option` as a compose key. Fix it by:
1. **Tap `Esc`, release, then the key** — e.g. `Esc` then `6` instead of `Alt+6`. Works everywhere with no config.

## Copy & paste
1. `Ctrl+V` (terminal paste) — paste from your **system** clipboard; nano does not auto-indent, so pasted blocks keep their formatting

## Save & quit
1. `Ctrl+O` then `Enter` — save (write **O**ut) to the current file
2. `Ctrl+X` — quit (prompts to save if there are unsaved changes)
3. `Ctrl+O` → change the name → `Enter` — save as a different file

## Undo & helpers
1. `Alt+U` / `Alt+E` — undo / redo the last action
2. `Alt+N` — toggle line numbers on/off (handy for matching an `nginx -t` error line)
3. `Ctrl+G` — open the built-in help; `Ctrl+X` to leave help
