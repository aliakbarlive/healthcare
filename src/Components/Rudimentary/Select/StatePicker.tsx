import React, { useEffect, useState } from 'react'
import { BaseSelect, SelectProps } from 'Components/Rudimentary/Select'
import api from 'Utilities/Deprecated/api'
import useToast from 'Utilities/Hooks/useToast'
import { uniq } from 'lodash'
import { usePrevious } from 'react-use'
import { useFormContext, Controller } from 'react-hook-form'

type Props = Omit<SelectProps, 'options'> & {
  zip?: string
}

/// Either pass control, useFormContext() or manage value/onChange yourself, if you do none of these it won’t work.
/// Pass `zipCode` or there won’t be *any* options.
const StatePicker: React.FC<Props> = ({ zip, value, ...props }) => {
  const control = useFormContext()?.control || props.control

  return <Controller
    render={fwdprops => {
      const [options, setOptions] = useState(states)
      const addToast = useToast()
      const prevZip = usePrevious(zip)

      useEffect(() => {
        if (prevZip === zip) return // because value probably change (via us even), but we don't want to fetch in a loop

        if (!zip || zip.length < 5) {
          setOptions(states)
        } else {
          fetch().catch(addToast)
        }

        async function fetch() {
          const activeZip = zip
          const rsp = await api.getStateOfZip(zip) as {stateId: string}[]
          if (zip !== activeZip) /* zip changed while we were fetching the data */ return
          if (rsp.length === 0) throw new Error('StatePicker Invalid ZIP Code')

          const states = uniq(rsp.map(({ stateId }) => stateId))
          setOptions(states)
          if (states.length === 1) {
            fwdprops.onChange(states[0])
          } else if (states.length === 0 || !states.includes(fwdprops.value || '')) {
            fwdprops.onChange(undefined)
          }
        }
      }, [zip, prevZip, addToast, value, control])

      return <BaseSelect
        {...props}
        {...fwdprops}
        placeholder="State"
        options={options.map(value => ({ value, label: value }))}
        isDisabled={props.isDisabled || options.length < 1}
      />
    }}
    name={props.name}
    control={control || props.control}
  />
}

StatePicker.displayName = 'StatePicker'

export const states = [
  'AL',
  'AK',
  'AZ',
  'AR',
  'CA',
  'CO',
  'CT',
  'DE',
  'DC',
  'FL',
  'GA',
  'HI',
  'ID',
  'IL',
  'IN',
  'IA',
  'KS',
  'KY',
  'LA',
  'ME',
  'MD',
  'MA',
  'MI',
  'MN',
  'MS',
  'MO',
  'MT',
  'NE',
  'NV',
  'NH',
  'NJ',
  'NM',
  'NY',
  'NC',
  'ND',
  'OH',
  'OK',
  'OR',
  'PA',
  'RI',
  'SC',
  'SD',
  'TN',
  'TX',
  'UT',
  'VT',
  'VA',
  'WA',
  'WV',
  'WI',
  'WY'
]

export default StatePicker
