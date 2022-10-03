import React, { useState } from 'react'
import { PrivateWizardPageProps } from 'Components/Stargate/Wizard/WizardRoute'
import { useAsync, useSetState, useToggle } from 'react-use'
import Error from 'Components/Primitives/Error'
import Loader from 'Components/Rudimentary/Loader'
import styles from 'Routes/shop/employee/plans/ancillary/index.module.scss'
import inputStyles from 'Components/Stargate/Contribution/ContributionAmount.module.scss'
import { Label } from 'Utilities/config'
import DentalPlan from 'Components/Plans/DentalPlan'
import VisionPlan from 'Components/Plans/VisionPlan'
import LifePlan from 'Components/Plans/LifePlan'
import LTDPlan from 'Components/Plans/LTDPlan'
import { $enum } from 'ts-enum-util'
import useFullContentArea from 'Utilities/Hooks/useFullContentArea'
import { v3 } from 'Utilities/pharaoh'
import { GAButton } from 'Components/Tracking'
import { MQType, StargateConfig } from 'Utilities/Hooks/useStargate'
import Heading from 'Components/Stargate/Heading'
import { classNames, stringsToSentence } from 'Utilities/etc'
import ContributionAmount, { ContributionSplitType, contributionType } from 'Components/Stargate/Contribution/ContributionAmount'
import { allAncillaryContributionEligibleLines, AncillaryPlanUnion, formatAllAncillaryInput, GroupPlanType, moneyString } from 'Utilities/Plans/ContributionCalculator'
import { startCase } from 'lodash'
import { Switch } from 'Components/Rudimentary/CandorSwitch'
import numeral from 'numeral'
import { post } from 'Utilities/fetch++'
import useToast from 'Utilities/Hooks/useToast'

const ERShopPlansAncillary: React.FC<PrivateWizardPageProps> = ({ stargate, onwards }) => {
  const { value, loading, error } = useAsync(async() => {
    const p1 = await v3.groups(stargate.group?.id).plans.options.ancillary.GET() as AncillaryPlanUnion[]
    const p2 = await v3.groups(stargate.group?.id).plans.options.ancillary.selected() as AncillaryPlanUnion[]
    return [p1, p2]
  })
  const config = stargate.config

  useFullContentArea()

  if (loading) return <Loader />
  if (error) return <Error error={error} />

  const [plans, selectedPlans] = value!
  const selectedPlanIDs = selectedPlans.map((plan: AncillaryPlanUnion) => plan.plan.id)

  if (!plans || plans.length <= 0) {
    // sometimes we can offer nothing, so skip
    onwards(Promise.resolve())
    return <Loader />
  }

  const visibleTypes: Set<GroupPlanType> = new Set((plans || []).map(({ plan }) => plan.type))
  visibleTypes.delete(GroupPlanType.life)
  if (!config.showDisabilityPlan) visibleTypes.delete(GroupPlanType.disability)

  const visibleOrderedTypes = $enum(GroupPlanType).getValues().filter(type => visibleTypes.has(type))
  return <Content stargate={stargate} onwards={onwards} plans={plans} selectedPlanIDs={selectedPlanIDs} types={visibleOrderedTypes} config={config} />
}

interface Props extends PrivateWizardPageProps {
  plans: AncillaryPlanUnion[]
  selectedPlanIDs: string[]
  types: GroupPlanType[]
  config: StargateConfig
}

export enum AncillaryContributionMode {
  perLine,
  allEligibleLines
}

const Content: React.FC<Props> = ({ stargate, onwards, config, plans, selectedPlanIDs, types }) => {
  const { members, group, contributions, hasAllstate, imqsSent, membersCompletedTheirIMQs } = stargate
  const defaultContributionMode = contributions?.baseContributions.allAncillary ? AncillaryContributionMode.allEligibleLines : AncillaryContributionMode.perLine
  const [contributionMode, setContributionMode] = useState(defaultContributionMode)
  const [contribution, setContribution] = useSetState(defaultContributions())
  const [disabled, setDisabled] = useToggle(false)
  const addToast = useToast()
  const [selected, setSelected] = useState<string[]>(selectedPlanIDs)

  const imqButtonCopy = imqsSent ? 'MQ Status' : 'Send MQs'

  return <>
    <Heading innerclassname={styles.ancilaryHeading}>
      <h1>Enhance Your Offer</h1>
      <p className={styles.ancilaryHeading}>Employees can choose from the ancillary plans below. You’ll be able to adjust your specific contributions before finalizing your selected plans.</p>
    </Heading>
    <section className={styles.mainContainer}>
      { contributionModeForm() }
      { types.map(render) }

      {hasAllstate &&
        <GAButton
          analytics={`${imqButtonCopy} (${ERShopPlansAncillary.name})`}
          className={classNames('shop-next-button', styles.imqButton)}
          onClick={sendIMQs}
        >
          {imqButtonCopy}
        </GAButton>
      }
      { (!hasAllstate || membersCompletedTheirIMQs) &&
        <GAButton
          analytics={`Next (${ERShopPlansAncillary.name})`}
          className={classNames('shop-next-button', styles.nextButton)}
          onClick={() => go(stargate?.mqType || MQType.none)}
          disabled={disabled}
        >Next</GAButton>
      }
    </section>
  </>

  function render(type: GroupPlanType) {
    const planNames = h2(type)
    return <> {planNames &&
    <article key={type}>
      <h2>{planNames} Plans </h2>
      { contributionForm(type) }
      { plans.filter(p => p.plan.type === type).map(plan) }
    </article>
    }
    </>
  }

  // Select if user wants to contribute a fixed amount to all lines or percent individually
  function contributionModeForm() {
    const eligibleLines = types.filter(t => allAncillaryContributionEligibleLines().has(t))
    if (!eligibleLines.length) return null
    const plansCopy = stringsToSentence(...eligibleLines)
    return <div className={styles.contributionModeContainer}>
      <p>Would you like to contribute a fixed amount across {plansCopy} plan{eligibleLines ? 's' : ''}?</p>
      <Switch
        className={styles.contributionModeSwitch}
        value={contributionMode === AncillaryContributionMode.allEligibleLines}
        onChange={d => {
          setContributionMode(d ? AncillaryContributionMode.allEligibleLines : AncillaryContributionMode.perLine)
        }}
      />
      { contributionMode === AncillaryContributionMode.allEligibleLines &&
        <>
          <p>How much would like to contribute?</p>
          <input
            className={inputStyles.amount}
            value={contribution.allAncillary}
            placeholder={'$0'}
            onChange={e => setContribution({ allAncillary: formatAllAncillaryInput(e.target.value) })}
            onFocus={onFocus}
            onBlur={onBlur}
          />
        </>
      }
    </div>
  }

  function onBlur(event: React.ChangeEvent<HTMLInputElement>) {
    const massagedValue = numeral(event.target.value).format('$0,0')
    event.target.value = massagedValue
    setContribution({ allAncillary: massagedValue })
  }

  function onFocus(event: React.ChangeEvent<HTMLInputElement>) {
    const value = numeral(event.target.value).value()
    if (!value || value === 0) {
      event.target.value = ''
    } else {
      event.target.value = value.toString()
    }
  }

  function plan(plan: AncillaryPlanUnion) {
    const currentContributions = contributions
    const isSelected = selected.includes(plan.plan.id)

    if (contributions) {
      contributions.baseContributions.dental = contribution[GroupPlanType.dental]?.value
      contributions.baseContributions.dentalEquitable = contribution[GroupPlanType.dental]?.splitType === ContributionSplitType.allTiers
      contributions.baseContributions.vision = contribution[GroupPlanType.vision]?.value
      contributions.baseContributions.visionEquitable = contribution[GroupPlanType.vision]?.splitType === ContributionSplitType.allTiers
      contributions.baseContributions.allAncillary = contributionMode === AncillaryContributionMode.allEligibleLines ? contribution.allAncillary || '$0' : undefined
    }

    const selectHandler = async() => {
      try {
        if (isSelected) {
          await v3.groups(stargate.group?.id).plans.options.ancillary.DELETE(plan.plan.id)
          setSelected(selected.filter(s => s !== plan.plan.id))
        } else {
          await v3.groups(stargate.group?.id).plans.options.ancillary.POST(plan.plan.id)
          setSelected([...selected, plan.plan.id])
        }
      } catch (error) {
        addToast(error as Error)
      }
    }

    const props: any = {
      selected: isSelected,
      selectHandler,
      contributions: currentContributions,
      key: plan.plan.id,
      splits: [],
      plan,
      showWeeklyPayments: config.showWeeklyPayments,
      members
    }

    switch (plan.plan.type) {
    case GroupPlanType.dental:
      return <DentalPlan {...props} />
    case GroupPlanType.vision:
      return <VisionPlan {...props} />
    case GroupPlanType.life:
      return <LifePlan {...props} />
    case GroupPlanType.disability:
      return <LTDPlan {...props} />
    }
  }

  function h2(type: GroupPlanType) {
    switch (type) {
    case GroupPlanType.dental:
    case GroupPlanType.vision:
      return startCase(type)
    case GroupPlanType.life:
      if (config.label === Label.blacksmith) {
        return 'Life, Accidental Death and Dismemberment'
      }
      return 'Voluntary Term Life'
    case GroupPlanType.disability:
      return 'LTD'
    }
  }

  function go(mqType: MQType) {
    // ONWARDS!!
    if (!validate()) { return }

    setDisabled(true)
    const contributions = {
      dental: mangleContribution(contribution[GroupPlanType.dental]),
      vision: mangleContribution(contribution[GroupPlanType.vision]),
      life: mangleContribution(contribution[GroupPlanType.life]),
      disability: mangleContribution(contribution[GroupPlanType.disability]),
      allAncillary: contributionMode === AncillaryContributionMode.allEligibleLines ? contribution.allAncillary : undefined
    }
    onwards((async() => {
      try {
        await v3.groups(group?.id).PUT({ contributions })
      } finally {
        setDisabled(false)
      }
      return { mqType }
    })())
  }

  function sendIMQs() {
    if (!validate()) { return }

    onwards(Promise.resolve({ mqType: MQType.allstate }))
      .then(() => {
        if (!membersCompletedTheirIMQs) {
          return post(`/v2/groups/${group!.id}/users/invite/imq`)
            .then(() => addToast('Success! MQ invites have been sent to your employees.', { appearance: 'info' }))
        }
      })
      .catch(addToast)
  }

  function validate(): boolean {
    const hasDental = plans.some(p => p.plan.type === GroupPlanType.dental)
    const hasVision = plans.some(p => p.plan.type === GroupPlanType.vision)
    const choseDental = plans.some(p => p.plan.type === GroupPlanType.dental && selected.includes(p.plan.id))
    const choseVision = plans.some(p => p.plan.type === GroupPlanType.vision && selected.includes(p.plan.id))

    if (hasDental && !choseDental) {
      addToast('You must choose at least one dental offering', 'warning')
      return false
    }

    if (hasVision && !choseVision) {
      addToast('You must choose at least one vision offering', 'warning')
      return false
    }

    return true
  }

  function contributionForm(type: GroupPlanType) {
    if (contributionMode === AncillaryContributionMode.allEligibleLines) return null

    return <div className={styles.contributionContainer}>
      <p><span>How would you like to contribute to {type} plans?</span> Your contribution amount and employee participation in ancillary coverage may affect plan availability.</p>
      <ContributionAmount
        planType = {GroupPlanType.medical}
        onlyPercent
        value={contribution[type]?.value}
        splitType={contribution[type]?.splitType}
        onChange={(value, splitType) => {
          setContribution({ [type]: { value, splitType } })
        }}
      />
    </div>
  }

  function mangleContribution(c?: { value: string, splitType: ContributionSplitType}) {
    return { value: c?.value || '0%', isEquitable: c?.splitType === ContributionSplitType.allTiers }
  }

  function defaultContributions() {
    const rv: { [key in GroupPlanType]?: {value: string, splitType: ContributionSplitType} } & { allAncillary?: string } = {}
    const bc = contributions?.baseContributions

    const bcDentalEquitable = bc?.dentalEquitable || true
    const bcVisionEquitable = bc?.visionEquitable || true
    const bcLifeEquitable = bc?.visionEquitable || true
    const bcDisabilityEquitable = bc?.visionEquitable || true

    const bcDental = bc?.dental || '50%'
    const bcVision = bc?.vision || '50%'
    const bcLife = bc?.life || '50%'
    const bcDisablity = bc?.disability || '50%'
    const bcAllAncillary = bc?.allAncillary || '$25'

    // const ancillaryContributionData = { value: bc?.dental || '51%', splitType: contributionType(!!bc?.dentalEquitable, bc?.dental) }
    rv[GroupPlanType.dental] = { value: bcDental, splitType: contributionType(bcDentalEquitable, bcDental) }
    rv[GroupPlanType.vision] = { value: bcVision, splitType: contributionType(bcVisionEquitable, bcVision) }
    rv[GroupPlanType.life] = { value: bcLife, splitType: contributionType(bcLifeEquitable, bcLife) }
    rv[GroupPlanType.disability] = { value: bcDisablity, splitType: contributionType(bcDisabilityEquitable, bcDisablity) }
    rv.allAncillary = moneyString(bcAllAncillary)
    return rv
  }
}

export default ERShopPlansAncillary
