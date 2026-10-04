import { UAParser } from 'ua-parser-js';
import { createHash } from 'crypto';

export interface DeviceInfo {
  deviceType: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  os: string;
}

/**
 * Parse user agent string untuk mendapatkan device info
 * @param userAgent - User agent string
 * @returns DeviceInfo object
 */
export function parseUserAgent(userAgent: string | null): DeviceInfo {
  if (!userAgent) {
    return {
      deviceType: 'desktop',
      browser: 'Unknown',
      os: 'Unknown',
    };
  }

  const parser = new UAParser(userAgent);
  const result = parser.getResult();
  
  let deviceType: 'desktop' | 'mobile' | 'tablet' = 'desktop';
  
  if (result.device.type === 'tablet') {
    deviceType = 'tablet';
  } else if (result.device.type === 'mobile') {
    deviceType = 'mobile';
  }
  
  return {
    deviceType,
    browser: result.browser.name || 'Unknown',
    os: result.os.name || 'Unknown',
  };
}

/**
 * Hash IP address untuk privacy
 * @param ip - IP address
 * @returns SHA-256 hash
 */
export function hashIp(ip: string): string {
  return createHash('sha256').update(ip).digest('hex');
}
