import React from 'react'
import EnrollmentStats, { Stats } from './EnrollmentStats'
import styles from './EnrollmentStatus.module.css'
import summaryStyles from 'Components/Anubis/ProfileSection.module.scss'
import { useToggle } from 'react-use'

type Props = {
  stats: Stats
}

const EnrollmentStatus: React.FC<Props> = ({ stats }) => {
  const [expanded, setExpanded] = useToggle(true)

  if (!Object.keys(stats).length) return <></>
  return (
    <div className={styles.container}>
      <div
        style={{ width: '100%', lineHeight: '20px' }}
        className={`${summaryStyles.summary} ${expanded ? summaryStyles.expanded : ''}`}
        onClick={setExpanded}
      >
        Enrollment Status
      </div>
      <div style={{ display: expanded ? 'grid' : 'none' }} className={styles.content}>
        <EnrollmentStats stats={stats}/>
      </div>
    </div>
  )
}

export default EnrollmentStatus
