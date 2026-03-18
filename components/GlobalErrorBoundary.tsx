import React, { ErrorInfo, ReactNode } from 'react';
import { logger } from '../lib/logger';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Top-level error boundary for the entire application.
 * Catches unhandled React errors and renders a recovery UI
 * instead of a white screen.
 */
class GlobalErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, error: null, errorInfo: null };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    logger.error('[GlobalErrorBoundary] Uncaught error:', error?.message, errorInfo?.componentStack);

    // Future: Send to error tracking service (e.g. Sentry)
    // if (typeof window !== 'undefined' && (window as any).Sentry) {
    //   (window as any).Sentry.captureException(error, { extra: { componentStack: errorInfo?.componentStack } });
    // }
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      const isDev = import.meta.env.DEV;

      return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-gray-900 rounded-2xl border border-gray-800 p-8 text-center space-y-6">
            <div className="w-16 h-16 mx-auto rounded-full bg-red-500/10 flex items-center justify-center">
              <span className="text-red-400 text-3xl font-bold">!</span>
            </div>

            <h1 className="text-xl font-bold text-white">Something went wrong</h1>
            <p className="text-gray-400 text-sm">
              An unexpected error occurred. Your data is safe — try refreshing the page.
            </p>

            {isDev && this.state.error && (
              <details className="text-left bg-gray-950 rounded-lg p-4 border border-gray-800">
                <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-300">
                  Error Details (dev only)
                </summary>
                <pre className="mt-2 text-xs text-red-400 overflow-auto max-h-48 whitespace-pre-wrap">
                  {this.state.error.message}
                  {'\n\n'}
                  {this.state.error.stack}
                </pre>
              </details>
            )}

            <div className="flex gap-3 justify-center">
              <button
                type="button"
                onClick={this.handleReset}
                className="px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-white text-xs font-bold uppercase tracking-widest rounded-lg transition-colors border border-gray-700"
              >
                Try Again
              </button>
              <button
                type="button"
                onClick={this.handleReload}
                className="px-5 py-2.5 bg-lime-400 hover:bg-white text-gray-900 text-xs font-bold uppercase tracking-widest rounded-lg transition-colors"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default GlobalErrorBoundary;
