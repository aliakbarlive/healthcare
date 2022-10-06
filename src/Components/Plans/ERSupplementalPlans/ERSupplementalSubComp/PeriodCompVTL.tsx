import React from 'react'
import styles from '../index.module.scss'

interface Props{
  compName: string
  daysOrWeak: string | any
  label:string
}

const PeriodCompVTL: React.FC<Props> = ({ ...props }) => {
  const { compName, daysOrWeak, label } = props
  return (
    <table className={styles.box}>
      <thead>
        <tr>
          <th>{compName}</th>
          <th />
          <th />
        </tr>
      </thead>
      <tbody>
        <tr>
          {label.length > 0
            ? <td className={styles.lump_sum + ' ' + styles.padding_16}>{StringWithDolar(daysOrWeak)}<small className={styles.vtlLabel}>{label}</small></td>
            : <td>{daysOrWeak}</td>}
          <td />
          <td />
        </tr>
      </tbody>
    </table>
  )

  function StringWithDolar(str:string) {
    const para = str.replaceAll('$', '<sup>$</sup>')
    return (
      <>
        <p className={styles.dolarSign} dangerouslySetInnerHTML={{ __html: para }} />
      </>
    )
  }
}

export default PeriodCompVTL
