"""
Python script to execute full visual QA via Playwright Chromium
"""
import os
import sys
import time
from playwright.sync_api import sync_playwright

ARTIFACT_DIR = "/Users/priteshhome/.gemini/antigravity-ide/brain/04b0e79b-1db4-433c-a394-5285d7bbb40a/screenshots"
os.makedirs(ARTIFACT_DIR, exist_ok=True)

def log(msg):
    print(msg, flush=True)

def run_qa():
    log("Starting Playwright Browser QA...")
    results = {}
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1440, "height": 900})
        page = context.new_page()

        # Step 1: Open Dashboard
        log("Navigating to http://localhost:3000...")
        page.goto("http://localhost:3000", wait_until="domcontentloaded", timeout=15000)
        page.wait_for_timeout(3000)

        # Step 2: Verify Executive Overview
        log("Checking Executive Overview...")
        takeaways_heading = page.query_selector("text=Executive Takeaways")
        results["Executive Takeaways Present"] = takeaways_heading is not None
        log(f"Executive Takeaways Present: {results['Executive Takeaways Present']}")

        kpi_text = page.inner_text("body")
        results["Dynamic Rating Visible"] = "AVG CONSUMER" in kpi_text
        log(f"Dynamic Rating Visible: {results['Dynamic Rating Visible']}")

        page.screenshot(path=f"{ARTIFACT_DIR}/01_executive_overview.png", full_page=False)
        log("Saved 01_executive_overview.png")

        # Step 3: Click Tab 7 (Insights & Recommendations)
        log("Clicking Tab 7 (Insights & Recommendations)...")
        tab7 = page.query_selector("button:has-text('7. Insights & Recommendations')")
        if tab7:
            tab7.click()
            page.wait_for_timeout(2000)
            results["Tab 7 Clickable"] = True
        else:
            page.click("text=7. Insights & Recommendations")
            page.wait_for_timeout(2000)
            results["Tab 7 Clickable"] = True

        page.screenshot(path=f"{ARTIFACT_DIR}/02_insights_section.png", full_page=False)
        log("Saved 02_insights_section.png")

        # Step 4: Verify 30-Second CEO Briefing View
        insights_cards = page.query_selector_all("text=Verified Finding")
        results["Insight Cards Count"] = len(insights_cards)
        log(f"Insight Cards Count: {len(insights_cards)}")

        # Step 5: Click "Observed vs Interpretation"
        log("Expanding Observed vs Interpretation...")
        toggle_btn = page.query_selector("button:has-text('Observed vs Interpretation')")
        if toggle_btn:
            toggle_btn.click()
            page.wait_for_timeout(1000)
            results["Observed vs Interpretation Expanded"] = True
            page.screenshot(path=f"{ARTIFACT_DIR}/03_observed_vs_interpretation.png", full_page=False)
            log("Saved 03_observed_vs_interpretation.png")
        else:
            results["Observed vs Interpretation Expanded"] = False

        # Step 6: Click "Inspect Raw Evidence"
        log("Opening Evidence Modal...")
        inspect_btn = page.query_selector("button:has-text('Inspect Raw Evidence')")
        if inspect_btn:
            inspect_btn.click()
            page.wait_for_timeout(2000)
            modal = page.query_selector("text=Evidence Audit Trail & Lineage") or page.query_selector("text=Lineage")
            results["Evidence Modal Opened"] = modal is not None
            page.screenshot(path=f"{ARTIFACT_DIR}/04_evidence_modal.png", full_page=False)
            log(f"Saved 04_evidence_modal.png (Modal Detected: {results['Evidence Modal Opened']})")

            # Close modal by clicking the explicit close button
            close_btn = page.query_selector("button[aria-label='Close modal']")
            if close_btn:
                close_btn.click()
            else:
                page.keyboard.press("Escape")
            page.wait_for_timeout(1000)
        else:
            results["Evidence Modal Opened"] = False

        # Step 7: Click "Strategic Matrix (SWOT)" View
        log("Switching to Strategic Matrix View...")
        matrix_btn = page.query_selector("button:has-text('Strategic Matrix')")
        if matrix_btn:
            matrix_btn.click()
            page.wait_for_timeout(1000)
            results["Strategic Matrix Clickable"] = True
            page.screenshot(path=f"{ARTIFACT_DIR}/05_strategic_matrix.png", full_page=False)
            log("Saved 05_strategic_matrix.png")
        else:
            results["Strategic Matrix Clickable"] = False

        # Step 8: Switch back to CEO pitch and test Brand Filter
        ceo_btn = page.query_selector("button:has-text('30-Second CEO Briefing')")
        if ceo_btn:
            ceo_btn.click()
            page.wait_for_timeout(1000)

        log("Testing Global Brand Filter: Canon...")
        canon_pill = page.query_selector("span:has-text('Canon')") or page.query_selector("text=Canon")
        if canon_pill:
            canon_pill.click()
            page.wait_for_timeout(2000)
            results["Canon Brand Filter Applied"] = True
            page.screenshot(path=f"{ARTIFACT_DIR}/06_brand_filter_canon.png", full_page=False)
            log("Saved 06_brand_filter_canon.png")
        else:
            results["Canon Brand Filter Applied"] = False

        # Step 9: Test Global Month Filter: June 2026
        log("Testing Global Month Filter: JUNE 2026...")
        june_pill = page.query_selector("#month-btn-2026-06") or page.query_selector("button:has-text('JUNE')")
        if june_pill:
            june_pill.click()
            page.wait_for_timeout(2000)
            results["June Month Filter Applied"] = True
            page.screenshot(path=f"{ARTIFACT_DIR}/07_month_filter_june.png", full_page=False)
            log("Saved 07_month_filter_june.png")
        else:
            results["June Month Filter Applied"] = False

        browser.close()

    log("\n--- QA Verification Results ---")
    for k, v in results.items():
        log(f" - {k}: {v}")

if __name__ == "__main__":
    run_qa()
