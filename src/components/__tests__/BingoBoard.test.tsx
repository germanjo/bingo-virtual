import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import BingoBoard from '../BingoBoard';

describe('BingoBoard', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders the initial state with title, three buttons, 90 cells, and dice placeholder', () => {
    render(<BingoBoard />);

    expect(screen.getByRole('heading', { name: /Bingo/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sacar número' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Auto' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Reiniciar' })).toBeEnabled();
    expect(screen.getByText('🎲')).toBeInTheDocument();
    expect(
      screen.queryByText('¡Nuevo juego iniciado!'),
    ).not.toBeInTheDocument();

    for (let i = 1; i <= 90; i++) {
      expect(screen.getByText(String(i))).toBeInTheDocument();
    }
  });

  it('replaces the dice placeholder with a number when "Sacar número" is clicked', () => {
    render(<BingoBoard />);
    const drawButton = screen.getByRole('button', { name: 'Sacar número' });

    expect(screen.getByText('🎲')).toBeInTheDocument();
    fireEvent.click(drawButton);
    expect(screen.queryByText('🎲')).not.toBeInTheDocument();
  });

  it('shows the restart message and resets the current number on "Reiniciar"', () => {
    render(<BingoBoard />);
    const drawButton = screen.getByRole('button', { name: 'Sacar número' });
    const resetButton = screen.getByRole('button', { name: 'Reiniciar' });

    fireEvent.click(drawButton);
    expect(screen.queryByText('🎲')).not.toBeInTheDocument();

    fireEvent.click(resetButton);
    expect(screen.getByText('¡Nuevo juego iniciado!')).toBeInTheDocument();
    expect(screen.getByText('🎲')).toBeInTheDocument();
  });

  it('toggles the "Auto" button text to "Detener" when activated', () => {
    render(<BingoBoard />);
    const autoButton = screen.getByRole('button', { name: 'Auto' });

    fireEvent.click(autoButton);
    expect(screen.getByRole('button', { name: 'Detener' })).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Auto' }),
    ).not.toBeInTheDocument();
  });

  it('disables "Sacar número" while auto-draw is active', () => {
    render(<BingoBoard />);
    const drawButton = screen.getByRole('button', { name: 'Sacar número' });
    const autoButton = screen.getByRole('button', { name: 'Auto' });

    fireEvent.click(autoButton);
    expect(drawButton).toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: 'Detener' }));
    expect(drawButton).toBeEnabled();
  });

  it('updates the interval input when a valid value is typed', () => {
    render(<BingoBoard />);
    const input = screen.getByLabelText('Intervalo (segundos):');

    expect(input).toHaveValue(3);

    fireEvent.change(input, { target: { value: '5' } });
    expect(input).toHaveValue(5);
  });

  it('shows "¡Fin del juego!" and disables the draw button after all 90 numbers are drawn', () => {
    render(<BingoBoard />);
    const drawButton = screen.getByRole('button', { name: 'Sacar número' });

    for (let i = 0; i < 90; i++) {
      fireEvent.click(drawButton);
    }

    const endButton = screen.getByRole('button', { name: '¡Fin del juego!' });
    expect(endButton).toBeInTheDocument();
    expect(endButton).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Auto' })).toBeDisabled();
  });
  it('remembers primary color preferences independently of a game reset', () => {
    const first = render(<BingoBoard />);
    fireEvent.change(screen.getByLabelText('Color principal'), {
      target: { value: '#ffffff' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Reiniciar' }));
    first.unmount();
    render(<BingoBoard />);
    expect(screen.getByLabelText('Color principal')).toHaveValue('#ffffff');
    expect(
      screen
        .getByRole('button', { name: 'Sacar número' })
        .closest('.bingo-board'),
    ).toHaveStyle({
      '--bingo-primary': '#ffffff',
      '--bingo-contrast': '#000000',
    });
  });
});
