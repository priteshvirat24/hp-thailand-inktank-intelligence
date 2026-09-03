import { describe, it, expect } from 'vitest';
import {
  DATA_SOURCES,
  MANDATORY_SOURCES,
  SECONDARY_SOURCES,
  DROPPED_SOURCES,
} from '@/config/sources';

describe('Data Source Priority & Platform Configuration', () => {
  it('contains mandatory paid, social, and e-commerce sources per the brief', () => {
    const mandatoryPlatforms = MANDATORY_SOURCES.map((s) => s.platform);
    expect(mandatoryPlatforms).toContain('Meta');
    expect(mandatoryPlatforms).toContain('Google Ads');
    expect(mandatoryPlatforms).toContain('Facebook');
    expect(mandatoryPlatforms).toContain('Instagram');
    expect(mandatoryPlatforms).toContain('YouTube');
    expect(mandatoryPlatforms).toContain('Shopee');
    expect(mandatoryPlatforms).toContain('Lazada');
    expect(mandatoryPlatforms).toContain('TikTok Shop');
    expect(mandatoryPlatforms).toContain('JIB');
  });

  it('marks secondary sources accurately', () => {
    const secondaryPlatforms = SECONDARY_SOURCES.map((s) => s.platform);
    expect(secondaryPlatforms).toContain('TikTok');
    expect(secondaryPlatforms).toContain('LinkedIn');
    expect(secondaryPlatforms).toContain('Advice');
    expect(secondaryPlatforms).toContain('Power Buy');
  });

  it('marks low-signal consumer forums as dropped', () => {
    const droppedSourceIds = DROPPED_SOURCES.map((s) => s.source_id);
    expect(droppedSourceIds).toContain('src-consumer-forums');
  });

  it('enforces Thailand country scope across all data sources', () => {
    DATA_SOURCES.forEach((source) => {
      expect(source.country).toBe('Thailand');
      if (source.expected_currency) {
        expect(source.expected_currency).toBe('THB');
      }
    });
  });
});
