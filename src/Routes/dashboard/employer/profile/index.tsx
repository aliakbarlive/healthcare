import React from 'react'
import useGroupManager from 'Utilities/Hooks/useGroupManager'
import Loader from 'Components/Rudimentary/Loader'
import Error from 'Components/Primitives/Error'
import DashboardAgencyGroup from 'Routes/dashboard/agency/clients/ID'

const DashboardEmployerProfile: React.FC = () => {
  const group = useGroupManager()

  if (group.loading) return <Loader />
  if (group.error) return <Error error={group.error} />

  return <DashboardAgencyGroup id={group.value!.id} />
}

export default DashboardEmployerProfile
