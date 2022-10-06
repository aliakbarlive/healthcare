/* eslint-disable camelcase */
import React from 'react'
import api from 'Utilities/Deprecated/api.js'
import { useAsync } from 'react-use'
import { sortBy } from 'lodash'
import { BaseSelect, SelectProps } from 'Components/Rudimentary/Select'
import { Controller } from 'react-hook-form'

interface Industry {
  title: string
  sic_code: string
}

const IndustryPicker: React.FC<SelectProps> = props => {
  const async = useAsync(async() => {
    const rsp = await api.getIndustriesFor('jewelershealthcare.com') as Industry[]
    return sortBy(
      rsp
        .filter((i: Industry) => +i.sic_code % 10 !== 0)
        .map(({ title, sic_code }) => ({
          label: `${title.trim()} (SIC: ${sic_code})`,
          value: sic_code
        })),
      'value')
  })

  return <Controller
    {...props}
    render={fwdprops => {
      function options(): { label: string, value: string }[] {
        if (async.loading) {
          return []
        } else if (async.error) {
          return [{ label: 'Error', value: props.value || '' }]
        } else {
          return async.value!
        }
      }

      return <BaseSelect
        {...props}
        {...fwdprops}
        placeholder="Industry"
        options={options()}
      />
    }}
  />
}

export default IndustryPicker
