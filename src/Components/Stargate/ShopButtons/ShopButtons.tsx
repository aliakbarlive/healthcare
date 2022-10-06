import BackTo from 'Components/Anubis/BackTo'
import { FormRow } from 'Components/Rudimentary/FormComponents'
import { GAButton } from 'Components/Tracking'
import React from 'react'
import styles from './ShopButtons.module.scss'

interface Props {
  backTo?: string
  backToName?: string
  pageName: string
  noSubmitData?: boolean

  save: (event: any) => Promise<void>
}

const ShopButtons: React.FC<Props> = ({ backTo, backToName, pageName, save, noSubmitData }) => {
  const visibility = noSubmitData ? 'hidden' : 'visible'
  return <FormRow width='inherit'>
    {backTo
      ? <BackTo route={backTo} analytics={`BackTo ${backTo}`} margin-right='auto' styleType='2021'>{backToName ? `Back to ${backToName}` : 'Back'}</BackTo>
      : <div style={{ marginRight: 'auto' }}>&nbsp;</div>
    }
    <div className={styles.rightButtons}>
      <GAButton style={{ visibility: visibility }} id='saveOnlyBtn' analytics={`Save ${pageName}`} type='button' onClick={save} margin-left='auto' className={styles.saveButton}>Save &amp; Finish Later</GAButton>
      { noSubmitData ? <input type='submit' value='next' id='agencyOnboardingNextButton' onClick={save}/> : <input type='submit' value='next' id='agencyOnboardingNextButton' />}
    </div>
  </FormRow>
}

export default ShopButtons
