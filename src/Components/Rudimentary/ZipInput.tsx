import React from 'react'
import CandorInput from './CandorInput'
import { Controller } from 'react-hook-form'
import { zipNormalizer } from 'Utilities/etc'
import { ControllerProps } from 'react-hook-form/dist/types/props'

interface ZipInputProps extends Omit<ControllerProps<'input'>, 'ref' | 'as'> {
  candorFormStyles?: boolean
}

function ZipInput(zipInputProps: ZipInputProps) {
  return (
    <Controller
      {...zipInputProps}
      render={props => {
        const newProps = {
          ...props,
          ...zipInputProps,
          defaultValue: (zipInputProps.defaultValue as any),
          minLength: 5,
          maxLength: 5,
          onChange: (event: any) => props.onChange(zipNormalizer(event.currentTarget.value))
        }
        return zipInputProps.candorFormStyles
          ? <input {...newProps} />
          : <CandorInput {...newProps} />
      }}
    />
  )
}

export default ZipInput
