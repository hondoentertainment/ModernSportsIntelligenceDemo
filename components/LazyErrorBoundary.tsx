import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  /** Optional compact mode for widget-level boundaries */
  compact?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error boundary specifically designed for lazy-loaded components.
 * Handles chunk loading failures with a retry mechanism.
 */
class LazyErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[LazyErrorBoundary] Chunk load error:', error, info.componentStack);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const isChunkError =
        this.state.error?.message?.includes('Loading chunk') ||
        this.state.error?.message?.includes('Failed to fetch') ||
        this.state.error?.message?.includes('dynamically imported module');

      if (this.props.compact) {
        return (
          <div className="bg-brand-slate border border-slate-800/50 rounded-2xl p-6 text-center space-y-3">
            <p className="text-sm text-brand-muted">
              {isChunkError ? 'Network error loading this section.' : 'Something went wrong.'}
            </p>
            <button
              onClick={isChunkError ? this.handleReload : this.handleRetry}
              className="px-4 py-2 bg-brand-lime text-brand-charcoal text-xs font-black uppercase tracking-widest rounded-lg hover:bg-white transition-colors"
            >
              {isChunkError ? 'Reload Page' : 'Retry'}
            </button>
          </div>
        );
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-center space-y-4 p-8">
          <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-2">
            <span className="text-red-400 text-xl">!</span>
          </div>
          <h2 className="text-lg font-bold text-white">
            {isChunkError ? 'Connection Error' : 'Something went wrong'}
          </h2>
          <p className="text-sm text-brand-muted max-w-md">
            {isChunkError
              ? 'A new version may be available, or your connection was interrupted. Please reload the page.'
              : (this.state.error?.message || 'An unexpected error occurred while loading this page.')}
          </p>
          <div className="flex gap-3">
            <button
              onClick={this.handleRetry}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-black uppercase tracking-widest rounded-lg transition-colors border border-slate-700"
            >
              Try Again
            </button>
            {isChunkError && (
              <button
                onClick={this.handleReload}
                className="px-5 py-2.5 bg-brand-lime text-brand-charcoal text-xs font-black uppercase tracking-widest rounded-lg hover:bg-white transition-colors"
              >
                Reload Page
              </button>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default LazyErrorBoundary;
