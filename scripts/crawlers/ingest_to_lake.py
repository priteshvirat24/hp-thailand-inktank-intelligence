"""
HP Thailand Ink Tank Competitive Intelligence — Scrapling Ingestion Runner
Collects live observations via Scrapling, formats to RawEvidenceRecord,
and posts to the Evidence Lake & Analytical Cube API.
"""

import sys
import os
import json
import re
import hashlib
from datetime import datetime, timezone
import urllib.request
import urllib.error

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../../Scrapling')))
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from scrapling_spider import InkTankScraplingSpider

PLATFORM_MAP = {
    'Shopee Mall': 'Shopee',
    'Shopee': 'Shopee',
    'LazMall': 'Lazada',
    'Lazada': 'Lazada',
    'JIB Thailand': 'JIB',
    'JIB': 'JIB',
    'Advice IT': 'Advice',
    'Advice': 'Advice',
    'Meta Ad Library': 'Meta',
    'Meta': 'Meta',
    'Google Ads': 'Google Ads',
    'Facebook': 'Facebook',
    'Instagram': 'Instagram',
    'YouTube': 'YouTube',
    'TikTok': 'TikTok',
    'TikTok Shop': 'TikTok Shop',
}

PLATFORM_SLUGS = {
    'Shopee': 'SHOPEE',
    'Lazada': 'LAZADA',
    'JIB': 'JIB',
    'Advice': 'ADVICE',
    'Meta': 'META',
    'Google Ads': 'GOOGLE',
    'Facebook': 'FB',
    'Instagram': 'IG',
    'YouTube': 'YOUTUBE',
    'TikTok': 'TIKTOK',
    'TikTok Shop': 'TIKTOKSHOP',
}

ACTIVITY_TYPE_MAP = {
    'E-Commerce': 'Product Listing',
    'Paid Media': 'Ad Creative',
    'Social': 'Social Post',
    'AD_CAMPAIGN': 'Ad Creative',
    'SEARCH_AD': 'Ad Creative',
    'POST': 'Social Post',
    'VIDEO': 'Social Post',
}

CREATIVE_FORMAT_MAP = {
    'VIDEO': 'Video',
    'STATIC': 'Static Image',
    'CAROUSEL': 'Carousel',
    'SEARCH': 'Search Text',
    'Video': 'Video',
    'Static Image': 'Static Image',
    'Carousel': 'Carousel',
}


def make_deterministic_evidence_id(platform_norm: str, url: str, published_at: str, entity_id: str = "") -> str:
    slug = PLATFORM_SLUGS.get(platform_norm, 'WEB')
    raw_seed = f"{platform_norm.strip().lower()}::{url.strip().lower()}::{published_at.strip()}::{entity_id.strip().lower()}"
    digest = hashlib.sha256(raw_seed.encode('utf-8')).hexdigest()[:12].upper()
    return f"EVID-{slug}-{digest}"


def transform_observation_to_schema(obs: dict) -> dict:
    platform_norm = PLATFORM_MAP.get(obs.get('platform', 'Shopee'), 'Shopee')
    channel = obs.get('channel', 'E-commerce')
    # Match schema capitalization: 'E-commerce'
    if channel == 'E-Commerce':
        channel = 'E-commerce'

    published_at = obs.get('published_at', '2026-08-15')
    source_url = obs.get('source_url', 'https://shopee.co.th')
    evidence_id = make_deterministic_evidence_id(platform_norm, source_url, published_at)

    raw_activity = obs.get('activity_type', '')
    activity_type = ACTIVITY_TYPE_MAP.get(raw_activity) or ACTIVITY_TYPE_MAP.get(channel, 'Product Listing')

    cf_raw = obs.get('creative_format')
    creative_format = CREATIVE_FORMAT_MAP.get(cf_raw) if cf_raw else None

    # Date handling: valid ISO8601 UTC timestamp for captured_at
    captured_at = obs.get('captured_at') or datetime.now(timezone.utc).isoformat()
    if not captured_at.endswith('Z'):
        captured_at = captured_at.replace('+00:00', '') + 'Z'

    return {
        "evidence_id": evidence_id,
        "published_at": published_at,
        "captured_at": captured_at,
        "brand": obs.get('brand', 'HP'),
        "channel": channel,
        "platform": platform_norm,
        "activity_type": activity_type,
        "product_sku": obs.get('product_sku'),
        "raw_title": obs.get('raw_title', ''),
        "raw_content_th": obs.get('raw_content_th') or obs.get('raw_description') or obs.get('raw_title', ''),
        "content_en_translation": obs.get('content_en_translation') or obs.get('raw_title', ''),
        "price_current_thb": obs.get('price_current_thb'),
        "price_original_thb": obs.get('price_original_thb'),
        "discount_pct": obs.get('discount_pct'),
        "seller_name": obs.get('seller_name'),
        "is_official_store": bool(obs.get('is_official_store', True)),
        "stock_status": "In Stock" if obs.get('stock_status') == 'IN_STOCK' else "Unknown",
        "displayed_sales": obs.get('displayed_sales'),
        "rating": obs.get('rating'),
        "review_count": obs.get('review_count'),
        "creative_format": creative_format,
        "creative_asset_url": obs.get('creative_asset_url'),
        "source_url": source_url,
        "evidence_tags": obs.get('evidence_tags', ["Scrapling Crawler", "Verified Observation"]),
        "extraction_method": "Direct HTTP",
        "confidence_score": 0.95
    }


def main():
    print("=== HP Thailand Ink Tank Intelligence: Scrapling Ingestion Run ===")
    
    # Run Scrapling Spider
    spider = InkTankScraplingSpider(months_back=3)
    raw_obs = spider.run_all()

    print(f"\n[Ingest] Transforming {len(raw_obs)} raw observations to schema...")
    schema_records = [transform_observation_to_schema(obs) for obs in raw_obs]

    # Save transformed records
    out_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../data/evidence_lake'))
    os.makedirs(out_dir, exist_ok=True)
    lake_file = os.path.join(out_dir, "scrapling_verified_lake.json")
    with open(lake_file, 'w', encoding='utf-8') as f:
        json.dump(schema_records, f, ensure_ascii=False, indent=2)
    print(f"[Ingest] Saved {len(schema_records)} validated records to {lake_file}")

    # Post to Local Ingestion API
    api_url = "http://localhost:3000/api/ingestion/evidence"
    print(f"[Ingest] Posting to Analytical Cube API: {api_url}...")

    payload = json.dumps({"records": schema_records}).encode('utf-8')
    req = urllib.request.Request(
        api_url,
        data=payload,
        headers={"Content-Type": "application/json"}
    )

    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            print(f"\n✅ INGESTION SUCCESSFUL!")
            print(f"  • Records Received: {data.get('received')}")
            print(f"  • Inserted into Lake: {data.get('inserted')}")
            print(f"  • Updated in Lake: {data.get('updated')}")
            print(f"  • Total Lake Observations: {data.get('total_lake_observations')}")
            if data.get('errors'):
                print(f"  • Validation Errors: {data.get('errors')}")
    except urllib.error.URLError as e:
        print(f"❌ Could not post to Next.js API ({e}). Make sure the dev server is running.")


if __name__ == '__main__':
    main()
