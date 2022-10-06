import React from 'react'
import { useAsync } from 'react-use'
import { v3 } from 'Utilities/pharaoh'
import { PrivateWizardPageProps } from 'Components/Stargate/Wizard/WizardRoute'
import Error from 'Components/Primitives/Error'
import Loader from 'Components/Rudimentary/Loader'
import { startCase } from 'lodash'
import { $enum } from 'ts-enum-util'
import styles from './Suplemental.module.scss'
import useFullContentArea from 'Utilities/Hooks/useFullContentArea'
import Heading from 'Components/Stargate/Heading'
import { AncillaryPlanUnion, GroupPlanType } from 'Utilities/Plans/ContributionCalculator'
import { MQType, StargateConfig } from 'Utilities/Hooks/useStargate'
import { typeOfPlan } from '../plan-subcomponents/Plan.helpers'
import AccidentPlanComp from '../ERSupplementalPlans/AccidentPlanComp'
import CancerPlanComp from '../ERSupplementalPlans/CancerPlanComp'
import CriticleIllness from '../ERSupplementalPlans/CriticleIllness'
import HospitalPlan from '../ERSupplementalPlans/HospitalPlan'
import ShortTermDisability from '../ERSupplementalPlans/ShortTermDisability'
import VoluntaryTermLife from '../ERSupplementalPlans/VoluntaryTermLife'
import useToast from 'Utilities/Hooks/useToast'
import { GAButton } from 'Components/Tracking'
import { classNames } from 'Utilities/etc'
import BackToTop from 'Components/BackToTop'

const ERShopSupplemental: React.FC<PrivateWizardPageProps> = ({ stargate, onwards }) => {
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
    onwards(Promise.resolve({ mqType: stargate?.mqType }))
    return <Loader />
  }

  const visibleTypes: Set<GroupPlanType> = new Set((plans || []).map(({ plan }) => plan.type))
  if (!config.showDisabilityPlan) visibleTypes.delete(GroupPlanType.disability)
  const visibleOrderedTypes = $enum(GroupPlanType).getValues().filter(type => visibleTypes.has(type))

  return <Content plan={plans} selectedPlanIDs={selectedPlanIDs} types={visibleOrderedTypes} config= {config} stargate={stargate} onwards={onwards}/>
}

interface Props extends PrivateWizardPageProps {
  plan: AncillaryPlanUnion[]
  selectedPlanIDs: string[]
  types: GroupPlanType[]
  config: StargateConfig
}

const Content: React.FC<Props> = ({ stargate, onwards, plan, selectedPlanIDs, types, config }) => {
  const { members, contributions } = stargate
  const [selected, setSelected] = React.useState<string[]>(selectedPlanIDs)
  const addToast = useToast()
  const { showWeeklyPayments } = config

  return <>
    <Heading innerclassname={styles.supplementalHeading}>
      <h1>Supplemental Coverage</h1>
      <div className={styles.supplementalHeading}>
        <label>Employees can choose from the supplemental plans below. Please note that:</label>
        <div className= {styles.supplemental_lines_with_btn}>
          <ul>
            <li>All Aflac supplemental lines require a minimum of two employees to enroll in the same product in order to guarantee issuance. Please contact your producer for more details.</li>
            <li>The Critical Illness and Life plans have different rates based on tobacco use. Employees who select these plans will be asked to provide information about their tobacco use.</li>
            <li>You’ll be able to adjust your specific contributions before finalizing your selected plans.</li>
          </ul>
          <GAButton
            analytics={`Next (${ERShopSupplemental.name})`}
            className={classNames('shop-next-button', styles.nextButton)}
            onClick={() => go(stargate?.mqType || MQType.none)}
          >
            Next
          </GAButton>
        </div>
      </div>
    </Heading>
    { types.map(render) }
    <GAButton
      analytics={`Next (${ERShopSupplemental.name})`}
      className={classNames('shop-next-button', styles.nextButton)}
      onClick={() => go(stargate?.mqType || MQType.none)}
    >
    Next
    </GAButton>
    <BackToTop/>
  </>

  function render(type: GroupPlanType) {
    const showGroupName = plansNames(type)
    return <> { showGroupName &&
    <article key={type}>
      { <h2 className={styles.planTitle}>{showGroupName} Plans</h2>}
      { plan.filter(p => p.plan.type === type).map(plans) }
    </article>
    }
    </>
  }

  function plans(plan: AncillaryPlanUnion) {
    const isSelected = selectedPlanIDs.includes(plan.plan.id)

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
      key: plan.plan.id,
      splits: [],
      plan,
      contributions,
      showWeeklyPayments,
      members
    }

    const planType = typeOfPlan(plan)
    switch (planType) {
    case GroupPlanType.accident:
      return <AccidentPlanComp {...props}/>
    case GroupPlanType.cancer:
      return <CancerPlanComp {...props}/>
    case GroupPlanType.hospital:
      return <HospitalPlan {...props}/>
    case GroupPlanType.std:
      return <ShortTermDisability {...props}/>
    case GroupPlanType.life:
      return <VoluntaryTermLife {...props}/>
    case GroupPlanType.criticalIllness:
      return <CriticleIllness {...props}/>
    }
  }

  function plansNames(type: GroupPlanType) {
    switch (type) {
    case GroupPlanType.accident:
    case GroupPlanType.cancer:
    case GroupPlanType.criticalIllness:
    case GroupPlanType.disability:
      return startCase(type)
    case GroupPlanType.life:
      return 'Voluntary Term Life'
    case GroupPlanType.std:
      return 'Short-Term Disability'
    case GroupPlanType.hospital:
      return 'Hospital Indemnity'
    }
  }

  function go(mqType: MQType) {
    onwards(Promise.resolve({ mqType }))
  }
}

export default ERShopSupplemental
