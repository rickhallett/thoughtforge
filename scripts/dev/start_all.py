#!/usr/bin/env python3
import subprocess
from pathlib import Path
import sys

def start_services():
    """Start all development services"""
    try:
        # Start backend
        subprocess.run(
            ["yarn", "workspace", "@thoughtforge/backend", "dev"],
            check=True
        )
    except subprocess.CalledProcessError as e:
        print(f"Error starting services: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    start_services()
