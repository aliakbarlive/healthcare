import React from 'react'
import baseStyles from '../plan-subcomponents/Plan.module.scss'
import styles from './index.module.scss'
import Plan, { PlanBody, SpecBox } from '../plan-subcomponents/Plan'
import { Contributions, GroupPlanType, hasCustomPlanContributionFor, moneyString } from 'Utilities/Plans/ContributionCalculator'
import { TieredRates } from 'Utilities/pharaoh.types'
import { PremiumSplits } from '../plan-subcomponents/Plan.helpers'
import PlanTitle from '../plan-subcomponents/PlanTitle'
import { Label } from 'Utilities/config'
import LifePlan from './index.helpers'
import { classNames } from 'Utilities/etc'
import PremiumBreakdown, { EmployeeProps } from '../plan-subcomponents/PremiumBreakdown'
import { AppMode, useAppMode } from 'Components/Stargate/TableOfContents'

interface Props {
  plan: { rate: TieredRates, plan: LifePlan, isRenewal: boolean}
  contributions: Contributions
  selectHandler?(plan: LifePlan): void
  selected?: boolean
  premium?: PremiumSplits
  nonWaivedMemberCount?: number
  label: Label
  showWeeklyPayments: boolean
}

const LifePlanComponent: React.FC<EmployeeProps & Props> = ({ plan, selectHandler, selected, ...props }) => {
  const { id, data, name, carrier } = plan.plan
  const isEmployer = useAppMode() === AppMode.employer
  const hasCustomPlanContribution = isEmployer && hasCustomPlanContributionFor(plan, props.contributions)
  const memberCount = props.nonWaivedMemberCount || 0
  let sbc = `https://s3.amazonaws.com/documents-pub.candor.insurance/sbc/${id.toLowerCase()}`

  // Principal VTL SBCs depend on the group size
  if (carrier === 'Principal' && name === 'Voluntary Term Life') {
    if (memberCount >= 50) {
      sbc += '-50-99'
    } else if (memberCount >= 25) {
      sbc += '-25-49'
    } else if (memberCount >= 10) {
      sbc += '-10-24'
    } else {
      sbc += '-5-9'
    }
  }
  sbc += '.pdf'

  return <Plan selected={!!selected}>
    <PlanTitle
      id={id}
      planName={name}
      carrier={carrier}
      customContributionApplied={hasCustomPlanContribution}
      selectHandler={selectHandler && (() => selectHandler(plan.plan))}
      selected={selected}
      sbc={sbc}
      includesProsperBenefits={false}
      planType={GroupPlanType.life}
      label={props.label}
    />
    <PlanBody>
      <PremiumBreakdown
        plan={plan}
        contributions={props.contributions}
        showWeeklyPayments={props.showWeeklyPayments}
        member={props.member}
        premium={props.premium}
      />
      <div className={classNames(baseStyles.section, styles.specs)}>
        <SpecBox label='Individual'>
          <div className={baseStyles.amount}>{moneyString(data.benefitsIndividual)}</div>
          <span className={styles.specDescription}>Minimum Benefit</span>
        </SpecBox>
        <SpecBox label='Spouse'>
          <div className={baseStyles.amount}>{moneyString(data.benefitsSpouse)}</div>
          <span className={styles.specDescription}>Minimum Benefit</span>
        </SpecBox>
        <SpecBox label='Child(ren)'>
          <div className={baseStyles.amount}>{moneyString(data.benefitsPerChild)}</div>
          <span className={styles.specDescription}>Minimum Benefit</span>
        </SpecBox>
      </div>
    </PlanBody>
  </Plan>
}

export default LifePlanComponent
