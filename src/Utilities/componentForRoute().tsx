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
import DashboardAgencyPipeline from 'Routes/dashboard/agency/pipeline'
import DashboardAgencyAssociations from 'Routes/dashboard/agency/associations'
import DashboardAgencyAssociation from 'Routes/dashboard/agency/associations/ID'
import DashboardAgencyGroups from 'Routes/dashboard/agency/clients'
import DashboardAgencyGroup from 'Routes/dashboard/agency/clients/ID'
import DashboardAgencyProducers from 'Routes/dashboard/agency/producers'
import DashboardAgencyProducer from 'Routes/dashboard/agency/producers/ID'
import DashboardAgencyEmployees from 'Routes/dashboard/agency/employees/ID'
import DashboardEmployer from 'Routes/dashboard/employer'
import DashboardEmployerEmployees, { Stages as EEStages } from 'Routes/dashboard/employer/employees'
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

  function raw(): ReactElement | null {
    switch (route) {
    case RaRoute.landing:
      return <PrivateRoute component={Landing} />

    case RaRoute.signUp:
      return <Route path={`${route}/:token`} component={SignUp} />
    case RaRoute.signIn:
      return <Route component={SignIn} />
    case RaRoute.signOut:
      return <Route component={SignOut} />
    case RaRoute.resetPassword:
      return <Route path={`${route}/:token`} component={ResetPassword} />
    case RaRoute.forgotPassword:
      return <Route component={ForgotPassword} />
    case RaRoute.agencyDashboard:
      return <Route render={() =>
        <Redirect to={RaRoute.agencyDashboardReports} />
      }/>
    case RaRoute.agencyDashboardReports:
      return <PrivateRoute component={DashboardAgencyReports} />
    case RaRoute.agencyDashboardPipeline:
      // we add `:filter?` here so when we use the raw enum in eg.
      // Link it doesn’t add our parameter to the resulting destination URL
      return <PrivateRoute path={`${route}/:filter?`} component={DashboardAgencyPipeline} />
    case RaRoute.agencyDashboardClients:
      return <PrivateRoute path={`${route}/:id?`} render={props => {
        const id = props.match.params.id
        if (id && id !== 'flagged') {
          return <DashboardAgencyGroup id={id} {...props.location.state} />
        } else {
          return <DashboardAgencyGroups flagged={id === 'flagged'} />
        }
      }}/>
    case RaRoute.agencyDashboardAssociations:
      return <PrivateRoute path={`${route}/:id?`} render={(props) => {
        const id = props.match.params.id
        if (id) {
          return <DashboardAgencyAssociation id={id} {...props.location.state} />
        } else {
          return <DashboardAgencyAssociations />
        }
      }}/>
    case RaRoute.agencyDashboardProducers:
      return <PrivateRoute path={`${route}/:id?`} render={(props) => {
        const id = props.match.params.id
        if (id) {
          return <DashboardAgencyProducer id={id} {...props.location.state} />
        } else {
          return <DashboardAgencyProducers />
        }
      }}/>
    case RaRoute.agencyDashboardEmployees:
      return <PrivateRoute path={`${route}/:id`} render={(props) => {
        const id = props.match.params.id
        return <DashboardAgencyEmployees id={id} />
      }}/>
    case RaRoute.agencyDashboardAgencies:
      return <PrivateRoute component={DashboardAgencyAgencies} />

    case RaRoute.dashboardEmployer:
      return <PrivateRoute component={DashboardEmployer} />
    case RaRoute.dashboardEmployerEmployees:
      return <PrivateRoute path={`${route}/:id?`} render={(props) => {
        const id = props.match.params.id
        if (!$enum(EEStages).getValues().map(kebabCase).includes(id) && id) {
          return <DashboardAgencyEmployees id={id} {...props.location.state} />
        } else {
          return <DashboardEmployerEmployees filter={camelCase(id) as EEStages}/>
        }
      }} />
    case RaRoute.dashboardEmployerProfile:
      return <PrivateRoute component={DashboardEmployerProfile} />
    case RaRoute.dashboardEmployerBilling:
      return <PrivateRoute />

    case RaRoute.dashboardEmployeeProfile:
      return <PrivateRoute component={DashboardEmployeeProfile} />
    case RaRoute.dashboardEmployee:
      return <PrivateRoute component={DashboardEmployee} />

    case RaRoute.dashboard:
      return <Route render={() => <Redirect to='/'/>} />

    case RaRoute.stargate:
      return <Route path={`${RaRoute.stargate}/:slug?`} component={ShopHome} />

    case RaRoute.erStargate_GroupType: {
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
    case RaRoute.erStargate_Checklist:
      return <WizardRoute onwards={RaRoute.erStargate_GetStarted} component={Checklist}/>
    case RaRoute.erStargate_GetStarted: {
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
      }} entry={<>
        <h1>Hello there :)</h1>
        <p>We are going to start with a few questions to make sure we find you <b>Plans that fit your needs.</b></p>
      </>} />
    }
    case RaRoute.erStargate_Census:
      return <PrivateWizardRoute component={ERShopCensus} onwards={RaRoute.erStargate_CensusWaive} entry={<>
        <h1>Getting you a Precise Quote</h1>
        <p>In order to provide you with the right plan options, please ensure you list all full-time eligible employees (defined as anyone working 30+ hours a week* for at least one month).</p>
        <p>In accordance with federal guidelines, you must include all full-time employees, even those who are waiving.</p>
        <span>* Carrier requirements may vary</span>
      </>}/>
    case RaRoute.erStargate_CensusWaive:
      return <PrivateWizardRoute component={ERShopCensusWaive} onwards={approved => approved ? RaRoute.erStargate_Plans : RaRoute.erStargate_ScheduleACall} localStorageKey='waiveScreenSeen' entry={<>
        <h1>Waiving Coverage</h1>
        <p>Some employees will not want coverage, this is called <b>waiving coverage.</b> Waiving Coverage may alter your <b>estimated costs.</b></p>
      </>}/>
    case RaRoute.erStargate_ScheduleACall:
      return <WizardRoute onwards={RaRoute.erStargate_Plans} component={ERShopScheduleACall}/>
    case RaRoute.erStargate_Plans:
      return <PrivateWizardRoute component={ERShopPlans} onwards={({ showSidecarInfo }) =>
        showSidecarInfo
          ? RaRoute.erStargate_SidecarInfo
          : RaRoute.erStargate_AncillaryPlans
      }
      entry={<>
        <h1>Prosper Benefits+</h1>
        <p><b>Prosper Benefits+</b> is included with every plan and features 24/7 Telehealth, Medical Bill Saver, Health Advocacy, Work/Life Care Management, and more.</p>
      </>} />
    case RaRoute.erStargate_SidecarInfo:
      // Same onwards/entry as above
      return <PrivateWizardRoute component={ERSidecarInfo} onwards={RaRoute.erStargate_AncillaryPlans} localStorageKey='sidecarInfoScreenSeen'/>
    case RaRoute.erStargate_AncillaryPlans:
      return <PrivateWizardRoute component={ERShopPlansAncillary} onwards={({ showIMQs }) =>
        showIMQs
          ? RaRoute.erStargate_IMQs
          : RaRoute.erStargate_CarvedContributions
      } localStorageKey='ancillaryScreenSeen' />
    case RaRoute.erStargate_IMQs:
      return <PrivateWizardRoute component={ERIMQs} onwards={({ imqsComplete }) =>
        imqsComplete
          ? RaRoute.erStargate_CarvedContributions
          : RaRoute.erStargate_Plans
      }
      localStorageKey='employerIMQs'/>
    case RaRoute.erStargate_CarvedContributions:
      return <PrivateWizardRoute component={ERShopContributionsCarved} onwards={RaRoute.erStargate_Contribution} localStorageKey='specialContributionScreenSeen' />
    case RaRoute.erStargate_Contribution:
      return <PrivateWizardRoute component={ERShopPlansContribution} onwards={RaRoute.erStargate_Application} localStorageKey='contributionScreenSeen' entry={<>
        <h1>Set Your Contribution</h1>
        <p>The average employer covers 62–82% of the <b>healthcare premium</b> per employee. Most healthcare companies require a 50% contribution.</p>
      </>} />
    case RaRoute.erStargate_Application:
      return <PrivateWizardRoute component={ERStargateCarrierApplication} onwards={RaRoute.erStargate_Review} entry={<>
        <h1>Signing Up for Your Care</h1>
        <p>For enrollment purposes, please answer these questions about your company. approx. 5 min</p>
      </>} />
    case RaRoute.erStargate_Review:
      return <PrivateWizardRoute component={ERShopPlansReview} onwards={RaRoute.erStargate_Finalize} localStorageKey='reviewScreenSeen' />
    case RaRoute.erStargate_Finalize:
      return <PrivateWizardRoute component={ERShopCongratulations} onwards={RaRoute.dashboardEmployer} />
    case RaRoute.erStargateRefresh:
      return <PrivateWizardRoute component={ERShopRefresh} onwards={RaRoute.erStargate_GetStarted} />

    case RaRoute.eeStargate_info:
      return <PrivateWizardRoute render={props => <EEShopCensus {...props} />} onwards={RaRoute.eeStargate_work} />
    case RaRoute.eeStargate_work:
      return <PrivateWizardRoute component={EEShopWorkStatus} onwards={RaRoute.eeStargate_family} />
    case RaRoute.eeStargate_family:
      return <PrivateWizardRoute component={EEShopFamily} onwards={({ showExistingCoverageChapter, showRedflagsPage }) =>
        showRedflagsPage
          ? RaRoute.eeStargate_redflags
          : showExistingCoverageChapter
            ? RaRoute.eeStargate_have_plan
            : RaRoute.eeStargate_underwriting
      } localStorageKey='eeFamilySeen' />
    case RaRoute.eeStargate_redflags:
      return <PrivateWizardRoute component={EEShopMedical} onwards={showExistingCoverageChapter =>
        showExistingCoverageChapter
          ? RaRoute.eeStargate_have_plan
          : RaRoute.eeStargate_underwriting
      } localStorageKey='eeMedicalQuestionsSeen'/>
    case RaRoute.eeStargate_have_plan:
      return <PrivateWizardRoute component={HavePlan} onwards={showUnderwritingPage =>
        showUnderwritingPage
          ? RaRoute.eeStargate_underwriting
          : RaRoute.eeStargate_select
      } />
    case RaRoute.eeStargate_underwriting:
      return <PrivateWizardRoute component={Underwriting} onwards={RaRoute.eeStargate_select} localStorageKey='eeUnderwritingScreenSeen' />
    case RaRoute.eeStargate_select:
      return <PrivateWizardRoute component={EEShopPlansHealth} onwards={individualExperience => individualExperience ? RaRoute.eeStargate_enroll : RaRoute.eeStargate_ancillary} />
    case RaRoute.eeStargate_ancillary:
      return <PrivateWizardRoute component={EEShopPlansAncillary} onwards={RaRoute.eeStargate_enroll} localStorageKey='employeeAncillaryScreenSeen' />
    case RaRoute.eeStargate_enroll:
      return <PrivateWizardRoute component={EEShopPlansEnroll} onwards={({ hasSidecar }) =>
        hasSidecar
          ? RaRoute.eeStargate_application
          : RaRoute.eeStargate_confirm
      } localStorageKey='employeeEnrollScreenSeen' />
    case RaRoute.eeStargate_application:
      return <PrivateWizardRoute component={Application} onwards={RaRoute.eeStargate_confirm} />
    case RaRoute.eeStargate_pay:
      return <PrivateWizardRoute component={Payment} onwards={RaRoute.eeStargate_confirm} />
    case RaRoute.eeStargate_confirm:
      return <PrivateWizardRoute component={EEShopConfirm} onwards={RaRoute.dashboardEmployee} />
    }
  }
}

export default componentForRoute
