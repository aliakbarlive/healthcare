import React, { useState, useRef } from 'react'
import dateStyles from './DateSelector.module.css'
import DatePicker, { ReactDatePickerProps } from 'react-datepicker'
import calendarIcon from './calendar_icon.svg'
import { classNames } from 'Utilities/etc'
import ReactDOM from 'react-dom'

interface Props extends Omit<ReactDatePickerProps, 'onChange' | 'value'> {
  value?: Date
  onChange: (date: Date | undefined) => void
}

const DateSelector: React.FC<Props> = ({ value: selected, minDate, maxDate, filterDate: dateFilter, onChange, ...props }) => {
  // fuck <form> shit man
  if (typeof selected === 'string') selected = new Date(selected)

  const [year, setYear] = useState(getYear(selected))
  const [month, setMonth] = useState(selected && selected?.getMonth() + 1) // Months are zero indexed so +1 for what is displayed in the input
  const [day, setDay] = useState(selected?.getDate())
  const refs = {
    year: useRef<HTMLInputElement>(null),
    month: useRef<HTMLInputElement>(null),
    day: useRef<HTMLInputElement>(null)
  }
  const picker = useRef<DatePicker>(null)
  const date = (year && month && day) ? new Date(2000 + year, month - 1, day, 0, 0, 0, 0) : undefined // Month is zero indexed so -1 for the date object

  return <div className={dateStyles.date}>
    {renderYear()}
    {renderSlash()}
    {renderMonth()}
    {renderSlash()}
    {renderDay()}
    {renderCalendar()}
  </div>

  function renderCalendar() {
    return <div className={dateStyles.calendar} key='calendar'>
      <img onClick={toggleCalendar} alt="calendar" className={dateStyles.calendarIcon} src={calendarIcon} data-popper-arrow />
      <div className={dateStyles.pickerHolder}>
        <DatePicker
          {...props}
          minDate={minDate}
          maxDate={maxDate}
          onChange={handleDateSelect}
          selected={date}
          ref={picker}
          filterDate={dateFilter}
          popperPlacement='right-start'
          openToDate={date}
          disabledKeyboardNavigation
        />
      </div>
    </div>
  }

  function toggleCalendar() {
    // eslint-disable-next-line no-unused-expressions
    (picker as any)?.current?.setOpen(true)
  }

  function handleDateSelect(rawInput: Date | [Date, Date] | null) {
    const input = rawInput ? new Date(rawInput as Date) : undefined
    ReactDOM.unstable_batchedUpdates(() => {
      setYear(input ? getYear(input) : undefined)
      setMonth(input ? (input.getMonth() + 1) : undefined)
      setDay(input?.getDate())
    })
    onChange(input)
  }

  function renderYear() {
    return <div className={dateStyles.year} key='year'>
      <div className={dateStyles.half}>
        <span className={dateStyles.yearPre}>20</span>
      </div>
      <div className={dateStyles.half}>
        {renderNumberField('year')}
      </div>
    </div>
  }

  function renderMonth() {
    return <div className={dateStyles.month} key='month'>
      {renderNumberField('month')}
    </div>
  }

  function renderDay() {
    return <div className={dateStyles.day} key='day'>
      {renderNumberField('day')}
    </div>
  }

  function renderSlash() {
    return <span className={dateStyles.slash}>/</span>
  }

  function renderNumberField(timeUnit: 'year' | 'month' | 'day') {
    return <>
      <input
        onFocus={onFocus}
        ref={refs[timeUnit]}
        maxLength={2}
        value={value()}
        onChange={onChangeField}
        className={classNames(dateStyles.dateInput, isValid() && dateStyles.validDate)} />
      <div className={dateStyles.baseline}></div>
      <span className={dateStyles.unitLabel}>{timeUnit.toUpperCase()}</span>
    </>

    function onFocus() {
      const ref = refs[timeUnit]?.current
      if (ref) ref.select()
    }

    function isValid() {
      if (!date) return false
      const isValid = minDate && maxDate
        ? date.valueOf() >= minDate.valueOf() && date.valueOf() <= maxDate.valueOf()
        : minDate
          ? date.valueOf() >= minDate.valueOf()
          : maxDate
            ? date.valueOf() <= maxDate.valueOf()
            : !!date
      return dateFilter ? isValid && dateFilter(date) : isValid
    }

    function value() {
      switch (timeUnit) {
      case 'year':
        return year
      case 'month':
        return month
      case 'day':
        return day
      }
    }

    function onChangeField(event: React.ChangeEvent<HTMLInputElement>) {
      const value = parseInt(event.currentTarget.value.replace(/[^0-9]/g, ''))
      if (Number.isNaN(value)) return
      let newDate: Date | undefined
      switch (timeUnit) {
      case 'year':
        newDate = month && day ? new Date(2000 + value, month, day, 0, 0, 0, 0) : undefined
        setYear(value)
        // eslint-disable-next-line no-unused-expressions
        if (value > 9) refs.month.current?.focus()
        break
      case 'month':
        newDate = year && day ? new Date(2000 + year, value - 1, day, 0, 0, 0, 0) : undefined
        setMonth(value)
        // eslint-disable-next-line no-unused-expressions
        if (value > 1) refs.day.current?.focus()
        break
      case 'day':
        newDate = year && month ? new Date(2000 + year, month, value, 0, 0, 0, 0) : undefined
        setDay(value)
      }
      onChange(newDate)
    }
  }
}

function getYear(date: Date | undefined) {
  if (date) {
    return parseInt(('' + date.getFullYear()).slice(2))
  }
}

export default DateSelector
