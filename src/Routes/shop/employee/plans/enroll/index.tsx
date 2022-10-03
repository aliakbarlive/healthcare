/* eslint-disable camelcase */
import React from 'react'
import { PrivateWizardPageProps } from 'Components/Stargate/Wizard/WizardRoute'
import styles from './index.module.scss'
import Loader from 'Components/Rudimentary/Loader'
import { Label } from 'Utilities/config'
import EEMedicalPlan from 'Components/Plans/EEMedicalPlan'
import ProsperPlan from 'Components/Plans/ProsperPlan'
import useFullContentArea from 'Utilities/Hooks/useFullContentArea'
import { useAsync } from 'react-use'
import { MedicalPlan, TieredRates } from 'Utilities/pharaoh.types'
import Error from 'Components/Primitives/Error'
import DentalPlanComponent from 'Components/Plans/DentalPlan'
import VisionPlanComponent from 'Components/Plans/VisionPlan'
import LifePlanComponent from 'Components/Plans/LifePlan'
import { Route } from 'Utilities/Route'
import { useHistory } from 'react-router-dom'
import { allAncillaryContributionEligibleLines, AncillaryPlanUnion, moneyNumber } from 'Utilities/Plans/ContributionCalculator'
import { Carriers, PremiumSplits } from 'Components/Plans/plan-subcomponents/Plan.helpers'
import LTDPlanComponent from 'Components/Plans/LTDPlan'
import * as api from 'Utilities/pharaoh'
import CartSummary from 'Components/Stargate/Enroll/components/CartSummary'
import DentalPlan from 'Components/Plans/DentalPlan/index.helpers'
import VisionPlan from 'Components/Plans/VisionPlan/index.helpers'
import LifePlan from 'Components/Plans/LifePlan/index.helpers'
import LTDPlan from 'Components/Plans/LTDPlan/index.helpers'
import Heading from 'Components/Stargate/Heading'
import { compact } from 'lodash'

interface Response {
  healthPlan?: MedicalPlan
  dentalPlan?: AncillaryPlanUnion
  visionPlan?: AncillaryPlanUnion
  lifePlan?: AncillaryPlanUnion
  disabilityPlan?: AncillaryPlanUnion
  supplementalPremiums: AncillaryPlanUnion[]
  premiums: {
    medical: Premium
    dental: Premium
    vision: Premium
    life: Premium
    disability: Premium
  }
}

interface Premium {
  premium: string
  contribution: string
  split: PremiumSplits
}

const EEShopPlansEnroll: React.FC<PrivateWizardPageProps> = ({ stargate, ...props }) => {
  const { nonWaivedMemberCount, group, groupMember, userTier, contributions, splits, members } = stargate
  const prosper = stargate.carrierSpecificData?.prosper
  const { loading, error, value } = useAsync(async() => await api.v3.members(groupMember?.id).selections.GET() as Response)
  const history = useHistory()
  const member = members.find(m => m.id === groupMember?.id)!
  useFullContentArea()

  if (!group || !groupMember || !userTier || !member || !contributions) return <Error error='Please complete earlier steps'/>
  if (loading) return <Loader />
  if (error) return <Error error={error} />

  const { healthPlan, dentalPlan, visionPlan, lifePlan, disabilityPlan, premiums } = value!
  const basePlanProps = {
    contributions,
    member,
    showWeeklyPayments: stargate.config.showWeeklyPayments,
    label: stargate.config.label
  }

  return <>
    <Heading innerclassname={styles.cartContainer}>
      <div>
        <div className={styles.reviewPlans}>
          <h1>Review Your Plans</h1>
        </div>
        <ol className={styles.orderedList}>
          <li className={styles.enrollInfo}>Review your selected plans offered by your employer.</li>
          <li className={styles.enrollInfo}>Change any plans you do not want</li>
          <li className={styles.enrollInfo}>Click “Finalize Selections” when you are ready</li>
          {stargate.config.label === Label.blacksmith &&
          <p><a href="https://public.myhealthily.com/blacksmith/model-general-notice.doc">Click here to view your employee Cobra rights</a></p>
          }
        </ol>
      </div>
      {cart()}
    </Heading>
    <div className={styles.plansContainer}>
      {medical()}
      {ancillary()}
      {prosperPlan()}
    </div>
  </>

  function medical() {
    if (!healthPlan) return
    return <section>
      <div className={styles.medicalSectionHeader}>
        <h2>Medical Plan</h2>
        <button className={styles.backToPlans} onClick={backToSelect}>Change plan</button>
      </div>
      <EEMedicalPlan
        plan={healthPlan}
        premium={premiums.medical.split}
        splits={splits}
        {...basePlanProps}
      />
    </section>
  }

  function prosperPlan() {
    if (!healthPlan && !prosper?.signedUp) return
    return <section>
      <h2>Prosper Benefits+</h2>
      <ProsperPlan
        isIncluded={healthPlan !== undefined}
        nonWaivedMemberCount={nonWaivedMemberCount || 0}
        label={stargate.config.label}
        prosperOnlyCost={moneyNumber(prosper?.signedUpRate || prosper?.currentRate)}
      />
    </section>
  }

  function ancillary() {
    if (!dentalPlan && !visionPlan && !lifePlan && disabilityPlan) return
    return <section>
      { <h2>Ancillary Plans</h2> }
      {dentalPlan && <DentalPlanComponent
        plan={dentalPlan as { rate: TieredRates, plan: DentalPlan, isRenewal: boolean}}
        premium={premiums.dental.split}
        key={dentalPlan.plan.id}
        {...basePlanProps}
      />}
      {visionPlan && <VisionPlanComponent
        plan={visionPlan as { rate: TieredRates, plan: VisionPlan, isRenewal: boolean }}
        premium={premiums.vision.split}
        {...basePlanProps}
      />}
      {lifePlan && <LifePlanComponent
        plan={lifePlan as { rate: TieredRates, plan: LifePlan, isRenewal: boolean }}
        premium={premiums.life.split}
        key={lifePlan.plan.id}
        {...basePlanProps}
      />}
      {disabilityPlan && <LTDPlanComponent
        plan={disabilityPlan as { rate: TieredRates, plan: LTDPlan, isRenewal: boolean }}
        premium={premiums.disability.split}
        key={disabilityPlan.plan.id}
        {...basePlanProps}
      />}
    </section>
  }

  function cart() {
    const multiLineContribution = contributions?.baseContributions.allAncillary ? moneyNumber(contributions?.baseContributions.allAncillary) : undefined
    return <CartSummary
      callback={onwards}
      premiums={{ ...premiums, prosper: { split: { er: '$0', ee: '$0' } } }} // Unused right now
      contributions={contributions!} // Safe bang because of the condition above
      member={member}
      splits={splits}
      plans={compact([healthPlan, dentalPlan, visionPlan, lifePlan, disabilityPlan])}
      multiLineContribution={multiLineContribution}
      eligibleLines={Array.from(allAncillaryContributionEligibleLines())}
      showWeeklyPayments={stargate.config.showWeeklyPayments}
      standaloneProsper={prosper}
    />
  }

  async function onwards() {
    const hasSidecar = healthPlan?.carrier === Carriers['Sidecar Health']
    props.onwards(Promise.resolve({ showUnderwritingPage: stargate.showUnderwritingPage, hasSidecar }))
  }

  function backToSelect() {
    history.push(Route.eeStargate_select)
  }
}

export default EEShopPlansEnroll
