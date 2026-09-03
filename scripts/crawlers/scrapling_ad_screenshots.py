#!/usr/bin/env python3
"""
Scrapling-Powered Real Browser Screenshot Scraper.
Uses Scrapling DynamicFetcher with Playwright to capture authentic browser screenshots
of Meta Ad Library and Google Ads Transparency for HP, Epson, Canon, and Brother.
Saves PNG files into public/screenshots/ads/
"""

import sys
import os
import time

sys.path.insert(0, "/Users/priteshhome/InkTank-analysis /Scrapling")
from scrapling import DynamicFetcher

OUTPUT_DIR = "public/screenshots/ads"
os.makedirs(OUTPUT_DIR, exist_ok=True)

TARGETS = [
    {
        "id": "scrapling_meta_hp",
        "brand": "HP",
        "platform": "Meta Ad Library",
        "url": "https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=TH&q=HP%20Smart%20Tank&search_type=keyword_unordered&media_type=all",
        "wait_s": 5,
    },
    {
        "id": "scrapling_meta_epson",
        "brand": "Epson",
        "platform": "Meta Ad Library",
        "url": "https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=TH&q=Epson%20EcoTank&search_type=keyword_unordered&media_type=all",
        "wait_s": 5,
    },
    {
        "id": "scrapling_meta_canon",
        "brand": "Canon",
        "platform": "Meta Ad Library",
        "url": "https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=TH&q=Canon%20PIXMA%20G&search_type=keyword_unordered&media_type=all",
        "wait_s": 5,
    },
    {
        "id": "scrapling_meta_brother",
        "brand": "Brother",
        "platform": "Meta Ad Library",
        "url": "https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=TH&q=Brother%20DCP-T&search_type=keyword_unordered&media_type=all",
        "wait_s": 5,
    },
    {
        "id": "scrapling_google_hp",
        "brand": "HP",
        "platform": "Google Ads Transparency",
        "url": "https://adstransparency.google.com/?region=TH&query=HP%20Thailand",
        "wait_s": 4,
    },
    {
        "id": "scrapling_google_epson",
        "brand": "Epson",
        "platform": "Google Ads Transparency",
        "url": "https://adstransparency.google.com/?region=TH&query=Epson%20Thailand",
        "wait_s": 4,
    },
    {
        "id": "scrapling_google_canon",
        "brand": "Canon",
        "platform": "Google Ads Transparency",
        "url": "https://adstransparency.google.com/?region=TH&query=Canon%20Marketing%20Thailand",
        "wait_s": 4,
    },
    {
        "id": "scrapling_google_brother",
        "brand": "Brother",
        "platform": "Google Ads Transparency",
        "url": "https://adstransparency.google.com/?region=TH&query=Brother%20Commercial%20Thailand",
        "wait_s": 4,
    }
]

def main():
    print(f"[*] Starting Scrapling Real Browser Screenshot Capture for {len(TARGETS)} targets...")
    captured = {}

    for t in TARGETS:
        target_id = t["id"]
        out_path = os.path.join(OUTPUT_DIR, f"{target_id}.png")
        print(f"\n--> Fetching [{t['brand']}] {t['platform']}: {t['url']}")

        def make_action(save_path, wait_time):
            def action(page):
                page.set_viewport_size({"width": 1280, "height": 850})
                time.sleep(wait_time)
                page.screenshot(path=save_path)
                size_kb = os.path.getsize(save_path) / 1024.0
                print(f"    ✔ Saved real browser screenshot: {save_path} ({size_kb:.1f} KB)")
            return action

        try:
            res = DynamicFetcher.fetch(
                t["url"],
                page_action=make_action(out_path, t["wait_s"]),
                headless=True,
                timeout=35000,
                network_idle=False
            )
            captured[target_id] = {
                "brand": t["brand"],
                "platform": t["platform"],
                "path": f"/screenshots/ads/{target_id}.png",
                "status": "CAPTURED",
                "bytes": os.path.getsize(out_path) if os.path.exists(out_path) else 0
            }
        except Exception as e:
            print(f"    ✗ Error fetching {target_id}: {e}")

    print("\n" + "="*60)
    print(f"[*] Done! Captured {len(captured)} real browser ad screenshots.")
    return captured

if __name__ == "__main__":
    main()
