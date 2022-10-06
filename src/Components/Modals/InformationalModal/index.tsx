import React from 'react'
import styles from './index.module.scss'
import Modal, { ModalProps } from '../Modal'

const InformationalModal: React.FC<ModalProps> = props =>
  <Modal
    {...props}
    className={styles.container}
    headerClassName={styles.header}
    closeButtonClassName={styles.closeButton}
  >
    { props.children }
  </Modal>

export default InformationalModal
