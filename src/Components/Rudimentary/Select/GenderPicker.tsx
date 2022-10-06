import React from 'react'
import { BaseSelect, SelectProps } from 'Components/Rudimentary/Select'
import { $enum } from 'ts-enum-util'
import { Gender } from 'Utilities/pharaoh.types'
import { Controller, useFormContext } from 'react-hook-form'
import { genderNormalizer } from 'Utilities/etc'

export const GenderPicker: React.FC<Omit<SelectProps, 'options'>> = props => {
  const control = useFormContext()?.control || props.control
  const options = $enum(Gender).map(value => ({
    value,
    label: value === Gender.male ? 'Male' : 'Female'
  }))
  return <Controller
    {...props}
    name={props.name}
    control={control}
    render={fwdprops =>
      <BaseSelect
        {...props}
        {...fwdprops}
        options={options}
        value={genderNormalizer(fwdprops.value)}
        placeholder={props.placeholder || 'Biological Sex'}
      />
    }
  />
}
