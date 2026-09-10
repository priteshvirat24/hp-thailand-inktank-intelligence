/**
 * Creative Intelligence & Brand Messaging Metadata
 * Authoritative manufacturer claims, warranties, TCO specifications,
 * and certified retail distribution partners.
 *
 * NOTE: Fabricated competitive advertising metrics (spend ranges, impression ranges,
 * synthetic demographic percentages, regional impression allocations, and retailer
 * ad shares) have been eliminated under BUG-002 remediation.
 * All advertising creative observations are dynamically derived from verified
 * Evidence Lake records (scrapling_verified_lake.json).
 */

import {
  BrandMessagingPillar,
  ChannelCoOpPartner,
} from '@/types/creativeIntelligence';

export const BRAND_MESSAGING_PILLARS: BrandMessagingPillar[] = [
  {
    brand: 'HP',
    tagline: 'ปริ้นท์อุ่นใจ ไม่มีสะดุด — HP ยืนหนึ่งเรื่องบริการ Onsite',
    warranty_service_claim: {
      claim: '2-Year Free Onsite Smart Friend Service across 77 provinces',
      terms: 'Free technician dispatch to home/office; covers all parts and labor',
      onsite_support: true,
      hp_advantage:
        'Only brand offering 100% door-to-door onsite pick-up with zero travel cost to customer.',
    },
    tco_ink_claim: {
      black_page_yield: 6000,
      color_page_yield: 6000,
      cost_per_page_thb: 0.04,
      ink_bottle_model: 'GT53XL (Black) / GT52 (Cyan, Magenta, Yellow)',
    },
    smart_app_claim: {
      app_name: 'HP Smart App',
      key_features: [
        'Print from anywhere via cloud',
        'Mobile scan with auto edge detection',
        'Self-healing dual-band Wi-Fi reconnection',
      ],
    },
    promotional_strategy: {
      primary_campaign: 'August Payday Finale & BaNANA EV Lucky Draw',
      discount_depth: '10% instant voucher + Shopee Mall 15% Coin Cashback',
      co_op_retailers: ['BaNANA IT (Com7)', 'Shopee Mall HP Official', 'JIB Computer'],
    },
  },
  {
    brand: 'Epson',
    tagline: 'Engineered for Tomorrow — EcoTank Heat-Free Precision',
    warranty_service_claim: {
      claim: '2 Years or 30,000 pages (Whichever comes first)',
      terms: 'Carry-in to certified Epson service centers or authorized dealers',
      onsite_support: false,
      hp_advantage: 'Customer must carry heavy printer to service center; HP repairs onsite.',
    },
    tco_ink_claim: {
      black_page_yield: 4500,
      color_page_yield: 7500,
      cost_per_page_thb: 0.045,
      ink_bottle_model: 'Epson 003 Genuine Ink Series',
    },
    smart_app_claim: {
      app_name: 'Epson Smart Panel',
      key_features: [
        'Direct Wi-Fi Direct connection',
        'Print head nozzle check from app',
        'Document preset profiles',
      ],
    },
    promotional_strategy: {
      primary_campaign: 'Power Buy 9.9 Power Deals & Central The 1 Points',
      discount_depth: 'Up to 40% on electronics bundles + The 1 Points 2x',
      co_op_retailers: ['Power Buy', 'Central Department Store', 'OfficeMate'],
    },
  },
  {
    brand: 'Brother',
    tagline: 'At Your Side — ตัวจริงเรื่องความคุ้ม มั่นใจงานพิมพ์ทนทาน',
    warranty_service_claim: {
      claim: '2-Year Warranty including print head',
      terms: 'Carry-in to IT CITY or Brother service hubs with online warranty registration',
      onsite_support: false,
      hp_advantage:
        'Print head covered but requires carry-in; HP provides onsite diagnosis at user desk.',
    },
    tco_ink_claim: {
      black_page_yield: 7500,
      color_page_yield: 5000,
      cost_per_page_thb: 0.035,
      ink_bottle_model: 'BTD60BK / BT5000 Series',
    },
    smart_app_claim: {
      app_name: 'Brother Mobile Connect',
      key_features: [
        'Ink level status tracking',
        'Direct scan to cloud drive',
        'Remote copy shortcut keys',
      ],
    },
    promotional_strategy: {
      primary_campaign: 'IT CITY Hot Deals & Free Extra Ink Refill Flight',
      discount_depth: 'Price cut down to ฿3,490 + 50% discount on second ink bottle',
      co_op_retailers: ['IT CITY', 'Advice IT Infinite', 'Lazada LazMall'],
    },
  },
  {
    brand: 'Canon',
    tagline: 'Delighting You Always — MegaTank พิมพ์จุใจ คมชัดทุกรายละเอียด',
    warranty_service_claim: {
      claim: '2 Years Pick-up and Delivery Service upon web registration',
      terms: 'Pick-up via courier to Canon authorized repair center (3-7 days turnaround)',
      onsite_support: false,
      hp_advantage:
        'Canon uses courier shipping taking days; HP sends certified technician directly.',
    },
    tco_ink_claim: {
      black_page_yield: 6000,
      color_page_yield: 7000,
      cost_per_page_thb: 0.042,
      ink_bottle_model: 'GI-790 Genuine Ink Bottles',
    },
    smart_app_claim: {
      app_name: 'Canon PRINT Inkjet/SELPHY',
      key_features: [
        'Photo paper borderless formatting',
        'Easy-PhotoPrint Editor integration',
        'Smartphone scan to PDF',
      ],
    },
    promotional_strategy: {
      primary_campaign: 'Office Depot Supply Bundle & Student Back-to-School',
      discount_depth: 'Entry street price ฿2,890 (G1010) + Free ream of paper',
      co_op_retailers: ['Office Depot / OFM', 'Advice IT', 'Shopee Mall'],
    },
  },
];

export const CHANNEL_COOP_PARTNERS: ChannelCoOpPartner[] = [
  {
    partner_name: 'BaNANA (Com7)',
    logo_key: 'banana',
    brands_supported: ['HP', 'Epson', 'Canon'],
    channel_presence: 'E-Commerce & Omnichannel Retailer',
    primary_channel: 'Shopee Mall / Official Retail Outlets',
  },
  {
    partner_name: 'IT CITY',
    logo_key: 'itcity',
    brands_supported: ['Brother', 'HP', 'Epson'],
    channel_presence: 'E-Commerce & IT Retail Chain',
    primary_channel: 'Lazada LazMall / Dedicated IT Megastores',
  },
  {
    partner_name: 'Power Buy (Central)',
    logo_key: 'powerbuy',
    brands_supported: ['Epson', 'HP', 'Brother', 'Canon'],
    channel_presence: 'Department Store Electronics Retailer',
    primary_channel: 'Power Buy Online / Central Retail Stores',
  },
  {
    partner_name: 'Advice IT Infinite',
    logo_key: 'advice',
    brands_supported: ['Canon', 'Brother', 'HP', 'Epson'],
    channel_presence: 'National IT Distribution & E-Commerce',
    primary_channel: 'Advice Online / Regional Retail Hubs',
  },
];
