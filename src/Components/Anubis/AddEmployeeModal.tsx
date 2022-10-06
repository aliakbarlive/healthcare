import React from 'react'
import styles from './AddEmployeeModal.module.scss'
import CountyPicker from 'Components/Rudimentary/Select/CountyPicker'
import CandorInput from 'Components/Rudimentary/CandorInput'
import { v4 as uuid } from 'uuid'
import { useToggle } from 'react-use'
import useToast from 'Utilities/Hooks/useToast'
import CandorSelect from 'Components/Rudimentary/Select'
import { CandorDatePicker } from './CandorForm'
import { localMidnightToPharaohFormat } from 'Utilities/pharaoh'
import ZipInput from 'Components/Rudimentary/ZipInput'
import * as api from 'Utilities/pharaoh'
import Modal, { ActionType, BrandColors, ModalProps } from 'Components/Modals/Modal'
import { useForm } from 'react-hook-form'

interface Props extends Omit<ModalProps, 'gaModalName' | 'header'> {
  groupID: string
  callback: (data: { id: string }) => void
  splitID: string | undefined
}

const genderOptions = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' }
]

const AddEmployeeModal: React.FC<Props> = ({ groupID, callback, splitID, ...props }) => {
  const { register, handleSubmit, watch, control } = useForm()
  const zip = watch('address.zip')
  const [disabled, setDisabled] = useToggle(false)
  const addToast = useToast()
  const formId = `${AddEmployeeModal.name} form`

  return <Modal
    {...props}
    gaModalName={AddEmployeeModal.name}
    className={styles.container}
    header='Add New Employee'
    footerButtons={[{
      actionType: ActionType.primary,
      color: BrandColors.green,
      value: 'Submit',
      inputType: 'submit',
      formId
    }]}
  >
    <form onSubmit={handleSubmit(onSubmit)} id={formId} className={styles.addEmpForm}>
      <fieldset disabled={disabled}>
        <CandorInput name='contact.name' ref={register} placeholder='Name' />
        <CandorInput name='contact.email' ref={register} placeholder='Email' required />
        <CandorDatePicker
          placeholder='Date of Birth'
          name='dob'
          control={control}
          maxDate={new Date()}
        />
        <CandorSelect
          placeholder='Sex'
          control={control}
          options={genderOptions}
          name='gender'
        />
        <CandorDatePicker
          className={styles.whiteBackground}
          placeholder='Hire Date'
          name='dates.hire'
          control={control}
          maxDate={new Date()}
        />
      </fieldset>
      <fieldset>
        <CandorInput name='address.street1' ref={register} placeholder='Address 1'/>
        <CandorInput name='address.street2' ref={register} placeholder='Address 2'/>
        <CandorInput name='address.city' ref={register} placeholder='City'/>
        <ZipInput name='address.zip' placeholder='ZIP Code' control={control} required />
        <CountyPicker name='address.county.id' control={control} zip={zip}/>
      </fieldset>
    </form>
  </Modal>

  async function onSubmit(data: any) {
    try {
      if (!data.address.county.id) throw new window.Error('Please select your county')
      setDisabled(true)
      data.id = uuid()
      data.dob = localMidnightToPharaohFormat(data.dob)
      data.dates.hire = localMidnightToPharaohFormat(data.dates.hire)

      // ignored but required 😕 (mxcl sucks)
      data.tier = 'individual'
      data.group = { id: data.id, name: 'a' }
      data.privilege = 'standard'
      data.status = 'notStarted'
      data.isWaived = false
      data.isMedicallyUnderwritten = false
      data.splitID = splitID

      await api.v3.groups(groupID).users().POST(data)

      callback(data)
    } catch (error) {
      addToast(error as Error)
    } finally {
      setDisabled(false)
    }
  }
}

export default AddEmployeeModal
