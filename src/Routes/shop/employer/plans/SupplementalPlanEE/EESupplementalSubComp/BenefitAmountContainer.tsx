import React, { HTMLProps } from 'react'
import { classNames } from 'Utilities/etc'
import styles from './EESupplementalSubComp.module.scss'

const BenefitAmountContainer:React.FC<HTMLProps<HTMLElement> & { innerclassname? : string}> = (props) => {
  return (
    <div className={classNames(styles.hospitalization_benefit, props.innerclassname)}>
      <div className={classNames(styles.initial_hospitalization_benefit, props.innerclassname)}>
        {props.children}
      </div>
    </div>
  )
}
export default BenefitAmountContainer
