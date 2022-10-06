import React from 'react'
import myhealthilyAvatar from 'Assets/MyHealthilyAvatar.png'
import styles from './HeaderUserProfile.module.css'
import { useLocation, Link } from 'react-router-dom'
import useUser from 'Utilities/Hooks/useUser'
import { Img } from 'react-image'
import { compact } from 'lodash'
import DashboardHeader from './DashboardHeader'

const HeaderUserProfile: React.FC = () => {
  const { value: user, loading, error } = useUser()
  const location = useLocation()

  if (error || loading || location.pathname.startsWith('/shop')) {
    if (error) console.error(error)
    return null
  }

  const srcs = compact([user?.avatar, myhealthilyAvatar])

  const hasGroups = user && user.groups.length > 0
  const usernameText = <div>{user?.name}</div>
  const userNameElement = hasGroups
    ? <Link to='/dashboard/employee' className={styles.userName}>{usernameText}</Link>
    : usernameText
  const dashboard = location.pathname.startsWith('/dashboard')
  return <div className={styles.container}>
    { dashboard
      ? <DashboardHeader/>
      : <div className={styles.banerContainer}>
        <div className={styles.userProfileImg}>
          <Img src={srcs} width='100%' height='auto' alt='Profile'/>
        </div>
        <div>
          {userNameElement}
          {bottom()}
        </div>
      </div>
    }
  </div>

  function bottom() {
    return <Link to='/account/sign-out' className={styles.profileMenuItem}>
      Sign Out
    </Link>
  }
}

export default HeaderUserProfile
