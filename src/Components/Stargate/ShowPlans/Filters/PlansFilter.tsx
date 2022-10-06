import React from 'react'
import styles from './PlansFilter.module.scss'
import { PlansMeta, SortingMethod } from 'Routes/shop/employer/plans'
import { FundingType } from 'Components/Plans/plan-subcomponents/Plan.helpers'
import { $enum } from 'ts-enum-util'
import { PlanType } from 'Utilities/pharaoh.types'
import { moneyNumber } from 'Utilities/Plans/ContributionCalculator'
import OptionFilter from './OptionFilter'
import RangeFilter from './RangeFilter'
import Tooltip from 'Components/Stargate/ToolTip/Tooltip'

export enum FilterType {
  sort = 'sort',
  premium = 'premiums',
  deductible = 'deductibles',
  fundingType = 'fundingTypes',
  planType = 'planTypes',
  oop = 'oopMaxes',
  carrier = 'carriers'
}

export interface FilterItem {
  value: any
  label: string
}

interface Props {
  meta: PlansMeta
  filteredPlansCount?: number
  activeFilters: [FilterType, any][]
  callback: (type: FilterType, value: any) => void
  plansCount: number
}

// Filter side bar component/container
const PlansFilter: React.FC<Props> = ({ meta, ...props }) => {
  const { filteredPlansCount, plansCount, activeFilters } = props

  return <div className={styles.container}>
    {summary()}
    {$enum(FilterType).map(type => {
      const filters = filtersFor(type)
      if (!filters.length) { return <></> }
      return <div className={styles.filterItemContainer} key={type}>
        <p data-tip data-for={type} className={styles.filterName}>{titleForFilterType(type)}</p>
        {tooltipForFilterType(type)}
        {render(type, filters)}
      </div>
    }
    )}
  </div>

  function render(type: FilterType, filters: FilterItem[]) {
    const callback = (value: any) => props.callback(type, value)
    const active = activeFilters.filter(([tt]) => type === tt)
    switch (type) {
    case FilterType.sort:
      return <OptionFilter callback={callback} active={active} filters={filters} type={type}/>
    case FilterType.premium:
    case FilterType.deductible:
    case FilterType.oop:
      return <RangeFilter callback={callback} active={active} filters={filters}/>
    case FilterType.carrier:
    case FilterType.planType:
      return <OptionFilter callback={callback} active={active} filters={filters}/>
    case FilterType.fundingType:
      return <OptionFilter callback={callback} active={active} filters={filters} type={type}/>
    }
  }

  function summary() {
    if (meta && plansCount) {
      return <p>Showing <span>{filteredPlansCount} of {plansCount}</span> plan{plansCount === 1 ? '' : 's'}</p>
    }
    return <p>&nbsp;</p>
  }

  function getRanges(max: number) {
    const numberOfRanges = 4
    const granularitySchedule = [
      {
        value: 100,
        scale: 10
      },
      {
        value: 1000,
        scale: 50
      },
      {
        value: 10000,
        scale: 100
      },
      {
        value: Infinity,
        scale: 1000
      }
    ]

    let granularity: number | undefined, i: number
    for (i = 0; i < granularitySchedule.length; i++) {
      if (granularitySchedule[i].value > max) {
        granularity = granularitySchedule[i].scale
        break
      }
    }

    if (granularity === undefined || max === 0) return []
    const chunk = max / numberOfRanges
    const rangeMagnitude = Math.round(chunk / granularity) * granularity
    const ranges = []
    for (i = 0; i < numberOfRanges; i++) {
      const min = i * rangeMagnitude
      const max = i === numberOfRanges - 1 ? null : (i + 1) * rangeMagnitude
      ranges.push({
        min,
        max
      })
    }
    return ranges
  }

  function filtersFor(type: FilterType): FilterItem[] {
    switch (type) {
    case FilterType.sort:
      return $enum(SortingMethod).map(value => ({
        value,
        label: titleForSortingMethod(value)
      }))
    case FilterType.deductible:
    case FilterType.oop:
    case FilterType.premium: {
      const maxim = moneyNumber(meta[key()])
      return getRanges(maxim).map(({ min, max }) => {
        if (max === Infinity || max === null) {
          return {
            label: `$${min} and above`,
            value: `${min}..${maxim}`
          }
        } else {
          return {
            label: `$${min} – $${max}`,
            value: `${min}..${max}`
          }
        }
      })
    }
    case FilterType.carrier:
      return meta.carriers.sort().map(value => ({
        value,
        label: value
      }))
    case FilterType.fundingType:
      return $enum(FundingType).map(value => ({
        value,
        label: fundingTypeLabel(value)
      }))
    case FilterType.planType:
      return $enum(PlanType).map(value => ({
        value,
        label: planTypeLabel(value)
      }))
    }

    function key() {
      switch (type) {
      case FilterType.deductible:
        return 'largestDeductible'
      case FilterType.oop:
        return 'largestOOPMax'
      case FilterType.premium:
        return 'largestPremium'
      default:
        throw new Error('State machine violation')
      }
    }
  }
}

function titleForFilterType(type: FilterType): string {
  switch (type) {
  case FilterType.sort:
    return 'Sort by Lowest'
  case FilterType.premium:
    return 'Premium - Individual'
  case FilterType.deductible:
    return 'Deductible - Individual'
  case FilterType.fundingType:
    return 'Policy Type'
  case FilterType.planType:
    return 'Network Type'
  case FilterType.oop:
    return 'Out of Pocket Max'
  case FilterType.carrier:
    return 'Carrier/Brand'
  }
}

function tooltipForFilterType(type: FilterType) {
  const def = inner()
  return def && <Tooltip
    id={type}
    place='right'
    offset={{ top: 0, left: -20 }}
    delayHide={100}
  >
    <span>{ def }</span>
  </Tooltip>

  function inner() {
    switch (type) {
    case FilterType.premium:
      return 'Premium is the cost of your insurance. This amount is what  an insurance carrier will charge you monthly for the policy you are purchasing.'
    case FilterType.deductible:
      return 'Deductible is the amount you pay for healthcare costs out of your own pocket before insurance begins covering costs.'
    case FilterType.fundingType:
      return 'Some insurance plans offer predetermined rates and plan designs while others take into account the overall health of the group, resulting in more personalized pricing and plans.'
    case FilterType.planType:
      return 'Each type of network offers different options to access care. The insurance network or service providers associated with your plan can make a difference, as it may limit which doctors you can visit.'
    case FilterType.oop:
      return 'Out of Pocket Maximum is the most you will ever have to pay out of your own pocket for annual healthcare.'
    case FilterType.carrier:
      return 'This is the company that provides or administrates your insurance coverage.'
    }
  }
}

function titleForSortingMethod(type: SortingMethod): string {
  switch (type) {
  case SortingMethod.premium:
    return 'Premium'
  case SortingMethod.oopMax:
    return 'Out of Pocket Max'
  case SortingMethod.deductible:
    return 'Deductible'
  }
}

function planTypeLabel(type: PlanType): string {
  switch (type) {
  case PlanType.FixedBenefitNoNetwork: return 'Fixed benefit with no network'
  default: return type
  }
}

function fundingTypeLabel(type: FundingType): string {
  switch (type) {
  case FundingType.fullyFunded: return 'ACA Community Rated'
  default: return type
  }
}

export default PlansFilter
