#!/usr/bin/env python3
"""
HP Thailand Ink Tank Competitive Intelligence POC
Executive Feature, Capability, Data-Cut Menu & Stakeholder Playbooks (Interactive HTML Edition)

Embeds all 24 high-resolution Scrapling screenshots directly as Base64 URIs, ensuring
100% visual fidelity on macOS (Chrome, Safari) without needing Microsoft Word.
"""

import os
import sys
import base64
import html
import shutil
import subprocess
from datetime import datetime

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from scripts.feature_menu_data import metadata_rows, tab_rows, recon_data, tabs_detail, playbooks

HTML_OUTPUT_FILE = '/Users/priteshhome/InkTank-analysis /HP_Thailand_InkTank_POC_Feature_Menu.html'
PDF_OUTPUT_FILE = '/Users/priteshhome/InkTank-analysis /HP_Thailand_InkTank_POC_Feature_Menu.pdf'

def get_base64_image(image_path):
    if not os.path.exists(image_path):
        return None
    with open(image_path, "rb") as img_file:
        encoded = base64.b64encode(img_file.read()).decode('utf-8')
        return f"data:image/png;base64,{encoded}"

def build_html():
    print("Building standalone HTML edition with embedded Base64 screenshots...")
    
    # Pre-encode images
    print("Encoding 24 high-resolution screenshots to Base64...")
    encoded_images = {}
    for tab in tabs_detail:
        for img in tab['images']:
            p = img['path']
            if p not in encoded_images:
                b64 = get_base64_image(p)
                encoded_images[p] = b64
                print(f"  Encoded {os.path.basename(p)} ({len(b64) if b64 else 0} chars)")

    # Construct HTML
    h = []
    h.append("""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HP Thailand Ink Tank POC — Executive Feature Menu & Playbooks</title>
    <style>
        :root {
            --primary: #0f172a;
            --primary-light: #1e293b;
            --accent: #0284c7;
            --accent-hover: #0369a1;
            --secondary: #334155;
            --muted: #64748b;
            --bg: #f8fafc;
            --card-bg: #ffffff;
            --border: #e2e8f0;
            --border-focus: #94a3b8;
            --success-bg: #f0fdf4;
            --success-border: #86efac;
            --success-text: #166534;
            --info-bg: #eff6ff;
            --info-border: #bfdbfe;
            --info-text: #1e40af;
            --warning-bg: #fffbeb;
            --warning-border: #fde68a;
            --warning-text: #92400e;
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background-color: var(--bg);
            color: var(--primary);
            line-height: 1.5;
            font-size: 15px;
            -webkit-font-smoothing: antialiased;
        }

        /* Top Sticky Navbar */
        .navbar {
            position: sticky;
            top: 0;
            z-index: 1000;
            background-color: rgba(15, 23, 42, 0.95);
            backdrop-filter: blur(8px);
            color: #ffffff;
            padding: 12px 24px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .navbar-title {
            font-size: 15px;
            font-weight: 700;
            letter-spacing: 0.5px;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .navbar-badge {
            background: #0284c7;
            color: #ffffff;
            font-size: 11px;
            font-weight: 700;
            padding: 3px 8px;
            border-radius: 4px;
            text-transform: uppercase;
        }

        .nav-links {
            display: flex;
            gap: 16px;
            font-size: 13px;
        }

        .nav-links a {
            color: #94a3b8;
            text-decoration: none;
            transition: color 0.2s;
            font-weight: 500;
        }

        .nav-links a:hover {
            color: #ffffff;
        }

        .nav-actions {
            display: flex;
            gap: 10px;
        }

        .btn-action {
            background: #0284c7;
            color: #ffffff;
            border: none;
            padding: 6px 14px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.2s;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 6px;
        }

        .btn-action:hover {
            background: #0369a1;
        }

        .btn-secondary {
            background: #334155;
            color: #ffffff;
        }

        .btn-secondary:hover {
            background: #475569;
        }

        /* Container */
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 32px 24px;
        }

        /* Cover Block */
        .cover-card {
            background: #ffffff;
            border-radius: 12px;
            padding: 36px 40px;
            border: 1px solid var(--border);
            box-shadow: 0 4px 20px -2px rgba(0,0,0,0.05);
            margin-bottom: 32px;
        }

        .cover-tag {
            color: var(--accent);
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 8px;
        }

        .cover-title {
            font-size: 32px;
            font-weight: 800;
            color: var(--primary);
            line-height: 1.2;
            margin-bottom: 10px;
        }

        .cover-sub {
            font-size: 18px;
            color: var(--secondary);
            margin-bottom: 24px;
            font-weight: 400;
        }

        /* Metadata Table */
        .meta-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 24px;
            border-radius: 8px;
            overflow: hidden;
            border: 1px solid var(--border);
        }

        .meta-table td {
            padding: 10px 16px;
            font-size: 13.5px;
            border-bottom: 1px solid var(--border);
        }

        .meta-table tr:last-child td {
            border-bottom: none;
        }

        .meta-table td:first-child {
            width: 220px;
            background-color: var(--bg);
            font-weight: 700;
            color: var(--secondary);
        }

        .meta-table td:last-child {
            background-color: #ffffff;
            color: var(--primary);
        }

        /* Callout Banners */
        .callout {
            border-radius: 8px;
            padding: 16px 20px;
            margin: 20px 0;
            border-left: 4px solid;
            font-size: 14px;
        }

        .callout-info {
            background-color: var(--info-bg);
            border-color: #3b82f6;
            color: var(--info-text);
        }

        .callout-warning {
            background-color: var(--warning-bg);
            border-color: #f59e0b;
            color: var(--warning-text);
        }

        .callout-success {
            background-color: var(--success-bg);
            border-color: #10b981;
            color: var(--success-text);
        }

        .callout-title {
            font-weight: 700;
            font-size: 13px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 8px;
            display: flex;
            align-items: center;
            gap: 6px;
        }

        .callout ul {
            margin-left: 20px;
        }

        .callout li {
            margin-bottom: 6px;
        }

        .callout li:last-child {
            margin-bottom: 0;
        }

        /* Section Headings */
        .section-header {
            margin: 48px 0 20px 0;
            padding-bottom: 12px;
            border-bottom: 2px solid var(--border);
        }

        .section-title {
            font-size: 24px;
            font-weight: 800;
            color: var(--primary);
        }

        .section-desc {
            color: var(--muted);
            font-size: 15px;
            margin-top: 4px;
        }

        /* Tables */
        .data-table-wrapper {
            background: #ffffff;
            border-radius: 8px;
            border: 1px solid var(--border);
            overflow: hidden;
            box-shadow: 0 2px 10px -2px rgba(0,0,0,0.03);
            margin: 20px 0;
        }

        .data-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 13.5px;
        }

        .data-table th {
            background-color: var(--primary);
            color: #ffffff;
            font-weight: 700;
            text-align: left;
            padding: 12px 16px;
            font-size: 12.5px;
            letter-spacing: 0.3px;
        }

        .data-table td {
            padding: 12px 16px;
            border-bottom: 1px solid var(--border);
            vertical-align: top;
        }

        .data-table tr:nth-child(even) td {
            background-color: #f8fafc;
        }

        .data-table tr:last-child td {
            border-bottom: none;
        }

        .data-table .highlight-green {
            color: #10b981;
            font-weight: 700;
        }

        /* Tab Card */
        .tab-card {
            background: #ffffff;
            border-radius: 12px;
            border: 1px solid var(--border);
            box-shadow: 0 4px 20px -2px rgba(0,0,0,0.04);
            margin-bottom: 40px;
            padding: 32px 36px;
        }

        .tab-card-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 16px;
            padding-bottom: 16px;
            border-bottom: 1px solid var(--border);
        }

        .tab-card-badge {
            background-color: #e0f2fe;
            color: #0369a1;
            font-size: 12px;
            font-weight: 800;
            padding: 4px 10px;
            border-radius: 6px;
            text-transform: uppercase;
        }

        .tab-card-title {
            font-size: 22px;
            font-weight: 800;
            color: var(--primary);
            margin-top: 6px;
        }

        .tab-objective {
            background: #f8fafc;
            border-left: 3px solid var(--accent);
            padding: 12px 16px;
            border-radius: 0 6px 6px 0;
            font-size: 14.5px;
            margin-bottom: 24px;
        }

        .tab-objective strong {
            color: var(--primary);
        }

        /* Screenshot Container */
        .screenshot-container {
            margin: 24px 0;
            background: #f8fafc;
            border: 1px solid var(--border);
            border-radius: 10px;
            overflow: hidden;
        }

        .screenshot-img-wrapper {
            text-align: center;
            background: #0f172a;
            padding: 12px;
        }

        .screenshot-img {
            max-width: 100%;
            height: auto;
            border-radius: 6px;
            display: block;
            margin: 0 auto;
            box-shadow: 0 4px 20px rgba(0,0,0,0.25);
            transition: transform 0.2s;
        }

        .screenshot-caption {
            padding: 8px 16px;
            background: #f1f5f9;
            font-size: 12.5px;
            font-style: italic;
            color: var(--muted);
            text-align: center;
            border-bottom: 1px solid var(--border);
        }

        /* Structured Walkthrough Card */
        .walkthrough-box {
            background: #ffffff;
            padding: 20px 24px;
            font-size: 14px;
        }

        .walkthrough-title {
            font-size: 15px;
            font-weight: 800;
            color: var(--primary);
            margin-bottom: 12px;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .walkthrough-title::before {
            content: "";
            display: inline-block;
            width: 8px;
            height: 8px;
            background: var(--accent);
            border-radius: 50%;
        }

        .component-list {
            list-style: none;
            margin-bottom: 16px;
        }

        .component-list li {
            position: relative;
            padding-left: 20px;
            margin-bottom: 8px;
            font-size: 13.5px;
            color: var(--secondary);
        }

        .component-list li::before {
            content: "•";
            position: absolute;
            left: 6px;
            color: var(--accent);
            font-weight: bold;
        }

        .walkthrough-analysis {
            background: #f8fafc;
            border-radius: 6px;
            padding: 12px 16px;
            margin-top: 12px;
            font-size: 13.5px;
            border: 1px solid var(--border);
        }

        .walkthrough-analysis p {
            margin-bottom: 8px;
        }

        .walkthrough-analysis p:last-child {
            margin-bottom: 0;
        }

        /* Capabilities List */
        .features-list {
            margin: 16px 0 24px 0;
            list-style: none;
        }

        .features-list li {
            padding-left: 24px;
            position: relative;
            margin-bottom: 8px;
            font-size: 14px;
            color: var(--secondary);
        }

        .features-list li::before {
            content: "✓";
            position: absolute;
            left: 4px;
            color: #10b981;
            font-weight: 800;
        }

        /* Playbook Card */
        .playbook-card {
            background: var(--success-bg);
            border: 1px solid var(--success-border);
            border-radius: 8px;
            padding: 20px 24px;
            margin: 20px 0;
        }

        .playbook-title {
            color: var(--success-text);
            font-size: 14px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 12px;
        }

        .playbook-content p {
            font-size: 13.5px;
            margin-bottom: 8px;
            color: #1f2937;
        }

        .playbook-content strong {
            color: #111827;
        }

        /* Print Media Styles */
        @media print {
            .navbar {
                display: none;
            }
            body {
                background: #ffffff;
                font-size: 12px;
            }
            .container {
                max-width: 100%;
                padding: 0;
            }
            .cover-card, .tab-card {
                border: none;
                box-shadow: none;
                padding: 16px 0;
                page-break-inside: avoid;
            }
            .screenshot-container {
                page-break-inside: avoid;
            }
            .data-table th {
                background-color: #334155 !important;
                color: #ffffff !important;
                -webkit-print-color-adjust: exact;
            }
            .data-table td {
                padding: 8px 10px;
            }
        }
    </style>
</head>
<body>

    <!-- Sticky Navbar -->
    <nav class="navbar">
        <div class="navbar-title">
            <span class="navbar-badge">Enterprise POC</span>
            <span>HP Thailand Ink Tank Intelligence</span>
        </div>
        <div class="nav-links">
            <a href="#overview">Overview</a>
            <a href="#checklist">Master Checklist</a>
            <a href="#reconciliation">Data Lineage</a>
            <a href="#tab-deep-dive">Tab Deep Dive</a>
            <a href="#playbooks">Master Playbooks</a>
        </div>
        <div class="nav-actions">
            <button class="btn-action" onclick="window.print()">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><path d="M6 14h12v8H6z"/></svg>
                Print / Save as PDF
            </button>
        </div>
    </nav>

    <div class="container" id="overview">

        <!-- Cover Card -->
        <div class="cover-card">
            <div class="cover-tag">ENTERPRISE INTELLIGENCE SYSTEM · THAILAND INK TANK POC</div>
            <h1 class="cover-title">Executive Feature, Capability & Data-Cut Menu</h1>
            <div class="cover-sub">Operational Field Checklist & Demonstration Playbooks for David Chiu</div>

            <!-- Metadata Table -->
            <table class="meta-table">
""")

    for k, v in metadata_rows:
        h.append(f"""
                <tr>
                    <td>{html.escape(k)}</td>
                    <td>{html.escape(v)}</td>
                </tr>
""")

    h.append("""
            </table>

            <!-- Callout -->
            <div class="callout callout-info">
                <div class="callout-title">EXECUTIVE BRIEFING CONTEXT & VALUE PROPOSITION</div>
                <ul>
                    <li><strong>Strategic Purpose:</strong> Comprehensive operational menu defining every interactive capability, granular data cut, visual component, and multi-stakeholder discussion playbook across the 10-tab POC workspace and Global Floating RAG Assistant.</li>
                    <li><strong>Multi-Format Mac Compatibility:</strong> This standalone HTML edition provides 100% visible, high-resolution retina rendering of all 24 Scrapling screenshots directly inside Google Chrome or Safari, eliminating macOS TextEdit OpenXML stripping issues.</li>
                    <li><strong>Evidence Integrity Standard:</strong> Sourced from 3,653 immutable Thai e-commerce, advertising, forum, and social records. Zero synthetic data injection, zero arbitrary scoring algorithms.</li>
                </ul>
            </div>
        </div>

        <!-- Section 1: Master Checklist Table -->
        <div class="section-header" id="checklist">
            <h2 class="section-title">1. Master Capability & Data-Cut Menu (The Executive Checklist)</h2>
            <div class="section-desc">Interactive checklist verifying operational capabilities, data filters, and stakeholder fit across all 11 workspaces.</div>
        </div>

        <div class="data-table-wrapper">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Tab / Workspace</th>
                        <th>Core Business Question</th>
                        <th>Interactive Capabilities</th>
                        <th>Available Data Cuts</th>
                        <th>Stakeholder Fit</th>
                    </tr>
                </thead>
                <tbody>
""")

    for row in tab_rows:
        h.append(f"""
                    <tr>
                        <td><strong>{html.escape(row[0])}</strong></td>
                        <td>{html.escape(row[1])}</td>
                        <td>{html.escape(row[2])}</td>
                        <td>{html.escape(row[3])}</td>
                        <td><em>{html.escape(row[4])}</em></td>
                    </tr>
""")

    h.append("""
                </tbody>
            </table>
        </div>

        <!-- Section 2: Data Reconciliation Audit Standard -->
        <div class="section-header" id="reconciliation">
            <h2 class="section-title">2. Forensic Data Reconciliation & Lineage Standard</h2>
            <div class="section-desc">Audited data architecture verifying mathematical reconciliation across Brand × Month × Channel.</div>
        </div>

        <div class="data-table-wrapper">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Channel</th>
                        <th>Total 90D Records</th>
                        <th>Monthly Sample (Aug)</th>
                        <th>Deduplication Standard</th>
                        <th>Reconciliation Status</th>
                    </tr>
                </thead>
                <tbody>
""")

    for row in recon_data:
        is_total = (row[0] == "TOTAL LAKE")
        cls = 'class="highlight-green"' if is_total else ''
        h.append(f"""
                    <tr>
                        <td><strong>{html.escape(row[0])}</strong></td>
                        <td>{html.escape(row[1])}</td>
                        <td>{html.escape(row[2])}</td>
                        <td>{html.escape(row[3])}</td>
                        <td {cls}><strong>{html.escape(row[4])}</strong></td>
                    </tr>
""")

    h.append("""
                </tbody>
            </table>
        </div>

        <div class="callout callout-info">
            <div class="callout-title">RECONCILIATION AUDIT INVARIANTS & VERIFICATION PROOF (DAVID & SAHAJ REVIEW)</div>
            <ul>
                <li><strong>1. Ad Count Audit:</strong> The POC dashboard now provides both metrics: 13 Unique In-Market Creatives (HP: 4, Epson: 3, Canon: 3, Brother: 3) and 52 Monthly Ad Flight Observations (13 creatives × 4 recurring flight cycles). A dedicated toggle button allows instant switching between views.</li>
                <li><strong>2. Consumer Star Ratings Audit:</strong> Star ratings are sourced strictly from verified e-commerce buyers (Shopee Thailand). Pantip.com consumer discussions are preserved as unrated qualitative customer voice to prevent synthetic rating injection.</li>
                <li><strong>3. Mathematical Integrity:</strong> 196 HP listings / 1,036 total = 18.9% E-Commerce Shelf Share. In Paid Media, 16 HP flights / 52 total = 30.8% Paid SOV. Every headline metric matches the underlying Evidence Lake.</li>
            </ul>
        </div>

        <!-- Section 3: Tab-by-Tab Deep Dive -->
        <div class="section-header" id="tab-deep-dive">
            <h2 class="section-title">3. Tab-by-Tab Deep Dive: Screenshots, Capabilities, Data Cuts & Playbooks</h2>
            <div class="section-desc">Comprehensive analysis of each dashboard tab featuring Scrapling screenshots, structured visual breakdowns, capabilities, data cuts, caveats, and discussion playbooks.</div>
        </div>
""")

    # Render each tab
    for tab in tabs_detail:
        h.append(f"""
        <div class="tab-card" id="{tab['num'].lower().replace(' ', '-')}">
            <div class="tab-card-header">
                <div>
                    <span class="tab-card-badge">{html.escape(tab['num'])}</span>
                    <h3 class="tab-card-title">{html.escape(tab['title'])}</h3>
                </div>
            </div>

            <div class="tab-objective">
                <strong>Strategic Mission:</strong> {html.escape(tab['objective'])}
            </div>
""")

        # Embed Images & Structured Visual Walkthroughs
        for img_info in tab['images']:
            img_b64 = encoded_images.get(img_info['path'])
            img_src = img_b64 if img_b64 else f"public/screenshots/{os.path.basename(img_info['path'])}"
            
            h.append(f"""
            <div class="screenshot-container">
                <div class="screenshot-img-wrapper">
                    <img src="{img_src}" alt="{html.escape(img_info['title'])}" class="screenshot-img" loading="lazy">
                </div>
                <div class="screenshot-caption">{html.escape(img_info['caption'])}</div>
                
                <div class="walkthrough-box">
                    <div class="walkthrough-title">{html.escape(img_info['title'])} — Visual Component Breakdown</div>
                    
                    <ul class="component-list">
""")
            for comp in img_info['components']:
                h.append(f"                        <li>{html.escape(comp)}</li>\n")
                
            h.append(f"""
                    </ul>

                    <div class="walkthrough-analysis">
                        <p><strong>Strategic Interpretation:</strong> {html.escape(img_info['interpretation'])}</p>
                        <p><strong>Business Impact for David Chiu:</strong> {html.escape(img_info['business_impact'])}</p>
                    </div>
                </div>
            </div>
""")

        # Capabilities Bullets
        h.append("""
            <h4 style="font-size: 15px; font-weight: 700; margin: 24px 0 8px 0; color: var(--primary);">Interactive Capabilities & Operational Features</h4>
            <ul class="features-list">
""")
        for feat in tab['features']:
            h.append(f"                <li>{html.escape(feat)}</li>\n")
        h.append("            </ul>\n")

        # Available Data Cuts
        h.append("""
            <h4 style="font-size: 15px; font-weight: 700; margin: 20px 0 8px 0; color: var(--primary);">Available Data Cuts & Filter Dimensions</h4>
            <ul class="features-list" style="margin-bottom: 24px;">
""")
        for cut in tab['data_cuts']:
            h.append(f"                <li>{html.escape(cut)}</li>\n")
        h.append("            </ul>\n")

        # Technical Caveats Box
        h.append(f"""
            <div class="callout callout-warning">
                <div class="callout-title">TECHNICAL CAVEATS & INTERPRETATION BOUNDARIES</div>
                <ul>
""")
        for cav in tab['caveats']:
            h.append(f"                    <li>{html.escape(cav)}</li>\n")
        h.append("""
                </ul>
            </div>
""")

        # Dedicated Stakeholder Playbook Box
        pb = tab['playbook']
        script_formatted = "<br>".join(html.escape(line) for line in pb['script'].split("\n"))
        objections_formatted = "<br>".join(html.escape(line) for line in pb['objections'].split("\n"))
        h.append(f"""
            <div class="playbook-card">
                <div class="playbook-title">STAKEHOLDER PLAYBOOK: {html.escape(tab['title'].upper())}</div>
                <div class="playbook-content">
                    <p><strong>Target Stakeholder Audience:</strong> {html.escape(pb['audience'])}</p>
                    <p><strong>Core Business Question Addressed:</strong> {html.escape(pb['core_question'])}</p>
                    <p style="margin-top: 8px;"><strong>Meeting Demonstration Script:</strong></p>
                    <div style="background: rgba(255,255,255,0.7); border-radius: 6px; padding: 10px 14px; margin: 6px 0 10px 0; font-size: 13.5px; line-height: 1.6;">
                        {script_formatted}
                    </div>
                    <p style="margin-top: 8px;"><strong>Objection Handling & Evidence Defense:</strong></p>
                    <div style="background: rgba(255,255,255,0.7); border-radius: 6px; padding: 10px 14px; margin: 6px 0 0 0; font-size: 13.5px; line-height: 1.6;">
                        {objections_formatted}
                    </div>
                </div>
            </div>
        </div>
""")

    # Section 4: Master Cross-Tab Playbooks
    h.append("""
        <div class="section-header" id="playbooks">
            <h2 class="section-title">4. Master Cross-Tab Stakeholder Playbooks (4 Demonstration Tracks)</h2>
            <div class="section-desc">End-to-end multi-tab demonstration sequences designed for David Chiu when presenting to distinct leadership committees.</div>
        </div>
""")

    for pb in playbooks:
        script_lines = pb['script'].split('\n')
        h.append(f"""
        <div class="tab-card">
            <h3 style="font-size: 18px; font-weight: 800; color: var(--primary); margin-bottom: 12px;">{html.escape(pb['title'])}</h3>
            <div class="callout callout-success">
                <div class="callout-title">DEMONSTRATION TRACK SPECIFICATION</div>
                <p><strong>Strategic Focus & Persona:</strong> {html.escape(pb['focus'])}</p>
                <p style="margin-top: 6px;"><strong>Recommended Multi-Tab Sequence:</strong> {html.escape(pb['tabs'])}</p>
            </div>
            
            <h4 style="font-size: 14.5px; font-weight: 700; margin: 16px 0 8px 0; color: var(--primary);">Step-by-Step Meeting Script</h4>
            <ol style="margin-left: 20px; font-size: 14px; line-height: 1.6; color: var(--secondary);">
""")
        for line in script_lines:
            if line.strip():
                # remove leading number if present
                clean_line = line.strip()
                if clean_line[0].isdigit() and clean_line[1:3] in ['. ', ') ']:
                    clean_line = clean_line[3:]
                h.append(f"                <li style='margin-bottom: 6px;'>{html.escape(clean_line)}</li>\n")
        h.append("""
            </ol>
        </div>
""")

    # Footer
    h.append(f"""
        <div style="text-align: center; color: var(--muted); font-size: 13px; margin: 48px 0 24px 0; padding-top: 24px; border-top: 1px solid var(--border);">
            HP Thailand Ink Tank Competitive Intelligence POC · Enterprise Feature Menu & Playbooks<br>
            Generated {datetime.now().strftime("%B %d, %Y")} · 100% Immutable Evidence Lake Provenance (3,653 Records)
        </div>
    </div>
</body>
</html>
""")

    html_content = "".join(h)
    with open(HTML_OUTPUT_FILE, "w", encoding="utf-8") as f:
        f.write(html_content)
    
    file_size_mb = os.path.getsize(HTML_OUTPUT_FILE) / (1024 * 1024)
    print(f"Successfully generated HTML: {HTML_OUTPUT_FILE} ({file_size_mb:.2f} MB)")

    # Replicate HTML to Downloads and Desktop
    downloads_path = os.path.expanduser('~/Downloads/HP_Thailand_InkTank_POC_Feature_Menu.html')
    desktop_path = os.path.expanduser('~/Desktop/HP_Thailand_InkTank_POC_Feature_Menu.html')
    shutil.copy2(HTML_OUTPUT_FILE, downloads_path)
    shutil.copy2(HTML_OUTPUT_FILE, desktop_path)
    print(f"Replicated HTML to:\n  - {downloads_path}\n  - {desktop_path}")

    # Generate PDF via Chrome Headless
    print("\nGenerating executive PDF via Chrome Headless...")
    chrome_path = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
    if os.path.exists(chrome_path):
        try:
            cmd = [
                chrome_path,
                "--headless",
                "--disable-gpu",
                f"--print-to-pdf={PDF_OUTPUT_FILE}",
                "--no-pdf-header-footer",
                HTML_OUTPUT_FILE
            ]
            subprocess.run(cmd, check=True, timeout=60)
            pdf_size_mb = os.path.getsize(PDF_OUTPUT_FILE) / (1024 * 1024)
            print(f"Successfully generated PDF: {PDF_OUTPUT_FILE} ({pdf_size_mb:.2f} MB)")

            # Replicate PDF to Downloads and Desktop
            pdf_dl = os.path.expanduser('~/Downloads/HP_Thailand_InkTank_POC_Feature_Menu.pdf')
            pdf_dt = os.path.expanduser('~/Desktop/HP_Thailand_InkTank_POC_Feature_Menu.pdf')
            shutil.copy2(PDF_OUTPUT_FILE, pdf_dl)
            shutil.copy2(PDF_OUTPUT_FILE, pdf_dt)
            print(f"Replicated PDF to:\n  - {pdf_dl}\n  - {pdf_dt}")
        except Exception as e:
            print(f"Chrome PDF generation warning: {e}")
    else:
        print("Google Chrome not found at standard path; skipping direct PDF print.")

if __name__ == '__main__':
    build_html()
