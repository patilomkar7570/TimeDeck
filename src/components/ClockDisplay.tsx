import { useMemo } from 'react';
import type { ClockStyle, TimeFormat } from '../types';
import { getClockParts, formatTime } from '../lib/time';

interface ClockDisplayProps {
  timestamp: number;
  timezone: string;
  format: TimeFormat;
  style: ClockStyle;
  large?: boolean;
}

export function ClockDisplay({ timestamp, timezone, format, style, large = false }: ClockDisplayProps) {
  const parts = useMemo(() => getClockParts(timestamp, timezone, format), [timestamp, timezone, format]);
  if (style === 'analog') {
    const tickRadius = large ? 67 : 44;
    const seconds = parts.second;
    const minute = parts.minute + seconds / 60;
    const hour = (parts.hour % 12) + minute / 60;
    return (
      <div className={`analog-clock ${large ? 'analog-clock--large' : ''}`} role="img" aria-label={`Analog clock showing ${formatTime(timestamp, timezone, format, true)}`}>
        {Array.from({ length: 12 }, (_, index) => <span key={index} className="clock-tick" style={{ transform: `rotate(${index * 30}deg) translateY(-${tickRadius}px)` }} />)}
        <span className="clock-hand clock-hand--hour" style={{ transform: `translateX(-50%) rotate(${hour * 30}deg)` }} />
        <span className="clock-hand clock-hand--minute" style={{ transform: `translateX(-50%) rotate(${minute * 6}deg)` }} />
        <span className="clock-hand clock-hand--second" style={{ transform: `translateX(-50%) rotate(${seconds * 6}deg)` }} />
        <span className="clock-pin" />
      </div>
    );
  }
  const digitalValue = formatTime(timestamp, timezone, format, true).replace(/\s?(AM|PM)$/i, '');
  return (
    <div className={`digital-clock ${large ? 'digital-clock--large' : ''}`}>
      <span>{digitalValue}</span>
      {format === '12h' && parts.dayPeriod && <em>{parts.dayPeriod}</em>}
    </div>
  );
}
