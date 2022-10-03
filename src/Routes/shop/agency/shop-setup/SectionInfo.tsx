import React from 'react'
import styles from './SectionInfo.module.scss'

type Props = {
  header?: React.ReactNode
  main?: React.ReactNode
  aside?: React.ReactNode
}
const SectionInfo: React.FC<Props> = ({
  header,
  main,
  aside
}) => {
  return (
    <section className={styles.SectionInfo}>
      <div className={styles.main}>
        {header && <header>{header}</header>}
        {main && <main>{main}</main>}
      </div>
      {aside && <aside>{aside}</aside>}
    </section>
  )
}

export default SectionInfo
