import React from 'react'
import Loader from 'Components/Rudimentary/Loader'
import Error from 'Components/Primitives/Error'
import HealthCareNews from '../employer/News'
import styles from '../employer/index.module.scss'
import useUser from 'Utilities/Hooks/useUser'

const DashboardEmployee: React.SFC = () => {
  const user = useUser()

  if (user.loading) return <Loader />
  if (user.error) return <Error error={user.error} />

  return <div className={styles.container}>
    <header>
      <h1>{user.value!.name}</h1>
      <p><b>Welcome to your companion app</b> for all your
        health care benefits.
      </p>
    </header>
    <HealthCareNews/>
  </div>
}

export default DashboardEmployee
