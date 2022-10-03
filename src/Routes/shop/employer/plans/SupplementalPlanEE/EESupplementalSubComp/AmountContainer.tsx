import { GlobalStringConstant } from 'GlobalStringConstant'
import React, { HTMLProps } from 'react'
import { GetStringNumber } from '../PlansComponent/CriticalIllnessEE'
import styles from './EESupplementalSubComp.module.scss'
interface Props {
  name: string
  label: string
  amount: string
  itemID: string
}

const AmountContainer:React.FC<HTMLProps<HTMLElement> & { innerclassname? : string} & Props> = (props) => {
  const { name, label, amount, itemID } = props
  const stdAmount = itemID === '3' && GetStringNumber(amount)
  return (
    <div className={styles.amount_container}>
      <div className={styles.benefit_amount}>
        <span className={styles.benefit_period}>{name || ''}</span>
        {itemID === '3'
          ? <>
            <div className={`${styles.accidental_death_price} ${styles.hospital_benifit_amoutn} ${styles.std_benifit_amoutn}`}>
              {stdAmount && <> <span className={styles.dolar}>{GlobalStringConstant[0].dolar}</span><span className={styles.amount}>{stdAmount?.[0] + ' to '}</span>
                <span className={styles.dolar}>{GlobalStringConstant[0].dolar}</span><span className={styles.amount}>{ stdAmount?.[1] || '0'}</span>
              </>}
            </div>
          </>
          : <>
            <div className={`${styles.accidental_death_price} ${styles.hospital_benifit_amoutn}`}>
              <span className={styles.dolar}>{GlobalStringConstant[0].dolar}</span><span className={styles.amount}>{amount || '0'}</span>
            </div>
          </>}
        <span className={styles.base_on_your_income}>{label || ''}</span>
        {props.children}
      </div>
    </div>
  )
}

export default AmountContainer
