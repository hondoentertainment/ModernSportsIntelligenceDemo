import React from 'react';

interface Props {
  children: React.ReactNode;
  title?: string;
}

interface State {
  hasError: boolean;
}

export class WidgetErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.error('[WidgetErrorBoundary]', error, info?.componentStack);
  }

  handleRetry = (): void => {
    this.setState({ hasError: false });
  };

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-5 flex flex-col items-center justify-center gap-3 min-h-[120px] text-center">
          <span className="text-2xl" role="img" aria-label="warning">⚠</span>
          {this.props.title && (
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{this.props.title}</p>
          )}
          <p className="text-sm text-gray-500">Unable to load widget</p>
          <button
            type="button"
            onClick={this.handleRetry}
            className="mt-1 px-4 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-xs font-bold uppercase tracking-widest rounded-lg transition-colors border border-gray-600"
          >
            Retry
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export function withWidgetBoundary(title: string, children: React.ReactNode): React.ReactElement {
  return <WidgetErrorBoundary title={title}>{children}</WidgetErrorBoundary>;
}
