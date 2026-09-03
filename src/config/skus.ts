/**
 * Authoritative Canonical SKU Master Registry
 * Single Source of Truth for all Ink Tank models in scope.
 * Defines the 28 core benchmark models and the full 65-model market portfolio.
 */

import { SkuMasterDefinition, TargetBrand } from '@/types/brands';

// ─── 28 Core Benchmark Canonical SKUs (Strict Specification Universe) ───────
export const CANONICAL_SKUS: readonly SkuMasterDefinition[] = [
  {
      "sku_id": "HP-ST-580",
      "brand": "HP",
      "family": "Smart Tank",
      "model_name": "Smart Tank 580",
      "aliases": [
          "Smart Tank 580 All-in-One",
          "HP 580 Smart Tank",
          "HP 580 Wireless",
          "HP Smart Tank 580",
          "Smart Tank 580 Wireless All-in-One"
      ],
      "normalized_model": "Smart Tank 580",
      "target_segment": "Consumer / Home / Personal",
      "functions": [
          "Print",
          "Scan",
          "Copy",
          "Wi-Fi"
      ],
      "known_keywords": [
          "580",
          "Smart Tank 580",
          "SmartTank 580"
      ],
      "competitor_equivalents": [
          "EcoTank L3250",
          "PIXMA G3730",
          "DCP-T520W"
      ],
      "known_exclusions": [
          "GT52",
          "GT53",
          "580 ink bottle",
          "printhead 580"
      ],
      "claimed_benefits": [
          "Up to 6,000 pages black / 8,000 color",
          "Self-healing Wi-Fi",
          "Smart App"
      ],
      "launch_rrp_thb": 5590
  },
  {
      "sku_id": "HP-ST-515",
      "brand": "HP",
      "family": "Smart Tank",
      "model_name": "Smart Tank 515",
      "aliases": [
          "Smart Tank 515 Wireless",
          "HP 515 Smart Tank",
          "HP Smart Tank 515",
          "Smart Tank 515 All-in-One"
      ],
      "normalized_model": "Smart Tank 515",
      "target_segment": "Consumer / Home / Personal",
      "functions": [
          "Print",
          "Scan",
          "Copy",
          "Wi-Fi"
      ],
      "known_keywords": [
          "515",
          "Smart Tank 515",
          "SmartTank 515"
      ],
      "competitor_equivalents": [
          "EcoTank L3210",
          "PIXMA G3020"
      ],
      "known_exclusions": [
          "GT52",
          "GT53",
          "515 ink bottle"
      ],
      "claimed_benefits": [
          "High capacity tank"
      ],
      "launch_rrp_thb": 5290
  },
  {
      "sku_id": "HP-ST-670",
      "brand": "HP",
      "family": "Smart Tank",
      "model_name": "Smart Tank 670",
      "aliases": [
          "Smart Tank 670 Duplex",
          "HP 670 Smart Tank",
          "HP Smart Tank 670",
          "Smart Tank 670 All-in-One"
      ],
      "normalized_model": "Smart Tank 670",
      "target_segment": "Small Business / SMB (<100 employees)",
      "functions": [
          "Print",
          "Scan",
          "Copy",
          "Auto-Duplex"
      ],
      "known_keywords": [
          "670",
          "Smart Tank 670",
          "SmartTank 670"
      ],
      "competitor_equivalents": [
          "EcoTank L4260",
          "DCP-T720DW"
      ],
      "known_exclusions": [
          "GT52",
          "GT53",
          "670 ink"
      ],
      "claimed_benefits": [
          "Automatic 2-sided printing"
      ],
      "launch_rrp_thb": 6990
  },
  {
      "sku_id": "HP-ST-720",
      "brand": "HP",
      "family": "Smart Tank",
      "model_name": "Smart Tank 720",
      "aliases": [
          "Smart Tank 720 Duplex Wireless",
          "HP 720 Smart Tank",
          "HP Smart Tank 720",
          "Smart Tank 720 All-in-One"
      ],
      "normalized_model": "Smart Tank 720",
      "target_segment": "Small Business / SMB (<100 employees)",
      "functions": [
          "Print",
          "Scan",
          "Copy",
          "Auto-Duplex",
          "Wi-Fi"
      ],
      "known_keywords": [
          "720",
          "Smart Tank 720",
          "SmartTank 720"
      ],
      "competitor_equivalents": [
          "EcoTank L4260",
          "DCP-T720DW"
      ],
      "known_exclusions": [
          "GT52",
          "GT53",
          "720 ink"
      ],
      "claimed_benefits": [
          "Smart guided buttons",
          "Auto 2-sided"
      ],
      "launch_rrp_thb": 7990
  },
  {
      "sku_id": "HP-ST-750",
      "brand": "HP",
      "family": "Smart Tank",
      "model_name": "Smart Tank 750",
      "aliases": [
          "Smart Tank 750 ADF Wireless",
          "HP 750 Smart Tank",
          "HP Smart Tank 750",
          "Smart Tank 750 All-in-One"
      ],
      "normalized_model": "Smart Tank 750",
      "target_segment": "Small Business / SMB (<100 employees)",
      "functions": [
          "Print",
          "Scan",
          "Copy",
          "ADF",
          "Auto-Duplex",
          "Wi-Fi"
      ],
      "known_keywords": [
          "750",
          "Smart Tank 750",
          "SmartTank 750"
      ],
      "competitor_equivalents": [
          "EcoTank L5290",
          "PIXMA G4010",
          "MFC-T920DW"
      ],
      "known_exclusions": [
          "GT52",
          "GT53",
          "750 ink"
      ],
      "claimed_benefits": [
          "35-sheet automatic document feeder"
      ],
      "launch_rrp_thb": 8990
  },
  {
      "sku_id": "HP-ST-315",
      "brand": "HP",
      "family": "Smart Tank",
      "model_name": "Smart Tank 315",
      "aliases": [
          "Ink Tank 315",
          "HP Smart Tank 315",
          "HP 315 All-in-One",
          "HP Ink Tank 315"
      ],
      "normalized_model": "Smart Tank 315",
      "target_segment": "Consumer / Home / Personal",
      "functions": [
          "Print",
          "Scan",
          "Copy"
      ],
      "known_keywords": [
          "315",
          "Smart Tank 315",
          "Ink Tank 315"
      ],
      "competitor_equivalents": [
          "EcoTank L3210",
          "PIXMA G2010",
          "DCP-T220"
      ],
      "known_exclusions": [
          "GT51",
          "GT52",
          "315 ink"
      ],
      "claimed_benefits": [
          "Reliable everyday printing"
      ],
      "launch_rrp_thb": 3990
  },
  {
      "sku_id": "HP-ST-415",
      "brand": "HP",
      "family": "Smart Tank",
      "model_name": "Smart Tank 415",
      "aliases": [
          "Ink Tank 415 Wireless",
          "HP Smart Tank 415",
          "HP 415",
          "HP Ink Tank 415"
      ],
      "normalized_model": "Smart Tank 415",
      "target_segment": "Consumer / Home / Personal",
      "functions": [
          "Print",
          "Scan",
          "Copy",
          "Wi-Fi"
      ],
      "known_keywords": [
          "415",
          "Smart Tank 415",
          "Ink Tank 415"
      ],
      "competitor_equivalents": [
          "EcoTank L3250",
          "PIXMA G3020"
      ],
      "known_exclusions": [
          "GT51",
          "GT52",
          "415 ink"
      ],
      "claimed_benefits": [
          "Wireless convenience"
      ],
      "launch_rrp_thb": 4690
  },
  {
      "sku_id": "EPSON-ET-L3210",
      "brand": "Epson",
      "family": "EcoTank",
      "model_name": "EcoTank L3210",
      "aliases": [
          "L3210",
          "Epson L3210",
          "EcoTank L3210 All-in-One"
      ],
      "normalized_model": "EcoTank L3210",
      "target_segment": "Consumer / Home / Personal",
      "functions": [
          "Print",
          "Scan",
          "Copy"
      ],
      "known_keywords": [
          "L3210",
          "EcoTank L3210"
      ],
      "competitor_equivalents": [
          "Smart Tank 515",
          "PIXMA G2010",
          "DCP-T220"
      ],
      "known_exclusions": [
          "003 ink",
          "L3210 ink"
      ],
      "claimed_benefits": [
          "Heat-Free Technology",
          "Low cost per page"
      ],
      "launch_rrp_thb": 4390
  },
  {
      "sku_id": "EPSON-ET-L3250",
      "brand": "Epson",
      "family": "EcoTank",
      "model_name": "EcoTank L3250",
      "aliases": [
          "L3250",
          "Epson L3250",
          "EcoTank L3250 Wi-Fi"
      ],
      "normalized_model": "EcoTank L3250",
      "target_segment": "Consumer / Home / Personal",
      "functions": [
          "Print",
          "Scan",
          "Copy",
          "Wi-Fi"
      ],
      "known_keywords": [
          "L3250",
          "EcoTank L3250"
      ],
      "competitor_equivalents": [
          "Smart Tank 580",
          "PIXMA G3010",
          "DCP-T420W"
      ],
      "known_exclusions": [
          "003 ink",
          "L3250 ink"
      ],
      "claimed_benefits": [
          "Wi-Fi & Wi-Fi Direct",
          "Epson Smart Panel app"
      ],
      "launch_rrp_thb": 5290
  },
  {
      "sku_id": "EPSON-ET-L3256",
      "brand": "Epson",
      "family": "EcoTank",
      "model_name": "EcoTank L3256",
      "aliases": [
          "L3256",
          "Epson L3256 White",
          "EcoTank L3256"
      ],
      "normalized_model": "EcoTank L3256",
      "target_segment": "Consumer / Home / Personal",
      "functions": [
          "Print",
          "Scan",
          "Copy",
          "Wi-Fi"
      ],
      "known_keywords": [
          "L3256",
          "EcoTank L3256"
      ],
      "competitor_equivalents": [
          "Smart Tank 580",
          "PIXMA G3730"
      ],
      "known_exclusions": [
          "003 ink"
      ],
      "claimed_benefits": [
          "White chassis design",
          "Wi-Fi Direct"
      ],
      "launch_rrp_thb": 5390
  },
  {
      "sku_id": "EPSON-ET-L4260",
      "brand": "Epson",
      "family": "EcoTank",
      "model_name": "EcoTank L4260",
      "aliases": [
          "L4260",
          "Epson L4260 Duplex",
          "EcoTank L4260"
      ],
      "normalized_model": "EcoTank L4260",
      "target_segment": "Small Business / SMB (<100 employees)",
      "functions": [
          "Print",
          "Scan",
          "Copy",
          "Auto-Duplex",
          "Wi-Fi"
      ],
      "known_keywords": [
          "L4260",
          "EcoTank L4260"
      ],
      "competitor_equivalents": [
          "Smart Tank 670",
          "Smart Tank 720",
          "DCP-T720DW"
      ],
      "known_exclusions": [
          "001 ink"
      ],
      "claimed_benefits": [
          "Auto 2-sided printing",
          "1.44 inch color LCD"
      ],
      "launch_rrp_thb": 7990
  },
  {
      "sku_id": "EPSON-ET-L5290",
      "brand": "Epson",
      "family": "EcoTank",
      "model_name": "EcoTank L5290",
      "aliases": [
          "L5290",
          "Epson L5290 ADF",
          "EcoTank L5290 Fax"
      ],
      "normalized_model": "EcoTank L5290",
      "target_segment": "Small Business / SMB (<100 employees)",
      "functions": [
          "Print",
          "Scan",
          "Copy",
          "Fax",
          "ADF",
          "Wi-Fi"
      ],
      "known_keywords": [
          "L5290",
          "EcoTank L5290"
      ],
      "competitor_equivalents": [
          "Smart Tank 750",
          "PIXMA G4010",
          "MFC-T920DW"
      ],
      "known_exclusions": [
          "003 ink"
      ],
      "claimed_benefits": [
          "30-page ADF",
          "Fax capability"
      ],
      "launch_rrp_thb": 8690
  },
  {
      "sku_id": "EPSON-ET-L6270",
      "brand": "Epson",
      "family": "EcoTank",
      "model_name": "EcoTank L6270",
      "aliases": [
          "L6270",
          "Epson L6270 PrecisionCore",
          "EcoTank L6270"
      ],
      "normalized_model": "EcoTank L6270",
      "target_segment": "Small Business / SMB (<100 employees)",
      "functions": [
          "Print",
          "Scan",
          "Copy",
          "Auto-Duplex",
          "ADF",
          "Wi-Fi"
      ],
      "known_keywords": [
          "L6270",
          "EcoTank L6270"
      ],
      "competitor_equivalents": [
          "Smart Tank 750",
          "PIXMA G7070"
      ],
      "known_exclusions": [
          "001 ink"
      ],
      "claimed_benefits": [
          "PrecisionCore printhead",
          "Fast business printing"
      ],
      "launch_rrp_thb": 10990
  },
  {
      "sku_id": "EPSON-ET-L15150",
      "brand": "Epson",
      "family": "EcoTank",
      "model_name": "EcoTank L15150",
      "aliases": [
          "L15150",
          "Epson L15150 A3",
          "EcoTank L15150 A3 Duplex"
      ],
      "normalized_model": "EcoTank L15150",
      "target_segment": "Small Business / SMB (<100 employees)",
      "functions": [
          "Print",
          "Scan",
          "Copy",
          "Fax",
          "Auto-Duplex",
          "ADF",
          "Wi-Fi",
          "A3"
      ],
      "known_keywords": [
          "L15150",
          "EcoTank L15150"
      ],
      "competitor_equivalents": [
          "PIXMA G7070",
          "MFC-T920DW"
      ],
      "known_exclusions": [
          "008 ink"
      ],
      "claimed_benefits": [
          "Full A3+ printing & scanning",
          "DURABrite ET pigment inks"
      ],
      "launch_rrp_thb": 24900
  },
  {
      "sku_id": "CANON-MT-G1010",
      "brand": "Canon",
      "family": "MegaTank",
      "model_name": "PIXMA G1010",
      "aliases": [
          "G1010",
          "Canon G1010",
          "PIXMA G1010 Single Function"
      ],
      "normalized_model": "PIXMA G1010",
      "target_segment": "Consumer / Home / Personal",
      "functions": [
          "Print"
      ],
      "known_keywords": [
          "G1010",
          "PIXMA G1010"
      ],
      "competitor_equivalents": [
          "Smart Tank 315",
          "EcoTank L3210"
      ],
      "known_exclusions": [
          "GI-790",
          "G1010 ink"
      ],
      "claimed_benefits": [
          "Low purchase cost",
          "Compact footprint"
      ],
      "launch_rrp_thb": 3290
  },
  {
      "sku_id": "CANON-MT-G2010",
      "brand": "Canon",
      "family": "MegaTank",
      "model_name": "PIXMA G2010",
      "aliases": [
          "G2010",
          "Canon G2010",
          "PIXMA G2010 All-in-One"
      ],
      "normalized_model": "PIXMA G2010",
      "target_segment": "Consumer / Home / Personal",
      "functions": [
          "Print",
          "Scan",
          "Copy"
      ],
      "known_keywords": [
          "G2010",
          "PIXMA G2010"
      ],
      "competitor_equivalents": [
          "Smart Tank 315",
          "EcoTank L3210",
          "DCP-T220"
      ],
      "known_exclusions": [
          "GI-790",
          "G2010 ink"
      ],
      "claimed_benefits": [
          "Built-in integrated ink tanks"
      ],
      "launch_rrp_thb": 3890
  },
  {
      "sku_id": "CANON-MT-G2020",
      "brand": "Canon",
      "family": "MegaTank",
      "model_name": "PIXMA G2020",
      "aliases": [
          "G2020",
          "Canon G2020",
          "PIXMA G2020 All-in-One"
      ],
      "normalized_model": "PIXMA G2020",
      "target_segment": "Consumer / Home / Personal",
      "functions": [
          "Print",
          "Scan",
          "Copy"
      ],
      "known_keywords": [
          "G2020",
          "PIXMA G2020"
      ],
      "competitor_equivalents": [
          "Smart Tank 515",
          "EcoTank L3210"
      ],
      "known_exclusions": [
          "GI-71",
          "G2020 ink"
      ],
      "claimed_benefits": [
          "User-replaceable maintenance cartridge"
      ],
      "launch_rrp_thb": 4190
  },
  {
      "sku_id": "CANON-MT-G3010",
      "brand": "Canon",
      "family": "MegaTank",
      "model_name": "PIXMA G3010",
      "aliases": [
          "G3010",
          "Canon G3010",
          "PIXMA G3010 Wireless"
      ],
      "normalized_model": "PIXMA G3010",
      "target_segment": "Consumer / Home / Personal",
      "functions": [
          "Print",
          "Scan",
          "Copy",
          "Wi-Fi"
      ],
      "known_keywords": [
          "G3010",
          "PIXMA G3010"
      ],
      "competitor_equivalents": [
          "Smart Tank 580",
          "EcoTank L3250",
          "DCP-T420W"
      ],
      "known_exclusions": [
          "GI-790",
          "G3010 ink"
      ],
      "claimed_benefits": [
          "One-touch Direct Wireless connection"
      ],
      "launch_rrp_thb": 4990
  },
  {
      "sku_id": "CANON-MT-G3020",
      "brand": "Canon",
      "family": "MegaTank",
      "model_name": "PIXMA G3020",
      "aliases": [
          "G3020",
          "Canon G3020",
          "PIXMA G3020 Wireless"
      ],
      "normalized_model": "PIXMA G3020",
      "target_segment": "Consumer / Home / Personal",
      "functions": [
          "Print",
          "Scan",
          "Copy",
          "Wi-Fi"
      ],
      "known_keywords": [
          "G3020",
          "PIXMA G3020"
      ],
      "competitor_equivalents": [
          "Smart Tank 580",
          "EcoTank L3250"
      ],
      "known_exclusions": [
          "GI-71",
          "G3020 ink"
      ],
      "claimed_benefits": [
          "2-line mono LCD",
          "Replaceable maintenance box"
      ],
      "launch_rrp_thb": 5390
  },
  {
      "sku_id": "CANON-MT-G3730",
      "brand": "Canon",
      "family": "MegaTank",
      "model_name": "PIXMA G3730",
      "aliases": [
          "G3730",
          "Canon G3730",
          "PIXMA G3730 Wireless"
      ],
      "normalized_model": "PIXMA G3730",
      "target_segment": "Consumer / Home / Personal",
      "functions": [
          "Print",
          "Scan",
          "Copy",
          "Wi-Fi"
      ],
      "known_keywords": [
          "G3730",
          "PIXMA G3730"
      ],
      "competitor_equivalents": [
          "Smart Tank 580",
          "EcoTank L3256"
      ],
      "known_exclusions": [
          "GI-71S"
      ],
      "claimed_benefits": [
          "Modern compact chassis",
          "Mobile printing"
      ],
      "launch_rrp_thb": 5490
  },
  {
      "sku_id": "CANON-MT-G4010",
      "brand": "Canon",
      "family": "MegaTank",
      "model_name": "PIXMA G4010",
      "aliases": [
          "G4010",
          "Canon G4010 ADF Fax",
          "PIXMA G4010"
      ],
      "normalized_model": "PIXMA G4010",
      "target_segment": "Small Business / SMB (<100 employees)",
      "functions": [
          "Print",
          "Scan",
          "Copy",
          "Fax",
          "ADF",
          "Wi-Fi"
      ],
      "known_keywords": [
          "G4010",
          "PIXMA G4010"
      ],
      "competitor_equivalents": [
          "Smart Tank 750",
          "EcoTank L5290",
          "MFC-T920DW"
      ],
      "known_exclusions": [
          "GI-790",
          "G4010 ink"
      ],
      "claimed_benefits": [
          "20-sheet ADF",
          "Full office productivity"
      ],
      "launch_rrp_thb": 7990
  },
  {
      "sku_id": "CANON-MT-G7070",
      "brand": "Canon",
      "family": "MegaTank",
      "model_name": "PIXMA G7070",
      "aliases": [
          "G7070",
          "Canon G7070 Duplex ADF",
          "PIXMA G7070"
      ],
      "normalized_model": "PIXMA G7070",
      "target_segment": "Small Business / SMB (<100 employees)",
      "functions": [
          "Print",
          "Scan",
          "Copy",
          "Fax",
          "Auto-Duplex",
          "ADF",
          "Ethernet",
          "Wi-Fi"
      ],
      "known_keywords": [
          "G7070",
          "PIXMA G7070"
      ],
      "competitor_equivalents": [
          "Smart Tank 750",
          "EcoTank L6270"
      ],
      "known_exclusions": [
          "GI-70"
      ],
      "claimed_benefits": [
          "Auto 2-sided printing",
          "350-sheet paper capacity"
      ],
      "launch_rrp_thb": 11900
  },
  {
      "sku_id": "BROTHER-IB-T220",
      "brand": "Brother",
      "family": "InkBenefit",
      "model_name": "DCP-T220",
      "aliases": [
          "T220",
          "Brother T220",
          "DCP-T220 InkBenefit"
      ],
      "normalized_model": "DCP-T220",
      "target_segment": "Consumer / Home / Personal",
      "functions": [
          "Print",
          "Scan",
          "Copy"
      ],
      "known_keywords": [
          "T220",
          "DCP-T220"
      ],
      "competitor_equivalents": [
          "Smart Tank 315",
          "EcoTank L3210",
          "PIXMA G2010"
      ],
      "known_exclusions": [
          "BTD60BK",
          "BT5000",
          "T220 ink"
      ],
      "claimed_benefits": [
          "Transparent cover for ink levels",
          "Simple USB setup"
      ],
      "launch_rrp_thb": 3990
  },
  {
      "sku_id": "BROTHER-IB-T420W",
      "brand": "Brother",
      "family": "InkBenefit",
      "model_name": "DCP-T420W",
      "aliases": [
          "T420W",
          "Brother T420W",
          "DCP-T420W Wireless"
      ],
      "normalized_model": "DCP-T420W",
      "target_segment": "Consumer / Home / Personal",
      "functions": [
          "Print",
          "Scan",
          "Copy",
          "Wi-Fi"
      ],
      "known_keywords": [
          "T420W",
          "DCP-T420W"
      ],
      "competitor_equivalents": [
          "Smart Tank 580",
          "EcoTank L3250",
          "PIXMA G3010"
      ],
      "known_exclusions": [
          "BTD60BK",
          "BT5000"
      ],
      "claimed_benefits": [
          "Wireless mobile printing",
          "Fast print speeds"
      ],
      "launch_rrp_thb": 4990
  },
  {
      "sku_id": "BROTHER-IB-T520W",
      "brand": "Brother",
      "family": "InkBenefit",
      "model_name": "DCP-T520W",
      "aliases": [
          "T520W",
          "Brother T520W",
          "DCP-T520W Wireless"
      ],
      "normalized_model": "DCP-T520W",
      "target_segment": "Consumer / Home / Personal",
      "functions": [
          "Print",
          "Scan",
          "Copy",
          "Wi-Fi"
      ],
      "known_keywords": [
          "T520W",
          "DCP-T520W"
      ],
      "competitor_equivalents": [
          "Smart Tank 580",
          "EcoTank L3250",
          "PIXMA G3020"
      ],
      "known_exclusions": [
          "BTD60BK",
          "BT5000"
      ],
      "claimed_benefits": [
          "17/9.5 ipm fast printing",
          "1-line LCD display"
      ],
      "launch_rrp_thb": 5990
  },
  {
      "sku_id": "BROTHER-IB-T720DW",
      "brand": "Brother",
      "family": "InkBenefit",
      "model_name": "DCP-T720DW",
      "aliases": [
          "T720DW",
          "Brother T720DW",
          "DCP-T720DW Duplex ADF"
      ],
      "normalized_model": "DCP-T720DW",
      "target_segment": "Small Business / SMB (<100 employees)",
      "functions": [
          "Print",
          "Scan",
          "Copy",
          "Auto-Duplex",
          "ADF",
          "Wi-Fi"
      ],
      "known_keywords": [
          "T720DW",
          "DCP-T720DW"
      ],
      "competitor_equivalents": [
          "Smart Tank 670",
          "Smart Tank 720",
          "EcoTank L4260"
      ],
      "known_exclusions": [
          "BTD60BK",
          "BT5000"
      ],
      "claimed_benefits": [
          "Automatic 2-sided printing",
          "20-sheet ADF"
      ],
      "launch_rrp_thb": 7490
  },
  {
      "sku_id": "BROTHER-IB-T820DW",
      "brand": "Brother",
      "family": "InkBenefit",
      "model_name": "DCP-T820DW",
      "aliases": [
          "T820DW",
          "Brother T820DW",
          "DCP-T820DW Ethernet"
      ],
      "normalized_model": "DCP-T820DW",
      "target_segment": "Small Business / SMB (<100 employees)",
      "functions": [
          "Print",
          "Scan",
          "Copy",
          "Auto-Duplex",
          "ADF",
          "Ethernet",
          "Wi-Fi"
      ],
      "known_keywords": [
          "T820DW",
          "DCP-T820DW"
      ],
      "competitor_equivalents": [
          "Smart Tank 750",
          "EcoTank L6270"
      ],
      "known_exclusions": [
          "BTD60BK",
          "BT5000"
      ],
      "claimed_benefits": [
          "Gigabit Ethernet",
          "Heavy duty printing"
      ],
      "launch_rrp_thb": 8990
  },
  {
      "sku_id": "BROTHER-IB-T920DW",
      "brand": "Brother",
      "family": "InkBenefit",
      "model_name": "MFC-T920DW",
      "aliases": [
          "T920DW",
          "Brother T920DW Fax",
          "MFC-T920DW"
      ],
      "normalized_model": "MFC-T920DW",
      "target_segment": "Small Business / SMB (<100 employees)",
      "functions": [
          "Print",
          "Scan",
          "Copy",
          "Fax",
          "Auto-Duplex",
          "ADF",
          "Ethernet",
          "Wi-Fi"
      ],
      "known_keywords": [
          "T920DW",
          "MFC-T920DW"
      ],
      "competitor_equivalents": [
          "Smart Tank 750",
          "EcoTank L5290",
          "PIXMA G4010"
      ],
      "known_exclusions": [
          "BTD60BK",
          "BT5000"
      ],
      "claimed_benefits": [
          "Full office Fax/Duplex/ADF",
          "1.8 inch color LCD"
      ],
      "launch_rrp_thb": 9490
  },
];

export const CANONICAL_SKU_COUNT = CANONICAL_SKUS.length;

// ─── 37 Expanded Market SKUs (Observed in Thailand Retail Channels) ─────────
export const EXPANDED_MARKET_SKUS: readonly SkuMasterDefinition[] = [
  {
      "sku_id": "HP-ST-525",
      "brand": "HP",
      "family": "Smart Tank",
      "model_name": "Smart Tank 525",
      "aliases": [
          "Smart Tank 525",
          "HP Smart Tank 525",
          "HP Smart Tank 525"
      ],
      "normalized_model": "Smart Tank 525",
      "target_segment": "Consumer / Home / Personal",
      "functions": [
          "Print",
          "Scan",
          "Copy"
      ],
      "known_keywords": [
          "525",
          "Smart Tank 525"
      ],
      "competitor_equivalents": [],
      "known_exclusions": [
          "ink bottle",
          "refill",
          "printhead"
      ],
      "claimed_benefits": [
          "Integrated factory tank",
          "Genuine ink system"
      ],
      "launch_rrp_thb": 4990
  },
  {
      "sku_id": "HP-ST-500",
      "brand": "HP",
      "family": "Smart Tank",
      "model_name": "Smart Tank 500",
      "aliases": [
          "Smart Tank 500",
          "HP Smart Tank 500",
          "HP Smart Tank 500"
      ],
      "normalized_model": "Smart Tank 500",
      "target_segment": "Consumer / Home / Personal",
      "functions": [
          "Print",
          "Scan",
          "Copy"
      ],
      "known_keywords": [
          "500",
          "Smart Tank 500"
      ],
      "competitor_equivalents": [],
      "known_exclusions": [
          "ink bottle",
          "refill",
          "printhead"
      ],
      "claimed_benefits": [
          "Integrated factory tank",
          "Genuine ink system"
      ],
      "launch_rrp_thb": 4590
  },
  {
      "sku_id": "HP-ST-790",
      "brand": "HP",
      "family": "Smart Tank",
      "model_name": "Smart Tank 790",
      "aliases": [
          "Smart Tank 790",
          "HP Smart Tank 790",
          "HP Smart Tank 790"
      ],
      "normalized_model": "Smart Tank 790",
      "target_segment": "Small Business / SMB (<100 employees)",
      "functions": [
          "Print",
          "Scan",
          "Copy"
      ],
      "known_keywords": [
          "790",
          "Smart Tank 790"
      ],
      "competitor_equivalents": [],
      "known_exclusions": [
          "ink bottle",
          "refill",
          "printhead"
      ],
      "claimed_benefits": [
          "Integrated factory tank",
          "Genuine ink system"
      ],
      "launch_rrp_thb": 10990
  },
  {
      "sku_id": "HP-ST-615",
      "brand": "HP",
      "family": "Smart Tank",
      "model_name": "Smart Tank 615",
      "aliases": [
          "Smart Tank 615",
          "HP Smart Tank 615",
          "HP Smart Tank 615"
      ],
      "normalized_model": "Smart Tank 615",
      "target_segment": "Small Business / SMB (<100 employees)",
      "functions": [
          "Print",
          "Scan",
          "Copy"
      ],
      "known_keywords": [
          "615",
          "Smart Tank 615"
      ],
      "competitor_equivalents": [],
      "known_exclusions": [
          "ink bottle",
          "refill",
          "printhead"
      ],
      "claimed_benefits": [
          "Integrated factory tank",
          "Genuine ink system"
      ],
      "launch_rrp_thb": 7490
  },
  {
      "sku_id": "HP-ST-210",
      "brand": "HP",
      "family": "Smart Tank",
      "model_name": "Smart Tank 210",
      "aliases": [
          "Smart Tank 210",
          "HP Smart Tank 210",
          "HP Smart Tank 210"
      ],
      "normalized_model": "Smart Tank 210",
      "target_segment": "Consumer / Home / Personal",
      "functions": [
          "Print",
          "Scan",
          "Copy"
      ],
      "known_keywords": [
          "210",
          "Smart Tank 210"
      ],
      "competitor_equivalents": [],
      "known_exclusions": [
          "ink bottle",
          "refill",
          "printhead"
      ],
      "claimed_benefits": [
          "Integrated factory tank",
          "Genuine ink system"
      ],
      "launch_rrp_thb": 3490
  },
  {
      "sku_id": "EPSON-ET-L3550",
      "brand": "Epson",
      "family": "EcoTank",
      "model_name": "EcoTank L3550",
      "aliases": [
          "EcoTank L3550",
          "Epson EcoTank L3550",
          "Epson EcoTank L3550"
      ],
      "normalized_model": "EcoTank L3550",
      "target_segment": "Consumer / Home / Personal",
      "functions": [
          "Print",
          "Scan",
          "Copy"
      ],
      "known_keywords": [
          "L3550",
          "EcoTank L3550"
      ],
      "competitor_equivalents": [],
      "known_exclusions": [
          "ink bottle",
          "refill",
          "printhead"
      ],
      "claimed_benefits": [
          "Integrated factory tank",
          "Genuine ink system"
      ],
      "launch_rrp_thb": 5690
  },
  {
      "sku_id": "EPSON-ET-L3556",
      "brand": "Epson",
      "family": "EcoTank",
      "model_name": "EcoTank L3556",
      "aliases": [
          "EcoTank L3556",
          "Epson EcoTank L3556",
          "Epson EcoTank L3556"
      ],
      "normalized_model": "EcoTank L3556",
      "target_segment": "Consumer / Home / Personal",
      "functions": [
          "Print",
          "Scan",
          "Copy"
      ],
      "known_keywords": [
          "L3556",
          "EcoTank L3556"
      ],
      "competitor_equivalents": [],
      "known_exclusions": [
          "ink bottle",
          "refill",
          "printhead"
      ],
      "claimed_benefits": [
          "Integrated factory tank",
          "Genuine ink system"
      ],
      "launch_rrp_thb": 5790
  },
  {
      "sku_id": "EPSON-ET-L4360",
      "brand": "Epson",
      "family": "EcoTank",
      "model_name": "EcoTank L4360",
      "aliases": [
          "EcoTank L4360",
          "Epson EcoTank L4360",
          "Epson EcoTank L4360"
      ],
      "normalized_model": "EcoTank L4360",
      "target_segment": "Small Business / SMB (<100 employees)",
      "functions": [
          "Print",
          "Scan",
          "Copy"
      ],
      "known_keywords": [
          "L4360",
          "EcoTank L4360"
      ],
      "competitor_equivalents": [],
      "known_exclusions": [
          "ink bottle",
          "refill",
          "printhead"
      ],
      "claimed_benefits": [
          "Integrated factory tank",
          "Genuine ink system"
      ],
      "launch_rrp_thb": 8290
  },
  {
      "sku_id": "EPSON-ET-L5590",
      "brand": "Epson",
      "family": "EcoTank",
      "model_name": "EcoTank L5590",
      "aliases": [
          "EcoTank L5590",
          "Epson EcoTank L5590",
          "Epson EcoTank L5590"
      ],
      "normalized_model": "EcoTank L5590",
      "target_segment": "Small Business / SMB (<100 employees)",
      "functions": [
          "Print",
          "Scan",
          "Copy"
      ],
      "known_keywords": [
          "L5590",
          "EcoTank L5590"
      ],
      "competitor_equivalents": [],
      "known_exclusions": [
          "ink bottle",
          "refill",
          "printhead"
      ],
      "claimed_benefits": [
          "Integrated factory tank",
          "Genuine ink system"
      ],
      "launch_rrp_thb": 10190
  },
  {
      "sku_id": "EPSON-ET-L6290",
      "brand": "Epson",
      "family": "EcoTank",
      "model_name": "EcoTank L6290",
      "aliases": [
          "EcoTank L6290",
          "Epson EcoTank L6290",
          "Epson EcoTank L6290"
      ],
      "normalized_model": "EcoTank L6290",
      "target_segment": "Small Business / SMB (<100 employees)",
      "functions": [
          "Print",
          "Scan",
          "Copy"
      ],
      "known_keywords": [
          "L6290",
          "EcoTank L6290"
      ],
      "competitor_equivalents": [],
      "known_exclusions": [
          "ink bottle",
          "refill",
          "printhead"
      ],
      "claimed_benefits": [
          "Integrated factory tank",
          "Genuine ink system"
      ],
      "launch_rrp_thb": 11990
  },
  {
      "sku_id": "EPSON-ET-L6370",
      "brand": "Epson",
      "family": "EcoTank",
      "model_name": "EcoTank L6370",
      "aliases": [
          "EcoTank L6370",
          "Epson EcoTank L6370",
          "Epson EcoTank L6370"
      ],
      "normalized_model": "EcoTank L6370",
      "target_segment": "Small Business / SMB (<100 employees)",
      "functions": [
          "Print",
          "Scan",
          "Copy"
      ],
      "known_keywords": [
          "L6370",
          "EcoTank L6370"
      ],
      "competitor_equivalents": [],
      "known_exclusions": [
          "ink bottle",
          "refill",
          "printhead"
      ],
      "claimed_benefits": [
          "Integrated factory tank",
          "Genuine ink system"
      ],
      "launch_rrp_thb": 11490
  },
  {
      "sku_id": "EPSON-ET-L6390",
      "brand": "Epson",
      "family": "EcoTank",
      "model_name": "EcoTank L6390",
      "aliases": [
          "EcoTank L6390",
          "Epson EcoTank L6390",
          "Epson EcoTank L6390"
      ],
      "normalized_model": "EcoTank L6390",
      "target_segment": "Small Business / SMB (<100 employees)",
      "functions": [
          "Print",
          "Scan",
          "Copy"
      ],
      "known_keywords": [
          "L6390",
          "EcoTank L6390"
      ],
      "competitor_equivalents": [],
      "known_exclusions": [
          "ink bottle",
          "refill",
          "printhead"
      ],
      "claimed_benefits": [
          "Integrated factory tank",
          "Genuine ink system"
      ],
      "launch_rrp_thb": 12490
  },
  {
      "sku_id": "EPSON-ET-L1250",
      "brand": "Epson",
      "family": "EcoTank",
      "model_name": "EcoTank L1250",
      "aliases": [
          "EcoTank L1250",
          "Epson EcoTank L1250",
          "Epson EcoTank L1250"
      ],
      "normalized_model": "EcoTank L1250",
      "target_segment": "Consumer / Home / Personal",
      "functions": [
          "Print",
          "Scan",
          "Copy"
      ],
      "known_keywords": [
          "L1250",
          "EcoTank L1250"
      ],
      "competitor_equivalents": [],
      "known_exclusions": [
          "ink bottle",
          "refill",
          "printhead"
      ],
      "claimed_benefits": [
          "Integrated factory tank",
          "Genuine ink system"
      ],
      "launch_rrp_thb": 3990
  },
  {
      "sku_id": "EPSON-ET-L1256",
      "brand": "Epson",
      "family": "EcoTank",
      "model_name": "EcoTank L1256",
      "aliases": [
          "EcoTank L1256",
          "Epson EcoTank L1256",
          "Epson EcoTank L1256"
      ],
      "normalized_model": "EcoTank L1256",
      "target_segment": "Consumer / Home / Personal",
      "functions": [
          "Print",
          "Scan",
          "Copy"
      ],
      "known_keywords": [
          "L1256",
          "EcoTank L1256"
      ],
      "competitor_equivalents": [],
      "known_exclusions": [
          "ink bottle",
          "refill",
          "printhead"
      ],
      "claimed_benefits": [
          "Integrated factory tank",
          "Genuine ink system"
      ],
      "launch_rrp_thb": 4090
  },
  {
      "sku_id": "EPSON-ET-L8050",
      "brand": "Epson",
      "family": "EcoTank",
      "model_name": "EcoTank L8050",
      "aliases": [
          "EcoTank L8050",
          "Epson EcoTank L8050",
          "Epson EcoTank L8050"
      ],
      "normalized_model": "EcoTank L8050",
      "target_segment": "Small Business / SMB (<100 employees)",
      "functions": [
          "Print",
          "Scan",
          "Copy"
      ],
      "known_keywords": [
          "L8050",
          "EcoTank L8050"
      ],
      "competitor_equivalents": [],
      "known_exclusions": [
          "ink bottle",
          "refill",
          "printhead"
      ],
      "claimed_benefits": [
          "Integrated factory tank",
          "Genuine ink system"
      ],
      "launch_rrp_thb": 12600
  },
  {
      "sku_id": "EPSON-ET-L8100",
      "brand": "Epson",
      "family": "EcoTank",
      "model_name": "EcoTank L8100",
      "aliases": [
          "EcoTank L8100",
          "Epson EcoTank L8100",
          "Epson EcoTank L8100"
      ],
      "normalized_model": "EcoTank L8100",
      "target_segment": "Small Business / SMB (<100 employees)",
      "functions": [
          "Print",
          "Scan",
          "Copy"
      ],
      "known_keywords": [
          "L8100",
          "EcoTank L8100"
      ],
      "competitor_equivalents": [],
      "known_exclusions": [
          "ink bottle",
          "refill",
          "printhead"
      ],
      "claimed_benefits": [
          "Integrated factory tank",
          "Genuine ink system"
      ],
      "launch_rrp_thb": 15990
  },
  {
      "sku_id": "EPSON-ET-L18050",
      "brand": "Epson",
      "family": "EcoTank",
      "model_name": "EcoTank L18050",
      "aliases": [
          "EcoTank L18050",
          "Epson EcoTank L18050",
          "Epson EcoTank L18050"
      ],
      "normalized_model": "EcoTank L18050",
      "target_segment": "Small Business / SMB (<100 employees)",
      "functions": [
          "Print",
          "Scan",
          "Copy"
      ],
      "known_keywords": [
          "L18050",
          "EcoTank L18050"
      ],
      "competitor_equivalents": [],
      "known_exclusions": [
          "ink bottle",
          "refill",
          "printhead"
      ],
      "claimed_benefits": [
          "Integrated factory tank",
          "Genuine ink system"
      ],
      "launch_rrp_thb": 19500
  },
  {
      "sku_id": "EPSON-ET-M1120",
      "brand": "Epson",
      "family": "EcoTank",
      "model_name": "EcoTank M1120",
      "aliases": [
          "EcoTank M1120",
          "Epson EcoTank M1120",
          "Epson EcoTank M1120"
      ],
      "normalized_model": "EcoTank M1120",
      "target_segment": "Small Business / SMB (<100 employees)",
      "functions": [
          "Print",
          "Scan",
          "Copy"
      ],
      "known_keywords": [
          "M1120",
          "EcoTank M1120"
      ],
      "competitor_equivalents": [],
      "known_exclusions": [
          "ink bottle",
          "refill",
          "printhead"
      ],
      "claimed_benefits": [
          "Integrated factory tank",
          "Genuine ink system"
      ],
      "launch_rrp_thb": 5490
  },
  {
      "sku_id": "CANON-MT-G2730",
      "brand": "Canon",
      "family": "MegaTank",
      "model_name": "PIXMA G2730",
      "aliases": [
          "PIXMA G2730",
          "Canon PIXMA G2730",
          "Canon MegaTank G2730"
      ],
      "normalized_model": "PIXMA G2730",
      "target_segment": "Consumer / Home / Personal",
      "functions": [
          "Print",
          "Scan",
          "Copy"
      ],
      "known_keywords": [
          "G2730",
          "PIXMA G2730"
      ],
      "competitor_equivalents": [],
      "known_exclusions": [
          "ink bottle",
          "refill",
          "printhead"
      ],
      "claimed_benefits": [
          "Integrated factory tank",
          "Genuine ink system"
      ],
      "launch_rrp_thb": 4290
  },
  {
      "sku_id": "CANON-MT-G2770",
      "brand": "Canon",
      "family": "MegaTank",
      "model_name": "PIXMA G2770",
      "aliases": [
          "PIXMA G2770",
          "Canon PIXMA G2770",
          "Canon MegaTank G2770"
      ],
      "normalized_model": "PIXMA G2770",
      "target_segment": "Consumer / Home / Personal",
      "functions": [
          "Print",
          "Scan",
          "Copy"
      ],
      "known_keywords": [
          "G2770",
          "PIXMA G2770"
      ],
      "competitor_equivalents": [],
      "known_exclusions": [
          "ink bottle",
          "refill",
          "printhead"
      ],
      "claimed_benefits": [
          "Integrated factory tank",
          "Genuine ink system"
      ],
      "launch_rrp_thb": 4590
  },
  {
      "sku_id": "CANON-MT-G3770",
      "brand": "Canon",
      "family": "MegaTank",
      "model_name": "PIXMA G3770",
      "aliases": [
          "PIXMA G3770",
          "Canon PIXMA G3770",
          "Canon MegaTank G3770"
      ],
      "normalized_model": "PIXMA G3770",
      "target_segment": "Consumer / Home / Personal",
      "functions": [
          "Print",
          "Scan",
          "Copy"
      ],
      "known_keywords": [
          "G3770",
          "PIXMA G3770"
      ],
      "competitor_equivalents": [],
      "known_exclusions": [
          "ink bottle",
          "refill",
          "printhead"
      ],
      "claimed_benefits": [
          "Integrated factory tank",
          "Genuine ink system"
      ],
      "launch_rrp_thb": 5790
  },
  {
      "sku_id": "CANON-MT-G3780",
      "brand": "Canon",
      "family": "MegaTank",
      "model_name": "PIXMA G3780",
      "aliases": [
          "PIXMA G3780",
          "Canon PIXMA G3780",
          "Canon MegaTank G3780"
      ],
      "normalized_model": "PIXMA G3780",
      "target_segment": "Small Business / SMB (<100 employees)",
      "functions": [
          "Print",
          "Scan",
          "Copy"
      ],
      "known_keywords": [
          "G3780",
          "PIXMA G3780"
      ],
      "competitor_equivalents": [],
      "known_exclusions": [
          "ink bottle",
          "refill",
          "printhead"
      ],
      "claimed_benefits": [
          "Integrated factory tank",
          "Genuine ink system"
      ],
      "launch_rrp_thb": 6690
  },
  {
      "sku_id": "CANON-MT-G4770",
      "brand": "Canon",
      "family": "MegaTank",
      "model_name": "PIXMA G4770",
      "aliases": [
          "PIXMA G4770",
          "Canon PIXMA G4770",
          "Canon MegaTank G4770"
      ],
      "normalized_model": "PIXMA G4770",
      "target_segment": "Small Business / SMB (<100 employees)",
      "functions": [
          "Print",
          "Scan",
          "Copy"
      ],
      "known_keywords": [
          "G4770",
          "PIXMA G4770"
      ],
      "competitor_equivalents": [],
      "known_exclusions": [
          "ink bottle",
          "refill",
          "printhead"
      ],
      "claimed_benefits": [
          "Integrated factory tank",
          "Genuine ink system"
      ],
      "launch_rrp_thb": 7490
  },
  {
      "sku_id": "CANON-MT-G4780",
      "brand": "Canon",
      "family": "MegaTank",
      "model_name": "PIXMA G4780",
      "aliases": [
          "PIXMA G4780",
          "Canon PIXMA G4780",
          "Canon MegaTank G4780"
      ],
      "normalized_model": "PIXMA G4780",
      "target_segment": "Small Business / SMB (<100 employees)",
      "functions": [
          "Print",
          "Scan",
          "Copy"
      ],
      "known_keywords": [
          "G4780",
          "PIXMA G4780"
      ],
      "competitor_equivalents": [],
      "known_exclusions": [
          "ink bottle",
          "refill",
          "printhead"
      ],
      "claimed_benefits": [
          "Integrated factory tank",
          "Genuine ink system"
      ],
      "launch_rrp_thb": 8190
  },
  {
      "sku_id": "CANON-MT-G570",
      "brand": "Canon",
      "family": "MegaTank",
      "model_name": "PIXMA G570",
      "aliases": [
          "PIXMA G570",
          "Canon PIXMA G570",
          "Canon MegaTank G570"
      ],
      "normalized_model": "PIXMA G570",
      "target_segment": "Consumer / Home / Personal",
      "functions": [
          "Print",
          "Scan",
          "Copy"
      ],
      "known_keywords": [
          "G570",
          "PIXMA G570"
      ],
      "competitor_equivalents": [],
      "known_exclusions": [
          "ink bottle",
          "refill",
          "printhead"
      ],
      "claimed_benefits": [
          "Integrated factory tank",
          "Genuine ink system"
      ],
      "launch_rrp_thb": 8650
  },
  {
      "sku_id": "CANON-MT-G670",
      "brand": "Canon",
      "family": "MegaTank",
      "model_name": "PIXMA G670",
      "aliases": [
          "PIXMA G670",
          "Canon PIXMA G670",
          "Canon MegaTank G670"
      ],
      "normalized_model": "PIXMA G670",
      "target_segment": "Consumer / Home / Personal",
      "functions": [
          "Print",
          "Scan",
          "Copy"
      ],
      "known_keywords": [
          "G670",
          "PIXMA G670"
      ],
      "competitor_equivalents": [],
      "known_exclusions": [
          "ink bottle",
          "refill",
          "printhead"
      ],
      "claimed_benefits": [
          "Integrated factory tank",
          "Genuine ink system"
      ],
      "launch_rrp_thb": 9990
  },
  {
      "sku_id": "CANON-MT-GM2070",
      "brand": "Canon",
      "family": "MegaTank",
      "model_name": "PIXMA GM2070",
      "aliases": [
          "PIXMA GM2070",
          "Canon PIXMA GM2070",
          "Canon MegaTank GM2070"
      ],
      "normalized_model": "PIXMA GM2070",
      "target_segment": "Small Business / SMB (<100 employees)",
      "functions": [
          "Print",
          "Scan",
          "Copy"
      ],
      "known_keywords": [
          "GM2070",
          "PIXMA GM2070"
      ],
      "competitor_equivalents": [],
      "known_exclusions": [
          "ink bottle",
          "refill",
          "printhead"
      ],
      "claimed_benefits": [
          "Integrated factory tank",
          "Genuine ink system"
      ],
      "launch_rrp_thb": 5690
  },
  {
      "sku_id": "CANON-MT-GM4070",
      "brand": "Canon",
      "family": "MegaTank",
      "model_name": "PIXMA GM4070",
      "aliases": [
          "PIXMA GM4070",
          "Canon PIXMA GM4070",
          "Canon MegaTank GM4070"
      ],
      "normalized_model": "PIXMA GM4070",
      "target_segment": "Small Business / SMB (<100 employees)",
      "functions": [
          "Print",
          "Scan",
          "Copy"
      ],
      "known_keywords": [
          "GM4070",
          "PIXMA GM4070"
      ],
      "competitor_equivalents": [],
      "known_exclusions": [
          "ink bottle",
          "refill",
          "printhead"
      ],
      "claimed_benefits": [
          "Integrated factory tank",
          "Genuine ink system"
      ],
      "launch_rrp_thb": 7990
  },
  {
      "sku_id": "BROTHER-IB-T230",
      "brand": "Brother",
      "family": "InkBenefit",
      "model_name": "DCP-T230",
      "aliases": [
          "DCP-T230",
          "Brother DCP-T230",
          "Brother InkBenefit T230"
      ],
      "normalized_model": "DCP-T230",
      "target_segment": "Consumer / Home / Personal",
      "functions": [
          "Print",
          "Scan",
          "Copy"
      ],
      "known_keywords": [
          "T230",
          "DCP-T230"
      ],
      "competitor_equivalents": [],
      "known_exclusions": [
          "ink bottle",
          "refill",
          "printhead"
      ],
      "claimed_benefits": [
          "Integrated factory tank",
          "Genuine ink system"
      ],
      "launch_rrp_thb": 4190
  },
  {
      "sku_id": "BROTHER-IB-T430W",
      "brand": "Brother",
      "family": "InkBenefit",
      "model_name": "DCP-T430W",
      "aliases": [
          "DCP-T430W",
          "Brother DCP-T430W",
          "Brother InkBenefit T430W"
      ],
      "normalized_model": "DCP-T430W",
      "target_segment": "Consumer / Home / Personal",
      "functions": [
          "Print",
          "Scan",
          "Copy",
          "Wi-Fi"
      ],
      "known_keywords": [
          "T430W",
          "DCP-T430W"
      ],
      "competitor_equivalents": [],
      "known_exclusions": [
          "ink bottle",
          "refill",
          "printhead"
      ],
      "claimed_benefits": [
          "Integrated factory tank",
          "Genuine ink system"
      ],
      "launch_rrp_thb": 5190
  },
  {
      "sku_id": "BROTHER-IB-T530DW",
      "brand": "Brother",
      "family": "InkBenefit",
      "model_name": "DCP-T530DW",
      "aliases": [
          "DCP-T530DW",
          "Brother DCP-T530DW",
          "Brother InkBenefit T530DW"
      ],
      "normalized_model": "DCP-T530DW",
      "target_segment": "Consumer / Home / Personal",
      "functions": [
          "Print",
          "Scan",
          "Copy",
          "Wi-Fi",
          "Auto-Duplex",
          "ADF"
      ],
      "known_keywords": [
          "T530DW",
          "DCP-T530DW"
      ],
      "competitor_equivalents": [],
      "known_exclusions": [
          "ink bottle",
          "refill",
          "printhead"
      ],
      "claimed_benefits": [
          "Integrated factory tank",
          "Genuine ink system"
      ],
      "launch_rrp_thb": 6290
  },
  {
      "sku_id": "BROTHER-IB-T730DW",
      "brand": "Brother",
      "family": "InkBenefit",
      "model_name": "DCP-T730DW",
      "aliases": [
          "DCP-T730DW",
          "Brother DCP-T730DW",
          "Brother InkBenefit T730DW"
      ],
      "normalized_model": "DCP-T730DW",
      "target_segment": "Small Business / SMB (<100 employees)",
      "functions": [
          "Print",
          "Scan",
          "Copy",
          "Wi-Fi",
          "Auto-Duplex",
          "ADF"
      ],
      "known_keywords": [
          "T730DW",
          "DCP-T730DW"
      ],
      "competitor_equivalents": [],
      "known_exclusions": [
          "ink bottle",
          "refill",
          "printhead"
      ],
      "claimed_benefits": [
          "Integrated factory tank",
          "Genuine ink system"
      ],
      "launch_rrp_thb": 7890
  },
  {
      "sku_id": "BROTHER-IB-T830DW",
      "brand": "Brother",
      "family": "InkBenefit",
      "model_name": "DCP-T830DW",
      "aliases": [
          "DCP-T830DW",
          "Brother DCP-T830DW",
          "Brother InkBenefit T830DW"
      ],
      "normalized_model": "DCP-T830DW",
      "target_segment": "Small Business / SMB (<100 employees)",
      "functions": [
          "Print",
          "Scan",
          "Copy",
          "Wi-Fi",
          "Auto-Duplex",
          "ADF"
      ],
      "known_keywords": [
          "T830DW",
          "DCP-T830DW"
      ],
      "competitor_equivalents": [],
      "known_exclusions": [
          "ink bottle",
          "refill",
          "printhead"
      ],
      "claimed_benefits": [
          "Integrated factory tank",
          "Genuine ink system"
      ],
      "launch_rrp_thb": 9290
  },
  {
      "sku_id": "BROTHER-IB-T930DW",
      "brand": "Brother",
      "family": "InkBenefit",
      "model_name": "MFC-T930DW",
      "aliases": [
          "MFC-T930DW",
          "Brother MFC-T930DW",
          "Brother InkBenefit T930DW"
      ],
      "normalized_model": "MFC-T930DW",
      "target_segment": "Small Business / SMB (<100 employees)",
      "functions": [
          "Print",
          "Scan",
          "Copy",
          "Wi-Fi",
          "Auto-Duplex",
          "ADF"
      ],
      "known_keywords": [
          "T930DW",
          "MFC-T930DW"
      ],
      "competitor_equivalents": [],
      "known_exclusions": [
          "ink bottle",
          "refill",
          "printhead"
      ],
      "claimed_benefits": [
          "Integrated factory tank",
          "Genuine ink system"
      ],
      "launch_rrp_thb": 10990
  },
  {
      "sku_id": "BROTHER-IB-T4000DW",
      "brand": "Brother",
      "family": "InkBenefit",
      "model_name": "HL-T4000DW",
      "aliases": [
          "HL-T4000DW",
          "Brother HL-T4000DW",
          "Brother InkBenefit T4000DW"
      ],
      "normalized_model": "HL-T4000DW",
      "target_segment": "Small Business / SMB (<100 employees)",
      "functions": [
          "Print",
          "Scan",
          "Copy",
          "Wi-Fi",
          "Auto-Duplex",
          "ADF"
      ],
      "known_keywords": [
          "T4000DW",
          "HL-T4000DW"
      ],
      "competitor_equivalents": [],
      "known_exclusions": [
          "ink bottle",
          "refill",
          "printhead"
      ],
      "claimed_benefits": [
          "Integrated factory tank",
          "Genuine ink system"
      ],
      "launch_rrp_thb": 16990
  },
  {
      "sku_id": "BROTHER-IB-T4500DW",
      "brand": "Brother",
      "family": "InkBenefit",
      "model_name": "MFC-T4500DW",
      "aliases": [
          "MFC-T4500DW",
          "Brother MFC-T4500DW",
          "Brother InkBenefit T4500DW"
      ],
      "normalized_model": "MFC-T4500DW",
      "target_segment": "Small Business / SMB (<100 employees)",
      "functions": [
          "Print",
          "Scan",
          "Copy",
          "Wi-Fi",
          "Auto-Duplex",
          "ADF"
      ],
      "known_keywords": [
          "T4500DW",
          "MFC-T4500DW"
      ],
      "competitor_equivalents": [],
      "known_exclusions": [
          "ink bottle",
          "refill",
          "printhead"
      ],
      "claimed_benefits": [
          "Integrated factory tank",
          "Genuine ink system"
      ],
      "launch_rrp_thb": 24990
  },
  {
      "sku_id": "BROTHER-IB-T310",
      "brand": "Brother",
      "family": "InkBenefit",
      "model_name": "DCP-T310",
      "aliases": [
          "DCP-T310",
          "Brother DCP-T310",
          "Brother InkBenefit T310"
      ],
      "normalized_model": "DCP-T310",
      "target_segment": "Consumer / Home / Personal",
      "functions": [
          "Print",
          "Scan",
          "Copy"
      ],
      "known_keywords": [
          "T310",
          "DCP-T310"
      ],
      "competitor_equivalents": [],
      "known_exclusions": [
          "ink bottle",
          "refill",
          "printhead"
      ],
      "claimed_benefits": [
          "Integrated factory tank",
          "Genuine ink system"
      ],
      "launch_rrp_thb": 3790
  },
];

// ─── Complete 65-Model Thailand Market Universe ─────────────────────────────
export const ALL_MARKET_SKUS: readonly SkuMasterDefinition[] = [
  ...CANONICAL_SKUS,
  ...EXPANDED_MARKET_SKUS,
];

export const TOTAL_MARKET_SKU_COUNT = ALL_MARKET_SKUS.length;


export function getAllSkus(): readonly SkuMasterDefinition[] {
  return CANONICAL_SKUS;
}

export function getAllMarketSkus(): readonly SkuMasterDefinition[] {
  return ALL_MARKET_SKUS;
}

export function getSkusByBrand(brand: TargetBrand): readonly SkuMasterDefinition[] {
  return CANONICAL_SKUS.filter((s) => s.brand === brand);
}

export function getSkuById(skuId: string): SkuMasterDefinition | undefined {
  return ALL_MARKET_SKUS.find((s) => s.sku_id === skuId);
}

export function getSkuByModelName(modelName: string): SkuMasterDefinition | undefined {
  return ALL_MARKET_SKUS.find((s) => s.model_name.toLowerCase() === modelName.toLowerCase());
}

export function isCanonicalSku(skuId: string): boolean {
  return CANONICAL_SKUS.some((s) => s.sku_id === skuId);
}

export function getCompetitorEquivalents(skuId: string): readonly string[] {
  const sku = CANONICAL_SKUS.find((s) => s.sku_id === skuId);
  return sku?.competitor_equivalents ?? [];
}
