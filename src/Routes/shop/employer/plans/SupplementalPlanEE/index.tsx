/* eslint-disable camelcase */
import React, { useState } from 'react'
import Heading from 'Components/Stargate/Heading'
import { v3 } from 'Utilities/pharaoh'
import styles from './eeSuplemental.module.scss'
import useFullContentArea from 'Utilities/Hooks/useFullContentArea'
import { GroupPlanType, AncillaryPlanUnion } from 'Utilities/Plans/ContributionCalculator'
import { PrivateWizardPageProps } from 'Components/Stargate/Wizard/WizardRoute'
import { MQType, StargateConfig } from 'Utilities/Hooks/useStargate'
import useToast from 'Utilities/Hooks/useToast'
import { GAButton } from 'Components/Tracking'
import BackToTop from 'Components/BackToTop'
import { classNames } from 'Utilities/etc'
import { useAsync, useToggle } from 'react-use'
import Loader from 'Components/Rudimentary/Loader'
import Error from 'Components/Primitives/Error'
import { typeOfPlan } from 'Components/Plans/plan-subcomponents/Plan.helpers'
import { startCase } from 'lodash'
import { $enum } from 'ts-enum-util'
import EEContribution from './EEContribution'
import AccidentplanEE from './PlansComponent/AccidentplanEE'
import CancerPlanEE from './PlansComponent/CancerPlanEE'
import CriticalIllnessEE from './PlansComponent/CriticalIllnessEE'
import HospitalEE from './PlansComponent/HospitalEE'
import STDEE from './PlansComponent/STDEE'
import SupplementalPlan from 'Components/Plans/SupplementalPlan/index.helpers'
import VTLEE from './PlansComponent/VTLEE'

const EESupplemental: React.FC <PrivateWizardPageProps> = ({ stargate, onwards }) => {
  const { value, loading, error } = useAsync(async() => {
    const p1 = await v3.groups(stargate.group?.id).plans.options.ancillary.GET() as AncillaryPlanUnion[]
    const p2 = await v3.groups(stargate.group?.id).plans.options.ancillary.selected() as AncillaryPlanUnion[]
    return [p1, p2]
  })

  useFullContentArea()
  if (loading) return <Loader />
  if (error) return <Error error={error} />
  const [plans, selectedPlans] = value!
  const selectedPlanIDs = selectedPlans.map((plan: AncillaryPlanUnion) => plan.plan.id)
  const config = stargate.config

  const visibleTypes: Set<GroupPlanType> = new Set((plans || []).map(({ plan }) => plan.type))
  if (!config.showDisabilityPlan) visibleTypes.delete(GroupPlanType.disability)
  const visibleOrderedTypes = $enum(GroupPlanType).getValues().filter(type => visibleTypes.has(type))

  return (<>
    <Content stargate={stargate} config = {config} onwards={onwards} types = {visibleOrderedTypes} selectedPlanIDs ={selectedPlanIDs} plan = {plans} />
  </>)
}

interface Props extends PrivateWizardPageProps {
  plan: AncillaryPlanUnion[]
  selectedPlanIDs: string[]
  types: GroupPlanType[]
  config: StargateConfig
}

const Content: React.FC<Props> = ({ stargate, config, onwards, plan, types, selectedPlanIDs }) => {
  const { members, groupMember } = stargate
  const { showWeeklyPayments } = config
  // const [selection, setSelections] = useSetState(defaultSelection())
  const [selected, setSelected] = useState<string[]>(selectedPlanIDs)
  const [disabled, setDisabled] = useToggle(false)
  const addToast = useToast()
  return <>
    <Heading innerclassname={styles.eeSupplementalHeading}>
      <h1>Supplemental Coverage</h1>
      <div className={styles.eeSupplementalHeading}>
        <label>Select from the following supplemental plans below. Please note that:</label>
        <ul>
          <li>Selecting a plan below does not guarantee issuance as all Aflac supplemental lines require a minimum of two employees from your group to enroll. Please contact your group manager for more details.</li>
          <li> The Critical Illness and Life plans have different rates based on tobacco use. If you select these plans, you will be asked to provide information about your tobacco use.</li>
        </ul>
      </div>
    </Heading>
    <EEContribution/>
    { types.map(render) }
    <GAButton
      analytics={`Next (${EESupplemental.name})`}
      className={classNames('shop-next-button', styles.nextButton)}
      onClick={() => go(stargate?.mqType || MQType.none)}
      disabled={disabled}
    >
    Next
    </GAButton>
    <BackToTop/>
  </>

  function render(type: GroupPlanType) {
    const typesGroup = [GroupPlanType.accident, GroupPlanType.cancer, GroupPlanType.criticalIllness, GroupPlanType.hospital, GroupPlanType.std, GroupPlanType.life]
    const showGroupName = typesGroup ? plansNames(type) : null
    return <article key={type}>
      {showGroupName && <h2 className={styles.planTitle}>{showGroupName} Plans</h2>}
      { plan.filter(p => p.plan.type === type).map(Plans) }
    </article>
  }

  function Plans(plan: AncillaryPlanUnion) {
    const isSelected = selected.includes(plan.plan.id)
    async function selectHandler(plan: SupplementalPlan) {
      try {
        setDisabled(true)
        if (isSelected) {
          await v3.groups(stargate.group?.id).plans.options.ancillary.DELETE(plan.id)
          setSelected(selected.filter(s => s !== plan.id))
        } else {
          await v3.groups(stargate.group?.id).plans.options.ancillary.POST(plan.id)
          setSelected([...selected, plan.id])
        }
      } catch (error) {
        addToast(error as Error)
      } finally {
        setDisabled(false)
      }
    }

    const props: any = {
      selected: isSelected,
      key: plan.plan.id,
      splits: [],
      plan,
      selectHandler,
      showWeeklyPayments,
      member: members.find(m => m.id === groupMember?.id),
      label: stargate.config.label
    }

    const planType = typeOfPlan(plan)
    switch (planType) {
    case GroupPlanType.accident:
      return <AccidentplanEE {...props}/>
    case GroupPlanType.cancer:
      return <CancerPlanEE {...props}/>
    case GroupPlanType.hospital:
      return <HospitalEE {...props}/>
    case GroupPlanType.std:
      return <STDEE {...props}/>
    case GroupPlanType.life:
      return <VTLEE {...props}/>
    case GroupPlanType.criticalIllness:
      return <CriticalIllnessEE {...props}/>
    }
  }

  function plansNames(type: GroupPlanType) {
    switch (type) {
    case GroupPlanType.accident:
    case GroupPlanType.cancer:
    case GroupPlanType.std:
    case GroupPlanType.criticalIllness:
    case GroupPlanType.disability:
    case GroupPlanType.hospital:
      return startCase(type)
    case GroupPlanType.life:
      return 'Voluntary Term Life'
    }
  }

  function go(mqType: MQType) {
    onwards((async() => {
      return { mqType }
    })())
  }
}

export default EESupplemental
