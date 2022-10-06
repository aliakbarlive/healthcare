import React from 'react'
import { GAButton, GAButtonProps } from 'Components/Tracking'
import styles from './AddButton.module.scss'

const AddButton: React.FC<GAButtonProps> = (props) => {
  return <GAButton {...props} style={props.style} className={`${styles.addBtn} ${props.className}`} onClick={props.onClick}>
    <i className='material-icons'>add</i>
    <span>{ props.children }</span>
  </GAButton>
}

export default AddButton
