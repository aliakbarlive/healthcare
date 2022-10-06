import React from 'react'
import styles from './EmployeeSelectorItem.module.scss'

interface Props {
  name: string
  selected: boolean
  callback: (id: string, splitID: string) => void
  id: string
  groupGroupId: any
  variant: 'checkmark' | 'unknown'
}

const EmployeeSelectorItem: React.FC<Props> = ({ name, selected, callback, id, groupGroupId, variant }) => {
  const visClass = `${styles.selectionVisual} ${selected ? variant === 'checkmark' ? styles.check : styles.active : null}`
  const nameClass = `${styles.nameContainer} ${selected ? variant === 'checkmark' ? styles.checkName : styles.activeName : null}`

  return (
    <div onClick={() => callback(id, groupGroupId)} className={styles.selectorContainer}>
      <div className={styles.addContainer}>
        <AddBox selected={selected} variant={variant} />
      </div>

      <div className={visClass}>
        <div className={nameClass}>
          {name}
        </div>
      </div>
    </div>
  )
}

const AddBox: React.FC<Pick<Props, 'selected' | 'variant'>> = ({ selected, variant }) => {
  const addClass = `${styles.addBox} ${selected ? variant === 'checkmark' ? styles.checkBox : styles.activeBox : null}`

  return (
    <button className={addClass}>
      <i className={'material-icons'}>{selected ? variant === 'checkmark' ? 'check' : 'remove' : 'add'}</i>
    </button>
  )
}

export default EmployeeSelectorItem
