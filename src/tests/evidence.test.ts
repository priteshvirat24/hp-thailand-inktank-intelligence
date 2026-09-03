import { describe, it, expect } from 'vitest';
import { generateDeterministicEvidenceId } from '@/lib/evidenceId';

describe('Deterministic Evidence ID Generator', () => {
  it('generates reproducible, deterministic IDs from identical source inputs', () => {
    const inputA = {
      platform: 'Meta Ad Library',
      sourceUrl: 'https://www.facebook.com/ads/library/?id=987654321',
      publishedAt: '2026-08-15',
      platformEntityId: '987654321',
    };

    const inputB = {
      platform: 'Meta Ad Library',
      sourceUrl: 'https://www.facebook.com/ads/library/?id=987654321',
      publishedAt: '2026-08-15',
      platformEntityId: '987654321',
    };

    const idA = generateDeterministicEvidenceId(inputA);
    const idB = generateDeterministicEvidenceId(inputB);

    expect(idA).toBe(idB);
    expect(idA).toMatch(/^EVID-META-[A-F0-9]{12}$/);
  });

  it('generates distinct IDs for different source URLs or publication dates', () => {
    const id1 = generateDeterministicEvidenceId({
      platform: 'Shopee',
      sourceUrl: 'https://shopee.co.th/product/100/200',
      publishedAt: '2026-08-10',
    });

    const id2 = generateDeterministicEvidenceId({
      platform: 'Shopee',
      sourceUrl: 'https://shopee.co.th/product/100/201', // Different URL
      publishedAt: '2026-08-10',
    });

    const id3 = generateDeterministicEvidenceId({
      platform: 'Shopee',
      sourceUrl: 'https://shopee.co.th/product/100/200',
      publishedAt: '2026-08-11', // Different date
    });

    expect(id1).not.toBe(id2);
    expect(id1).not.toBe(id3);
  });

  it('handles various platform slug formatting safely', () => {
    const id = generateDeterministicEvidenceId({
      platform: 'Google Ads Transparency Center',
      sourceUrl: 'https://adstransparency.google.com/advertiser/12345',
      publishedAt: '2026-07-20',
    });

    expect(id).toMatch(/^EVID-GOOGLE-[A-F0-9]{12}$/);
  });
});
