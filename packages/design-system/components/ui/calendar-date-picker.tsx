// src/components/calendar-date-picker.tsx
/** biome-ignore-all lint/suspicious/noArrayIndexKey: <explanation> */
/** biome-ignore-all lint/a11y/useKeyWithMouseEvents: <explanation> */
/** biome-ignore-all lint/a11y/noStaticElementInteractions: <explanation> */

'use client';

import { Button } from '@repo/design-system/components/ui/button';
import { Calendar } from '@repo/design-system/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@repo/design-system/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/design-system/components/ui/select';
import { cn } from '@repo/design-system/lib/utils';
import type { VariantProps } from 'class-variance-authority';
import { cva } from 'class-variance-authority';
import {
  endOfDay,
  endOfMonth,
  endOfWeek,
  endOfYear,
  startOfDay,
  startOfMonth,
  startOfWeek,
  startOfYear,
  subDays,
} from 'date-fns';
import { formatInTimeZone, toDate } from 'date-fns-tz';
import { CalendarIcon } from 'lucide-react';
import { forwardRef, useEffect, useState } from 'react';
import type { DateRange } from 'react-day-picker';

const months = [
  'Januar',
  'Februar',
  'März',
  'April',
  'Mai',
  'Juni',
  'Juli',
  'August',
  'September',
  'Oktober',
  'November',
  'Dezember',
];

const multiSelectVariants = cva(
  'flex items-center justify-center whitespace-nowrap rounded-md font-medium text-foreground text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    defaultVariants: {
      variant: 'default',
    },
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        ghost: 'text-background hover:bg-accent hover:text-accent-foreground',
        link: 'text-background text-primary underline-offset-4 hover:underline',
        outline:
          'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80',
      },
    },
  }
);

interface CalendarDatePickerProps
  extends React.HTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof multiSelectVariants> {
  className?: string;
  closeOnSelect?: boolean;
  date: DateRange;
  disabled?: boolean;
  id?: string;
  numberOfMonths?: 1 | 2;
  onDateSelect: (range: { from: Date; to: Date }) => void;
  yearsRange?: number;
}

export const CalendarDatePicker = forwardRef<
  HTMLButtonElement,
  CalendarDatePickerProps
>(
  (
    {
      id = 'calendar-date-picker',
      className,
      date,
      closeOnSelect = true,
      numberOfMonths = 2,
      yearsRange = 10,
      onDateSelect,
      disabled = false,
      variant,
      ...props
    },
    ref
  ) => {
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    const [selectedRange, setSelectedRange] = useState<string | null>(
      numberOfMonths === 2 ? 'Dieses Jahr' : 'Heute'
    );
    const [monthFrom, setMonthFrom] = useState<Date | undefined>(date?.from);
    const [yearFrom, setYearFrom] = useState<number | undefined>(
      date?.from?.getFullYear()
    );
    const [monthTo, setMonthTo] = useState<Date | undefined>(
      numberOfMonths === 2 ? date?.to : date?.from
    );
    const [yearTo, setYearTo] = useState<number | undefined>(
      numberOfMonths === 2 ? date?.to?.getFullYear() : date?.from?.getFullYear()
    );
    const [highlightedPart, setHighlightedPart] = useState<string | null>(null);

    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const handleClose = () => setIsPopoverOpen(false);

    const handleTogglePopover = () => setIsPopoverOpen((prev) => !prev);

    const selectDateRange = (from: Date, to: Date, range: string) => {
      const startDate = startOfDay(toDate(from, { timeZone }));
      const endDate =
        numberOfMonths === 2 ? endOfDay(toDate(to, { timeZone })) : startDate;
      onDateSelect({ from: startDate, to: endDate });
      setSelectedRange(range);
      setMonthFrom(from);
      setYearFrom(from.getFullYear());
      setMonthTo(to);
      setYearTo(to.getFullYear());
      closeOnSelect && setIsPopoverOpen(false);
    };

    const handleDateSelect = (range: DateRange | undefined) => {
      if (range) {
        let from = startOfDay(toDate(range.from as Date, { timeZone }));
        let to = range.to ? endOfDay(toDate(range.to, { timeZone })) : from;
        if (numberOfMonths === 1) {
          if (range.from === date.from) {
            from = startOfDay(toDate(range.to as Date, { timeZone }));
          } else {
            to = from;
          }
        }
        onDateSelect({ from, to });
        setMonthFrom(from);
        setYearFrom(from.getFullYear());
        setMonthTo(to);
        setYearTo(to.getFullYear());
      }
      setSelectedRange(null);
    };

    const handleMonthChange = (newMonthIndex: number, part: string) => {
      setSelectedRange(null);
      if (part === 'from') {
        if (yearFrom !== undefined) {
          if (newMonthIndex < 0 || newMonthIndex > yearsRange + 1) {
            return;
          }
          const newMonth = new Date(yearFrom, newMonthIndex, 1);
          const from =
            numberOfMonths === 2
              ? startOfMonth(toDate(newMonth, { timeZone }))
              : date?.from
                ? new Date(
                    date.from.getFullYear(),
                    newMonth.getMonth(),
                    date.from.getDate()
                  )
                : newMonth;
          const to =
            numberOfMonths === 2
              ? date.to
                ? endOfDay(toDate(date.to, { timeZone }))
                : endOfMonth(toDate(newMonth, { timeZone }))
              : from;
          if (from <= to) {
            onDateSelect({ from, to });
            setMonthFrom(newMonth);
            setMonthTo(date.to);
          }
        }
      } else if (yearTo !== undefined) {
        if (newMonthIndex < 0 || newMonthIndex > yearsRange + 1) {
          return;
        }
        const newMonth = new Date(yearTo, newMonthIndex, 1);
        const from = date.from
          ? startOfDay(toDate(date.from, { timeZone }))
          : startOfMonth(toDate(newMonth, { timeZone }));
        const to =
          numberOfMonths === 2
            ? endOfMonth(toDate(newMonth, { timeZone }))
            : from;
        if (from <= to) {
          onDateSelect({ from, to });
          setMonthTo(newMonth);
          setMonthFrom(date.from);
        }
      }
    };

    const handleYearChange = (newYear: number, part: string) => {
      setSelectedRange(null);
      if (part === 'from') {
        if (years.includes(newYear)) {
          const newMonth = monthFrom
            ? new Date(newYear, monthFrom ? monthFrom.getMonth() : 0, 1)
            : new Date(newYear, 0, 1);
          const from =
            numberOfMonths === 2
              ? startOfMonth(toDate(newMonth, { timeZone }))
              : date.from
                ? new Date(newYear, newMonth.getMonth(), date.from.getDate())
                : newMonth;
          const to =
            numberOfMonths === 2
              ? date.to
                ? endOfDay(toDate(date.to, { timeZone }))
                : endOfMonth(toDate(newMonth, { timeZone }))
              : from;
          if (from <= to) {
            onDateSelect({ from, to });
            setYearFrom(newYear);
            setMonthFrom(newMonth);
            setYearTo(date.to?.getFullYear());
            setMonthTo(date.to);
          }
        }
      } else if (years.includes(newYear)) {
        const newMonth = monthTo
          ? new Date(newYear, monthTo.getMonth(), 1)
          : new Date(newYear, 0, 1);
        const from = date.from
          ? startOfDay(toDate(date.from, { timeZone }))
          : startOfMonth(toDate(newMonth, { timeZone }));
        const to =
          numberOfMonths === 2
            ? endOfMonth(toDate(newMonth, { timeZone }))
            : from;
        if (from <= to) {
          onDateSelect({ from, to });
          setYearTo(newYear);
          setMonthTo(newMonth);
          setYearFrom(date.from?.getFullYear());
          setMonthFrom(date.from);
        }
      }
    };

    const today = new Date();

    const years = Array.from(
      { length: yearsRange + 1 },
      (_, i) => today.getFullYear() - yearsRange / 2 + i
    );

    const dateRanges = [
      { end: today, label: 'Heute', start: today },
      { end: subDays(today, 1), label: 'Gestern', start: subDays(today, 1) },
      {
        end: endOfWeek(today, { weekStartsOn: 1 }),
        label: 'Diese Woche',
        start: startOfWeek(today, { weekStartsOn: 1 }),
      },
      {
        end: subDays(endOfWeek(today, { weekStartsOn: 1 }), 7),
        label: 'Letzte Woche',
        start: subDays(startOfWeek(today, { weekStartsOn: 1 }), 7),
      },
      { end: today, label: 'Letzte 7 Tage', start: subDays(today, 6) },
      {
        end: endOfMonth(today),
        label: 'Dieser Monat',
        start: startOfMonth(today),
      },
      {
        end: endOfMonth(subDays(today, today.getDate())),
        label: 'Letzter Monat',
        start: startOfMonth(subDays(today, today.getDate())),
      },
      {
        end: endOfYear(today),
        label: 'Dieses Jahr',
        start: startOfYear(today),
      },
      {
        end: endOfYear(subDays(today, 365)),
        label: 'Letztes Jahr',
        start: startOfYear(subDays(today, 365)),
      },
    ];

    const handleMouseOver = (part: string) => {
      setHighlightedPart(part);
    };

    const handleMouseLeave = () => {
      setHighlightedPart(null);
    };

    const getWheelIncrement = (deltaY: number) => (deltaY > 0 ? -1 : 1);

    const selectSingleDate = (newDate: Date) => {
      onDateSelect({ from: newDate, to: newDate });
      setMonthFrom(newDate);
    };

    const handleFirstDayWheel = (increment: number) => {
      const fromDate = date.from;
      const toDate = date.to;

      if (!(fromDate && toDate)) {
        return;
      }

      const newDate = new Date(fromDate);
      newDate.setDate(newDate.getDate() + increment);

      if (newDate <= toDate) {
        if (numberOfMonths === 2) {
          onDateSelect({ from: newDate, to: new Date(toDate) });
        } else {
          selectSingleDate(newDate);
        }
        setMonthFrom(newDate);
        return;
      }

      if (numberOfMonths === 1) {
        selectSingleDate(newDate);
      }
    };

    const handleSecondDayWheel = (increment: number) => {
      const fromDate = date.from;
      const toDate = date.to;

      if (!(fromDate && toDate)) {
        return;
      }

      const newDate = new Date(toDate);
      newDate.setDate(newDate.getDate() + increment);

      if (newDate >= fromDate) {
        onDateSelect({ from: new Date(fromDate), to: newDate });
        setMonthTo(newDate);
      }
    };

    const handleMonthWheel = (increment: number, part: 'from' | 'to') => {
      const currentMonth =
        part === 'from'
          ? (monthFrom?.getMonth() ?? 0)
          : (monthTo?.getMonth() ?? 0);
      handleMonthChange(currentMonth + increment, part);
    };

    const handleYearWheel = (increment: number, part: 'from' | 'to') => {
      if (part === 'from') {
        if (yearFrom === undefined) {
          return;
        }
        handleYearChange(yearFrom + increment, 'from');
        return;
      }

      if (yearTo === undefined) {
        return;
      }
      handleYearChange(yearTo + increment, 'to');
    };

    const handleWheel = (event: React.WheelEvent) => {
      event.preventDefault();
      setSelectedRange(null);

      if (!highlightedPart) {
        return;
      }

      const increment = getWheelIncrement(event.deltaY);

      const wheelActions: Record<string, (value: number) => void> = {
        firstDay: handleFirstDayWheel,
        firstMonth: (value) => handleMonthWheel(value, 'from'),
        firstYear: (value) => handleYearWheel(value, 'from'),
        secondDay: handleSecondDayWheel,
        secondMonth: (value) => handleMonthWheel(value, 'to'),
        secondYear: (value) => handleYearWheel(value, 'to'),
      };

      const action = wheelActions[highlightedPart];
      if (action) {
        action(increment);
      }
    };

    // biome-ignore lint/correctness/useExhaustiveDependencies: handleWheel changes on evert re-render
    useEffect(() => {
      const firstDayElement = document.getElementById(`firstDay-${id}`);
      const firstMonthElement = document.getElementById(`firstMonth-${id}`);
      const firstYearElement = document.getElementById(`firstYear-${id}`);
      const secondDayElement = document.getElementById(`secondDay-${id}`);
      const secondMonthElement = document.getElementById(`secondMonth-${id}`);
      const secondYearElement = document.getElementById(`secondYear-${id}`);

      const elements = [
        firstDayElement,
        firstMonthElement,
        firstYearElement,
        secondDayElement,
        secondMonthElement,
        secondYearElement,
      ];

      const addPassiveEventListener = (element: HTMLElement | null) => {
        if (element) {
          element.addEventListener(
            'wheel',
            handleWheel as unknown as EventListener,
            {
              passive: false,
            }
          );
        }
      };

      elements.forEach(addPassiveEventListener);

      return () => {
        elements.forEach((element) => {
          if (element) {
            element.removeEventListener(
              'wheel',
              handleWheel as unknown as EventListener
            );
          }
        });
      };
    }, [id]);

    const formatWithTz = (date: Date, fmt: string) =>
      formatInTimeZone(date, timeZone, fmt);

    return (
      <Popover
        modal={true}
        onOpenChange={setIsPopoverOpen}
        open={isPopoverOpen}
      >
        <PopoverTrigger asChild disabled={disabled}>
          <Button
            id='date'
            ref={ref}
            {...props}
            className={cn(
              'w-auto',
              multiSelectVariants({ className, variant })
            )}
            onClick={handleTogglePopover}
          >
            <CalendarIcon className='mr-2 h-4 w-4' />
            <span>
              {date?.from ? (
                date.to ? (
                  <>
                    <span
                      className={cn(
                        'date-part',
                        highlightedPart === 'firstDay' && 'font-bold underline'
                      )}
                      id={`firstDay-${id}`}
                      onMouseLeave={handleMouseLeave}
                      onMouseOver={() => handleMouseOver('firstDay')}
                    >
                      {formatWithTz(date.from, 'dd')}
                    </span>{' '}
                    <span
                      className={cn(
                        'date-part',
                        highlightedPart === 'firstMonth' &&
                          'font-bold underline'
                      )}
                      id={`firstMonth-${id}`}
                      onMouseLeave={handleMouseLeave}
                      onMouseOver={() => handleMouseOver('firstMonth')}
                    >
                      {formatWithTz(date.from, 'LLL')}
                    </span>
                    ,{' '}
                    <span
                      className={cn(
                        'date-part',
                        highlightedPart === 'firstYear' && 'font-bold underline'
                      )}
                      id={`firstYear-${id}`}
                      onMouseLeave={handleMouseLeave}
                      onMouseOver={() => handleMouseOver('firstYear')}
                    >
                      {formatWithTz(date.from, 'y')}
                    </span>
                    {numberOfMonths === 2 && (
                      <>
                        {' - '}
                        <span
                          className={cn(
                            'date-part',
                            highlightedPart === 'secondDay' &&
                              'font-bold underline'
                          )}
                          id={`secondDay-${id}`}
                          onMouseLeave={handleMouseLeave}
                          onMouseOver={() => handleMouseOver('secondDay')}
                        >
                          {formatWithTz(date.to, 'dd')}
                        </span>{' '}
                        <span
                          className={cn(
                            'date-part',
                            highlightedPart === 'secondMonth' &&
                              'font-bold underline'
                          )}
                          id={`secondMonth-${id}`}
                          onMouseLeave={handleMouseLeave}
                          onMouseOver={() => handleMouseOver('secondMonth')}
                        >
                          {formatWithTz(date.to, 'LLL')}
                        </span>
                        ,{' '}
                        <span
                          className={cn(
                            'date-part',
                            highlightedPart === 'secondYear' &&
                              'font-bold underline'
                          )}
                          id={`secondYear-${id}`}
                          onMouseLeave={handleMouseLeave}
                          onMouseOver={() => handleMouseOver('secondYear')}
                        >
                          {formatWithTz(date.to, 'y')}
                        </span>
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <span
                      className={cn(
                        'date-part',
                        highlightedPart === 'day' && 'font-bold underline'
                      )}
                      id='day'
                      onMouseLeave={handleMouseLeave}
                      onMouseOver={() => handleMouseOver('day')}
                    >
                      {formatWithTz(date.from, 'dd')}
                    </span>{' '}
                    <span
                      className={cn(
                        'date-part',
                        highlightedPart === 'month' && 'font-bold underline'
                      )}
                      id='month'
                      onMouseLeave={handleMouseLeave}
                      onMouseOver={() => handleMouseOver('month')}
                    >
                      {formatWithTz(date.from, 'LLL')}
                    </span>
                    ,{' '}
                    <span
                      className={cn(
                        'date-part',
                        highlightedPart === 'year' && 'font-bold underline'
                      )}
                      id='year'
                      onMouseLeave={handleMouseLeave}
                      onMouseOver={() => handleMouseOver('year')}
                    >
                      {formatWithTz(date.from, 'y')}
                    </span>
                  </>
                )
              ) : (
                <span>Datum auswählen</span>
              )}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align='center'
          avoidCollisions={true}
          className='w-auto'
          onEscapeKeyDown={handleClose}
          style={{
            maxHeight: 'var(--radix-popover-content-available-height)',
            overflowY: 'auto',
          }}
        >
          <div className='flex'>
            {numberOfMonths === 2 && (
              <div className='hidden flex-col gap-1 border-foreground/10 border-r pr-4 text-left md:flex'>
                {dateRanges.map(({ label, start, end }) => (
                  <Button
                    className={cn(
                      'justify-start hover:bg-primary/90 hover:text-background',
                      selectedRange === label &&
                        'bg-primary text-background hover:bg-primary/90 hover:text-background'
                    )}
                    key={label}
                    onClick={() => {
                      selectDateRange(start, end, label);
                      setMonthFrom(start);
                      setYearFrom(start.getFullYear());
                      setMonthTo(end);
                      setYearTo(end.getFullYear());
                    }}
                    size='sm'
                    variant='ghost'
                  >
                    {label}
                  </Button>
                ))}
              </div>
            )}
            <div className='flex flex-col'>
              <div className='flex items-center gap-4'>
                <div className='ml-3 flex gap-2'>
                  <Select
                    onValueChange={(value) => {
                      handleMonthChange(months.indexOf(value), 'from');
                      setSelectedRange(null);
                    }}
                    value={monthFrom ? months[monthFrom.getMonth()] : undefined}
                  >
                    <SelectTrigger className='hidden w-[122px] font-medium hover:bg-accent hover:text-accent-foreground focus:ring-0 focus:ring-offset-0 sm:flex'>
                      <SelectValue placeholder='Month' />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map((month, idx) => (
                        <SelectItem key={idx} value={month}>
                          {month}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    onValueChange={(value) => {
                      handleYearChange(Number(value), 'from');
                      setSelectedRange(null);
                    }}
                    value={yearFrom ? yearFrom.toString() : undefined}
                  >
                    <SelectTrigger className='hidden w-[122px] font-medium hover:bg-accent hover:text-accent-foreground focus:ring-0 focus:ring-offset-0 sm:flex'>
                      <SelectValue placeholder='Year' />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((year, idx) => (
                        <SelectItem key={idx} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {numberOfMonths === 2 && (
                  <div className='flex gap-2'>
                    <Select
                      onValueChange={(value) => {
                        handleMonthChange(months.indexOf(value), 'to');
                        setSelectedRange(null);
                      }}
                      value={monthTo ? months[monthTo.getMonth()] : undefined}
                    >
                      <SelectTrigger className='hidden w-[122px] font-medium hover:bg-accent hover:text-accent-foreground focus:ring-0 focus:ring-offset-0 sm:flex'>
                        <SelectValue placeholder='Month' />
                      </SelectTrigger>
                      <SelectContent>
                        {months.map((month, idx) => (
                          <SelectItem key={idx} value={month}>
                            {month}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      onValueChange={(value) => {
                        handleYearChange(Number(value), 'to');
                        setSelectedRange(null);
                      }}
                      value={yearTo ? yearTo.toString() : undefined}
                    >
                      <SelectTrigger className='hidden w-[122px] font-medium hover:bg-accent hover:text-accent-foreground focus:ring-0 focus:ring-offset-0 sm:flex'>
                        <SelectValue placeholder='Year' />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map((year, idx) => (
                          <SelectItem key={idx} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              <div className='flex'>
                <Calendar
                  className={className}
                  defaultMonth={monthFrom}
                  mode='range'
                  month={monthFrom}
                  numberOfMonths={numberOfMonths}
                  onMonthChange={setMonthFrom}
                  onSelect={handleDateSelect}
                  selected={date}
                  showOutsideDays={false}
                />
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    );
  }
);

CalendarDatePicker.displayName = 'CalendarDatePicker';
