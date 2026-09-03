import { describe, it, expect } from 'vitest';
import { getServerEnv } from '@/config/env';

describe('Environment Validator & Security Boundary', () => {
  it('loads valid default server environment', () => {
    const env = getServerEnv();
    expect(env).toBeDefined();
    expect(['development', 'production', 'test']).toContain(env.NODE_ENV);
  });

  it('contains expected environment placeholder keys', () => {
    const env = getServerEnv();
    expect(typeof env.APIFY_API_KEY).toBe('string');
    expect(typeof env.BRIGHTDATA_API_KEY).toBe('string');
    expect(typeof env.OPENAI_API_KEY).toBe('string');
    expect(typeof env.DASHBOARD_ACCESS_PASSWORD).toBe('string');
  });
});
