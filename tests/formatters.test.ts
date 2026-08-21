import { describe, it, expect } from 'vitest';
import { formatPrice, formatUnit, cleanUnitName, formatArabicDate } from '../src/lib/formatters';

describe('Formatters (Price, Unit, Dates)', () => {
  it('formats integer and decimal prices correctly', () => {
    expect(formatPrice(3950)).toBe('3,950 د.ل');
    expect(formatPrice(28.5)).toBe('28.50 د.ل');
    expect(formatPrice(305)).toBe('305 د.ل');
  });

  it('handles null, undefined, 0, or negative prices as unavailable', () => {
    expect(formatPrice(null)).toBe('السعر غير متوفر حاليًا');
    expect(formatPrice(undefined)).toBe('السعر غير متوفر حاليًا');
    expect(formatPrice(0)).toBe('السعر غير متوفر حاليًا');
    expect(formatPrice(-100)).toBe('السعر غير متوفر حاليًا');
  });

  it('formats units with appropriate Arabic prepositions', () => {
    expect(formatUnit('طن')).toBe('للطن');
    expect(formatUnit('كيس')).toBe('للكيس');
    expect(formatUnit('قطعة')).toBe('للقطعة');
    expect(formatUnit('م³')).toBe('للم³');
    expect(formatUnit('حمولة')).toBe('للحمولة');
    expect(formatUnit('')).toBe('');
    expect(formatUnit(null)).toBe('');
  });

  it('cleans unit names', () => {
    expect(cleanUnitName(' طن ')).toBe('طن');
    expect(cleanUnitName('كيس')).toBe('كيس');
  });

  it('formats Arabic date strings gracefully', () => {
    expect(formatArabicDate('اليوم 08:30 صباحًا')).toBe('اليوم 08:30 صباحًا');
    expect(formatArabicDate(null)).toBe('اليوم 08:30 صباحًا');
  });
});
