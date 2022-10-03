import React from 'react'
import styles from './index.module.scss'
import ProfileInfoSection from 'Routes/dashboard/agency/clients/ID/ProfileInfoSection'
import NotesSection from 'Components/Anubis/NotesSection'
import GroupsProfileMedicalPlansSection from './GroupsProfileMedicalPlansSection'
import GroupsProfileAncillaryPlansSection from './GroupsProfileAncillaryPlansSection'
import GroupsProfileDocumentsSection from './GroupsProfileDocumentsSection'
import GroupsProfileEmployeesSection from './GroupsProfileEmployeesSection'
import * as api from 'Utilities/pharaoh'
import Error from 'Components/Primitives/Error'
import Loader from 'Components/Rudimentary/Loader'
import { useToggle, useAsyncRetry } from 'react-use'
import { Route } from 'Utilities/Route'
import { Link, useLocation } from 'react-router-dom'
import { Identifiable } from 'Components/Rudimentary/Table'
import useUser, { PowerLevel, Response as UserResponse } from 'Utilities/Hooks/useUser'
import UploadFileModal from 'Components/Anubis/UploadFileModal'
import { upload, FetchError } from 'Utilities/fetch++'
import { v4 as uuid } from 'uuid'
import * as config from 'Utilities/config'
import { AsyncState } from 'react-use/lib/useAsync'
import { Association, Group, Relationship, Tier } from 'Utilities/pharaoh.types'
import { GAButton } from 'Components/Tracking'
import ContributionsCalculator, { Contributions, MemberPlus, moneyNumber, moneyString } from 'Utilities/Plans/ContributionCalculator'
import moment from 'moment'
import { ContributionSplit, Member as StargateMember } from 'Utilities/Hooks/useStargate'
import { csv } from 'Utilities/csv'
import { getPlanIDFrom } from 'Components/Plans/plan-subcomponents/Plan.helpers'
import { compact, flatten, uniqBy } from 'lodash'
import { classNames } from 'Utilities/etc'
import SendPlansModal from 'Routes/shop/employer/plans/review/components/SendPlansModal'
import Tooltip from 'Components/Stargate/ToolTip/Tooltip'
import { AppMode, useAppMode } from 'Components/Stargate/TableOfContents'
import { TierCount } from './Proposals/Proposal'
import CommissionsModal from './Proposals/CommissionsModal/CommissionsModal'

const DashboardAgencyGroup: React.FC<Identifiable> = ({ id }) => {
  const [modalVisible, setModalVisible] = useToggle(false)
  const async = useAsyncRetry(() => Promise.all([
    api.v3.groups(id).GET(),
    api.v3.groups(id).contributions.GET(),
    api.v1.groups(id).splits.GET(),
    api.v3.groups(id).users().GET(),
    api.v2.brokers.groups(id).users(),
    api.v3.brokers.GET()
  ]), [id])
  const user = useUser()

  if (async.loading) return <Loader />
  if (async.error) return <Error error={async.error} />

  const group = async.value![0]
  const contributions = async.value![1]
  const splits = async.value![2]
  const ees = async.value![3] as MemberPlus[]
  const v2eesAsync = { ...async, value: async.value && async.value[4].members }
  const broker = async.value![5]
  const eesAsync = { error: async.error, loading: async.loading, value: ees, retry: async.retry }

  const isBrokerDash = useAppMode() === AppMode.agency
  const isMyHealthilyEmployee = user.value?.powerLevel === PowerLevel.candorEmployee

  return (
    <div style={{ position: 'relative', overflow: 'hidden' }}>
      <div className={styles.mainContainer}>
        <div>
          <ProfileInfoSection id={id} targetType='group' group={group} ees={v2eesAsync} />
        </div>
        <div className={styles.miscDetails}>
          <Associations associations={group.associations} />
          <GroupIncompleteSection todo={group.todo} groupID={group.id} user={user} callback={async.retry}>
            <Link className={styles.links} to={`${Route.stargate}/employer`} onClick={setGroupID}>Employer Shop</Link>
            {isBrokerDash && <div>
              <button className={styles.links} onClick={setModalVisible}>Generate Proposal</button>
              <CommissionsModal isOpen={modalVisible} onRequestClose={setModalVisible} group={{ name: group.name, id: group.id, effectiveDate: group.dates.effective, groupState: group.address.state }} enrollCount={employeePerTierCount(ees)} broker={broker} />
            </div> }
            <Link className={styles.links} to={`${Route.agencyDashboardClientsPlan}/${group.id!}`}>Add Current Plan</Link>
            <div>
              <p className={styles.proposalDisclaimer}>Plans in your cart will be included in your proposal.</p>
            </div>
            {!!group.enrollmentDocsURL && <a className={styles.links} href={group.enrollmentDocsURL} target="_blank" rel="noopener noreferrer">Review Enrollment</a>}
            {!group.todo.census && group.todo.manager && <SelectGroupManagerButton group={group} members={ees} />}
            {!isBrokerDash && <PayrollDeductions contributions={contributions} ees={ees} splits={splits} />}
          </GroupIncompleteSection>
        </div>
        <div>
          <HRDashboardButton setGroupID={setGroupID}>
            <PayrollDeductions contributions={contributions} ees={ees} splits={splits} />
            {isMyHealthilyEmployee && <CairoButton id={id} />}
          </HRDashboardButton>
        </div>
        <NotesSection targetID={id} />
        <div className={styles.toolTipContainer}>
          <div style={{ flexGrow: 1 }}>
            <GroupsProfileMedicalPlansSection id={id} members={ees} contributions={contributions} splits={splits} />
          </div>
          <div className={styles.toolTipBtn}>
            <button type='button' className={styles.info} data-tip data-for='shopPlansTooltip'>i</button>
          </div>
          <Tooltip
            id='shopPlansTooltip'
            place='right'
            offset={{ top: 0, right: 0 }}
            delayHide={100}
            backgroundColor='linear-gradient(135deg, #0B4BF7 0%, #8B17BB 100%)'
            textColor='#6925cb'
          >
            <span>Use this button to view and select healthcare plans from our shop. Plans added to your cart will be included in your proposal.</span>
          </Tooltip>
        </div>
        <GroupsProfileAncillaryPlansSection id={id} members={ees} contributions={contributions} />
        <GroupsProfileDocumentsSection id={id} />
        <GroupsProfileEmployeesSection ees={eesAsync} id={id} contributions={contributions} splits={splits} />
      </div>
    </ div>

  )

  function setGroupID() {
    localStorage.overrideGroupID = id
  }
}

export function employeePerTierCount(ees: MemberPlus[]): TierCount {
  const enrollmentCount: TierCount = ({ individual: 0, couple: 0, single: 0, family: 0 })
  ees.forEach(function(ee) {
    switch (ee.tier) {
    case Tier.individual:
      enrollmentCount.individual++
      break
    case Tier.couple:
      enrollmentCount.couple++
      break
    case Tier.singleParent:
      enrollmentCount.single++
      break
    case Tier.family:
      enrollmentCount.family++
      break
    }
  })
  return enrollmentCount
}

interface SelectGroupManagerButtonProps {
  members: StargateMember[]
  group: Group
}

const SelectGroupManagerButton: React.FC<SelectGroupManagerButtonProps> = ({ members, group }) => {
  const [visible, toggleVisible] = useToggle(false)

  function handleSendPlans(email: string) {
    return api.v2.groups(group?.id).invite.manager(email).then(() => toggleVisible())
  }

  return <>
    <button className={styles.links} onClick={toggleVisible}>Select Group Manager</button>
    <SendPlansModal members={members} callback={handleSendPlans} isOpen={visible} onRequestClose={toggleVisible} />
  </>
}

interface HRDashboardButtonProps {
  setGroupID: () => void
}

const HRDashboardButton: React.FC<HRDashboardButtonProps> = ({ setGroupID, children }) => {
  const isAgencyDash = useLocation().pathname.startsWith(Route.agencyDashboard)

  if (isAgencyDash) {
    return <>
      <div className={styles.dashbText}>
        <h3 className={styles.dashHeading}>Dashboard</h3>
        <p className={styles.explainerCopy}>Access client information such as statuses, plans, and other pertinent information about their coverage.</p>
      </div>
      <div className={styles.dashboard}>
        <Link className={styles.links} to={Route.dashboardEmployer} onClick={setGroupID}>HR Dashboard</Link>
        {children}
      </div>
    </>
  } else {
    return <></>
  }
}

const CairoButton: React.FC<{ id: string }> = ({ id }) => {
  const user = useUser()
  const isSuperUser = (user.value?.powerLevel || PowerLevel.individual) >= PowerLevel.candorEmployee

  if (isSuperUser) {
    const cairo = `${config.cairo()}?id=${id}`
    return <a className={styles.links} href={cairo}>Cairo</a>
  } else {
    return <></>
  }
}

interface GISProps {
  todo: { census: boolean, manager: boolean }
  groupID: string
  callback: () => void
  user: AsyncState<UserResponse>
}

const GroupIncompleteSection: React.FC<GISProps> = ({ todo, groupID, callback, children, user }) => {
  const [isModalOpen, setIsModalOpen] = useToggle(false)

  if (user.loading) return <></>
  if (user.error) {
    if (user.error instanceof FetchError && user.error.response.status === 401) {
      return <></> // not signed in
    } else {
      return <Error error={user.error} />
    }
  }

  const isBroker = (user.value!.powerLevel || PowerLevel.individual) > PowerLevel.groupManager
  const header = `${isBroker ? 'Broker' : 'Your'} action links`
  const uploadModalCopy = `
    Please use the downloadable .xlsx template below to upload
    employee information for those eligible to receive healthcare
    coverage through your ${isBroker ? 'client' : 'business'}.
    Employees waiving coverage must also be entered into the
    census to ensure accuracy
  `
  let copy: JSX.Element

  switch (true) {
  case isBroker && todo.census && todo.manager:
    copy = <>This area contains important links for your client’s healthcare coverage. You can upload your client’s census, and shop healthcare coverage options.</>
    break
  case isBroker:
    copy = <>Enter your client’s shopping experience to browse or select their healthcare coverage options.</>
    break
  case !isBroker && todo.census && todo.manager:
    copy = <>This area contains important links for your healthcare coverage. You can upload your census, and shop healthcare coverage options.</>
    break
  default:
    copy = <>Enter your shopping experience to browse or select healthcare coverage options.</>
  }

  return <div className={styles.actionLinksContainer}>
    <h3>{header}</h3>
    <p className={styles.explainerCopy}>{copy}</p>
    {todo.census && todo.manager &&
      <UploadFileModal
        title='Census Upload'
        copy={uploadModalCopy}
        template={{
          href: 'https://app.myhealthily.com/MyHealthily.com-census.xlsx',
          name: 'MyHealthily.com-census.xlsx'
        }}
        isOpen={isModalOpen}
        onSubmit={handleSubmit}
        onRequestClose={setIsModalOpen}
        successMessage='Census successfully uploaded'
      />
    }
    <div className={styles.actionLinks}>
      {todo.census && todo.manager &&
        <GAButton analytics={`Upload Census (${DashboardAgencyGroup.name})`} className={`${styles.links} ${styles.upload}`} onClick={setIsModalOpen}>Upload Census</GAButton>
      }
      {children}
    </div>
  </div>

  async function handleSubmit(data: any) {
    // Catches in UploadFileModal
    return upload('/groups/xlsx', data.file[0]).then(rsp => {
      /* eslint-disable */
      const emps = rsp.map((emp: any) => {
        return {
          id: uuid(),
          email: emp.email,
          name: `${emp.firstName} ${emp.lastName}`,
          gender: emp.gender,
          date_of_birth: api.localMidnightToPharaohFormat(emp.dateOfBirth),
          zip_code: emp.zipCode,
          last_tobacco_use_date: emp.tobbacoUse ? api.localMidnightToPharaohFormat(new Date()) : undefined,
          dependents: emp.dependents.map((dep: any) => {
            return {
              id: uuid(),
              firstName: dep.firstName,
              lastName: dep.lastName,
              zipCode: dep.zipCode,
              dateOfBirth: api.localMidnightToPharaohFormat(dep.dateOfBirth),
              gender: dep.gender,
              lastUsedTobacco: dep.tobaccoUse ? api.localMidnightToPharaohFormat(new Date()) : undefined,
              relationship: dep.type === 'domesticPartner' ? Relationship.lifePartner : dep.type
            }
          })
        }
      })
      /* eslint-enable */
      return api.v1.groups(groupID).users.POST(emps).then(callback)
    })
  }
}

interface AssProps {
  associations: Association[] | undefined
}

const Associations: React.FC<AssProps> = ({ associations }) => {
  const list = associations?.map((ass: Association, ii: number) => {
    return <li key={ii}><span>{ass.name}</span></li>
  })

  return <div className={styles.ass}>
    <h3>Associations</h3>
    {associations?.length
      ? <ul className={styles.asses}>{list}</ul>
      : 'None'
    }
  </div>
}

interface PayrollDeductionsProps {
  ees: MemberPlus[]
  contributions: Contributions
  splits: ContributionSplit[]
}

const PayrollDeductions: React.FC<PayrollDeductionsProps> = ({ ees, contributions, splits }) => {
  const plans = uniqBy(flatten(ees.map(ee => compact([ee.medical, ee.dental, ee.vision, ee.life, ee.disability]))), (p) => getPlanIDFrom(p))
  return <button className={classNames(styles.links, styles.payrollDeductions)} onClick={downloadReport}>Payroll Deductions</button>

  async function downloadReport() {
    const calc = new ContributionsCalculator(plans, contributions, splits, ees, 2)
    const basename = `payroll-deductions-report-${moment().format('MM-DD-YYYY')}`
    const element = document.createElement('a')
    const headers = ['employee', 'name', 'ssn', 'health', 'dental', 'vision', 'life', 'disability', 'prosper', 'total']
    const rows = ees.map(transform)
    const data = csv([headers].concat(rows))
    const file = new Blob([data], { type: 'text/csv' })
    element.href = URL.createObjectURL(file)
    element.download = `${basename}.csv`
    document.body.appendChild(element) // required for this to work in FireFox
    element.click()

    function transform(member: MemberPlus, index: number): string[] {
      const premiums = calc.premiumsFor(member)
      const deductions = [
        premiums?.medical?.ee,
        premiums?.dental?.ee,
        premiums?.vision?.ee,
        premiums?.life?.ee,
        premiums?.disability?.ee,
        premiums?.prosper?.ee
      ].map(p => p === undefined ? '' : moneyString(p, 2))

      const r = new RegExp(/^(?:\d{3})-(?:\d{2})-(\d{4})$/)
      const ssn = member.ssn ? member.ssn.replace(r, '###-##-$1') : ''

      return [
        `${index + 1}`,
        member.name,
        ssn,
        ...deductions,
        moneyString(deductions.map(d => moneyNumber(d, 2)).reduce((a, b) => a + b, 0), 2)
      ]
    }
  }
}

export default DashboardAgencyGroup
