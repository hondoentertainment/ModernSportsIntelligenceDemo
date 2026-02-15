
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import NegotiationModal from '../../components/NegotiationModal';

// Mock scrollIntoView
window.HTMLElement.prototype.scrollIntoView = vi.fn();

describe('NegotiationModal', () => {
    const mockItem = {
        id: 'test-item',
        name: 'Test Player',
        player: 'Test Player',
        year: 2024,
        manufacturer: 'Topps',
        price: 150,
        image: 'test.jpg'
    };

    const onClose = vi.fn();
    const onSuccess = vi.fn();

    it('renders correctly when open', () => {
        render(<NegotiationModal isOpen={true} onClose={onClose} targetItem={mockItem} onSuccess={onSuccess} />);
        expect(screen.getByText('Negotiation')).toBeInTheDocument();
        expect(screen.getByText('Test Player')).toBeInTheDocument();
    });

    it('does not render when closed', () => {
        render(<NegotiationModal isOpen={false} onClose={onClose} targetItem={mockItem} onSuccess={onSuccess} />);
        expect(screen.queryByText('Negotiation')).not.toBeInTheDocument();
    });

    it('allows starting a negotiation', async () => {
        render(<NegotiationModal isOpen={true} onClose={onClose} targetItem={mockItem} onSuccess={onSuccess} />);

        const input = screen.getByPlaceholderText('0.00'); // Check placeholder
        fireEvent.change(input, { target: { value: '100' } });

        const button = screen.getByText('Enter Arena');
        expect(button).not.toBeDisabled();

        fireEvent.click(button);

        // Should switch to Arena view
        await waitFor(() => {
            expect(screen.getByText(/asking \$150/i)).toBeInTheDocument(); // Seller initial content
        });
    });

    it('handles user offers', async () => {
        render(<NegotiationModal isOpen={true} onClose={onClose} targetItem={mockItem} onSuccess={onSuccess} />);

        // Start
        fireEvent.change(screen.getByPlaceholderText('0.00'), { target: { value: '140' } });
        fireEvent.click(screen.getByText('Enter Arena'));

        // Wait for Arena
        await waitFor(() => screen.getByPlaceholderText('Counter offer...'));

        // Send Offer
        const offerInput = screen.getByPlaceholderText('Counter offer...');
        fireEvent.change(offerInput, { target: { value: '120' } });
        fireEvent.click(screen.getByRole('button', { name: 'Send Offer' }));

    });
});
