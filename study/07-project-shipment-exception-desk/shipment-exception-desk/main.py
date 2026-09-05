"""Root runner for CLI."""
import sys
from pathlib import Path

src_dir = Path(__file__).resolve().parent / "src"
sys.path.insert(0, str(src_dir))

from main import main

if __name__ == "__main__":
    main()

