/**
 * Error tracking utility untuk monitoring dan debugging
 */

export interface ErrorContext {
  context: string;
  userId?: string;
  metadata?: Record<string, unknown>;
}

export function trackError(error: Error, context: ErrorContext): void {
  console.error(`[${context.context}]`, {
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    ...context,
  });

  // Kirim ke Sentry jika tersedia
  if (typeof window !== 'undefined') {
    const w = window as unknown as Record<string, unknown>;
    if (typeof w.Sentry !== 'undefined') {
      const Sentry = w.Sentry as { captureException: (error: Error, options?: unknown) => void };
      Sentry.captureException(error, {
        tags: { context: context.context },
        extra: context.metadata,
      });
    }
  }
}

export function trackEvent(eventName: string, data?: Record<string, unknown>): void {
  console.log(`[Event: ${eventName}]`, {
    timestamp: new Date().toISOString(),
    ...data,
  });
}
