'use client';
import { cn } from '@/lib/utils';
import { endOfQuarter, intervalToDuration } from 'date-fns';
import { AlarmClockIcon } from 'lucide-react';
import React, { useEffect } from 'react';

interface QuarterIntervalDurationProps
  extends React.HTMLAttributes<HTMLDivElement> {
  startDate?: Date;
  endDate?: Date;
}
export default function QuarterIntervalDuration({
  startDate,
  endDate,
  className,
  ...prop
}: QuarterIntervalDurationProps) {
  const [quarterIntervalDuration, setQuarterIntervalDuration] = React.useState(
    intervalToDuration({
      start: new Date(),
      end: endDate || endOfQuarter(new Date()),
    })
  );
  useEffect(() => {
    const interval = setInterval(() => {
      let iDT = intervalToDuration({
        start: new Date(),
        end: endDate || endOfQuarter(new Date()),
      });

      if (!iDT.seconds) {
        iDT.seconds = 0;
      }
      setQuarterIntervalDuration(iDT);
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  return (
    <div
      {...prop}
      className={cn(
        'text-center flex flex-col items-center gap-1 my-2',
        className
      )}
      {...prop}
    >
      <AlarmClockIcon className='size-8 text-gray-600' />
      <span className='text-xs text-gray-600 font-semibold'>Ends in</span>

      <p className='text-3xl font-bold tabular-nums text-foreground/80 flex items-center gap-2'>
        <span
          className={cn('hidden', {
            block: quarterIntervalDuration.months,
          })}
        >
          {quarterIntervalDuration.months}M
        </span>
        <span
          className={cn('hidden', {
            block: quarterIntervalDuration.days,
          })}
        >
          {quarterIntervalDuration.days}d
        </span>
        <span
          className={cn('hidden', {
            block: quarterIntervalDuration.hours,
          })}
        >
          {quarterIntervalDuration.hours}h
        </span>
        <span
          className={cn('hidden', {
            block: quarterIntervalDuration.minutes,
          })}
        >
          {quarterIntervalDuration.minutes}m
        </span>
        <span
          className={cn('hidden', {
            block: quarterIntervalDuration.seconds,
          })}
        >
          {quarterIntervalDuration.seconds}s
        </span>
      </p>
    </div>
  );
}
