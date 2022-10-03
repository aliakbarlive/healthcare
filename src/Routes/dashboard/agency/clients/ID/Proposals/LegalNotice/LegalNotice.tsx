import React from 'react'
import styles from './LegalNotice.module.scss'

export const LegalNotice: React.FC<{ agencyName: string, employerName: string, brokerCommission: string }> = ({ agencyName, employerName, brokerCommission }) => {
  return <div className={styles.legalNoticeMain}>
    <div className={styles.frame2755}>
      <div className={styles.frame2752}>
        <div className={styles.frame2748}>
          {leftSideParagraph('The Consolidated Appropriations Act, 2021 (CAA), signed into law on December 27, 2020, contained many provisions, including a transparency provision that requires the disclosure of compensation paid to brokers and consultants who provide services to employer-sponsored health plans. Section 202 of the CAA amends the Employee Retirement Income Security Act (ERISA) Section 408(b)(2) to incorporate “reasonableness” compensation standards for group health plans, mirroring those that apply to retirement plans when negotiating contracts or service arrangements.', 0)}
          {leftSideParagraph('ERISA Section 408(b)(2) provides a statutory exemption from the party-in-interest prohibitions for any “reasonable” contract or arrangement with a “party-in-interest.” A broker or consultant receiving such compensation is considered a party-in-interest. Pursuant to regulations finalized in 2012, but applicable to retirement plans only, a contract was not considered “reasonable” unless the “covered service provider” disclosed its direct or indirect compensation. Similarly, Section 202 of the CAA requires the disclosure of compensation paid by group health plans—excluding qualified small employer health reimbursement arrangements (QSEHRAs)—in order to meet the reasonableness standard of ERISA and qualify for the statutory exemption. A group health plan covered by Section 202 of the CAA would include a welfare plan that provides medical care to an employee and/or his dependents through insurance, reimbursement, or otherwise. Generally, a group health plan will include a health reimbursement arrangement, a health flexible spending arrangement, and an employer payment plan.', 1)}
          {leftSideParagraph('Pursuant to Section 202 of the CAA, a “covered service provider” is defined as a service provider that enters into a contract or arrangement with the covered plan and reasonably expects $1,000 or more in direct or indirect compensation in connection with providing either brokerage or consulting services or both.', 2)}
        </div>
        <div className={styles.frame2751}>
          <div className={styles.frame2750}>
            <p style={{ order: 0 }} className={styles.rightSideParagraphs}>{agencyName}, defined as a “party-in-interest”, does hereby disclose that for {employerName} health, dental, vision insurance products we receive {brokerCommission} in total compensation. During the plan year qualified life events will occur that may/will increase or decrease this total compensation. In addition, the covered service provider is required to provide information requested by a plan fiduciary or a covered plan administrator to comply with disclosure and reporting requirements pursuant to ERISA.</p>
            <p style={{ order: 1 }} className={styles.rightSideParagraphs}>Finally, a contract or arrangement does not cease to be reasonable if the covered service provider acted in good faith and with “reasonable diligence” but makes an error or omission if the covered service provider discloses the information to the plan fiduciary as soon as practicable, but not later than 30 days from the date the covered service provider knows of the error or omission.</p>
          </div>
        </div>
      </div>
      <p className={styles.legalNoticeHeader}>Employer and Employee Notices</p>
    </div>
  </div>

  function leftSideParagraph(text: string, order: number) {
    return <div className={styles.frame2745} style={{ order: order }}>
      <p className={styles.noticeParagraph}>{text}</p>
    </div>
  }
}
