import React from 'react'
import styles from './CartSummary.module.scss'
import ContributionsCalculator, { moneyString, moneyWeekly, GroupPlanType, Contributions, PlanUnion, isMedical, moneyNumber } from 'Utilities/Plans/ContributionCalculator'
import { PremiumSplits } from 'Components/Plans/plan-subcomponents/Plan.helpers'
import { GAButton } from 'Components/Tracking'
import { ContributionSplit, Member } from 'Utilities/Hooks/useStargate'
import { StandaloneProsper } from 'Utilities/pharaoh.types'
import numeral from 'numeral'

interface Props {
  callback: () => void
  premiums: { // Currently unused because Pharaoh is still using the old calc
    [GroupPlanType.medical]: { split: PremiumSplits }
    [GroupPlanType.dental]: { split: PremiumSplits }
    [GroupPlanType.vision]: { split: PremiumSplits }
    [GroupPlanType.life]: { split: PremiumSplits }
    [GroupPlanType.disability]: { split: PremiumSplits }
    [GroupPlanType.prosper]: { split: PremiumSplits }
  }
  standaloneProsper?: StandaloneProsper
  contributions: Contributions
  member: Member
  plans: PlanUnion[]
  splits?: ContributionSplit[]
  multiLineContribution?: number
  eligibleLines?: GroupPlanType[]
  showWeeklyPayments: boolean
}

const CartSummary: React.FC<Props> = ({ callback, showWeeklyPayments, multiLineContribution, standaloneProsper, ...props }) => {
  const buttonCopy = 'Finalize Plan Selections'
  const calc = new ContributionsCalculator(props.plans, props.contributions, props.splits || [], [props.member])
  const medical = calc.premiumsForMedical(undefined, false).ee
  const ancillary = calc.premiumsForAncillary().ee

  return <div className={styles.container}>
    <div className={styles.summary}>
      <h2 >Cart Summary</h2>
      <p>All pricing details are illustrative and are subject to change when carriers give final pricing.</p>
    </div>
    <div className={styles.costArea}>
      <h2 className={styles.estimatedCost}>Estimated Costs</h2>
      {estimatedCost('Medical', medical)}
      {estimatedCost('Ancillary', ancillary)}
      { props.plans.some(isMedical)
        ? estimatedCost('Prosper', 0)
        : standaloneProsper?.signedUp
          ? estimatedCost('Prosper', moneyNumber(standaloneProsper.signedUpRate || standaloneProsper?.currentRate))
          : <></>
      }
      <hr/>
      <div className={styles.estimatedTCost}>
        <h3>Estimated Total Employee Costs:</h3>
        <p>{totalPremiumString()}<span>{showWeeklyPayments ? '/wk' : '/mo'}</span></p>
      </div>
    </div>
    <GAButton analytics={`${buttonCopy} (${CartSummary.name})`} className={styles.nextButton} onClick={callback}>{buttonCopy}</GAButton>
  </div>

  function totalPremiumString() {
    const prosperCost = props.plans.some(isMedical) || !standaloneProsper?.signedUp ? 0 : numeral(standaloneProsper.signedUpRate || standaloneProsper.currentRate).value()
    const premiumNumber = medical + ancillary + prosperCost
    return showWeeklyPayments ? moneyWeekly(premiumNumber) : moneyString(premiumNumber)
  }

  function estimatedCost(type: 'Medical' | 'Prosper' | 'Ancillary', cost: string | number) {
    let mo
    // show no contribution to incentivize scrolling down to look
    if (type === 'Prosper' && cost === 0) {
      cost = 'Included'
      mo = ''
      // We have data for this planType
    } else {
      if (showWeeklyPayments) {
        cost = moneyWeekly(cost)
        mo = '/wk'
      } else {
        cost = moneyString(cost)
        mo = '/mo'
      }
    }

    return <div className={styles.line}>
      <h3>{type === 'Prosper' ? 'Prosper Benefits' : `Estimated ${type}`}</h3>
      <p className={styles.summaryPlanCost}>{cost}<span>{mo}</span></p>
    </div>
  }
  // Avoid Pharaoh provided premiums for now

  // function medicalPremium() {
  //   if (!premiums || !premiums.medical) return 0 // prosper only probs
  //   return moneyNumber(premiums.medical.split.ee)
  // }

  // function ancillaryPremium() {
  //   // TODO Check for eligible lines
  //   let rv = 0
  //   if (premiums) {
  //     if (premiums.dental) rv += moneyNumber(premiums.dental.split.ee)
  //     if (premiums.vision) rv += moneyNumber(premiums.vision.split.ee)

  //     if (multiLineContribution) {
  //       if (multiLineContribution > rv) {
  //         rv = 0
  //       } else {
  //         rv -= multiLineContribution
  //       }
  //     }

  //     if (premiums.life) rv += moneyNumber(premiums.life.split.ee)
  //     if (premiums.disability) rv += moneyNumber(premiums.disability.split.ee)
  //   }
  //   return moneyNumber(rv)
  // }
}

export default CartSummary
