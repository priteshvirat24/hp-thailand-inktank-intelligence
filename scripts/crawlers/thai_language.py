"""
Thai Language Normalization & Processing Utilities for Ink Tank Scraping
Handles Thai character encodings, Buddhist Era (BE) dates, currency parsing,
printer terminology, and ink tank validation filters.
"""

import re
from datetime import datetime, timezone
from typing import Optional, Tuple, Dict, Any

# Thai Month Lookup Table (Short & Full)
THAI_MONTHS: Dict[str, int] = {
    'ม.ค.': 1, 'มกราคม': 1, 'jan': 1,
    'ก.พ.': 2, 'กุมภาพันธ์': 2, 'feb': 2,
    'มี.ค.': 3, 'มีนาคม': 3, 'mar': 3,
    'เม.ย.': 4, 'เมษายน': 4, 'apr': 4,
    'พ.ค.': 5, 'พฤษภาคม': 5, 'may': 5,
    'มิ.ย.': 6, 'มิถุนายน': 6, 'jun': 6,
    'ก.ค.': 7, 'กรกฎาคม': 7, 'jul': 7,
    'ส.ค.': 8, 'สิงหาคม': 8, 'aug': 8,
    'ก.ย.': 9, 'กันยายน': 9, 'sep': 9,
    'ต.ค.': 10, 'ตุลาคม': 10, 'oct': 10,
    'พ.ย.': 11, 'พฤศจิกายน': 11, 'nov': 11,
    'ธ.ค.': 12, 'ธันวาคม': 12, 'dec': 12,
}

# Positive Thai & English keywords confirming Ink Tank Printer hardware
INK_TANK_POSITIVE_KEYWORDS = [
    'smart tank', 'smarttank', 'ecotank', 'megatank', 'inkbenefit', 'ink tank', 'inktank',
    'เครื่องพิมพ์แทงค์', 'แท้งค์แท้', 'แทงค์แท้', 'แท้งค์', 'แทงค์', 'อิงค์แทงค์', 'อิงค์เจ็ท',
    'เครื่องปริ้นแทงค์', 'เครื่องปริ้นท์แทงค์', 'เครื่องพิมพ์อิงค์แทงค์', 'ปริ้นเตอร์แทงค์',
    'ciss', 'ระบบแทงค์', 'all-in-one', 'มัลติฟังก์ชัน'
]

# Strict exclusions: consumable supplies, accessories, and laser printers
INK_TANK_EXCLUSION_KEYWORDS = [
    'ขวดหมึก', 'ตลับหมึก', 'หมึกเติม', 'น้ำหมึก', 'หมึกแท้ขวด', 'หัวพิมพ์', 'กล่องซับหมึก',
    'ตลับ', 'โทนเนอร์', 'ริบบอน', 'กระดาษ', 'อะแดปเตอร์', 'สายแพร', 'ลูกยาง',
    'ink bottle', 'refill ink', 'bottle ink', 'print head', 'printhead', 'ink cartridge',
    'maintenance box', 'waste ink', 'toner', 'ribbon', 'laserjet', 'laser', 'เลเซอร์',
    'gt51', 'gt52', 'gt53', '003', '001', 'gi-790', 'gi-71', 'gi-70', 'btd60', 'bt5000', 'bt6000'
]


def clean_thai_text(text: str) -> str:
    """Normalize whitespace and clean Thai Unicode string."""
    if not text:
        return ""
    # Strip non-printable and standardize spaces
    normalized = re.sub(r'[\u200b\u200e\u200f\ufeff]', '', text)
    normalized = re.sub(r'\s+', ' ', normalized)
    return normalized.strip()


def parse_thai_price(price_str: Any) -> Optional[float]:
    """
    Extract clean numeric price in THB from various Thai price formats:
    - '฿5,290' -> 5290.0
    - '5,290 บาท' -> 5290.0
    - 'ลดเหลือ 4,990.-' -> 4990.0
    - '4,990 - 5,490' -> 4990.0 (lowest price in range)
    """
    if price_str is None:
        return None
    if isinstance(price_str, (int, float)):
        return float(price_str) if price_str > 0 else None

    cleaned = str(price_str).replace('฿', '').replace('บาท', '').replace('THB', '').replace('.-', '').strip()
    # If range, take the first/lower number
    if '-' in cleaned:
        cleaned = cleaned.split('-')[0].strip()
    elif '~' in cleaned:
        cleaned = cleaned.split('~')[0].strip()

    # Extract digits and decimal point
    match = re.search(r'[\d,]+(?:\.\d+)?', cleaned)
    if match:
        numeric_str = match.group(0).replace(',', '')
        try:
            val = float(numeric_str)
            # Sanity check: Ink Tank printers in Thailand are between 2,000 and 35,000 THB
            if 1500 <= val <= 100000:
                return val
            # If Shopee cents (e.g. 529000000)
            if val > 1000000:
                scaled = val / 100000
                if 1500 <= scaled <= 100000:
                    return scaled
        except ValueError:
            return None
    return None


def convert_thai_buddhist_date(date_str: str) -> Optional[str]:
    """
    Parse Thai dates including Buddhist Era years (e.g. 2569 -> 2026, 2567 -> 2024).
    Returns ISO date string 'YYYY-MM-DD' or None.
    """
    if not date_str:
        return None

    cleaned = clean_thai_text(date_str.lower())

    # Format 1: '15 ส.ค. 2569' or '15 สิงหาคม 2569'
    pattern_thai = r'(\d{1,2})\s+([ก-๙\.]+)\s+(\d{4})'
    match = re.search(pattern_thai, cleaned)
    if match:
        day = int(match.group(1))
        month_name = match.group(2)
        year = int(match.group(3))

        # Convert Buddhist Era to Gregorian if > 2400
        if year > 2400:
            year -= 543

        month = THAI_MONTHS.get(month_name)
        if month:
            try:
                dt = datetime(year, month, day)
                return dt.strftime('%Y-%m-%d')
            except ValueError:
                pass

    # Format 2: ISO YYYY-MM-DD
    match_iso = re.search(r'(\d{4})-(\d{2})-(\d{2})', cleaned)
    if match_iso:
        year = int(match_iso.group(1))
        month = int(match_iso.group(2))
        day = int(match_iso.group(3))
        if year > 2400:
            year -= 543
        return f"{year:04d}-{month:02d}-{day:02d}"

    return None


def is_genuine_ink_tank_printer(title: str, description: str = "", price_thb: Optional[float] = None) -> Tuple[bool, str]:
    """
    Validates if a scraped product is a genuine Ink Tank Printer hardware unit.
    Returns (is_valid: bool, reason: str).
    Filters out ink refill bottles, consumables, print heads, and laser machines.
    """
    text = (title + " " + description).lower()

    # Gate 1: Check for explicit exclusions
    for exc in INK_TANK_EXCLUSION_KEYWORDS:
        # Match whole word or bounded pattern in Thai/English
        if exc in text:
            # Exception: some titles mention 'แถมหมึกแท้' (includes genuine ink) or 'พร้อมหมึก'
            if any(bundle in text for bundle in ['แถมหมึก', 'พร้อมหมึก', 'หมึกแท้ครบชุด', 'เครื่องพร้อมหมึก']):
                # It's a printer bundled with ink
                pass
            else:
                return False, f"Matched consumable/exclusion keyword: '{exc}'"

    # Gate 2: Positive Ink Tank confirmation
    has_positive = any(kw in text for kw in INK_TANK_POSITIVE_KEYWORDS)

    # Gate 3: Model number check (e.g. 580, 515, L3250, G3010, T420W)
    has_model = bool(re.search(r'\b(580|515|670|720|750|315|415|l3210|l3250|l5290|l4260|l1250|l6270|m1120|g2010|g3010|g3020|g1010|g4010|g3730|g2730|t420w|t520w|t220|t720dw|t920dw|t4000dw|t4500dw)\b', text))

    if not has_positive and not has_model:
        return False, "No ink tank indicators or recognized model numbers found."

    # Gate 4: Price sanity check (Printer hardware cannot cost 150 THB like an ink bottle)
    if price_thb is not None and price_thb < 1800:
        return False, f"Price {price_thb} THB is below printer threshold (likely ink bottle or accessory)."

    return True, "Valid Ink Tank Printer"
