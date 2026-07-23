/**
 * Error monitoring seam — never log full PII payloads.
 * Sentry wiring is optional until DSN credentials exist.
 */

export interface SafeErrorContext {
  readonly area: string;
  readonly referenceId?: string;
  readonly code?: string;
}

function redact(value: unknown): unknown {
  if (typeof value === 'string') {
    if (value.includes('@') || value.length > 120) {
      return '[redacted]';
    }
    return value;
  }
  if (Array.isArray(value)) {
    return value.map(redact);
  }
  if (value && typeof value === 'object') {
    const output: Record<string, unknown> = {};
    for (const [key, nested] of Object.entries(value)) {
      if (/email|phone|name|message|hin|address|file|photo|token/i.test(key)) {
        output[key] = '[redacted]';
      } else {
        output[key] = redact(nested);
      }
    }
    return output;
  }
  return value;
}

export function captureSafeError(
  error: unknown,
  context: SafeErrorContext,
): void {
  const safe = {
    area: context.area,
    referenceId: context.referenceId,
    code: context.code,
    message:
      error instanceof Error ? error.message.slice(0, 200) : 'unknown-error',
  };

  if (process.env.NODE_ENV !== 'production') {
    console.error('[bcs:safe-error]', safe);
  }

  // Optional Sentry: only if a global hook is installed by future instrumentation.
  const sentry = (
    globalThis as {
      Sentry?: { captureException?: (err: unknown, ctx?: unknown) => void };
    }
  ).Sentry;
  sentry?.captureException?.(error, { extra: redact(safe) });
}

export function isSentryConfigured(): boolean {
  return Boolean(
    process.env.SENTRY_DSN?.trim() ||
    process.env.NEXT_PUBLIC_SENTRY_DSN?.trim(),
  );
}
