import React from 'react'
import styles from './FlagGroup.module.scss'

type Props = {
  checked: boolean
  onChange: ((event: React.ChangeEvent<HTMLInputElement>) => void)
}

const FlagGroup: React.FC<Props> = ({ checked, onChange }) =>
  <label className={styles.flagGroup}>
    <span>Flag Client</span>
    <input type="checkbox" name="flag" checked={checked} onChange={onChange}/>
    <span className={styles.checkmark}></span>
  </label>

export default FlagGroup
