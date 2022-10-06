import { flatten } from 'lodash'
import { Gender } from './pharaoh.types'
import effectiveDateFilter from './Plans/effectiveDateFilter()'
import numeral from 'numeral'

// NOTE prefer to `firstName`
export function firstNames(input: string | undefined): string | undefined {
  return input?.split(' ').slice(0, -1).join(' ')
}

export function firstName(input: string | undefined): string | undefined {
  return input?.split(' ')[0]
}

export function lastName(input: string | undefined): string | undefined {
  return input?.split(' ').pop()
}

export const classNames = (...objs: any) => flatten(objs).filter(Boolean).join(' ')

// Add comma to thousands place
export const thousandsComma = (x: number | string) => {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

export const ssnNormalizer = (value: string) => {
  if (!value) {
    return value
  } else {
    value = value.replace(/[^\d]/g, '')
  }
  return value.length > 3 ? value.length > 5 ? `${value.substring(0, 3)}-${value.substring(3, 5)}-${value.substring(5)}` : `${value.substring(0, 3)}-${value.substring(3)}` : value
}

export const phoneNormalizer = (value: string) => {
  if (!value) {
    return value
  }
  let numerals = value.replace(/[^\d]/g, '')

  // special cases for deletion
  if (value.length - numerals.length === 2) { numerals = numerals.slice(0, -1) }

  // decorating input in the National Format
  return numerals.length === 0 ? '' : numerals.length <= 3
    ? `(${numerals.substring(0, 3)}) `
    : (numerals.length <= 6
      ? `(${numerals.substring(0, 3)}) ${numerals.substring(3, 6)}`
      : `(${numerals.substring(0, 3)}) ${numerals.substring(3, 6)}-${numerals.substring(6)}`)
}

export const zipNormalizer = (value: string) => {
  if (!value) {
    return value
  } else {
    return value.replace(/[^\d]/g, '')
  }
}

const effectiveDateLeadTime = 10

function minEffectiveDate() {
  const date = new Date()
  date.setDate(date.getDate() + effectiveDateLeadTime)
  return date
}

export function defaultMinimumDate() {
  let date = minEffectiveDate()
  if (!effectiveDateFilter(date)) {
    const year = date.getFullYear()
    const month = date.getMonth()

    // disabled 15th as option for now
    // const day = date.getDate()
    // if (day > 15) {
    date = new Date(year, month + 1, 1)
    // } else {
    // date = new Date(year, month, 15)
    // }
  }
  return date
}

export function genderNormalizer(gender: string | undefined): Gender | undefined {
  switch (gender?.toLowerCase()) {
  case 'm':
  case 'male': return Gender.male
  case 'f':
  case 'female': return Gender.female
  default: return undefined
  }
}

export function stringsToSentence(...inputs: string[]) {
  return inputs.length === 1 ? inputs[0] : `${inputs.slice(0, inputs.length - 1).join(', ')} and ${inputs[inputs.length - 1]}`
}

export function maskMoneyInput(input: React.FormEvent<HTMLInputElement>) {
  input.currentTarget.value = markupValue(input.currentTarget.value).replace('-', '')
}

export function markupValue(value: string | undefined): string {
  if (!value) return '-'
  return numeral(value).format('$0')
}
