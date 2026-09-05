"""Root runner for triage checks."""
import sys
from pathlib import Path

# Add src to sys.path and execute triage_check
src_dir = Path(__file__).resolve().parent / "src"
sys.path.insert(0, str(src_dir))

from triage_check import run_checks

if __name__ == "__main__":
    success = run_checks()
    sys.exit(0 if success else 1)

