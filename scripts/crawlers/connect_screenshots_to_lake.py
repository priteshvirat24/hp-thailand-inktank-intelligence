#!/usr/bin/env python3
"""
Screenshot ↔ Evidence Lake Connector
Reads data/evidence_lake/screenshot_manifest.json and
data/evidence_lake/scrapling_verified_lake.json, then patches
screenshot_url onto matching records by channel + brand + platform.
Writes the updated lake back and re-syncs via the Next.js API.
"""
import sys, os, json, urllib.request, urllib.error
sys.path.insert(0, "/Users/priteshhome/InkTank-analysis /Scrapling")

BASE = "/Users/priteshhome/InkTank-analysis "
LAKE_PATH     = os.path.join(BASE, "data/evidence_lake/scrapling_verified_lake.json")
MANIFEST_PATH = os.path.join(BASE, "data/evidence_lake/screenshot_manifest.json")

def log(msg): print(f"[connector] {msg}", flush=True)

def platform_matches(rec_platform: str, manifest_platform: str) -> bool:
    rp = rec_platform.lower()
    mp = manifest_platform.lower()
    if rp == mp:
        return True
    mappings = {
        "shopee mall":          ["shopee mall", "shopee"],
        "lazmall thailand":     ["lazmall", "lazada"],
        "jib thailand":         ["jib"],
        "power buy":            ["power buy", "powerbuy"],
        "youtube":              ["youtube"],
        "facebook":             ["facebook"],
        "tiktok":               ["tiktok"],
        "shopee reviews":       ["shopee review", "review"],
        "google shopping":      ["google shopping"],
        "meta":                 ["meta", "meta ad library"],
        "google ads":           ["google ads", "google ads transparency"],
    }
    for canon, aliases in mappings.items():
        if any(a in rp for a in aliases) and any(a in mp for a in aliases):
            return True
    return False


def main():
    if not os.path.exists(MANIFEST_PATH):
        log(f"No manifest found at {MANIFEST_PATH} — run scrapling_multichannel_screenshots.py first")
        return

    with open(LAKE_PATH, encoding="utf-8") as f:
        lake = json.load(f)

    with open(MANIFEST_PATH, encoding="utf-8") as f:
        manifest = json.load(f)

    # Build lookup: (brand.lower, platform_key) -> screenshot_url
    lookup = {}
    for m in manifest:
        if m.get("status") in ("captured", "already_captured") and m.get("screenshot_url"):
            key = (m["brand"].lower(), m["platform"].lower())
            lookup[key] = {
                "screenshot_url": m["screenshot_url"],
                "channel": m["channel"],
                "platform": m["platform"],
            }
            log(f"  Manifest entry: {m['brand']} / {m['platform']} → {m['screenshot_url']}")

    updated = 0
    for rec in lake:
        if rec.get("screenshot_url"):  # already set (e.g., Paid Media from Wave 1)
            continue
        brand = rec.get("brand", "").lower()
        rec_platform = rec.get("platform", "")
        # Try exact key first, then fuzzy
        matched = None
        for (mb, mp), info in lookup.items():
            if mb == brand and platform_matches(rec_platform, mp):
                matched = info
                break
        if matched:
            rec["screenshot_url"] = matched["screenshot_url"]
            updated += 1

    log(f"\nPatched screenshot_url on {updated}/{len(lake)} records in the lake.")

    with open(LAKE_PATH, "w", encoding="utf-8") as f:
        json.dump(lake, f, ensure_ascii=False, indent=2)
    log(f"Lake saved: {LAKE_PATH}")

    # Sync to Next.js API
    try:
        payload = json.dumps(lake).encode("utf-8")
        req = urllib.request.Request(
            "http://localhost:3000/api/evidence/ingest",
            data=payload,
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=30) as resp:
            body = json.loads(resp.read())
            log(f"Lake API sync: {body}")
    except Exception as e:
        log(f"API sync skipped (server may not be running): {e}")

    log("Done.")


if __name__ == "__main__":
    main()
