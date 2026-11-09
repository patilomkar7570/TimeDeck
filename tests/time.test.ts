import { describe, expect, it } from 'vitest';
import { formatTime, getClockParts, getDayDifference, getOffsetLabel, resolveLocalTime } from '../src/lib/time';

describe('timezone-aware clock calculations', () => {
  it('formats 12-hour and 24-hour clocks from the same timestamp', () => {
    const instant = Date.UTC(2026, 10, 10, 8, 5, 9);
    expect(formatTime(instant, 'Asia/Kolkata', '24h')).toBe('13:35');
    expect(formatTime(instant, 'Asia/Kolkata', '12h')).toMatch(/1:35\s?PM/i);
    expect(getClockParts(instant, 'Asia/Kolkata', '24h').minute).toBe(35);
  });

  it('calculates daylight-saving offsets dynamically', () => {
    expect(getOffsetLabel(Date.UTC(2026, 0, 15, 12), 'America/New_York')).toBe('UTC-05:00');
    expect(getOffsetLabel(Date.UTC(2026, 6, 15, 12), 'America/New_York')).toBe('UTC-04:00');
  });

  it('detects a non-existent spring-forward local time', () => {
    const result = resolveLocalTime('2024-03-10', '02:30', 'America/New_York');
    expect(result.kind).toBe('nonexistent');
    if (result.kind === 'nonexistent') {
      expect(result.earlier.toPlainDateTime().toString()).not.toBe('2024-03-10T02:30:00');
      expect(result.later.toPlainDateTime().toString()).not.toBe('2024-03-10T02:30:00');
    }
  });

  it('detects an ambiguous fall-back local time', () => {
    const result = resolveLocalTime('2024-11-03', '01:30', 'America/New_York');
    expect(result.kind).toBe('ambiguous');
    if (result.kind === 'ambiguous') {
      expect(result.earlier.epochMilliseconds).not.toBe(result.later.epochMilliseconds);
      expect(result.earlier.offset).not.toBe(result.later.offset);
    }
  });

  it('calculates date changes across timezones', () => {
    const instant = Date.UTC(2026, 0, 1, 0, 30);
    expect(getDayDifference(instant, 'America/New_York', 'UTC')).toBe(-1);
    expect(getDayDifference(instant, 'Asia/Tokyo', 'UTC')).toBe(0);
  });
});
