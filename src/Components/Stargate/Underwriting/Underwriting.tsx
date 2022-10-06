import React, { useState } from 'react'
import { useAsync } from 'react-use'
import * as api from 'Utilities/pharaoh'
import Loader from 'Components/Rudimentary/Loader'
import Error from 'Components/Primitives/Error'
import queryString from 'query-string'
import { GroupMember, Group, User, Dependent, UserMetadata, ConsumerProfile } from 'Utilities/Hooks/useStargate'
import { PrivateWizardPageProps } from '../Wizard/WizardRoute'
import styles from './Underwriting.module.scss'
import DocuSignForm, { ReturnEvent } from 'Utilities/DocuSignForm'
import { GAButton } from 'Components/Tracking'
import AllstateForm from 'Utilities/Allstate/AllstateForm'
import { PipelineStatus } from 'Utilities/pharaoh.types'

type Props = {
  group: Group
  groupMember: GroupMember
  dependents: Dependent[]
  user: User
  userMetadata?: UserMetadata
  consumerProfile?: ConsumerProfile
  hasAllstate: boolean
  next: () => void
}

const UnderwritingForm: React.FC<Props> = ({ group, groupMember, consumerProfile, user, userMetadata, hasAllstate, dependents, next }) => {
  const showAllstateAPIForm = false
  const [envelope, setEnvelope] = useState<any>()
  const async = useAsync(async() => {
    setEnvelope(await (hasAllstate && showAllstateAPIForm // host() === Host.localhost
      ? api.v3.integrations.natgen.groups(group.id).application.GET()
      : api.v3.groups(group.id).users(user.id).underwriting.GET())
    )
  }, [group.id])

  if (async.error) { return <Error error={async.error} /> }
  if (async.loading) { return <Loader /> }

  // Fixes: https://linear.app/candor-usa/issue/ANKH-1238/underwriting-form-docusign-error
  if (envelope.status === 'completed') {
    location.reload()
  }

  return <div className={styles.mainContainer}>
    <h1 className='shop-h1-periwinkle'>Underwriting Form</h1>
    <h2 className='shop-h2-navy'>We need a little more information to complete your application</h2>
    {hasAllstate && showAllstateAPIForm // host() === Host.localhost
      ? <AllstateForm
        group={group}
        user={user}
        userMetadata={userMetadata}
        groupMember={groupMember}
        dependents={dependents}
        consumerProfile={consumerProfile}
        application={envelope}
        next={next}
      />
      : <DocuSignForm
        id={groupMember.id}
        envelope={envelope}
        onSubmit={(envelope) =>
          api.v3.groups(group.id).users(user.id).underwriting.POST({ envelope })
        }
      />
    }
  </div>
}

const Underwriting: React.FC<PrivateWizardPageProps> = ({ stargate, onwards }) => {
  const { groupMember, group, user, userMetadata, hasAllstate, dependents, consumerProfile } = stargate
  if (!groupMember || !group) return <p>You must complete the earlier steps before you can continue.</p>

  const parsedQuery = queryString.parse(window.location.search)

  if (parsedQuery.event === ReturnEvent.SIGNING_COMPLETE || groupMember.medical_underwriting_complete) {
    const canProceed = (stargate.membersCompletedTheirIMQs && group.ratesLocked) || group.pipelineStatus === PipelineStatus.enrolled
    return <header>
      <h1 className='shop-h1-periwinkle'>Application</h1>
      <h2 style={{ marginBottom: '4rem' }} className='shop-h2-navy'>Thank you for completing your medical questionnaire. Our team of trusted advisors will review your information and find the best plans for your group. Once your employer chooses plans to offer, we will send you an invite to shop and enroll.</h2>
      <GAButton
        analytics={`Next Step (${Underwriting.name})`}
        className='shop-next-button'
        onClick={next}
        disabled={!canProceed}
      >
        Next Step
      </GAButton>
    </header>
  } else {
    return <UnderwritingForm
      group={group}
      groupMember={groupMember}
      dependents={dependents || []}
      user={user}
      userMetadata={userMetadata}
      consumerProfile={consumerProfile}
      hasAllstate={hasAllstate}
      next={next}
    />
  }

  function next() {
    onwards(Promise.resolve())
  }
}

export default Underwriting
