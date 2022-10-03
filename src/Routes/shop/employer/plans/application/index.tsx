import React, { useState } from 'react'
import { PrivateWizardPageProps } from 'Components/Stargate/Wizard/WizardRoute'
import CarrierApplication from 'Components/Anubis/CarrierApplication'
import { useAsync } from 'react-use'
import Loader from 'Components/Rudimentary/Loader'
import Error from 'Components/Primitives/Error'
import * as api from 'Utilities/pharaoh'
import { Group, User } from 'Utilities/Hooks/useStargate'
import queryString from 'query-string'
import DocuSignForm, { ReturnEvent } from 'Utilities/DocuSignForm'
import { GAButton } from 'Components/Tracking'

interface Props {
  group: Group
  user: User
}

const CarrierApplicationForm: React.FC<Props> = ({ group }) => {
  const [envelope, setEnvelope] = useState<any>()
  const async = useAsync(async() => {
    setEnvelope(await api.v3.groups(group.id).application.GET())
  }, [group.id])

  if (async.error) { return <Error error={async.error} /> }
  if (async.loading) { return <Loader /> }

  return <div>
    <h1 className='shop-h1-periwinkle'>Application</h1>
    <h2 className='shop-h2-navy'>We need a little more information to complete your application</h2>
    <DocuSignForm
      id={group.id}
      envelope={envelope}
      onSubmit={(envelope) =>
        api.v3.groups(group.id).application.POST({ envelope })
      }
    />
  </div>
}

const ERStargateCarrierApplication: React.FC<PrivateWizardPageProps> = ({ stargate, onwards }) => {
  const { group, user } = stargate
  if (!group || !user || !group?.id) return <p>Please complete the earlier steps first.</p>

  // temporarily disabled: https://linear.app/candor-usa/issue/ANKH-654
  // `/stargate` will always return false for `showDocuSignForm` until we turn it back on

  if (stargate.carrierApplicationData?.showDocuSignForm) {
    const parsedQuery = queryString.parse(window.location.search)

    if (parsedQuery.event === ReturnEvent.SIGNING_COMPLETE || group.carrierApplicationComplete) {
      return <header>
        <h1 className='shop-h1-periwinkle'>Application</h1>
        <h2 style={{ marginBottom: '4rem' }} className='shop-h2-navy'>Thank you for completing your application.</h2>
        <GAButton analytics={`Next Step (${ERStargateCarrierApplication.name})`} className='shop-next-button' onClick={() => onwards(Promise.resolve())}>Next Step</GAButton>
      </header>
    } else {
      return <CarrierApplicationForm
        group={group}
        user={user}
      />
    }
  } else {
    return <CarrierApplication
      groupID={group?.id}
      asyncCallback={onwards} />
  }
}

export default ERStargateCarrierApplication
