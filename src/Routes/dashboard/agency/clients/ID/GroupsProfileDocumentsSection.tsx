import React, { useState } from 'react'
import ProfileSection from 'Components/Anubis/ProfileSection'
import UploadModal from 'Components/Anubis/UploadModal'
import * as api from 'Utilities/pharaoh'
import styles from './GroupsProfileDocumentsSection.module.scss'
import { useAsyncRetry, useToggle } from 'react-use'
import { AsyncTable, Alignment, SortDirection } from 'Components/Rudimentary/Table'
import path from 'path'
import { useForm } from 'react-hook-form'
import useToast from 'Utilities/Hooks/useToast'
import { pharaoh } from 'Utilities/config'

/* eslint-disable camelcase */

interface Document {
  id: string
  note: string
  groupID: string
  ownerID: string
  fileName: string
  fileSize: number
  mimeType: string
  created_at: Date
  updated_at: Date
}

interface Props {
  id: string
}

const GroupsProfileDocumentsSection: React.FC<Props> = ({ id: groupID }) => {
  const [modaled, toggleModal] = useToggle(false)
  const [editing, setEditing] = useState<Document | null>(null)

  const async = useAsyncRetry<Document[]>(async() =>
    (await api.v2.brokers.groups(groupID).documents().GET())
      .map((item: any) => item.document), [groupID])

  return <>
    <UploadModal
      isOpen={modaled}
      onRequestClose={() => { toggleModal(); async.retry() }}
      groupID={groupID}
    />
    <ProfileSection
      name="Documents"
      addButtonName="Upload New Document"
      expanded={false}
      onAddButton={toggleModal}
    >
      <AsyncTable
        async={async}
        order={['fileName', 'note', 'updated_at', 'fileSize']}
        heading={key => {
          switch (key) {
          case 'fileName':
            return 'Document Name'
          case 'fileSize':
            return 'Size'
          case 'updated_at':
            return 'Date Stamp'
          }
        }}
        width={key => {
          switch (key) {
          case 'fileName':
            return '25%'
          case 'fileSize':
            return '7%'
          case 'updated_at':
            return '14%'
          }
        }}
        content={(key, value) => {
          switch (key) {
          case 'fileName':
            return path.basename(value)
          case 'fileSize':
            return prettyBytes(value)
          case 'updated_at':
            return new Date(value)
          }
        }}
        alignment={(key) => {
          switch (key) {
          case 'fileSize':
            return Alignment.right
          case 'updated_at':
            return Alignment.center
          default:
            return Alignment.left
          }
        }}
        defaultSort='updated_at'
        sortable={['fileName', 'updated_at', 'fileSize']}
        defaultSortDirection={key =>
          key === 'updated_at' ? SortDirection.descending : SortDirection.ascending
        }
        selectAction={row => setEditing(row)}
        selectable={() => true}
      />
      <Editor
        groupID={groupID}
        document={editing}
        onClose={onEditorClosed}
      />
    </ProfileSection>
  </>

  function prettyBytes(input: number) {
    function format(input: number, unit: string) {
      return (`${input.toFixed(0)} ${unit}`)
    }
    if (input > 1024 * 1024) return format(input / 1024 / 1024, 'MB')
    if (input > 1024) return format(input / 1024, 'kB')
    return format(input, 'B')
  }

  function onEditorClosed(refresh: boolean) {
    if (refresh) async.retry()
    setEditing(null)
  }
}

interface EditorProps {
  groupID: string
  document: Document | null
  onClose: (refresh: boolean) => void
}

const Editor: React.FC<EditorProps> = ({ groupID, document, onClose }) => {
  const { register, handleSubmit } = useForm()
  const addToast = useToast()
  const [disabled, setDisabled] = useState(false)

  if (!document) return <></>

  return <form onSubmit={handleSubmit(onUpdateNote)} className={styles.form}>
    <fieldset disabled={disabled}>
      <textarea
        placeholder="Note"
        className={styles.docNote}
        name="note"
        defaultValue={document.note}
        ref={register}
        autoFocus
      />
      <div className={styles.buttonContainer}>
        <input
          type="button"
          value="Delete"
          className={styles.delete}
          onClick={onDelete}
        />
        <input
          type="reset"
          value="Cancel"
          className={styles.reset}
          onClick={() => onClose(false)}
        />
        <input type="submit" value="Update" className={styles.submit} />
        <a
          className={styles.download}
          target="_blank"
          rel="noopener noreferrer"
          href={`${pharaoh()}/v2/brokers/groups/${groupID}/documents/${document.id}`}
        >
          Download
        </a>
      </div>
    </fieldset>
  </form>

  async function onDelete() {
    try {
      setDisabled(true)
      await api.v2.brokers.groups(groupID).documents(document!.id).DELETE()
      onClose(true)
    } catch (error) {
      addToast(error)
    } finally {
      setDisabled(false)
    }
  }

  async function onUpdateNote(data: any) {
    try {
      setDisabled(true)
      await api.v2.brokers.groups(groupID).documents(document!.id).PUT({ note: data.note })
      onClose(true)
    } catch (error) {
      addToast(error)
    } finally {
      setDisabled(false)
    }
  }
}

export default GroupsProfileDocumentsSection
