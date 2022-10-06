import React from 'react'
import AnubisModal, { Props as AnubisModalProps } from 'Components/Anubis/AnubisModal'
import styles from './AddQualifyingEventModal.module.scss'
import CandorInput from 'Components/Rudimentary/CandorInput'
import CandorSelect from 'Components/Rudimentary/Select'
import { CandorDatePicker } from './CandorForm'
import useToast from 'Utilities/Hooks/useToast'
import { useForm } from 'react-hook-form'
import * as api from 'Utilities/pharaoh'
import moment from 'moment'
import { $enum } from 'ts-enum-util'
import { useToggle } from 'react-use'
import { QualifyingEventType } from 'Utilities/pharaoh.types'

interface Props extends AnubisModalProps {
  name: string
  id: string
  callback: () => void
}

const qualifyingEventsOptions = $enum(QualifyingEventType).map((label, value) => {
  return { value, label }
})

const AddQualifyingEventModal: React.FC<Props> = ({ name, id, callback, ...props }) => {
  const { register, handleSubmit, watch, control } = useForm()
  const event = watch('event')
  const addToast = useToast()
  const [disabled, setDisabled] = useToggle(false)

  return <AnubisModal
    {...props}
    name={AddQualifyingEventModal.name}
    styles={{ display: 'inline-table', overflow: 'visible' }}
  >
    <h1>Enter Qualifying Event</h1>
    <h2>{name} | {moment().format('MM/DD/YYYY').toString()}</h2>
    <div className={styles.select}>Select from the following, or enter the type below:</div>
    <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
      <fieldset disabled={disabled}>
        <CandorSelect
          placeholder='Qualifying Event'
          control={control}
          options={qualifyingEventsOptions}
          backgroundColor='#fff'
          required
          name='event'
        />
        {event === QualifyingEventType.other &&
          <CandorInput
            ref={register}
            name='other'
            placeholder='Enter qualifying event not in list'
            required />
        }
        <CandorDatePicker
          className={styles.whiteBackground}
          placeholder='Event date'
          name='date'
          control={control}
          minDate={moment().subtract(1, 'year').toDate()}
          maxDate={moment().add(1, 'year').toDate()}
          required
        />
        <input type='submit' value='Submit'/>
      </fieldset>
    </form>
  </AnubisModal>

  async function onSubmit(data: any) {
    try {
      setDisabled(true)
      data.date = api.localMidnightToPharaohFormat(data.date)
      await api.v3.users(id).qle.POST(data)
      addToast('Qualifying event has been added.',
        { appearance: 'success', autoDismiss: true },
        callback
      )
    } catch (error) {
      addToast(error)
      setDisabled(false)
    }
  }
}

export default AddQualifyingEventModal
