
import React, { useState } from 'react'
import styles from './EmployerPlansBreakdown.module.scss'
import { Table, Alignment, SortDirection } from '../Rudimentary/Table'
import { massagedPlanName, getPlanIDFrom, extractPlanNameAndCarrier } from '../Plans/plan-subcomponents/Plan.helpers'
import { PlanDetailsModal } from '../Plans/plan-subcomponents/PlanTitle'
import { useToggle } from 'react-use'
import ContributionsCalculator, { moneyString, Contributions, PlanUnion, GroupPlanType, MemberPlus, isMedical } from 'Utilities/Plans/ContributionCalculator'
import { GAButton } from 'Components/Tracking'
import { ContributionSplit } from 'Utilities/Hooks/useStargate'
import { reduce } from 'lodash'
import { Tier } from 'Utilities/pharaoh.types'

interface PlansBreakdown {
  id: string
  carrier: string
  plan: string
  employerCost: {
    [Tier.individual]: number
    [Tier.singleParent]: number
    [Tier.couple]: number
    [Tier.family]: number
  }
  employeeCost: {
    [Tier.individual]: number
    [Tier.singleParent]: number
    [Tier.couple]: number
    [Tier.family]: number
  }
  enrollees: number
  sbc?: string
  policyId?: string
}

interface Props {
  type: GroupPlanType
  plans: PlanUnion[]
  contributions: Contributions
  splits?: ContributionSplit[]
  reportFileBasename?: string
  members: MemberPlus[]
}

const EmployerPlansBreakdown: React.FC<Props> = ({ members, type, ...props }) => {
  const [showSBC, toggleShowSBC] = useToggle(false)
  const [selectedPlan, setSelectedPlan] = useState<PlansBreakdown>()

  const calc = new ContributionsCalculator(props.plans, props.contributions, props.splits || [], members, 2)
  const data: PlansBreakdown[] = props.plans.map(p => {
    const { name, carrier } = extractPlanNameAndCarrier(p)
    const id = getPlanIDFrom(p)
    const membersWithPlan = members.filter(m => {
      const p = m[type]
      if (!p || typeof p === 'string') return false
      return getPlanIDFrom(p) === id
    })

    let premiums
    if (type === GroupPlanType.medical || !props.contributions.baseContributions.allAncillary) {
      premiums = {
        er: {
          [Tier.individual]: calc.avgPremiumsForPlanForTier(p, Tier.individual).er,
          [Tier.singleParent]: calc.avgPremiumsForPlanForTier(p, Tier.singleParent).er,
          [Tier.couple]: calc.avgPremiumsForPlanForTier(p, Tier.couple).er,
          [Tier.family]: calc.avgPremiumsForPlanForTier(p, Tier.family).er
        },
        ee: {
          [Tier.individual]: calc.avgPremiumsForPlanForTier(p, Tier.individual).ee,
          [Tier.singleParent]: calc.avgPremiumsForPlanForTier(p, Tier.singleParent).ee,
          [Tier.couple]: calc.avgPremiumsForPlanForTier(p, Tier.couple).ee,
          [Tier.family]: calc.avgPremiumsForPlanForTier(p, Tier.family).ee
        }
      }
    } else {
      premiums = reduce(membersWithPlan.map(m => ({ premium: calc.premiumsFor(m)?.[type], tier: m.tier })), (sum, next) => {
        sum.er[next.tier] += next.premium?.er || 0
        sum.ee[next.tier] += next.premium?.ee || 0
        return sum
      }, {
        er: {
          [Tier.individual]: 0,
          [Tier.singleParent]: 0,
          [Tier.couple]: 0,
          [Tier.family]: 0
        },
        ee: {
          [Tier.individual]: 0,
          [Tier.singleParent]: 0,
          [Tier.couple]: 0,
          [Tier.family]: 0
        }
      })
    }

    return {
      id,
      carrier,
      plan: name,
      sbc: isMedical(p) ? p.sbc : `https://s3.amazonaws.com/documents-pub.candor.insurance/sbc/${id.toLowerCase()}.pdf`,
      enrollees: membersWithPlan.length,
      employerCost: premiums.er,
      employeeCost: premiums.ee,
      policyId: p.policyId
    }
  })

  return <>
    { selectedPlan &&
      <PlanDetailsModal
        id={selectedPlan.id}
        sbc={selectedPlan.sbc}
        showSBC={showSBC}
        toggleShowSBC={toggleShowSBC}
        carrier={selectedPlan.carrier}
        planName={selectedPlan.plan}/>
    }
    <Table
      data={data}
      order={['plan', 'policyId', 'enrollees', 'employerCost', 'employeeCost', 'sbc']}
      content={(key, value, row) => {
        switch (key) {
        case 'plan':
          return <><b>{row.carrier}</b> {massagedPlanName(value, row.carrier)}</>
        case 'policyId':
          return row.policyId || '-'
        case 'employerCost':
        case 'employeeCost':
          return <table>
            <tr><th>EE</th><td>{value.individual ? moneyString(value.individual) : '—'}</td></tr>
            <tr><th>EE + SP</th><td>{value.couple ? moneyString(value.couple) : '—'}</td></tr>
            <tr><th>EE + CH</th><td>{value.singleParent ? moneyString(value.singleParent) : '—'}</td></tr>
            <tr><th>F</th><td>{value.family ? moneyString(value.family) : '—'}</td></tr>
          </table>
        case 'sbc':
          return <GAButton analytics={`Details (${EmployerPlansBreakdown.name})`} className={styles.details} onClick={() => planSelectAction(row)}>SBC</GAButton>
        }
      }}
      heading={key => {
        switch (key) {
        case 'policyId': return 'Policy #'
        case 'sbc': return 'SBC'
        }
      }}
      width={key => {
        switch (key) {
        case 'policyId':
        case 'enrollees':
        case 'sbc':
          return '100px'
        case 'employerCost':
        case 'employeeCost':
          return '160px'
        }
      }}
      reportFileBasename={props.reportFileBasename}
      selectAction={(row) => planSelectAction(row)}
      selectable={(row) => !!row.sbc}
      sortable={['plan', 'enrollees', 'employerCost', 'employeeCost']}
      defaultSortDirection={key => {
        switch (key) {
        case 'plan':
        case 'employerCost':
        case 'employeeCost':
          return SortDirection.ascending
        default:
          return SortDirection.descending
        }
      }}
      defaultSort='employerCost'
      alignment={key => {
        switch (key) {
        case 'sbc':
          return Alignment.center
        default:
          return Alignment.left
        }
      }}
    />
  </>

  function planSelectAction(plan?: PlansBreakdown) {
    setSelectedPlan(plan)
    toggleShowSBC(true)
  }
}

export default EmployerPlansBreakdown
