import React from 'react'
import baseStyles from '../plan-subcomponents/Plan.module.scss'
import styles from './index.module.scss'
import Plan, { PlanBody } from '../plan-subcomponents/Plan'
import { TieredRates } from 'Utilities/pharaoh.types'
import PlanTitle from '../plan-subcomponents/PlanTitle'
import { Contributions, GroupPlanType, hasCustomPlanContributionFor } from 'Utilities/Plans/ContributionCalculator'
import { startCase } from 'lodash'
import { Label } from 'Utilities/config'
import VisionPlan from 'Components/Plans/VisionPlan/index.helpers'
import PremiumBreakdown, { EmployeeProps, EmployerProps, isEmployerProps } from '../plan-subcomponents/PremiumBreakdown'
import { AppMode, useAppMode } from 'Components/Stargate/TableOfContents'

interface Props {
  plan: { rate: TieredRates, plan: VisionPlan, isRenewal: boolean}
  contributions: Contributions
  selectHandler?(plan: VisionPlan): void
  selected?: boolean
  label: Label
  showWeeklyPayments: boolean
}

enum VisionDataKeys {
  visionExam = 'visionExam',
  frameAllowance = 'frameAllowance',
  contactFittingAndEvaluation = 'contactFittingAndEvaluation',
}

const VisionPlanComponent: React.FC<(EmployerProps | EmployeeProps) & Props> = props => {
  const { plan, contributions, selectHandler, selected, label, showWeeklyPayments } = props
  const isEmployer = useAppMode() === AppMode.employer
  const hasCustomPlanContribution = isEmployer && hasCustomPlanContributionFor(plan, contributions)
  const data = massagedData()

  const sbc = plan.plan.data.sbc || `https://s3.amazonaws.com/documents-pub.candor.insurance/sbc/${plan.plan.id.toLowerCase()}.pdf`

  return <Plan selected={!!props.selected}>
    <PlanTitle
      id={plan.plan.id}
      planName={plan.plan.name}
      carrier={plan.plan.carrier}
      customContributionApplied={hasCustomPlanContribution}
      selectHandler={selectHandler && (() => selectHandler(plan.plan))}
      selected={selected}
      sbc={sbc}
      includesProsperBenefits={false}
      planType={GroupPlanType.vision}
      label={label}
    />
    <PlanBody>
      { breakdown() }
      <div className={`${baseStyles.section} ${styles.specs}`}>
        <table className={baseStyles.box}>
          <thead>
            <tr>
              <th></th>
              <th>In-Network</th>
              <th>Frequency</th>
            </tr>
          </thead>
          <tbody>
            { Object.keys(data).map(key => {
              const { inNetwork, frequency } = data[key as VisionDataKeys]
              return <tr key={key}>
                <td><div>
                  { key === VisionDataKeys.contactFittingAndEvaluation
                    ? <>Contact Lenses</>
                    : startCase(key)
                  }
                </div></td>
                <td>{inNetwork || '—'}</td>
                <td>{frequency ? `${frequency} months` : '—'}</td>
              </tr>
            })}
          </tbody>
        </table>
      </div>
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

  function massagedData(): {[key in VisionDataKeys]: { inNetwork?: string, outOfNetwork?: string, frequency?: string }} {
    const { data } = plan.plan
    return {
      visionExam: {
        frequency: data.comprehensiveVisionExamFrequencyInMonths,
        inNetwork: data.comprehensiveVisionExamInNetwork,
        outOfNetwork: data.comprehensiveVisionExamOutOfNetwork
      },
      frameAllowance: {
        frequency: data.framesAllowanceFrequencyInMonths,
        inNetwork: data.framesAllowanceInNetwork,
        outOfNetwork: data.framesAllowanceOutOfNetwork
      },
      contactFittingAndEvaluation: {
        frequency: data.contactLensesFrequencyInMonths,
        inNetwork: data.contactLensesInNetwork,
        outOfNetwork: data.contactLensesOutOfNetwork
      }
    }
  }
}

export default VisionPlanComponent
