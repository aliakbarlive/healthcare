import React from 'react'
import styles from './Checkboxes.module.scss'
import { classNames } from 'Utilities/etc'

interface Props {
  value?: boolean
  name: string
  onChange: (value: boolean) => void
  className?: string
  disabled?: boolean
}

const SelectCheckbox: React.FC<Props> = ({ className, ...props }) => {
  return <div className={classNames(styles.container, className, props.value ? styles.selectedBG : styles.unselectedBG)}>
    <Checkbox
      label={props.value ? 'Selected' : 'Select'}
      className={styles.blueCheckmark}
      {...props} />
  </div>
}

const RemoveCheckbox: React.FC<Props> = props => {
  return <div className={styles.container}>
    <Checkbox
      label='Remove'
      className={styles.peachCheckmark}
      {...props} />
  </div>
}

interface Props3 extends Props {
  label: string
}

const AssociationCheckbox: React.FC<Props3> = props => {
  return <div className={styles.container}>
    <Checkbox
      labelClassName={styles.assLabel}
      className={styles.blueCheckmark}
      {...props} />
  </div>
}

interface Props2 extends Omit<React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>, 'onChange' | 'value'> {
  value?: boolean
  label: string
  labelClassName?: string
  className?: string
  onChange: (value: boolean) => void
  required?: boolean
}

const Checkbox: React.FC<Props2> = ({ value, label, labelClassName, className, ...props }) => {
  return <label className={classNames(labelClassName, styles.checkLabel)}>
    {label}
    <input type="checkbox" checked={value} {...props} onChange={onChange} />
    <span className={classNames(className, styles.checkmark)} />
  </label>

  function onChange(event: React.ChangeEvent<HTMLInputElement>) {
    props.onChange(event.currentTarget.checked)
  }
}

export { SelectCheckbox, RemoveCheckbox, AssociationCheckbox, Checkbox }
