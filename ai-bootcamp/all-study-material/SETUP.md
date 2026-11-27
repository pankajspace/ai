# ⚡ Using `uv` for a Project Folder

Run all commands from inside the project folder; `uv` creates a `.venv` there.

```bash
# 1. Install uv (one time)
curl -LsSf https://astral.sh/uv/install.sh | sh   # macOS / Linux (or: brew install uv)

# 2. Change to the project folder (from all-study-material/)
cd 00-basics/02-langchain-foundation


### 3. Installing Dependencies STAR
# 3a. If the folder has pyproject.toml, install dependencies
uv sync

# Else if the folder has only requirements.txt
## 3a. Create the virtual environment
uv venv
## 3b. Install dependencies from requirements.txt
uv pip install -r requirements.txt
### End of Installing Dependencies

# 4. Run scripts (no activation needed; picks up the local .venv)
uv run python 01_hello_world_env_setup.py   # or: uv run 01_hello_world_env_setup.py

# 5. Manage packages
## 5a. (pyproject.toml folders)
uv add <package>
uv remove <package>
## 5b. (requirements.txt-only folders)
uv pip install <package>
uv pip uninstall <package>
```
