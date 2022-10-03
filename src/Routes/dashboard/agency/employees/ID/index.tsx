import React, { useState } from 'react'
import { useAsyncRetry, useToggle } from 'react-use'
import Loader from 'Components/Rudimentary/Loader'
import Error from 'Components/Primitives/Error'
import ProfileSection from 'Components/Anubis/ProfileSection'
import { Table, SortDirection } from 'Components/Rudimentary/Table'
import DependentModal from 'Components/Anubis/DependentModal'
import { startCase } from 'lodash'
import { Member as User, Dependent, Privilege, EnrollmentStatus, Venue, Tier, QualifyingEvent, Relationship } from 'Utilities/pharaoh.types'
import CandorForm, { CandorFormName, CandorFormAddress, CandorFormEmail, CandorFormDatePicker, CandorFormCheckbox, CandorFormSelect } from 'Components/Anubis/CandorForm'
import { useForm, Controller } from 'react-hook-form'
import * as api from 'Utilities/pharaoh'
import { Route } from 'Utilities/Route'
import useToast from 'Utilities/Hooks/useToast'
import { localMidnightToPharaohFormat } from 'Utilities/pharaoh'
import ContactSnapshot, { Content } from 'Components/Anubis/ContactSnapshot'
import TodoList from 'Components/Anubis/TodoList'
import styles from './index.module.scss'
import { healthcareDetailsTitle } from '../../clients/ID/GroupsProfileMedicalPlansSection'
import EEMedicalPlan from 'Components/Plans/EEMedicalPlan'
import DentalPlan from 'Components/Plans/DentalPlan'
import VisionPlan from 'Components/Plans/VisionPlan'
import LifePlan from 'Components/Plans/LifePlan'
import useUser, { PowerLevel } from 'Utilities/Hooks/useUser'
import BackTo from 'Components/Anubis/BackTo'
import moment from 'moment'
import AddButton from 'Components/Anubis/AddButton'
import AddQualifyingEventModal from 'Components/Anubis/AddQualifyingEventModal'
import { PremiumSplits, massagedPlanName } from 'Components/Plans/plan-subcomponents/Plan.helpers'
import { ssnNormalizer } from 'Utilities/etc'
import { GAButton } from 'Components/Tracking'
import { Label } from 'Utilities/config'
import { ContributionSplit, Member } from 'Utilities/Hooks/useStargate'
import ContributionsCalculator, { Contributions, moneyString } from 'Utilities/Plans/ContributionCalculator'
import Modal, { ActionType, BrandColors } from 'Components/Modals/Modal'

interface Props {
  id: string
}

const DashboardAgencyEmployee: React.SFC<Props> = ({ id }) => {
  const [open, toggle] = useToggle(false)
  const [isQleModalOpen, toggleQleModalOpen] = useToggle(false)
  const [isPromoteModalOpen, togglePromoteModalOpen] = useToggle(false)
  const async = useAsyncRetry<[User, any | null, ContributionSplit[], Contributions]>(async() => {
    const user = await api.v3.users(id).GET()
    const plans = await api.v3.members(user.id).selections.GET().catch(() => null) // `user.id` is the groupMember id
    const contributions = await api.v3.groups(user.group.id).contributions.GET()
    const splits = await api.v1.groups(user.group.id).splits.GET()
    return [user, plans, splits, contributions]
  })
  const addToast = useToast()
  const user = useUser()

  if (async.loading) return <Loader/>
  if (async.error) return <Error error={async.error}/>

  // TODO the AddDependentModal returns the correctly typed new object, we should add to our list
  //   though to do that we probs want our own Async“List” custom hook

  const ee = async.value![0]
  const deps = ee.dependents || []
  const plans = async.value![1]
  const splits = async.value![2]
  const contributions = async.value![3]
  const qles = ee.qualifyingEvents || []

  const contactSnapshotContent: Content[] = [{
    before: <h2>{deps.length || '0'}</h2>,
    after: <span>TOTAL # Dependents</span>
  }]

  const member = {
    id: ee.id,
    name: ee.contact.name || '',
    email: ee.contact.email || '',
    is_waived: ee.isWaived,
    dependents: ee.dependents ? ee.dependents.map(d => ({
      id: d.id,
      firstName: '', // Don't care in plan
      lastName: '', // Don't care in plan
      gender: d.gender,
      dateOfBirth: d.dob,
      relationship: d.relationship
    })) : [],
    tier: ee.tier,
    enrollmentStatus: ee.status,
    medical_underwriting_complete: ee.isMedicallyUnderwritten
  }

  contactSnapshotContent.push({ after: <span>Status: {startCase(ee.status.replace('MedicalUnderwriting', 'Application'))}</span> })

  if (user.value && user.value.powerLevel >= PowerLevel.groupManager) {
    if (ee.signUpLink) {
      contactSnapshotContent.push({ after: <span><a href={ee.signUpLink}>User Sign Up Link</a></span> })
    } else {
      contactSnapshotContent.push({ after: <span><a href='#' onClick={onInviteStandard}>Invite to Group</a></span> })
    }
    contactSnapshotContent.push({
      after: <span>
        {(() => {
          switch (ee.privilege) {
          case Privilege.standard:
            return <GAButton analytics={`Promote to Group Manager (${DashboardAgencyEmployee.name})`} onClick={togglePromoteModalOpen}>Promote to<br/>Group Manager</GAButton>
          case Privilege.manager:
            return <>Group Manager</>
          case Privilege.invitedToManage:
            return <>Group Manager invitation&nbsp;sent</>
          }
        })()}
      </span>
    })
  }

  const effectiveDate = ee.dates.effective

  if (effectiveDate) {
    contactSnapshotContent.push({
      after: <span>Effective Date<br/> {moment(effectiveDate).format('L') }</span>
    })
  }

  const button = user.value && user.value!.powerLevel >= PowerLevel.broker
    ? <BackTo analytics={`Back to ${ee.group.name} (${DashboardAgencyEmployee.name})`} route={`${Route.agencyDashboardClients}/${ee.group.id}`}>Back to <em>{ee.group.name}</em></BackTo>
    : undefined

  return <>
    <header className={styles.header}>
      {button}
      <Modal
        header={<div style={{ paddingRight: '2rem' }}>Are you sure you want to promote this employee to group manager?</div>}
        isOpen={user.value && user.value!.powerLevel >= PowerLevel.groupManager ? isPromoteModalOpen : false}
        onRequestClose={togglePromoteModalOpen}
        contentStyle={{ maxWidth: '100%', width: 600 }}
        footerButtons={[
          {
            onClick: onInvite,
            content: 'Promote Employee to Group Manager',
            color: BrandColors.blue,
            actionType: ActionType.primary,
            gaButtonName: 'Promote to Manager'
          }, {
            onClick: togglePromoteModalOpen,
            content: 'Close',
            color: BrandColors.gray,
            actionType: ActionType.primary,
            gaButtonName: 'Cancel Promote to Manager'
          }
        ]}
      >
        <p>Promoting an employee to group manager enables them to select plans and make changes to the group. Once you promote an employee to group manager, the action cannot be undone.</p>
      </Modal>
      <AddQualifyingEventModal isOpen={isQleModalOpen} onRequestClose={toggleQleModalOpen} name={ee.contact.name || ''} id={ee.id} callback={toggleQleModalOpen} />
      <AddButton analytics={`Add Qualifying Event (${DashboardAgencyEmployee.name})`} className={styles.qualifyingLifeEvent} onClick={toggleQleModalOpen}>Add Qualifying Event</AddButton>
    </header>
    <div className={styles.profileContainer}>
      <ContactSnapshot name={ee.contact.name || ''} content={contactSnapshotContent}/>
      <Form user={ee} />
      <TodoList id={id} />
    </div>
    <div className={styles.profileSectionContainer}>
      <ProfileSection name='Benefits Breakdown' expanded={true}>
        <BenefitsBreakdown plans={plans} contributions={contributions} splits={splits} member={member} />
      </ProfileSection>
      <ProfileSection name={healthcareDetailsTitle} expanded={false}>
        <MedicalPlan user={member} plan={plans?.healthPlan} contributions={contributions} splits={splits} premiumSplits={plans?.premiums.medical?.split} />
      </ProfileSection>
      <ProfileSection name='Ancillary Plans' expanded={false}>
        <AncillaryPlans user={member} plans={plans} contributions={contributions} />
      </ProfileSection>
      <ProfileSection name='Dependents' expanded={false} addButtonName="Add Dependent" onAddButton={toggle}>
        <Dependents id={ee.id} deps={deps} reload={async.retry} open={open} close={() => toggle(false)} username={user.value?.name || 'loading'} />
      </ProfileSection>
      <ProfileSection name='Qualifying Life Events' expanded={false}>
        <QLEs id={ee.id} qles={qles} reload={async.retry} open={open} close={() => toggle(false)} username={user.value?.name || 'loading'} />
      </ProfileSection>
    </div>
  </>

  async function onInvite() {
    try {
      const rsp = await api.v3.groups(ee.group.id).users(ee.id).promote()
      togglePromoteModalOpen()
      addToast((() => {
        switch (rsp.outcome) {
        case 'invited':
          return 'User invited'
        case 'alreadyInvited':
          return 'User will be promoted when they sign‑up'
        case 'promoted':
          return 'User promoted'
        default:
          return 'Unexpected success'
        }
      })())
      async.retry()
    } catch (error) {
      addToast(error)
    }
  }

  async function onInviteStandard() {
    try {
      await api.v3.tickets().POST({ name: ee.contact.name!, email: ee.contact.email!, venue: Venue.employee, venueID: ee.group.id })
      const email = ee.contact.email
      addToast(`Email invitation sent to ${email}`)
      async.retry()
    } catch (error) {
      addToast(error)
    }
  }
}

interface FormProps {
  user: User
}

const genderOptions = [{ value: 'M', label: 'Male' }, { value: 'F', label: 'Female' }]

const Form: React.FC<FormProps> = ({ user }) => {
  const form = useForm({ defaultValues: user })

  return <CandorForm save={save} {...form}>
    <CandorFormName name='contact.name' />

    <CandorFormEmail {...form}/>

    <CandorFormAddress showCountyPicker />
    <CandorFormDatePicker placeholder='Birth Date' name="dob" defaultValue={null}>
      Birth Date
    </CandorFormDatePicker>
    <CandorFormSelect name='gender' options={genderOptions} placeholder='Biological Sex'>
      Sex
    </CandorFormSelect>
    <label>SSN
      <Controller
        render={props => <input
          {...props}
          onChange={event => props.onChange(ssnNormalizer(event.currentTarget.value))}
          minLength={11} maxLength={11}
          pattern='[0-9-]{11}'
          className='glance_masked'
          placeholder='Social Security Number'
        />}
        name="ssn"
      />
    </label>
    <CandorFormCheckbox name='isWaived' checked={user.isWaived} disabled={user.privilege !== 'manager'}>Waived</CandorFormCheckbox>
    <CandorFormCheckbox name='isMedicallyUnderwritten' checked={user.isMedicallyUnderwritten} disabled={user.privilege !== 'manager'}>Application<br/>Complete</CandorFormCheckbox>
    <CandorFormDatePicker placeholder='Hire Date' name='dates.hire' defaultValue={null}>
      Hire Date
    </CandorFormDatePicker>
    <CandorFormDatePicker placeholder='Coverage Termination Date' name='dates.termination' defaultValue={null}>
      Termination<br/>Date
    </CandorFormDatePicker>
    <label>Salary
      <input name='salary' placeholder='Salary' ref={form.register} />
    </label>
  </CandorForm>

  async function save(data: any) {
    if (data.address.state === '') delete data.address.state
    data.id = user.id
    data.dob = localMidnightToPharaohFormat(data.dob)
    data.salary = data.salary || undefined

    if (data.dates?.hire) {
      data.dates.hire = localMidnightToPharaohFormat(data.dates.hire)
    }

    if (data.dates?.termination) {
      data.dates.termination = localMidnightToPharaohFormat(data.dates.termination)
    }

    if (typeof data.isWaived !== 'boolean') {
      data.isWaived = user.isWaived
    }

    if (typeof data.isMedicallyUnderwritten !== 'boolean') {
      data.isMedicallyUnderwritten = user.isMedicallyUnderwritten
    }

    // ignored, but required (FIXME)
    data.status = user.status
    data.tier = user.tier
    data.group = user.group
    data.privilege = user.privilege

    await api.v3.users().PUT(data)
    form.reset(await api.v3.users(user.id).GET())
  }
}

interface MPProps {
  user: Member
  splits: any[]
  plan?: any
  contributions: Contributions
  premiumSplits?: PremiumSplits
}

const MedicalPlan: React.FC<MPProps> = ({ user, splits, plan, premiumSplits, contributions }) => {
  if (!plan || !premiumSplits) return <p>User has not completed their profile.</p>

  return <EEMedicalPlan
    member={user}
    plan={plan}
    splits={splits}
    contributions={contributions}
    premium={premiumSplits}
    key={plan.id}
    showWeeklyPayments={false} // TODO should figure out from label configuration for group
    label={Label.myhealthily} // TODO should figure out from label configuration for group
  />
}

interface APProps {
  plans: any | null
  user: Member
  contributions: Contributions
}

const AncillaryPlans: React.FC<APProps> = ({ plans, user, contributions }) => {
  const rv: any[] = []
  if (plans?.dentalPlan) {
    rv.push(<DentalPlan
      plan={plans.dentalPlan}
      member={user}
      contributions={contributions}
      premium={plans.premiums.dental.split}
      key={plans.dentalPlan.plan.id}
      showWeeklyPayments={false} // TODO should figure out from label configuration for group
      label={Label.myhealthily} // TODO should figure out from label configuration for group
    />)
  }
  if (plans?.visionPlan) {
    rv.push(<VisionPlan
      plan={plans.visionPlan}
      member={user}
      contributions={contributions}
      premium={plans.premiums.vision.split}
      key={plans.visionPlan.plan.id}
      showWeeklyPayments={false} // TODO should figure out from label configuration for group
      label={Label.myhealthily} // TODO should figure out from label configuration for group
    />)
  }
  if (plans?.lifePlan) {
    rv.push(<LifePlan
      plan={plans.lifePlan}
      member={user}
      contributions={contributions}
      premium={plans.premiums.life.split}
      key={plans.lifePlan.plan.id}
      showWeeklyPayments={false} // TODO should figure out from label configuration for group
      label={Label.myhealthily} // TODO should figure out from label configuration for group
    />)
  }
  if (rv.length === 0) {
    return <p>User has not chosen any ancillary plans.</p>
  } else {
    return <>{rv}</>
  }
}

interface BenefitsBreakdown {
  id: string
  plan: string
  tier: Tier
  premium: string
  dependents: number
  waiting: number
  effective: Date
  renewal: Date
  status: EnrollmentStatus
}

interface BBProps {
  plans: any
  member: any
  contributions: Contributions
  splits: ContributionSplit[]
}

const BenefitsBreakdown: React.FC<BBProps> = ({ member, plans: rawPlans, contributions, splits }) => {
  const planTypes = [
    {
      plan: rawPlans?.healthPlan,
      premium: rawPlans?.premiums?.medical?.split.ee
    },
    {
      plan: rawPlans?.lifePlan,
      premium: rawPlans?.premiums?.life?.split.ee
    },
    {
      plan: rawPlans?.dentalPlan,
      premium: rawPlans?.premiums?.dental?.split.ee
    },
    {
      plan: rawPlans?.visionPlan,
      premium: rawPlans?.premiums?.vision?.split.ee
    },
    {
      plan: rawPlans?.disabilityPlan,
      premium: rawPlans?.premiums?.disability?.split.ee
    }
  ].filter(a => !!a.plan)

  const data: BenefitsBreakdown[] = planTypes.map(type => {
    const calc = new ContributionsCalculator([type.plan], contributions, splits || [], [member])
    const premium = calc.premiums([type.plan], false, [member]).ee

    return {
      id: member.id,
      plan: type.plan.name ? massagedPlanName(type.plan.name, type.plan.carrier) : type.plan.plan?.name,
      tier: member.tier,
      premium: moneyString(premium),
      dependents: member.dependents?.length ?? 0,
      waiting: 0,
      effective: new Date(),
      renewal: new Date(),
      status: member.status
    }
  })

  return <Table
    data={data}
    order={['plan', 'tier', 'premium', 'dependents']}
    content={(key, value) => {
      switch (key) {
      case 'tier':
        return startCase(value.replace('MedicalUnderwriting', 'Application'))
      }
    }}
    sortable={['plan', 'tier', 'premium', 'waiting', 'effective', 'renewal']}
    width={key => {
      switch (key) {
      case 'tier':
        return '10%'
      case 'premium':
        return '8%'
      case 'dependents':
        return '10%'
      case 'waiting':
      case 'effective':
      case 'renewal':
        return '10%'
      }
    }}
    reportFileBasename={`${member.name}-benefits-breakdown`}
  />
}

interface DependentsProps {
  deps: Dependent[]
  id: string
  reload: () => void
  close: () => void
  open: boolean
  username: string
}

const Dependents: React.FC<DependentsProps> = ({ deps, id, reload, open, close, username }) => {
  const [selected, setSelected] = useState<Dependent | undefined>()
  const hasPartner = deps.some((dep) => [Relationship.spouse, Relationship.lifePartner].includes(dep.relationship))
  return <>
    <Table
      data={deps}
      content={(key, value) => {
        switch (key) {
        case 'gender':
        case 'relationship':
          return startCase(value === Relationship.lifePartner ? 'Domestic Partner' : value)
        case 'terminationDate':
          return value ? moment(value).format('L') : value
        }
      }}
      width={key => {
        switch (key) {
        case 'dob':
        case 'relationship':
        case 'terminationDate':
          return '16%'
        case 'gender':
        case 'ssn':
          return '11%'
        }
      }}
      order={['name', 'dob', 'relationship', 'gender', 'ssn', 'terminationDate']}
      heading={key => {
        switch (key) {
        case 'dob':
          return 'Birth Date'
        }
      }}
      sortable={['name', 'dob', 'gender', 'relationship', 'terminationDate']}
      selectAction={setSelected}
      selectable={() => true}
      defaultSort='relationship'
      defaultSortDirection={key => key === 'relationship' ? SortDirection.descending : SortDirection.ascending}
      secondarySort={() => ['dob', 'name']}
      reportFileBasename={`${username}-dependents`}
    />
    <DependentModal
      key={selected?.id || id /* key must vary or defaultValues don’t work */}
      id={id}
      dependent={selected}
      isOpen={open || selected !== undefined}
      onRequestClose={onCancel}
      onSuccess={onSuccess}
      onDelete={onSuccess}
      hasPartner={hasPartner} />
  </>

  function onSuccess() {
    setSelected(undefined)
    close()
    reload()
  }

  function onCancel() {
    setSelected(undefined)
    close()
  }
}

interface QLEProps {
  qles: QualifyingEvent[]
  id: string
  reload: () => void
  close: () => void
  open: boolean
  username: string
}

const QLEs: React.FC<QLEProps> = ({ qles, username }) => {
  return <>
    <Table
      data={qles}
      content={(key, value) => {
        switch (key) {
        case 'event':
          return startCase(value)
        case 'date':
          return moment(value).format('M/D/YY')
        }
      }}
      order={['event', 'date']}
      sortable={['event', 'date']}
      defaultSort='date'
      reportFileBasename={`${username}-qles`}
    >
    </Table>
  </>
}

export default DashboardAgencyEmployee
