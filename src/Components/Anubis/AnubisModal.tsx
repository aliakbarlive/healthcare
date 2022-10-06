import React from 'react'
import CandorModal, { CandorModalProps } from 'Components/Rudimentary/CandorModal'
import styles from './AnubisModal.module.scss'
import Loader from 'Components/Rudimentary/Loader'
import ReactModal from 'react-modal'
import { merge } from 'lodash'

export interface Props extends CandorModalProps {
  styles?: React.CSSProperties
  showClose?: boolean
  loading?: boolean
}

const AnubisModal: React.FC<Props> = props => {
  const showCloseButton = typeof props.showClose === 'boolean' ? props.showClose : true

  return <CandorModal
    // defaults to false to prevent inadvertent data loss
    shouldCloseOnOverlayClick={false}
    {...props}
    style={modalStyle(props.styles)}
  >
    <div className={styles.container}>
      { props.loading && <div className={styles.loadingContainer}><Loader center/></div>}
      <div className={styles.content}>
        { props.children}
        { showCloseButton && <button className={styles.close} onClick={props.onRequestClose} />}
      </div>
    </div>
  </CandorModal>
}

const modalStyle = (customerStyles?: React.CSSProperties): ReactModal.Styles => {
  const styles: ReactModal.Styles = {
    content: {
      border: '1px solid #ccc',
      background: 'linear-gradient(180deg, #ebeaea 0%, #f8f8f8 100%)',
      overflow: 'auto',
      WebkitOverflowScrolling: 'touch',
      borderRadius: '0px',
      outline: 'none',
      width: 'fit-content',
      height: 'fit-content',
      padding: 0,
      boxShadow: '0 3px 12px rgba(112, 112, 112, 0.4)',
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)'
    }
  }

  if (customerStyles) {
    merge(styles.content, customerStyles)
  }

  /*
    Need to do this madness because display: table fucks up chromium
    browsers, and height: fit-content fucks up firefox and safari.
  */
  if (styles.content?.height === 'fit-content' && (isFirefox() || isSafari())) {
    merge(styles.content, { display: 'table' })
  }

  return styles
}

declare const InstallTrigger: any

// Duck-typing since it is very easy to spoof User agent string
// https://stackoverflow.com/questions/9847580/how-to-detect-safari-chrome-ie-firefox-and-opera-browser

function isFirefox() { return typeof InstallTrigger !== 'undefined' }

function isSafari() {
  return /constructor/i.test((window as any).HTMLElement) || ((p): boolean => {
    return p.toString() === '[object SafariRemoteNotification]'
  })(!(window as any).safari || (window as any).safari?.pushNotification)
}

export default AnubisModal
