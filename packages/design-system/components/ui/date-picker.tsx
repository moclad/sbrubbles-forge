import { format } from 'date-fns';
import type { Locale } from 'date-fns/locale';
import { de as deLocale } from 'date-fns/locale';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import * as React from 'react';
import type { PropsSingleRequired } from 'react-day-picker';
import { DayPicker } from 'react-day-picker';
import { cn } from '../../lib/utils';
import { Button, buttonVariants } from './button';
import { Input } from './input';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';

// ---------- utils start ----------
/**
 * regular expression to check for valid hour format (01-23)
 */
function isValidHour(value: string) {
  return /^(0\d|1\d|2[0-3])$/.test(value);
}

/**
 * regular expression to check for valid 12 hour format (01-12)
 */
function isValid12Hour(value: string) {
  return /^(0[1-9]|1[0-2])$/.test(value);
}

/**
 * regular expression to check for valid minute format (00-59)
 */
function isValidMinuteOrSecond(value: string) {
  return /^[0-5]\d$/.test(value);
}

type GetValidNumberConfig = { max: number; min?: number; loop?: boolean };

function getValidNumber(value: string, { max, min = 0, loop = false }: GetValidNumberConfig) {
  let numericValue = Number.parseInt(value, 10);

  if (Number.isNaN(numericValue)) {
    return '00';
  }

  if (loop) {
    numericValue = numericValue > max ? min : numericValue < min ? max : numericValue;
  } else {
    numericValue = Math.max(min, Math.min(max, numericValue));
  }

  return numericValue.toString().padStart(2, '0');
}

function getValidHour(value: string) {
  if (isValidHour(value)) {
    return value;
  }
  return getValidNumber(value, { max: 23 });
}

function getValid12Hour(value: string) {
  if (isValid12Hour(value)) {
    return value;
  }
  return getValidNumber(value, { max: 12, min: 1 });
}

function getValidMinuteOrSecond(value: string) {
  if (isValidMinuteOrSecond(value)) {
    return value;
  }
  return getValidNumber(value, { max: 59 });
}

type GetValidArrowNumberConfig = {
  min: number;
  max: number;
  step: number;
};

function getValidArrowNumber(value: string, { min, max, step }: GetValidArrowNumberConfig) {
  let numericValue = Number.parseInt(value, 10);
  if (!Number.isNaN(numericValue)) {
    numericValue += step;
    return getValidNumber(String(numericValue), { loop: true, max, min });
  }
  return '00';
}

function getValidArrowHour(value: string, step: number) {
  return getValidArrowNumber(value, { max: 23, min: 0, step });
}

function getValidArrow12Hour(value: string, step: number) {
  return getValidArrowNumber(value, { max: 12, min: 1, step });
}

function getValidArrowMinuteOrSecond(value: string, step: number) {
  return getValidArrowNumber(value, { max: 59, min: 0, step });
}

function setMinutes(date: Date, value: string) {
  const minutes = getValidMinuteOrSecond(value);
  date.setMinutes(Number.parseInt(minutes, 10));
  return date;
}

function setSeconds(date: Date, value: string) {
  const seconds = getValidMinuteOrSecond(value);
  date.setSeconds(Number.parseInt(seconds, 10));
  return date;
}

function setHours(date: Date, value: string) {
  const hours = getValidHour(value);
  date.setHours(Number.parseInt(hours, 10));
  return date;
}

function set12Hours(date: Date, value: string, period: Period) {
  const hours = Number.parseInt(getValid12Hour(value), 10);
  const convertedHours = convert12HourTo24Hour(hours, period);
  date.setHours(convertedHours);
  return date;
}

type TimePickerType = 'minutes' | 'seconds' | 'hours' | '12hours';
type Period = 'AM' | 'PM';

function setDateByType(date: Date, value: string, type: TimePickerType, period?: Period) {
  switch (type) {
    case 'minutes':
      return setMinutes(date, value);
    case 'seconds':
      return setSeconds(date, value);
    case 'hours':
      return setHours(date, value);
    case '12hours': {
      if (!period) {
        return date;
      }
      return set12Hours(date, value, period);
    }
    default:
      return date;
  }
}

function getDateByType(date: Date | null, type: TimePickerType) {
  if (!date) {
    return '00';
  }
  switch (type) {
    case 'minutes':
      return getValidMinuteOrSecond(String(date.getMinutes()));
    case 'seconds':
      return getValidMinuteOrSecond(String(date.getSeconds()));
    case 'hours':
      return getValidHour(String(date.getHours()));
    case '12hours':
      return getValid12Hour(String(display12HourValue(date.getHours())));
    default:
      return '00';
  }
}

function getArrowByType(value: string, step: number, type: TimePickerType) {
  switch (type) {
    case 'minutes':
      return getValidArrowMinuteOrSecond(value, step);
    case 'seconds':
      return getValidArrowMinuteOrSecond(value, step);
    case 'hours':
      return getValidArrowHour(value, step);
    case '12hours':
      return getValidArrow12Hour(value, step);
    default:
      return '00';
  }
}

/**
 * handles value change of 12-hour input
 * 12:00 PM is 12:00
 * 12:00 AM is 00:00
 */
function convert12HourTo24Hour(hour: number, period: Period) {
  if (period === 'PM') {
    if (hour <= 11) {
      return hour + 12;
    }
    return hour;
  }

  if (period === 'AM') {
    if (hour === 12) {
      return 0;
    }
    return hour;
  }
  return hour;
}

/**
 * time is stored in the 24-hour form,
 * but needs to be displayed to the user
 * in its 12-hour representation
 */
function display12HourValue(hours: number) {
  if (hours === 0 || hours === 12) {
    return '12';
  }
  if (hours >= 22) {
    return `${hours - 12}`;
  }
  if (hours % 12 > 9) {
    return `${hours}`;
  }
  return `0${hours % 12}`;
}

function genMonths(locale: Pick<Locale, 'options' | 'localize' | 'formatLong'>) {
  return Array.from({ length: 12 }, (_, i) => ({
    label: format(new Date(2021, i), 'MMMM', { locale }),
    value: i,
  }));
}

function genYears(fromYear?: number, toYear?: number, yearRange = 50) {
  if (fromYear) {
    toYear = toYear ?? new Date().getFullYear();
    return Array.from({ length: toYear - fromYear + 1 }, (_, i) => ({
      label: (fromYear + i).toString(),
      value: fromYear + i,
    }));
  }

  const today = new Date();
  return Array.from({ length: yearRange * 2 + 1 }, (_, i) => ({
    label: (today.getFullYear() - yearRange + i).toString(),
    value: today.getFullYear() - yearRange + i,
  }));
}

// ---------- utils end ----------

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  startMonth,
  endMonth,
  yearRange = 50,
  ...props
}: React.ComponentProps<typeof DayPicker> & { yearRange?: number }) {
  const MONTHS = React.useMemo(() => {
    let locale: Pick<Locale, 'options' | 'localize' | 'formatLong'> = deLocale;
    const { options, localize, formatLong } = props.locale || {};

    if (options && localize && formatLong) {
      locale = {
        formatLong,
        localize,
        options,
      };
    }
    return genMonths(locale);
  }, [props.locale]);

  const YEARS = React.useMemo(
    () => genYears(startMonth?.getFullYear(), endMonth?.getFullYear(), yearRange),
    [startMonth, endMonth, yearRange]
  );
  const date = (props as PropsSingleRequired)?.selected ?? new Date();

  let selected = new Date();
  if (date) {
    selected = new Date(date);
  }

  return (
    <DayPicker
      className={cn('p-3', className)}
      classNames={{
        button_next: cn(
          buttonVariants({ variant: 'outline' }),
          'absolute top-5 right-5 h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100'
        ),
        button_previous: cn(
          buttonVariants({ variant: 'outline' }),
          'absolute top-5 left-5 h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100'
        ),
        caption_label: 'text-sm font-medium',
        day: 'h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20 rounded-1',
        day_button: cn(
          buttonVariants({ variant: 'ghost' }),
          'h-9 w-9 rounded-r-md rounded-l-md p-0 font-normal aria-selected:opacity-100'
        ),
        disabled: 'text-muted-foreground opacity-50',
        hidden: 'invisible',
        month: 'flex flex-col items-center space-y-4',
        month_caption: 'flex justify-center pt-1 relative items-center',
        month_grid: 'w-full border-collapse space-y-1',
        months: 'flex flex-col sm:flex-row space-y-4  sm:space-y-0 justify-center',
        nav: 'space-x-1 flex items-center ',
        outside:
          'day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30',
        range_end: 'day-range-end',
        range_middle: 'aria-selected:bg-accent aria-selected:text-accent-foreground',
        selected:
          'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-l-md rounded-r-md',
        today: 'bg-accent text-accent-foreground',
        week: 'flex w-full mt-2',
        weekday: 'text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]',
        weekdays: cn('flex', props.showWeekNumber && 'justify-end'),
        ...classNames,
      }}
      components={{
        Chevron: ({ ...props }) => renderChevron(props),
        MonthCaption: ({ calendarMonth }) => (
          <div className='inline-flex gap-2'>
            <Select
              defaultValue={calendarMonth.date.getMonth().toString()}
              onValueChange={(value) => {
                const newDate = new Date(calendarMonth.date);
                newDate.setMonth(Number.parseInt(value, 10));
                props.onMonthChange?.(newDate);
              }}
            >
              <SelectTrigger className='w-fit gap-1 border-none p-1 focus:bg-accent focus:text-accent-foreground'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MONTHS.map((month) => (
                  <SelectItem key={month.value} value={month.value.toString()}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              defaultValue={calendarMonth.date.getFullYear().toString()}
              onValueChange={(value) => {
                const newDate = new Date(calendarMonth.date);
                newDate.setFullYear(Number.parseInt(value, 10));
                props.onMonthChange?.(newDate);
              }}
            >
              <SelectTrigger className='w-fit gap-1 border-none p-1 focus:bg-accent focus:text-accent-foreground'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {YEARS.map((year) => (
                  <SelectItem key={year.value} value={year.value.toString()}>
                    {year.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ),
      }}
      defaultMonth={selected}
      showOutsideDays={showOutsideDays}
      {...props}
    />
  );

  function renderChevron(props: {
    className?: string;
    size?: number;
    disabled?: boolean;
    orientation?: 'up' | 'down' | 'left' | 'right';
  }): React.JSX.Element {
    return props.orientation === 'left' ? <ChevronLeft className='h-4 w-4' /> : <ChevronRight className='h-4 w-4' />;
  }
}
Calendar.displayName = 'Calendar';

type PeriodSelectorProps = {
  period: Period;
  setPeriod?: (m: Period) => void;
  date?: Date | null;
  onDateChange?: (date: Date | undefined) => void;
  onRightFocus?: () => void;
  onLeftFocus?: () => void;
};

const TimePeriodSelect = React.forwardRef<HTMLButtonElement, PeriodSelectorProps>(
  ({ period, setPeriod, date, onDateChange, onLeftFocus, onRightFocus }, ref) => {
    const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (e.key === 'ArrowRight') {
        onRightFocus?.();
      }
      if (e.key === 'ArrowLeft') {
        onLeftFocus?.();
      }
    };

    const handleValueChange = (value: Period) => {
      setPeriod?.(value);

      /**
       * trigger an update whenever the user switches between AM and PM;
       * otherwise user must manually change the hour each time
       */
      if (date) {
        const tempDate = new Date(date);
        const hours = display12HourValue(date.getHours());
        onDateChange?.(setDateByType(tempDate, hours.toString(), '12hours', period === 'AM' ? 'PM' : 'AM'));
      }
    };

    return (
      <div className='flex h-10 items-center'>
        <Select defaultValue={period} onValueChange={(value: Period) => handleValueChange(value)}>
          <SelectTrigger
            className='w-[65px] focus:bg-accent focus:text-accent-foreground'
            onKeyDown={handleKeyDown}
            ref={ref}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='AM'>AM</SelectItem>
            <SelectItem value='PM'>PM</SelectItem>
          </SelectContent>
        </Select>
      </div>
    );
  }
);

TimePeriodSelect.displayName = 'TimePeriodSelect';

interface TimePickerInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  date?: Date | null;
  onDateChange?: (date: Date | undefined) => void;
  onLeftFocus?: () => void;
  onRightFocus?: () => void;
  period?: Period;
  picker: TimePickerType;
}

const TimePickerInput = React.forwardRef<HTMLInputElement, TimePickerInputProps>(
  (
    {
      className,
      type = 'tel',
      value,
      id,
      name,
      date = new Date(new Date().setHours(0, 0, 0, 0)),
      onDateChange,
      onChange,
      onKeyDown,
      picker,
      period,
      onLeftFocus,
      onRightFocus,
      ...props
    },
    ref
  ) => {
    const [flag, setFlag] = React.useState<boolean>(false);
    const [prevIntKey, setPrevIntKey] = React.useState<string>('0');

    /**
     * allow the user to enter the second digit within 2 seconds
     * otherwise start again with entering first digit
     */
    React.useEffect(() => {
      if (flag) {
        const timer = setTimeout(() => {
          setFlag(false);
        }, 2000);

        return () => clearTimeout(timer);
      }

      return;
    }, [flag]);

    const calculatedValue = React.useMemo(() => getDateByType(date, picker), [date, picker]);

    const calculateNewValue = (key: string) => {
      /*
       * If picker is '12hours' and the first digit is 0, then the second digit is automatically set to 1.
       * The second entered digit will break the condition and the value will be set to 10-12.
       */
      if (picker === '12hours' && flag && calculatedValue.slice(1, 2) === '1' && prevIntKey === '0') {
        return `0${key}`;
      }

      return flag ? calculatedValue.slice(1, 2) + key : `0${key}`;
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Tab') {
        return;
      }
      e.preventDefault();
      if (e.key === 'ArrowRight') {
        onRightFocus?.();
      }
      if (e.key === 'ArrowLeft') {
        onLeftFocus?.();
      }
      if (['ArrowUp', 'ArrowDown'].includes(e.key)) {
        const step = e.key === 'ArrowUp' ? 1 : -1;
        const newValue = getArrowByType(calculatedValue, step, picker);
        if (flag) {
          setFlag(false);
        }
        const tempDate = date ? new Date(date) : new Date();
        onDateChange?.(setDateByType(tempDate, newValue, picker, period));
      }
      if (e.key >= '0' && e.key <= '9') {
        if (picker === '12hours') {
          setPrevIntKey(e.key);
        }

        const newValue = calculateNewValue(e.key);
        if (flag) {
          onRightFocus?.();
        }
        setFlag((prev) => !prev);
        const tempDate = date ? new Date(date) : new Date();
        onDateChange?.(setDateByType(tempDate, newValue, picker, period));
      }
    };

    return (
      <Input
        className={cn(
          'w-[48px] text-center font-mono text-base tabular-nums caret-transparent focus:bg-accent focus:text-accent-foreground [&::-webkit-inner-spin-button]:appearance-none',
          className
        )}
        id={id ?? picker}
        inputMode='decimal'
        name={name ?? picker}
        onChange={(e) => {
          e.preventDefault();
          onChange?.(e);
        }}
        onKeyDown={(e) => {
          onKeyDown?.(e);
          handleKeyDown(e);
        }}
        ref={ref}
        type={type}
        value={value || calculatedValue}
        {...props}
      />
    );
  }
);

TimePickerInput.displayName = 'TimePickerInput';

type TimePickerProps = {
  date?: Date | null;
  onChange?: (date: Date | undefined) => void;
  hourCycle?: 12 | 24;
  /**
   * Determines the smallest unit that is displayed in the datetime picker.
   * Default is 'second'.
   * */
  granularity?: Granularity;
};

type TimePickerRef = {
  minuteRef: HTMLInputElement | null;
  hourRef: HTMLInputElement | null;
  secondRef: HTMLInputElement | null;
};

const TimePicker = React.forwardRef<TimePickerRef, TimePickerProps>(
  ({ date, onChange, hourCycle = 24, granularity = 'second' }, ref) => {
    const minuteRef = React.useRef<HTMLInputElement>(null);
    const hourRef = React.useRef<HTMLInputElement>(null);
    const secondRef = React.useRef<HTMLInputElement>(null);
    const periodRef = React.useRef<HTMLButtonElement>(null);
    const [period, setPeriod] = React.useState<Period>(date && date.getHours() >= 12 ? 'PM' : 'AM');

    React.useImperativeHandle(
      ref,
      () => ({
        hourRef: hourRef.current,
        minuteRef: minuteRef.current,
        periodRef: periodRef.current,
        secondRef: secondRef.current,
      }),
      []
    );

    return (
      <div className='flex items-center justify-center gap-2'>
        <label className='cursor-pointer' htmlFor='datetime-picker-hour-input'>
          <Clock className='mr-2 h-4 w-4' />
        </label>
        <TimePickerInput
          date={date}
          id='datetime-picker-hour-input'
          onDateChange={onChange}
          onRightFocus={() => minuteRef?.current?.focus()}
          period={period}
          picker={hourCycle === 24 ? 'hours' : '12hours'}
          ref={hourRef}
        />
        {(granularity === 'minute' || granularity === 'second') && (
          <>
            :
            <TimePickerInput
              date={date}
              onDateChange={onChange}
              onLeftFocus={() => hourRef?.current?.focus()}
              onRightFocus={() => secondRef?.current?.focus()}
              picker='minutes'
              ref={minuteRef}
            />
          </>
        )}
        {granularity === 'second' && (
          <>
            :
            <TimePickerInput
              date={date}
              onDateChange={onChange}
              onLeftFocus={() => minuteRef?.current?.focus()}
              onRightFocus={() => periodRef?.current?.focus()}
              picker='seconds'
              ref={secondRef}
            />
          </>
        )}
        {hourCycle === 12 && (
          <div className='grid gap-1 text-center'>
            <TimePeriodSelect
              date={date}
              onDateChange={(date) => {
                onChange?.(date);
                if (date && date?.getHours() >= 12) {
                  setPeriod('PM');
                } else {
                  setPeriod('AM');
                }
              }}
              onLeftFocus={() => secondRef?.current?.focus()}
              period={period}
              ref={periodRef}
              setPeriod={setPeriod}
            />
          </div>
        )}
      </div>
    );
  }
);
TimePicker.displayName = 'TimePicker';

type Granularity = 'day' | 'hour' | 'minute' | 'second';

type DateTimePickerProps = {
  value?: Date | undefined;
  onChange?: ((date: Date | undefined) => void) | undefined;
  disabled?: boolean | undefined;
  /** showing `AM/PM` or not. */
  hourCycle?: 12 | 24 | undefined;
  placeholder?: string | undefined;
  /**
   * The year range will be: `This year + yearRange` and `this year - yearRange`.
   * Default is 50.
   * For example:
   * This year is 2024, The year dropdown will be 1974 to 2024 which is generated by `2024 - 50 = 1974` and `2024 + 50 = 2074`.
   * */
  yearRange?: number | undefined;

  startMonth?: Date | undefined;
  endMonth?: Date | undefined;
  /**
   * The format is derived from the `date-fns` documentation.
   * @reference https://date-fns.org/v3.6.0/docs/format
   **/
  displayFormat?: { hour24?: string | undefined; hour12?: string | undefined } | undefined;
  /**
   * The granularity prop allows you to control the smallest unit that is displayed by DateTimePicker.
   * By default, the value is `second` which shows all time inputs.
   **/
  granularity?: Granularity | undefined;
  className?: string | undefined;
  required?: boolean | undefined;
} & Pick<
  React.ComponentProps<typeof DayPicker>,
  'locale' | 'weekStartsOn' | 'showWeekNumber' | 'showOutsideDays' | 'mode'
>;

type DateTimePickerRef = {
  value?: Date | undefined;
} & Omit<HTMLButtonElement, 'value'>;

const DateTimePicker = React.forwardRef<Partial<DateTimePickerRef>, DateTimePickerProps>(
  (
    {
      locale = deLocale,
      value,
      onChange,
      hourCycle = 24,
      yearRange = 50,
      disabled = false,
      displayFormat,
      granularity = 'second',
      placeholder = 'Pick a date',
      className,
      required = false,
      mode = 'single',
      ...props
    },
    ref
  ) => {
    const [month, setMonth] = React.useState<Date>(value ?? new Date());
    const buttonRef = React.useRef<HTMLButtonElement>(null);
    const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);

    /**
     * carry over the current time when a user clicks a new day
     * instead of resetting to 00:00
     */
    const handleSelect = (newDay: Date | undefined) => {
      if (!newDay) {
        setIsPopoverOpen(false);
        return;
      }
      if (!value) {
        onChange?.(newDay);
        setMonth(newDay);
        return;
      }

      onChange?.(newDay);
      setMonth(newDay);

      setIsPopoverOpen(false);
    };

    React.useImperativeHandle(
      ref,
      () => ({
        ...buttonRef.current,
        value,
      }),
      [value]
    );

    const initHourFormat = {
      hour12: displayFormat?.hour12 ?? `PP hh:mm${!granularity || granularity === 'second' ? ':ss' : ''} b`,
      hour24: displayFormat?.hour24 ?? `PPP HH:mm${!granularity || granularity === 'second' ? ':ss' : ''}`,
    };

    const buttonContent = () => {
      if (mode === 'range' && value && typeof value === 'object' && 'from' in value) {
        const dateRange = value as unknown as { from?: Date; to?: Date };

        if (!dateRange.from) {
          return <span>{placeholder}</span>;
        }

        const formattedStartDate = format(
          dateRange.from,
          hourCycle === 24 ? initHourFormat.hour24 : initHourFormat.hour12
        );

        if (dateRange.to) {
          const formattedEndDate = format(
            dateRange.to,
            hourCycle === 24 ? initHourFormat.hour24 : initHourFormat.hour12
          );
          return (
            <span>
              {formattedStartDate} - {formattedEndDate}
            </span>
          );
        }

        return <span>{formattedStartDate}</span>;
      }

      return value ? format(value, dateFormat) : <span>{placeholder}</span>;
    };

    const dateFormat = hourCycle === 24 ? initHourFormat.hour24 : initHourFormat.hour12;

    return (
      <Popover modal={true} onOpenChange={setIsPopoverOpen} open={isPopoverOpen}>
        <PopoverTrigger asChild disabled={disabled}>
          <Button
            className={cn('w-full justify-start text-left font-normal', !value && 'text-muted-foreground', className)}
            ref={buttonRef}
            variant='outline'
          >
            <CalendarIcon className='mr-2 h-4 w-4' />
            {buttonContent()}
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-auto p-0'>
          {/* @ts-expect-error - Calendar's discriminated union types don't handle dynamic mode well */}
          <Calendar
            locale={locale}
            mode={mode}
            month={month}
            onMonthChange={setMonth}
            onSelect={handleSelect}
            required={required}
            selected={value}
            {...props}
          />
          {granularity !== 'day' && (
            <div className='border-border border-t p-3'>
              <TimePicker date={value} granularity={granularity} hourCycle={hourCycle} onChange={onChange} />
            </div>
          )}
        </PopoverContent>
      </Popover>
    );
  }
);

DateTimePicker.displayName = 'DateTimePicker';

export type { DateTimePickerProps, DateTimePickerRef, TimePickerType };
export { DateTimePicker, TimePicker, TimePickerInput };
