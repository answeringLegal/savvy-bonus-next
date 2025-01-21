import React, { useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from './ui/calendar';
import { ActiveModifiers } from 'react-day-picker';
type DateSelectProps = React.ComponentProps<typeof Calendar> & {
  isClearable?: boolean;
};
const DateSelect = ({ isClearable = false, ...props }: DateSelectProps) => {
  const [date, setDate] = React.useState<Date>();
  const [showDatePicker, setShowDatePicker] = React.useState(false);
  const datePickerRef = useRef<HTMLDivElement>(null); // Ref for the date picker container

  const handleDayClick = (
    day: Date,
    activeModifiers: ActiveModifiers,
    e: any
  ) => {
    setDate(day);
    setShowDatePicker(false);
    props.onDayClick?.(day, activeModifiers, e);
  };
  // Close date picker if clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        datePickerRef.current &&
        !datePickerRef.current.contains(event.target as Node)
      ) {
        setShowDatePicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [datePickerRef]);

  return (
    <div ref={datePickerRef}>
      <Button
        type='button'
        variant={'outline'}
        className={cn(
          ' justify-start text-left font-normal',
          !date && 'text-muted-foreground'
        )}
        onClick={() => setShowDatePicker(!showDatePicker)}
      >
        <CalendarIcon className='mr-2 h-4 w-4' />
        {date ? format(date, 'PPP') : <span>Pick a date</span>}
      </Button>

      <div
        className={cn(
          'absolute z-50 bg-card border border-border rounded-lg animate-in animate-out transition-all ease-in-out duration-300 opacity-0',
          {
            'opacity-100': showDatePicker,
            'opacity-0': !showDatePicker,
            'z-50': showDatePicker,
            '-z-50': !showDatePicker,
          }
        )}
      >
        {showDatePicker && (
          <>
            {/* button to clear */}
            {isClearable && (
              <div className='flex justify-end'>
                <Button
                  type='button'
                  variant='ghost'
                  onClick={() => {
                    setDate(undefined);
                    setShowDatePicker(false);
                    props.selected = undefined;
                  }}
                >
                  Clear
                </Button>
              </div>
            )}
            <Calendar {...props} onDayClick={handleDayClick} />
          </>
        )}
      </div>
    </div>
  );
};

export default DateSelect;
