/**
 * Web Acquisition Provider Health Diagnostic
 */

import { getServerEnv } from '@/config/env';

export interface WebAcquisitionHealth {
  direct_http: { available: boolean; status: string };
  brightdata: { configured: boolean; status: string };
  apify: { configured: boolean; status: string };
}

export function checkAcquisitionHealth(): WebAcquisitionHealth {
  const env = getServerEnv();
  const hasBrightData = Boolean(env.BRIGHTDATA_API_KEY && env.BRIGHTDATA_API_KEY.trim().length > 0);
  const hasApify = Boolean(env.APIFY_API_KEY && env.APIFY_API_KEY.trim().length > 0);

  return {
    direct_http: {
      available: true,
      status: 'REACHABLE',
    },
    brightdata: {
      configured: hasBrightData,
      status: hasBrightData ? 'CONFIGURED' : 'NOT_CONFIGURED',
    },
    apify: {
      configured: hasApify,
      status: hasApify ? 'CONFIGURED' : 'NOT_CONFIGURED',
    },
  };
}
