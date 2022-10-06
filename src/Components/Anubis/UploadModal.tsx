import React, { useState } from 'react'
import styles from './UploadModal.module.css'
import AnubisModal from './AnubisModal'
import * as api from 'Utilities/pharaoh'
import useToast from 'Utilities/Hooks/useToast'
import { useToggle } from 'react-use'

interface Props {
  onRequestClose: (data: any) => void
  isOpen: boolean
  groupID: string
}

const UploadModal: React.FC<Props> = (props) => {
  const [file, setFile] = useState<File|undefined>()
  const [note, setNote] = useState('')
  const [disabled, setDisabled] = useToggle(false)
  const addToast = useToast()

  return <AnubisModal
    {...props}
    name={UploadModal.name}
    styles={{ display: 'inline-table', height: 'fit-content' }}
    showClose={true}
  >
    <fieldset disabled={disabled} className={styles.container}>
      <form onSubmit={upload} className={styles.content} encType="multipart/form-data">
        <h1>Upload New Document</h1>
        <div className={styles.uploadBox}>
          <div className={styles.fileContainer}>
            <span className={styles.selectedFile}>You selected:</span>
            <span className={styles.fileName}>
              {file?.name || '            '}
            </span>
          </div>
          <label className={styles.fileLabel}>
            <input multiple={false} type="file" name="file" hidden={true} onChange={e => {
              setFile((e.target.files || [])[0])
            }}/>
              Browse Files
          </label>
        </div>
        <textarea className={styles.note} name="note" placeholder="Notes" onChange={onChangeNote} value={note} />
        <input className={styles.submit} type="submit" value="Upload" disabled={file === undefined}/>
      </form>
    </fieldset>
  </AnubisModal>

  function onChangeNote(event: React.ChangeEvent<HTMLTextAreaElement>) {
    setNote(event.currentTarget.value)
  }

  async function upload(event: any) {
    try {
      setDisabled(true)
      event.preventDefault()
      const formData = new FormData()
      formData.append('file', file!)
      formData.append('note', note)
      const rsp = await api.v2.brokers.groups(props.groupID).documents().POST(formData)
      props.onRequestClose(rsp)
      addToast('File Upload Complete')
      setFile(undefined)
      setNote('')
    } catch (error) {
      addToast(error)
    } finally {
      setDisabled(false)
    }
  }
}

export default UploadModal
