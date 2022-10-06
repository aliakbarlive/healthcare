import React from 'react'
import { Control, Controller } from 'react-hook-form'
import { classNames } from 'Utilities/etc'
import styles from './CandorSwitch.module.scss'

interface CandorSwitchProps {
  name: string
  control?: Control<Record<string, any>>
  defaultValue?: string
  placeholder?: string // TODO Remove or incorporate into Component
  className?: string
}

interface SwitchProps {
  value?: boolean | null
  className?: string
  onChange(decision: boolean): void
}

export const Switch: React.FC<SwitchProps> = ({ onChange, value, className }) => {
  function state(button: boolean) {
    return value === button ? 'selected' : 'unselected'
  }

  return <div className={classNames(styles.switch, className)}>
    <button data-state={state(true)} onClick={() => onChange(true)} type='button'>Yes</button>
    <button data-state={state(false)} onClick={() => onChange(false)} type='button'>No</button>
  </div>
}

const CandorSwitch: React.FC<CandorSwitchProps> = props => {
  return <Controller
    {...props}
    defaultValue={props.defaultValue || null}
    render={fwd => <Switch {...props} {...fwd}/>}
  />
}

export default CandorSwitch
