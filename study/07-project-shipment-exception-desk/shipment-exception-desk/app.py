"""Root launcher for Northwind Logistics FastAPI web application."""

import os
import sys
from pathlib import Path
import uvicorn

# Add workspace root and src to sys.path
root_dir = Path(__file__).resolve().parent
src_dir = root_dir / "src"
for p in [str(root_dir), str(src_dir)]:
    if p not in sys.path:
        sys.path.insert(0, p)

from src.app import app

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8080))
    uvicorn.run(app, host="0.0.0.0", port=port)
