import { useEffect, useCallback } from 'react'
import { useForm, UseFormOptions } from 'react-hook-form'
import _ from 'lodash'

export default function(key: string, options?: UseFormOptions) {
  // TODO optimize, reading the JSON every key press is a bit much
  // I tried using a memo but this is no good since that makes unpersist break
  // and fails to use defaultValues if you reopen a form (eg. modal) again and
  // again with different defaults. For some reason

  const defaultValues = options?.defaultValues
  const got = get()
  const defaults = got || defaultValues
  const stuff = useForm({ ...options, defaultValues: defaults })
  const dirty = stuff.formState.isDirty
  const values = stuff.watch()
  const keys = Object.keys(values)

  const isEqual = useCallback(compare => {
    const picked = _.pick(defaultValues, keys)
    return _.isEqual(compare, picked)
  }, [keys, defaultValues])

  const canReset = stuff.formState.isDirty || (got && defaultValues && !isEqual(got))

  useEffect(() => {
    return () => {
      if (dirty && !isEqual(got)) {
        localStorage.setItem(key, JSON.stringify(values))
      }
    }
  }, [key, dirty, values, got, isEqual])

  useEffect(() => {
    return () => {
      if (isEqual(values)) {
        localStorage.removeItem(key)
      }
    }
  }, [key, values, isEqual])

  return { ...stuff, unpersist, canReset, reset }

  function get() {
    const str = localStorage.getItem(key)
    if (str) {
      return JSON.parse(str)
    }
  }

  function reset() {
    stuff.reset(defaultValues)
  }

  function unpersist() {
    localStorage.removeItem(key)
    stuff.reset(defaultValues)
  }
}
