import React from 'react'
import { GlobalStringConstant } from 'GlobalStringConstant'
import styles from '../index.module.scss'

interface Props {
  name: string
  benifitAmount: string | any
  benifitLabel: string
}
const CostEmployee: React.FC<Props> = ({ benifitAmount, benifitLabel, name }) => {
  return (
    <div className={`${styles.section} ${styles.cpe}`}>
      <table className={`${styles.box} ${styles.w_100}`}>
        <thead>
          <tr>
            <th />
            <th className={styles.vtlHeader}>{name}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className={styles.vtlRate}>Lowest Non-Smoker Rate<span className={styles.danger}>*</span></td>
            <td className={styles.vtlcpe}><span className={styles.dolarSpan}>{GlobalStringConstant[0].dolar}</span>{benifitAmount || 7}<small>{benifitLabel}</small></td>
          </tr>
          <tr>
            <td className={styles.vtlRate}>Highest Possible Rate<span className={styles.danger}>*</span></td>
            <td className={styles.vtlcpe}><span className={styles.dolarSpan}>{GlobalStringConstant[0].dolar}</span>{benifitAmount || 39}<small>{benifitLabel}</small></td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
export default CostEmployee
