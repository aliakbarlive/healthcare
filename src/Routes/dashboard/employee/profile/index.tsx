import React from 'react'
import Component from 'Routes/dashboard/agency/employees/ID'
import Error from 'Components/Primitives/Error'
import Loader from 'Components/Rudimentary/Loader'
import useStargate from 'Utilities/Hooks/useStargate'

const DashboardEmployee: React.SFC = () => {
  const stargate = useStargate()

  if (stargate.loading) return <Loader />
  if (stargate.error) return <Error error={stargate.error} />

  return <Component id={stargate.value!.groupMember?.id || stargate.value!.user.id} />
}

export default DashboardEmployee
