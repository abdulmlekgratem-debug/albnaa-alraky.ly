import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { BackToTop } from '../src/components/navigation/BackToTop';

describe('BackToTop', () => {
  it('appears after scrolling and returns the page to the top', () => {
    const scrollTo = vi.fn();
    Object.defineProperty(window, 'scrollTo', { configurable: true, value: scrollTo });
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: () => ({ matches: false }),
    });
    Object.defineProperty(window, 'scrollY', { configurable: true, value: 0 });

    render(<BackToTop />);
    expect(screen.queryByRole('button', { name: 'العودة إلى أعلى الصفحة' })).not.toBeInTheDocument();

    Object.defineProperty(window, 'scrollY', { configurable: true, value: 700 });
    fireEvent.scroll(window);
    fireEvent.click(screen.getByRole('button', { name: 'العودة إلى أعلى الصفحة' }));

    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
  });
});
