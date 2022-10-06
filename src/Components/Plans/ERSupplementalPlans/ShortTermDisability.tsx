import React from 'react'
import { Contributions, GroupPlanType } from 'Utilities/Plans/ContributionCalculator'
import { TieredRates } from 'Utilities/pharaoh.types'
import PlanTitle from '../plan-subcomponents/PlanTitle'
import { Label } from 'Utilities/config'
import styles from './index.module.scss'
import Plan from '../plan-subcomponents/Plan'
import SupplementalPlan from '../SupplementalPlan/index.helpers'
import PeriodComp from './ERSupplementalSubComp/PeriodComp'
import { GlobalStringConstant } from 'GlobalStringConstant'
import Tooltip from 'Components/Stargate/ToolTip/Tooltip'

interface Props {
  plan: { rate: TieredRates, plan: SupplementalPlan, isRenewal: boolean }
  contributions: Contributions
  selected?: boolean
  label: Label
}

const ShortTermDisability: React.FC<Props> = (props) => {
  const { plan, selected, label } = props
  const sbc = plan.plan.data.sbc
  const eliminationPeriodData = plan?.plan?.data?.eliminationPeriod
  const accidentPeriod = eliminationPeriodData.split(' ').slice(0, 2).join(' ')
  const sicknessPeriod = eliminationPeriodData.split(' ').slice(4, 6).join(' ')
  return <Plan selected={!!selected}>
    <section className={styles.accidentPlan}>
      <div className={styles.FutureContainer}>
        <article className={styles.custom_plan}>
        </article>
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
        <article className={styles.custom_plan}>
          <div className={styles.planBodyContainer}>
            <div className={styles.planBodyContainer}>
              <div className={`${styles.section} ${styles.two_grid_box} ${styles.half_height}`}>
                <PeriodComp compName= {GlobalStringConstant[0].benefit_amout} daysOrWeak= {GlobalStringConstant[0].depends_on_age_income} label = {GlobalStringConstant[0].please_refer_to_plan_detail} />
                <PeriodComp compName= {GlobalStringConstant[0].benefit_period} daysOrWeak= {plan?.plan?.data?.benefitPeriod} label={''} />
              </div>
              <div className={`${styles.section} ${styles.two_grid_box} ${styles.half_height}`}>
                <PeriodComp compName= {GlobalStringConstant[0].benefit_payment} daysOrWeak= {plan?.plan?.data?.monthlyBenefitPayment} label={GlobalStringConstant[0].monthly} />
                <table className={styles.box}>
                  <thead>
                    <tr>
                      <div className={styles.STDPlansTooltip}>
                        <th data-tip data-for='STDPlansTooltip' colSpan={3}>{GlobalStringConstant[0].waiting_period}</th>
                        <Tooltip
                          id='STDPlansTooltip'
                          place={'right'}
                          delayHide={100}
                          backgroundColor='linear-gradient(135deg, #0B4BF7 0%, #8B17BB 100%)'
                          textColor='#6925cb'
                        >
                          <span>Also known as Exclusion Period. The waiting period is the number of days before your coverage will begin.</span>
                        </Tooltip>
                      </div>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className={styles.two_box_table}>
                      <td className={styles.lump_sum}><small>{GlobalStringConstant[0].sickness}</small><span className={styles.stdPeriod}>{sicknessPeriod}</span></td>
                      <td className={styles.lump_sum}><small>{GlobalStringConstant[0].accident}</small><span className={styles.stdPeriod}>{accidentPeriod}</span></td>
                      <td />
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </article>
      </div>
    </section>
  </Plan>
}

export default ShortTermDisability
