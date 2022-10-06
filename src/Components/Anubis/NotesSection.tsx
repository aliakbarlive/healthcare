import React, { useState } from 'react'
import ProfileSection from './ProfileSection'
import * as api from 'Utilities/pharaoh'
import { useAsyncRetry } from 'react-use'
import { AsyncTable, SortDirection } from 'Components/Rudimentary/Table'
import styles from './NotesSection.module.css'
import { useForm } from 'react-hook-form'
import useToast from 'Utilities/Hooks/useToast'
import { Note } from 'Utilities/pharaoh.types'

/* eslint-disable camelcase */

const NoteSection: React.FC<{targetID: string}> = ({ targetID }) => {
  const [formNote, setFormNote] = useState<Note | boolean>(false)

  return <ProfileSection
    name="Notes"
    addButtonName="Add New Note"
    expanded={false}
    onAddButton={() => setFormNote(true)}
  >
    <NotesTable targetID={targetID} formNote={formNote} setFormNote={setFormNote}/>
  </ProfileSection>
}

interface NTProps {
  targetID: string
  formNote: Note | boolean
  setFormNote(show: Note | boolean): void
}

export const NotesTable: React.FC<NTProps> = ({ targetID, formNote, setFormNote }) => {
  const async = useAsyncRetry<Note[]>(() => api.v2.notes.GET(targetID))

  return <>
    <AsyncTable
      async={async}
      order={['content', 'updated_at']}
      content={(key, value) =>
        key === 'updated_at' ? new Date(value) : value
      }
      width={key => {
        switch (key) {
        case 'updated_at':
          return '20%'
        }
      }}
      heading={key => {
        switch (key) {
        case 'content':
          return 'Note Name / Subject'
        case 'updated_at':
          return 'Date Stamp'
        }
      }}
      defaultSortDirection={key =>
        key === 'updated_at' ? SortDirection.descending : SortDirection.ascending
      }
      defaultSort='updated_at'
      selectAction={setFormNote}
      selectable={() => true}
    />
    <Form note={formNote} onClose={onFormClosed} targetID={targetID} />
  </>

  function onFormClosed(refresh: boolean) {
    setFormNote(false)
    if (refresh) async.retry()
  }
}

interface FormProps {
  note: Note | boolean
  onClose: (refresh: boolean) => void
  targetID: string
}

const Form: React.FC<FormProps> = ({ note, onClose, targetID }) => {
  const { register, handleSubmit } = useForm()
  const addToast = useToast()
  const [disabled, setDisabled] = useState(false)

  if (!note) return <></>

  function isNote(object: any): object is Note {
    if (typeof object === 'boolean') return false
    return 'content' in object
  }

  return <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
    <fieldset disabled={disabled}>
      <textarea
        placeholder="Note"
        className={styles.note}
        name="content"
        defaultValue={isNote(note) ? note.content : undefined}
        ref={register}
      />
      <div className={styles.formRow}>
        <input
          className={styles.submit}
          value='Save Note'
          type="submit"
        />
        {isNote(note) && <input
          className={styles.delete}
          onClick={onDelete}
          value='Delete Note'
          type="button"
        />}
      </div>
    </fieldset>
  </form>

  async function act(action: Promise<any>) {
    try {
      setDisabled(true)
      await action
      onClose(true)
    } catch (error) {
      addToast(error)
    } finally {
      setDisabled(false)
    }
  }

  async function onSubmit(data: any) {
    act(isNote(note)
      ? api.v2.notes.PUT(note.id, data.content)
      : api.v2.notes.POST(targetID, data.content))
  }

  async function onDelete() {
    if (!isNote(note)) return
    act(api.v2.notes.DELETE(note.id))
  }
}

export default NoteSection
