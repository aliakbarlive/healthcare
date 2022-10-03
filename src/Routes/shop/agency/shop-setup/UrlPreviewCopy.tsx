import React from 'react'
import styles from './UrlPreviewCopy.module.scss'
import { ReactComponent as IconCopy } from 'Assets/copy-solid.svg'
import { ReactComponent as IconOpenUrl } from 'Assets/up-right-from-square-solid.svg'

type Props = {
  url: string
}
const UrlPreviewCopy: React.FC<Props> = ({ url }) => {
  return (
    <div className={styles.UrlPreviewCopy}>
      <span>{url}</span>
      <a href={url} target="blank"><IconOpenUrl/></a>
      <button onClick={() => {
        navigator.clipboard.writeText(url)
      }}><IconCopy/>
      </button>
    </div>
  )
}

export default UrlPreviewCopy
