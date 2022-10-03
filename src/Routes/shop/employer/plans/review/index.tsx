/* eslint-disable camelcase */
import React, { useEffect } from 'react'
import { Route } from 'Utilities/Route'
import { PrivateWizardPageProps } from 'Components/Stargate/Wizard/WizardRoute'
import { Link, useHistory } from 'react-router-dom'
import useContentAdjustment from 'Utilities/Hooks/useContentAdjustment'
import { useAsync, useToggle, useSet, useLocation } from 'react-use'
import { MedicalPlan } from 'Utilities/pharaoh.types'
import Loader from 'Components/Rudimentary/Loader'
import Error from 'Components/Primitives/Error'
import RemovePlansModal from './components/RemovePlansModal'
import SendPlansModal from './components/SendPlansModal'
// import ProsperBenefitsHeader from './components/ProsperBenefitsHeader'
import RequestReview from './components/RequestReview'
import ReviewPlansList from './components/ReviewPlansList'
import * as api from 'Utilities/pharaoh'
import useToast from 'Utilities/Hooks/useToast'
import { Carriers, isABC } from 'Components/Plans/plan-subcomponents/Plan.helpers'
import SidecarPaymentModal from './components/SidecarPaymentModal'
import ContributionsCalculator, { AncillaryPlanUnion } from 'Utilities/Plans/ContributionCalculator'
import { isVision } from 'Components/Plans/VisionPlan/index.helpers'
import { isDental } from 'Components/Plans/DentalPlan/index.helpers'
import { ReactComponent as ReviewPlansHero } from './components/review-plans-hero.svg'
import styles from './index.module.scss'
import Heading from 'Components/Stargate/Heading'
import { OverallCart } from '../contribution'

const ERShopPlansReview: React.FC<PrivateWizardPageProps> = ({ stargate, ...props }) => {
  const { group, members, splits, contributions } = stargate
  const [isRemovePlansModalOpen, toggleRemovePlansModal] = useToggle(false)
  const [isRequestReviewModalOpen, toggleRequestReviewModal] = useToggle(false)
  const [isSidecarPaymentModalOpen, toggleSidecarPaymentModalOpen] = useToggle(false)
  const [planIDsToRemove, { toggle: togglePlanIDToRemove }] = useSet<string>()
  const history = useHistory()
  const addToast = useToast()
  const anchor = useLocation().hash?.replace('#', '')
  useContentAdjustment({ maxWidth: 'unset', padding: 0 })

  useEffect(() => {
    if (anchor) {
      const element = document.getElementById(anchor)
      if (element) {
        const elementPosition = element.getBoundingClientRect().top
        const offsetPosition = elementPosition - 200
        window.scrollBy({ top: offsetPosition, behavior: 'smooth' })
      }
    }
  })

  const { value, error, loading } = useAsync(async() => {
    const medical = await api.v3.groups(group?.id).plans.GET() as MedicalPlan[]
    const ancillary = await api.v3.groups(group?.id).plans.options.ancillary.selected() as AncillaryPlanUnion[]
    return await Promise.all([medical, ancillary])
  })

  if (!group || !contributions) return <Error error='Please complete earlier steps'/>
  if (loading) return <Loader />
  if (error) return <Error error={error} />

  const plans = extractPlans()
  const allPlans = [...plans.medical, ...plans.dental, ...plans.vision]
  const calc = new ContributionsCalculator(allPlans, contributions, splits, members, stargate.config.moneyDecimals)
  const hasABC = value![1].some(p => isABC(p.plan.carrier))

  return <>
    <RemovePlansModal
      isOpen={isRemovePlansModalOpen}
      planIDsToRemove={planIDsToRemove}
      plans={plans.medical}
      handleRemoveContinue={handleRemoveContinue}
      members={members}
      onClose={toggleRemovePlansModal}
    />
    <SendPlansModal
      isOpen={isRequestReviewModalOpen}
      onRequestClose={toggleRequestReviewModal}
      members={members}
      callback={handleSendPlans}
    />
    <SidecarPaymentModal
      groupId={group?.id}
      onwards={onwards}
      isOpen={isSidecarPaymentModalOpen}
      onRequestClose={toggleSidecarPaymentModalOpen}
    />
    <Heading className={styles.heading} innerclassname={styles.headingInner}>
      <div>
        <h1>Review Plan Selections</h1>
        <ol>
          <li>Review your plans below, make sure your contributions are correct, and then click finalize plan selections to continue.</li>
          <li>You can then invite your employees to begin selecting their coverage and we will contact you with next steps.</li>
          {hasABC && <li>As part of the ABC Trust Insurance package, $10,000 group life is included for this group.</li>}
        </ol>
        <button className='shop-next-button' onClick={onwards}>Finalize Plan Selections</button>
        <Link to={'#total'}>Review Estimated Total Costs</Link>
      </div>
      <div>
        <ReviewPlansHero/>
        <div className={styles.disclaimer}>*Pricing is illustrative. It is not final until&nbsp;<br/>bound by insurance carriers.</div>
      </div>
    </Heading>
    <RequestReview requestClose={toggleRequestReviewModal}/>
    {/* <ProsperBenefitsHeader/> */}
    <div className={styles.backToContainer}>
      <svg width="12" height="20" viewBox="0 0 12 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M11.67 1.77L9.9 0L0 9.9L9.9 19.8L11.67 18.03L3.54 9.9L11.67 1.77Z" fill="#3564B9"/>
      </svg>
      <Link to={Route.erStargate_Plans}>Back to Plan Selection</Link>
    </div>
    <ReviewPlansList
      contributions={contributions}
      splits={splits}
      members={members}
      medicalPlans={plans.medical}
      dentalPlans={plans.dental}
      visionPlans={plans.vision}
      handleRemove={togglePlanIDToRemove}
      planIDsToRemove={planIDsToRemove}
      config={stargate.config}
    />
    <OverallCart
      plans={allPlans}
      calc={calc}
      showWeeklyPayments={stargate.config.showWeeklyPayments}
    >
      <button className='shop-next-button' onClick={onwards}>Finalize Plan Selections</button>
    </OverallCart>
  </>

  async function onwards() {
    if (planIDsToRemove.size > 0) {
      toggleRemovePlansModal()
    } else {
      if (plans.medical.some(p => p.carrier === Carriers['Sidecar Health'])) {
        try {
          const sidecarGroup = await api.v3.integrations.sidecar.group(group?.id).GET().catch(error => {
            if (error.json?.reason !== 'GroupSlugs not found for this input.') throw error
          })
          if (!sidecarGroup) {
            toggleSidecarPaymentModalOpen(!sidecarGroup)
            return
          }
        } catch (error) {
          addToast(error as Error)
        }
      }
      props.onwards(validatePlans())
    }
  }

  function handleSendPlans(email: string) {
    return api.v2.groups(group?.id).invite.manager(email)
  }

  function validatePlans() {
    return api.v3.groups(group?.id).plans.validate()
  }

  async function handleRemoveContinue(planIDs: string[]) {
    const promises = Promise.all(planIDs.map(id => api.v2.groups(group?.id).plans.DELETE(id)))

    try {
      await promises.then(() => { planIDs.map(id => togglePlanIDToRemove(id)) }).then(validatePlans)
    } catch (error) {
      location.reload() // This is a hack, but the overflow from the modal isn't clearing on close
      return
    }

    if (planIDs.length === plans.medical.length) {
      return goBack()
    }

    props.onwards(Promise.resolve())
  }

  function goBack() {
    history.push({
      pathname: Route.erStargate_Plans,
      state: { levelFundedModalConfirmed: true }
    })
  }

  function extractPlans() {
    return {
      medical: value![0],
      dental: value![1].filter(({ plan }) => isDental(plan)) as AncillaryPlanUnion[],
      vision: value![1].filter(({ plan }) => isVision(plan)) as AncillaryPlanUnion[]
    }
  }
}

export default ERShopPlansReview
