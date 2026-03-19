/**
 * Server-side structured logging for Vercel API routes.
 * Use in api/* handlers so production logs are consistent and grep-able.
 */

const PREFIX = '[api]';

function formatMessage(level: string, message: string, meta?: unknown): string {
  const ts = new Date().toISOString();
  const extra = meta !== undefined ? ` ${JSON.stringify(meta)}` : '';
  return `${ts} ${PREFIX} ${level} ${message}${extra}`;
}

export const apiLogger = {
  error(message: string, error?: unknown): void {
    const meta = error instanceof Error
      ? { message: error.message, name: error.name }
      : error;
    console.error(formatMessage('ERROR', message, meta));
  },
  warn(message: string, meta?: unknown): void {
    console.warn(formatMessage('WARN', message, meta));
  },
  info(message: string, meta?: unknown): void {
    console.log(formatMessage('INFO', message, meta));
  },
};
