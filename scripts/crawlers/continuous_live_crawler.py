"""
Continuous Full-Scale Ecosystem Crawler Daemon
Continuously runs full multi-channel scraping across:
- Shopee Mall, LazMall, JIB Thailand, Advice IT, Power Buy, TikTok Shop
- Meta Ad Library, Google Ads Transparency Center
- Facebook, YouTube, TikTok Thailand
- All 65 Ink Tank printer models across June, July, August 2026
Streams real-time live events directly into data/logs/scrapling_live.log.
"""

import time
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../../Scrapling')))
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from scrape_full_ecosystem import build_full_ecosystem, log_live

CYCLE_INTERVAL_SECONDS = 300  # Poll every 5 minutes

def main():
    log_live("DAEMON", f"Continuous Full-Scale Ink Tank Crawler Daemon started. Polling every {CYCLE_INTERVAL_SECONDS}s.")
    cycle_num = 1

    while True:
        try:
            log_live("DAEMON", f"=== STARTING FULL ECOSYSTEM CRAWL CYCLE #{cycle_num} ===")
            records = build_full_ecosystem()
            log_live("DAEMON", f"=== CYCLE #{cycle_num} COMPLETE: Extracted and synchronized {len(records)} verified records ===")
            log_live("DAEMON", f"Sleeping for {CYCLE_INTERVAL_SECONDS}s until next ecosystem crawl...")
            cycle_num += 1
            time.sleep(CYCLE_INTERVAL_SECONDS)
        except KeyboardInterrupt:
            log_live("DAEMON", "Daemon stopped by operator.")
            break
        except Exception as e:
            log_live("ERROR ", f"Cycle #{cycle_num} error: {e}. Retrying in 20s...")
            time.sleep(20)

if __name__ == '__main__':
    main()
