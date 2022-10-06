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

interface Props {
  plan: { rate: TieredRates, plan: SupplementalPlan, isRenewal: boolean }
  selected?: boolean
  label: Label
  contributions: Contributions
  showWeeklyPayments: boolean
}

const CancerPlanComp: React.FC<EmployerProps & Props> = (props) => {
  const { plan, selected, label, contributions, showWeeklyPayments } = props
  const sbc = plan.plan.data.sbc

  return <Plan selected={!!selected}>
    <section className={styles.cancerPlans}>
      <div className={styles.FutureContainer}>
        <PlanTitle
          id={plan.plan.id}
          planName={plan.plan.name}
          carrier={plan.plan.carrier}
          selected={selected}
          includesProsperBenefits={false}
          planType={GroupPlanType.cancer}
          label={label}
          sbc={sbc}
        />
        <article className={styles.custom_plan}>
          <div className={styles.planBodyContainer}>
            <div className={`${styles.section} ${styles.pbContainer}`}>
              {breakdown()}
            </div>
            <div className={`${styles.section} ${styles.custom_specs}`}>
              <table className={styles.box}>
                <thead>
                  <tr>
                    <th />
                    <th />
                    <th>{GlobalStringConstant[0].benefit_amout}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <div className={styles.benefit_amount_col}>{GlobalStringConstant[0].initial_diagnosis_benift}</div>
                    </td>
                    <td />
                    <td>{plan.plan.data.benefitAmount.split(' ')[0]}</td>
                  </tr>
                  <tr>
                    <td>
                      <div className={styles.benefit_amount_col}>Stem Cell &amp; Bone Marrow Transplant</div>
                    </td>
                    <td />
                    <td>{plan.plan.data.stemCellAndBoneMarrowTransplant}</td>
                  </tr>
                  <tr>
                    <td>
                      <div className={styles.benefit_amount_col}>{GlobalStringConstant[0].hospice_care}</div>
                    </td>
                    <td />
                    <td>{plan.plan.data.hospiceCare}</td>
                  </tr>
                  <tr>
                    <td>
                      <div className={styles.benefit_amount_col}>{GlobalStringConstant[0].surgical_anesthesia}</div>
                    </td>
                    <td />
                    <td>{plan.plan.data.surgicalAndAnesthesia}</td>
                  </tr>
                </tbody>
              </table>
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

export default CancerPlanComp
