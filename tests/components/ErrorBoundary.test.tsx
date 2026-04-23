// @ts-nocheck
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import ErrorBoundary from '../../components/ErrorBoundary';

// A component that throws on demand
function BrokenComponent({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error('Test render error');
  }
  return <div>All good</div>;
}

describe('ErrorBoundary', () => {
  // Suppress console.error for expected errors
  const originalError = console.error;
  beforeEach(() => {
    console.error = vi.fn();
  });

  afterEach(() => {
    console.error = originalError;
  });

  it('renders children when no error', () => {
    render(
      <ErrorBoundary>
        <div>Hello World</div>
      </ErrorBoundary>
    );
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  it('renders fallback UI when child throws', () => {
    render(
      <ErrorBoundary>
        <BrokenComponent shouldThrow={true} />
      </ErrorBoundary>
    );
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Test render error')).toBeInTheDocument();
  });

  it('renders custom fallback when provided', () => {
    render(
      <ErrorBoundary fallback={<div>Custom Fallback</div>}>
        <BrokenComponent shouldThrow={true} />
      </ErrorBoundary>
    );
    expect(screen.getByText('Custom Fallback')).toBeInTheDocument();
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
  });

  it('provides a try again button that resets the error state', () => {
    // Use a flag that we can toggle externally
    let shouldThrow = true;
    function DynamicChild() {
      if (shouldThrow) throw new Error('Test render error');
      return <div>All good</div>;
    }

    const { rerender } = render(
      <ErrorBoundary>
        <DynamicChild />
      </ErrorBoundary>
    );
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();

    // Toggle the flag so the next render succeeds, then click "Try again"
    shouldThrow = false;
    fireEvent.click(screen.getByText('Try again'));

    // After reset + rerender, the child should render successfully
    rerender(
      <ErrorBoundary>
        <DynamicChild />
      </ErrorBoundary>
    );
    expect(screen.getByText('All good')).toBeInTheDocument();
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
  });
});
