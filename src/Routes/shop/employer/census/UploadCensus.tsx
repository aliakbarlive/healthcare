import React, { useState } from 'react'
import styles from './UploadCensus.module.scss'
import Loader from 'Components/Rudimentary/Loader'
import useToast from 'Utilities/Hooks/useToast'
import { upload } from 'Utilities/fetch++'
import { StargateConfig } from 'Utilities/Hooks/useStargate'

const UploadCensus: React.FC<{callback(census: any): void, config: StargateConfig }> = ({ callback, config }) => {
  const [disabled, setDisabled] = useState(false)
  const addToast = useToast()

  return <form className={styles.censusUploadForm}>
    { disabled && <div className={styles.loaderContainer}><Loader/></div> }
    <fieldset disabled={disabled}>
      <p>Fill out our <a href={config.census.group.url} download>template</a>
        , then click the upload button to submit your census</p>
      <label>
        <span>Upload completed<br/>Census Template</span>
        <input type="file" name='census' disabled={disabled} onChange={parseCensus} />
      </label>
    </fieldset>
  </form>

  async function parseCensus(event: React.ChangeEvent<HTMLInputElement>) {
    event.persist() // or event.target.value = '' fails
    try {
      setDisabled(true)
      const parsedCensus = await upload('/groups/xlsx', (event.target.files || [])[0])
      event.target.value = '' // or onChange won’t fire for the same file
      callback(parsedCensus)
    } catch (error) {
      addToast(error)
    } finally {
      setDisabled(false)
    }
  }
}

export default UploadCensus
