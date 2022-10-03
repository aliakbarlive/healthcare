import React from 'react'
import { useAsyncRetry } from 'react-use'
import { useParams } from 'react-router-dom'

import * as api from 'Utilities/pharaoh'
import { Landing } from 'Utilities/Hooks/useStargate'
import { LandingHeader, LandingBody } from 'Components/Pages/Landing'
import Loader from 'Components/Rudimentary/Loader'

const BrokerLanding: React.FC = () => {
  const { slug } = useParams() as { slug: string }

  // Loading slug data from "landing/{slug}"
  const {
    value: landingData,
    loading: landingLoading,
    error
  } = useAsyncRetry<Landing>(() => api.v3.landing(slug), [slug])

  // Clear the local storage
  React.useEffect(() => {
    localStorage.clear()
  }, [])

  if (landingLoading) return <Loader />
  if (error) throw new Error(error.message)
  if (!landingData) throw new Error('No landing data')

  return (
    <>
      <LandingHeader
        logo={`https://public.myhealthily.com/img/small-brokers/${landingData.agencyId?.toLowerCase()}`}
      />
      <LandingBody landingData={landingData} />
    </>
  )
}

export default BrokerLanding
