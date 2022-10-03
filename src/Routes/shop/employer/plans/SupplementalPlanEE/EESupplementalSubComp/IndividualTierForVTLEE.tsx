import { GlobalStringConstant } from 'GlobalStringConstant'
import React from 'react'
import styles from './EESupplementalSubComp.module.scss'

interface Props {
  individualTierRate: string
}

const IndividualTierForVTLEE: React.FC<Props> = ({ individualTierRate }) => {
  return (
    <div className={styles.individual_tier_container}>
      <div className={styles.heading}>
        <label className={styles.individual_tier}>{GlobalStringConstant[0].individual_tier}</label>
      </div>
      <div className={styles.individual_tier_price}>
        <div className={styles.frame_840_cq0LNW}>
          <div className={styles.eeContprice}>
            {individualTierRate && <><span className={styles.dolar}>{GlobalStringConstant[0].dolar}</span><span className={styles.amount}>{individualTierRate}</span><span className={styles.mon}>/mon</span> </>}
          </div>
        </div>
        <div className={styles.after_employer_contribution}>&nbsp;</div>
        <div className={styles.your_employer_contri}>
          <span className={styles.span0_tx4d8q}>{GlobalStringConstant[0].your_employer_contributes} </span>
          <span className={styles.dolarMonth}>$0/mo</span>
          <span className={styles.span3_tx4d8q}> {GlobalStringConstant[0].to_this_plan}</span>
        </div>
      </div>
    </div>
  )
}

export default IndividualTierForVTLEE
