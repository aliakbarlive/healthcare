import React from 'react'
import MedicalPlanAdditionalSpecs from './plan-subcomponents/MedicalPlanAdditionalSpecs'
import { Contributions, GroupPlanType } from 'Utilities/Plans/ContributionCalculator'
import Plan, { PlanBody } from './plan-subcomponents/Plan'
import PlanTitle from './plan-subcomponents/PlanTitle'
import { MedicalPlan } from 'Utilities/pharaoh.types'
import { Carriers } from './plan-subcomponents/Plan.helpers'
import { ContributionSplit } from 'Utilities/Hooks/useStargate'
import { Label } from 'Utilities/config'
import { useToggle } from 'react-use'
import PremiumBreakdown, { EmployeeProps } from './plan-subcomponents/PremiumBreakdown'

interface Props {
  plan: MedicalPlan
  contributions: Contributions
  splits: ContributionSplit[]
  selected?: boolean
  selectHandler?: (plan: MedicalPlan) => void
  label: Label
  showWeeklyPayments: boolean
}

const EEMedicalPlan: React.FC<EmployeeProps & Props> = ({ plan, selected, selectHandler, ...props }) => {
  const isLimitedPlan = plan.carrier === Carriers['Sidecar Health']
  const [showLimitedPlanInfo, setShowLimitedPlanInfo] = useToggle(false)
  const [showSBC, toggleShowSBC] = useToggle(false)

  return <Plan selected={selected || false}>
    <PlanTitle
      {...plan}
      planName={plan.name}
      includesProsperBenefits
      selectHandler={selectHandler ? () => selectHandler(plan) : undefined}
      selected={selected}
      planType={GroupPlanType.medical}
      isLimitedPlan={isLimitedPlan}
      label={props.label}
      infoHandler={setShowLimitedPlanInfo}
      showLimitedPlanInfo={showLimitedPlanInfo}
      showSBC={showSBC}
      toggleShowSBC={toggleShowSBC}
    />
    <PlanBody>
      <PremiumBreakdown plan={plan} contributions={props.contributions} splits={props.splits} showWeeklyPayments={props.showWeeklyPayments} member={props.member} premium={props.premium} />
      <MedicalPlanAdditionalSpecs plan={plan} isCollapsed={true} isLimitedPlan={isLimitedPlan} infoHandler={setShowLimitedPlanInfo} showLimitedPlanInfo={showLimitedPlanInfo} toggleShowSBC={toggleShowSBC} />
    </PlanBody>
  </Plan>
}

export default EEMedicalPlan
