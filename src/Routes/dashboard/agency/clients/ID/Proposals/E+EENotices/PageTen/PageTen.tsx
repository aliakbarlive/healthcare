import React from 'react'
import EPlusEENotices, { leftParagraph, rightParagraph } from '../EPlusEENotices'

export const PageTenNotice: React.FC = () => {
  return <EPlusEENotices leftParagraphs={leftParagraphs()} rightParagraphs={rightParagraphs()} />
}

function leftParagraphs() {
  return <>
    {leftParagraph(0, 'Employee Retirement Income Security Act (ERISA)', 'Federal law imposes certain requirements on employee benefit plans voluntarily established and maintained by employers. [29 USC § 1001 et. seq.; 29 CFR 2509 et. seq.] ERISA covers two general types of plans: retirement plans, and welfare benefit plans designed to provide health benefits, scholarship funds, and other employee benefits. ERISA facilitates portability and continuity of health insurance coverage as a result of added provisions under the Health Insurance Portability and Accountability ‘Act (HIPAA). It also covers continued health care coverage rules mandated under the Consolidated Omnibus Budget Reconciliation Act (COBRA).')}
  </>
}

function rightParagraphs() {
  return <>
    {rightParagraph(0, '', '')}
  </>
}
