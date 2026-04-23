// @ts-nocheck
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { WidgetErrorBoundary } from '../../components/ui/WidgetErrorBoundary';

// A component that throws on demand
function BrokenComponent({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error('Widget render error');
  }
  return <div>Widget loaded</div>;
}

describe('WidgetErrorBoundary', () => {
  const originalError = console.error;

  beforeEach(() => {
    // Suppress React's expected error boundary console.error calls
    console.error = vi.fn();
  });

  afterEach(() => {
    console.error = originalError;
  });

  it('renders children normally when no error', () => {
    render(
      <WidgetErrorBoundary title="Test Widget">
        <div>Normal content</div>
      </WidgetErrorBoundary>
    );
    expect(screen.getByText('Normal content')).toBeInTheDocument();
  });

  it('shows fallback UI when child throws', () => {
    render(
      <WidgetErrorBoundary title="Test Widget">
        <BrokenComponent shouldThrow={true} />
      </WidgetErrorBoundary>
    );
    expect(screen.getByText('Unable to load widget')).toBeInTheDocument();
    expect(screen.getByText('Test Widget')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });

  it('Retry button resets error state and re-renders children', () => {
    let shouldThrow = true;

    function DynamicChild() {
      if (shouldThrow) throw new Error('Widget render error');
      return <div>Widget recovered</div>;
    }

    const { rerender } = render(
      <WidgetErrorBoundary title="Test Widget">
        <DynamicChild />
      </WidgetErrorBoundary>
    );

    // Error state is shown
    expect(screen.getByText('Unable to load widget')).toBeInTheDocument();

    // Allow the child to succeed on next render
    shouldThrow = false;
    fireEvent.click(screen.getByRole('button', { name: /retry/i }));

    // Re-render with fixed child
    rerender(
      <WidgetErrorBoundary title="Test Widget">
        <DynamicChild />
      </WidgetErrorBoundary>
    );

    expect(screen.getByText('Widget recovered')).toBeInTheDocument();
    expect(screen.queryByText('Unable to load widget')).not.toBeInTheDocument();
  });
});
