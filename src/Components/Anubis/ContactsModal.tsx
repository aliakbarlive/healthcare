import React, { useEffect, useState } from 'react'
import AnubisModal from './AnubisModal'
import styles from './ContactsModal.module.scss'
import { Contact, Note } from 'Utilities/pharaoh.types'
import { useAsyncRetry, useToggle } from 'react-use'
import { v3 } from 'Utilities/pharaoh'
import Loader from 'Components/Rudimentary/Loader'
import Error from 'Components/Primitives/Error'
import { NotesTable } from './NotesSection'
import { GAButton } from 'Components/Tracking'

interface Props {
  isOpen: boolean
  onRequestClose: (contact?: Contact) => void
  groupID: string
  currentContact?: Contact
  showNotesForCurrentContact: boolean
}

const ContactsModal: React.FC<Props> = ({ isOpen, onRequestClose, groupID, currentContact, showNotesForCurrentContact }) => {
  const async = useAsyncRetry<Contact[]>(() => v3.groups(groupID).contacts.GET())

  // eslint-disable-next-line
  useEffect(() => { if (isOpen === true) { async.retry() } }, [isOpen])

  return <AnubisModal
    name={ContactsModal.name}
    isOpen={isOpen}
    onRequestClose={() => onRequestClose()}
    showClose={true}
    styles={{ width: '800px', maxHeight: '70vh', overflow: 'scroll' }}
  >
    <h1>{ async.value && async.value.length > 1 ? 'Client Contacts' : 'Client Contact' }</h1>
    { async.loading
      ? <Loader/>
      : async.error
        ? <Error error={async.error}/>
        : async.value?.map((contact, index) => {
          const isCurrentContact = contact.id === currentContact?.id
          return <ContactCell contact={contact} onClick={() => onRequestClose(contact)} key={index} isCurrentContact={isCurrentContact} showNotesDefault={isCurrentContact && showNotesForCurrentContact}/>
        })
    }
  </AnubisModal>
}

interface CCProps {
  contact: Contact
  onClick(): void
  isCurrentContact: boolean
  showNotesDefault: boolean
}
const ContactCell: React.FC<CCProps> = ({ contact, onClick, isCurrentContact, showNotesDefault }) => {
  const initials = contact.name?.split(' ').map(i => i.charAt(0)).slice(0, 3).join('')
  const [showNotes, toggleShowNotes] = useToggle(showNotesDefault)
  const [formNote, setFormNote] = useState<Note | boolean>(false)

  return <div className={styles.contactContainer}>
    <div className={styles.contact}>
      <div>{initials}</div>
      <span>{contact.name}</span>
      <button onClick={toggleShowNotes}>{showNotes ? 'Hide Notes' : 'Notes' }</button>
      <button onClick={onClick} disabled={isCurrentContact}>Select</button>
    </div>
    { contact.id && <div style={{ display: showNotes ? 'inherit' : 'none' }} className={styles.notes}>
      <NotesTable targetID={contact.id} formNote={formNote} setFormNote={setFormNote}/>
      { !formNote && <GAButton analytics={`Add Note (${ContactsModal.name})`} onClick={() => setFormNote(true)}>Add Note</GAButton> }
    </div> }
  </div>
}

export default ContactsModal
