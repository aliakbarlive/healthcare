import React from 'react'
import { Contributions, GroupPlanType, hasCustomPlanContributionFor } from 'Utilities/Plans/ContributionCalculator'
import { TieredRates } from 'Utilities/pharaoh.types'
import PlanTitle from '../plan-subcomponents/PlanTitle'
import { Label } from 'Utilities/config'
import * as dentalTypes from './index.helpers'
import D1 from './D1'
import D2 from './D2'
import { AppMode, useAppMode } from 'Components/Stargate/TableOfContents'
import * as api from 'Utilities/pharaoh'
import PremiumBreakdown, { EmployeeProps, EmployerProps } from '../plan-subcomponents/PremiumBreakdown'
import Plan, { PlanBody, PlanSpecsError } from '../plan-subcomponents/Plan'

interface Props {
  plan: { rate: TieredRates, plan: dentalTypes.default, isRenewal: boolean }
  contributions: Contributions
  selectHandler?(plan: dentalTypes.default): void
  selected?: boolean
  label: Label
  showWeeklyPayments: boolean
}

const DentalPlanComponent: React.FC<(EmployerProps | EmployeeProps) & Props> = (props) => {
  const { plan, contributions, selectHandler, selected, label, showWeeklyPayments } = props
  const isEmployer = useAppMode() === AppMode.employer
  const hasCustomPlanContribution = isEmployer && hasCustomPlanContributionFor(plan, contributions)

  const sbc = plan.plan.data.sbc || `https://s3.amazonaws.com/documents-pub.candor.insurance/sbc/${plan.plan.id.toLowerCase()}.pdf`

  return <Plan selected={!!selected}>
    <PlanTitle
      id={plan.plan.id}
      planName={plan.plan.name}
      carrier={plan.plan.carrier}
      customContributionApplied = { hasCustomPlanContribution }
      selectHandler={selectHandler && (() => selectHandler(plan.plan))}
      selected={selected}
      sbc={sbc}
      includesProsperBenefits={false}
      planType={GroupPlanType.dental}
      label={label}
    />
    <PlanBody>
      { breakdown() }
      { specs() }
    </PlanBody>
  </Plan>

  function breakdown() {
    const base = { plan, contributions, showWeeklyPayments }
    if (isEmployerProps(props)) {
      return <PremiumBreakdown {...base} members={props.members} />
    } else {
      return <PremiumBreakdown {...base} member={props.member} premium={props.premium}/>
    }
  }

  function specs() {
    const mode = isEmployerProps(props) ? AppMode.employer : AppMode.employee
    if (dentalTypes.isD1(plan.plan.data)) {
      return <D1 data={plan.plan.data} label={label}/>
    }
    if (dentalTypes.isD2(plan.plan.data)) {
      return <D2 data={plan.plan.data} mode={mode}/>
    }

    // If our types don't match at all :/
    api.v3.panic({ msg: `Data returned for Dental Plan ${plan.plan.id} doesn't match any known types` }).catch(console.error)
    return <PlanSpecsError/>
  }
}

function isEmployerProps(props: any): props is EmployerProps {
  return 'members' in props
}

export default DentalPlanComponent
