import React from 'react'
import styles from './PlanSnapshotSection.module.css'

interface Props {
  sectionWidth?: number | string
  flexDirection?: any
  className?: string
  refCallback?: any
}

const PlanSnapshotSection: React.FC<Props> = ({ sectionWidth, flexDirection, className, refCallback, children }) => {
  const classes = [styles.graySection, className]
  return (
    <div
      ref={refCallback}
      className={classes.join(' ')}
      style={{ width: widthCSS(), flex: sectionWidth ? 'unset' : 1, flexDirection: flexDirection || 'column' }}>
      {children}
    </div>
  )

  function widthCSS() {
    if (!sectionWidth) { return }

    // Single Column
    if (sectionWidth === 1) {
      return '100%'
    }
    // Two column layout and each section has margin-right: 10px
    return `calc(${sectionWidth}*(100% - 20px))`
  }
}

export default PlanSnapshotSection
