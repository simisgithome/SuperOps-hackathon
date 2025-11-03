// Tests for formatters utility functions
import { formatCurrency, formatPercent, formatNumber, formatDate } from '../utils/formatters';

describe('formatCurrency', () => {
  test('formats positive numbers correctly', () => {
    expect(formatCurrency(1234.56)).toBe('$1,234.56');
    expect(formatCurrency(1000000)).toBe('$1,000,000.00');
  });

  test('formats zero correctly', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });

  test('formats negative numbers correctly', () => {
    expect(formatCurrency(-1234.56)).toBe('-$1,234.56');
  });
});

describe('formatPercent', () => {
  test('formats decimal numbers as percentages', () => {
    expect(formatPercent(0.75)).toBe('75.0%');
    expect(formatPercent(0.5)).toBe('50.0%');
  });

  test('handles zero', () => {
    expect(formatPercent(0)).toBe('0.0%');
  });

  test('handles values over 100%', () => {
    expect(formatPercent(1.5)).toBe('150.0%');
  });
});

describe('formatNumber', () => {
  test('formats numbers with commas', () => {
    expect(formatNumber(1234)).toBe('1,234');
    expect(formatNumber(1000000)).toBe('1,000,000');
  });

  test('handles zero', () => {
    expect(formatNumber(0)).toBe('0');
  });
});

describe('formatDate', () => {
  test('formats dates correctly', () => {
    const dateString = '2024-01-15';
    const formatted = formatDate(dateString);
    expect(formatted).toMatch(/Jan.*15.*2024/);
  });

  test('handles invalid dates', () => {
    expect(formatDate('invalid')).toBe('Invalid Date');
  });
});
