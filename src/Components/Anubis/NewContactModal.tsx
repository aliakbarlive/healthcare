import React, { useState } from 'react'
import styles from './NewContactModal.module.scss'
import AnubisModal from './AnubisModal'
import CandorInput from 'Components/Rudimentary/CandorInput'
import useToast from 'Utilities/Hooks/useToast'
import { useForm } from 'react-hook-form'
import { v3 } from 'Utilities/pharaoh'
import { Contact } from 'Utilities/pharaoh.types'
import { v4 as uuidv4 } from 'uuid'
import PhoneInput from 'Components/Rudimentary/PhoneInput'

interface Props {
  isOpen: boolean
  onRequestClose: (contact?: Contact) => void
  groupID: string
}

const NewContactModal: React.FC<Props> = ({ isOpen, onRequestClose, groupID }) => {
  const { register, handleSubmit, control } = useForm()
  const addToast = useToast()
  const [disabled, setDisabled] = useState(false)

  return <AnubisModal
    name={NewContactModal.name}
    isOpen={isOpen}
    onRequestClose={() => onRequestClose()}
    showClose={true}
    styles={{ width: '600px', overflow: 'visible' }}
  >
    <h1>Add New Contact</h1>
    <fieldset disabled={disabled}>
      <form onSubmit={handleSubmit(submit)} className={styles.form}>
        <CandorInput placeholder='Contact Name' name='name' ref={register} required/>
        <CandorInput placeholder='Email' name='email' ref={register} type='email' />
        <PhoneInput placeholder='Phone' name='phone' control={control} />
        <input type='submit' value='Submit'/>
      </form>
    </fieldset>
  </AnubisModal>

  async function submit(data: any) {
    try {
      setDisabled(true)
      // Passing the ID is important here, or else we will create a another contact when creating a contact and then editing it immediately
      const contact = { id: uuidv4(), ...data }
      await v3.groups(groupID).contacts.POST(contact)
      addToast(`${data.name} successfully added`, 'success')
      onRequestClose(contact)
    } catch (error) {
      addToast(error)
      setDisabled(false)
    }
  }
}

export default NewContactModal
