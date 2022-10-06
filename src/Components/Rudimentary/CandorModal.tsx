import React, { useEffect } from 'react'
import ReactModal from 'react-modal'
import style from './CandorModal.module.css'
import ReactGA from 'react-ga'
import { analyticsTrackers } from 'Utilities/config'

export type CandorModalProps = ReactModal.Props & { name?: string }

const CandorModal: React.FC<CandorModalProps> = props => {
  const { isOpen, name } = props
  useEffect(() => {
    // Analytics modal event
    if (isOpen) {
      ReactGA.modalview(name || 'CandorModal', analyticsTrackers())
    }
  }, [name, isOpen])

  return <ReactModal
    overlayClassName={{
      base: style.base,
      beforeClose: style.beforeClose,
      afterOpen: style.afterOpen
    }}
    closeTimeoutMS={150}
    bodyOpenClassName='ReactModal__Body--open'
    {...props}
  >
    {props.children}
  </ReactModal>
}

export default CandorModal
