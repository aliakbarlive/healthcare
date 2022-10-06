/* eslint-disable camelcase */
import React, { ReactElement } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Route } from 'Utilities/Route'
import { isAuthenticated, v3 } from 'Utilities/pharaoh'
import useStargate, { StargateResponse as Stargate, CarrierApplicationStatus, MQType } from 'Utilities/Hooks/useStargate'
import { SidecarApplicationState } from 'Routes/shop/employee/plans/application/SidecarEEApplication'
import { GAButton } from 'Components/Tracking'
import { Carriers, isAllstate } from 'Components/Plans/plan-subcomponents/Plan.helpers'
import useUser, { PowerLevel, Response as User } from 'Utilities/Hooks/useUser'
import styles from './TableOfContents.module.scss'
import { Section, Chapter, State } from './Section'

interface Venues {
  groups: { id: string, name: string }[]
  anubis: { ee: string[], er: string[], agency: boolean }
  stargate: { ee: string[], er: string[] }
}

export enum AppMode {
  agency = 'agency', employee = 'employee', employer = 'employer', landing = 'landing'
}
export enum ShopType {
  agency = 'agency', employee = 'ee', employer = 'er'
}
export enum ChapterName {
  agencyChap = 'agChap', employeeChap = 'eeChap', employerChap = 'erChap'
}

const ToC: React.FC = () => {
  const location = useLocation()
  const isStargate = location.pathname.startsWith(Route.stargate)
  const appMode = useAppMode()
  const stargate = useStargate().value
  const withBrokerReturn = (stargate?.user.power_level || PowerLevel.individual) >= PowerLevel.broker && appMode !== AppMode.agency
  const userData = stargate?.user
  const userName = `${userData?.first_name || ''} ${userData?.last_name || ''}`
  const async = useUser<[User, Venues]>(async user => {
    const venues = await v3.users().venues() as Venues
    return [user, venues]
  })
  const groupName = async.value?.[1].groups[0]?.name || ''
  let sections

  if (!isStargate) {
    return <></>
  }

  switch (appMode) {
  case AppMode.agency:
    sections = <AgencySections stargate={stargate} userName={userName} groupName={groupName} />
    break
  case AppMode.employee:
    sections = <EmployeeSections stargate={stargate} userName={userName} groupName={groupName} />
    break
  case AppMode.employer:
    sections = <EmployerSections stargate={stargate} userName={userName} groupName={groupName} />
    break
  }

  if (!sections) return <></>

  return <div className={styles.bgContainer}>
    <div className={styles.container}>
      <div className={styles.sections}>
        {sections}
      </div>
    </div>
    <SignOutLink withBrokerReturn={withBrokerReturn} />
  </div>
}

interface SectionProps {
  stargate: Stargate | undefined
  userName: string
  groupName: string
}

const AgencySections: React.FC<SectionProps> = ({ stargate }: SectionProps) => {
  const rv = <>
    <Section sectionName={ShopType.agency} number={1} title='Your Company'>
      <Chapter
        chapName={ChapterName.agencyChap}
        title='Get Started'
        description='Your first steps with MyHealthily'
        destination={Route.agencyShop_GetStarted}
      />
      <Chapter
        chapName={ChapterName.agencyChap}
        title='Sign Up'
        description='Your agency info'
        destination={Route.agencyShop_SignUp}
      />
      {/* <Chapter
        chapName={ChapterName.agencyChap}
        title='Tutorial'
        description='Learn about MyHealthily'
        destination={Route.agencyShop_TutorialVideo}
      /> */}
    </Section>
    <Section sectionName={ShopType.agency} number={2} title='Your Account'>
      <Chapter
        chapName={ChapterName.agencyChap}
        title='Pricing'
        description='Select your plan'
        destination={Route.agencyShop_Pricing}
      />
      <Chapter
        chapName={ChapterName.agencyChap}
        title='Payment'
        description='Set up your billing info'
        destination={Route.agencyShop_Payment}
      />
      {/* <Chapter
        chapName={ChapterName.agencyChap}
        title='Walkthrough'
        description='In-depth guidance for your setup'
        destination={Route.agencyShop_Walkthrough}
      /> */}
    </Section>
    <Section sectionName={ShopType.agency} number={3} title='Complete Sign‑up'>
      <Chapter
        chapName={ChapterName.agencyChap}
        title='Licenses and Appointments'
        description='Select your products'
        destination={Route.agencyShop_LicensesandAppointments} />
      <Chapter
        chapName={ChapterName.agencyChap}
        title='Agency Shop'
        description='Create your custom landing page'
        destination={Route.agencyShop_AgencyShop} />
      <Chapter
        chapName={ChapterName.agencyChap}
        title='Producers'
        description='Add your producers'
        destination={Route.agencyShop_Producers} />
    </Section>
  </>

  return determineChapterStates(rv, stargate)
}

const EmployerSections: React.FC<SectionProps> = ({ stargate }: SectionProps) => {
  const hasSidecar = stargate?.selectedCarriers.some(c => c === Carriers['Sidecar Health'])
  const hasAllstate = stargate?.selectedCarriers.some(c => isAllstate(c))
  const skipHardstop = !!stargate?.group?.approved || ((stargate?.user.power_level || PowerLevel.individual) >= PowerLevel.broker)
  const hasEHQ = stargate?.mqType === MQType.hba && !stargate.group?.hbaApproved

  const rv = <>
    <Section sectionName={ShopType.employer} number={1} title='About Your Company'>
      <Chapter
        chapName={ChapterName.employerChap}
        title='How to Prepare'
        description='Information you’ll need'
        destination={Route.erStargate_Checklist}
      />
      <Chapter
        chapName={ChapterName.employerChap}
        title='Coverage Status'
        description='Your current situation'
        destination={Route.erStargate_GetStarted}
      />
      <Chapter
        chapName={ChapterName.employerChap}
        title='Census'
        description='Your employee information'
        destination={Route.erStargate_Census}
      />
      <Chapter
        chapName={ChapterName.employerChap}
        title='Waiving Coverage'
        description='Employees forgoing coverage'
        destination={Route.erStargate_CensusWaive}
      />
      <Chapter
        chapName={ChapterName.employerChap}
        title='Schedule a Call'
        description='Review plans with a trusted advisor'
        destination={Route.erStargate_ScheduleACall}
        state={skipHardstop ? State.hidden : undefined}
      />
    </Section>
    <Section sectionName={ShopType.employer} number={2} title='Your Group’s Coverage'>
      <Chapter
        chapName={ChapterName.employerChap}
        title='Plan Selection'
        description='Choose your coverage'
        destination={Route.erStargate_Plans} />
      <Chapter
        chapName={ChapterName.employerChap}
        title='Sidecar Health'
        description='Learn more about Sidecar Health'
        destination={Route.erStargate_SidecarInfo}
        state={!hasSidecar ? State.hidden : undefined} />
      <Chapter
        chapName={ChapterName.employerChap}
        title='Enhance Your Offer'
        description='Add dental and vision contributions'
        destination={Route.erStargate_AncillaryPlans} />
      <Chapter
        chapName={ChapterName.employerChap}
        title='Supplemental Plan'
        description='Add supplemental plans'
        destination={Route.erStargate_Supplemental}/>
      <Chapter
        chapName={ChapterName.employerChap}
        title='IMQs'
        description='Employee IMQ status'
        destination={Route.erStargate_IMQs}
        state={!hasAllstate ? State.hidden : undefined} />
      <Chapter
        chapName={ChapterName.employerChap}
        title='Complete Forms'
        description='Fill out required forms for The Health Benefit Alliance'
        destination={Route.erStargate_EHQ}
        state={hasEHQ ? undefined : State.hidden}
      />
      <Chapter
        chapName={ChapterName.employerChap}
        title='Employee Classes'
        description='Carve out contribution groupings'
        destination={Route.erStargate_CarvedContributions} />
      <Chapter
        chapName={ChapterName.employerChap}
        title='Contributions'
        description='Adjust your contribution strategy'
        destination={Route.erStargate_Contribution} />
    </Section>
    <Section sectionName={ShopType.employer} number={3} title='Complete Sign‑up'>
      <Chapter
        chapName={ChapterName.employerChap}
        title='Carrier Application'
        description='A little more for the carrier'
        destination={Route.erStargate_Application} />
      <Chapter
        chapName={ChapterName.employerChap}
        title='Review Selections'
        description='Review your plan selections'
        destination={Route.erStargate_Review} />
      <Chapter
        chapName={ChapterName.employerChap}
        title='Confirmation'
        destination={Route.erStargate_Finalize} />
    </Section>

  </>

  return determineChapterStates(rv, stargate)
}

const EmployeeSections: React.FC<SectionProps> = ({ stargate }: SectionProps) => {
  const individualsModeHiddenState = undefined
  const individualsModeShownState = State.hidden
  const isRedflagged = stargate?.groupMember?.is_redflagged
  const hideUnderwritingPage = isRedflagged || stargate?.showUnderwritingPage !== true
  const existingCoverageState = stargate?.config.showExistingCoverageChapter ? undefined : State.hidden
  const hasSidecar = stargate?.selectedCarriers.some(c => c === Carriers['Sidecar Health'])
  const rv = <>
    <Section sectionName={ShopType.employee} number={1} title='About You'>
      <Chapter
        chapName={ChapterName.employeeChap}
        title='Your Basic Info'
        description='Enter your basic information'
        destination={Route.eeStargate_info} />
      <Chapter
        chapName={ChapterName.employeeChap}
        title='Work Status'
        description='Enter current occupation details'
        destination={Route.eeStargate_work}
        state={individualsModeHiddenState}
      />
      <Chapter
        chapName={ChapterName.employeeChap}
        title='Family'
        description='Add dependent information'
        destination={Route.eeStargate_family} />
      <Chapter
        chapName={ChapterName.employeeChap}
        title='Medical Information'
        description='Enter your basic medical information'
        destination={Route.eeStargate_redflags}
        state={stargate?.showRedflagsPage !== true ? State.hidden : undefined} />
    </Section>
    <Section sectionName={ShopType.employee} number={2} title='Your Coverage'>
      <Chapter
        chapName={ChapterName.employeeChap}
        title='Existing Coverage'
        description='Enter current plan details'
        destination={Route.eeStargate_have_plan}
        state={existingCoverageState}
      />
      <Chapter
        chapName={ChapterName.employeeChap}
        title='Underwriting'
        description='Your medical history and additional information'
        destination={Route.eeStargate_underwriting}
        state={hideUnderwritingPage ? State.hidden : undefined} />
      <Chapter
        chapName={ChapterName.employeeChap}
        title='Healthcare Plans'
        description='Choose your plan'
        destination={Route.eeStargate_select} />
      <Chapter
        chapName={ChapterName.employeeChap}
        title='Ancillary Plans'
        description='Select supplementary coverage'
        destination={Route.eeStargate_ancillary}
        state={stargate?.group?.individualExperience ? State.hidden : individualsModeHiddenState}
      />
      <Chapter
        chapName={ChapterName.employerChap}
        title='Supplemental Plan'
        description='Add supplemental plans'
        destination={Route.eeStargate_supplemental} />
    </Section>
    <Section sectionName={ShopType.employee} number={3} title='Complete Sign‑up'>
      <Chapter
        chapName={ChapterName.employeeChap}
        title='Finalize Enrollment'
        description='Review your selections'
        destination={Route.eeStargate_enroll} />
      <Chapter
        chapName={ChapterName.employeeChap}
        title='Application'
        description='Complete your application'
        destination={Route.eeStargate_application}
        state={!hasSidecar || isRedflagged ? State.hidden : undefined} />
      <Chapter
        chapName={ChapterName.employeeChap}
        title='Checkout'
        destination={Route.eeStargate_pay}
        state={individualsModeShownState} />
      <Chapter
        chapName={ChapterName.employeeChap}
        title='Confirmation'
        destination={Route.eeStargate_confirm} />
    </Section>
  </>

  return determineChapterStates(rv, stargate)
}

// HACK this is a HACK, but whatever
let furthestChapter: Route | undefined

function determineChapterStates(node: ReactElement, stargate?: Stargate): any {
  let assignedFurthest = false

  return React.Children.map(node.props.children, (section: ReactElement) => {
    const children = React.Children.map(section.props.children, (chapter: ReactElement) => {
      if (chapter.props.state) {
        return chapter
      } else {
        let state: State
        if (assignedFurthest) {
          state = State.inaccessible
        } else {
          furthestChapter = chapter.props.destination

          if (isChapterComplete(chapter.props.destination, stargate)) {
            state = State.complete
          } else {
            assignedFurthest = true
            state = State.furthest
          }
        }
        return React.cloneElement(chapter, { state })
      }
    })
    return React.cloneElement(section, { children })
  })
}

export function useAppMode(): AppMode | undefined {
  const active = useLocation().pathname

  if (active.startsWith('/shop/agency') || active.startsWith('/dashboard/agency')) return AppMode.agency
  if (active.startsWith('/shop/employer') || active.startsWith('/dashboard/employer') || active.endsWith('get-started') || active.endsWith('group-type')) return AppMode.employer
  if (active.startsWith('/shop/employee') || active.startsWith('/dashboard/employee')) return AppMode.employee
  if (active.startsWith('/landing')) return AppMode.landing

  return undefined
}

export function useTableOfContents(): { furthestChapter?: Route } {
  // FIXME broken since we don’t always render the chapters lol
  // WHICH especially is a problem for /shop
  // HOWEVER works fine if you go direct to /shop/employer for example
  return { furthestChapter }
}

function isChapterComplete(route: Route, stargate?: Stargate): boolean {
  if (!stargate) return false

  const { user, group, members, splits, planIds, userMetadata, dependents, groupMember, eeSouvenirSent, erSouvenirSent, carrierSpecificData, isLevelFundedGroup, membersCompletedTheirIMQs, contributions, agency } = stargate
  const eeMedicalPlanDecisionMade = !!groupMember?.is_waived || !!groupMember?.enrolled_group_plan_id || !!user.enrolled_individual_plan_id
  const erAncillarySeen = !!contributions?.baseContributions?.dental || !!contributions?.baseContributions?.vision || !!contributions?.baseContributions?.allAncillary
  const erSupplemental = !!contributions?.baseContributions?.accident || !!contributions?.baseContributions?.life || !!contributions?.baseContributions?.disability || !!contributions?.baseContributions?.majorCancer || !!contributions?.baseContributions?.allAncillary
  const eeSupplemental = !!contributions?.baseContributions?.accident || !!contributions?.baseContributions?.life || !!contributions?.baseContributions?.disability || !!contributions?.baseContributions?.majorCancer || !!contributions?.baseContributions?.allAncillary
  const eeAncillaryDecisionMade = !!groupMember?.enrolled_dental_plan_id || !!groupMember?.enrolled_vision_plan_id || !!groupMember?.enrolled_life_plan_id || localStorage.employeeAncillaryScreenSeen === 'true'
  const isSidecarAppComplete = carrierSpecificData?.sidecar?.applicationState === SidecarApplicationState.enrolled
  const isSidecarMedicalHistoryComplete = !!carrierSpecificData?.sidecar?.medicalHistoryComplete
  const finishedCarrierApp = stargate.carrierApplicationData?.formStatus === CarrierApplicationStatus.complete
  const anySplitBaseContributionsSet = splits.some(s => !!s.contribution)
  const anyComplexContributionsSet = anySplitBaseContributionsSet || !!contributions?.planContributions.length || contributions?.splitContributions?.some(sc => !!sc.planContributions.length)
  switch (route) {
  /// TODO: Real tests
  case Route.agencyShop_GetStarted: return !!user && user.power_level >= PowerLevel.broker
  case Route.agencyShop_SignUp: return !!user && user.power_level >= PowerLevel.superBroker && !!agency
  case Route.agencyShop_Pricing: return localStorage.pricingScreenSeen
  case Route.agencyShop_Payment: return !!agency?.deltaPSID
  case Route.agencyShop_LicensesandAppointments: return true
  case Route.agencyShop_Producers: return true
  case Route.agencyShop_AgencyShop: return true
  case Route.erStargate_Checklist:
    return localStorage.checklistScreenSeen === 'true' || !!group?.effectiveDate || !!group?.industrySICCode || !!group?.ein || !!user.acceptedTermsAndConditions || user.power_level > PowerLevel.groupManager
  case Route.erStargate_GetStarted:
    return !!group?.effectiveDate && !!group?.industrySICCode && !!group?.ein
  case Route.erStargate_Census:
    return members.length > 0
  case Route.erStargate_CensusWaive:
    return members.some(o => o.is_waived) || localStorage.waiveScreenSeen === 'true' || planIds.length > 0
  case Route.erStargate_ScheduleACall:
    return !!group?.approved
  case Route.erStargate_Plans:
    return planIds.length > 0
  case Route.erStargate_SidecarInfo:
    return localStorage.sidecarInfoScreenSeen === 'true' || erAncillarySeen
  case Route.erStargate_AncillaryPlans:
    return erAncillarySeen || !!splits.length || localStorage.specialContributionScreenSeen === 'true' || anyComplexContributionsSet || finishedCarrierApp
  case Route.erStargate_Supplemental:
    return erSupplemental || localStorage.specialContributionScreenSeen === 'true' || anyComplexContributionsSet || finishedCarrierApp
  case Route.eeStargate_supplemental:
    return eeSupplemental || !!splits.length || localStorage.specialContributionScreenSeen === 'true' || anyComplexContributionsSet || finishedCarrierApp
  case Route.erStargate_IMQs:
    return isLevelFundedGroup ? membersCompletedTheirIMQs : true
  case Route.erStargate_EHQ:
    return !!group?.hbaApproved
  case Route.erStargate_CarvedContributions:
    return !!splits.length || localStorage.specialContributionScreenSeen === 'true' || anyComplexContributionsSet || finishedCarrierApp
  case Route.erStargate_Contribution:
    return localStorage.contributionScreenSeen === 'true' || anyComplexContributionsSet || finishedCarrierApp
  case Route.erStargate_Application:
    return finishedCarrierApp
  case Route.erStargate_Review:
    return erSouvenirSent || localStorage.reviewScreenSeen === 'true'
  case Route.erStargate_Finalize:
    return erSouvenirSent

  case Route.eeStargate_info:
    return !!user?.ssn && !!user.acceptedTermsAndConditions
  case Route.eeStargate_work:
    return !!groupMember?.jobTitle || !!userMetadata?.jobTitle
  case Route.eeStargate_family:
    return !!dependents?.length || localStorage.eeFamilySeen === 'true' || isSidecarMedicalHistoryComplete || !!userMetadata?.alreadyHasPlan || eeMedicalPlanDecisionMade
  case Route.eeStargate_redflags:
    return isSidecarMedicalHistoryComplete || !!groupMember?.is_redflagged
  case Route.eeStargate_have_plan:
    return !!userMetadata?.alreadyHasPlan || eeMedicalPlanDecisionMade
  case Route.eeStargate_select:
    return eeMedicalPlanDecisionMade
  case Route.eeStargate_ancillary:
    return eeAncillaryDecisionMade
  case Route.eeStargate_enroll:
    return eeSouvenirSent || localStorage.employeeEnrollScreenSeen
  case Route.eeStargate_underwriting:
    return groupMember?.medical_underwriting_complete || false
  case Route.eeStargate_application:
    return isSidecarAppComplete
  case Route.eeStargate_pay:
    return stargate.eePaymentInfoReceived
  case Route.eeStargate_confirm:
    return false

  default:
    throw new Error(`Unexpected/unhandled route in ToC: ${route}`)
  }
}

interface SignOutProps {
  withBrokerReturn: boolean
}

const SignOutLink: React.FC<SignOutProps> = ({ withBrokerReturn }) => {
  if (!isAuthenticated()) return <React.Fragment />

  const destination = Route.stargate
  return <>
    {withBrokerReturn &&
      <Link to={`${Route.agencyDashboardClients}/${localStorage.overrideGroupID}`}>
        <GAButton analytics={`Back to Agency Dashboard (${SignOutLink.name})`} className={styles.backTo}>Back to Agency Dashboard</GAButton>
      </Link>
    }
    <Link to={{ pathname: Route.signOut, state: { redirect: destination } }}>
      <GAButton analytics={`Sign out (${SignOutLink.name})`} className={styles.signout}>Sign out</GAButton>
    </Link>
  </>
}

export default ToC
