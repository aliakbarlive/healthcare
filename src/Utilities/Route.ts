/* eslint-disable camelcase */
/// HEY YOU! LISTEN! These must be in an order so iterating them with a `startsWith` type pattern will return longer paths first!
/// NOTE handle `:id` params etc. in App.tsx, DO NOT ADD HERE
enum Route {
  agencyDashboardReports = '/dashboard/agency/reports',
  agencyDashboardPipeline = '/dashboard/agency/pipeline',
  agencyDashboardClients = '/dashboard/agency/clients',
  agencyDashboardAssociations = '/dashboard/agency/associations',
  agencyDashboardProducers = '/dashboard/agency/producers',
  agencyDashboardEmployees = '/dashboard/agency/employees',
  agencyDashboardAgencies = '/dashboard/agency/agencies',

  dashboardEmployerEmployees = '/dashboard/employer/employees',
  dashboardEmployerProfile = '/dashboard/employer/profile',
  dashboardEmployerBilling = '/dashboard/employer/billing',
  dashboardEmployer = '/dashboard/employer',

  dashboardEmployee = '/dashboard/employee',
  dashboardEmployeeProfile = '/dashboard/employee/profile',

  agencyDashboard = '/dashboard/agency',

  dashboard = '/dashboard',

  stargate = '/shop',

  erStargate_GroupType = '/shop/employer/group-type',
  erStargate_Checklist = '/shop/employer/checklist',
  erStargate_GetStarted = '/shop/employer/get-started',
  erStargate_Census = '/shop/employer/census',
  erStargate_CensusWaive = '/shop/employer/census/waive',
  erStargate_ScheduleACall = '/shop/employer/schedule',
  erStargate_Plans = '/shop/employer/plans',
  erStargate_SidecarInfo = '/shop/employer/plans/sidecar-health',
  erStargate_AncillaryPlans = '/shop/employer/plans/ancillary',
  erStargate_IMQs = '/shop/employer/imqs',
  erStargate_CarvedContributions = '/shop/employer/plans/contribution/carved',
  erStargate_Contribution = '/shop/employer/plans/contribution',
  erStargate_Application = '/shop/employer/plans/application',
  erStargate_Review = '/shop/employer/plans/review',
  erStargate_Finalize = '/shop/employer/confirm',

  erStargateRefresh = '/shop/employer/refresh',

  eeStargate_info = '/shop/employee/census',
  eeStargate_work = '/shop/employee/work',
  eeStargate_family = '/shop/employee/census/family',
  eeStargate_redflags = '/shop/employee/medical',
  eeStargate_have_plan = '/shop/employee/plans/already-covered',
  eeStargate_select = '/shop/employee/plans/health',
  eeStargate_ancillary = '/shop/employee/plans/ancillary',
  eeStargate_enroll = '/shop/employee/plans/enroll',
  eeStargate_underwriting = '/shop/employee/plans/underwriting',
  eeStargate_application = '/shop/employee/plans/application',
  eeStargate_pay = '/shop/employee/checkout',
  eeStargate_confirm = '/shop/employee/confirm',

  signUp = '/account/sign-up',
  signIn = '/account/sign-in',
  signOut = '/account/sign-out',
  forgotPassword = '/account/recover',
  resetPassword = '/account/reset-password',

  landing = '/' // MUST BE LAST!
}
/// HEY YOU! I HOPE YOU LISTENED!

function getTitle(route: Route): string {
  switch (route) {
  case Route.agencyDashboardProducers:
    return 'Producers'
  case Route.agencyDashboardClients:
    return 'Clients'
  case Route.agencyDashboardAssociations:
    return 'Associations'
  case Route.agencyDashboardPipeline:
    return 'Pipeline'
  case Route.agencyDashboardReports:
    return 'Reports'
  case Route.agencyDashboardAgencies:
    return 'Agencies'
  case Route.dashboardEmployerEmployees:
  case Route.agencyDashboardEmployees:
    return 'Employees'
  case Route.dashboardEmployerProfile:
    return 'Company Profile'
  case Route.dashboardEmployerBilling:
    return 'Billing'
  case Route.dashboardEmployer:
    return 'Home'
  case Route.dashboardEmployeeProfile:
    return 'Your Profile'
  case Route.dashboard:
  case Route.agencyDashboard:
  case Route.dashboardEmployee:
    return 'Dashboard'
  case Route.stargate:
    return 'Shop'
  case Route.erStargate_GroupType:
    return 'Group Type'
  case Route.erStargate_Checklist:
    return 'Checklist'
  case Route.erStargate_GetStarted:
    return 'Get Started'
  case Route.erStargate_Census:
    return 'Census'
  case Route.erStargate_CensusWaive:
    return 'Census·Waive'
  case Route.erStargate_ScheduleACall:
    return 'Schedule A Call'
  case Route.erStargate_Contribution:
    return 'Plans·Contributions'
  case Route.erStargate_CarvedContributions:
    return 'Plans·Contributions·Carved'
  case Route.erStargate_Plans:
    return 'Plans'
  case Route.erStargate_Application:
    return 'Sidecar Health Info'
  case Route.erStargate_AncillaryPlans:
    return 'Plans·Ancillary'
  case Route.erStargate_IMQs:
    return 'IMQs'
  case Route.erStargate_SidecarInfo:
    return 'Carrier Application'
  case Route.erStargate_Review:
    return 'Review'
  case Route.erStargate_Finalize:
    return 'Finalize'

  case Route.erStargateRefresh:
    return 'Refresh'

  case Route.eeStargate_info:
  case Route.eeStargate_work:
  case Route.eeStargate_family:
  case Route.eeStargate_redflags:
  case Route.eeStargate_have_plan:
  case Route.eeStargate_select:
  case Route.eeStargate_ancillary:
  case Route.eeStargate_underwriting:
  case Route.eeStargate_enroll:
  case Route.eeStargate_pay:
  case Route.eeStargate_confirm:
    return 'TODO'
  case Route.eeStargate_application:
    return 'Application'

  case Route.signIn:
    return 'Sign‑In'
  case Route.signOut:
    return 'Sign‑Out'
  case Route.forgotPassword:
    return 'Recover Account'
  case Route.resetPassword:
    return 'Reset Password'
  case Route.landing:
    return 'Landing Page'
  case Route.signUp:
    return 'Sign Up'
  }
}

export { Route, getTitle }
