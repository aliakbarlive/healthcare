import React, { ReactElement } from 'react'
import styles from './UploadFileModal.module.scss'
import AnubisModal from 'Components/Anubis/AnubisModal'
import { useForm } from 'react-hook-form'
import { useToggle } from 'react-use'
import useToast from 'Utilities/Hooks/useToast'

type Props = {
  title: string
  copy?: string | ReactElement
  template?: { href: string, name: string }
  isOpen: boolean
  onSubmit: (data: any) => Promise<void>
  onRequestClose: () => void
  successMessage?: string
}

const UploadFileModal: React.FC<Props> = ({ title, copy, template, isOpen, onRequestClose, onSubmit, successMessage }) => {
  const { register, watch, handleSubmit } = useForm()
  const [disabled, setDisabled] = useToggle(false)
  const file = watch('file')
  const addToast = useToast()

  return (
    <AnubisModal
      name={UploadFileModal.name}
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      styles={{ width: 820 }}
    >
      <div className={styles.modal}>
        <h1>{title}</h1>
        { copy
          ? typeof copy === 'string'
            ? <p className={styles.deets}>{copy}</p>
            : copy
          : null
        }
        { template &&
          <span className={styles.download}>
            Download{' '}
            <a download href={template.href}>{template.name}</a>
            , complete information, upload, and submit.
          </span>
        }
        <form
          onSubmit={handleSubmit(go)}
          className={styles.uploadContainer}
        >
          <fieldset disabled={disabled}>
            <div className={styles.uploadRow}>
              <span className={styles.uploadComplete}>Upload { template && 'completed template' }</span>
              <span className={styles.uploadFile}>{file?.length ? 'Selected file' : 'No file selected'}</span>
              <span className={styles.uploadedFile}>{file && file[0]?.name}</span>
            </div>
            <div className={styles.uploadButtons}>
              <label className={styles.browse}>
                <input
                  name={'file'}
                  ref={register}
                  type="file"
                  multiple={false}
                  required
                />
                  Browse Files
              </label>
              <input disabled={!file} type="submit" className={styles.submit} value="Submit"/>
            </div>
          </fieldset>
        </form>
      </div>
    </AnubisModal>
  )

  async function go(data: any) {
    try {
      setDisabled(true)
      await onSubmit(data)
      addToast(successMessage || 'File sucessfully uploaded', { appearance: 'success', autoDismiss: true })
      onRequestClose()
    } catch (error) {
      addToast(error as Error)
    } finally {
      setDisabled(false)
    }
  }
}

export default UploadFileModal
