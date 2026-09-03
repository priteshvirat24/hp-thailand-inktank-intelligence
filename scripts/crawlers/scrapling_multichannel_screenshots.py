#!/usr/bin/env python3
"""
HP Thailand Ink Tank — Comprehensive Multi-Channel Scrapling Screenshot Scraper (Wave 2)
Captures real browser screenshots from:
  1. E-Commerce product listing pages (Shopee Mall, JIB, Lazada, Power Buy)
  2. Brand official social/YouTube pages
  3. Review pages on Shopee & Lazada
  4. Google Shopping Thailand

Saves PNGs into public/screenshots/{channel}/ and writes a manifest JSON
at data/evidence_lake/screenshot_manifest.json so that the evidence lake
loader can attach screenshot_url to matching records.
"""

import sys
import os
import json
import time
from datetime import datetime

sys.path.insert(0, "/Users/priteshhome/InkTank-analysis /Scrapling")
from scrapling import DynamicFetcher

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '../..'))
MANIFEST_PATH = os.path.join(BASE_DIR, 'data/evidence_lake/screenshot_manifest.json')

DIRS = {
    'ecommerce': os.path.join(BASE_DIR, 'public/screenshots/ecommerce'),
    'social':    os.path.join(BASE_DIR, 'public/screenshots/social'),
    'reviews':   os.path.join(BASE_DIR, 'public/screenshots/reviews'),
    'shopping':  os.path.join(BASE_DIR, 'public/screenshots/shopping'),
}
for d in DIRS.values():
    os.makedirs(d, exist_ok=True)


def log(msg):
    ts = datetime.now().strftime('%H:%M:%S')
    print(f"[{ts}] {msg}", flush=True)


def make_action(save_path, wait_s=5, scroll_px=800, viewport=(1440, 900)):
    def action(page):
        page.set_viewport_size({"width": viewport[0], "height": viewport[1]})
        time.sleep(wait_s)
        if scroll_px > 0:
            page.evaluate(f"window.scrollBy(0, {scroll_px})")
            time.sleep(1.5)
            page.evaluate("window.scrollTo(0, 0)")
            time.sleep(0.8)
        page.screenshot(path=save_path, full_page=False)
        size_kb = os.path.getsize(save_path) / 1024.0
        log(f"  OK  Saved: {os.path.basename(save_path)} ({size_kb:.1f} KB)")
    return action


TARGETS = []

# 1. Shopee Mall Thailand
for brand, query, slug in [
    ("HP",      "HP%20Smart%20Tank",       "shopee_mall_hp"),
    ("Epson",   "Epson%20EcoTank",         "shopee_mall_epson"),
    ("Canon",   "Canon%20MegaTank",        "shopee_mall_canon"),
    ("Brother", "Brother%20InkBenefit",    "shopee_mall_brother"),
]:
    TARGETS.append({
        "id": slug, "brand": brand, "channel": "E-Commerce", "platform": "Shopee Mall",
        "url": f"https://shopee.co.th/search?keyword={query}&is_official_shop=1",
        "file": os.path.join(DIRS['ecommerce'], f"{slug}.png"),
        "screenshot_url": f"/screenshots/ecommerce/{slug}.png",
        "wait_s": 9, "scroll_px": 1200, "viewport": (1440, 900),
    })

# 2. JIB Thailand
for brand, query, slug in [
    ("HP",      "HP+Smart+Tank",     "jib_hp"),
    ("Epson",   "Epson+EcoTank",     "jib_epson"),
    ("Canon",   "Canon+PIXMA+G",     "jib_canon"),
    ("Brother", "Brother+DCP-T",     "jib_brother"),
]:
    TARGETS.append({
        "id": slug, "brand": brand, "channel": "E-Commerce", "platform": "JIB Thailand",
        "url": f"https://www.jib.co.th/web/product/product_search/0?str_search={query}",
        "file": os.path.join(DIRS['ecommerce'], f"{slug}.png"),
        "screenshot_url": f"/screenshots/ecommerce/{slug}.png",
        "wait_s": 6, "scroll_px": 800, "viewport": (1440, 900),
    })

# 3. Lazada Thailand
for brand, query, slug in [
    ("HP",      "hp%20smart%20tank",         "lazada_hp"),
    ("Epson",   "epson%20ecotank",           "lazada_epson"),
    ("Canon",   "canon%20pixma%20g",         "lazada_canon"),
    ("Brother", "brother%20dcp-t",           "lazada_brother"),
]:
    TARGETS.append({
        "id": slug, "brand": brand, "channel": "E-Commerce", "platform": "LazMall Thailand",
        "url": f"https://www.lazada.co.th/catalog/?q={query}&isStore=y",
        "file": os.path.join(DIRS['ecommerce'], f"{slug}.png"),
        "screenshot_url": f"/screenshots/ecommerce/{slug}.png",
        "wait_s": 8, "scroll_px": 1000, "viewport": (1440, 900),
    })

# 4. Power Buy Thailand
for brand, query, slug in [
    ("HP",      "HP+Smart+Tank",      "powerbuy_hp"),
    ("Epson",   "Epson+EcoTank",      "powerbuy_epson"),
    ("Canon",   "Canon+PIXMA+G",      "powerbuy_canon"),
    ("Brother", "Brother+DCP-T",      "powerbuy_brother"),
]:
    TARGETS.append({
        "id": slug, "brand": brand, "channel": "E-Commerce", "platform": "Power Buy",
        "url": f"https://www.powerbuy.co.th/en/product/search/all/?keywords={query}",
        "file": os.path.join(DIRS['ecommerce'], f"{slug}.png"),
        "screenshot_url": f"/screenshots/ecommerce/{slug}.png",
        "wait_s": 6, "scroll_px": 600, "viewport": (1440, 900),
    })

# 5. YouTube official channels
for brand, url, slug in [
    ("HP",      "https://www.youtube.com/@HPThailand/videos",        "youtube_hp"),
    ("Epson",   "https://www.youtube.com/@EpsonThailand/videos",     "youtube_epson"),
    ("Canon",   "https://www.youtube.com/@CanonThailandTH/videos",   "youtube_canon"),
    ("Brother", "https://www.youtube.com/@brotherthailand/videos",   "youtube_brother"),
]:
    TARGETS.append({
        "id": slug, "brand": brand, "channel": "Social", "platform": "YouTube",
        "url": url,
        "file": os.path.join(DIRS['social'], f"{slug}.png"),
        "screenshot_url": f"/screenshots/social/{slug}.png",
        "wait_s": 7, "scroll_px": 600, "viewport": (1440, 900),
    })

# 6. Facebook brand pages
for brand, url, slug in [
    ("HP",      "https://www.facebook.com/HPThailand",      "facebook_hp"),
    ("Epson",   "https://www.facebook.com/EpsonThailand",   "facebook_epson"),
    ("Canon",   "https://www.facebook.com/canonthailand",   "facebook_canon"),
    ("Brother", "https://www.facebook.com/BrotherThailand", "facebook_brother"),
]:
    TARGETS.append({
        "id": slug, "brand": brand, "channel": "Social", "platform": "Facebook",
        "url": url,
        "file": os.path.join(DIRS['social'], f"{slug}.png"),
        "screenshot_url": f"/screenshots/social/{slug}.png",
        "wait_s": 7, "scroll_px": 800, "viewport": (1440, 900),
    })

# 7. TikTok brand search
for brand, query, slug in [
    ("HP",      "HP+Smart+Tank+Thailand",      "tiktok_hp"),
    ("Epson",   "Epson+EcoTank+Thailand",      "tiktok_epson"),
    ("Canon",   "Canon+PIXMA+MegaTank",        "tiktok_canon"),
    ("Brother", "Brother+Ink+Tank+Thailand",   "tiktok_brother"),
]:
    TARGETS.append({
        "id": slug, "brand": brand, "channel": "Social", "platform": "TikTok",
        "url": f"https://www.tiktok.com/search?q={query}",
        "file": os.path.join(DIRS['social'], f"{slug}.png"),
        "screenshot_url": f"/screenshots/social/{slug}.png",
        "wait_s": 8, "scroll_px": 600, "viewport": (1280, 900),
    })

# 8. Shopee Reviews (rated 4+)
for brand, query, slug in [
    ("HP",      "HP%20Smart%20Tank",    "review_shopee_hp"),
    ("Epson",   "Epson%20EcoTank",      "review_shopee_epson"),
    ("Canon",   "Canon%20PIXMA%20G",    "review_shopee_canon"),
    ("Brother", "Brother%20DCP-T",      "review_shopee_brother"),
]:
    TARGETS.append({
        "id": slug, "brand": brand, "channel": "Review", "platform": "Shopee Reviews",
        "url": f"https://shopee.co.th/search?keyword={query}&rating_filter=4",
        "file": os.path.join(DIRS['reviews'], f"{slug}.png"),
        "screenshot_url": f"/screenshots/reviews/{slug}.png",
        "wait_s": 8, "scroll_px": 900, "viewport": (1440, 900),
    })

# 9. Google Shopping Thailand
for brand, query, slug in [
    ("HP",      "HP+Smart+Tank+เครื่องพิมพ์",      "google_shopping_hp"),
    ("Epson",   "Epson+EcoTank+เครื่องพิมพ์",      "google_shopping_epson"),
    ("Canon",   "Canon+PIXMA+G+เครื่องพิมพ์",      "google_shopping_canon"),
    ("Brother", "Brother+DCP-T+เครื่องพิมพ์",      "google_shopping_brother"),
]:
    TARGETS.append({
        "id": slug, "brand": brand, "channel": "E-Commerce", "platform": "Google Shopping",
        "url": f"https://www.google.co.th/search?tbm=shop&q={query}&gl=th&hl=th",
        "file": os.path.join(DIRS['shopping'], f"{slug}.png"),
        "screenshot_url": f"/screenshots/shopping/{slug}.png",
        "wait_s": 5, "scroll_px": 600, "viewport": (1440, 900),
    })


def run():
    log(f"[START] Multi-Channel Screenshot Capture — {len(TARGETS)} targets")
    manifest = []
    successes, failures = 0, 0

    for i, t in enumerate(TARGETS, 1):
        log(f"\n[{i}/{len(TARGETS)}] [{t['channel']}] [{t['brand']}] {t['platform']}")

        if os.path.exists(t['file']) and os.path.getsize(t['file']) > 20_000:
            kb = os.path.getsize(t['file']) // 1024
            log(f"  SKIP  Already captured ({kb} KB)")
            manifest.append({**t, "status": "already_captured", "file_size_kb": kb,
                              "captured_at": datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%SZ')})
            successes += 1
            continue

        try:
            DynamicFetcher.fetch(
                t["url"],
                page_action=make_action(t["file"], t.get("wait_s", 5),
                                        t.get("scroll_px", 600), t.get("viewport", (1440, 900))),
                headless=True,
            )
            size_kb = round(os.path.getsize(t["file"]) / 1024, 1) if os.path.exists(t["file"]) else 0
            manifest.append({**t, "status": "captured", "file_size_kb": size_kb,
                              "captured_at": datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%SZ')})
            successes += 1
        except Exception as e:
            log(f"  FAIL  {e}")
            manifest.append({**t, "status": "failed", "error": str(e),
                              "captured_at": datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%SZ')})
            failures += 1

    os.makedirs(os.path.dirname(MANIFEST_PATH), exist_ok=True)
    # Serialise manifest (remove non-JSON-safe 'file' key)
    clean = [{k: v for k, v in m.items() if k != 'file'} for m in manifest]
    with open(MANIFEST_PATH, 'w') as f:
        json.dump(clean, f, indent=2, ensure_ascii=False)

    log(f"\n{'='*65}")
    log(f"DONE: {successes}/{len(TARGETS)} captures OK  |  {failures} failed")
    log(f"Manifest -> {MANIFEST_PATH}")
    log(f"{'='*65}")
    return manifest


if __name__ == '__main__':
    run()
