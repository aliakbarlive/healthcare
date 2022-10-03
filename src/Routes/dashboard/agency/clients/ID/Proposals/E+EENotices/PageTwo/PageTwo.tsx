import React from 'react'
import EPlusEENotices, { leftParagraph, rightParagraph } from '../EPlusEENotices'

export const PageTwoNotice: React.FC<{ companyName: string, insuranceCompany: string }> = ({ companyName, insuranceCompany }) => {
  return <EPlusEENotices leftParagraphs={leftParagraphs(companyName)} rightParagraphs={rightParagraphs(companyName, insuranceCompany)} />
}

function leftParagraphs(companyName: string) {
  return <>
    {leftParagraph(0, 'Women’s Health and Cancer Rights Act (Janet’s Law)', 'The Women’s Health and Cancer Rights Act requires that all medical plans cover breast reconstruction following a mastectomy. Under this law, if an individual who has had a mastectomy elects to have breast reconstruction, the medical plan must provide the following coverage as determined in consultation with the attending physician and the patient:/LineBreak/ 1. Reconstruction of the breast on which the mastectomy has been performed/LineBreak/ 2. Surgery and reconstruction of the other breast to produce a symmetrical appearance; and/LineBreak/ 3. Prostheses and physical complications at all stages of the mastectomy, including lymphedemas./LineBreak/Benefits received for the above coverage will be subject to any deductibles and coinsurance amounts required under the medical plan for similar services. The Act prohibits any group health plan from:/LineBreak/1. Denying a participant or a beneficiary eligibility to enroll or renew coverage under the plan in order to avoid the requirements of the Act; /LineBreak/ 2. Penalizing, reducing, or limiting reimbursement to the attending provider (e.g. physician, clinic or hospital) to induce the provider to provide care inconsistent with the Act; and providing monetary or other incentives to an attending provider to induce the provider to provide care inconsistent with the Act.')}
    {leftParagraph(1, `Important Notice from ${companyName} About Your Prescription Drug Coverage and Medicare`, `Please read this notice carefully and keep it where you can find it. This notice has information about your current prescription drug coverage with ${companyName} and about your options under Medicare’s prescription drug coverage. This information can help you decide`)}
  </>
}

function rightParagraphs(companyName: string, insuranceCompany: string) {
  return <>
    {rightParagraph(0, '', `whether or not you want to join a Medicare drug plan. If you are considering joining, you should compare your current coverage, including which drugs are covered at what cost, with the coverage and costs of the plans offering Medicare prescription drug coverage in your area. Information about where you can get help to make decisions about your prescription drug coverage is at the end of this notice. There are two important things you need to know about your current coverage and Medicare’s prescription drug coverage:/LineBreak/ 1. Medicare prescription drug coverage became available in 2006 to everyone with Medicare. You can get this coverage if you join a Medicare Prescription Drug Plan or join a Medicare Advantage Plan (like an HMO or PPO) that offers prescription drug coverage. All Medicare drug plans provide at least a standard level of coverage set by Medicare. Some plans may also offer more coverage for a higher monthly premium./LineBreak/2. ${insuranceCompany} has determined that the prescription drug coverage offered by ${companyName} is, on average for all plan participants, expected to pay out as much as standard Medicare prescription drug coverage pays and is therefore considered Creditable Coverage. Because your existing coverage is Creditable Coverage, you can keep this coverage and not pay a higher premium (a penalty) if you later decide to join a Medicare drug plan.`)}
    {rightParagraph(1, 'When Can You Join A Medicare Drug Plan?', 'You can join a Medicare drug plan when you first become eligible for Medicare and each year from October 15th to December 7th. However, if you lose your current creditable prescription drug coverage, through no fault of your own, you will also be eligible for a two (2) month Special Enrollment Period (SEP) to join a Medicare drug plan.')}
  </>
}