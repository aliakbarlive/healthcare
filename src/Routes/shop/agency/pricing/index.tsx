import { PrivateWizardPageProps } from 'Components/Stargate/Wizard/WizardRoute'
import React from 'react'
import styles from './index.module.scss'
import { ReactComponent as DevelopmentFocus } from './DevelopmentFocus.svg'
import { ReactComponent as Businessman } from './Businessman.svg'
import ShopButtons from 'Components/Stargate/ShopButtons/ShopButtons'
import { Route } from 'Utilities/Route'

const AgencyPricing: React.FC<PrivateWizardPageProps> = ({ onwards }) => {
  return <div className={styles.mainContainer}>
    <div className={styles.innerContainer}>
      <div className={styles.innerContainerLayer1}>
        <div className={styles.advantageDetailsContainer}>
          <div className={styles.speedUpContainer}>
            <div className={styles.devFocusContainer}>
              <DevelopmentFocus />
            </div>
            <div className={styles.speedUpDetails}>
              <p className={styles.speeduptext}>Let us speed up the process, so you can focus on what matters.</p>
              <ul>
                {checkPoint('Paperless enrollment process and proposal builder')}
                {checkPoint('Up to 10 users per agency, including 9 logins for producers, account managers, and customer service representatives and a separate principal account to manage the agency')}
                {checkPoint('Automated processing of additions and terminations')}
                {checkPoint('Detailed reports to help with commissions tracking, note keeping, and compliance')}
              </ul>
            </div>
          </div>
          <div className={styles.subscriptionDetailsContainer}>
            <div className={styles.businessManContainer}>
              <Businessman />
            </div>
            <div className={styles.subscriptionDetails}>
              <p className={styles.includedtext}>Included in your monthly subscription</p>
              <p className={styles.wereheretext}>We’re here for your health insurance business needs.</p>
              <ul>
                {checkPoint('Unlimited access to a variety of medical, dental, vision, life, and disability carriers and plans in all 50 states')}
                {checkPoint('Accurate real-time quoting for medical and ancillary to help you create a complete healthcare solution')}
                {checkPoint('Access to MyHealthily\'s exclusive association partnerships for leads, where you keep 100% of retail commission')}
                {checkPoint('Calculate simple and complex contribution strategies using our built-in spreadsheet')}
                {checkPoint('Creative funding options and ACA plan alternatives')}
                {checkPoint('All plans includes COBRA and ERISA compliance')}
              </ul>
            </div>
          </div>
        </div>
        <div className={styles.myHealthilyAdvantageContainer}>
          <div className={styles.pricingContainer}>
            <div className={styles.pricing}>
              <p className={styles.pricingtext}><b>$399</b>/mo</p>
            </div>
            <div className={styles.pricingCaveatContainer}>
              <p className={styles.monthlyfeetext}>Your monthly fee will be waived once you’ve enrolled 500 lives on the system. This is a subscription which automatically renews on the first of the month.</p>
            </div>
          </div>
          <div className={styles.advantageContainerSubLayer}>
            <div className={styles.advantageDetailsContainer}>
              <p className={styles.turntext}>Turn small group insurance into your profitable and stress-free advantage through unlimited access to MyHealthily’s carrier partnerships and easy-to-use software.</p>
            </div>
            <div className={styles.headerContainer}>
              <div className={styles.myhealthilytext}>The MyHealthily Advantage</div>
              <svg className={styles.purplebox} width="242" height="20" viewBox="0 0 242 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="0.5" width="241" height="20" fill="#D0CDF1"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
      <ShopButtons backTo={Route.agencyShop_SignUp} backToName={'Sign up'} pageName={'AgencySignUp'} noSubmitData save={() => onwards(Promise.resolve()) } />
    </div>

  </div>
}

const checkPoint = (description: string) => <li><p>{description}</p></li>

export default AgencyPricing
