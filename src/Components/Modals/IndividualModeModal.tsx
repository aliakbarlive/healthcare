import React, { useState } from 'react'
import { useHistory } from 'react-router'
import useToast from 'Utilities/Hooks/useToast'
import { Route } from 'Utilities/Route'
import * as api from 'Utilities/pharaoh'
import Modal, { ActionType, BrandColors, ButtonAlignment, ModalLoader, ModalProps } from './Modal'

type IndividualModeModalProps = Omit<ModalProps, 'gaModalName' | 'header'> & {
  contentType: 'ein' | 'members'
  groupID?: string
}

const IndividualModeModal: React.FC<IndividualModeModalProps> = props => {
  const history = useHistory()
  const addToast = useToast()
  const [loading, setLoading] = useState(false)

  return <Modal
    {...props}
    gaModalName={IndividualModeModal.name}
    header={header()}
    contentStyle={{ maxWidth: 600 }}
    footerButtons={[
      {
        actionType: ActionType.primary,
        color: BrandColors.blue,
        alignment: ButtonAlignment.right,
        gaButtonName: `${IndividualModeModal.name} Go to Individual Shop Button`,
        onClick: switchToIndividual,
        content: 'Go to Individual Shop'
      },
      {
        actionType: ActionType.secondary,
        color: BrandColors.gray,
        alignment: ButtonAlignment.right,
        gaButtonName: `${IndividualModeModal.name} Close Button`,
        onClick: e => props.onRequestClose && props.onRequestClose(e),
        content: 'Close'
      }
    ]}
  >
    <ModalLoader loading={loading}/>
    {content()}
  </Modal>

  function header() {
    switch (props.contentType) {
    case 'ein':
      return 'Don’t have an EIN?'
    case 'members':
      return 'Only signing up for yourself?'
    }
  }

  function content() {
    switch (props.contentType) {
    case 'ein':
      return <>
        <p>Don&apos;t have an employer identification number (EIN)? You might be looking for our individual shop.</p>
        <p>The individual shop is a better fit for you if you’re a sole proprietor using your Social Security number to file corporate taxes. It’s tailored for those seeking coverage for just themselves and their family.</p>
      </>
    case 'members':
      return <p>It looks like you might be a sole proprietorship. If so, the individual shop is tailored to you and your family’s needs. If not, please add more employees to continue.</p>
    }
  }

  async function switchToIndividual() {
    try {
      setLoading(true)
      const res = await api.v3.groups().individual.POST(props.groupID)
      history.push(`${Route.signUp}/${res.token}`)
    } catch (error) {
      addToast(error)
    } finally {
      setLoading(false)
    }
  }
}

export default IndividualModeModal
