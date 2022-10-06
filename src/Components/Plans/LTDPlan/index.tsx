import React from 'react'
import baseStyles from '../plan-subcomponents/Plan.module.scss'
import styles from './index.module.scss'
import Plan, { PlanBody } from '../plan-subcomponents/Plan'
import { Contributions, GroupPlanType, hasCustomPlanContributionFor } from 'Utilities/Plans/ContributionCalculator'
import { TieredRates } from 'Utilities/pharaoh.types'
import PlanTitle from '../plan-subcomponents/PlanTitle'
import { Label } from 'Utilities/config'
import LTDPlan from './index.helpers'
import PremiumBreakdown, { EmployeeProps } from '../plan-subcomponents/PremiumBreakdown'
import { AppMode, useAppMode } from 'Components/Stargate/TableOfContents'

interface Props {
  plan: { rate: TieredRates, plan: LTDPlan, isRenewal: boolean }
  contributions: Contributions
  selectHandler?(plan: LTDPlan): void
  selected?: boolean
  nonWaivedMemberCount?: number
  showWeeklyPayments: boolean
  label: Label
}

const LTDPlanComponent: React.FC<EmployeeProps & Props> = ({ plan, selectHandler, selected, ...props }) => {
  const { data, name, carrier, id } = plan.plan
  const isEmployer = useAppMode() === AppMode.employer
  const hasCustomPlanContribution = isEmployer && hasCustomPlanContributionFor(plan, props.contributions)
  const sbc = `https://s3.amazonaws.com/documents-pub.candor.insurance/sbc/${id.toLowerCase()}.pdf`

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
      planType={GroupPlanType.disability}
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
      <div className={`${baseStyles.section} ${styles.specs}`}>
        <div className={baseStyles.box}>
          <div className={styles.label}>Elimination Period</div>
          <span>{data.eliminationPeriodInDays} Days</span>
        </div>
        <div className={baseStyles.box}>
          <div className={styles.label}>Conversion</div>
          <span>{data.conversion}</span>
        </div>
        <div className={baseStyles.box}>
          <div className={styles.label}>Work Life Assistance</div>
          <span>{data.workLifeAssistance}</span>
        </div>
        <div className={baseStyles.box}>
          <div className={styles.label}>Survivor Benefit</div>
          <span>{data.survivorBenefit}</span>
        </div>
        <div className={baseStyles.box}>
          <div className={styles.label}>Monthly Benefit</div>
          <span>{data.monthlyBenefit}</span>
        </div>
        <div className={baseStyles.box}>
          <div className={styles.label}>Continuity of Coverage</div>
          <span>{data.continuityOfCoverage}</span>
        </div>
      </div>
    </PlanBody>
  </Plan>
}

export default LTDPlanComponent
