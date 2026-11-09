import { Temporal } from '@js-temporal/polyfill';
import type { TimeFormat } from '../types';

export interface ClockParts {
  hour: number;
  minute: number;
  second: number;
  dayPeriod: string;
  date: string;
  weekday: string;
}

export type LocalTimeResolution =
  | { kind: 'unique'; value: Temporal.ZonedDateTime }
  | { kind: 'ambiguous'; earlier: Temporal.ZonedDateTime; later: Temporal.ZonedDateTime }
  | { kind: 'nonexistent'; earlier: Temporal.ZonedDateTime; later: Temporal.ZonedDateTime };

export function getClockParts(timestamp: number, timezone: string, format: TimeFormat = '24h'): ClockParts {
  const date = new Date(timestamp);
  const timeParts = new Intl.DateTimeFormat('en-GB', {
    timeZone: timezone,
    hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: format === '24h' ? 'h23' : 'h12',
  }).formatToParts(date);
  const part = (type: Intl.DateTimeFormatPartTypes) => timeParts.find((item) => item.type === type)?.value ?? '';
  const rawHour = Number(part('hour'));
  const hour = format === '12h' ? rawHour % 12 || 12 : rawHour;
  const dateParts = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone, weekday: 'long', month: 'short', day: 'numeric', year: 'numeric',
  }).formatToParts(date);
  const getDatePart = (type: Intl.DateTimeFormatPartTypes) => dateParts.find((item) => item.type === type)?.value ?? '';
  const period = part('dayPeriod');
  return {
    hour,
    minute: Number(part('minute')),
    second: Number(part('second')),
    dayPeriod: period,
    date: `${getDatePart('month')} ${getDatePart('day')}, ${getDatePart('year')}`,
    weekday: getDatePart('weekday'),
  };
}

export function formatTime(timestamp: number, timezone: string, format: TimeFormat = '24h', withSeconds = false): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    hour: format === '24h' ? '2-digit' : 'numeric', minute: '2-digit', ...(withSeconds ? { second: '2-digit' } : {}),
    hourCycle: format === '24h' ? 'h23' : 'h12',
  }).format(new Date(timestamp));
}

export function formatDate(timestamp: number, timezone: string, style: 'short' | 'long' = 'short'): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    weekday: style === 'long' ? 'long' : undefined,
    month: style === 'long' ? 'long' : 'short',
    day: 'numeric',
    year: style === 'long' ? 'numeric' : undefined,
  }).format(new Date(timestamp));
}

export function getOffsetLabel(timestamp: number, timezone: string): string {
  const offset = Temporal.Instant.fromEpochMilliseconds(timestamp).toZonedDateTimeISO(timezone).offset;
  return `UTC${offset === '+00:00' ? '+00:00' : offset}`;
}

export function getOffsetMinutes(timestamp: number, timezone: string): number {
  return Temporal.Instant.fromEpochMilliseconds(timestamp).toZonedDateTimeISO(timezone).offsetNanoseconds / 60_000_000_000;
}

export function getDayDifference(timestamp: number, timezone: string, referenceTimezone = 'UTC'): number {
  const targetDate = Temporal.Instant.fromEpochMilliseconds(timestamp).toZonedDateTimeISO(timezone).toPlainDate();
  const referenceDate = Temporal.Instant.fromEpochMilliseconds(timestamp).toZonedDateTimeISO(referenceTimezone).toPlainDate();
  return targetDate.since(referenceDate, { largestUnit: 'days' }).days;
}

export function getZonedDateParts(timestamp: number, timezone: string) {
  const zoned = Temporal.Instant.fromEpochMilliseconds(timestamp).toZonedDateTimeISO(timezone);
  return {
    year: zoned.year, month: zoned.month, day: zoned.day,
    hour: zoned.hour, minute: zoned.minute, second: zoned.second,
    weekday: zoned.dayOfWeek,
  };
}

export function resolveLocalTime(date: string, time: string, timezone: string): LocalTimeResolution {
  const plainDate = Temporal.PlainDate.from(date);
  const plainTime = Temporal.PlainTime.from(time);
  const plain = plainDate.toPlainDateTime(plainTime);
  const fields = {
    timeZone: timezone,
    year: plain.year, month: plain.month, day: plain.day,
    hour: plain.hour, minute: plain.minute, second: plain.second,
  };
  const earlier = Temporal.ZonedDateTime.from(fields, { disambiguation: 'earlier' });
  const later = Temporal.ZonedDateTime.from(fields, { disambiguation: 'later' });
  const earlierMatches = earlier.toPlainDateTime().equals(plain);
  const laterMatches = later.toPlainDateTime().equals(plain);
  if (earlierMatches && laterMatches && earlier.epochNanoseconds !== later.epochNanoseconds) {
    return { kind: 'ambiguous', earlier, later };
  }
  if (!earlierMatches && !laterMatches) return { kind: 'nonexistent', earlier, later };
  return { kind: 'unique', value: earlierMatches ? earlier : later };
}

export function toZonedDateTime(timestamp: number, timezone: string): Temporal.ZonedDateTime {
  return Temporal.Instant.fromEpochMilliseconds(timestamp).toZonedDateTimeISO(timezone);
}

export function isDaytime(timestamp: number, timezone: string): boolean {
  const hour = getZonedDateParts(timestamp, timezone).hour;
  return hour >= 6 && hour < 18;
}

export function describeDayDifference(days: number): string {
  if (days === 0) return 'Same day';
  if (days === 1) return 'Tomorrow';
  if (days === -1) return 'Yesterday';
  return days > 0 ? `+${days} days` : `${days} days`;
}
