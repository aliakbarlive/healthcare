import { GAButton, GAButtonProps } from 'Components/Tracking'
import React from 'react'
import { useHistory } from 'react-router-dom'
import styles from './BackTo.module.scss'

const BackTo: React.FC<{route: string, styleType?: 'classic' | '2021'} & GAButtonProps> = ({ children, route, ...props }) => {
  const history = useHistory()
  const styleType = props.styleType === '2021' ? styles.goBack2021 : styles.goBack
  return <GAButton {...props} className={styleType} onClick={() => history.replace(route)}>{children}</GAButton>
}

export default BackTo
