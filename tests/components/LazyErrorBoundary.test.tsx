import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import LazyErrorBoundary from '../../components/LazyErrorBoundary';

// Component that throws
const ThrowingComponent: React.FC<{ error?: Error }> = ({ error }) => {
  if (error) throw error;
  return <div>Child content</div>;
};

// Suppress error boundary console errors in tests
beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

describe('LazyErrorBoundary', () => {
  it('renders children when no error', () => {
    render(
      <LazyErrorBoundary>
        <div>Safe content</div>
      </LazyErrorBoundary>
    );
    expect(screen.getByText('Safe content')).toBeInTheDocument();
  });

  it('shows error UI when child throws', () => {
    render(
      <LazyErrorBoundary>
        <ThrowingComponent error={new Error('Test error')} />
      </LazyErrorBoundary>
    );
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Test error')).toBeInTheDocument();
    expect(screen.getByText('Try Again')).toBeInTheDocument();
  });

  it('shows chunk error UI for Loading chunk errors', () => {
    render(
      <LazyErrorBoundary>
        <ThrowingComponent error={new Error('Loading chunk xyz failed')} />
      </LazyErrorBoundary>
    );
    expect(screen.getByText('Connection Error')).toBeInTheDocument();
    expect(screen.getByText('Reload Page')).toBeInTheDocument();
  });

  it('shows chunk error UI for Failed to fetch errors', () => {
    render(
      <LazyErrorBoundary>
        <ThrowingComponent error={new Error('Failed to fetch dynamically imported module')} />
      </LazyErrorBoundary>
    );
    expect(screen.getByText('Connection Error')).toBeInTheDocument();
  });

  it('compact mode shows simplified error', () => {
    render(
      <LazyErrorBoundary compact>
        <ThrowingComponent error={new Error('Test error')} />
      </LazyErrorBoundary>
    );
    expect(screen.getByText('Something went wrong.')).toBeInTheDocument();
    expect(screen.getByText('Retry')).toBeInTheDocument();
  });

  it('compact mode shows network error for chunk errors', () => {
    render(
      <LazyErrorBoundary compact>
        <ThrowingComponent error={new Error('Loading chunk failed')} />
      </LazyErrorBoundary>
    );
    expect(screen.getByText('Network error loading this section.')).toBeInTheDocument();
    expect(screen.getByText('Reload Page')).toBeInTheDocument();
  });

  it('Try Again resets error state', () => {
    // Use a ref to control whether the component throws
    let shouldThrow = true;
    const ConditionalThrow: React.FC = () => {
      if (shouldThrow) throw new Error('Temporary error');
      return <div>Recovered</div>;
    };

    render(
      <LazyErrorBoundary>
        <ConditionalThrow />
      </LazyErrorBoundary>
    );
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();

    shouldThrow = false;
    fireEvent.click(screen.getByText('Try Again'));
    expect(screen.getByText('Recovered')).toBeInTheDocument();
  });
});
