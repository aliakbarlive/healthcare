import React, { useState, useEffect } from 'react'
import ProfileSection from 'Components/Anubis/ProfileSection'
import { useToggle, useAsyncRetry, useAsync } from 'react-use'
import { AsyncTable } from 'Components/Rudimentary/Table'
import * as api from 'Utilities/pharaoh'
import { Appointment } from 'Utilities/pharaoh.types'
import { startCase } from 'lodash'
import { useForm } from 'react-hook-form'
import styles from './AppointmentsSection.module.scss'
import notesStyles from 'Components/Anubis/NotesSection.module.css'
import CandorInput from 'Components/Rudimentary/CandorInput'
import useToast from 'Utilities/Hooks/useToast'
import CandorSelect from 'Components/Rudimentary/Select'

let carriers: { value: string, label: string }[] = []
let states: { value: string, label: string }[] = []

const AppointmentsSection: React.FC<{ producerId: string }> = ({ producerId }) => {
  const [appointment, setAppointment] = useState<Appointment | undefined | null>(undefined)
  carriers = useAsync(async() => await api.v1.carriers()).value?.map((carrier: string) => ({ value: carrier, label: carrier }))
  states = useAsync(async() => await api.v1.states()).value?.map((state: string) => ({ value: state, label: state }))

  return <ProfileSection
    name="Appointments"
    addButtonName="Add New Appointment"
    expanded={false}
    onAddButton={() => setAppointment(null)}
  >
    <TableForm producerId={producerId} appointment={appointment} setAppointment={setAppointment} />
  </ProfileSection>
}

const TableForm: React.FC<{
  producerId: string
  appointment: Appointment | undefined | null
  setAppointment: (app: Appointment | undefined | null) => void
}> = ({ producerId, appointment, setAppointment }) => {
  const async = useAsyncRetry<Appointment[]>(api.v3.brokers.producers(producerId).appointments().GET)

  return <>
    <AsyncTable
      async={async}
      order={['state', 'carrier', 'agentNumber']}
      heading={key => {
        switch (key) {
        case 'agentNumber':
          return 'Agent Writing #'
        default:
          return startCase(key)
        }
      }}
      defaultSort='carrier'
      selectAction={setAppointment}
      selectable={() => true}
    />
    {appointment !== undefined && <Form producerId={producerId} updateTable={async.retry} setAppointment={setAppointment} appointment={appointment} />}
  </>
}

const Form: React.FC<{
  producerId: string
  updateTable: () => void
  setAppointment: (app: Appointment | undefined | null) => void
  appointment: Appointment | undefined | null
}> = ({ producerId, updateTable, setAppointment, appointment }) => {
  const { handleSubmit, register, control, reset } = useForm<Appointment>()
  const [disabled, setDisabled] = useToggle(false)
  const addToast = useToast()

  useEffect(() => {
    reset(appointment || { state: '', carrier: '' }) // FIXME state/carrier won't reset unless we explicitly set them to ''
  }, [reset, appointment])

  return <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
    <fieldset disabled={disabled}>
      <div>
        <span>* Required</span>
        <div>
          <CandorSelect options={states} placeholder='State *' name='state' control={control} backgroundColor='white' required />
          <CandorSelect options={carriers} placeholder='Carrier Name *' name='carrier' control={control} backgroundColor='white' required />
          <CandorInput ref={register} placeholder='Agent Writing Number *' type='text' name='agentNumber' required />
        </div>
        <span>Optional: Providing login information enables our team to better service groups enrolled with each carrier.</span>
        <div>
          <CandorInput ref={register} placeholder='User Name' type='text' name='userName' />
          <CandorInput ref={register} placeholder='Password' type='password' name='password' />
          <CandorInput ref={register} placeholder='URL' type='text' name='loginUrl' />
        </div>
      </div>
      <div className={styles.buttonContainer}>
        <input className={notesStyles.submit} value='Save Appointment' type='submit' />
        { appointment &&
          <input className={notesStyles.delete} onClick={onDelete} value='Delete Appointment' type='button' />
        }
      </div>
    </fieldset>
  </form>

  async function onSubmit(data: any) {
    setDisabled(true)
    // Sanitize empty values
    Object.keys(data).forEach(k => (!data[k] && delete data[k]))
    try {
      if (!data.state) throw new Error('Please select a state.')
      if (!data.carrier) throw new Error('Please select a carrier.')

      if (appointment?.id) {
        await api.v3.brokers.producers(producerId).appointments(appointment?.id).PUT(data)
      } else {
        await api.v3.brokers.producers(producerId).appointments().POST(data)
      }

      addToast('Appointment Saved Successfully', { appearance: 'info', autoDismiss: true })
      updateTable()
      setAppointment(undefined)
    } catch (error) {
      addToast(error)
    } finally {
      setDisabled(false)
    }
  }

  async function onDelete() {
    try {
      if (!appointment?.id) throw new Error('Appointment ID not found.')
      await api.v3.brokers.producers(producerId).appointments(appointment.id).DELETE()
      updateTable()
      setAppointment(undefined)
    } catch (error) {
      addToast(error)
    }
  }
}

export default AppointmentsSection
