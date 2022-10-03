import React from 'react'
import styles from '../index.module.scss'
import DentalPlanComponent from 'Components/Plans/DentalPlan'
import MedicalPlanComponent from 'Components/Plans/MedicalPlan'
import VisionPlanComponent from 'Components/Plans/VisionPlan'
import { ContributionSplit, Member, StargateConfig } from 'Utilities/Hooks/useStargate'
import { MedicalPlan, TieredRates } from 'Utilities/pharaoh.types'
import DentalPlan from 'Components/Plans/DentalPlan/index.helpers'
import VisionPlan from 'Components/Plans/VisionPlan/index.helpers'
import { Contributions, AncillaryPlanUnion, allAncillaryContributionEligibleLines, moneyString } from 'Utilities/Plans/ContributionCalculator'
import { isHBA, typeOfPlan } from 'Components/Plans/plan-subcomponents/Plan.helpers'
import { classNames, stringsToSentence } from 'Utilities/etc'
import ProsperPlan from 'Components/Plans/ProsperPlan'

interface Props {
  medicalPlans: MedicalPlan[]
  dentalPlans: AncillaryPlanUnion[]
  visionPlans: AncillaryPlanUnion[]
  planIDsToRemove: Set<string>
  contributions: Contributions
  splits: ContributionSplit[]
  members: Member[]
  config: StargateConfig
  handleRemove: (id: string) => void
}

const ReviewPlansList: React.FC<Props> = ({ medicalPlans, dentalPlans, visionPlans, splits, members, handleRemove, planIDsToRemove, contributions, config }) => {
  return <section className={styles.plansContainer}>
    { renderMedicalPlans() }
    <ProsperPlan isIncluded={true} nonWaivedMemberCount={members.filter(m => !m.is_waived).length} label={config.label}/>
    { renderMultiLineContribution() }
    { renderDentalPlans() }
    { renderVisionPlans() }
  </section>

  function renderMedicalPlans() {
    if (medicalPlans.length < 1) { return }

    return <>
      <h2>Medical</h2>
      { medicalPlans.map(plan =>
        <React.Fragment key={plan.id}>
          <MedicalPlanComponent
            plan={plan}
            contributions={contributions}
            splits={splits}
            members={members}
            selectedForRemoval={planIDsToRemove.has(plan.id)}
            deleteHandler={handleRemove}
            showWeeklyPayments={config.showWeeklyPayments}
            label={config.label}
          />
          {isHBA(plan.carrier) && hbaDisclaimer()}
        </React.Fragment>
      )}
    </>
  }

  function renderDentalPlans() {
    if (dentalPlans.length < 1) { return }
    return <>
      <h2>Dental</h2>
      { dentalPlans.map(plan =>
        <React.Fragment key={plan.plan.id}>
          <DentalPlanComponent
            plan={plan as {rate: TieredRates, plan: DentalPlan, isRenewal: boolean}}
            contributions={contributions}
            members={members}
            key={plan.plan.id}
            showWeeklyPayments={config.showWeeklyPayments}
            label={config.label}
          />
        </React.Fragment>
      )}
    </>
  }

  function renderVisionPlans() {
    if (visionPlans.length < 1) { return }
    return <>
      <h2>Vision</h2>
      { visionPlans.map(plan =>
        <React.Fragment key={plan.plan.id}>
          <VisionPlanComponent
            plan={plan as {rate: TieredRates, plan: VisionPlan, isRenewal: boolean}}
            contributions={contributions}
            members={members}
            key={plan.plan.id}
            showWeeklyPayments={config.showWeeklyPayments}
            label={config.label}
          />
        </React.Fragment>
      )}
    </>
  }

  function renderMultiLineContribution() {
    const contribution = contributions.baseContributions.allAncillary
    const hasMultiLineEligiblePlans = ![...dentalPlans, ...visionPlans].some(p => allAncillaryContributionEligibleLines().has(typeOfPlan(p)))
    if (!contribution || hasMultiLineEligiblePlans) return

    const plans = stringsToSentence(...Array.from(allAncillaryContributionEligibleLines()))
    return <div className={classNames(styles.contributionLine, styles.multiLineContribution)}>
      <div><span>Employees have a fixed amount to spend across {plans} plans</span></div>
      <div>{moneyString(contribution)} Flat Contribution</div>
    </div>
  }

  function hbaDisclaimer() {
    return <div className={styles.hbaDisclaimer}>
      <div className={styles.innerBox}>
        <svg width="105" height="20" viewBox="0 0 105 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM11 15H9V13H11V15ZM11 11H9V5H11V11Z" fill="#3564B9"/>
          <path d="M29.056 15H33.264C36.608 15 38.928 12.888 38.928 9.672C38.928 6.456 36.608 4.328 33.264 4.328H29.056V15ZM31.328 13V6.328H33.264C35.456 6.328 36.608 7.784 36.608 9.672C36.608 11.48 35.376 13 33.264 13H31.328ZM41.5004 6.136C42.1724 6.136 42.7164 5.592 42.7164 4.92C42.7164 4.248 42.1724 3.704 41.5004 3.704C40.8444 3.704 40.2844 4.248 40.2844 4.92C40.2844 5.592 40.8444 6.136 41.5004 6.136ZM40.4924 15H42.5244V7.272H40.4924V15ZM43.8673 13.992C44.6833 14.744 45.9793 15.192 47.3233 15.192C49.4673 15.192 50.6673 14.136 50.6673 12.712C50.6673 10.792 48.8913 10.44 47.5633 10.184C46.6993 10.008 46.0913 9.832 46.0913 9.352C46.0913 8.904 46.5713 8.632 47.3073 8.632C48.2513 8.632 49.1313 9.032 49.5953 9.528L50.3953 8.136C49.6433 7.528 48.6033 7.08 47.2913 7.08C45.2593 7.08 44.1233 8.216 44.1233 9.512C44.1233 11.352 45.8353 11.672 47.1633 11.928C48.0433 12.104 48.7153 12.296 48.7153 12.84C48.7153 13.32 48.2993 13.624 47.4193 13.624C46.4593 13.624 45.3073 13.096 44.7473 12.568L43.8673 13.992ZM51.6683 11.128C51.6683 13.512 53.3803 15.192 55.7643 15.192C57.3483 15.192 58.3083 14.504 58.8203 13.784L57.4923 12.552C57.1243 13.064 56.5643 13.384 55.8602 13.384C54.6283 13.384 53.7643 12.472 53.7643 11.128C53.7643 9.784 54.6283 8.888 55.8602 8.888C56.5643 8.888 57.1243 9.192 57.4923 9.72L58.8203 8.488C58.3083 7.768 57.3483 7.08 55.7643 7.08C53.3803 7.08 51.6683 8.76 51.6683 11.128ZM60.1486 15H62.1806V4.328H60.1486V15ZM68.8355 15H70.8675V10.008C70.8675 7.784 69.2515 7.08 67.4915 7.08C66.2755 7.08 65.0595 7.464 64.1155 8.296L64.8835 9.656C65.5395 9.048 66.3075 8.744 67.1395 8.744C68.1635 8.744 68.8355 9.256 68.8355 10.04V11.112C68.3235 10.488 67.4115 10.168 66.3875 10.168C65.1555 10.168 63.6995 10.824 63.6995 12.632C63.6995 14.36 65.1555 15.192 66.3875 15.192C67.3955 15.192 68.3075 14.824 68.8355 14.2V15ZM68.8355 13.144C68.4995 13.592 67.8595 13.816 67.2035 13.816C66.4035 13.816 65.7475 13.4 65.7475 12.68C65.7475 11.944 66.4035 11.512 67.2035 11.512C67.8595 11.512 68.4995 11.736 68.8355 12.184V13.144ZM73.891 6.136C74.563 6.136 75.107 5.592 75.107 4.92C75.107 4.248 74.563 3.704 73.891 3.704C73.235 3.704 72.675 4.248 72.675 4.92C72.675 5.592 73.235 6.136 73.891 6.136ZM72.883 15H74.915V7.272H72.883V15ZM86.5139 15H88.5619V9.416C88.5619 7.832 87.7139 7.08 86.2899 7.08C85.1059 7.08 84.0819 7.784 83.6339 8.488C83.3459 7.608 82.6259 7.08 81.4899 7.08C80.3059 7.08 79.2819 7.816 78.9619 8.28V7.272H76.9299V15H78.9619V9.8C79.2659 9.368 79.8579 8.888 80.5619 8.888C81.3939 8.888 81.7139 9.4 81.7139 10.12V15H83.7619V9.784C84.0499 9.368 84.6419 8.888 85.3619 8.888C86.1939 8.888 86.5139 9.4 86.5139 10.12V15ZM90.0589 11.128C90.0589 13.608 91.8349 15.192 94.1869 15.192C95.3869 15.192 96.5869 14.84 97.3709 14.12L96.4749 12.808C95.9789 13.288 95.1309 13.576 94.4109 13.576C93.0989 13.576 92.3149 12.76 92.1869 11.784H97.9309V11.336C97.9309 8.808 96.3629 7.08 94.0589 7.08C91.7069 7.08 90.0589 8.888 90.0589 11.128ZM94.0589 8.696C95.4029 8.696 95.9149 9.672 95.9629 10.408H92.1549C92.2509 9.64 92.7949 8.696 94.0589 8.696ZM99.3986 15H101.431V9.896C101.767 9.4 102.663 9.032 103.335 9.032C103.559 9.032 103.751 9.048 103.895 9.08V7.096C102.935 7.096 101.975 7.64 101.431 8.328V7.272H99.3986V15Z" fill="#16346F"/>
        </svg>
        <p>
          When purchasing this plan in certain states, there may be a 1-6% procurement tax which is the responsibility of the policyholder to pay.
          You may refer to <b><a href='https://captiveexperts.com/Self_Procurement_Taxes.html' target='_blank' rel='noreferrer'>this site</a></b> for more information and we advise that you seek the advice of a tax professional.
        </p>
      </div>
    </div>
  }
}

export default ReviewPlansList
