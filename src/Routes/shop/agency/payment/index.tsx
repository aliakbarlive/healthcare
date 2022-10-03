import React, { useEffect, useState } from 'react'
import styles from './index.module.scss'
import useToast from 'Utilities/Hooks/useToast'
import moment from 'moment'
import { useToggle } from 'react-use'
import { Route } from 'Utilities/Route'
import BackTo from 'Components/Anubis/BackTo'
import * as api from 'Utilities/pharaoh'

export interface DeltaResponse {
  card?: {
    number?: string
    bin?: string
    exp?: string
    hash?: string
  }
  check?: {
    name?: string
    account?: string
    hash?: string
    aba?: string
  }
  token: string
}

interface Props {
  onwards: (api: Promise<any>) => Promise<void>
  showNextBtn?: boolean
}

const AgencyPayment: React.FC<Props> = ({ onwards, showNextBtn }) => {
  const addToast = useToast()
  const [useCreditCard, toggleUseCreditCard] = useToggle(true)
  const [token, setToken] = useState<DeltaResponse | undefined>(undefined)
  const collectJS = (window as any).CollectJS
  useEffect(() => {
    collectJS?.configure({
      variant: 'inline',
      styleSniffer: true,
      callback: setToken,
      fields: useCreditCard
        ? {
          ccnumber: { selector: '#ccnumber', title: 'Card Number', placeholder: '0000 0000 0000 0000' },
          ccexp: { selector: '#ccexp', title: 'Card Expiration', placeholder: '00 / 00' },
          cvv: { selector: '#cvv', title: 'CVV Code', placeholder: '***' }
        }
        : {
          checkname: { selector: '#checkname', title: 'Name on Account', placeholder: 'Jane Doe' },
          checkaccount: { selector: '#checkaccount', title: 'Account Number', placeholder: '000000000' },
          checkaba: { selector: '#checkaba', title: 'Routing Number', placeholder: '000000000' }
        },
      price: 399,
      currency: 'USD'
    })
  }, [useCreditCard])

  useEffect(() => {
    if (token) {
      api.v3.agency.paymentMethod.POST(token).then(() => {
        onwards(Promise.resolve())
      }).catch(addToast)
    }
  }, [token])

  return <div className={styles.main_chek_con}>
    <div className={styles.content}>
      {showNextBtn ? <h3 className={styles.billling}>Billing</h3>
        : <h3>Input Your Payment Details</h3>
      }
      {showNextBtn
        ? <div className={styles.infoText}>
          <p>If you make changes, please note that they won’t be effective until after the first of the next calendar month.</p>
        </div>
        : <div className={styles.payment_container} >
          <p id={styles.payment_txt}>Pay by credit card or ACH transfer. We’ll securely store your information now but won’t charge you until after the first of the next calendar month.</p>
        </div>
      }
    </div>
    <div className={styles.cart}>
      <div>
        <p className={styles.paym_due}>Next payment due</p>
        <p className={styles.cart_date}>{moment().startOf('month').add(1, 'month').format('MMMM D, YYYY')}</p>
      </div>
      <div className={styles.amt}>$<span className={styles.price}>399</span>/mo</div>
    </div>

    <form className={styles.promoCodeForm}>
      <div className={styles.inpGroup}>
        <div className={styles.credit_con}>
          <input type="radio" id="Credit" className={styles.deltaRadio} tabIndex={0} name="radio-group" checked={useCreditCard} onChange={toggleUseCreditCard} />
          <label htmlFor="Credit" className={styles.credit_card}>Credit Card</label>
        </div><br />
        {useCreditCard && <>
          <div className={styles.ccinputsField}>
            <div className={styles.ccnInputsField} id="ccnumber"></div>
            <label className={styles.label}>Card Number</label>

          </div>
          <br />
          <div className={styles.allInpFields}>
            <div className={`${styles.inputsField} ${styles.mmcv}`}>
              <div className={styles.payment_field} id="ccexp"></div>
              <label className={styles.label}>MM / YY</label>
            </div>

            <div className={`${styles.inputsField} ${styles.mmcv}`}>
              <div className={styles.payment_field} id="cvv"></div>
              <label className={styles.label}>CVC</label>
            </div>
          </div>
          <div className={styles.crc_txt}>
            <p>I authorize MyHealthily Insurance Solutions, LLC to send instructions to the financial institution that issued my card to take payments from my card account in accordance with the terms of my agreement.</p>
          </div>
        </>}
      </div>

      <div className={`${styles.inpGroup} ${styles.bAcc}`}>
        <div className={styles.credit_con}>
          <input type="radio" id="Bank" tabIndex={0} className={styles.deltaRadio} name="radio-group" checked={!useCreditCard} onChange={toggleUseCreditCard} />
          <label htmlFor="Bank" className={styles.credit_card}>Bank Account</label>
        </div>
        <br />
        {!useCreditCard && <>
          <div className={`${styles.inputsField} ${styles.bankAccountName}`}>
            <div className={`${styles.payment_field} ${styles.bchkName}`} id="checkname"></div>
            <label className={styles.label}>Name on Account</label>
          </div><br />

          <div className={styles.inputsField}>
            <div className={styles.payment_field} id="checkaccount"></div>
            <label className={styles.label}>Account Number</label>
          </div>

          <div className={styles.inputsField}>
            <div className={styles.payment_field} id="checkaba"></div>
            <label className={styles.label}>Routing Number</label>
          </div>

          <div className={styles.crc_txt}>
            <p className={styles.pay_detail}>Payment Details</p>
            <p>Your payment will be processed through Delta Payment Solutions and is confidential. We will not have access to your user name, password, or account information.</p>
            <p>I authorize MyHealthily Insurance Solutions, LLC to take payments from my bank in accordance with the terms of my agreement.</p>
          </div>
        </>}
      </div>
    </form>

    {!showNextBtn &&
      <div className={styles.footer_cont}>
        <div className={styles.leftMove}>
          <BackTo route={Route.agencyShop_Pricing} analytics={`BackTo ${Route.agencyShop_Pricing}`} margin-right='auto' styleType='2021'>Back to Pricing</BackTo>
        </div>
        <div className={styles.rightMove}>
          <input type='submit' onClick={collectJS.startPaymentRequest} className={styles.paymentButton} value='Next' />
        </div>
      </div>}
    {
      showNextBtn &&
      <div className={styles.updatePBtn} >
        <input type="submit" style ={{ textTransform: 'capitalize', width: '246px', background: '#3564B9', padding: '17px 20px', boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.16)', borderRadius: '6px' }} className={styles.updatePM} onClick={collectJS.startPaymentRequest} value="Update Payment Method" />
      </div>
    }
  </div>
}

export default AgencyPayment
