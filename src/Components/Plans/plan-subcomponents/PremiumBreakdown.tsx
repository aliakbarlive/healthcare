import React from 'react'
import baseStyles from './Plan.module.scss'
import erStyles from './PremiumBreakdown.module.scss'
import eeStyles from './EEPremiumBreakdown.module.scss'
import { $enum } from 'ts-enum-util'
import { classNames, stringsToSentence } from 'Utilities/etc'
import { ContributionSplit, Member } from 'Utilities/Hooks/useStargate'
import { Tier } from 'Utilities/pharaoh.types'
import ContributionsCalculator, { allAncillaryContributionEligibleLines, Contributions, GroupPlanType, isAncillaryPlanUnion, isMedical, moneyNumber, moneyString, moneyWeekly, PlanUnion } from 'Utilities/Plans/ContributionCalculator'
import { PremiumSplits, tierMarketingCopy } from './Plan.helpers'
import { isSupplemental } from '../SupplementalPlan/index.helpers'

export type EmployerProps = {
  members: Member[]
}

export type EmployeeProps = {
  member: Member
  premium?: PremiumSplits
}

interface Props {
  plan: PlanUnion
  contributions: Contributions
  showWeeklyPayments: boolean
  splits?: ContributionSplit[]
}

export function isEmployerProps(props: any): props is EmployerProps {
  return 'members' in props
}

const PremiumBreakdown: React.FC<(EmployerProps | EmployeeProps) & Props> = ({ plan, contributions, showWeeklyPayments, ...props }) => {
  if (isEmployerProps(props)) {
    return <ERPremiumBreakdown plan={plan} contributions={contributions} splits={props.splits} members={props.members} showWeeklyPayments={showWeeklyPayments} />
  } else {
    const allAncillaryAmount = moneyNumber(contributions?.baseContributions?.allAncillary)
    const eligibleLines = isAncillaryPlanUnion(plan) && allAncillaryContributionEligibleLines().has(plan.plan.type) && Array.from(allAncillaryContributionEligibleLines())

    // Temporarily ignore pharaoh premiums
    // if (props.premium) {
    //   er = moneyNumber(props.premium.er)
    //   ee = moneyNumber(props.premium.ee)
    // }
    const calc = new ContributionsCalculator([plan], contributions, props.splits || [], [props.member])
    const premium = calc.premiums([plan], false, [props.member])
    const er = premium.er
    const ee = premium.ee
    return <EEPremiumBreakdown
      erPremium={er}
      eePremium={ee}
      multiLineContribution={allAncillaryAmount}
      eligibleLines={eligibleLines || undefined}
      tier={props.member.tier}
      showWeeklyPayments={showWeeklyPayments}
    />
  }
}

interface ERPremiumBreakdownProps {
  plan: PlanUnion
  contributions: Contributions
  members: Member[]
  splits?: ContributionSplit[]
  showWeeklyPayments: boolean
}

const ERPremiumBreakdown: React.FC<ERPremiumBreakdownProps> = ({ plan, contributions, members, splits, showWeeklyPayments }) => {
  const calc = new ContributionsCalculator([plan], contributions, splits || [], members)
  const dol = <span>$</span>
  const per = <span>{showWeeklyPayments ? '/wk' : '/mo'}</span>
  const erAmount = calc.avgPremiums([plan]).er
  const showEREstCost = isMedical(plan) || !contributions.baseContributions.allAncillary
  const supplemental = isSupplemental(plan)
  return <> { !supplemental ? <div className={ classNames(baseStyles.section, baseStyles.er, erStyles.pbContainer)}>
    { showEREstCost &&
      <div className={baseStyles.box}>
        <div className={erStyles.sectionTitle}>Your Cost csdfrwere</div>
        <div className={erStyles.erCost}>
          { dol }
          { (showWeeklyPayments ? moneyWeekly(erAmount) : moneyString(erAmount)).split('$') }
          { per }
        </div>
        <div className={erStyles.perEmployee}>Per Employee</div>
      </div> }
    <div className={classNames(baseStyles.box, erStyles.premiums)} style={{ flex: showEREstCost ? undefined : 1 }}>
      { $enum(Tier).map(tier => {
        const amount = calc.avgPremiumsForPlanForTier(plan, tier).ee
        return <div key={tier}>
          <div className={erStyles.tier}>
            <div>{tierMarketingCopy(tier as Tier)}</div>
            <div>COST / {showWeeklyPayments ? 'wk' : 'mo'}</div>
          </div>
          <div className={erStyles.amount}>
            { amount
              ? <div>
                { dol }
                { (showWeeklyPayments ? moneyWeekly(amount) : moneyString(amount)).split('$') }
                { per }
              </div>
              : '—'
            }
          </div>
        </div>
      })}
    </div>
  </div>
    : <>
      <div className={classNames(baseStyles.box, erStyles.premiums)} style={{ flex: showEREstCost ? undefined : 1 }}>
        { $enum(Tier).map(tier => {
          const amount = calc.avgPremiumsForPlanForTier(plan, tier).ee
          return <div key={tier}>
            <div className={`${erStyles.tier} ${erStyles.Supplemental_tier}`}>
              <div>{tierMarketingCopy(tier as Tier)}</div>
              <div>COST / {showWeeklyPayments ? 'wk' : 'mo'}</div>
            </div>
            <div className={erStyles.amount}>
              { amount
                ? <div className={erStyles.tierAmounts}>
                  { dol }
                  { (showWeeklyPayments ? moneyWeekly(amount) : moneyString(amount)).split('$') }
                  { per }
                </div>
                : '—'
              }
            </div>
          </div>
        })}
      </div>
    </>}
  </>
}

interface EEPremiumBreakdownProps {
  erPremium: number
  eePremium: number
  tier: Tier
  multiLineContribution?: number
  eligibleLines?: GroupPlanType[]
  showWeeklyPayments: boolean
}

const EEPremiumBreakdown: React.FC<EEPremiumBreakdownProps> = ({ tier, eePremium, erPremium, showWeeklyPayments, multiLineContribution, eligibleLines }) => {
  const classes = [baseStyles.section, baseStyles.box, eeStyles.container]
  const multiLineAmount = multiLineContribution && showWeeklyPayments ? moneyWeekly(multiLineContribution) : moneyString(multiLineContribution)
  const period = showWeeklyPayments ? 'wk' : 'mo'
  return <div className={classes.join(' ')}>
    <div className={eeStyles.tier}>{tierMarketingCopy(tier)} Tier</div>
    <div className={eeStyles.premiums}>
      <div className={eeStyles.ee}>
        <span>$</span>{(showWeeklyPayments ? moneyWeekly(eePremium) : moneyString(eePremium)).split('$')}<span>{showWeeklyPayments ? '/wk' : '/mo'}</span>
      </div>
      { !!erPremium && <div className={eeStyles.afterContribution}>After Employer Contribution</div> }
      { multiLineContribution && eligibleLines?.length
        ? <div className={eeStyles.er}>Your employer is contributing <em>{multiLineAmount}/{period}</em> to distribute across {stringsToSentence(...eligibleLines)} plans</div>
        : <div className={eeStyles.er}>Your employer contributes<br/><em>
          {showWeeklyPayments ? `${moneyWeekly(erPremium)}/wk` : `${moneyString(erPremium)}/${period}`}</em> to this plan
        </div>
      }
    </div>
  </div>
}

export default PremiumBreakdown
