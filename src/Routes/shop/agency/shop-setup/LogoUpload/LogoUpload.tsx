import React from 'react'
import { useUploadLogoTypes } from './useUploadFile'
import styles from '../index.module.scss'
import LandingLogo from 'Components/Landing/LandingLogo'

type Props = {
  useUploadLogo: useUploadLogoTypes
  currentLogo?: string
}

const LogoUpload: React.FC<Props> = ({
  useUploadLogo,
  currentLogo
}) => {
  const {
    selectedFile,
    updateSelectedFile,
    removeSelectedFile
  } = useUploadLogo

  const fileRef = React.useRef<HTMLInputElement>(null)

  const handleFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault()
    const files = (event.target as HTMLInputElement).files || []
    updateSelectedFile(files[0])
  }

  const handleFileRemoved = (event: React.MouseEvent) => {
    event.preventDefault()
    removeSelectedFile()
  }

  const imgPreview = () => {
    if (selectedFile) {
      const object = URL.createObjectURL(selectedFile as Blob)
      return <LandingLogo logo={object}/>
    } else {
      return <LandingLogo logo={currentLogo}/>
    }
  }

  return (
    <div className={styles.logoUpload}>
      <p className={styles.notes3}>Accepted file types are .jpeg and .png.</p>
      <div className={styles.logo}>
        {imgPreview()}
        <div>
          <label>
            <input
              ref={fileRef}
              style={{ display: 'none' }}
              type="file"
              name="file"
              accept="image/png, image/jpeg"
              onChange={handleFileSelected}
            />
            <button
              className={styles.uploadButton}
              onClick={(event) => {
                event.preventDefault()
                fileRef.current?.click()
              }}
            >
              Select File
            </button>
          </label>
          {selectedFile && (
            <button className={styles.removeButton} onClick={handleFileRemoved}>
              Remove Logo
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default LogoUpload
