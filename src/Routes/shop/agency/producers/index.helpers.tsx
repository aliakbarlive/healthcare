import CandorSelect, { SelectProps } from 'Components/Rudimentary/Select'
import React from 'react'
import { useAsync } from 'react-use'
import * as api from 'Utilities/pharaoh'
import { useFormContext } from 'react-hook-form'
export interface ProducerType {
  firstName: string
  lastName: string
  email: string
  npn?: string
  licenses?: StateLicense[]
  id: string
}

export interface StateLicense {
  state?: string
  license: string
  id: string
  carriers?: Carrier[]
}

export interface FormData {
  producers: ProducerType[]
}

export type majorCarrier = {
  name: string
  trimmedName: string
  agentNumber: string
}
interface Carrier {
  agentCode: string
  carrier: string
  id: string
}

const CarrierPicker: React.FC<Omit<SelectProps, 'options'>> = ({ ...props }) => {
  const control = useFormContext().control
  const carriers = useAsync(async() => await api.v1.carriers()).value?.map((carrier: string) => ({ value: carrier, label: carrier }))

  return <CandorSelect
    {...props}
    placeholder='Carriers'
    options={carriers}
    isSearchable
    isMulti
    onChange={props.onChange}
    className={props.className}
    name={props.name}
    control={control}
  >
  </CandorSelect>
}

CarrierPicker.displayName = 'CarrierPicker'
