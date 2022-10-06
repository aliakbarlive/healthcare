import React from 'react'
import styles from './CandorInput.module.scss'
import { useFormContext } from 'react-hook-form'
import { classNames } from 'Utilities/etc'

export type CandorInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  name: string
}

const CandorInput = React.forwardRef<any, CandorInputProps>(({ style, className, ...props }, ref) => {
  if (!ref && !props.onChange) {
    ref = useFormContext()?.register()
    console.assert(ref, '<CandorInput> has no ref or onChange and there’s no FormContext!')
  }
  const classes = classNames(
    styles.candorInput,
    props.placeholder ? styles.hasPlaceholder : '',
    className
  )
  return <div style={{ ...style, position: 'relative' }}>
    <input {...props} ref={ref} className={classes} />
    {/* Needs to be after for pure CSS solution */}
    <label className={styles.label}>{props.placeholder}</label>
  </div>
})

CandorInput.displayName = 'CandorInput'

export default CandorInput
