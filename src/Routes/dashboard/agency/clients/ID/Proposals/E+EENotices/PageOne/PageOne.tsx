import React from 'react'
import EPlusEENotices, { leftParagraph, rightParagraph } from '../EPlusEENotices'

export const PageOneNotice: React.FC = () => {
  return <EPlusEENotices leftParagraphs={leftParagraphs()} rightParagraphs={rightParagraphs()} />
}

function leftParagraphs() {
  return <>
    {leftParagraph(0, 'Consolidated Omnibus Budget Reconciliation Act (COBRA)', 'The Consolidated Omnibus Budget Reconciliation Act of 1985 (COBRA) requires employers who provide medical coverage to their employees to offer such coverage to employees and covered family members on a temporary basis when there has been a change in circumstances that would otherwise result in a loss of such coverage [26 USC §4980B]. This benefit, known as “continuation coverage,” applies if, for example, dependent children become independent, spouses get divorced, or employees leave the employer.')}
    {leftParagraph(1, 'HIPAA Information Notice of Privacy Practices', 'In compliance with the Health Insurance Portability and Accountability Act of 1996 (HIPAA), your employer recognizes your right to privacy in matters related to the disclosure of health-related information. The Notice of Privacy Practices (provided to you upon your enrollment in the health plan) details the steps your employer has taken to assure your privacy is protected. The Notice also explains your rights under HIPAA. A copy of this Notice is available to you at any time, free of charge, by request through your Human Resources Department.')}
    {leftParagraph(2, 'Special Enrollment Rights', 'If you have previously declined enrollment for yourself or your dependents (including your spouse) because of other health insurance coverage, you may in the future be able to enroll yourself or your dependents in this plan, provided that you request enrollment within 30 days after your other coverage ends. In addition, if you have a new dependent as a result of marriage, birth, adoption, or placement of adoption, you may be able to enroll yourself and your dependents, provided that you request enrollment within 30 days after the marriage, birth, adoption, or placement for adoption.')}
  </>
}

function rightParagraphs() {
  return <>
    {rightParagraph(0, 'Children’s Health Insurance Program Reauthorization Act (CHIPRA)', 'Effective April 1, 2009 employees and dependents who are eligible for coverage, but who have not enrolled, have the right to elect coverage during the plan year under two circumstances:/LineBreak/ 1. The employee’s or dependent’s state Medicaid or CHIP (Children’s Health Insurance Program) coverage terminates because the individual ceased to be eligible./LineBreak/ 2. The employee or dependent becomes eligible for a CHIP premium assistance subsidy under state Medicaid or CHIP (Children’s Health Insurance Program)./LineBreak/Employees must request this special enrollment within 60 days of the loss of coverage and/or within 60 days of when eligibility is determined for the premium subsidy.')}
    {rightParagraph(1, 'Mental Health Parity and Addiction Equity Act of 2008', 'This act expands the mental health parity requirements in the Employee Retirement Income Security Act, the Internal Revenue Code and the Public Health Services Act by imposing new mandates on group health plans that provide both medical and surgical benefits and mental health or substance abuse disorder benefits. Among the new requirements, such plans (or the health insurance coverage offered in connection with such plans) must ensure that the financial requirements applicable to mental health or substance abuse disorder benefits are no more restrictive than the predominant financial requirements applied to substantially all medical and surgical benefits covered by the plan (or coverage), and there are no separate cost sharing requirements that are applicable only with respect to mental health or substance abuse disorder benefits.')}
  </>
}
