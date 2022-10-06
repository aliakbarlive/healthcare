import React from 'react'
import CandorInput from './CandorInput'
import { Controller } from 'react-hook-form'
import { phoneNormalizer } from 'Utilities/etc'
import { ControllerProps } from 'react-hook-form/dist/types/props'

interface PhoneInputProps extends Omit<ControllerProps<'input'>, 'ref' | 'as'> {
  candorFormStyles?: boolean
  noValidate?: boolean
}

function PhoneInput(phoneInputProps: PhoneInputProps) {
  return (
    <Controller
      {...phoneInputProps}
      render={props => {
        const newProps = {
          ...props,
          minLength: 14,
          maxLength: 14,
          onChange: (event: any) => {
            if (event.currentTarget) {
              /*  manually validating against the phone number regex pattern since using the setCustomValidity with an error message argument makes the field as invalid.
              In my implementation, I revert this by setting it to an empty string hence marking it as valid if it passes the validation test */
              if (!phoneInputProps.noValidate) {
                if (RegExp(/\(\d{3}\) \d{3}-\d{4}/).test(event.currentTarget.value)) event.currentTarget.setCustomValidity('')
                else event.currentTarget.setCustomValidity('Please enter a valid phone number')
              }
              props.onChange(phoneNormalizer(event.currentTarget.value))
            }
          },
          className: phoneInputProps.className,
          placeholder: phoneInputProps.placeholder,
          autoComplete: phoneInputProps.autoComplete,
          required: phoneInputProps.required
        }
        return phoneInputProps.candorFormStyles
          ? <input {...newProps} />
          : <CandorInput {...newProps} />
      }}
    />
  )
}

export default PhoneInput
