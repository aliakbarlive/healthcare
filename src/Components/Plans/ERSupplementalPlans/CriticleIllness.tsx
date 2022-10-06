import React from 'react'
import { Contributions, GroupPlanType } from 'Utilities/Plans/ContributionCalculator'
import { TieredRates } from 'Utilities/pharaoh.types'
import PlanTitle from '../plan-subcomponents/PlanTitle'
import { Label } from 'Utilities/config'
import styles from './index.module.scss'
import Plan from '../plan-subcomponents/Plan'
import SupplementalPlan from '../SupplementalPlan/index.helpers'
import PremiumBreakdown, { isEmployerProps, EmployerProps } from '../plan-subcomponents/PremiumBreakdown'
import BenifitAmountComp from './ERSupplementalSubComp/BenifitAmountComp'
import { GlobalStringConstant } from 'GlobalStringConstant'
import PeriodComp from './ERSupplementalSubComp/PeriodComp'
import { GetStringNumber } from 'Routes/shop/employer/plans/SupplementalPlanEE/PlansComponent/CriticalIllnessEE'

interface Props {
  plan: { rate: TieredRates, plan: SupplementalPlan, isRenewal: boolean }
  contributions: Contributions
  selected?: boolean
  label: Label
  showWeeklyPayments: boolean
}

const CriticleIllness: React.FC<EmployerProps & Props> = (props) => {
  const { plan, selected, label, contributions, showWeeklyPayments } = props
  const sbc = plan.plan.data.sbc
  const majorCriticalIllnessEvent = GetStringNumber(plan?.plan?.data?.majorCriticalIllnessEvent)
  const subsequentCriticalIllnessEvent = plan?.plan?.data?.subsequentCriticalIllnessEvent
  const suddenCardiacArrestBenefit = plan?.plan?.data?.suddenCardiacArrestBenefit?.replace('*payable once per lifetime', '')

  return <Plan selected={!!selected}>
    <section className={styles.criticleIllnessPlans}>
      <div className={styles.FutureContainer}>
        <PlanTitle
          id={plan.plan.id}
          planName={plan.plan.name}
          carrier={plan.plan.carrier}
          selected={selected}
          includesProsperBenefits={false}
          planType={GroupPlanType.criticalIllness}
          label={label}
          sbc={sbc}
        />

        <article className={styles.custom_plan}>
          <div className={styles.planBodyContainer}>
            <div className={`${styles.section} ${styles.pbContainer}`}>
              {breakdown()}
            </div>
            <BenifitAmountComp name={GlobalStringConstant[0].major_criticalIllness_event} benifitAmount={majorCriticalIllnessEvent} benifitLabel={GlobalStringConstant[0].payable_one_per_lifetime} />
            <div className={`${styles.section} ${styles.fourSpecs} ${styles.half_height}`}>
              <PeriodComp compName={GlobalStringConstant[0].subsequent_critical_illness_event} daysOrWeak={subsequentCriticalIllnessEvent} label={' '} />
              <PeriodComp compName={GlobalStringConstant[0].sudden_cardiac_arrest_benefit} daysOrWeak={suddenCardiacArrestBenefit} label={GlobalStringConstant[0].payable_one_per_lifetime} />
            </div>
          </div>
        </article>
      </div>
    </section>
  </Plan>
  function breakdown() {
    const base = { plan, contributions, showWeeklyPayments }
    if (isEmployerProps(props)) {
      return <PremiumBreakdown {...base} members={props.members} />
    }
  }
}

export default CriticleIllness
