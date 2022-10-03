import React from 'react'
import styles from './EnrollmentStats.module.scss'

export type Stats = {
  complete: number
  waived: number
  incomplete: number
}

type Props = {
  stats: Stats
}

const EnrollmentStats: React.FC<Props> = ({ stats }) => {
  if (!stats) {
    return <></>
  }

  return <>
    { Object.entries(stats).map(entry => {
      const hasIncomplete = entry[0] === 'incomplete' && entry[1]
      return <div className={`${styles.statContainer} ${hasIncomplete && styles.orangeBorder}`} key={entry[0]}>
        <span>{entry[1] || 0}</span>
        <span>{entry[0]}</span>
      </div>
    })}
  </>
}

export default EnrollmentStats
