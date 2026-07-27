import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../../lib/utils/useFocusTrap', () => ({
  useFocusTrap: () => React.createRef(),
}));

import CommandPalette from '../../components/CommandPalette';

function renderPalette(props: Partial<React.ComponentProps<typeof CommandPalette>> = {}) {
  const onClose = props.onClose ?? vi.fn();
  return render(
    <MemoryRouter>
      <CommandPalette isOpen onClose={onClose} {...props} />
    </MemoryRouter>,
  );
}

describe('CommandPalette', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders Navigate, Run, and Features sections by default', () => {
    renderPalette();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Navigate')).toBeInTheDocument();
    expect(screen.getByText('Run')).toBeInTheDocument();
    expect(screen.getByText('Features')).toBeInTheDocument();
  });

  it('lists the four core slash commands in the Run section', () => {
    renderPalette();
    expect(screen.getByText('Run /scan')).toBeInTheDocument();
    expect(screen.getByText('Run /compare')).toBeInTheDocument();
    expect(screen.getByText('Run /war-room')).toBeInTheDocument();
    expect(screen.getByText('Run /buy')).toBeInTheDocument();
  });

  it('narrows results when a query is typed', () => {
    renderPalette();
    const input = screen.getByLabelText('Search commands and features');
    fireEvent.change(input, { target: { value: 'scan' } });

    expect(screen.getByText('Run /scan')).toBeInTheDocument();
    // /compare should be filtered out
    expect(screen.queryByText('Run /compare')).not.toBeInTheDocument();
  });

  it('ranks Run /scan first for bare "scan" query', () => {
    renderPalette();
    const input = screen.getByLabelText('Search commands and features');
    fireEvent.change(input, { target: { value: 'scan' } });

    const options = screen.getAllByRole('option');
    expect(options[0]).toHaveTextContent(/Run \/scan/i);
  });

  it('navigates to / when Enter is pressed on the Run /scan row', () => {
    const onClose = vi.fn();
    renderPalette({ onClose });
    const input = screen.getByLabelText('Search commands and features');
    fireEvent.change(input, { target: { value: 'Run /scan' } });

    // The single matched item is selected by default at index 0.
    const dialog = screen.getByRole('dialog');
    const panel = dialog.firstElementChild as HTMLElement;
    fireEvent.keyDown(panel, { key: 'Enter' });

    expect(mockNavigate).toHaveBeenCalledWith('/');
    expect(onClose).toHaveBeenCalled();
  });

  it('navigates when a feature row is clicked', () => {
    const onClose = vi.fn();
    renderPalette({ onClose });
    const input = screen.getByLabelText('Search commands and features');
    fireEvent.change(input, { target: { value: 'League Intelligence Dashboard' } });

    const featureBtn = screen.getByText('League Intelligence Dashboard');
    fireEvent.click(featureBtn);

    expect(mockNavigate).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it('closes when Escape is pressed', () => {
    const onClose = vi.fn();
    renderPalette({ onClose });
    const dialog = screen.getByRole('dialog');
    const panel = dialog.firstElementChild as HTMLElement;
    fireEvent.keyDown(panel, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });

  it('renders nothing when isOpen=false', () => {
    render(
      <MemoryRouter>
        <CommandPalette isOpen={false} onClose={vi.fn()} />
      </MemoryRouter>,
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
