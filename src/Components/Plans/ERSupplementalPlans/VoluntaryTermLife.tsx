import React from 'react'
import { Contributions, GroupPlanType } from 'Utilities/Plans/ContributionCalculator'
import { TieredRates } from 'Utilities/pharaoh.types'
import PlanTitle from '../plan-subcomponents/PlanTitle'
import { Label } from 'Utilities/config'
import styles from './index.module.scss'
import Plan from '../plan-subcomponents/Plan'
import SupplementalPlan from '../SupplementalPlan/index.helpers'
import { EmployerProps } from '../plan-subcomponents/PremiumBreakdown'
import BenifitAmountComp from './ERSupplementalSubComp/BenifitAmountComp'
import { GlobalStringConstant } from 'GlobalStringConstant'
import PeriodCompVTL from './ERSupplementalSubComp/PeriodCompVTL'
import CostEmployee from './ERSupplementalSubComp/CostEmployee'
import { GetStringNumber } from 'Routes/shop/employer/plans/SupplementalPlanEE/PlansComponent/CriticalIllnessEE'

interface Props {
  plan: { rate: TieredRates, plan: SupplementalPlan, isRenewal: boolean }
  contributions: Contributions
  selected?: boolean
  label: Label
  showWeeklyPayments: boolean
}

const VoluntaryTermLife: React.FC<EmployerProps & Props> = (props) => {
  const { plan, selected, label } = props
  const sbc = plan.plan.data.sbc
  return <Plan selected={!!selected}>
    <section className={styles.accidentPlan}>
      <div className={styles.FutureContainer}>
        <div className={styles.remindAll}>
          <p>Voluntary Term Life is intended to be an employee paid benefit, as an employee is able to take the policy with them after their employment ends.</p>
        </div>
        <PlanTitle
          id={plan.plan.id}
          planName={plan.plan.name}
          carrier= {plan.plan.carrier}
          selected={selected}
          includesProsperBenefits={false}
          planType={GroupPlanType.life}
          label={label}
          sbc={sbc}
        />
        <article className={styles.custom_plan}>
          <div className={styles.planBodyContainer}>
            <div className={`${styles.section} ${styles.pbContainer}`}>
              <CostEmployee name={GlobalStringConstant[0].cost_per_employee} benifitAmount={7} benifitLabel={'/mo'}/>
            </div>
            <BenifitAmountComp name={GlobalStringConstant[0].benefit_amout} benifitAmount= {GetStringNumber(plan?.plan?.data?.benefitsIndividual)?.toString()} benifitLabel = {GlobalStringConstant[0].face_value}/>
            <div className={`${styles.section} ${styles.fourSpecs} ${styles.half_height}`}>
              <PeriodCompVTL compName={GlobalStringConstant[0].plan_term} daysOrWeak={plan?.plan?.data?.planTerm + ' term'} label={''}/>
              <PeriodCompVTL compName={GlobalStringConstant[0].portability} daysOrWeak={''} label={'An employee is able to take the policy with them after their employment ends.'}/>
            </div>
            <div className={styles.cpeNote}>
              <p><span>*</span>The term life plan rates depend on the age and tobacco use of each employee.</p>
            </div>
          </div>
        </article>
      </div>
    </section>
  </Plan>
}

export default VoluntaryTermLife
