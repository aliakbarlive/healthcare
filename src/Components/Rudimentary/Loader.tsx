import React from 'react'
import { classNames } from 'Utilities/etc'
import styles from './Loader.module.css'

interface Props {
  center?: boolean
  className?: string
}

const Loader: React.FC<Props> = ({ center, className }) => {
  let style: React.CSSProperties
  if (center) {
    style = {
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)'
    }
  } else {
    style = {
      textAlign: 'center',
      height: '100%'
    }
  }

  return (
    <div style={style}>
      <div className={classNames(styles.ldsDefault, className)}><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
    </div>
  )
}

export default Loader
