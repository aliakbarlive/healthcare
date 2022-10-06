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
import PeriodComp from './ERSupplementalSubComp/PeriodComp'
import { GlobalStringConstant } from 'GlobalStringConstant'
interface Props {
  plan: { rate: TieredRates, plan: SupplementalPlan, isRenewal: boolean }
  contributions: Contributions
  selected?: boolean
  label: Label
  showWeeklyPayments: boolean
}

const AccidentPlanComp: React.FC< EmployerProps & Props> = (props) => {
  const { plan, selected, label, showWeeklyPayments, contributions } = props
  const sbc = plan.plan.data.sbc
  const initialHospitalBenefit = plan.plan.data.initialAccidentHospitalizationBenefit.replace('hospital confinement', '')
  const accidentHospitalConfinementBenefit = plan.plan.data.accidentHospitalConfinementBenefit
  return <Plan selected={!!selected}>
    <section className={styles.accidentPlan}>
      <div className={styles.FutureContainer}>
        <PlanTitle
          id={plan.plan.id}
          planName={plan.plan.name}
          carrier={plan.plan.carrier}
          selected={selected}
          includesProsperBenefits={false}
          planType={GroupPlanType.accident}
          label={label}
          sbc= {sbc}
        />
        <article className={styles.custom_plan}>
          <div className={styles.planBodyContainer}>
            <div className={`${styles.section} ${styles.pbContainer}`}>
              {breakdown()}
            </div>
            <BenifitAmountComp name={GlobalStringConstant[0].accident_death_benefit} benifitAmount= {plan?.plan?.data?.accidentalDeathBenefit?.slice(1)} benifitLabel = {''}/>
            <div className={`${styles.section} ${styles.fourSpecs} ${styles.half_height}`}>
              <PeriodComp compName= {GlobalStringConstant[0].initial_accident_hospitalization_benefit} daysOrWeak = {initialHospitalBenefit} label={GlobalStringConstant[0].hospital_confinement}/>
              <PeriodComp compName= {GlobalStringConstant[0].accident_hospital_confinement} daysOrWeak = {accidentHospitalConfinementBenefit} label={' '}/>
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

export default AccidentPlanComp
