import React, { CSSProperties } from 'react'
import styles from './SlashesLoader.module.css'
import { classNames } from 'Utilities/etc'

interface Props {
  className?: string
  style?: CSSProperties
}

const SlashesLoader: React.FC<Props> = ({ style, className }) =>
  <div style={style} className={classNames(className, styles.loader)}>
    <div/><div/><div/>
  </div>

export default SlashesLoader
