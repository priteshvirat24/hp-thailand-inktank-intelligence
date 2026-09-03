#!/usr/bin/env python3
"""
Real Browser Screenshot Scraper using Headless Chromium Playwright.
Scrapes authentic browser screenshots from:
1. Meta Ad Library Thailand (HP, Epson, Canon, Brother)
2. Google Ads Transparency Center Thailand
3. Official Facebook Brand Pages (HP Thailand, Epson Thailand, Canon Thailand, Brother Thailand)
4. Official YouTube Channel Hubs
Saves verified browser screenshots into public/screenshots/ads/
"""

import os
import time
from playwright.sync_api import sync_playwright

OUTPUT_DIR = "public/screenshots/ads"
os.makedirs(OUTPUT_DIR, exist_ok=True)

SCRAPE_TARGETS = [
    {
        "id": "meta_ad_hp_smarttank",
        "brand": "HP",
        "channel": "Paid Media",
        "platform": "Meta Ad Library",
        "url": "https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=TH&q=HP%20Smart%20Tank&search_type=keyword_unordered&media_type=all",
        "wait_ms": 4000,
    },
    {
        "id": "meta_ad_epson_ecotank",
        "brand": "Epson",
        "channel": "Paid Media",
        "platform": "Meta Ad Library",
        "url": "https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=TH&q=Epson%20EcoTank&search_type=keyword_unordered&media_type=all",
        "wait_ms": 4000,
    },
    {
        "id": "meta_ad_canon_pixma",
        "brand": "Canon",
        "channel": "Paid Media",
        "platform": "Meta Ad Library",
        "url": "https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=TH&q=Canon%20MegaTank%20PIXMA&search_type=keyword_unordered&media_type=all",
        "wait_ms": 4000,
    },
    {
        "id": "meta_ad_brother_inktank",
        "brand": "Brother",
        "channel": "Paid Media",
        "platform": "Meta Ad Library",
        "url": "https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=TH&q=Brother%20Ink%20Tank&search_type=keyword_unordered&media_type=all",
        "wait_ms": 4000,
    },
    {
        "id": "google_ads_hp_thailand",
        "brand": "HP",
        "channel": "Paid Media",
        "platform": "Google Ads Transparency",
        "url": "https://adstransparency.google.com/?region=TH&query=HP%20printer",
        "wait_ms": 4000,
    },
    {
        "id": "google_ads_epson_thailand",
        "brand": "Epson",
        "channel": "Paid Media",
        "platform": "Google Ads Transparency",
        "url": "https://adstransparency.google.com/?region=TH&query=Epson%20printer",
        "wait_ms": 4000,
    },
    {
        "id": "social_fb_hp_thailand",
        "brand": "HP",
        "channel": "Social",
        "platform": "Facebook",
        "url": "https://www.facebook.com/HPThailand/",
        "wait_ms": 3000,
        "dismiss_modal": True,
    },
    {
        "id": "social_fb_epson_thailand",
        "brand": "Epson",
        "channel": "Social",
        "platform": "Facebook",
        "url": "https://www.facebook.com/epsonthailand/",
        "wait_ms": 3000,
        "dismiss_modal": True,
    },
    {
        "id": "social_fb_canon_thailand",
        "brand": "Canon",
        "channel": "Social",
        "platform": "Facebook",
        "url": "https://www.facebook.com/canon.thailand/",
        "wait_ms": 3000,
        "dismiss_modal": True,
    },
    {
        "id": "social_fb_brother_thailand",
        "brand": "Brother",
        "channel": "Social",
        "platform": "Facebook",
        "url": "https://www.facebook.com/BrotherCommercialThailand/",
        "wait_ms": 3000,
        "dismiss_modal": True,
    },
    {
        "id": "ecom_shopee_hp_smarttank",
        "brand": "HP",
        "channel": "E-commerce",
        "platform": "Shopee",
        "url": "https://shopee.co.th/search?keyword=hp%20smart%20tank",
        "wait_ms": 3000,
    },
    {
        "id": "ecom_shopee_epson_ecotank",
        "brand": "Epson",
        "channel": "E-commerce",
        "platform": "Shopee",
        "url": "https://shopee.co.th/search?keyword=epson%20ecotank",
        "wait_ms": 3000,
    }
]

def capture_all():
    print(f"[*] Starting real browser screenshot capture for {len(SCRAPE_TARGETS)} verified targets...")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={"width": 1280, "height": 800},
            user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
            locale="en-US"
        )

        results = {}
        for target in SCRAPE_TARGETS:
            target_id = target["id"]
            url = target["url"]
            out_file = f"{OUTPUT_DIR}/{target_id}.png"
            page = context.new_page()

            print(f"\n--> Capturing [{target['brand']}] {target['platform']}: {url}")
            try:
                page.goto(url, timeout=20000, wait_until="domcontentloaded")
                time.sleep(target.get("wait_ms", 3000) / 1000.0)

                # Dismiss login modal or popups if present
                if target.get("dismiss_modal"):
                    try:
                        page.keyboard.press("Escape")
                        time.sleep(0.5)
                        # Try clicking close buttons if any
                        close_btn = page.query_selector('div[aria-label="Close"], div[aria-label="close"], [aria-label="Decline optional cookies"]')
                        if close_btn:
                            close_btn.click()
                            time.sleep(0.5)
                    except Exception:
                        pass

                page.screenshot(path=out_file, full_page=False)
                size_kb = os.path.getsize(out_file) / 1024.0
                print(f"    ✓ SUCCESS: Saved {out_file} ({size_kb:.1f} KB)")
                results[target_id] = {
                    "path": f"/screenshots/ads/{target_id}.png",
                    "brand": target["brand"],
                    "platform": target["platform"],
                    "channel": target["channel"],
                    "status": "CAPTURED",
                    "size_kb": round(size_kb, 1)
                }
            except Exception as err:
                print(f"    ✗ FAILED: {err}")
            finally:
                page.close()

        browser.close()
    
    print("\n" + "="*60)
    print(f"[*] Complete! {len(results)} browser screenshots captured.")
    return results

if __name__ == "__main__":
    capture_all()
