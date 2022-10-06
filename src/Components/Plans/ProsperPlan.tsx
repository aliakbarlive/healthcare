import React from 'react'
import PlanTitle from './plan-subcomponents/PlanTitle'
import PlanBox from './plan-subcomponents/PlanBox'
import styles from './ProsperPlan.module.scss'
import eeAmountStyles from './plan-subcomponents/EEPremiumBreakdown.module.scss'
import { GroupPlanType, moneyString } from 'Utilities/Plans/ContributionCalculator'
import Plan, { PlanBody } from './plan-subcomponents/Plan'
import { useAppMode, AppMode } from 'Components/Stargate/TableOfContents'
import { classNames } from 'Utilities/etc'
import { Label } from 'Utilities/config'
import baseStyles from './plan-subcomponents/Plan.module.scss'

interface Props {
  isIncluded: boolean
  nonWaivedMemberCount: number
  label: Label
  prosperOnlyCost?: number
  selected?: boolean
  selectHandler?: () => void
}

const ProsperPlan: React.FC<Props> = props => {
  const isEmployer = useAppMode() === AppMode.employer
  return <Plan selected={!!props.selected}>
    <PlanTitle
      id='prosper'
      carrier='Prosper'
      planName='Prosper Benefits+'
      includesProsperBenefits={false}
      planNameSubtitle={<>Powered by <b>HealthAdvocate</b></>}
      planType={GroupPlanType.prosper}
      label={props.label}
      selectHandler={props.selectHandler}
      selected={props.selected}
    />
    <PlanBody>
      <div className={classNames(baseStyles.section, styles.prosperCostSection)}>
        <PlanBox className={styles.prosperBox}>
          <PlanBoxInner {...props} />
        </PlanBox>
      </div>
      <div className={classNames(baseStyles.section, styles.prosperDetailsSection)}>
        <PlanBox className={classNames(styles.prosperBox, styles.benefits)}>
          { props.isIncluded && <p><b>Prosper Benefits+</b> is a suite of services included with your plan at no cost to you. Use of Prosper Benefits+ is unlimited and will create future cost savings for you and your {isEmployer ? 'group' : 'family'}</p> }
          <p><b>Telehealth</b> is online or phone access to a medical professional anytime, anywhere</p>
          <p><b>Health Advocacy</b> taps experts who use compassion and hands-on support to help you navigate the complicated healthcare maze</p>
          <p><b>Medical Bill Saver</b> uses expert negotiators to lower your out-of-pocket costs on medical and dental bills</p>
          <p><b>Health Cost Estimator+</b> assists you in shopping around for care to create savings</p>
          <p><b>Work/Life Care Management</b> is your go-to resource for life&apos;s challenges</p>
        </PlanBox>
      </div>
    </PlanBody>
  </Plan>
}

const PlanBoxInner: React.FC<Props> = ({ isIncluded, nonWaivedMemberCount, ...props }) => {
  const mode = useAppMode()
  const prosperIncludedCost = props.prosperOnlyCost || 34.95
  const prosperOnlyCost = props.prosperOnlyCost || 25
  const employeesString = `${nonWaivedMemberCount} ${nonWaivedMemberCount > 1 ? 'employees' : 'employee'}`

  if (isIncluded) {
    const cost = moneyString(prosperIncludedCost * nonWaivedMemberCount)
    return <>
      <p className={styles.prosperIncluded}>Included</p>
      <p className={eeAmountStyles.afterContribution}>with your healthcare coverage</p>
      { mode === AppMode.employer
        ? <p className={eeAmountStyles.er} style={{ color: '#29B573' }}>You are saving <em>{cost}/mo</em><br/>for {employeesString}</p>
        : <p className={eeAmountStyles.er} style={{ color: '#29B573' }}>You are saving <em>{moneyString(prosperIncludedCost, 2)}/mo</em></p>
      }
    </>
  } else {
    if (mode === AppMode.employer) {
      const cost = moneyString(prosperOnlyCost * nonWaivedMemberCount).split('$')
      return <>
        <p className={eeAmountStyles.afterContribution}>Employer Pays</p>
        <div className={eeAmountStyles.ee} style={{ marginTop: '1rem' }}><span>$</span>{cost}<span>/mo</span></div>
        <p className={eeAmountStyles.afterContribution}>For {employeesString}</p>
      </>
    } else {
      return <>
        <div className={eeAmountStyles.ee}><span>$</span>{props.prosperOnlyCost}<span>/mo</span></div>
        <div className={eeAmountStyles.er} style={{ color: '#959595' }}>Prosper Benefits+ is included at <br/><b>$0/mo</b> with any medical plan</div>
      </>
    }
  }
}

export default ProsperPlan
