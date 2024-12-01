#!/usr/bin/env python3
import subprocess
import sys
from pathlib import Path

def build_packages():
    """Build all packages in correct order"""
    try:
        # Build shared package first
        print("Building shared package...")
        subprocess.run(["yarn", "shared:build"], check=True)
        
        # Build backend
        print("Building backend...")
        subprocess.run(["yarn", "backend:build"], check=True)
        
        print("✅ Build completed successfully")
        
    except subprocess.CalledProcessError as e:
        print(f"❌ Build failed: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    build_packages()
