import React, { ReactElement } from 'react'
import styles from './FilterItem.module.scss'
import Tooltip from '../../ToolTip/Tooltip'
import { FundingType } from 'Components/Plans/plan-subcomponents/Plan.helpers'
import { FilterItem } from './PlansFilter'
import { PlanType } from 'Utilities/pharaoh.types'
import { SortingMethod } from 'Routes/shop/employer/plans'

interface Props {
  filters: FilterItem[]
  active: any[]
  callback: (value: any) => void
  type?: string
}

const OptionFilter: React.FC<Props> = ({ filters, active, callback }) => {
  return <div>
    {filters.map(go)}
  </div>

  function go(filter: FilterItem, index: number): ReactElement {
    const isActive = active.find(([, value]) => value === filter.value) !== undefined
    return <div key={index}>
      { tooltip() }
      <label data-tip data-for={filter.value} className={styles.radioContainer}>
        <input value={filter.value} onClick={() => callback(filter.value)} checked={isActive} type="radio" readOnly />
        {filter.label}
        <span className={styles.radio}></span>
      </label>
    </div>

    function tooltip() {
      const def = inner()
      return def && <Tooltip
        id={filter.value}
        place='right'
        offset={filter.value === PlanType.FixedBenefitNoNetwork ? { top: 8, left: 30 } : { top: 0, left: -20 }}
        delayHide={100}
      >
        <span>{ def }</span>
      </Tooltip>

      function inner() {
        switch (filter.value) {
        case SortingMethod.premium:
          return 'Premium is the cost of your insurance. This amount is what  an insurance carrier will charge you monthly for the policy you are purchasing.'
        case SortingMethod.deductible:
          return 'Deductible is the amount you pay for healthcare costs out of your own pocket before insurance begins covering costs.'
        case SortingMethod.oopMax:
          return 'Out of Pocket Maximum is the most you will ever have to pay out of your own pocket for annual healthcare.'
        case FundingType.mec:
          return `${FundingType.mec} plans provide simple to understand and affordable options. These plans cover everyday healthcare needs, laboratory services, imaging, and x-rays but may not cover hospital stays or care for chronic medical needs.`
        case FundingType.levelFunded:
          return `${FundingType.levelFunded} plans combine the cost savings and customization of a personalized plan with the financial safety and predictability of a ACA Community Rated plan.`
        case FundingType.fullyFunded:
          return 'In ACA Community Rates plans, the rates are set at the community level as dictated by the Affordable Care Act. Carriers cannot adjust rates or deny coverage based on pre-existing conditions.'
        case PlanType.PPO:
          return `A ${PlanType.PPO} (Preferred Provider Organization) has a network of discounted providers, but also allows the use of doctors outside of the network. These plans are more flexible, with members being able to utilize specialists within the network without referral, but also tend to be more expensive.`
        case PlanType.HMO:
          return `An ${PlanType.HMO} (Health Management Organization) plan covers services performed solely by providers in a network and generally requires a referral from a Primary Care Physician (PCP) for access to specialists. This tends to be a low cost system, but more restrictive than other plans.`
        case PlanType.EPO:
          return `An ${PlanType.EPO} (Exclusive Provider Organization), like an ${PlanType.HMO}, covers only in-network care. ${PlanType.EPO} networks are generally larger than those of an ${PlanType.HMO}.`
        case PlanType.POS:
          return `A ${PlanType.POS} (Point of Service) combines elements of an ${PlanType.HMO} and a ${PlanType.PPO}. This affordable plan provides out-of-network coverage with maximized discounts for in-network visits.`
        case PlanType.FixedBenefitNoNetwork:
          return 'Fixed Benefit plans are personalized and affordable health insurance. Unlike traditional insurance, which sits between the patient and doctor, these plans pay for care directly. As a result, you can see any doctor you choose, all coverage is transparent, and you can save up to 40% or more.'
        }
      }
    }
  }
}

export default OptionFilter
