import React, { useState } from 'react'
import AnubisModal from 'Components/Anubis/AnubisModal'
import { useForm } from 'react-hook-form'
import useToast from 'Utilities/Hooks/useToast'
import * as api from 'Utilities/pharaoh'
import { Venue } from 'Utilities/pharaoh.types'
import CandorInput from 'Components/Rudimentary/CandorInput'
import styles from './AddNewProducer.module.scss'

interface Props {
  isOpen: boolean
  onRequestClose: (shouldReload: boolean) => void
  agencyID: string
}

const AddProducerModal: React.FC<Props> = ({ agencyID, ...props }) => {
  const { register, handleSubmit } = useForm()
  const [disabled, setDisabled] = useState(false)
  const addToast = useToast()

  return <AnubisModal
    {...props}
    name={AddProducerModal.name}
    showClose={true}
    styles={{ width: 500 }}
    onRequestClose={() => props.onRequestClose(false)}
  >
    {form()}
  </AnubisModal>

  function form() {
    return <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
      <h1>Add New Producer</h1>
      <fieldset disabled={disabled}>
        <CandorInput
          name="name"
          ref={register}
          type="text"
          placeholder="Name"
          required={true}
        />
        <CandorInput
          name="email"
          ref={register}
          type="email"
          placeholder="Email"
          required={true}
        />
        <p>We will send an email to this address inviting the new producer to sign‑up</p>
        <input type="submit" value="Invite" />
      </fieldset>
    </form>
  }

  async function onSubmit(data: any) {
    try {
      setDisabled(true)
      await api.v3.tickets().POST({
        email: data.email as string,
        name: data.name as string,
        venue: Venue.agency,
        venueID: agencyID
      })
      props.onRequestClose(true)
    } catch (error) {
      addToast(error)
      setDisabled(false)
    }
  }
}

export default AddProducerModal
