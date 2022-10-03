import React, { useState } from 'react'
import AnubisModal from 'Components/Anubis/AnubisModal'
import styles from './CommissionsModal.module.scss'
import { useForm } from 'react-hook-form'
import CandorInput from 'Components/Rudimentary/CandorInput'
import Proposal, { ProposalGroupInfo, TierCount } from '../Proposal'
import { Broker, MedicalPlan } from 'Utilities/pharaoh.types'
import { savePDF } from '@progress/kendo-react-pdf'
import useToast from 'Utilities/Hooks/useToast'
import numeral from 'numeral'

interface Props {
  isOpen: boolean
  onRequestClose: (shouldReload: boolean) => void
  broker: Broker
  group: ProposalGroupInfo
  enrollCount: TierCount
  cartPlans?: MedicalPlan[]
}

interface Data {
  commission?: string
}

const CommissionsModal: React.FC<Props> = ({ ...props }) => {
  const [brokerCommission, setBrokerCommission] = useState<string>('$0.00')
  const { register, handleSubmit } = useForm()
  const addToast = useToast()

  return <AnubisModal
    {...props}
    name={CommissionsModal.name}
    showClose={true}
    styles={{ width: 500, height: 480, overflow: 'hidden' }}
    onRequestClose={() => props.onRequestClose(false)}
  >
    {form()}
  </AnubisModal>

  function form() {
    return <div className={styles.mainDiv}>
      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        <h1>Generate Proposal</h1>
        <p>Plans in your cart will be included in your proposal. In order to make changes to what is included in the proposal, please add or remove plans in your cart.</p>
        <p>In accordance with the Consolidated Appropriations Act, which requires producer compensation to be disclosed to the client, please enter your total commissions earned. The amount entered will be reflected in the proposal under notices. If you would like to skip this step, you may generate a final proposal after plans are selected by your client or disclose your comp using another method.</p>
        <p>Please enter a flat dollar amount.</p>
        <CandorInput
          name='commission'
          ref={register}
          type='text'
          placeholder='$0'
          onBlur= { event => { event.currentTarget.value = numeral(event.currentTarget.value).format('$0,0.00') } }
        />
        <div className={styles.submitOptions}>
          <button type='submit' className={styles.compensationButton}>Add Compensation</button>
          <button type='button' className={styles.skipButton} onClick={() => { downloadProposal() } }>Skip</button>
        </div>
      </form>
      <div className={styles.proposalContainer} id='ProposalDocument'><Proposal brokerCommission={brokerCommission} {...props} /></div>
    </div>

    function onSubmit(data: Data) {
      downloadProposal(data.commission)
    }

    function downloadProposal(commission? : string) {
      setBrokerCommission(commission || '$0.00')

      const proposalDoc = document.getElementById('ProposalDocument')
      try {
        if (!props.broker.agency) throw new window.Error("Some of your agency's information is incomplete. Please have your principal correct this, or contact support")
        if (proposalDoc) savePDF(proposalDoc, { paperSize: 'Letter', landscape: true, fileName: `Proposal For ${props.group.name}` }, () => { props.onRequestClose(false); setBrokerCommission('$0.00') })
      } catch (error) {
        addToast(error as Error)
      }
    }
  }
}

export default CommissionsModal
