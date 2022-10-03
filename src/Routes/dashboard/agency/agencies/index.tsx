import React from 'react'
import { useAsync } from 'react-use'
import { AsyncTable } from 'Components/Rudimentary/Table'
import ProfileSection from 'Components/Anubis/ProfileSection'
import { get } from 'Utilities/fetch++'

interface Agency {
  id: string
  name: string
  tier: string
  slug: string
  contact: {
    email: string
    name: string
  }
  groupCount: number
}

const DashboardAgencyAgencies: React.FC = () => {
  const async = useAsync(async() => await get('/v3/agencies') as Agency[])
  const count = async.value ? `(${async.value.length})` : ''

  return <>
    <h1>Agencies</h1>
    <ProfileSection expanded={true} name={`Agencies ${count}`}>
      <AsyncTable
        async={async}
        order={['name', 'groupCount', 'tier', 'slug', 'contact']}
        defaultSort='name'
        heading={key => key === 'groupCount' ? '# Clients' : undefined}
        secondarySort={() => ['name', 'groupCount']}
        reportFileBasename='agencies'
      />
    </ProfileSection>
  </>
}

export default DashboardAgencyAgencies
