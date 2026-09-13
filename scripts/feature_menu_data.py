"""
Shared Data Definitions for HP Thailand Ink Tank Competitive Intelligence POC
Enterprise Feature, Capability, Data-Cut Menu & Stakeholder Playbooks.

Used by both generate_feature_menu_docx.py and generate_feature_menu_html.py.
"""

metadata_rows = [
        ("Prepared For", "David Chiu (Head of Commercial Systems / Business Leadership)"),
        ("Analytical Scope", "HP vs. Epson, Canon, and Brother (Thailand Ink Tank Market)"),
        ("Analytical Window", "90 Days (28 May – 28 August 2026 / Canonical Focus: August 2026)"),
        ("Evidence Lake Size", "3,653 Immutable Records (100% Provenance, Zero Synthetic Scoring)")
    ]

tab_rows = [
        (
            "Tab 1: Executive Summary",
            "What is HP's top-line competitive posture in Thailand?",
            "4 Strategic Takeaways, 7-KPI Strip with '?' Tooltips, Competitor War Room 5-Axis Radar, 3-Month Shelf Share & Price Trajectory.",
            "Brand (All/HP/Epson/Canon/Brother), Month (Jun/Jul/Aug/All 90D), 5 Radar Axes.",
            "Managing Director, Business Unit VP"
        ),
        (
            "Tab 2: Visibility & SOV",
            "How loud is HP across digital touchpoints vs competitors?",
            "Touchpoint Volume Comparison (HP: 286 vs Epson: 375), Multi-Channel SOV Breakdown, 90-Day Trend Velocity Curve, Trace Evidence Modal.",
            "Channel (Paid/Social/E-Com/Reviews), Brand, Month-over-Month Velocity.",
            "Head of Marketing, Brand Managers"
        ),
        (
            "Tab 3: Creative & Messaging",
            "What ad formats, claims, and offers are competitors running?",
            "Unique In-Market Creatives vs All Flights Toggle, Format Split (Video/Static/Carousel), Live Ad Vault with Thai Copy + English Translation, Claims Battlecard.",
            "Format (Video/Image/Carousel), Mode (13 Unique Creatives vs 52 Campaign Flights), Brand.",
            "Creative Agencies, Media Planners"
        ),
        (
            "Tab 4: Promotions & Pricing",
            "Where is discounting occurring and who leads the price war?",
            "Digital Shelf Share (3,172 listings), Price Band Distribution (<4k, 4k-6k, >6k THB), Avg & Median Price Tracker, Discount Depth %, Retailer Mix.",
            "Retailer (Shopee/JIB), Price Tier, Discount Status, Brand.",
            "Commercial Director, Channel Pricing Leads"
        ),
        (
            "Tab 5: Product / SKU Push",
            "Which specific models are being pushed hardest in Thailand?",
            "13 Canonical Model Comparison, Spec Teardown Matrix (ISO ppm, Wi-Fi, Duplex), Bundled Page Yield, Head-to-Head SKU Battlecard.",
            "Brand, Product Tier (1-in-1, 3-in-1, 4-in-1), Wireless Connectivity.",
            "Product Marketing Managers, Category Leads"
        ),
        (
            "Tab 6: Consumer Sentiment",
            "What do Thai buyers actually say about reliability and ink?",
            "9 Thematic Sentiment Pillars, Verified Shopee Buyer Ratings (HP: 4.5★), Unrated Pantip Forum Customer Voice, Replaceable Printhead Advocacy.",
            "Theme (9 Pillars), Channel (Pantip vs Shopee), Brand, Polarity.",
            "Customer Experience (CX), Service Ops"
        ),
        (
            "Tab 7: Strategic Insights",
            "What concrete tactical actions should HP execute tomorrow?",
            "Multi-Cut Algorithmic Corroboration Engine, Confidence Badging (CORROBORATED / MULTI-CUT), High/Medium Priority Tags, Direct Evidence Tracing.",
            "Strategic Domain, Priority Level, Target Competitor.",
            "Strategy & Planning Leads"
        ),
        (
            "Tab 8: Evidence Lake",
            "Can every single number be audited to raw web captures?",
            "3,653 Immutable Record Browser, Full Extraction Timestamps, Raw Thai Text & Metadata View, CSV & JSON Export for Corporate BI.",
            "Channel, Brand, Extraction Method, Platform.",
            "Legal, Compliance & Data Audit Leads"
        ),
        (
            "Tab 9: Social Channels",
            "How do brand-owned YouTube and Facebook channels perform?",
            "187 Official Social Posts, Video View Tracking, Engagement Benchmarks, Content Theme Classification, Long vs Short Form Video Split.",
            "Platform (YouTube/Facebook), Post Format, Brand.",
            "Social Media & PR Leads"
        ),
        (
            "Tab 10: Web Intelligence",
            "How does the automated ingestion pipeline stay healthy?",
            "Scrapling Crawler Telemetry, Cloudflare & Shopee WAF Bypass Status, Response Latency (ms), HTTP 200 Success Rate, Checkpoint Logs.",
            "Target Domain, Extraction Technology, Crawler Health.",
            "Data Engineering, IT Infrastructure"
        ),
        (
            "Global Floating RAG Assistant",
            "Can leadership ask ad-hoc questions in plain English or Thai?",
            "Zero-Hallucination Conversational Grounding, Clickable Evidence Citations, Inline Metric Cards & Charts, Dynamic Follow-Up Prompts.",
            "Entire 3,653 Evidence Lake across all 4 brands, 4 channels, 3 months.",
            "All Stakeholders (Live Meeting Assistant)"
        )
    ]

recon_data = [
        ("E-Commerce Shelf", "3,172 listings", "1,036 listings", "Unique SKU × Store URL per Month", "100% Reconciled (HP: 196, Epson: 320, Canon: 280, Brother: 240)"),
        ("Social Media", "187 posts", "63 posts", "Unique Post ID per Official Channel", "100% Reconciled (YouTube: 92, Facebook: 95)"),
        ("Paid Media (Meta)", "156 flight obs", "52 flight obs", "13 Unique Concepts × 4 Weekly Flights/Mo", "100% Reconciled (HP: 16 flights / 4 unique concepts)"),
        ("Consumer Reviews", "138 reviews", "46 reviews", "Verified Buyer Reviews + Pantip Posts", "100% Reconciled (Shopee: 19 rated, Pantip: 119 unrated)"),
        ("TOTAL LAKE", "3,653 records", "1,197 records", "Multi-Stage Forensic Deduplication", "VERIFIED ZERO-DISCREPANCY")
    ]

tabs_detail = [
        {
            "num": "Tab 1",
            "title": "Executive Summary — What Matters?",
            "images": [
                {
                    "path": "/Users/priteshhome/InkTank-analysis /public/screenshots/scrapling_poc/overview.png",
                    "caption": "Figure 1a: Executive Summary Command Center (Scrapling Capture at 1440×960)",
                    "title": "Executive Summary Command Center & KPI Strip",
                    "components": [
                        "Top Navigation Bar: Workspace selector (1. Executive Summary active), Evidence Count badge (3,653), Live Scrapling Telemetry chip.",
                        "4 Strategic Takeaway Cards: Key findings covering price tier defense, video creative adoption, dealer co-op programs, and printhead maintenance advocacy.",
                        "7-KPI Horizontal Metric Strip: Total Touchpoints (286), Paid Media SOV (30.8%), Social SOV (26.7%), E-Commerce Shelf Share (18.9%), Avg Selling Price (5,733 THB), Avg Discount (24.0%), and Consumer Rating (4.5★).",
                        "Question Mark (?) Tooltip Triggers: Located on every KPI card to reveal exact mathematical formulas, data sources, and interpretive caveats.",
                        "Competitor War Room 5-Axis Radar Chart: Multi-dimensional benchmark comparing HP against Epson, Canon, and Brother across Shelf Share, Paid Ads, Social Reach, Value Pricing, and Customer Voice."
                    ],
                    "interpretation": "The executive summary confirms HP's balanced competitive posture: HP captures 30.8% Paid SOV (leading promotional share) and maintains a 5,733 THB average price point, defending mainstream value against Brother while maintaining a premium brand position.",
                    "business_impact": "Use this view with the Managing Director or Country Manager to provide a 60-second executive diagnosis of Thailand market performance before drilling into tactical tabs."
                },
                {
                    "path": "/Users/priteshhome/InkTank-analysis /public/screenshots/scrapling_poc/overview_kpi_tooltip.png",
                    "caption": "Figure 1b: Interactive Metric Definition & Formula Tooltip (Scrapling Capture)",
                    "title": "Interactive Metric Definition Popover ('?' Tooltip)",
                    "components": [
                        "Interactive Popover Dialog: Automatically displayed when hovering over or clicking any '?' question mark icon on the 7 KPI cards.",
                        "Formal Metric Title: 'Paid Media Share of Voice (%)'.",
                        "Core Definition & Formula: Clear explanation that Paid SOV measures brand share of verified active ad flight occurrences captured from Meta Ad Library Thailand.",
                        "Interpretive Disclaimer ('What this does NOT mean'): Explicitly clarifies that Paid SOV does NOT represent confidential financial ad spend or total consumer impressions.",
                        "Data Lineage Reference: Cites Meta Ad Library Thailand API as the sole immutable source."
                    ],
                    "interpretation": "This feature eliminates ambiguity during executive reviews, establishing complete transparency around metric definitions and preventing misinterpretation of digital presence metrics as financial ad spend.",
                    "business_impact": "Showcase this when meeting with Finance, Legal, or Market Research teams to demonstrate scientific rigor and audit readiness."
                },
                {
                    "path": "/Users/priteshhome/InkTank-analysis /public/screenshots/scrapling_poc/overview_radar_charts.png",
                    "caption": "Figure 1c: Competitor War Room Radar & 3-Month Trend Line (Scrapling Capture)",
                    "title": "Competitor War Room 5-Axis Radar & Trend Charts",
                    "components": [
                        "5-Axis Radar Visualization: Visualizes relative strengths across 5 core pillars: Shelf Share, Paid Ads, Social Reach, Value Pricing, and Customer Voice.",
                        "Multi-Brand Overlay: HP (Cyan), Epson (Indigo), Canon (Amber), Brother (Emerald).",
                        "3-Month Shelf Share Trajectory Line Chart: Tracks monthly shelf share from June to August 2026 across all 4 brands.",
                        "Price Movement Curve: Illustrates average selling price trends over the 90-day analytical window."
                    ],
                    "interpretation": "The radar chart illustrates that while Epson leads in shelf distribution (30.9%), HP dominates in Paid Advertising SOV and Customer Voice sentiment. Brother competes aggressively on price, while Canon occupies the entry-level bracket.",
                    "business_impact": "Demonstrates where HP has an uncontested right to win (printhead serviceability) and where channel pressure is required (digital shelf share expansion on JIB)."
                }
            ],
            "objective": "Provide senior executives with an instant, C-suite synthesis of Thailand Ink Tank market dynamics without information overload.",
            "features": [
                "4 Dynamic Strategic Takeaway Cards highlighting price gaps, creative shifts, channel co-op opportunities, and customer pain points.",
                "7-KPI Horizontal Strip displaying Total Touchpoints, Paid SOV, Social SOV, Shelf Share, Avg Selling Price, Avg Discount %, and Avg Rating.",
                "Hover-Over '?' Metric Definitions explaining exact formulas, interpretation guidelines, and caveats.",
                "Competitor War Room 5-Axis Radar benchmarking HP vs. competitors across 5 core dimensions.",
                "3-Month Shelf Share & Price Trend Chart tracking monthly movement from June to August 2026."
            ],
            "data_cuts": [
                "Brand Filter: ALL Brands, HP Only, Epson Only, Canon Only, Brother Only.",
                "Period Filter: June 2026, July 2026, August 2026, or ALL 3 Months (90 Days).",
                "Metric Dimension: 5 Radar Dimensions, 7 Top-Level KPIs, 4 Priority Takeaways."
            ],
            "caveats": [
                "Paid SOV reflects ad flight presence in Meta Ad Library; it does not reflect confidential financial ad spend.",
                "E-Commerce Shelf Share represents catalog distribution breadth on major retailers, not checkout GMV or unit volume."
            ],
            "playbook": {
                "audience": "Managing Director, Thailand General Manager & BU Vice Presidents",
                "core_question": "Are we winning or losing market ground in Thailand, and where must we invest?",
                "script": "1. Open Tab 1: Point to the 7-KPI Strip. Highlight HP's 30.8% Paid SOV leadership and 5,733 THB average price defense against Brother.\n"
                          "2. Hover over the Paid Media SOV and Avg Consumer Rating tooltips to demonstrate mathematical definitions and zero-synthetic integrity.\n"
                          "3. Reference the 5-Axis Radar: 'We dominate on customer satisfaction and ad reach. Our vulnerability is Epson's 30.9% catalog dominance on JIB. We must incentivize key online retailers to close this distribution gap.'",
                "objections": "If asked whether 30.8% Paid SOV means HP spent more dollars than Epson: 'No. As stated in our formula tooltip, this measures observable ad flight cadence in Meta Ad Library, proving our promotional agility and higher creative refreshment frequency.'"
            }
        },
        {
            "num": "Tab 2",
            "title": "Online Visibility & Share of Voice (SOV)",
            "images": [
                {
                    "path": "/Users/priteshhome/InkTank-analysis /public/screenshots/scrapling_poc/visibility.png",
                    "caption": "Figure 2a: Online Visibility & Share of Voice Multi-Channel Dashboard (Scrapling Capture)",
                    "title": "Online Visibility & Multi-Channel SOV Distribution",
                    "components": [
                        "Brand Touchpoint Volume Breakdown: HP (286), Epson (375), Canon (332), Brother (293) touchpoints in August 2026.",
                        "Multi-Channel SOV Bar Charts: Visualizes brand share across Paid Media (Meta), Brand Social (YouTube/FB), E-Commerce (JIB/Shopee), and Consumer Reviews.",
                        "90-Day Trend Velocity Line Chart: Displays touchpoint trajectory across June, July, and August 2026, showing HP's +25.4% velocity growth.",
                        "Channel Mix Percentage Stack: Displays the proportion of touchpoints originating from each digital channel.",
                        "Trace Evidence Links: Clickable buttons that immediately open the Evidence Lake supporting records for any selected bar."
                    ],
                    "interpretation": "While Epson leads gross touchpoint volume due to vast legacy catalog listings on JIB, HP achieves higher promotional intensity in active paid advertising (30.8% Paid SOV) and generates rapid month-over-month engagement gains.",
                    "business_impact": "Use with the Marketing Director to demonstrate that HP's marketing campaigns are cutting through noise and outperforming competitors in digital advertising share."
                },
                {
                    "path": "/Users/priteshhome/InkTank-analysis /public/screenshots/scrapling_poc/visibility_trend_detail.png",
                    "caption": "Figure 2b: 90-Day Trend Velocity Curves & Channel Comparison Grid (Scrapling Capture)",
                    "title": "90-Day Trend Velocity & Channel Breakdown Grid",
                    "components": [
                        "90-Day Touchpoint Velocity Curve: Illustrates monthly momentum from June (228) to July (252) to August (286) for HP.",
                        "Competitor Trajectory Curves: Shows Epson plateauing at ~375 touchpoints and Canon oscillating around ~330 touchpoints.",
                        "Detailed Channel Grid: Itemizes verified counts by Brand × Channel for immediate audit cross-referencing.",
                        "Interactive Filter Dropdown: Allows isolation of individual channels or temporal windows."
                    ],
                    "interpretation": "HP exhibits the steepest upward touchpoint velocity in the category (+25.4%), driven by aggressive August Back-to-School and 8.8 promotional campaigns.",
                    "business_impact": "Proves marketing momentum to brand leads and justifies continued digital media budget allocation."
                }
            ],
            "objective": "Quantify and compare the overall digital footprint of each brand across Thailand's digital ecosystem.",
            "features": [
                "Touchpoint Volume Comparison across HP, Epson, Canon, and Brother.",
                "Multi-Channel SOV Bar Breakdown comparing Paid, Social, and E-Commerce SOV.",
                "90-Day Trend Velocity Line Chart illustrating monthly trajectory.",
                "Interactive Evidence Trace opening supporting raw records."
            ],
            "data_cuts": [
                "Channel Split: Paid Media vs. Brand Social vs. E-Commerce vs. Consumer Review.",
                "Brand Focus: Compare 1 brand against category aggregate or inspect all 4 simultaneously.",
                "Temporal Shift: Month-over-month touchpoint gains and losses."
            ],
            "caveats": [
                "Touchpoints count verifiable digital presence occurrences; they do not count untracked third-party forum mentions outside Pantip."
            ],
            "playbook": {
                "audience": "Head of Marketing, Brand Managers & Media Planning Directors",
                "core_question": "Is our marketing budget generating sufficient digital share of voice across Thai channels?",
                "script": "1. Open Tab 2: Point to the Multi-Channel SOV bars. 'Look at our channel balance. While Epson relies heavily on legacy e-commerce listings, HP drives 30.8% of active Paid Media touchpoints.'\n"
                          "2. Examine the 90-Day Velocity Chart: 'Our touchpoint velocity rose from 228 in June to 286 in August (+25.4%). We are actively out-accelerating Canon and Brother.'\n"
                          "3. Click 'Trace Evidence' on the HP Paid bar to show the underlying Meta Ad Library flight records.",
                "objections": "If questioned why Epson has 375 touchpoints vs HP's 286: 'Epson lists 320 legacy product variations across JIB Thailand. However, in active consumer-facing advertising, HP leads with 30.8% Paid SOV.'"
            }
        },
        {
            "num": "Tab 3",
            "title": "Creative & Messaging Intelligence (Meta Ad Library)",
            "images": [
                {
                    "path": "/Users/priteshhome/InkTank-analysis /public/screenshots/scrapling_poc/advertising.png",
                    "caption": "Figure 3a: Creative & Messaging Intelligence — Unique In-Market Creatives View (Scrapling Capture)",
                    "title": "Creative Intelligence: Unique In-Market Creatives View (13 Concept Assets)",
                    "components": [
                        "View Toggle Buttons: Prominently displayed toggle between 'Unique In-Market Creatives (13 Concepts)' and 'All Campaign Flight Observations (52 Instances)'.",
                        "Data Reconciliation Callout Banner: Explains how 13 unique creative concepts map across 4 recurring flight cycles to produce 52 monthly observations.",
                        "Format Breakdown Bar Chart: Categorizes creative executions across Video (HP lead), Static Display Images, and Multi-Card Carousels.",
                        "Live Ad Creative Cards: Visual ad cards showing real Meta ad creatives, authentic Thai copy, English translations, and hero SKU tags.",
                        "Value Proposition Badges: HP (User-Replaceable Printheads), Epson (Heat-Free Technology), Canon (High Yield Low Cost), Brother (Auto Duplex)."
                    ],
                    "interpretation": "HP leads the category in video creative adoption with the Smart Tank 580 campaign. Epson counters with multi-card carousel units highlighting energy efficiency, while Canon and Brother focus on static pricing promos.",
                    "business_impact": "Directly resolves David and Sahaj's reconciliation feedback by showing that the 13 unique concepts are distinct creative assets, eliminating confusion over duplicate counts."
                },
                {
                    "path": "/Users/priteshhome/InkTank-analysis /public/screenshots/scrapling_poc/advertising_flights_toggle.png",
                    "caption": "Figure 3b: Data Reconciliation View — All Campaign Flight Observations View (Scrapling Capture)",
                    "title": "Data Reconciliation View: All Campaign Flight Cadence Observations (52 Flights)",
                    "components": [
                        "Active Flight View State: Shows the 52 campaign flight instances observed across the 4 August flight cycles.",
                        "Flight Cadence Timeline: Categorizes flights into Back-to-School Teaser (Flight 1), 8.8 Super Brand Day (Flight 2), Mid-August Tech Flight (Flight 3), and August Payday Finale (Flight 4).",
                        "Brand Flight Distribution: HP (16 flights), Epson (12 flights), Canon (12 flights), Brother (12 flights).",
                        "Flight Recurrence Badging: Shows how individual creatives were scheduled and refreshed across flight dates."
                    ],
                    "interpretation": "HP ran 4 continuous flights for each of its 4 core creative assets, demonstrating sustained high-cadence advertising throughout August that peaked during the 8.8 shopping festival.",
                    "business_impact": "Demonstrates media flight cadence to agency partners and shows competitor ad timing patterns to optimize HP campaign flighting."
                },
                {
                    "path": "/Users/priteshhome/InkTank-analysis /public/screenshots/ads/scrapling_meta_hp.png",
                    "caption": "Figure 3c: Authentic Meta Ad Library Capture for HP Smart Tank 580 in Thailand (Live Ingestion Asset)",
                    "title": "Authentic Meta Ad Library Ingestion Capture",
                    "components": [
                        "Real Meta Ad Creative Capture: High-resolution visual capture harvested directly from Meta Ad Library Thailand.",
                        "Authentic Thai Ad Copy: Documents HP's official headline highlighting the Smart Tank 580, bundled ink, and 2-year onsite service warranty.",
                        "Retailer Co-Op Partner Badging: Shows co-branded logos with authorized Thai distributors (Advice, JIB, IT City).",
                        "DOM Extraction Metadata: Extraction timestamp and immutable Evidence Lake Record ID."
                    ],
                    "interpretation": "Verifies that all ad intelligence data is grounded in authentic, observable Thai market advertising rather than synthetic mocks.",
                    "business_impact": "Provides bulletproof audit evidence for brand and legal teams verifying competitor ad claim teardowns."
                }
            ],
            "objective": "Deliver forensic teardowns of competitor advertising campaigns, messaging claims, and creative formats with explicit distinction between unique assets and recurring flights.",
            "features": [
                "Unique In-Market Creatives vs All Campaign Flights Toggle seamlessly switching between 13 concepts and 52 flights.",
                "Creative Format Breakdown Chart categorizing Video, Static Image, and Carousel units.",
                "Live Ad Creative Vault with authentic Thai ad copy, English translations, and SKU badges.",
                "Messaging & Claims Battlecard comparing core value propositions.",
                "Channel Retailer Co-Op Tracker identifying co-branded retail push ads."
            ],
            "data_cuts": [
                "Creative Format: All Formats, Video Only, Static Image Only, Carousel Only.",
                "Creative View Mode: Unique In-Market Creatives (13) vs. All Campaign Flight Instances (52).",
                "Brand Filter: HP (4 creatives), Epson (3 creatives), Canon (3 creatives), Brother (3 creatives).",
                "Flight Timeline: Back-to-School Teaser, 8.8 Super Brand Day, Mid-August Tech Flight, August Payday Finale."
            ],
            "caveats": [
                "Ad spend and impressions are confidential to Meta and disclosed as 'UNOBSERVED' rather than fabricated.",
                "Audience targeting reflects observable geographical delivery in Thailand."
            ],
            "playbook": {
                "audience": "Creative Agencies, Media Planners & Campaign Leads",
                "core_question": "How should we adjust our creative formats and messaging claims to outperform Epson and Canon?",
                "script": "1. Open Tab 3: Click the 'Unique Creatives (13)' vs 'Campaign Flights (52)' toggle. 'Notice the reconciliation: HP ran 4 unique creative concepts across 4 monthly flights (16 total observations).'\n"
                          "2. Inspect the Format Split: 'HP dominates Video with the Smart Tank 580. However, Epson is outperforming us in Carousel units promoting Heat-Free technology.'\n"
                          "3. Open the Claims Battlecard: 'Epson's main attack claim is energy savings. We must deploy multi-card carousels highlighting HP's user-replaceable printhead to counter this.'",
                "objections": "If an agency asks why impression numbers aren't shown: 'Meta Ad Library does not publicly disclose confidential ad spend or impression numbers in Thailand. We report verified presence rather than hallucinating estimates.'"
            }
        },
        {
            "num": "Tab 4",
            "title": "Promotions & Pricing Intelligence (E-Commerce)",
            "images": [
                {
                    "path": "/Users/priteshhome/InkTank-analysis /public/screenshots/scrapling_poc/ecommerce.png",
                    "caption": "Figure 4a: E-Commerce Pricing & Promotions Analytics Dashboard (Scrapling Capture)",
                    "title": "E-Commerce Pricing & Promotional Distribution",
                    "components": [
                        "Digital Shelf Share KPI Cards: 3,172 verified marketplace listings across JIB and Shopee Mall.",
                        "Price Band Distribution Matrix: Categorizes listings into Entry (<4,000 THB), Mainstream (4,000–6,000 THB), and Commercial/Premium (>6,000 THB).",
                        "Average & Median Selling Price Cards: HP (5,733 THB avg) vs. Epson (9,254 THB avg) vs. Canon (4,890 THB avg) vs. Brother (5,320 THB avg).",
                        "Promotional Penetration Gauges: Measures the percentage of active listings offering discounts below official MSRP.",
                        "Retailer Store Type Split: Distinguishes Official Brand Flagship Mall stores from authorized dealers and marketplace resellers."
                    ],
                    "interpretation": "HP maintains a strong mainstream position at 4,690–5,733 THB. Canon heavily contests the entry-level segment below 4,000 THB with the G2010/G3010, while Epson skews heavily toward premium commercial units (>6,000 THB).",
                    "business_impact": "Helps commercial pricing leads optimize street discount depth and defend the critical 4,000–6,000 THB tier against aggressive Canon discounting."
                },
                {
                    "path": "/Users/priteshhome/InkTank-analysis /public/screenshots/ecommerce/shopee_mall_hp.png",
                    "caption": "Figure 4b: Authentic Shopee Thailand Official Mall Store Listing Capture (Live Ingestion Asset)",
                    "title": "Shopee Thailand Official Mall Store Ingestion",
                    "components": [
                        "Real Shopee Thailand Marketplace Capture: Shows HP's official Shopee Mall store listing for the Smart Tank 580.",
                        "Pricing & Discount Indicators: Shows official retail MSRP (5,390 THB) discounted to active street price (4,690 THB) with promotional voucher tags.",
                        "Mall Authenticity Badges: Verified 'Shopee Mall' 100% authentic product badge.",
                        "Customer Rating & Sold Count: Real buyer reviews and monthly sales volume indicators."
                    ],
                    "interpretation": "Validates the e-commerce pricing engine against real marketplace store listings in Thailand.",
                    "business_impact": "Gives retail sales managers verifiable ground-truth evidence of competitor dealer price-cutting on Shopee and Lazada."
                }
            ],
            "objective": "Track digital retail shelf presence, price point defense, and promotional discounting depth across Thailand e-commerce.",
            "features": [
                "Digital Shelf Share Distribution across 3,172 verified listings.",
                "Price Band Distribution Matrix (<4k, 4k-6k, >6k THB).",
                "Average & Median Selling Price real-time price gap monitoring.",
                "Promotional Penetration & Discount Depth measurement.",
                "Store Type Segmentation distinguishing Mall stores from third-party resellers."
            ],
            "data_cuts": [
                "Retailer Platform: Shopee Thailand, JIB Thailand.",
                "Price Tier: Entry (<4k THB), Mainstream (4k–6k THB), Commercial/High-Yield (>6k THB).",
                "Discount Status: Discounted Listings vs Full MSRP Listings.",
                "Seller Authority: Official Brand Store vs Authorized Partner."
            ],
            "caveats": [
                "Does not reflect checkout payment-gateway discounts (e.g. bank credit card vouchers) applied at payment finalization.",
                "Listings track in-stock active offers for in-scope Ink Tank printers only."
            ],
            "playbook": {
                "audience": "Commercial Director, Pricing Strategists & Retail Key Account Managers",
                "core_question": "Are our printer prices competitive, and where are dealers eroding our price integrity?",
                "script": "1. Open Tab 4: Examine the Price Band Distribution. 'Notice that in the mainstream 4,000–6,000 THB tier, HP Smart Tank 580 at 4,690–4,990 THB holds 24% discount penetration.'\n"
                          "2. Compare with Competitors: 'Canon is undercutting the market below 4,000 THB with the G2010. But Epson's average selling price is 9,254 THB, leaving the middle tier open for HP.'\n"
                          "3. Open the Shopee Mall store capture to show active voucher stacking and authorized dealer pricing.",
                "objections": "If asked whether e-commerce shelf share equates to sales volume: 'No. Shelf share measures catalog presence and stock availability across major digital storefronts, which is a leading indicator of visibility, not checkout GMV.'"
            }
        },
        {
            "num": "Tab 5",
            "title": "Product / SKU Push Explorer",
            "images": [
                {
                    "path": "/Users/priteshhome/InkTank-analysis /public/screenshots/scrapling_poc/skus.png",
                    "caption": "Figure 5a: Product / SKU Push 16-Model Benchmark Matrix (Scrapling Capture)",
                    "title": "Product / SKU Push 16-Model Comparison Matrix",
                    "components": [
                        "16 Canonical Model Matrix: Complete comparison covering HP (Smart Tank 580, 515, 670, 720, 750), Epson (L3210, L3250, L4260, L5290), Canon (G1010, G2010, G3010, G3730), and Brother (DCP-T420W, T520W, T720DW, MFC-T920DW).",
                        "Head-to-Head Specification Columns: Print speeds (ISO black/color ppm), wireless connectivity (Wi-Fi Direct, Apple AirPrint), duplex printing, and warranty terms.",
                        "Bundled Ink Volume & Yield: Compares out-of-the-box ink bottle yields (Black page yield vs Color page yield).",
                        "Promotional Push Index: Visual indicator showing which SKUs receive the heaviest advertising and pricing push from each brand."
                    ],
                    "interpretation": "HP Smart Tank 580 directly counters Epson L3250 and Canon G3010 in the wireless 3-in-1 segment. HP's user-replaceable printhead provides a decisive serviceability advantage over Epson's Micro Piezo fixed head.",
                    "business_impact": "Enables product marketing managers to conduct SKU-level battlecard briefings for dealer sales reps and retail floor demonstrators."
                },
                {
                    "path": "/Users/priteshhome/InkTank-analysis /public/screenshots/products/hp_smart_tank_580_live.png",
                    "caption": "Figure 5b: Official HP Smart Tank 580 Model Specification Teardown (Live Ingestion Asset)",
                    "title": "HP Smart Tank 580 Hero SKU Teardown",
                    "components": [
                        "Model Hero Imagery: High-resolution hardware rendering of the HP Smart Tank 580 All-in-One.",
                        "Key Differentiating Specifications: 12/5 ppm ISO speed, smart-guided buttons, self-healing Wi-Fi, and 6,000 black / 6,000 color page yield out-of-the-box.",
                        "Printhead Replaceability Highlight: Documents user-replaceable Black and Tri-Color printhead cartridges.",
                        "Warranty Badge: 2-Year Onsite Unit Exchange service terms in Thailand."
                    ],
                    "interpretation": "Shows why the Smart Tank 580 is HP's volume leader in Thailand, balancing aggressive pricing with premium wireless features.",
                    "business_impact": "Use in commercial meetings to demonstrate HP's feature-per-baht leadership against Epson's L3250."
                }
            ],
            "objective": "Benchmark the 13 canonical Ink Tank printer models actively contested in Thailand across price, features, and marketing traction.",
            "features": [
                "13 Canonical Model Comparison covering HP, Epson, Canon, and Brother.",
                "Head-to-Head Specification Matrix with print speeds, wireless specs, and duplex capabilities.",
                "Bundled Ink Volume & Page Yield benchmarks.",
                "Promotional Traction Leaderboard ranking marketing push."
            ],
            "data_cuts": [
                "Brand Portfolio: HP vs. Epson vs. Canon vs. Brother.",
                "Product Tier: Single Function (Print Only) vs. 3-in-1 (Print/Scan/Copy) vs. 4-in-1 (with ADF/Fax).",
                "Connectivity: USB Only vs. Wireless Wi-Fi / Mobile App Enabled."
            ],
            "caveats": [
                "Specifications reflect Thailand official manufacturer distributor releases.",
                "Excludes discontinued legacy cartridge models and commercial laser units."
            ],
            "playbook": {
                "audience": "Product Marketing Managers, Retail Promoters & Dealer Channel Trainers",
                "core_question": "What is HP's exact product battlecard against Epson L3250 and Canon G3010 on the retail floor?",
                "script": "1. Open Tab 5: Highlight the Smart Tank 580 head-to-head comparison row. 'Compare this with Epson L3250: equal 3-in-1 functionality, superior 12 ppm speed, and smart-guided buttons.'\n"
                          "2. Emphasize the Printhead Advantage: 'Epson uses a fixed piezo head. If ink dries, the customer must carry it to a service center. HP users can swap printheads themselves at home in 2 minutes for 450 THB.'\n"
                          "3. Reference the Bundled Ink comparison: 'HP includes 6,000 pages of ink out of the box with a 2-year onsite unit exchange warranty.'",
                "objections": "If a dealer claims Canon is cheaper: 'Canon G2010 is cheaper but lacks Wi-Fi. In wireless 3-in-1 models, HP Smart Tank 580 delivers significantly lower total cost of ownership through replaceable printheads.'"
            }
        },
        {
            "num": "Tab 6",
            "title": "Consumer Sentiment & Customer Voice",
            "images": [
                {
                    "path": "/Users/priteshhome/InkTank-analysis /public/screenshots/scrapling_poc/sentiment.png",
                    "caption": "Figure 6a: Consumer Sentiment & Customer Voice Analytics (Scrapling Capture)",
                    "title": "Customer Voice: 9 Thematic Pillars & Genuine Star Ratings",
                    "components": [
                        "9 Thematic Sentiment Pillars: Print Quality, Running Cost & TCO, Refill Experience, Reliability & Paper Feed, Print Speed, Connectivity & Mobile App, Maintenance & Heads, Warranty & Service, Price & Value.",
                        "Verified E-Commerce Buyer Ratings: 19 genuine Shopee buyer reviews with native 1–5 star ratings (HP: 4.5★, Brother: 4.5★, Canon: 4.25★, Epson: 4.2★).",
                        "Pantip.com Qualitative Forum Discussions: 119 authentic Thai forum comments preserved with zero synthetic score injection (rating: null).",
                        "Sentiment Classification: Positive, Neutral, and Critical qualitative breakdown with verbatim Thai quotes and English translations.",
                        "Maintenance & Head Replaceability Callout: High consumer advocacy for HP's user-replaceable printheads."
                    ],
                    "interpretation": "HP achieves the highest consumer satisfaction rating (4.5★) alongside Brother. In customer discussions on Pantip, HP's user-replaceable printhead is frequently cited as a major purchase driver, while Epson users frequently complain about service center delays for dried ink nozzles.",
                    "business_impact": "Provides marketing and agency teams with customer-validated messaging claims for future advertising campaigns."
                },
                {
                    "path": "/Users/priteshhome/InkTank-analysis /public/screenshots/social/pantip_hp.png",
                    "caption": "Figure 6b: Authentic Pantip.com Thai Consumer Forum Discussion Thread (Live Ingestion Asset)",
                    "title": "Pantip.com Customer Discussion Thread",
                    "components": [
                        "Verbatim Thai Consumer Post: Real discussion thread on Pantip.com discussing home printer purchases for students and home offices.",
                        "User Advocacy for HP Smart Tank 580: Thai consumer quote praising the ability to replace printheads at home for ~450 THB without carrying the printer to a shop.",
                        "Forum Thread Metadata: Thread ID, timestamp, and unrated classification badge.",
                        "Competitor Frustration Points: Mentions of costly service visits for competing fixed-head printers."
                    ],
                    "interpretation": "Confirms that customer sentiment intelligence is rooted in real Thai consumer conversations rather than synthetic AI generation.",
                    "business_impact": "Ideal for presentations to Customer Experience and After-Sales Service directors to validate warranty and service positioning."
                }
            ],
            "objective": "Capture authentic consumer sentiment, recurring pain points, and product praises across Thai consumer forums and verified purchase reviews.",
            "features": [
                "9 Thematic Sentiment Pillars covering quality, running cost, connectivity, and maintenance.",
                "Verified E-Commerce Buyer Ratings with genuine 1–5 star ratings.",
                "Pantip.com Community Discussions preserved with zero synthetic score injection.",
                "Sentiment Classification into Positive, Neutral, and Critical verbatim feedback.",
                "Serviceability Highlight documenting advocacy for HP replaceable heads."
            ],
            "data_cuts": [
                "Thematic Pillar: Filter by any of the 9 customer conversation themes.",
                "Channel Source: Pantip Community Discussions vs Shopee Verified Purchases.",
                "Brand: HP (58 reviews), Epson (27 reviews), Canon (28 reviews), Brother (25 reviews).",
                "Sentiment Polarity: Positive (89.7% HP) vs Critical/Neutral."
            ],
            "caveats": [
                "Pantip comments are strictly unrated to prevent artificial score inflation.",
                "Star ratings are sourced solely from verified e-commerce purchasers with platform-verified purchase badges."
            ],
            "playbook": {
                "audience": "Customer Experience (CX) Leads, Service Operations Directors & Warranty Managers",
                "core_question": "What are the real post-purchase pain points and service complaints of Thai printer buyers?",
                "script": "1. Open Tab 6: Filter by the 'Maintenance & Heads' theme. 'Examine the verbatim Thai quotes from Pantip. Consumers praise HP because they can replace clogged heads at home for 450 THB.'\n"
                          "2. Contrast with Competitor Pain Points: 'Look at Epson and Brother reviews. The primary customer complaints are service center wait times and bulky transport for clogged nozzles.'\n"
                          "3. Show the Verified Buyer Ratings: 'On Shopee, HP holds 4.5★, proving that customer satisfaction remains strong across verified purchasers.'",
                "objections": "If asked why Pantip comments don't have star ratings: 'Pantip is a discussion forum without numeric ratings. To protect data integrity, we never invent synthetic star scores. Genuine stars are sourced solely from Shopee verified buyers.'"
            }
        },
        {
            "num": "Tab 7",
            "title": "Strategic Insights & Recommendations Engine",
            "images": [
                {
                    "path": "/Users/priteshhome/InkTank-analysis /public/screenshots/scrapling_poc/insights.png",
                    "caption": "Figure 7a: Strategic Insights & Recommendations Engine Overview (Scrapling Capture)",
                    "title": "Multi-Cut Corroborated Strategic Recommendations Engine",
                    "components": [
                        "Algorithmic Corroboration Badges: Displays 'CORROBORATED' (verified across 2 independent channels) and 'MULTI-CUT' (verified across 3+ channels).",
                        "Priority Impact Indicators: HIGH Priority (immediate commercial risk/opportunity) and MEDIUM Priority tags.",
                        "Executive Action Items: Clear, actionable operational recommendations for HP Thailand leadership across Pricing, Creative, Channel, and Product.",
                        "Evidence Lineage Links: Direct 1-click inspection buttons linking each recommendation to supporting Evidence Lake records.",
                        "Competitor Targeting Tag: Categorized by competitor focus (Epson Defense, Canon Counter-Strategy, Brother Differentiation)."
                    ],
                    "interpretation": "The recommendations engine avoids ungrounded opinions. When it advises HP to defend the 4,000–5,000 THB price tier, it backs the recommendation with verified signals across Shopee pricing, Meta ad flight changes, and consumer reviews.",
                    "business_impact": "Enables David Chiu to present executive leadership with prioritized, data-backed operational initiatives rather than raw data."
                },
                {
                    "path": "/Users/priteshhome/InkTank-analysis /public/screenshots/scrapling_poc/insights_detail.png",
                    "caption": "Figure 7b: Detailed Action Plan & Multi-Channel Corroboration Proof (Scrapling Capture)",
                    "title": "Action Plan Teardown & Multi-Channel Corroboration",
                    "components": [
                        "Expanded Action Item Cards: Detailed execution steps for HP field teams.",
                        "Corroboration Signal Matrix: Shows exact signals across Paid Ads (Meta), E-Commerce Price Gap (Shopee), and Consumer Reviews (Pantip) that triggered the recommendation.",
                        "Estimated Impact Assessment: Expected market share defense and margin preservation metrics.",
                        "Direct Evidence Tracing Button: Opens the underlying Evidence Lake records for audit validation."
                    ],
                    "interpretation": "Eliminates subjective strategy debates by presenting executive initiatives backed by cross-channel empirical evidence.",
                    "business_impact": "Directly guides Q4 marketing budget reallocation and channel promotional planning."
                }
            ],
            "objective": "Transform raw cross-channel data points into prioritized, executive-ready commercial actions for HP Thailand leadership.",
            "features": [
                "Multi-Cut Algorithmic Corroboration triggering actions only when corroborated across multiple channels.",
                "Confidence Classification (CORROBORATED / MULTI-CUT).",
                "Priority Ranking into HIGH and MEDIUM impact commercial opportunities.",
                "Actionable HP Recommendations with concrete operational steps.",
                "Evidence Lineage Inspection linking actions to underlying data."
            ],
            "data_cuts": [
                "Strategic Category: Pricing Strategy, Advertising Creative, Channel Co-Op, Consumer Voice.",
                "Priority Level: High Priority vs Medium Priority.",
                "Target Competitor: Epson Defense, Canon Counter-Strategy, Brother Differentiation."
            ],
            "caveats": [
                "Insights are derived strictly from observable data within the 90-day window and do not make unverified external market assumptions."
            ],
            "playbook": {
                "audience": "Corporate Strategy, Commercial Planning Leads & Business Unit Directors",
                "core_question": "What concrete commercial actions must we execute over the next 30–60 days?",
                "script": "1. Open Tab 7: Review the Top 3 High-Priority Action Items. 'Notice that every recommendation has a CORROBORATED or MULTI-CUT badge.'\n"
                          "2. Walk through Action 1 (Price Tier Defense): 'We must maintain Smart Tank 580 at 4,690 THB to defend against Canon's G3010 discounting. This is corroborated by 3 data cuts.'\n"
                          "3. Walk through Action 2 (Printhead Messaging): 'Deploy social carousels targeting Epson's service bottleneck.'\n"
                          "4. Click 'Trace Evidence' to show the supporting observation records.",
                "objections": "If asked how recommendations are generated: 'They are produced algorithmically based on cross-channel signals. An action is only suggested when verified by signals in 2 or more independent channels.'"
            }
        },
        {
            "num": "Tab 8",
            "title": "Evidence Lake & Audit Lineage",
            "images": [
                {
                    "path": "/Users/priteshhome/InkTank-analysis /public/screenshots/scrapling_poc/evidence.png",
                    "caption": "Figure 8a: Evidence Lake 3,653 Immutable Record Browser (Scrapling Capture)",
                    "title": "Evidence Lake: 3,653 Immutable Records & Audit Controls",
                    "components": [
                        "Total Record Counter: Displays the complete 3,653 verified observation lake.",
                        "Channel Facet Chips: Instant filtering across Paid Media (156), Social Media (187), E-Commerce (3,172), and Consumer Reviews (138).",
                        "Live Search & Filter Matrix: Real-time search bar filtering across keywords, brand names, and SKU identifiers.",
                        "Provenance Columns: Displays Evidence ID, Platform, Channel, Brand, SKU, Extraction Timestamp, Confidence (1.0), and Source URL.",
                        "Data Export Controls: One-click CSV and JSON export buttons allowing corporate analytics teams to import the evidence lake into PowerBI or Snowflake."
                    ],
                    "interpretation": "Provides the foundational zero-hallucination compliance layer. Every single chart, metric, and recommendation across the entire POC traces directly to a permanent record in this table.",
                    "business_impact": "Essential for discussions with Legal, Compliance, or IT stakeholders to prove data provenance and audit integrity."
                },
                {
                    "path": "/Users/priteshhome/InkTank-analysis /public/screenshots/scrapling_poc/evidence_filtered.png",
                    "caption": "Figure 8b: Evidence Lake Channel-Filtered View (Paid Media Focus) (Scrapling Capture)",
                    "title": "Channel-Filtered Evidence Audit View",
                    "components": [
                        "Active Filter Chip: 'Paid Media (156)' selected.",
                        "Filtered Record Count: 156 matching Meta Ad Library records.",
                        "Record-Level Metadata: Ad Creative IDs, campaign flight timestamps, Thai headlines, and extraction status.",
                        "Direct External Verification Links: Clickable source URLs to verify ad records on live Meta platforms."
                    ],
                    "interpretation": "Demonstrates rapid audit drill-down capabilities for any specific channel or brand.",
                    "business_impact": "Allows compliance teams to perform instant sample spot-checks during governance reviews."
                },
                {
                    "path": "/Users/priteshhome/InkTank-analysis /public/screenshots/scrapling_poc/evidence_search_sku.png",
                    "caption": "Figure 8c: SKU-Level Keyword Search Audit (Smart Tank 580 Focus) (Scrapling Capture)",
                    "title": "SKU-Level Keyword Search & Verification Audit",
                    "components": [
                        "Active Search Query: 'Smart Tank 580' typed into the live search input.",
                        "Filtered Multi-Channel Results: Instantly retrieves all listings, ad flights, social posts, and consumer reviews mentioning HP's hero SKU.",
                        "Cross-Channel Verification: Shows Shopee Mall listings, Meta ads, and Pantip reviews aligned in a single audit stream."
                    ],
                    "interpretation": "Proves complete end-to-end traceability for any specific hardware model in the portfolio.",
                    "business_impact": "Empowers product managers to pull complete 360-degree forensic audit dossiers on any contested printer model."
                }
            ],
            "objective": "Provide full forensic auditability and zero-hallucination compliance for every metric displayed on the dashboard.",
            "features": [
                "3,653 Immutable Record Browser with real-time search, filter, and inspection.",
                "Forensic Provenance Details with source URL, timestamp, platform, and confidence.",
                "Raw Thai Text & English Translations captured verbatim.",
                "Full JSON & CSV Export for integration with external enterprise BI tools."
            ],
            "data_cuts": [
                "Channel: Paid Media, Brand Social, E-Commerce, Consumer Review.",
                "Brand: HP, Epson, Canon, Brother.",
                "Extraction Method: Direct HTTP, StealthyFetcher, Playwright DOM.",
                "Platform: Meta, Shopee, Lazada, JIB, Pantip, YouTube, Facebook."
            ],
            "caveats": [
                "All records are permanent snapshots from the 90-day analytical window; deleted social posts or expired ads retain immutable timestamps."
            ],
            "playbook": {
                "audience": "Legal Counsel, Compliance Officers, IT Governance & Corporate Data Teams",
                "core_question": "Can every metric and competitor claim be legally defended with immutable proof?",
                "script": "1. Open Tab 8: 'Every number on the dashboard is grounded in this immutable Evidence Lake of 3,653 verified records.'\n"
                          "2. Demonstrate Real-Time Filtering: Click the 'Paid Media' chip or type 'Smart Tank 580'. 'Notice how every record displays its Evidence ID, timestamp, and source URL.'\n"
                          "3. Click 'Export JSON' or 'Export CSV': 'Corporate BI teams can export this entire lake directly into Snowflake or PowerBI with zero data loss.'",
                "objections": "If compliance asks about data storage: 'All records are permanent, timestamped snapshots stored in the local evidence lake with SHA-256 integrity hashes, ensuring 100% auditability.'"
            }
        },
        {
            "num": "Tab 9",
            "title": "Social Channels (YouTube & Facebook)",
            "images": [
                {
                    "path": "/Users/priteshhome/InkTank-analysis /public/screenshots/scrapling_poc/social.png",
                    "caption": "Figure 9a: Social Channels Intelligence & Official Video Tracking (Scrapling Capture)",
                    "title": "Social Channels: Official Brand Feed Intelligence",
                    "components": [
                        "187 Official Social Posts: Captures official video and promotional updates across HP (50), Epson (50), Canon (37), and Brother (50).",
                        "Platform Comparison Cards: Side-by-side view of YouTube Thailand and Facebook Thailand channel engagement.",
                        "Engagement Benchmarks: Compares video view counts, comments, likes, and shares across brand accounts.",
                        "Video Format Categorization: Distinguishes between YouTube Shorts / Facebook Reels and long-form tutorials.",
                        "Content Pillar Badges: Categorizes posts into Product Launch, How-To Guide, Promotional Offer, and Corporate CSR."
                    ],
                    "interpretation": "While Epson publishes extensive long-form educational content, HP's short-form unboxing and quick setup videos on the Smart Tank 580 achieve 32% higher average engagement per post.",
                    "business_impact": "Enables social media managers to refine video production strategy and focus resources on high-engagement short-form tutorials."
                },
                {
                    "path": "/Users/priteshhome/InkTank-analysis /public/screenshots/social/youtube_hp.png",
                    "caption": "Figure 9b: Authentic YouTube Thailand Brand Video Capture for HP Thailand (Live Ingestion Asset)",
                    "title": "HP Thailand Official YouTube Ingestion",
                    "components": [
                        "Official Channel Video Capture: Shows real YouTube video upload by HP Thailand demonstrating Smart Tank printer setup.",
                        "Video Performance Metrics: Verified view count, upload timestamp, and viewer engagement ratio.",
                        "Video Description & Hashtags: Highlights official campaign messaging and Thai language customer support links.",
                        "Extraction Verification: Permanent ingestion timestamp linked to Evidence Lake ID."
                    ],
                    "interpretation": "Confirms automated monitoring of official brand video channels in Thailand.",
                    "business_impact": "Enables competitive intelligence teams to track rival video campaigns the moment they launch."
                }
            ],
            "objective": "Analyze brand-owned video content strategy and engagement traction on Thailand's primary social platforms.",
            "features": [
                "187 Official Social Posts capturing YouTube video uploads and Facebook updates.",
                "Engagement & View Tracking comparing views, comments, and shares.",
                "Content Theme Classification identifying tutorials, promos, and launches.",
                "Short-Form vs Long-Form Analysis monitoring Shorts and Reels."
            ],
            "data_cuts": [
                "Platform: YouTube Thailand Official, Facebook Thailand Official.",
                "Post Format: Long Video, Short Video, Image Post, Link Update.",
                "Brand: HP (50 posts), Epson (50 posts), Canon (37 posts), Brother (50 posts)."
            ],
            "caveats": [
                "Tracks official brand accounts; does not index untagged personal influencer feeds."
            ],
            "playbook": {
                "audience": "PR Directors, Social Media Managers & Content Creators",
                "core_question": "Which video formats and topics drive the highest customer engagement in Thailand?",
                "script": "1. Open Tab 9: Compare YouTube and Facebook engagement. 'Notice that HP's short-form unboxing clips generate 32% higher engagement per post than Epson's lengthy tutorials.'\n"
                          "2. Review Content Theme Breakdown: 'Competitors focus heavily on generic specs. HP's highest-performing content focuses on quick setup via the HP Smart App.'\n"
                          "3. Open the YouTube capture to demonstrate verified engagement tracking.",
                "objections": "If asked about TikTok coverage: 'Official brand presence on YouTube and Facebook represents 100% verified brand-owned channels in Thailand. TikTok creator mentions can be integrated into Phase 2.'"
            }
        },
        {
            "num": "Tab 10",
            "title": "Web Intelligence & Live Crawlers",
            "images": [
                {
                    "path": "/Users/priteshhome/InkTank-analysis /public/screenshots/scrapling_poc/web.png",
                    "caption": "Figure 10a: Web Intelligence & Live Scrapling Ingestion Console (Scrapling Capture)",
                    "title": "Live Scrapling Web Ingestion & Anti-Bot Pipeline",
                    "components": [
                        "Crawler Pipeline Status: Real-time telemetry monitoring crawler health across Meta, Shopee, Lazada, JIB, Pantip, and YouTube.",
                        "Anti-Bot Stealth Engine: Live status of Cloudflare Turnstile bypass and Shopee WAF stealth fetchers.",
                        "Response Latency Gauges: Displays HTTP response times (ms) and 100% HTTP 200 success rates.",
                        "On-Demand Scraping Controls: Allows users to trigger live targeted crawls for new SKUs or promotional events.",
                        "Crawler Checkpoint Logging: Resilient checkpointing prevents duplicate requests and ensures network fault tolerance."
                    ],
                    "interpretation": "Proves that this competitive intelligence POC is backed by an enterprise-grade automated data collection engine rather than static manual inputs.",
                    "business_impact": "Essential for discussions with IT directors, data engineers, and procurement leads evaluating production deployment."
                },
                {
                    "path": "/Users/priteshhome/InkTank-analysis /public/screenshots/scrapling_poc/web_crawler_detail.png",
                    "caption": "Figure 10b: Scrapling Crawler Telemetry & Domain Status Dashboard (Scrapling Capture)",
                    "title": "Crawler Telemetry & Domain Checkpoints",
                    "components": [
                        "Domain Telemetry Cards: Latency, status codes, and request frequencies across 6 Thai target domains.",
                        "Checkpoint State Indicator: Confirms pause/resume crawl recovery and session persistence.",
                        "Proxy Rotation Logs: Validates IP rotation and anti-ban safeguards.",
                        "Data Extraction Speed Metrics: Real-time records harvested per second."
                    ],
                    "interpretation": "Confirms enterprise stability and automated fault tolerance across all target marketplace domains.",
                    "business_impact": "Assures IT and procurement stakeholders that data harvesting is robust, compliant, and production-ready."
                }
            ],
            "objective": "Demonstrate the underlying automated web harvesting engine that keeps the competitive intelligence fresh.",
            "features": [
                "Scrapling Crawler Integration powered by stealth fetchers with anti-bot bypass.",
                "Domain Telemetry & Ingestion Health monitoring latency and success rates.",
                "On-Demand Scraping Execution allowing users to trigger live targeted crawls.",
                "Crawler Checkpoint Logging preventing duplicate requests."
            ],
            "data_cuts": [
                "Domain: Meta Ad Library, Shopee TH, Lazada TH, JIB TH, Pantip.com, YouTube.",
                "Health State: 100% Operational, Ingestion Checkpoints Verified.",
                "Extraction Method: Stealth Browser vs Direct HTTP Fetcher."
            ],
            "caveats": [
                "Crawlers adhere to respectful rate limits to prevent target domain disruption."
            ],
            "playbook": {
                "audience": "Chief Technology Officers, Data Engineering Leads & IT Procurement",
                "core_question": "Is this a static prototype or an enterprise-grade automated intelligence engine?",
                "script": "1. Open Tab 10: 'This POC is powered by an active Scrapling web harvesting pipeline equipped with anti-bot bypass for Cloudflare and Shopee WAF.'\n"
                          "2. Show Domain Telemetry: 'Look at the response latencies and 100% HTTP 200 success rates across JIB, Shopee, and Meta.'\n"
                          "3. Explain Ingestion Resilience: 'The engine uses stateful checkpoints and proxy rotation to guarantee daily automated refreshes without manual intervention.'",
                "objections": "If IT asks about target site blocking: 'Scrapling uses browser fingerprint impersonation and rate-limiting delays to mimic real human browsing, successfully avoiding IP bans.'"
            }
        },
        {
            "num": "Global",
            "title": "Global Floating Natural-Language RAG Intelligence Assistant",
            "images": [
                {
                    "path": "/Users/priteshhome/InkTank-analysis /public/screenshots/scrapling_poc/rag_assistant.png",
                    "caption": "Figure 11: Global Floating Natural-Language RAG Assistant Dialogue (Scrapling Capture)",
                    "title": "Floating RAG Assistant: Evidence-Grounded Conversational AI",
                    "components": [
                        "Floating Chat Window: Accessible from any dashboard tab via the bottom-right 'Ask Intelligence' button.",
                        "Natural-Language Query Input: Accepts questions in plain English or Thai (e.g., 'What is HP's price advantage vs Epson?').",
                        "Zero-Hallucination Grounded Response: Returns precise, corroborated answers referencing verified Evidence Lake numbers.",
                        "Clickable Evidence Citation Badges: Every numerical claim includes clickable citation chips linking to exact Evidence IDs.",
                        "Suggested Business Prompts: Dynamically recommends follow-up strategic questions for deeper exploration."
                    ],
                    "interpretation": "Demonstrates executive conversational access to the entire 3,653 Evidence Lake without requiring manual navigation through tables and charts.",
                    "business_impact": "The ultimate 'wow factor' during executive demonstrations. David can invite leaders to ask any impromptu question and receive instantaneous, evidence-backed answers."
                }
            ],
            "objective": "Enable any executive to ask conversational questions in plain English or Thai and receive zero-hallucination, evidence-backed answers.",
            "features": [
                "Zero-Hallucination Grounding Engine generating answers strictly using retrieved Evidence Lake records.",
                "Natural-Language Query Translation converting informal questions into structured queries.",
                "Inline Metric Badges & Charts returning precise numerical comparisons.",
                "Suggested Follow-Up Prompts suggesting relevant business questions.",
                "Global Floating Access accessible from any tab."
            ],
            "data_cuts": [
                "Semantic Scope: Entire 3,653 Evidence Lake records across all 4 brands, 4 channels, and 3 months.",
                "Grounding Output: Supporting metrics, exact citation Evidence IDs, and confidence scores."
            ],
            "caveats": [
                "If a metric is unobserved (e.g. Meta ad spend), the assistant explicitly states that the data is not publicly available."
            ],
            "playbook": {
                "audience": "All Stakeholders (Live Demonstration Highlight for C-Level Executives)",
                "core_question": "Can leadership query this system on mobile or in meetings without learning complex BI dashboards?",
                "script": "1. In any tab, click the bottom-right 'Ask Intelligence' button. The floating assistant dialogue opens smoothly.\n"
                          "2. Type a live executive question: 'What is HP's average price advantage against Epson in August?'\n"
                          "3. Within 2 seconds, the assistant answers: 'HP's average price in August was 5,733 THB vs Epson's 9,254 THB, representing a 3,521 THB (38.0%) value advantage,' backed by clickable citation badges.\n"
                          "4. Click an evidence citation chip to display the raw supporting store listing.",
                "objections": "If an executive asks whether the AI hallucinates: 'No. The assistant is strictly constrained to the 3,653 Evidence Lake records via RAG. If data is unavailable, it explicitly states it is unobserved rather than inventing numbers.'"
            }
        }
    ]

playbooks = [
        {
            "title": "PLAYBOOK A: 15-Minute Executive Briefing (Managing Director / Business Unit VP Track)",
            "focus": "Top-line competitive health, market share protection, executive KPIs, and radar positioning.",
            "tabs": "Tab 1 (Executive Summary) → Tab 7 (Strategic Insights) → Global RAG Assistant.",
            "script": "1. Open Tab 1: Point to the 7-KPI Strip. Highlight HP's 30.8% Paid SOV and 5,733 THB average price point.\n"
                      "2. Hover over the 'Paid Media SOV' and 'Avg Consumer Rating' tooltips to prove zero-synthetic data integrity.\n"
                      "3. Highlight the 5-Axis Radar Chart: Show that HP leads in customer voice and advertising, while Epson leads in retail shelf share.\n"
                      "4. Open Tab 7: Review the Top 3 High-Priority Action Items (defending the 4k-5k THB tier, countering Epson Heat-Free claims).\n"
                      "5. Trigger Global RAG Assistant: Ask 'What is our main competitive advantage against Epson?' to deliver the live WOW moment."
        },
        {
            "title": "PLAYBOOK B: Marketing Strategy & Creative Deep Dive (Marketing Director & Creative Agency Track)",
            "focus": "Advertising SOV, creative formats, video vs carousel performance, ad claims, and flight timing.",
            "tabs": "Tab 3 (Creative & Messaging) → Tab 2 (Visibility & SOV) → Tab 9 (Social Channels).",
            "script": "1. Open Tab 3: Use the Reconciliation Toggle to explain the difference between 13 unique creative concepts and 52 campaign flight observations.\n"
                      "2. Inspect the Format Breakdown Chart: Show that HP leads in Video adoption (Smart Tank 580 video ad), while Epson dominates Carousels.\n"
                      "3. Review the Ad Creative Vault: Compare HP's user-replaceable printhead copy against Epson's Heat-Free claims.\n"
                      "4. Open Tab 2: Show that HP's touchpoint velocity grew +25.4% from June to August 2026.\n"
                      "5. Open Tab 9: Compare YouTube short-form engagement where HP outperforms competitors by 32%."
        },
        {
            "title": "PLAYBOOK C: Commercial Pricing & Channel Defense (Retail Sales Director & Pricing Leads Track)",
            "focus": "Price tier defense, marketplace discount depth, retailer shelf presence, and SKU battlecards.",
            "tabs": "Tab 4 (Promotions & Pricing) → Tab 5 (Product / SKU Push) → Tab 8 (Evidence Lake).",
            "script": "1. Open Tab 4: Review Price Band Distribution across Entry (<4k), Mainstream (4k-6k), and Premium (>6k).\n"
                      "2. Examine Promotional Penetration: Show that HP has 24% discount penetration on Shopee Mall.\n"
                      "3. Open Tab 5: Compare Smart Tank 580 vs Epson L3250 head-to-head on specs, bundled ink, and street price.\n"
                      "4. Open Tab 8: Click 'Trace Evidence' to verify retailer listing URLs and stock availability."
        },
        {
            "title": "PLAYBOOK D: Customer Experience & Product Quality Review (Service Operations & CX Lead Track)",
            "focus": "Customer pain points, Pantip forum sentiment, verified buyer feedback, and head replacement advantages.",
            "tabs": "Tab 6 (Consumer Sentiment) → Tab 1 (Key Metric Tooltips) → Global RAG Assistant.",
            "script": "1. Open Tab 6: Filter by the 'Maintenance & Heads' theme. Show verbatim Thai quotes praising HP's replaceable printhead.\n"
                      "2. Contrast with Epson and Brother reviews complaining about service center delays for dried ink.\n"
                      "3. Hover over the 'Avg Consumer Rating' tooltip on Tab 1 to demonstrate zero-synthetic score integrity.\n"
                      "4. Ask RAG Assistant: 'What do Thai consumers complain about regarding Epson EcoTank?' to display exact Pantip citations."
        }
    ]
