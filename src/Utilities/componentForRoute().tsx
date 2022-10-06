import React, { ReactElement } from 'react'
import { kebabCase, camelCase } from 'lodash'
import PrivateRoute from 'Components/Primitives/PrivateRoute'
import { WizardRoute, PrivateWizardRoute } from 'Components/Stargate/Wizard/WizardRoute'
import { Route as RaRoute } from 'Utilities/Route'
import { obeliskMode } from 'Utilities/config'
import Landing from 'Routes'
import SignIn from 'Routes/account/sign-in'
import SignUp from 'Routes/account/sign-up'
import SignOut from 'Routes/account/sign-out'
import ForgotPassword from 'Routes/account/forgot-password'
import ResetPassword from 'Routes/account/reset-password'
import DashboardAgencyReports from 'Routes/dashboard/agency/reports'
import DashboardAgencyClient from 'Routes/dashboard/agency/client'
import DashboardAgencyHome from 'Routes/dashboard/agency/home'
import DashboardAgencyGroups from 'Routes/dashboard/agency/clients'
import DashboardAgencyGroup from 'Routes/dashboard/agency/clients/ID'
import DashboardAgencyProducers from 'Routes/dashboard/agency/producers'
import DashboardAgencyProducer from 'Routes/dashboard/agency/producers/ID'
import DashboardAgencyEmployees from 'Routes/dashboard/agency/employees/ID'
import DashboardAgencyAccount from 'Routes/dashboard/agency/account'
import DashboardEmployerEmployees, { Stages as EEStages } from 'Routes/dashboard/employer/employees'
import DashboardEmployer from 'Routes/dashboard/employer'
import DashboardEmployee from 'Routes/dashboard/employee'
import DashboardEmployeeProfile from 'Routes/dashboard/employee/profile'
import ERShopGetStarted from 'Routes/shop/employer/get-started'
import ERShopCensus from 'Routes/shop/employer/census'
import ERShopCensusWaive from 'Routes/shop/employer/census/waive'
import ERShopPlansContribution from 'Routes/shop/employer/plans/contribution'
import ShopHome from 'Routes/shop'
import DashboardEmployerProfile from 'Routes/dashboard/employer/profile'
import DashboardAgencyAgencies from 'Routes/dashboard/agency/agencies'
import EEShopCensus from 'Routes/shop/employee/census'
import EEShopConfirm from 'Routes/shop/employee/confirm'
import Payment from 'Routes/shop/employee/checkout'
import { Redirect, Route } from 'react-router-dom'
import { $enum } from 'ts-enum-util'
import Underwriting from 'Components/Stargate/Underwriting/Underwriting'
import ERStargateCarrierApplication from 'Routes/shop/employer/plans/application'
import ERShopCongratulations from 'Routes/shop/employer/confirm'
import HavePlan from 'Routes/shop/employee/already-covered'
import ERShopPlansAncillary from 'Routes/shop/employer/plans/ancillary'
import EEShopPlansAncillary from 'Routes/shop/employee/plans/ancillary'
import EEShopWorkStatus from 'Routes/shop/employee/work'
import ERShopContributionsCarved from 'Routes/shop/employer/plans/contribution/carved'
import ERShopPlans from 'Routes/shop/employer/plans'
import ERShopPlansReview from 'Routes/shop/employer/plans/review'
import EEShopFamily from 'Routes/shop/employee/census/family'
import EEShopMedical from 'Routes/shop/employee/medical'
import EEShopPlansHealth from 'Routes/shop/employee/plans/health'
import EEShopPlansEnroll from 'Routes/shop/employee/plans/enroll'
import ERShopRefresh from 'Routes/shop/employer/refresh'
import ERSidecarInfo from 'Routes/shop/employer/plans/sidecar-health'
import { useWhiteLabel } from './Hooks/useWhiteLabel'
import Application from 'Routes/shop/employee/plans/application'
import ERGroupType from 'Routes/shop/employer/group-type'
import Checklist from 'Routes/shop/employer/checklist'
import ERIMQs from 'Routes/shop/employer/imqs'
import ERShopScheduleACall from 'Routes/shop/employer/schedule'
import AgencyGetStarted from 'Routes/shop/agency/get-started'
import AgencySignUp from 'Routes/shop/agency/signup'
import AgencyPricing from 'Routes/shop/agency/pricing'
import AgencyPayment from 'Routes/shop/agency/payment'
import { MQType } from './Hooks/useStargate'
import EREHQ from 'Routes/shop/employer/ehq'
import AgencyProducers from 'Routes/shop/agency/producers'
import DashboardAgencyGroupsPlan from 'Routes/dashboard/agency/clients/plan/ID'
import LicensesAndAppointments from 'Routes/shop/agency/licensesandappointments'
import AgencyShopSetup from 'Routes/shop/agency/shop-setup'
import BrokerLanding from 'Routes/landing/ID'
import ERShopSupplemental from 'Components/Plans/SupplementalPlan'
import EESupplemental from 'Routes/shop/employer/plans/SupplementalPlanEE'

function componentForRoute(route: RaRoute): ReactElement | null {
  // For some of the following indexes the following behavior occurs:
  // 1. If logged in query Pharaoh and if one option, redirect
  // 2. If logged in query Pharaoh and if multiple options, ask user where to go
  // 3. If not logged in, show Sign-in screen with help text for lost unregistered ees

  const label = useWhiteLabel().label
  const isObelisk = obeliskMode(label)
  const additionalProps = { key: route, path: route as RaRoute | undefined, exact: true }
  const element = raw()

  // skipping for now until Stargate rewrite
  if (element === null) return null

  if (element.props.path) {
    // don’t overwrite any explicit choice
    delete additionalProps.path
  }

  return React.cloneElement(element, additionalProps)

  function raw() : ReactElement | null {
    const componentObj = {
      [RaRoute.landing]: <PrivateRoute component={Landing} />,
      [RaRoute.signUp]: <Route path={`${route}/:token`} component={SignUp} />,
      [RaRoute.signIn]: <Route component={SignIn} />,
      [RaRoute.signOut]: <Route component={SignOut} />,
      [RaRoute.resetPassword]: <Route path={`${route}/:token`} component={ResetPassword} />,
      [RaRoute.forgotPassword]: <Route component={ForgotPassword} />,

      [RaRoute.brokerLanding]: <Route path={`${route}/:slug`} component={BrokerLanding} />,
      [RaRoute.agencyShop]: <Redirect to={RaRoute.agencyShop_GetStarted} />,
      [RaRoute.agencyShop_GetStarted]: <WizardRoute onwards={RaRoute.agencyShop_SignUp} render={props => <AgencyGetStarted {...props} />} />,
      [RaRoute.agencyShop_SignUp]: <WizardRoute onwards={RaRoute.agencyShop_Pricing} render={props => <AgencySignUp {...props} />} />,
      // [RaRoute.agencyShop_TutorialVideo]: <PrivateWizardRoute onwards={RaRoute.agencyShop_Pricing} component={ERSidecarInfo}/>,
      [RaRoute.agencyShop_Pricing]: <PrivateWizardRoute onwards={RaRoute.agencyShop_Payment} component={AgencyPricing} localStorageKey='pricingScreenSeen' />,
      [RaRoute.agencyShop_Payment]: <PrivateWizardRoute onwards={RaRoute.agencyShop_LicensesandAppointments} component={AgencyPayment}/>,
      // [RaRoute.agencyShop_Walkthrough]: <PrivateWizardRoute onwards={RaRoute.agencyShop_LicensesandAppointments} component={ERSidecarInfo}/>
      [RaRoute.agencyShop_LicensesandAppointments]: <PrivateWizardRoute onwards={RaRoute.agencyShop_AgencyShop} component={LicensesAndAppointments}/>,
      [RaRoute.agencyShop_AgencyShop]: <PrivateWizardRoute onwards={RaRoute.agencyShop_Producers} component={AgencyShopSetup}/>,

      [RaRoute.agencyShop_Producers]: <PrivateWizardRoute onwards={RaRoute.agencyDashboard} component={AgencyProducers}/>,
      [RaRoute.agencyDashboard]: <Route render={() =>
        <Redirect to={RaRoute.agencyDashboardHome} />
      }/>,
      [RaRoute.agencyDashboardReports]: <PrivateRoute component={DashboardAgencyReports} />,
      // we add `:filter?` here so when we use the raw enum in eg.
      // Link it doesn’t add our parameter to the resulting destination URL
      [RaRoute.agencyDashboardClient]: <PrivateRoute path={`${route}/:filter?`} component={DashboardAgencyClient} />,
      [RaRoute.agencyDashboardClientsPlan]: <PrivateRoute path={`${route}/:id`} render={props => {
        const id = props.match.params.id
        return <DashboardAgencyGroupsPlan id={id} />
      }}/>,
      [RaRoute.agencyDashboardClients]: <PrivateRoute path={`${route}/:id?`} render={props => {
        const id = props.match.params.id
        if (id && id !== 'flagged') {
          if (props.location.pathname.match(/plan$/)) {
            return <h1>hi!</h1>
          }
          return <DashboardAgencyGroup id={id} {...props.location.state} />
        } else {
          return <DashboardAgencyGroups flagged={id === 'flagged'} />
        }
      }}/>,
      [RaRoute.agencyDashboardHome]: <PrivateRoute component={DashboardAgencyHome} />,
      [RaRoute.agencyDashboardProducers]: <PrivateRoute path={`${route}/:id?`} render={(props) => {
        const id = props.match.params.id
        if (id) {
          return <DashboardAgencyProducer id={id} {...props.location.state} />
        } else {
          return <DashboardAgencyProducers />
        }
      }}/>,
      [RaRoute.agencyDashboardEmployees]: <PrivateRoute path={`${route}/:id`} render={(props) => {
        const id = props.match.params.id
        return <DashboardAgencyEmployees id={id} />
      }}/>,
      [RaRoute.agencyDashboardAgencies]: <PrivateRoute component={DashboardAgencyAgencies} />,
      [RaRoute.agencyDashboardAccount]: <PrivateRoute component={DashboardAgencyAccount} />,
      [RaRoute.dashboardEmployer]: <PrivateRoute component={DashboardEmployer} />,
      [RaRoute.dashboardEmployerEmployees]: <PrivateRoute path={`${route}/:id?`} render={(props) => {
        const id = props.match.params.id
        if (!$enum(EEStages).getValues().map(kebabCase).includes(id) && id) {
          return <DashboardAgencyEmployees id={id} {...props.location.state} />
        } else {
          return <DashboardEmployerEmployees filter={camelCase(id) as EEStages}/>
        }
      }} />,
      [RaRoute.dashboardEmployerProfile]: <PrivateRoute component={DashboardEmployerProfile} />,
      [RaRoute.dashboardEmployerBilling]: <PrivateRoute />,
      [RaRoute.dashboardEmployeeProfile]: <PrivateRoute component={DashboardEmployeeProfile} />,
      [RaRoute.dashboardEmployee]: <PrivateRoute component={DashboardEmployee} />,
      [RaRoute.dashboard]: <Route render={() => <Redirect to='/'/>} />,
      [RaRoute.stargate]: <Route path={`${RaRoute.stargate}/:slug?`} component={ShopHome} />,
      [RaRoute.erStargate_GroupType]: GroupType(),
      [RaRoute.erStargate_Checklist]: <WizardRoute onwards={RaRoute.erStargate_GetStarted} component={Checklist}/>,
      [RaRoute.erStargate_GetStarted]: ErGetStarted(),
      [RaRoute.erStargate_Census]: <PrivateWizardRoute component={ERShopCensus} onwards={RaRoute.erStargate_CensusWaive} />,
      [RaRoute.erStargate_CensusWaive]: <PrivateWizardRoute component={ERShopCensusWaive} onwards={approved => approved ? RaRoute.erStargate_Plans : RaRoute.erStargate_ScheduleACall} localStorageKey='waiveScreenSeen' />,
      [RaRoute.erStargate_ScheduleACall]: <WizardRoute onwards={RaRoute.erStargate_Plans} component={ERShopScheduleACall}/>,
      [RaRoute.erStargate_Plans]: <PrivateWizardRoute component={ERShopPlans} onwards={({ showSidecarInfo }) =>
        showSidecarInfo
          ? RaRoute.erStargate_SidecarInfo
          : RaRoute.erStargate_AncillaryPlans
      } entry={<p>Please note: while all available carriers will provide a quote, please refer to carrier implementation
        timelines for case submission deadlines. MyHealthily cannot guarantee all quotes are issuable within carrier
        timelines. We encourage selecting an effective date at least 30 days from the current date.</p>} />,
      [RaRoute.erStargate_SidecarInfo]: <PrivateWizardRoute component={ERSidecarInfo} onwards={RaRoute.erStargate_AncillaryPlans} localStorageKey='sidecarInfoScreenSeen'/>,
      [RaRoute.erStargate_AncillaryPlans]: <PrivateWizardRoute component={ERShopPlansAncillary} onwards={RaRoute.erStargate_Supplemental}/>,
      [RaRoute.erStargate_Supplemental]: IMQ(),
      [RaRoute.erStargate_IMQs]: <PrivateWizardRoute component={ERIMQs} onwards={({ imqsComplete }) =>
        imqsComplete
          ? RaRoute.erStargate_CarvedContributions
          : RaRoute.erStargate_Plans
      }
      localStorageKey='employerIMQs'/>,
      [RaRoute.erStargate_EHQ]: <PrivateWizardRoute component={EREHQ} onwards={RaRoute.erStargate_CarvedContributions} />,
      [RaRoute.erStargate_CarvedContributions]: <PrivateWizardRoute component={ERShopContributionsCarved} onwards={RaRoute.erStargate_Contribution} localStorageKey='specialContributionScreenSeen' />,
      [RaRoute.erStargate_Contribution]: <PrivateWizardRoute component={ERShopPlansContribution} onwards={RaRoute.erStargate_Application} localStorageKey='contributionScreenSeen' />,
      [RaRoute.erStargate_Application]: <PrivateWizardRoute component={ERStargateCarrierApplication} onwards={RaRoute.erStargate_Review} />,
      [RaRoute.erStargate_Review]: <PrivateWizardRoute component={ERShopPlansReview} onwards={RaRoute.erStargate_Finalize} localStorageKey='reviewScreenSeen' />,
      [RaRoute.erStargate_Finalize]: <PrivateWizardRoute component={ERShopCongratulations} onwards={RaRoute.dashboardEmployer} />,
      [RaRoute.erStargateRefresh]: <PrivateWizardRoute component={ERShopRefresh} onwards={RaRoute.erStargate_GetStarted} />,
      [RaRoute.eeStargate_info]: <PrivateWizardRoute render={props => <EEShopCensus {...props} />} onwards={RaRoute.eeStargate_work} />,
      [RaRoute.eeStargate_work]: <PrivateWizardRoute component={EEShopWorkStatus} onwards={RaRoute.eeStargate_family} />,
      [RaRoute.eeStargate_family]: <PrivateWizardRoute component={EEShopFamily} onwards={({ showExistingCoverageChapter, showRedflagsPage, showUnderwritingPage }) =>
        showRedflagsPage
          ? RaRoute.eeStargate_redflags
          : showExistingCoverageChapter
            ? RaRoute.eeStargate_have_plan
            : showUnderwritingPage
              ? RaRoute.eeStargate_underwriting
              : RaRoute.eeStargate_select
      } localStorageKey='eeFamilySeen' />,
      [RaRoute.eeStargate_redflags]: <PrivateWizardRoute component={EEShopMedical} onwards={showExistingCoverageChapter =>
        showExistingCoverageChapter
          ? RaRoute.eeStargate_have_plan
          : RaRoute.eeStargate_underwriting
      } localStorageKey='eeMedicalQuestionsSeen'/>,
      [RaRoute.eeStargate_have_plan]: <PrivateWizardRoute component={HavePlan} onwards={showUnderwritingPage =>
        showUnderwritingPage
          ? RaRoute.eeStargate_underwriting
          : RaRoute.eeStargate_select
      } />,
      [RaRoute.eeStargate_underwriting]: <PrivateWizardRoute component={Underwriting} onwards={RaRoute.eeStargate_select} localStorageKey='eeUnderwritingScreenSeen' />,
      [RaRoute.eeStargate_select]: <PrivateWizardRoute component={EEShopPlansHealth} onwards={individualExperience => individualExperience ? RaRoute.eeStargate_enroll : RaRoute.eeStargate_ancillary} />,
      [RaRoute.eeStargate_ancillary]: <PrivateWizardRoute component={EEShopPlansAncillary} onwards={RaRoute.eeStargate_supplemental} localStorageKey='employeeAncillaryScreenSeen' />,
      [RaRoute.eeStargate_supplemental]: <PrivateWizardRoute component={EESupplemental} onwards={RaRoute.eeStargate_enroll} localStorageKey='employeeSupplementalScreenSeen' />,
      [RaRoute.eeStargate_enroll]: <PrivateWizardRoute component={EEShopPlansEnroll} onwards={({ hasSidecar }) =>
        hasSidecar
          ? RaRoute.eeStargate_application
          : RaRoute.eeStargate_confirm
      } localStorageKey='employeeEnrollScreenSeen' />,
      [RaRoute.eeStargate_application]: <PrivateWizardRoute component={Application} onwards={RaRoute.eeStargate_confirm} />,
      [RaRoute.eeStargate_pay]: <PrivateWizardRoute component={Payment} onwards={RaRoute.eeStargate_confirm} />,
      [RaRoute.eeStargate_confirm]: <PrivateWizardRoute component={EEShopConfirm} onwards={RaRoute.dashboardEmployee} />
    }
    return componentObj[route]
  }

  function GroupType() {
    const path = isObelisk
      ? route.replace(/employer/, ':slug')
      : undefined
    return <WizardRoute path={path} onwards={RaRoute.erStargate_Checklist} localStorageKey='checklistScreenSeen' render={props => {
      if (props.stargate.value?.group?.individualExperience) {
        return <Route render={() => <Redirect to='/shop/employee'/>} />
      }
      if (path) {
        const slug = props.stargate.value?.obelisk.slug
        const rx = path.replace(/:slug/, '([^/]+)')
        const match = props.location?.pathname.match(rx) || []
        if (match[1] === 'employer' || match[1] === ':slug') {
          if (!slug) return <Redirect to={RaRoute.stargate} />
          const to = path.replace(/:slug/, slug)
          return <Redirect to={to} />
        }
      }
      return <ERGroupType {...props} />
    }}/>
  }

  function ErGetStarted() {
    const path = isObelisk
      ? route.replace(/employer/, ':slug')
      : undefined
    return <WizardRoute path={path} onwards={RaRoute.erStargate_Census} render={props => {
      if (path) {
        const slug = props.stargate.value?.obelisk.slug
        const rx = path.replace(/:slug/, '([^/]+)')
        const match = props.location?.pathname.match(rx) || []
        if (match[1] === 'employer' || match[1] === ':slug') {
          if (!slug) return <Redirect to={RaRoute.stargate} />
          const to = path.replace(/:slug/, slug)
          return <Redirect to={to} />
        }
      }
      return <ERShopGetStarted {...props} />
    }}/>
  }

  function IMQ() {
    return <PrivateWizardRoute component={ERShopSupplemental} onwards={({ mqType }) => {
      switch (mqType) {
      case MQType.allstate: return RaRoute.erStargate_IMQs
      case MQType.hba: return RaRoute.erStargate_EHQ
      case MQType.none: return RaRoute.erStargate_CarvedContributions
      }
      return RaRoute.erStargate_CarvedContributions
    }
    } localStorageKey='ancillaryScreenSeen' />
  }
}

export default componentForRoute
