import { getServerEnv } from '@/config/env';

/**
 * Validates a provided password against the configured server secret
 */
export function verifyDashboardPassword(candidatePassword: string): boolean {
  const env = getServerEnv();
  
  // If no password configured in development, allow access
  if (!env.DASHBOARD_ACCESS_PASSWORD && env.NODE_ENV === 'development') {
    return true;
  }

  if (!env.DASHBOARD_ACCESS_PASSWORD) {
    return false;
  }

  return candidatePassword === env.DASHBOARD_ACCESS_PASSWORD;
}

/**
 * Validates incoming HTTP request authorization headers
 */
export function validateRequestAuthorization(req: Request): { authorized: boolean; reason?: string } {
  const env = getServerEnv();

  // In development without password set, allow access
  if (!env.DASHBOARD_ACCESS_PASSWORD && env.NODE_ENV === 'development') {
    return { authorized: true };
  }

  const authHeader = req.headers.get('authorization') || '';
  const customHeader = req.headers.get('x-dashboard-password') || '';

  let candidate = '';
  if (authHeader.startsWith('Bearer ')) {
    candidate = authHeader.substring(7).trim();
  } else if (customHeader) {
    candidate = customHeader.trim();
  }

  if (verifyDashboardPassword(candidate)) {
    return { authorized: true };
  }

  return {
    authorized: false,
    reason: 'Invalid or missing authentication credentials',
  };
}
