import React from 'react'
import { classNames } from 'Utilities/etc'
import styles from './MQStats.module.scss'

type Stats = {
  notStarted: number
  complete: number
  waived: number
  incomplete: number
}

type Props = {
  stats: Stats
}

const MQStats: React.FC<Props> = ({ stats }) => {
  if (!stats) {
    return <></>
  }

  return <div style={{ flexDirection: 'column' }}>
    <div style={{ flexDirection: 'row', display: 'flex' }}>
      <div className={classNames(styles.statContainer, styles.notStarted)}>
        <span>{stats.notStarted}</span>
        <span>Not Started</span>
      </div>
      <div className={classNames(styles.statContainer, styles.incomplete)}>
        <span>{stats.incomplete}</span>
        <span>Incomplete</span>
      </div>
    </div>
    <div style={{ flexDirection: 'row', display: 'flex' }}>
      <div className={classNames(styles.statContainer, styles.complete)}>
        <span>{stats.complete}</span>
        <span>Completed</span>
      </div>
      <div className={classNames(styles.statContainer, styles.waived)}>
        <span>{stats.waived}</span>
        <span>Waived</span>
      </div>
    </div>
  </div>
}

export default MQStats
