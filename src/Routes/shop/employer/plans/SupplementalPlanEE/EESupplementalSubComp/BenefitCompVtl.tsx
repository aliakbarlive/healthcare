import React from 'react'
import styles from './EESupplementalSubComp.module.scss'

interface Props {
  benefitAmount: string | undefined
  name: string
  amountLabel: string
}

const BenefitCompVtl: React.FC<Props> = ({ benefitAmount, name, amountLabel }) => {
  return (
    <div className={styles.accident_deathBenefit}>
      <div className={styles.beneftiClassVtl}>
        {name && <p>{name}</p>}
        <div className={styles.accidental_death_price}>
          {benefitAmount && <> <span className={styles.dolar}>$</span><span className={styles.amountVtl}>{benefitAmount}</span> </>}
          {amountLabel && <p className= {styles.benefit_amount_label_vtl}> {amountLabel} </p>}
        </div>
      </div>
    </div>
  )
}

export default BenefitCompVtl
