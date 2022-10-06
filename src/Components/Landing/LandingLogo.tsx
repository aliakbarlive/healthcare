import React from 'react'
import styles from './LandingLogo.module.scss'
import logoPlaceholder from 'Assets/Landing/logoPlaceholder.svg'

type Props = {
  logo?: string
}

export default class LandingLogo extends React.Component<Props> {
  render() {
    const {
      logo
    } = this.props

    return (<div className={styles.logo}>
      <img
        src={logo}
        onError={(e) => {
          e.currentTarget.onerror = null
          e.currentTarget.src = `${logoPlaceholder}`
        }}
      />
    </div>)
  }
}
