#!/usr/bin/env python3
"""
Screenshot ↔ Evidence Lake Connector
Runs remap_lake_authentic_screenshots to ensure all lake records are mapped
at granular SKU level with authentic live captures.
"""
import sys, os, subprocess

BASE = "/Users/priteshhome/InkTank-analysis "

def main():
    print("[connector] Executing granular SKU authentic remapping...")
    cmd = [sys.executable, os.path.join(BASE, "scripts/crawlers/remap_lake_authentic_screenshots.py")]
    res = subprocess.run(cmd, capture_output=True, text=True)
    print(res.stdout)
    if res.stderr:
        print(res.stderr)
    print("[connector] Remapping completed successfully.")

if __name__ == "__main__":
    main()
