import React from 'react'
import styles from './FilterItem.module.scss'
import { FilterItem } from './PlansFilter'

interface Props {
  filters: FilterItem[]
  callback: (value: any) => void
  active: any[]
}

const RangeFilter: React.FC<Props> = ({ filters, callback, active }) => {
  return <div className={styles.filterSet}>
    {filters.map((filter, index) => {
      const isActive = active.find(([, value]) => value === filter.value) !== undefined
      return <label key={index} className={styles.radioContainer}>
        <input value={filter.value} readOnly onClick={() => callback(filter.value)} checked={isActive} type="radio" />
        {filter.label}
        <span className={styles.radio}></span>
      </label>
    })}
  </div>
}

export default RangeFilter
