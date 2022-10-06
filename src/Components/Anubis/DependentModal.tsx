import React from 'react'
import AnubisModal, { Props as AnubisModalProps } from 'Components/Anubis/AnubisModal'
import CandorInput from 'Components/Rudimentary/CandorInput'
import { v4 as uuid } from 'uuid'
import { post, delete_ } from 'Utilities/fetch++'
import { useToggle } from 'react-use'
import useToast from 'Utilities/Hooks/useToast'
import { $enum } from 'ts-enum-util'
import _ from 'lodash'
import { Dependent, Relationship } from 'Utilities/pharaoh.types'
import { localMidnightToPharaohFormat } from 'Utilities/pharaoh'
import { CandorDatePicker } from './CandorForm'
import styles from './DependentModal.module.scss'
import CandorSelect from 'Components/Rudimentary/Select'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { ssnNormalizer } from 'Utilities/etc'
import { FormSection, FormInputWrapper } from 'Components/Rudimentary/FormComponents'
import { GenderPicker } from 'Components/Rudimentary/Select/GenderPicker'

interface Props extends AnubisModalProps {
  id: string
  onSuccess: (dependent: Dependent) => void
  onDelete: () => void
  dependent?: Dependent
  hasPartner?: boolean
}

const relationshipOptions = $enum(Relationship).map((key: string) => {
  return {
    value: key,
    label: key === Relationship.lifePartner
      ? 'Domestic Partner'
      : _.startCase(key)
  }
})

const DependentModal: React.FC<Props> = props => {
  const key = props.dependent?.id || props.id
  const form = useForm({ defaultValues: props.dependent || {} })
  const { register, handleSubmit, reset, control, getValues } = form
  const [disabled, setDisabled] = useToggle(false)
  const addToast = useToast()
  const requireCopy = (field: string, type: 'fill in' | 'select' = 'fill in') => `Please ${type} the dependent’s ${field}`

  return <AnubisModal
    {...props}
    name={DependentModal.name}
    styles={{ }}
  >
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        <h1>{key === props.dependent?.id ? 'Update' : 'Add'} Dependent</h1>
        <fieldset disabled={disabled}>
          <FormSection>
            <FormInputWrapper name='name'>
              <CandorInput name='name' ref={register({ required: requireCopy('Name') })} placeholder='Name' autoFocus />
            </FormInputWrapper>
            <FormInputWrapper name='gender'>
              <GenderPicker rules={{ required: requireCopy('Biological Sex', 'select') }} control={control} name='gender' backgroundColor='#fff' />
            </FormInputWrapper>
            <FormInputWrapper name='dob'>
              <CandorDatePicker
                name='dob'
                control={control}
                placeholder='Date of Birth'
                className={styles.white}
                maxDate={new Date()}
                rules={{ required: requireCopy('Date of Birth', 'select') }}
              />
            </FormInputWrapper>
            <FormInputWrapper name='relationship'>
              <CandorSelect
                rules={{ required: 'Please select your relation to the dependent' }}
                placeholder='Relationship'
                control={control}
                options={ (props.hasPartner && props.dependent?.relationship !== Relationship.spouse) ? relationshipOptions.filter(option => option.value === Relationship.child) : relationshipOptions }
                name='relationship'
                backgroundColor='#fff' />
            </FormInputWrapper>
            <FormInputWrapper name='ssn'>
              <Controller
                render={({ onChange, ...props }) => <CandorInput
                  onChange={event => onChange(ssnNormalizer(event.currentTarget.value))}
                  {...props}
                  minLength={11} maxLength={11}
                  pattern='[0-9-]{11}'
                  className='glance_masked'
                  placeholder='Social Security Number'
                />}
                control={control}
                name='ssn'
                rules={{
                  validate: () => {
                    const pattern = new RegExp(/\d{3}[-]\d{2}[-]\d{4}/)
                    const ssn = getValues('ssn')
                    if (!ssn || !pattern.test(ssn)) { return requireCopy('SSN matching ###-##-####') }
                  }
                }}
              />
            </FormInputWrapper>
            <input type='submit'/>
          </FormSection>

          <div className={styles.resetDelete}>
            <input type='button' onClick={() => reset(props.dependent || {})} value='Reset' />
            <input type='button' onClick={onDelete} value='Delete' style={{ display: props.dependent ? 'block' : 'none' }}/>
          </div>
        </fieldset>
      </form>
    </FormProvider>

  </AnubisModal>

  async function onSubmit(data: any) {
    try {
      setDisabled(true)
      data.id = props.dependent?.id || uuid()
      data.dob = localMidnightToPharaohFormat(data.dob)
      await post(`/v3/users/${props.id}/dependents`, data)
      props.onSuccess(data)
    } catch (error) {
      addToast(error as Error)
      setDisabled(false)
    }
  }

  async function onDelete() {
    try {
      setDisabled(true)
      await delete_(`/v3/users/${props.id}/dependents/${props.dependent!.id}`)
      props.onDelete()
    } catch (error) {
      addToast(error as Error)
      setDisabled(false)
    }
  }
}

export default DependentModal
