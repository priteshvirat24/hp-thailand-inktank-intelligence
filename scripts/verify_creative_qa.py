import time
import os
import sys
from playwright.sync_api import sync_playwright

ARTIFACT_DIR = "/Users/priteshhome/.gemini/antigravity-ide/brain/04b0e79b-1db4-433c-a394-5285d7bbb40a"
SCREENSHOT_DIR = os.path.join(ARTIFACT_DIR, "screenshots")
os.makedirs(SCREENSHOT_DIR, exist_ok=True)

def run_qa():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1600, "height": 1050})
        page = context.new_page()

        console_errors = []
        page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" else None)
        page.on("pageerror", lambda err: console_errors.append(str(err)))

        print("Navigating to http://localhost:3000...")
        page.goto("http://localhost:3000", wait_until="networkidle", timeout=60000)
        time.sleep(2)

        # Click on Section 3: Creative & Messaging Intelligence
        # In Navigation, let's find the button or link containing "Advertising" or "Creative"
        nav_buttons = page.query_selector_all("button, a")
        adv_nav = None
        for btn in nav_buttons:
            text = btn.inner_text()
            if "Creative & Messaging" in text or "Advertising" in text or "Creative Intelligence" in text:
                adv_nav = btn
                break

        if adv_nav:
            print("Clicking on Creative & Messaging Intelligence navigation item...")
            adv_nav.click()
            time.sleep(2)
        else:
            print("Could not locate specific nav button by text. Checking navigation pills...")

        # Scroll to show tab content
        page.evaluate("window.scrollBy(0, 520)")
        time.sleep(1)
        page.screenshot(path=os.path.join(SCREENSHOT_DIR, "16_creative_intel_ad_vault.png"), full_page=False)
        print("Captured 16_creative_intel_ad_vault.png")

        # Click on Tab 2: Messaging & Claims Matrix
        tab2 = page.query_selector("button:has-text('Messaging & Claims Matrix')")
        if tab2:
            tab2.click()
            time.sleep(1)
            page.evaluate("window.scrollBy(0, 100)")
            time.sleep(0.5)
            page.screenshot(path=os.path.join(SCREENSHOT_DIR, "17_creative_intel_claims_matrix.png"), full_page=False)
            print("Captured 17_creative_intel_claims_matrix.png")

        # Click on Tab 3: Audience & Geo Targeting
        tab3 = page.query_selector("button:has-text('Audience & Geo Targeting')")
        if tab3:
            tab3.click()
            time.sleep(1)
            page.evaluate("window.scrollBy(0, 100)")
            time.sleep(0.5)
            page.screenshot(path=os.path.join(SCREENSHOT_DIR, "18_creative_intel_audience_geo.png"), full_page=False)
            print("Captured 18_creative_intel_audience_geo.png")

        # Click on Tab 4: Channel Retailer Co-Ops
        tab4 = page.query_selector("button:has-text('Channel Retailer Co-Ops')")
        if tab4:
            tab4.click()
            time.sleep(1)
            page.evaluate("window.scrollBy(0, 100)")
            time.sleep(0.5)
            page.screenshot(path=os.path.join(SCREENSHOT_DIR, "19_creative_intel_retailer_coops.png"), full_page=False)
            print("Captured 19_creative_intel_retailer_coops.png")

        # Switch back to Tab 1 and open the Creative Inspection Modal
        tab1 = page.query_selector("button:has-text('Ad Creatives & Video Vault')")
        if tab1:
            tab1.click()
            time.sleep(1)

        # Click on the first "Analyze Creative" button
        analyze_btn = page.query_selector("button:has-text('Analyze Creative')")
        if analyze_btn:
            print("Opening Creative Inspection Modal...")
            analyze_btn.click()
            time.sleep(1.5)
            page.screenshot(path=os.path.join(SCREENSHOT_DIR, "20_creative_inspection_modal.png"), full_page=False)
            print("Captured 20_creative_inspection_modal.png")

        browser.close()

        print(f"\nBrowser QA completed. Console errors count: {len(console_errors)}")
        if console_errors:
            print("Errors:")
            for err in console_errors:
                print(f" - {err}")

if __name__ == "__main__":
    run_qa()
