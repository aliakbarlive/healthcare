import React from 'react'
import EPlusEENotices, { leftParagraph, rightParagraph } from '../EPlusEENotices'

export const PageThreeNotice: React.FC<{ companyName: string, insuranceCompany: string }> = ({ companyName, insuranceCompany }) => {
  return <EPlusEENotices leftParagraphs={leftParagraphs(companyName, insuranceCompany)} rightParagraphs={rightParagraphs()} page={3} />
}

function leftParagraphs(companyName: string, insuranceCompany: string) {
  return <>
    {leftParagraph(0, 'What Happens To Your Current Coverage If You Decide to Join A Medicare Drug Plan?', `If you decide to join a Medicare drug plan, your current ${companyName} coverage will not be affected. Please see your Summary of Benefits & Coverage for Plan detail. Members can keep the CoreSource coverage if they elect part D and this plan will coordinate with Part D coverage. If you do decide to join a Medicare drug plan and drop your current ${insuranceCompany} coverage, be aware that you and your dependents will be able to get this coverage back if they are eligible for COBRA.`)}
    {leftParagraph(1, 'When Will You Pay A Higher Premium (Penalty) To Join A Medicare Drug Plan?', `You should also know that if you drop or lose your current coverage with ${insuranceCompany} and don’t join a Medicare drug plan within 63 continuous days after your current coverage ends, you may pay a higher premium (a penalty) to join a Medicare drug plan later. If you go 63 continuous days or longer without creditable prescription drug coverage, your monthly premium may go up by at least 1% of the Medicare base beneficiary premium per month for every month that you did not have that coverage. For example, if you go nineteen months without creditable coverage, your premium may consistently be at least 19% higher than the Medicare base beneficiary premium. You may have to pay this higher premium (a penalty) as long as you have Medicare prescription drug coverage. In addition, you may have to wait until the following October to join.`)}
  </>
}

function rightParagraphs() {
  return <>
    {rightParagraph(0, 'For More Information About Your Options Under Medicare Prescription Drug Coverage...', 'More detailed information about Medicare plans that offer prescription drug coverage is in the “Medicare & You” handbook. You’ll get a copy of the handbook in the mail every year from Medicare. You may also be contacted directly by Medicare drug plans. For more information about Medicare prescription drug coverage:/LineBreak/  - Visit www.medicare.gov/LineBreak/  - Call your State Health Insurance Assistance Program (see the inside back cover of your copy of the “Medicare & You” handbook for their telephone number) for personalized help/LineBreak/  - Call 1-800-MEDICARE (1-800-633-4227). TTY users should call 1-877-486-2048.')}
  </>
}
