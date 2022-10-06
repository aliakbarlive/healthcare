import React from 'react'
import styles from './PlanBox.module.css'
import { classNames } from 'Utilities/etc'

interface Props {
  height?: string | number
  padding?: string | number
  className?: string
  refCallback?: any
}

const PlanBox: React.FC<Props> = props => {
  return <div
    style={{ height: props.height, padding: props.padding }}
    className={classNames(styles.planBox, props.className)}
    ref={props.refCallback}
  >
    {props.children}
  </div>
}

export default PlanBox
