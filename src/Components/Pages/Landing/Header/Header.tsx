import React from 'react'
import styles from './Header.module.scss'
import myhealthilyLogo from 'Assets/Landing/myhealthilyLogo.svg'
import LandingLogo from 'Components/Landing/LandingLogo'

type LandingHeaderProps = {
  isPreview?: boolean
  logo?: string
}
export const LandingHeader: React.FC<LandingHeaderProps> = (props) => {
  const { isPreview, logo } = props
  return (
    <>
      <div className={styles.header}>
        <LandingLogo logo={logo}/>
        <img src={myhealthilyLogo} />
        {isPreview && (
          <>
            <div className={styles.notice}>
              landing page preview - not published
            </div>
          </>
        )}
      </div>
    </>
  )
}
