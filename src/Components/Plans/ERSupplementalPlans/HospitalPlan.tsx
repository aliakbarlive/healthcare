import React from 'react'
import { Contributions, GroupPlanType } from 'Utilities/Plans/ContributionCalculator'
import { TieredRates } from 'Utilities/pharaoh.types'
import PlanTitle from '../plan-subcomponents/PlanTitle'
import { Label } from 'Utilities/config'
import styles from './index.module.scss'
import Plan from '../plan-subcomponents/Plan'
import SupplementalPlan from '../SupplementalPlan/index.helpers'
import PremiumBreakdown, { isEmployerProps, EmployerProps } from '../plan-subcomponents/PremiumBreakdown'
import { GlobalStringConstant } from 'GlobalStringConstant'
import BenifitAmountComp from './ERSupplementalSubComp/BenifitAmountComp'
import PeriodComp from './ERSupplementalSubComp/PeriodComp'
// import { GetStringNumber } from 'Routes/shop/employer/plans/SupplementalPlanEE/PlansComponent/CriticalIllnessEE'

interface Props {
  plan: { rate: TieredRates, plan: SupplementalPlan, isRenewal: boolean }
  contributions: Contributions
  selected?: boolean
  label: Label
  showWeeklyPayments: boolean
}

const HospitalPlan: React.FC<EmployerProps & Props> = (props) => {
  const { plan, selected, label, contributions, showWeeklyPayments } = props
  const sbc = plan.plan.data.sbc
  const hospitalConfinementBenefit = (plan?.plan?.data?.hospitalConfinementBenefit).match(/\d+/)[0]
  const hospitalShortStay = (plan?.plan?.data?.hospitalShortStay).replace('benefit for hospital stay less tan 23 hours. 2 payment man per Calander year', '')
  const emergencyRoomBenefit = (plan?.plan?.data?.emergencyRoomBenefit).split(' ')[0]

  return <Plan selected={!!selected}>
    <section className={styles.accidentPlan}>
      <div className={styles.FutureContainer}>
        <PlanTitle
          id={plan.plan.id}
          planName={plan.plan.name}
          carrier= {plan.plan.carrier}
          selected={selected}
          includesProsperBenefits={false}
          planType={GroupPlanType.criticalIllness}
          label={label}
          sbc={sbc}
        />
        {/* Article Box Start */}
        <article className={styles.custom_plan}>
          {/* Article Box Content */}
          <div className={styles.planBodyContainer}>
            <div className={`${styles.section} ${styles.pbContainer}`}>
              {breakdown()}
            </div>
            <BenifitAmountComp benifitAmount={hospitalConfinementBenefit} name={GlobalStringConstant[0].hospital_confinement_benefit} benifitLabel ={GlobalStringConstant[0].onceper_calendar_year}/>
            <div className={`${styles.section} ${styles.fourSpecs} ${styles.half_height}`}>
              <PeriodComp compName={GlobalStringConstant[0].emergency_room_benefit} daysOrWeak = {emergencyRoomBenefit} label={GlobalStringConstant[0].payment_max_per_calendar_year}/>
              <PeriodComp compName={GlobalStringConstant[0].hospital_short_stay} daysOrWeak = {hospitalShortStay} label={GlobalStringConstant[0].payment_max_per_calendar_year}/>
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

export default HospitalPlan
