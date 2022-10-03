import React from 'react'
import styles from './eeContribution.module.scss'
import { GlobalStringConstant } from 'GlobalStringConstant'
const EEContribution = () => {
  return (
    <section className={styles.eeContribution}>
      <div className={styles.eeContributionContainer}>
        <div className={styles.fixedContribution}>
          <div className={styles.fixedContHeading}>
            <h2>{GlobalStringConstant[0].fixed_contribution}</h2>
          </div>
          <p>{GlobalStringConstant[0].eeContribution_fixed_amount}</p>
          <p className={styles.contributionInfo}>
            {GlobalStringConstant[0].ee_term_life_info}
          </p>
        </div>
        <div className={styles.remainErContribution}>
          <div className={styles.remainContHeading}>
            <h2>{GlobalStringConstant[0].remaining_er_contribution}</h2>
          </div>
          <p>{GlobalStringConstant[0].ee_remaining_amount}</p>
          <div className={styles.eeContprice}>
            <span className={styles.dolar}>{GlobalStringConstant[0].dolar}</span><span className={styles.amount}>{GlobalStringConstant[0].amount}</span><span className={styles.mon}>{GlobalStringConstant[0].mon}</span>
          </div>
        </div>
      </div>
    </section>
  )
}

export default EEContribution
