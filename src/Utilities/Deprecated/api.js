/* eslint-disable camelcase */
import { get, put, post, delete_, upload } from 'Utilities/fetch++'

async function getUser() {
  return get('/users')
}

async function verifyAssociationInvitation(token) {
  return get(`/associations/invitation/${token}`)
}

async function getGroup(group_id) {
  return get(`/groups/${group_id}`)
}

async function getGroupBroker(group_id) {
  return get(`/groups/${group_id}/broker`)
}

async function addGroupToAssociation(group_id, association_id) {
  return put(`/associations/${association_id}/groups/${group_id}`)
}

async function getGroupsByAssociationId(association_id) {
  return get(`/associations/${association_id}/groups`)
}

async function getCarriersByStates(state_abbrevs) {
  return post('/carriers/in/states', state_abbrevs)
}

async function getCarriersByState(state_abbrev) {
  return get(`/carriers/in/${state_abbrev}`)
}

async function getCarriersByZipCode(zipcode) {
  return getCarriersByState(zipcode)
}

async function getCountiesInState(state) {
  return get(`/counties/in/state/${state}`)
}

async function getCountiesInZipCode(zipcode) {
  return get(`/counties/in/zipcode/${zipcode}`)
}

async function getCarriersByAssociation(assocId) {
  return get(`/associations/${assocId}/carriers`)
}

async function sendSupportEmail(subject, body, referrer, email = null, isPlanApplication = null) {
  const object = {
    subject,
    body,
    referrerURL: referrer,
    email,
    isPlanApplication
  }
  return post('/support/mail', object)
}

async function gentlyRemindGroupStragglers(groupId) {
  return post(`/groups/${groupId}/remind-stragglers`)
}

async function savePlaidStuff(public_token, group_id) {
  return post(`/groups/${group_id}/plaid-link/${public_token}`)
}

/// future is a boolean detailing if Plaid is set-up for this group or not
async function getPlaidStatus(group_id) {
  return get(`/groups/${group_id}/plaid-link`).then(() => true).catch(err => {
    if (err.response.status === 404) {
      return false
    } else {
      throw err
    }
  })
}

async function createAncillaryPlan(groupId, plan) {
  return post(`/groups/${groupId}/plans/options`, plan)
}

// eslint-disable-next-line no-unused-vars
async function addAssociation(id, name, phoneNumber, address1, address2, zipCode, state, contactName, contactEmail, website, notes) {
  const object = {
    name: name,
    phoneNumber: phoneNumber,
    address1: address1,
    address2: address2,
    zipCode: parseInt(zipCode, 10),
    state: state,
    contactName: contactName,
    contactEmail: contactEmail,
    website: website,
    notes: notes
  }
  return post('/associations', object)
}

async function addGroup(assocID, name, contactName, email, phoneNumber, address1, address2, zipCode, state, website, notes, countyId) {
  const object = {
    address1: address1,
    address2: address2,
    contactEmail: email,
    contactName: contactName,
    groupName: name,
    phoneNumber: phoneNumber,
    state: state,
    website: website,
    zipCode: zipCode,
    notes: notes,
    countyID: countyId
  }
  return post(`/associations/${assocID}/groups/invite`, object)
}

async function addUnaffiliatedGroup(name, contactName, email, phoneNumber, address1, address2, zipCode, state, website, notes, countyId) {
  const object = {
    address1: address1,
    address2: address2,
    contactEmail: email,
    contactName: contactName,
    groupName: name,
    phoneNumber: phoneNumber,
    state: state,
    website: website,
    zipCode: zipCode,
    notes: notes,
    countyID: countyId
  }
  return post('/groups/invite', object)
}

async function addCarriersToAssociation(assocId, carriers) {
  return put(`/associations/${assocId}/carriers`, carriers)
}

async function addEmployeesToGroup(groupId, employeeArr) {
  return post(`/groups/${groupId}/users`, employeeArr)
}

async function addEmployeesToProsperOnlyGroup(groupId, employeeArr) {
  return post(`/groups/${groupId}/users/prosper`, employeeArr)
}

async function getPlansByGroupId(groupId) {
  return get(`/groups/${groupId}/plans/options`)
}

async function getAncillaryPlansByType(groupId, planType) {
  return get(`/groups/${groupId}/plans/options/${planType}`)
}

async function getEmployeesInGroup(groupId) {
  return get(`/groups/${groupId}/users`)
}

async function getIndustries() {
  return get('/industries')
}

async function getIndustriesFor(collective) {
  return get(`/industries/for/${collective}`)
}

async function uploadFile() {
  throw new Error('Invalid endpoint')
}

async function addPlansToGroup(planId, quoteId, rateId, groupId) {
  const object = {
    planID: planId,
    quoteID: quoteId,
    rateID: rateId
  }
  return put(`/groups/${groupId}/plans`, object)
}

async function validateInvite(token) {
  return get(`/ticket/${token}`)
}

async function updateUser(updateObj) {
  // alreadyHasPlan, zipCode, phoneNumber, hireDate, hoursPerWeek, address1, address1, mailingAddress1, mailingAddress2, email, birthday, socialSecurityNumber, countyId
  return put('/users', updateObj)
}

async function addDependents(dependentArray) {
  return post('/users/dependents', dependentArray)
}

async function waiveUserForGroup(groupId, reason) {
  return post(`/groups/${groupId}/users/waive`, reason)
}

async function waiveMembersForGroup(groupId, employeeArray) {
  return put(`/groups/${groupId}/users/waive`, employeeArray)
}

async function getAssociationsByCode(code) {
  return get(`/associations/in/${code}`)
}

async function addCarriersToGroup(groupId, carriers) {
  return put(`/groups/${groupId}/carriers`, carriers)
}

async function getCarriersByGroup(groupId) {
  return get(`/groups/${groupId}/carriers`)
}

async function upsertGroup(obj, groupId) {
  if (groupId) {
    return post(`/v2/groups/${groupId}`, obj)
  } else {
    return post('/v2/groups', obj)
  }
}

async function getACASample(groupId) {
  return get(`/groups/${groupId}/users/aca-sample`)
}

async function levelFundable(groupId) {
  return get(`/groups/${groupId}/level-fundable`)
}

async function getLevelFunded(groupId) {
  return get(`/groups/${groupId}/plans/level-funded`)
}

async function getAssociationById(assocId) {
  return get(`/associations/${assocId}`)
}

// PUT to notes only for now because lol
async function updateAssocNotes(assocId, notes) {
  const noteObj = { notes: notes }
  return put(`/associations/${assocId}`, noteObj)
}

async function addPlanToUser(rateId) {
  return put(`/users/plan/${rateId}`)
}

async function resetPassword(email) {
  return post('/users/reset-password', email)
}

async function getPlanDetails(planId) {
  return get(`/plans/${planId}`)
}

async function inviteGroupUsers(groupId) {
  return post(`/groups/${groupId}/users/invite`)
}

async function inviteGroupMember(groupId, email) {
  const obj = {
    email: email
  }
  return post(`/v2/groups/${groupId}/users/invite`, obj)
}

async function inviteManager(groupId, email) {
  const obj = {
    email: email
  }
  return post(`/v2/groups/${groupId}/invite/manager`, obj)
}

async function promoteEmployeeToGroupManager(groupId, empId) {
  return post(`/groups/${groupId}/users/${empId}/promote`)
}

async function getAncillaryPlans(groupId, type) {
  return get(`/groups/${groupId}/plans/options/${type}`)
}

async function addDentalPlansToEmployee(planId) {
  return put(`/users/plans/dental/${planId}`)
}

async function removeDentalPlansFromEmployee() {
  return delete_('/users/plans/dental')
}

async function addVisionPlansToEmployee(planId) {
  return put(`/users/plans/vision/${planId}`)
}

async function removeVisionPlansFromEmployee() {
  return delete_('/users/plans/vision')
}

async function addLifePlansToEmployee(planId) {
  return put(`/users/plans/life/${planId}`)
}

async function addLTDPlanToEmployee(planId) {
  return put(`/users/plans/disability/${planId}`)
}

async function removeLTDPlanToEmployee() {
  return delete_('/users/plans/disability')
}

async function removeLifePlansFromEmployee() {
  return delete_('/users/plans/life')
}

async function getUsersPlans() {
  return get('/users/plan')
}

async function supportQuickQuote(zipCode, memberCount, avgAge) {
  return get(`/support/quick-quote/zip/${zipCode}/member-count/${memberCount}/age/${avgAge}`)
}

async function switchToUser(email) {
  return post('/v2/support/user', { email })
}

async function stargateProgress(id = '') {
  return get(`/stargate/${id || ''}`)
}

async function createOrUpdateGroup(obj, groupId) {
  if (groupId) {
    return post(`/groups/${groupId}`, obj)
  } else {
    return post('/groups', obj)
  }
}

async function getStateOfZip(zipCode) {
  return get(`/states/for/zipcode/${zipCode}`)
}

async function getRecommendedPlans(groupId, queryString = '') {
  return get(`/v2/groups/${groupId}/plans/options/recommended${queryString}`)
}

// Plan category selector: Lowest premium or lowest deductible
async function getLowestPlans(groupId, type, queryString = '') {
  return get(`/v2/groups/${groupId}/plans/options/lowest/${type}${queryString}`)
}

async function getAllPlans(groupId, queryString = '') {
  return get(`/v2/groups/${groupId}/plans/options${queryString}`)
}

async function sendDocusignEnvelopes(groupId) {
  return post(`/groups/${groupId}/docusign`)
}

// Group === Employer
async function addPlanToGroup(groupId, planId) {
  return post(`/v2/groups/${groupId}/plans/${planId}`)
}

async function getGroupSelectedPlans(groupId) {
  return get(`/v3/groups/${groupId}/plans`)
}

async function getMemberSelectedPlans(groupId, memberId) {
  return get(`/v3/groups/${groupId}/users/${memberId}/plans`)
}

async function removePlanFromGroup(groupId, planId) {
  return delete_(`/v2/groups/${groupId}/plans/${planId}`)
}

// User === Employee
async function addAPlanToUser(groupId, planId) {
  return post(`/v2/groups/${groupId}/users/plans/${planId}`)
}

async function getUserSelectedPlans() {
  return get('/v2/users/plans')
}

async function removeUserSelectedPlan(groupId) {
  return delete_(`/v2/groups/${groupId}/users/plans/`)
}

async function updateMedicalUnderwritingStatus(groupId, payload) {
  return put(`/groups/${groupId}/users/`, payload)
}

async function getObeliskTiers() {
  return get('/v2/obelisk/subscriptions/tiers')
}

async function createSmallBroker(payload) {
  return post('/v2/obelisk/small-broker', payload)
}

async function createAndAddLicenseToSmallBroker(brokerId, payload) {
  return post(`/v2/obelisk/small-broker/${brokerId}/licenses`, payload)
}

async function addCarriersToSmallBroker(brokerId, carriers) {
  return put(`/v2/obelisk/small-broker/${brokerId}/carriers`, carriers)
}

async function uploadFilesToSmallBroker(brokerId, payload, isLogo = false) {
  payload.isLogo = isLogo
  return put(`/v2/obelisk/small-broker/${brokerId}/upload`, payload)
}

async function addPlaidTokenToSmallBroker(brokerId, payload) {
  return put(`/v2/obelisk/small-broker/${brokerId}/plaid`, payload)
}

async function updateSmallBrokerDetails(brokerId, payload) {
  return put(`/v2/obelisk/small-broker/${brokerId}`, payload)
}

async function smallBrokerProgress() {
  return get('/v2/obelisk')
}

async function brokerGroupsPerCarrier() {
  return get('/v2/brokers/groups/per/carrier')
}

async function brokerSalesPipeline() {
  return get('/v2/brokers/sales-pipeline')
}

async function brokerPipeline() {
  // return get('/v2/brokers/pipeline');
  return [
    {
      id: 'id1234',
      name: 'First Last',
      group: 'Company Name',
      status: 'Suspect',
      apStatus: 'Underwriting',
      renewal: '01/15/21',
      contacted: '01/14/20',
      associations: 'JAA',
      flag: true
    },
    {
      id: 'id1235',
      name: 'Last First',
      group: 'Company Name',
      status: 'Prospect',
      apStatus: 'Underwriting',
      renewal: '01/15/21',
      contacted: '01/14/20',
      associations: 'JAA',
      flag: false
    }
  ]
}

async function brokerBillableUnits() {
  return get('/v2/brokers/associations/billable-units')
}

async function broverview() {
  return get('/v2/brokers')
}

async function brokerMetadata(slug = '') {
  return get(`/v2/small-brokers/${slug}`)
}

async function getContributionSplit(groupId) {
  return get(`/groups/${groupId}/split`)
}

async function updateContributionSplit(groupId, payload) {
  return put(`/groups/${groupId}/split`, payload)
}

async function deleteContributionSplit(groupId, groupGroupId) {
  return delete_(`/groups/${groupId}/split/${groupGroupId}`)
}

async function providersSearch(groupId, obj) {
  return post(`/v2/groups/${groupId}/users/providers`, obj)
}

async function drugsSearch() {
  throw new Error('')
}

async function uploadGroupXlsx(file) {
  return upload('/v2/groups/xlsx', file)
}

const api = {
  getUser,
  getGroup,
  addGroupToAssociation,
  getGroupsByAssociationId,
  getCarriersByStates,
  getCarriersByState,
  getCountiesInZipCode,
  getCarriersByZipCode,
  verifyAssociationInvitation,
  getCountiesInState,
  sendSupportEmail,
  addCarriersToAssociation,
  addAssociation,
  addGroup,
  addEmployeesToGroup,
  addEmployeesToProsperOnlyGroup,
  getCarriersByAssociation,
  getEmployeesInGroup,
  getIndustries,
  getIndustriesFor,
  addUnaffiliatedGroup,
  getPlansByGroupId,
  uploadFile,
  addPlansToGroup,
  validateInvite,
  updateUser,
  addDependents,
  waiveUserForGroup,
  waiveMemberForGroup: waiveMembersForGroup,
  getAssociationsByCode,
  addCarriersToGroup,
  getCarriersByGroup,
  getACASample,
  getGroupSelectedPlans,
  getMemberSelectedPlans,
  levelFundable,
  getLevelFunded,
  getAssociationById,
  updateAssocNotes,
  addPlanToUser,
  savePlaidStuff,
  getPlaidStatus,
  resetPassword,
  getPlanDetails,
  inviteGroupUsers,
  inviteGroupMember,
  getGroupBroker,
  promoteEmployeeToGroupManager,
  inviteManager,
  getAncillaryPlans,
  addDentalPlansToEmployee,
  addVisionPlansToEmployee,
  addLifePlansToEmployee,
  addLTDPlanToEmployee,
  removeDentalPlansFromEmployee,
  removeVisionPlansFromEmployee,
  removeLifePlansFromEmployee,
  removeLTDPlanToEmployee,
  getUsersPlans,
  gentlyRemindGroupStragglers,
  supportQuickQuote,
  switchToUser,
  getStateOfZip,
  stargateProgress,
  createOrUpdateGroup,
  getRecommendedPlans,
  sendDocusignEnvelopes,
  getLowestPlans,
  getAllPlans,
  addPlanToGroup,
  removePlanFromGroup,
  addAPlanToUser,
  getUserSelectedPlans,
  removeUserSelectedPlan,
  updateMedicalUnderwritingStatus,
  getObeliskTiers,
  createSmallBroker,
  createAndAddLicenseToSmallBroker,
  addCarriersToSmallBroker,
  uploadFilesToSmallBroker,
  addPlaidTokenToSmallBroker,
  updateSmallBrokerDetails,
  smallBrokerProgress,
  brokerGroupsPerCarrier,
  brokerSalesPipeline,
  brokerBillableUnits,
  broverview,
  brokerMetadata,
  updateContributionSplit,
  getContributionSplit,
  deleteContributionSplit,
  createAncillaryPlan,
  getAncillaryPlansByType,
  upsertGroup,
  providersSearch,
  drugsSearch,
  uploadGroupXlsx,
  brokerPipeline
}

export default api
