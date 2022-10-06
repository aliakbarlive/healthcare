import React from 'react'
import styles from './MedicalPlanAdditionalSpecs.module.scss'
import PlanSnapshotSection from './PlanSnapshotSection'
import PlanBox from './PlanBox'
import { moneyString } from 'Utilities/Plans/ContributionCalculator'
import { MedicalPlan } from 'Utilities/pharaoh.types'
import { classNames } from 'Utilities/etc'
import { clickPlanDetailsButtonFor } from './PlanTitle'
import { GAButton } from 'Components/Tracking'
import { useToggle } from 'react-use'
import { ReactComponent as ProsperIcon } from 'Components/Plans/assets/prosper-icon.svg'
import Modal from 'Components/Modals/Modal'
import { isHBA } from './Plan.helpers'
import { AppMode, useAppMode } from 'Components/Stargate/TableOfContents'

interface Props {
  plan: MedicalPlan
  isCollapsed: boolean
  sectionWidth?: number
  refCallback?: any
  isProsper?: boolean // unused now
  isLimitedPlan?: boolean
  infoHandler?: () => void
  showLimitedPlanInfo?: boolean
  toggleShowSBC: () => void
}

const MedicalPlanAdditionalSpecs: React.FC<Props> = ({ plan, isCollapsed, sectionWidth, refCallback, isLimitedPlan, infoHandler, showLimitedPlanInfo, toggleShowSBC }) => {
  const copay = plan.copay
  const prescription = plan.prescription

  const hasOONCoverage = () => plan.oonCoverage
  const isHBAPlan = isHBA(plan.carrier)
  const isHBAUltra = isHBAPlan && !!plan.name.match(/Ultra|Gold/)
  const hasNoOOPMax = isHBAPlan && !!plan.name.match(/MEC 1/)
  const isEmployer = useAppMode() === AppMode.employer
  const additionalPlanCopy = isHBAPlan || isLimitedPlan
  const [showSidecarModal, setShowSidecarModal] = useToggle(false)
  const limitedPlanCopy = <PlanBox className={classNames(styles.medicalSpecsPlanBox, styles.medicalSpecsLimitedPlan)}>
    <p>This is a limited benefits insurance plan and is not an expense incurred medical plan. As the benefits under this plan are limited, you are responsible for any costs not covered by the Benefit Amount. Some coverage is not included under this plan, such as <b>Maternity Care</b>. For details, <button className='link-button' onClick={setShowSidecarModal}>click here</button>.</p>
  </PlanBox>
  const hbaFootnote = <PlanBox className={classNames(styles.medicalSpecsPlanBox, styles.medicalSpecsLimitedPlan)}>
    <h4>MVP Limited Day Medical Plans provide comprehensive and very affordable health plans, but it is important to understand there are limits that will be different than health insurance plans from the “traditional” insurance carriers. Examples include:</h4>
    <ul>
      <li>Day limits for coverages</li>
      <li>Maternity excluded from Bronze plan</li>
      <li>Chemotherapy and radiation excluded in Bronze, Silver and Gold plans</li>
      <li>Kidney Dialysis excluded in Bronze, Silver and Gold plans</li>
      <li>Specialty Rx excluded in Bronze and Silver plans</li>
      <li>Note that all of the above are covered in the Ultra Copay and Ultra HSA HDHP plans.</li>
    </ul>
    <p>Please see the <button className='link-button' onClick={toggleShowSBC}>SBC</button> for more information.</p>
    { isHBAUltra && isEmployer && <p>This plan requires employers to offer an additional HBA plan to employees for compliance reasons. Don’t forget to select a second HBA plan before proceeding.</p> }
  </PlanBox>

  return <PlanSnapshotSection sectionWidth={sectionWidth} flexDirection={'column'} refCallback={refCallback}>
    <WhatIsSidecarModal isOpen={showSidecarModal} onClose={setShowSidecarModal} />
    {showLimitedPlanInfo
      ? whatIsSidecar()
      : <PlanSnapshotSection flexDirection={ isCollapsed ? 'column' : 'row' }>
        <div className={isCollapsed ? styles.collapsedSpecs : styles.expandedSpecs}>
          <div>
            <div className={styles.medicalProsperContainer}>
              <ProsperSpec spec='Medical Bill Saver'/>
              <ProsperSpec spec='Health Advocacy'/>
              <ProsperSpec spec='Telehealth'/>
              <ProsperSpec spec='Work/Life Care Management'/>
            </div>
          </div>
          <div>
            <div className={`${styles.medicalSpecsContainer} ${styles.medicalSpecsLeftAlign}`}>
              { prosperOnlyBox() }
              <PlanBox className={classNames(styles.medicalSpecsPlanBox, styles.visitAndPrescContainer)}>
                {isLimitedPlan
                  ? <>
                    <p className={styles.medicalLabel}>Prescriptions</p>
                    <div className={styles.medicalLimitedPlanBox}>
                      <p>If prescription coverage is elected, pays a fixed amount for any eligible prescriptions</p>
                    </div>
                  </>
                  : <>
                    <p className={styles.medicalLabel}>
                    Copay <span>{copay.conditional && `(${copay.conditional})`}</span>{asterisk()}
                    </p>
                    <div className={styles.medicalVisitAndPrescLabel}>
                      <p>Primary:</p>
                      {visitAndPrescCopy(copay.primaryCarePhysician, plan, isLimitedPlan)}
                    </div>
                    <div className={styles.medicalVisitAndPrescLabel}>
                      <p>Specialist:</p>
                      {visitAndPrescCopy(copay.specialist, plan, isLimitedPlan)}
                    </div>
                    <div className={styles.medicalVisitAndPrescLabel}>
                      <p>Urgent Care:</p>
                      {visitAndPrescCopy(copay.urgentCare, plan, isLimitedPlan)}
                    </div>
                  </>
                }
              </PlanBox>
              <PlanBox className={classNames(styles.medicalSpecsPlanBox, styles.visitAndPrescContainer)}>
                { isLimitedPlan
                  ? <>
                    <p className={styles.medicalLabel}>Medically Necessary Care</p>
                    <div className={styles.medicalLimitedPlanBox}>
                      <p>Pays a fixed amount for any eligible service needed to preserve or restore your health</p>
                    </div>
                  </>
                  : <>
                    <p className={styles.medicalLabel}>
                    Rx Cost <span>{prescription.conditional && `(${prescription.conditional})`}</span>{asterisk()}
                    </p>
                    <div className={styles.medicalVisitAndPrescLabel}>
                      <p>Generic:</p>
                      {visitAndPrescCopy(prescription.generic, plan, isLimitedPlan)}
                    </div>
                    <div className={styles.medicalVisitAndPrescLabel}>
                      <p>Preferred:</p>
                      {visitAndPrescCopy(prescription.preferredBrand, plan, isLimitedPlan)}
                    </div>
                    <div className={styles.medicalVisitAndPrescLabel}>
                      <p>Specialty:</p>
                      {visitAndPrescCopy(prescription.specialty, plan, isLimitedPlan)}
                    </div>
                  </>
                }
              </PlanBox>
            </div>
          </div>
        </div>
        <div className={isCollapsed ? styles.collapsedSpecs : styles.expandedSpecs}>
          <div className={styles.medicalSpecsContainer}>
            { prosperOnlyBox() }
            <PlanBox className={styles.medicalSpecsPlanBox}>
              <p className={styles.medicalLabel}>Deductible{asterisk()}</p>
              {planSpecsCopy(plan.deductible, isLimitedPlan)}
            </PlanBox>
            <PlanBox className={`${oonCoverageStyle()} ${styles.medicalSpecsPlanBox}`}>
              <p className={styles.medicalLabel}>{`${isLimitedPlan ? 'Annual Max Benefit' : 'OOP Max'}`}</p>
              { hasNoOOPMax
                ? <div className={styles.medicalPlanSpecsCopy}>n/a</div>
                : planSpecsCopy(plan.oopMax)
              }
            </PlanBox>
            <PlanBox className={`${oonCoverageStyle()} ${styles.medicalSpecsPlanBox}`}>
              <p className={styles.medicalLabel}>Co-insurance</p>
              {planSpecsCopy(plan.coinsurance)}
            </PlanBox>
            { !hasOONCoverage() && !isLimitedPlan &&
              <PlanBox className={styles.medicalSpecsAsteriskPlanBox}>
                {asterisk()}
                <p>NO / limited out of network coverage or copay contribution. Please see {<GAButton analytics={`SBC (${MedicalPlanAdditionalSpecs.name})`} className='link-button' onClick={() => clickPlanDetailsButtonFor(plan)}>SBC</GAButton>} for more details</p>
              </PlanBox>
            }
          </div>
          {isCollapsed && additionalPlanCopy &&
            <div className={styles.medicalSpecsContainer}>
              {isLimitedPlan && limitedPlanCopy}
              {isHBAPlan && hbaFootnote}
            </div>
          }
        </div>
      </PlanSnapshotSection>
    }
    {!isCollapsed && additionalPlanCopy &&
      <div>
        {isLimitedPlan && limitedPlanCopy}
        {isHBAPlan && hbaFootnote}
      </div>
    }
  </PlanSnapshotSection>

  function whatIsSidecar() {
    return <div className={styles.medicalProsperContainer}>
      <PlanBox className={classNames(styles.medicalProsperPlanBox, styles.whatIsSidecar)}>
        <div>
          <h3>What is Sidecar Health?</h3>
          <button onClick={infoHandler}>
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M13.6213 2.12132L14.3284 1.41422L12.9142 0L12.2071 0.707108L7.16418 5.75L2.12129 0.707108L1.41418 0L-2.89679e-05 1.41422L0.707078 2.12132L5.74997 7.16421L0.707078 12.2071L-2.91129e-05 12.9142L1.41418 14.3284L2.12129 13.6213L7.16418 8.57843L12.2071 13.6213L12.9142 14.3284L14.3284 12.9142L13.6213 12.2071L8.5784 7.16422L13.6213 2.12132Z" fill="#1F1A5D" />
            </svg>
          </button>
        </div>
        <p>
          Sidecar Health is a new kind of insurance. Sidecar Health members can pay for care directly when they get it using the Sidecar Health Visa card. As a result, members can see any doctor, all coverage is transparent and members typically see significant healthcare cost savings compared to traditional insurance. Sidecar Health pays a fixed amount for any eligible service or prescription drug. If a provider charges more than the fixed amount, the member is responsible for the difference. If a provider charges less (which they may often do when paid up front), the member keeps the difference.
        </p>
        <p>
          Members can research provider charges, view their benefits, and submit expenses on the Sidecar Health website and app. All coverages are subject to the terms, conditions, limitations, and exclusions of the policy. Coverage may vary or may not be available in all states. Sidecar Health issues only individual policies. Coverage is administered by Sidecar Health Insurance Solutions, LLC. Insurance plans are underwritten by United States Fire Insurance Company and Sirius America Insurance Company. For more information, <button className='link-button' onClick={setShowSidecarModal}>click here</button>.
        </p>
      </PlanBox>
    </div>
  }

  // For when we remove the asterisk box
  function oonCoverageStyle() {
    if (hasOONCoverage() && !isCollapsed && !isLimitedPlan) {
      return styles.oonSpecsPlanBox
    }
  }

  function asterisk() {
    return !hasOONCoverage() && !isLimitedPlan && <span className={styles.asterisk}>*</span>
  }

  function planSpecsCopy(amt: string, networkAgnostic = false) {
    amt = amt.split('.')[0]
    switch (true) {
    case isPercentageAmt(amt): {
      const youPayPercentage = parseInt(amt.substring(0, amt.length - 1))
      const coveredPercentage = 100 - youPayPercentage
      return <div className={styles.medicalPlanSpecsCopy}>
        <p className={styles.coveredFigure}>{`${coveredPercentage}%`}</p>
        <p className={styles.coveredText}>covered</p>
        { !isZeroAmt(amt) &&
          <>
            <p className={styles.youPayText}>you pay</p>
            <p className={styles.youPayFigure}>{`${youPayPercentage}%`}</p>
          </>
        }
      </div>
    }
    case isDollarAmt(amt):
      return <div className={styles.medicalPlanSpecsCopy}>
        <p style={{ color: isZeroAmt(amt) ? '#29B473' : '#17346F' }} className={styles.dollarFigure}>{moneyString(amt)}<span>/yr</span></p>
        <p style={{ color: isZeroAmt(amt) ? '#29B473' : '#17346F' }} className={styles.inNetwork}>
          { networkAgnostic
            ? 'this plan has no network requirements'
            : 'in-network'
          }
        </p>
        {/* Add after we have in/out network information in plans <p>NO out of network contribution</p> */}
      </div>
    default:
      return <div className={styles.medicalPlanSpecsCopy}>
        <p className={styles.dollarFigure}>{amt}</p>
        {!isLimitedPlan &&
          <p className={styles.inNetwork}>in-network</p>
        }
        {/* Add after we have in/out network information in plans <p>NO out of network contribution</p> */}
      </div>
    }
  }

  function prosperOnlyBox() {
    // we used to do different things for “individuals mode” but this no longer exists
  }
}

const ProsperSpec:React.FC<{spec: string}> = ({ spec }) => {
  return <PlanBox className={styles.medicalProsperPlanBox}>
    <ProsperIcon/>
    <p className={styles.medicalLabel}>{spec}</p>
    <div>
      <p className={styles.prosper100}>100%</p>
      <p className={styles.prosperCovered}>Covered</p>
    </div>
  </PlanBox>
}

const WhatIsSidecarModal: React.FC<{ isOpen: boolean, onClose: () => void }> = ({ isOpen, onClose }) => {
  return <Modal
    gaModalName={WhatIsSidecarModal.name}
    isOpen={isOpen}
    onRequestClose={onClose}
    header='What is Sidecar Health?'
    contentClassName={styles.whatIsSidecarModal}
  >
    <object title="What is Sidecar Health?" width="100%" height="100%" data={'https://s3.amazonaws.com/documents-pub.candor.insurance/what-is-sidecar.pdf#toolbar=0&navpanes=0&scrollbar=0'} type="application/pdf"></object>
  </Modal>
}

const isZeroAmt = (amt: string) => amt === '0' || amt === '$0' || amt === '0%'
const isDollarAmt = (amt: string) => amt.startsWith('$') && amt.length < 5
const isPercentageAmt = (amt: string) => amt.endsWith('%') && amt.length < 5
const isLongText = (val: string) => val.length > 20

export function visitAndPrescCopy(copay: string, plan: MedicalPlan, isLimitedPlan?: boolean, forProposal?: boolean) {
  copay = copay.split('.')[0]
  switch (true) {
  case isLongText(copay):
  {
    const sbcText = isLimitedPlan ? 'FAQs' : 'SBC'
    const sbcReference = forProposal ? sbcText : <GAButton analytics={`SBC (${MedicalPlanAdditionalSpecs.name})`} className='link-button' onClick={() => clickPlanDetailsButtonFor(plan)}> {sbcText} </GAButton>
    return <p>See {sbcReference} for more details</p>
  }
  case isZeroAmt(copay):
    return <p>100% covered</p>
  case isPercentageAmt(copay):
    return <p>{`${copay}`} covered</p>
  case isDollarAmt(copay):
    return <p>{`${moneyString(copay)}`}</p>
  default:
    return <p>{`${copay}`}</p>
  }
}

export default MedicalPlanAdditionalSpecs
