import os
from pathlib import Path
from dotenv import load_dotenv, find_dotenv
from langchain_openai import ChatOpenAI

# Load .env file from project root or current working directory
dotenv_path = find_dotenv(usecwd=True)
if not dotenv_path:
    # Try looking in parent directory if executing from within src/
    parent_env = Path(__file__).resolve().parent.parent / ".env"
    if parent_env.exists():
        dotenv_path = str(parent_env)

load_dotenv(dotenv_path)

# Initialize ChatOpenAI instance
llm = ChatOpenAI(
    model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
    temperature=0.0,
    api_key=os.getenv("OPENAI_API_KEY"),
)

