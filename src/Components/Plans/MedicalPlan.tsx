import React, { ReactElement, useRef, useState, useEffect } from 'react'
import PlanTitle from './plan-subcomponents/PlanTitle'
import PlanSnapshotSection from './plan-subcomponents/PlanSnapshotSection'
import PlanBox from './plan-subcomponents/PlanBox'
import MedicalPlanAdditionalSpecs from './plan-subcomponents/MedicalPlanAdditionalSpecs'
import styles from './MedicalPlan.module.css'
import ContributionsCalculator, { Contributions, GroupPlanType, moneyString, moneyWeekly } from 'Utilities/Plans/ContributionCalculator'
import Plan, { PlanBody } from './plan-subcomponents/Plan'
import { fundingTypeFor, Carriers } from './plan-subcomponents/Plan.helpers'
import { MedicalPlan, Tier } from 'Utilities/pharaoh.types'
import { useToggle } from 'react-use'
import { Member, ContributionSplit } from 'Utilities/Hooks/useStargate'
import ReactDOM from 'react-dom'
import { Label } from 'Utilities/config'
import { $enum } from 'ts-enum-util'
import { classNames } from 'Utilities/etc'

interface Props {
  plan: MedicalPlan
  selected?: boolean
  selectedForRemoval?: boolean
  selectHandler?: (plan: MedicalPlan) => void
  deleteHandler?: (planID: string) => void
  members: Member[]
  splits: ContributionSplit[]
  contributions: Contributions
  showWeeklyPayments: boolean
  label: Label
}

const MedicalPlanComponent: React.FC<Props> = ({ showWeeklyPayments, plan, selectHandler, splits, ...props }) => {
  const [isCollapsed, toggleCollapsed] = useToggle(true)
  const [medicalPremiumTypeContainerWidth, setMedicalPremiumTypeContainerWidth] = useState(0)
  const [medicalPremiumBreakdownContainerWidth, setMedicalPremiumBreakdownContainerWidth] = useState(0)
  const [medicalTierContainerWidth, setMedicalTierContainerWidth] = useState(0)
  const isLimitedPlan = plan.carrier === Carriers['Sidecar Health']
  const [showLimitedPlanInfo, setShowLimitedPlanInfo] = useToggle(false)
  const [showSBC, toggleShowSBC] = useToggle(false)
  const ref = useRef<HTMLElement>()

  // FIXME inefficient to do this *every* render
  useEffect(() => {
    updateTableColumnWidth.bind(window)(false)
    window.addEventListener('resize', updateTableColumnWidth)
    return () => window.removeEventListener('resize', updateTableColumnWidth)
  })

  const calc = new ContributionsCalculator([plan], props.contributions, splits, props.members, 0, selectHandler ? props.selected : true)
  const fundingType = fundingTypeFor(plan)

  return <>
    <Plan selected={props.selected}>
      <PlanTitle
        {...plan}
        planName={plan.name}
        customContributionApplied={calc.hasCustomPlanContributionFor(plan)}
        includesProsperBenefits
        fundingType={fundingType}
        selectHandler={selectHandler && (() => selectHandler(plan))}
        selected={props.selected}
        removeHandler={props.deleteHandler && onRemoveChange}
        selectedForRemoval={props.selectedForRemoval}
        isLimitedPlan={isLimitedPlan}
        infoHandler={setShowLimitedPlanInfo}
        showLimitedPlanInfo={showLimitedPlanInfo}
        showSBC={showSBC}
        toggleShowSBC={toggleShowSBC}
        planType={GroupPlanType.medical}
        label={props.label}
      />
      <PlanBody fundingType={fundingType} selectedForRemoval={props.selectedForRemoval}>{medicalSnapshot()}</PlanBody>
    </Plan>
  </>

  function collapse() {
    ReactDOM.unstable_batchedUpdates(() => {
      toggleCollapsed()
      updateTableColumnWidth.bind(window)(true)
    })
  }

  function updateTableColumnWidth(this: Window, onChange: any) {
    if (!ref.current) return

    const width = ref.current.getBoundingClientRect().width

    // Padded to avoid white space due to rounding. It is actually 24px
    const paddedExpandButtonWidth = 25
    const planContainerPadding = 20
    const collapsedTablePercentage = 0.4
    // First column percentage when table is collapsed
    const premiumTypeColumnPercentage = 0.5
    // Second column percentage when table is collapsed
    const premiumBreakdownColumnPercentage = 0.5

    const snapshotContainerWidth = width + planContainerPadding
    const planSnapshotSectionWidth = snapshotContainerWidth * collapsedTablePercentage - planContainerPadding
    const premiumTableWithoutButtonWidth = planSnapshotSectionWidth - paddedExpandButtonWidth

    if (onChange) {
      /* This is to avoid the one pixel stutter when toggling the collapse
        because pixels can't be .2423424 and is also why we do Math.round() */
      if (!isCollapsed) {
        const tierWidth = (width - medicalPremiumTypeContainerWidth - medicalPremiumBreakdownContainerWidth - paddedExpandButtonWidth) / 3
        setMedicalTierContainerWidth(tierWidth)
      }
    } else if (isCollapsed) {
      // Width - expand button width * column width percentage

      ReactDOM.unstable_batchedUpdates(() => {
        setMedicalPremiumTypeContainerWidth(Math.round((width - paddedExpandButtonWidth) * premiumTypeColumnPercentage))
        setMedicalPremiumBreakdownContainerWidth(Math.round((width - paddedExpandButtonWidth) * premiumBreakdownColumnPercentage))
        setMedicalTierContainerWidth(0)
      })
    } else {
      const premiumTypeWidth = Math.round(premiumTableWithoutButtonWidth * premiumTypeColumnPercentage)
      const premiumBreakdownWidth = Math.round(premiumTableWithoutButtonWidth * premiumBreakdownColumnPercentage)
      const medicalTierContainerWidth = (width - premiumTypeWidth - premiumBreakdownWidth - paddedExpandButtonWidth) / 3

      ReactDOM.unstable_batchedUpdates(() => {
        setMedicalPremiumTypeContainerWidth(premiumTypeWidth)
        setMedicalPremiumBreakdownContainerWidth(premiumBreakdownWidth)
        setMedicalTierContainerWidth(medicalTierContainerWidth)
      })
    }
  }

  function medicalSnapshot() {
    const premiums = getPremiums()

    const conditionalStyle = isCollapsed ? { height: '25%' } : undefined

    return <>
      <PlanSnapshotSection sectionWidth={isCollapsed ? 0.4 : 1}>
        <PlanBox height={ref.current?.getBoundingClientRect().height || 0} className={styles.medicalTableBox} refCallback={(rof: HTMLElement) => { ref.current = rof }}>
          <div className={styles.medicalPremiumTypeContainer} style={{ width: medicalPremiumTypeContainerWidth }}>
            <div style={conditionalStyle}>
              Individual{calc.numberOf(Tier.individual) > 1 ? 's' : ''}<br/>
              <span>cost {planPaymentsPeriod()}</span>
            </div>
            <div style={conditionalStyle}>Couples<br/><span>cost {planPaymentsPeriod()}</span></div>
            <div style={conditionalStyle}>Employee/Child<br/><span>cost {planPaymentsPeriod()}</span></div>
            <div style={conditionalStyle}>Family<br/><span>cost {planPaymentsPeriod()}</span></div>
            <div style={{ opacity: isCollapsed ? 0 : 1 }}>Total<br/><span>cost {planPaymentsPeriod()}</span></div>
          </div>
          <div className={styles.medicalPremiumBreakdownContainer} style={{ width: medicalPremiumBreakdownContainerWidth }}>
            { $enum(Tier).map(t =>
              <div key={t} style={conditionalStyle}>
                {/* Extra Div to make mint cell bg */}
                <div className={styles.premiumLabel}>
                  {planCostString(plan.premium.employee[t])}
                </div>
              </div>)
            }
            <div key='total'>
              <div style={{ opacity: isCollapsed ? 0 : 1 }} className={styles.premiumLabel}></div>
            </div>
          </div>
          {tray()}
          <div className={styles.medicalExpandContainer}>
            <button className={isCollapsed ? styles.medicalExpandCollapsedCarrot : styles.medicalExpandShownCarrot} onClick={collapse}>
              <div>Click {isCollapsed ? 'for' : 'to hide'} more information</div>
            </button>
          </div>
        </PlanBox>
      </PlanSnapshotSection>
      <MedicalPlanAdditionalSpecs
        sectionWidth={isCollapsed ? 0.6 : 1}
        isCollapsed={isCollapsed}
        plan={plan}
        isLimitedPlan={isLimitedPlan}
        infoHandler={setShowLimitedPlanInfo}
        showLimitedPlanInfo={showLimitedPlanInfo}
        toggleShowSBC={toggleShowSBC}
      />
    </>

    function tray() {
      if (isCollapsed) return null

      let numberOfPlans = 0
      let total = 0

      $enum(Tier).forEach(t => {
        const num = calc.numberOf(t, undefined, false)
        numberOfPlans += num
        if (num > 0) total += premiums.total[t].er
      })

      return <>
        <div style={{ width: medicalTierContainerWidth, opacity: isCollapsed ? 0 : 1, transition: 'all .25s linear' }}>
          { $enum(Tier).map(t =>
            <div className={classNames(t === Tier.individual && styles.premiumTypeHeader)} key={t}>
              { t === Tier.individual ? <p>Employer Cost</p> : <></>}
              <div>{moneyify(premiums.avg[t].er)}</div>
            </div>
          )}
        </div>
        <div style={{ width: medicalTierContainerWidth, opacity: isCollapsed ? 0 : 1, transition: 'all .25s linear' }}>
          { $enum(Tier).map(t =>
            <div className={classNames(t === Tier.individual && styles.premiumTypeHeader)} key={t}>
              { t === Tier.individual ? <p>Employee Cost</p> : <></>}
              <div>{moneyify(premiums.avg[t].ee)}</div>
            </div>
          )}
        </div>
        <div className={styles.premiumTotalColumn} style={{ width: medicalTierContainerWidth, opacity: isCollapsed ? 0 : 1, transition: 'all .25s linear' }}>
          { $enum(Tier).map(t => {
            const numOfPlans = calc.numberOf(t, undefined, false)
            return <div className={classNames(t === Tier.individual && styles.premiumTypeHeader)} key={t}>
              { t === Tier.individual ? <p>Total</p> : <></>}
              <div>
                <p>{`( for ${numOfPlans} ${numOfPlans === 1 ? 'plan' : 'plans'} )`}</p>
                <div>{moneyify(premiums.total[t].er)}</div>
              </div>
            </div>
          })}
          <div key={total}>
            <></>
            <div>
              <p>{`( for ${numberOfPlans} ${numberOfPlans === 1 ? 'plan' : 'plans'} )`}</p>
              <div>{moneyify(total)}</div>
            </div>
          </div>
        </div>
      </>
    }

    function getPremiums() {
      return {
        total: {
          individual: calc.premiumsForPlanForTier(plan, Tier.individual, undefined, false),
          couple: calc.premiumsForPlanForTier(plan, Tier.couple, undefined, false),
          singleParent: calc.premiumsForPlanForTier(plan, Tier.singleParent, undefined, false),
          family: calc.premiumsForPlanForTier(plan, Tier.family, undefined, false)
        },
        avg: {
          individual: calc.avgPremiumsForPlanForTier(plan, Tier.individual, undefined, false),
          couple: calc.avgPremiumsForPlanForTier(plan, Tier.couple, undefined, false),
          singleParent: calc.avgPremiumsForPlanForTier(plan, Tier.singleParent, undefined, false),
          family: calc.avgPremiumsForPlanForTier(plan, Tier.family, undefined, false)
        }
      }
    }

    function moneyify(input: number | string): string {
      if (input === 0) {
        return '—'
      } else {
        return showWeeklyPayments ? moneyWeekly(input) : moneyString(input)
      }
    }

    function planCostString(input: number | string): string | ReactElement {
      if (input === 0) {
        return '–'
      } else {
        // Remove '$' from string
        const amt = moneyify(input).split('$')
        return <p className={styles.planCost}><span>$</span>{amt}<span>{planPaymentsPeriod().replace(/\s/g, '')}</span></p>
      }
    }

    function planPaymentsPeriod(): string {
      return showWeeklyPayments ? '/ wk' : '/ mo'
    }
  }

  function onRemoveChange() {
    if (props.deleteHandler) {
      props.deleteHandler(plan.id)
    }
  }
}

export default MedicalPlanComponent
