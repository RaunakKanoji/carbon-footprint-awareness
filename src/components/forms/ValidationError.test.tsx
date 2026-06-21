import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import ValidationError from './ValidationError';

describe('ValidationError Component', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders nothing when message is empty or undefined', () => {
    const { container } = render(<ValidationError />);
    expect(container.firstChild).toBeNull();
  });

  it('renders the correct validation message when provided', () => {
    render(<ValidationError message="Name is required." />);
    const errorText = screen.getByText('Name is required.');
    expect(errorText).toBeDefined();
    expect(errorText.tagName).toBe('P');
    expect(errorText.className).toContain('text-state-error');
  });

  it('applies custom className passed via props', () => {
    render(<ValidationError message="Error message" className="custom-class" />);
    const errorText = screen.getByText('Error message');
    expect(errorText.className).toContain('custom-class');
  });
});
