import React from 'react'
import EPlusEENotices, { leftParagraph, rightParagraph } from '../EPlusEENotices'
import { stateNotices } from './StateNotices'
import styles from './PageFour.module.scss'

export const PageFourNotice: React.FC<{ groupState?: string }> = ({ groupState }) => {
  return <EPlusEENotices leftParagraphs={leftParagraphs(groupState)} rightParagraphs={rightParagraphs()} />
}

function leftParagraphs(state?: string) {
  const notice = stateNotices.filter(notice => notice.state === state)[0]

  return <>
    {leftParagraph(0, '', 'To see if any other states have added a premium assistance program since July 31, 2016, or for more information on special enrollment rights, contact either:/LineBreak/')}
    {leftParagraph(1, '', 'U.S. Department of Labor/LineBreak/Employee Benefits Security Administration/LineBreak/www.dol.gov/ebsa/LineBreak/1-866-444-EBSA (3272)/LineBreak/')}
    {leftParagraph(2, '', 'OR/LineBreak/')}
    {leftParagraph(3, '', 'U.S. Department of Health and Human Services Centers for Medicare & Medicaid Services/LineBreak/www.cms.hhs.gov/LineBreak/1-877-267-2323, Menu Option 4, Ext. 61565/LineBreak/OMB Control Number 1210-0137')}
    {(notice && notice !== undefined) && stateNotice(notice.body.stateTitle, [stateNoticeEntry(notice.body.entry ? notice.body.entry[0] ? notice.body.entry[0].header : undefined : undefined, notice.body.entry ? notice.body.entry[0] ? notice.body.entry[0].entries : undefined : undefined), stateNoticeEntry(notice.body.entry ? notice.body.entry[1] ? notice.body.entry[1].header : undefined : undefined, notice.body.entry ? notice.body.entry[1] ? notice.body.entry[1].entries : undefined : undefined)])}

  </>
}

function rightParagraphs() {
  return <>
    {rightParagraph(0, 'Premium Assistance Under Medicaid and the Children’s Health Insurance Program (CHIP)', 'If you or your children are eligible for Medicaid or CHIP and you’re eligible for health coverage from your employer, your state may have a premium assistance program that can help pay for coverage, using funds from their Medicaid or CHIP programs. If you or your children aren’t eligible for Medicaid or CHIP, you won’t be eligible for these premium assistance programs but you may be able to buy individual insurance coverage through the Health Insurance Marketplace. For more information, visit www.healthcare.gov. If you or your dependents are already enrolled in Medicaid or CHIP and you live in a State listed below, contact your State Medicaid or CHIP office to find out if premium assistance is available. If you or your dependents are NOT currently enrolled in Medicaid or CHIP, and you think you or any of your dependents might be eligible for either of these programs, contact your State Medicaid or CHIP office or dial 1-877-KIDS NOW or www.insurekidsnow.gov to find out how to apply. If you qualify, ask your state if it has a program that might help you pay the premiums for an employer-sponsored plan.')}
  </>
}

function stateNotice(stateTitle: string, stateNoticeEntry? : JSX.Element[]): JSX.Element {
  return <div className={styles.frame2783}>
    <div className={styles.frame2393}>
      <p className={styles.stateTitle}>{stateTitle}</p>
    </div>
    {stateNoticeEntry && stateNoticeEntry.map(s => s)}
  </div>
}

function stateNoticeEntry(optionalHeader?: string, entries?: string[]): JSX.Element {
  return <div className={styles.frame2781}>
    { optionalHeader && <p className={styles.optionalHeader}>{optionalHeader}</p>}
    { entries ? entries.length > 0 ? entries.map((e, i) => <p key={i} className={styles.entry}>{e}</p>) : <></> : <> </>}
  </div>
}
