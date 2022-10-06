import React from 'react'
import { GlobalStringConstant } from 'GlobalStringConstant'
import styles from '../index.module.scss'

interface Props {
  name: string
  benifitAmount: string | any
  benifitLabel: string
}
const BenifitAmountComp: React.FC<Props> = ({ benifitAmount, benifitLabel, name }) => {
  return (
    <div className={`${styles.section} ${styles.fourSpecs} ${styles.benifitContainer}`}>
      <table className={styles.box}>
        <thead>
          <tr>
            <th>{name}</th>
            <th />
            <th />
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className={styles.lump_sum}><span>{GlobalStringConstant[0].dolar}</span>{benifitAmount || '-'}<small className={styles.benefitLabel}>{benifitLabel}</small></td>
            <td />
            <td />
          </tr>
        </tbody>
      </table>
    </div>
  )
}
export default BenifitAmountComp
