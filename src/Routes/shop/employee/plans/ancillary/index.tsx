/* eslint-disable camelcase */
import React from 'react'
import { PrivateWizardPageProps } from 'Components/Stargate/Wizard/WizardRoute'
import { useAsync, useSetState, useToggle } from 'react-use'
import { put } from 'Utilities/fetch++'
import Error from 'Components/Primitives/Error'
import Loader from 'Components/Rudimentary/Loader'
import styles from './index.module.scss'
import { Label } from 'Utilities/config'
import DentalPlanComponent from 'Components/Plans/DentalPlan'
import VisionPlanComponent from 'Components/Plans/VisionPlan'
import LifePlanComponent from 'Components/Plans/LifePlan'
import LTDPlanComponent from 'Components/Plans/LTDPlan'
import useToast from 'Utilities/Hooks/useToast'
import { $enum } from 'ts-enum-util'
import useFullContentArea from 'Utilities/Hooks/useFullContentArea'
import { v3 } from 'Utilities/pharaoh'
import { GAButton } from 'Components/Tracking'
import { StargateConfig } from 'Utilities/Hooks/useStargate'
import Heading from 'Components/Stargate/Heading'
import { classNames, stringsToSentence } from 'Utilities/etc'
import ContributionsCalculator, { allAncillaryContributionEligibleLines, AncillaryPlanUnion, GroupPlanType, moneyNumber, moneyString, moneyWeekly } from 'Utilities/Plans/ContributionCalculator'
import { compact, startCase } from 'lodash'
import DentalPlan from 'Components/Plans/DentalPlan/index.helpers'
import VisionPlan from 'Components/Plans/VisionPlan/index.helpers'
import LifePlan from 'Components/Plans/LifePlan/index.helpers'
import LTDPlan from 'Components/Plans/LTDPlan/index.helpers'
import ProsperPlan from 'Components/Plans/ProsperPlan'
import { isABC } from 'Components/Plans/plan-subcomponents/Plan.helpers'

export enum HeadingClassName{
  coverageHeading = 'coverageHeading'
}

const EEShopPlansAncillary: React.FC<PrivateWizardPageProps> = ({ stargate, onwards }) => {
  const { value: plans, loading, error } = useAsync(async() =>
    await v3.groups(stargate.group?.id).users(stargate.user.id).plans.options.ancillary() as AncillaryPlanUnion[]
  )

  const config = stargate.config
  useFullContentArea()

  if (loading) return <Loader />
  if (error) return <Error error={error} />
  if (!plans || plans.length <= 0) {
    // sometimes we can offer nothing, so skip
    onwards(Promise.resolve())
    return <Loader />
  }

  const visibleTypes: Set<GroupPlanType> = new Set((plans || []).map(({ plan }) => plan.type))

  if (!config.showLifePlans) visibleTypes.delete(GroupPlanType.life)
  if (!config.showDisabilityPlan) visibleTypes.delete(GroupPlanType.disability)

  const visibleOrderedTypes = $enum(GroupPlanType).getValues().filter(type => visibleTypes.has(type))

  return <Content stargate={stargate} onwards={onwards} plans={plans} types={visibleOrderedTypes} config={config}/>
}

interface Props extends PrivateWizardPageProps {
  plans: AncillaryPlanUnion[]
  types: GroupPlanType[]
  config: StargateConfig
}

const Content: React.FC<Props> = ({ stargate, onwards, config, plans, types }) => {
  const { members, group, groupMember, contributions, user, nonWaivedMemberCount } = stargate
  const prosper = stargate.carrierSpecificData?.prosper
  const { showWeeklyPayments, moneyDecimals, label } = config
  const addToast = useToast()
  const [selections, setSelections] = useSetState(defaultSelections())
  const [disabled, setDisabled] = useToggle(false)

  const allAncillaryTypes = contributions?.baseContributions.allAncillary ? types.filter(t => allAncillaryContributionEligibleLines().has(t)) : []
  const otherTypes = types.filter(t => !allAncillaryTypes.some(aat => aat === t))

  return <>
    <Heading innerclassname={HeadingClassName.coverageHeading}>
      <h1 className={styles.coverageHead}>Add On More Coverage</h1>
      {aboutCopy()}
    </Heading>
    <section className={styles.mainContainer}>
      { allAncillarySection() }
      { otherTypes.map(render) }
      { renderStandaloneProsper() }
      <GAButton
        analytics={`Next (${EEShopPlansAncillary.name})`}
        className={classNames('shop-next-button', styles.nextButton)}
        onClick={() => onwards(Promise.resolve())}
        disabled={disabled}>
           Next
      </GAButton>
    </section>
  </>

  function allAncillarySection() {
    const allAncillary = moneyNumber(contributions?.baseContributions.allAncillary, moneyDecimals)
    if (!allAncillaryTypes.length || !allAncillary) return

    const frequency = showWeeklyPayments ? '/weekly' : '/month'
    const p = compact(allAncillaryTypes.map(t => plans.find(p => p.plan.id === selections[t])))
    const calc = new ContributionsCalculator(p, contributions!, [], members.filter(m => m.id === groupMember?.id), moneyDecimals)
    const premium = calc.premiumsForAncillary()
    const erAmount = amount(allAncillary)
    const erAmountLeft = amount(allAncillary - premium.er)
    const eeAmount = amount(premium.ee)

    return <section className={styles.allAncillarySection}>
      <div className={styles.aa_cart}>
        <div>
          <h2>Fixed Contribution</h2>
          <p>Your employer is contributing a fixed amount of {erAmount}{frequency}* to distribute across {stringsToSentence(...allAncillaryTypes)} plans for you and your family.</p>
          <p className={styles.disclaimer}>* This amount does not apply to voluntary term life.</p>
        </div>
        <div>
          <h2>Remaining Employer Contribution</h2>
          { premium.ee
            ? <p className={styles.remaining}>After employer contributions for {stringsToSentence(...allAncillaryTypes)} plans, you pay:</p>
            : <p className={styles.remaining}>You have the following amount remaining:</p>
          }
          <div className={classNames(styles.amount, premium.ee ? styles.ee : styles.er) }>
            <span>$</span>
            { premium.ee ? eeAmount.replace('$', '') : erAmountLeft.replace('$', '') }
            <span>{showWeeklyPayments ? '/wk' : '/mo'}</span>
          </div>
        </div>
      </div>
      {allAncillaryTypes.map(render)}
    </section>

    function amount(monthly: string | number) {
      return showWeeklyPayments ? moneyWeekly(monthly) : moneyString(monthly)
    }
  }

  function render(type: GroupPlanType) {
    const groupPlans = plans.filter(p => p.plan.type === type)
    const hasABC = groupPlans.some(p => isABC(p.plan.carrier))
    const planNames = h2(type)

    return <>{ planNames &&
        <article key={type}>
          <h2>{h2(type)} Plans</h2>
          { type === GroupPlanType.life && !hasABC &&
        <div className={styles.planTypeInfo}>
          <p>Voluntary Term Life is intended to be an employee paid benefit, meaning that an employer is unlikely to contribute. You may take this policy with you after leaving the company.</p>
        </div>
          }
          { groupPlans.map(plan) }
        </article>}
    </>
  }

  function renderStandaloneProsper() {
    if (groupMember?.enrolled_group_plan_id || group?.individualExperience) return <></>
    return <article key={GroupPlanType.prosper}>
      <h2>{h2(GroupPlanType.prosper)}</h2>
      <div className={styles.planTypeInfo}>
        <p>Prosper Benefits+ is a suite of services included with the medical plans we offer at no cost to you. Because you are waiving your medical plan, you still have the option to sign up. Use of Prosper Benefits+ is unlimited and will create future cost savings for you and your family.</p>
      </div>
      <ProsperPlan
        isIncluded={false}
        nonWaivedMemberCount={nonWaivedMemberCount || 0}
        label={label}
        prosperOnlyCost={moneyNumber(prosper?.signedUpRate || prosper?.currentRate)}
        selected={selections[GroupPlanType.prosper]}
        selectHandler={async() => {
          try {
            setDisabled(true)
            if (selections.prosper) {
              await v3.groups(group?.id).users(user.id).plans.prosper.DELETE()
            } else {
              await v3.groups(group?.id).users(user.id).plans.prosper.PUT()
            }
            setSelections({ [GroupPlanType.prosper]: !selections.prosper })
          } catch (error) {
            addToast(error as Error)
          } finally {
            setDisabled(false)
          }
        }}
      />
    </article>
  }

  function plan(plan: AncillaryPlanUnion) {
    const isSelected = selections[plan.plan.type] === plan.plan.id
    const props: any = {
      selected: isSelected,
      contributions,
      key: plan.plan.id,
      splits: [],
      plan,
      selectHandler: toggle,
      showWeeklyPayments,
      member: members.find(m => m.id === groupMember?.id),
      label: stargate.config.label
    }

    switch (plan.plan.type) {
    case GroupPlanType.dental:
      return <DentalPlanComponent {...props} />
    case GroupPlanType.vision:
      return <VisionPlanComponent {...props} />
    case GroupPlanType.life:
      return <LifePlanComponent {...props} />
    case GroupPlanType.disability:
      return <LTDPlanComponent {...props} />
    }

    async function toggle(plan: DentalPlan | VisionPlan | LifePlan | LTDPlan) {
      try {
        setDisabled(true)
        if (isSelected) {
          v3.users(groupMember?.id).plans(plan.type).DELETE()
        } else {
          await put(`/v3/groups/${group?.id}/users/plans/${plan.type}/${plan.id}`)
        }
        setSelections({ [plan.type]: isSelected ? undefined : plan.id })
      } catch (error) {
        addToast(error as Error)
      } finally {
        setDisabled(false)
      }
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
    case GroupPlanType.prosper:
      return 'Prosper Benefits'
    }
  }

  function aboutCopy() {
    return <>
      <p>Select from the following plans to round out your health coverage. Click next when you’re done.</p>
      {blacksmithExtra()}
    </>

    function blacksmithExtra() {
      if (config.label !== Label.blacksmith) return null
      const link = 'https://na3.docusign.net/Member/PowerFormSigning.aspx?PowerFormId=54f03a53-0d68-4dfc-ac9d-866af3ea0436&amp;env=na3&amp;acct=65fd15b8-c89f-4be1-bc6d-5589576571bf&amp;v=2'
      return <>
        <p style={{ color: 'yellow' }}>
          To complete your enrollment, you must either enroll (check) or waive (uncheck) the plan.
          If your life insurance beneficiary has changed or never been assigned please&nbsp;
          <a target="_blank" rel="noopener noreferrer" href={link}>complete this form</a>
        </p>
      </>
    }
  }

  type Selections = {
    [GroupPlanType.prosper]?: boolean
    [GroupPlanType.dental]?: string
    [GroupPlanType.vision]?: string
    [GroupPlanType.life]?: string
    [GroupPlanType.disability]?: string
    [GroupPlanType.accident]?: string
    [GroupPlanType.cancer]?: string
    [GroupPlanType.criticalIllness]?: string
    [GroupPlanType.hospital]?: string
    [GroupPlanType.std]?: string
    [GroupPlanType.medical]?: never
  }

  function defaultSelections() {
    const selected: Selections = {}
    selected[GroupPlanType.dental] = groupMember?.enrolled_dental_plan_id || user?.enrolled_dental_plan_id
    selected[GroupPlanType.vision] = groupMember?.enrolled_vision_plan_id || user?.enrolled_vision_plan_id
    selected[GroupPlanType.life] = groupMember?.enrolled_life_plan_id || user?.enrolled_life_plan_id
    selected[GroupPlanType.disability] = groupMember?.enrolled_disability_plan_id || user?.enrolled_disability_plan_id
    selected[GroupPlanType.accident] = groupMember?.supplemental_enrollments?.find(e => plans.find(p => p.plan.id === e && p.plan.type === GroupPlanType.accident))
    selected[GroupPlanType.cancer] = groupMember?.supplemental_enrollments?.find(e => plans.find(p => p.plan.id === e && p.plan.type === GroupPlanType.cancer))
    selected[GroupPlanType.std] = groupMember?.supplemental_enrollments?.find(e => plans.find(p => p.plan.id === e && p?.plan?.type === GroupPlanType.std))
    selected[GroupPlanType.criticalIllness] = groupMember?.supplemental_enrollments?.find(e => plans.find(p => p.plan.id === e && p.plan.type === GroupPlanType.criticalIllness))
    selected[GroupPlanType.hospital] = groupMember?.supplemental_enrollments?.find(e => plans.find(p => p.plan.id === e && p.plan.type === GroupPlanType.hospital))
    selected[GroupPlanType.prosper] = !!prosper?.signedUp
    return selected
  }
}

export default EEShopPlansAncillary
