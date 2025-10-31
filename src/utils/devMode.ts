/**
 * Development Mode Utilities
 * Provides centralized control over development-specific features and logging
 */

export const isDevelopment = import.meta.env.DEV || process.env.NODE_ENV === 'development';

/**
 * Development logger that only logs in development mode
 */
export const devLog = {
  log: (...args: any[]) => {
    if (isDevelopment) {
      console.log('[DEV]', ...args);
    }
  },
  warn: (...args: any[]) => {
    if (isDevelopment) {
      console.warn('[DEV]', ...args);
    }
  },
  error: (...args: any[]) => {
    if (isDevelopment) {
      console.error('[DEV]', ...args);
    }
  },
  info: (...args: any[]) => {
    if (isDevelopment) {
      console.info('[DEV]', ...args);
    }
  }
};

/**
 * Conditional development logging with throttling
 */
export class ThrottledLogger {
  private lastLogTime: { [key: string]: number } = {};
  private throttleMs: number;

  constructor(throttleMs: number = 1000) {
    this.throttleMs = throttleMs;
  }

  log(key: string, ...args: any[]) {
    if (!isDevelopment) return;
    
    const now = Date.now();
    if (!this.lastLogTime[key] || now - this.lastLogTime[key] > this.throttleMs) {
      console.log('[DEV-THROTTLED]', ...args);
      this.lastLogTime[key] = now;
    }
  }
}

/**
 * Development mode feature flags
 */
export const devFeatures = {
  enableVerboseLogging: isDevelopment,
  enablePerformanceMetrics: isDevelopment,
  enableDebugPanels: isDevelopment,
  enableMockData: isDevelopment,
};

/**
 * Performance measurement utility for development
 */
export const devPerf = {
  start: (label: string) => {
    if (isDevelopment) {
      console.time(`[PERF] ${label}`);
    }
  },
  end: (label: string) => {
    if (isDevelopment) {
      console.timeEnd(`[PERF] ${label}`);
    }
  }
};

/**
 * Global development mode indicator
 */
if (isDevelopment && typeof window !== 'undefined') {
  (window as any).__DEV_MODE__ = true;
  console.log('%c🚀 Development Mode Active', 'color: #00ff00; font-weight: bold; font-size: 14px;');
}
