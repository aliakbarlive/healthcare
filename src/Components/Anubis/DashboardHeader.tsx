/* eslint-disable camelcase */
import React from 'react'
import styles from './DashboardHeader.module.scss'
import useUser, { Response as User } from 'Utilities/Hooks/useUser'
import { Img } from 'react-image'
import { compact } from 'lodash'
import useStargate from 'Utilities/Hooks/useStargate'
import { useLocation } from 'react-router-dom'
import myhealthilyAvatar from 'Assets/MyHealthilyAvatar.png'
import { v3 } from 'Utilities/pharaoh'
import { Broker } from 'Utilities/pharaoh.types'
import { signedInAsName } from './SignedInAs'
import { Route } from 'Utilities/Route'

interface Venues {
  groups: { id: string, name: string, agencyName: string }[]
  anubis: { ee: string[], er: string[], agency: boolean }
  stargate: { ee: string[], er: string[] }
}
const DashboardHeader: React.FC = () => {
  const { value: user, loading, error } = useUser()
  const location = useLocation().pathname
  const userData = useStargate().value
  const async = useUser<[User, Venues, Broker]>(async user => {
    const venues = await v3.users().venues() as Venues
    const broker = await v3.brokers.GET() as Broker
    return [user, venues, broker]
  })
  if (error || loading) {
    if (error) console.error(error)
    return null
  }
  const signedInLabel = Object.values(signedInAsName).find((item) => {
    return item?.powerLevel === userData?.user?.power_level && location.startsWith(item.route)
  })
  const AgencyName = (async!.value?.[2]?.agency?.name) || ''
  const srcs = compact([user?.avatar, myhealthilyAvatar])
  const usernameText = userData?.group?.name
  const pl5User = userData?.user?.power_level === 5
  const candorUser = pl5User ? 'MyHealthily' : usernameText
  const employerDash = location.startsWith(Route.dashboardEmployer)
  const agencyDash = location.startsWith(Route.agencyDashboard)
  const agencyShop = location.startsWith(Route.agencyShop)
  const agencyGrpName = (agencyShop || agencyDash) ? AgencyName : candorUser
  const classes:any = [employerDash ? styles.signedAsEr : ((agencyDash || agencyShop) ? styles.agencyDash : styles.signedAsEe)]
  return (<div className={styles.headerContainer}>
    <div className={styles.userProfileImg}>
      <Img src={srcs} width='100%' height='auto' alt='Profile'/>
    </div>
    <div>
      <p className={styles.erSigned}>Signed in to <span className={classes}>
        {signedInLabel?.shopDashName}</span> { agencyGrpName && <> for<span className={classes}> {pl5User ? 'MyHealthily' : agencyGrpName}</span> </>}
      </p>
      {signedInLabel?.label && <label className={styles.dashEmployer}>{`${signedInLabel?.label}`}</label>}
    </div>
  </div>
  )
}
export default DashboardHeader
