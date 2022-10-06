import { AppMode } from 'Components/Stargate/TableOfContents'
import React from 'react'
import baseStyles from '../plan-subcomponents/Plan.module.scss'
import styles from './index.module.scss'
import { D2 as Data, specsFor } from './index.helpers'
import { SpecBox } from '../plan-subcomponents/Plan'
import { classNames, thousandsComma } from 'Utilities/etc'
import { isDollar } from 'Utilities/Plans/PlanCostUtils'
import { moneyNumber } from 'Utilities/Plans/ContributionCalculator'

const D2:React.FC<{data: Data, mode: AppMode}> = ({ data, mode }) => {
  const preventive = specsFor('preventativeCoinsurance', data)
  const basic = specsFor('basicCoinsurance', data)
  const major = specsFor('majorCoinsurance', data)
  const ded = specsFor('preventativeDeductible', data) // Per Jeremy only show preventative deductible for "Sales Purposes"
  const max = specsFor('preventativeMax', data) // Per Jeremy only show preventative max for "Sales Purposes"
  const isER = mode === AppMode.employer
  const specs = isER ? er() : ee()

  return <div className={classNames(baseStyles.section, isER ? styles.er : styles.ee)}>
    { specs.map(s => s) }
  </div>

  function ee() {
    return [
      spec('Preventive', preventive),
      spec('Basic', basic),
      spec('Major', major),
      spec('Deductible', ded, 'yr'),
      spec('Annual Max', max, 'yr')
    ]
  }

  function er() {
    return [
      spec('Deductible', ded, 'yr'),
      spec('Major', major),
      spec('Annual Max', max, 'yr')
    ]
  }

  function spec(label: string, data: { inNetwork?: string, outOfNetwork?: string }, frequency?: string) {
    const { inNetwork, outOfNetwork } = data
    const showDollar = inNetwork && isDollar(inNetwork)
    const massaged = showDollar ? thousandsComma(moneyNumber(inNetwork!)) : inNetwork
    return <SpecBox label={label} key={label.replace(/\s+/g, '')}>
      <div className={baseStyles.amount}>{ inNetwork
        ? <>{showDollar ? <span>$</span> : ''}{massaged}{frequency ? <span>{`/${frequency}`}</span> : ''}</>
        : 'N/A'
      }
      </div>
      <div className={styles.network}>{ inNetwork && inNetwork === outOfNetwork ? 'In- and Out-of-Network' : 'In-Network' }</div>
    </SpecBox>
  }
}

export default D2
