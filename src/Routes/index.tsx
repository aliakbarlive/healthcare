import React, { ReactElement } from 'react'
import { Link, Redirect } from 'react-router-dom'
import * as api from 'Utilities/pharaoh'
import Loader from 'Components/Rudimentary/Loader'
import Error from 'Components/Primitives/Error'
import { Route } from 'Utilities/Route'
import useUser, { PowerLevel, Response as User } from 'Utilities/Hooks/useUser'
import { useForm } from 'react-hook-form'
import { post } from 'Utilities/fetch++'
import CandorInput from 'Components/Rudimentary/CandorInput'
import { isProduction, obeliskMode } from 'Utilities/config'
import { useWhiteLabel } from 'Utilities/Hooks/useWhiteLabel'
import moment from 'moment'

const Landing: React.FC = () => {
  const async = useUser<[User, Venues]>(async user => {
    const venues = await api.v3.users().venues() as Venues
    return [user, venues]
  })
  const { register, handleSubmit } = useForm()
  const label = useWhiteLabel().label
  const isObelisk = obeliskMode(label)

  if (async.loading) return <Loader />
  if (async.error) return <Error error={async.error} />

  const [user, venues] = async.value!
  const groups = venues.groups.reduce((rv: any, group: any) => { rv[group.id] = group; return rv }, {})
  const redirect = onlyOneDestination(venues)
  if (redirect) {
    return <Redirect to={redirect} />
  }

  function mapper(id: string, route: string) {
    const group = groups[id]
    return <>
      <td><Link to={route} onClick={() => { localStorage.overrideGroupID = id }}>{group.name}</Link></td>
      <td>{moment(api.utcMidnightToLocalMidnight(group.effectiveDate)).format('M/D/YYYY')}</td>
      <td>{group.agencyName}</td>
    </>
  }

  const stargateERs = venues.stargate.er.map((id: string) => mapper(id, `${Route.stargate}/employer`))
  const stargateEEs = venues.stargate.ee.map((id: string) => mapper(id, `${Route.stargate}/employee`))
  const anubisERs = venues.anubis.er.map((id: string) => mapper(id, Route.dashboardEmployer))
  const anubisEEs = venues.anubis.ee.map((id: string) => mapper(id, Route.dashboardEmployee))

  const els: ReactElement[] = []
  let key = 0
  function table(input: ReactElement[]) {
    els.push(<table width="50%">
      <thead>
        <tr>
          <th style={{ textAlign: 'left' }}>Group</th>
          <th style={{ textAlign: 'left' }}>Effective Date</th>
          <th style={{ textAlign: 'left' }}>Agency</th>
        </tr>
      </thead>
      {input.map((el, ii: number) => <tr key={ii}>{el}</tr>)}
    </table>)
  }

  if (user.powerLevel >= PowerLevel.broker) {
    els.push(<p key={key++}>To invite new users to your benefit portal’s shopping experience use the following link:</p>)
    els.push(<p key={key++}>{shopLink()}</p>)
    els.push(<h1 key={key++} style={{ marginTop: '6rem' }}>Your Links</h1>)
  }

  if (venues.anubis.agency) {
    els.push(<h2 key={key++}>Agency Dashboard</h2>)
    els.push(<Link key={key++} to={Route.agencyDashboardHome}>Agency Dashboard</Link>)
    els.push(<p key={key++}><em>This is your primary portal.</em></p>)
  }

  function extraInfoCheck(array: any[]) {
    return array.length > 1 || user.powerLevel >= PowerLevel.broker
  }

  if (stargateERs.length) {
    els.push(<h2 key={key++}>Employer Shopping Experience</h2>)
    if (extraInfoCheck(stargateERs)) els.push(<p key={key++}>Shop and select the benefits you will offer the employees at your company.</p>)
    table(stargateERs)
  }
  if (stargateEEs.length) {
    els.push(<h2 key={key++}>Employee Shopping Experience</h2>)
    if (extraInfoCheck(stargateEEs)) {
      els.push(<p key={key++}>Visit the employee shop to select your benefits or waive.</p>)
      /// TODO: This shouldn't be hardcoded.
      els.push(<p key={key++}><b>Please select 2022!</b></p>)
    }
    table(stargateEEs)
  }

  if (anubisERs.length) {
    els.push(<h2 key={key++}>HR Dashboard</h2>)
    if (extraInfoCheck(anubisERs)) els.push(<p key={key++}>For the following groups, you’re either an employee or you administer the group.</p>)
    table(anubisERs)
  }
  if (anubisEEs.length) {
    els.push(<h2 key={key++}>Employee Dashboard</h2>)
    if (extraInfoCheck(anubisEEs)) els.push(<p key={key++}>Visit your dashboard after choosing your benefits at the shop.</p>)
    table(anubisEEs)
  }

  if (superAdmin() || !isProduction()) {
    els.push(<h1 key={key++} style={{ marginTop: '6rem' }}>Superuser Actions</h1>)
    els.push(<form onSubmit={handleSubmit(onSubmit)} key={key++}>
      <CandorInput
        name="email"
        ref={register}
        placeholder='Switch User'
        style={{ width: '30rem', margin: '1rem 0' }} />
      <input type="submit" />
    </form>)
  }

  return <>
    <h1>Welcome, {user.name || user.email}</h1>
    {els}
  </>

  async function onSubmit(data: any) {
    // NOTE not catching because who cares for Candor ees only
    const rsp = await post('/v2/support/user', data)
    api.setToken(rsp.token)
    window.location.reload()
  }

  function superAdmin() {
    return user.powerLevel >= PowerLevel.candorEmployee
  }

  function shopLink(): ReactElement {
    const path = isObelisk
      ? `/shop/${user.slug}`
      : '/shop'
    const host = window.location.host
    const prefix = process.env.REACT_APP_BASENAME || ''
    const display = `${window.location.protocol}//${host}${prefix}${path}`
    return <Link to={path}>{display}</Link>
  }
}

function onlyOneDestination({ anubis, stargate }: Venues): string | null {
  let count = anubis.ee.length
  count += anubis.er.length
  if (anubis.agency) count += 1
  count += stargate.ee.length
  count += stargate.er.length

  // user has options, render them
  if (count > 1) return null

  if (anubis.ee.length) return Route.dashboardEmployee
  if (anubis.er.length) return Route.dashboardEmployer
  if (stargate.ee.length) return '/shop/employee'
  if (stargate.er.length) return '/shop/employer'
  if (anubis.agency) return Route.agencyDashboardHome

  // well hi there user who entered the shop but didn’t create a group yet
  return Route.erStargate_GroupType
}

interface Venues {
  groups: { id: string, name: string, effectiveDate: Date, agencyName: string }[]
  anubis: { ee: string[], er: string[], agency: boolean }
  stargate: { ee: string[], er: string[] }
}

export default Landing
