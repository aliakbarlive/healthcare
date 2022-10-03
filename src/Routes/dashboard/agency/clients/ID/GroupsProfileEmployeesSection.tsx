import React from 'react'
import ProfileSection from 'Components/Anubis/ProfileSection'
import { useToggle } from 'react-use'
import { Alignment, Table } from 'Components/Rudimentary/Table'
import _, { compact } from 'lodash'
import AddEmployeeModal from 'Components/Anubis/AddEmployeeModal'
import { useHistory, useLocation } from 'react-router-dom'
import { Route } from 'Utilities/Route'
import { AsyncStateRetry } from 'react-use/lib/useAsyncRetry'
import { extractPlanNameAndCarrier, getPlanIDFrom, massagedPlanName, typeOfPlan } from 'Components/Plans/plan-subcomponents/Plan.helpers'
import { ContributionSplit } from 'Utilities/Hooks/useStargate'
import Loader from 'Components/Rudimentary/Loader'
import Error from 'Components/Primitives/Error'
import ContributionsCalculator, { Contributions, isMedical, MemberPlus, moneyNumber, moneyString, PlanUnion } from 'Utilities/Plans/ContributionCalculator'

type Props = {
  ees: AsyncStateRetry<MemberPlus[]>
  id: string
  splits: ContributionSplit[]
  contributions: Contributions
}

const GroupsProfileEmployeesSection: React.FC<Props> = ({ ees: async, id, splits, contributions }) => {
  if (async.loading || async.error) {
    return <ProfileSection key={0} name='Employees'>
      {async.loading ? <Loader /> : <Error error={async.error} />}
    </ProfileSection>
  }

  const members = async.value!
  if (!splits || splits.length < 1) {
    return <EETable ees={members} id={id} contributions={contributions}/>
  } else {
    const all = new Set(members.map(({ id }) => id))
    const rv = splits.map(split => {
      const set = new Set(split.members)
      set.forEach(id => all.delete(id))
      const ees = members.filter(m => set.has(m.id))

      return <EETable
        key={split.id}
        ees={ees}
        name={split.name}
        split={split}
        contributions={contributions}
        id={id}
      />
    })
    if (all.size) {
      rv.push(<EETable
        key='key'
        ees={members.filter(member => all.has(member.id))}
        name='Ungrouped'
        contributions={contributions}
        id={id}
      />)
    }
    return <>{rv}</>
  }
}

interface EETableProps {
  split?: ContributionSplit
  name?: string
  ees: MemberPlus[]
  id: string
  contributions: Contributions
}

const EETable: React.FC<EETableProps> = ({ split, name, ees, id, contributions }) => {
  const [open, toggle] = useToggle(false)
  const history = useHistory()
  const location = useLocation()

  let prettyName: string | JSX.Element | undefined

  if (name) {
    prettyName = <div style={{ lineHeight: '1.1em' }}>Employees <br/><span style={{ fontSize: '.8em', color: '#AAAAAA' }}>{name}</span></div>
  } else {
    prettyName = 'Employees'
  }

  const members = ees.map(e => ({
    id: e.id,
    name: e.name,
    plans: compact([e.medical, e.dental, e.vision, e.life, e.disability]),
    tier: e.tier,
    status: e.enrollmentStatus
  }))

  return <ProfileSection key={split?.id} name={prettyName} addButtonName="Add New Employee" expanded={false} onAddButton={toggle}>
    <AddEmployeeModal isOpen={open} onRequestClose={toggle} groupID={id} callback={push} splitID={split?.id} />
    <Table
      data={members}
      sortable={false}
      order={['name', 'plans', 'tier', 'status']}
      width={key => {
        switch (key) {
        case 'name':
          return '20%'
        case 'plans':
          return '52%'
        case 'tier':
          return '10%'
        case 'status':
          return '12%'
        }
      }}
      content={(key, value, row) => {
        switch (key) {
        case 'tier':
        case 'status':
          return prettyValue()
        case 'plans':
          return <Details plans={row.plans} contributions={contributions} member={ees.find(e => e.id === row.id)!} split={split}/>
        }

        function prettyValue() {
          let p: any = value
          p = _.startCase(p?.replace('MedicalUnderwriting', 'Application'))
          return p
        }
      }}
      alignment={() => Alignment.left}
      selectAction={push}
      selectable={() => true}
      reportFileBasename='employees'
      reportContent={(key, value, row) => {
        switch (key) {
        case 'name':
          return value
        case 'status':
          return _.startCase(value)
        case 'plans':
          return row.plans.map(plan => isMedical(plan) ? plan.name : plan.plan.name).join(', ')
        }
      }}
    />
  </ProfileSection>

  function push(data: { id: string }) {
    const newEmployeeID = data.id
    const path = location.pathname.startsWith('/dashboard/agency')
      ? `${Route.agencyDashboardEmployees}/${newEmployeeID}`
      : `${Route.dashboardEmployerEmployees}/${newEmployeeID}`
    history.push(path)
  }
}

interface DetailProps {
  plans: PlanUnion[]
  contributions: Contributions
  member: MemberPlus
  split?: ContributionSplit
}

const Details: React.FC<DetailProps> = ({ plans, contributions, split, member }) => {
  if (plans.length === 0) return <>—</>
  const calc = new ContributionsCalculator(compact(plans), contributions, compact([split]), [member], 2)
  const data = plans.map(p => {
    const poo = calc.premiumsFor(member)
    return {
      id: getPlanIDFrom(p),
      ...extractPlanNameAndCarrier(p),
      premium: poo ? poo[typeOfPlan(p)]?.ee : 0,
      policyId: member.policyIDs[typeOfPlan(p)]?.policyID || '-',
      memberId: member.policyIDs[typeOfPlan(p)]?.memberID || '-'
    }
  })

  if (member.medical || member.prosper) {
    data.push({
      id: member.id,
      carrier: 'Prosper Benefits',
      name: '',
      premium: member.medical ? 0 : moneyNumber(member.prosper),
      policyId: '',
      memberId: ''
    })
  }
  return <Table
    style={{ pointerEvents: 'none' }}
    data={data}
    order={['name', 'premium', 'policyId', 'memberId']}
    content={(key, value, row) => {
      switch (key) {
      case 'premium':
        return value === undefined ? <>—</> : moneyString(value, 2)
      case 'name':
        return <><b>{row.carrier}</b> {massagedPlanName(value, row.carrier)}</>
      }
    }}
    heading={key => {
      switch (key) {
      case 'name': return 'Plan Name'
      case 'policyId': return 'Policy #'
      case 'memberId': return 'Member ID'
      }
    }}
    width={key => {
      switch (key) {
      case 'name':
        return '65%'
      }
    }}
  />
}

export default GroupsProfileEmployeesSection
