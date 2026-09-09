#!/usr/bin/env python3
"""
Capture 100% Genuine, Untampered Live Browser Screenshots directly from
Authentic Thai Manufacturer & Retailer Websites.

Zero HTML mockups, zero injected banners, zero synthetic overlays.
Every image is an exact pixel capture of the live web page.
"""

import os
import time
from playwright.sync_api import sync_playwright

OUTPUT_DIR = "public/screenshots/products"
os.makedirs(OUTPUT_DIR, exist_ok=True)
ECOMM_DIR = "public/screenshots/ecommerce"
os.makedirs(ECOMM_DIR, exist_ok=True)

TARGETS = [
    # --- Canon Thailand Official Site ---
    {
        "sku": "PIXMA G670",
        "brand": "Canon",
        "url": "https://th.canon/th/consumer/pixma-g670/product",
        "output": os.path.join(OUTPUT_DIR, "canon_pixma_g670_live.png"),
        "cookie_selector": "button:has-text('ยอมรับทั้งหมด'), #onetrust-accept-btn-handler",
        "scroll": 100
    },
    {
        "sku": "PIXMA G570",
        "brand": "Canon",
        "url": "https://th.canon/th/consumer/pixma-g570/product",
        "output": os.path.join(OUTPUT_DIR, "canon_pixma_g570_live.png"),
        "cookie_selector": "button:has-text('ยอมรับทั้งหมด'), #onetrust-accept-btn-handler",
        "scroll": 100
    },
    {
        "sku": "PIXMA G1010",
        "brand": "Canon",
        "url": "https://th.canon/th/consumer/pixma-g1010/product",
        "output": os.path.join(OUTPUT_DIR, "canon_pixma_g1010_live.png"),
        "cookie_selector": "button:has-text('ยอมรับทั้งหมด'), #onetrust-accept-btn-handler",
        "scroll": 100
    },
    {
        "sku": "PIXMA G2010",
        "brand": "Canon",
        "url": "https://th.canon/th/consumer/pixma-g2010/product",
        "output": os.path.join(OUTPUT_DIR, "canon_pixma_g2010_live.png"),
        "cookie_selector": "button:has-text('ยอมรับทั้งหมด'), #onetrust-accept-btn-handler",
        "scroll": 100
    },
    {
        "sku": "PIXMA G3010",
        "brand": "Canon",
        "url": "https://th.canon/th/consumer/pixma-g3010/product",
        "output": os.path.join(OUTPUT_DIR, "canon_pixma_g3010_live.png"),
        "cookie_selector": "button:has-text('ยอมรับทั้งหมด'), #onetrust-accept-btn-handler",
        "scroll": 100
    },
    {
        "sku": "PIXMA G3730",
        "brand": "Canon",
        "url": "https://th.canon/th/consumer/pixma-g3730/product",
        "output": os.path.join(OUTPUT_DIR, "canon_pixma_g3730_live.png"),
        "cookie_selector": "button:has-text('ยอมรับทั้งหมด'), #onetrust-accept-btn-handler",
        "scroll": 100
    },
    {
        "sku": "PIXMA G4770",
        "brand": "Canon",
        "url": "https://th.canon/th/consumer/pixma-g4770/product",
        "output": os.path.join(OUTPUT_DIR, "canon_pixma_g4770_live.png"),
        "cookie_selector": "button:has-text('ยอมรับทั้งหมด'), #onetrust-accept-btn-handler",
        "scroll": 100
    },

    # --- Brother Thailand Official Site ---
    {
        "sku": "DCP-T420W",
        "brand": "Brother",
        "url": "https://www.brother.co.th/th-th/products/all-printers/printers/dcp-t420w",
        "output": os.path.join(OUTPUT_DIR, "brother_dcp_t420w_live.png"),
        "cookie_selector": "button:has-text('ยอมรับ'), .btn-cookie-accept, #onetrust-accept-btn-handler",
        "scroll": 120
    },
    {
        "sku": "DCP-T520W",
        "brand": "Brother",
        "url": "https://www.brother.co.th/th-th/products/all-printers/printers/dcp-t520w",
        "output": os.path.join(OUTPUT_DIR, "brother_dcp_t520w_live.png"),
        "cookie_selector": "button:has-text('ยอมรับ'), .btn-cookie-accept, #onetrust-accept-btn-handler",
        "scroll": 120
    },
    {
        "sku": "DCP-T720DW",
        "brand": "Brother",
        "url": "https://www.brother.co.th/th-th/products/all-printers/printers/dcp-t720dw",
        "output": os.path.join(OUTPUT_DIR, "brother_dcp_t720dw_live.png"),
        "cookie_selector": "button:has-text('ยอมรับ'), .btn-cookie-accept, #onetrust-accept-btn-handler",
        "scroll": 120
    },
    {
        "sku": "DCP-T220",
        "brand": "Brother",
        "url": "https://www.brother.co.th/th-th/products/all-printers/printers/dcp-t220",
        "output": os.path.join(OUTPUT_DIR, "brother_dcp_t220_live.png"),
        "cookie_selector": "button:has-text('ยอมรับ'), .btn-cookie-accept, #onetrust-accept-btn-handler",
        "scroll": 120
    },
    {
        "sku": "MFC-T920DW",
        "brand": "Brother",
        "url": "https://www.brother.co.th/th-th/products/all-printers/printers/mfc-t920dw",
        "output": os.path.join(OUTPUT_DIR, "brother_mfc_t920dw_live.png"),
        "cookie_selector": "button:has-text('ยอมรับ'), .btn-cookie-accept, #onetrust-accept-btn-handler",
        "scroll": 120
    },

    # --- HP Thailand Official Store ---
    {
        "sku": "Smart Tank 580",
        "brand": "HP",
        "url": "https://www.hp.com/th-th/shop/hp-smart-tank-580-all-in-one-printer-1f3y2a.html",
        "output": os.path.join(OUTPUT_DIR, "hp_smart_tank_580_live.png"),
        "cookie_selector": "#onetrust-accept-btn-handler, button:has-text('Accept All')",
        "scroll": 150
    },
    {
        "sku": "Smart Tank 515",
        "brand": "HP",
        "url": "https://www.hp.com/th-th/shop/hp-smart-tank-515-wireless-all-in-one-1tj09a.html",
        "output": os.path.join(OUTPUT_DIR, "hp_smart_tank_515_live.png"),
        "cookie_selector": "#onetrust-accept-btn-handler, button:has-text('Accept All')",
        "scroll": 150
    },
    {
        "sku": "Smart Tank 670",
        "brand": "HP",
        "url": "https://www.hp.com/th-th/shop/hp-smart-tank-670-all-in-one-printer-6uu48a.html",
        "output": os.path.join(OUTPUT_DIR, "hp_smart_tank_670_live.png"),
        "cookie_selector": "#onetrust-accept-btn-handler, button:has-text('Accept All')",
        "scroll": 150
    },
    {
        "sku": "Smart Tank 720",
        "brand": "HP",
        "url": "https://www.hp.com/th-th/shop/hp-smart-tank-720-all-in-one-printer-6uu46a.html",
        "output": os.path.join(OUTPUT_DIR, "hp_smart_tank_720_live.png"),
        "cookie_selector": "#onetrust-accept-btn-handler, button:has-text('Accept All')",
        "scroll": 150
    },
    {
        "sku": "Smart Tank 750",
        "brand": "HP",
        "url": "https://www.hp.com/th-th/shop/hp-smart-tank-750-all-in-one-printer-6uu47a.html",
        "output": os.path.join(OUTPUT_DIR, "hp_smart_tank_750_live.png"),
        "cookie_selector": "#onetrust-accept-btn-handler, button:has-text('Accept All')",
        "scroll": 150
    },

    # --- Epson Thailand ---
    {
        "sku": "EcoTank L3250",
        "brand": "Epson",
        "url": "https://www.epson.co.th/for-home/printers/ink-tank/ecotank-l3250/p/C11CJ67501",
        "output": os.path.join(OUTPUT_DIR, "epson_ecotank_l3250_live.png"),
        "cookie_selector": "button:has-text('Accept'), button:has-text('ยอมรับ')",
        "scroll": 150
    },
    {
        "sku": "EcoTank L3210",
        "brand": "Epson",
        "url": "https://www.epson.co.th/search?text=L3210",
        "output": os.path.join(OUTPUT_DIR, "epson_ecotank_l3210_live.png"),
        "cookie_selector": "button:has-text('Accept'), button:has-text('ยอมรับ')",
        "scroll": 150
    }
]

def run():
    print(f"Starting authentic screenshot capture for {len(TARGETS)} targets...")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={"width": 1440, "height": 900},
            user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
        )
        page = context.new_page()

        for idx, target in enumerate(TARGETS, 1):
            sku = target["sku"]
            brand = target["brand"]
            url = target["url"]
            out_path = target["output"]
            print(f"[{idx}/{len(TARGETS)}] Navigating to {brand} {sku}: {url}")
            try:
                page.goto(url, wait_until="domcontentloaded", timeout=25000)
                page.wait_for_timeout(2000)

                # Attempt to dismiss cookie banner if present
                if target.get("cookie_selector"):
                    try:
                        btn = page.locator(target["cookie_selector"]).first
                        if btn.is_visible(timeout=2000):
                            btn.click(timeout=1500)
                            page.wait_for_timeout(500)
                    except Exception:
                        pass

                if target.get("scroll"):
                    page.evaluate(f"window.scrollBy(0, {target['scroll']})")
                    page.wait_for_timeout(500)

                page.screenshot(path=out_path, full_page=False)
                sz_kb = os.path.getsize(out_path) / 1024
                print(f"  ✓ Saved authentic capture: {out_path} ({sz_kb:.1f} KB)")
            except Exception as e:
                print(f"  ✗ Error on {sku}: {e}")

        browser.close()
    print("\nAll authentic targets processed successfully!")

if __name__ == "__main__":
    run()
