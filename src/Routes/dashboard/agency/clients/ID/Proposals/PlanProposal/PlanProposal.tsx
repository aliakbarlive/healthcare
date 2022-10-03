import { visitAndPrescCopy } from 'Components/Plans/plan-subcomponents/MedicalPlanAdditionalSpecs'
import { Carriers } from 'Components/Plans/plan-subcomponents/Plan.helpers'
import React from 'react'
import { MedicalPlan } from 'Utilities/pharaoh.types'
import { myhealthilyLogo } from '../Landing/Landing'
import { TierCount } from '../Proposal'
import styles from './PlanProposal.module.scss'
interface PlanProposalProps {
  proposalHeader: string
  tablePlanHeaders: JSX.Element
  tableRows: JSX.Element
  enrollmentInfo: JSX.Element
  groupName: string
  groupEffectiveDate?: Date
}

const PlanProposal: React.FC<PlanProposalProps> = ({ proposalHeader, tablePlanHeaders: tableHeaders, tableRows, enrollmentInfo, groupName, groupEffectiveDate }) => {
  return <div className={styles.medicalPlanPropPrint}>
    <div className={styles.frame2615}>
      <div className={styles.frame2614}>
        <p className={styles.groupNameText}>{groupName}</p>
        <p className={styles.groupNameText}>{`Effective Date: ${groupEffectiveDate?.toLocaleDateString('en-US')}`}</p>
      </div>
      <div className={styles.frame2613}>
        {myhealthilyLogo()}
      </div>
    </div>
    <div className={styles.frame2675}>
      <div className={styles.frame2671}>
        <div className={styles.frame2670}>
          <div className={styles.frame2669}>
            <div className={styles.frame2657}>
              {enrollmentInfo}
              {tableHeaders}
            </div>
            <div className={styles.frame2668}>
              {tableRows}
            </div>
          </div>
          <p className={styles.noteRates}>Note: Rates and benefits are for illustrative purposes only and are not a guarantee of coverage. Final rates will be based on insurance carrier confirmation and group enrollment.</p>
        </div>
        <p className={styles.medicalPlanPropParagraph}>{proposalHeader}</p>
      </div>
      <div className={styles.frame2674}></div>
    </div>
  </div>
}

export function enrollmentInformation(eOnly: string, eeplusSpouse: string, eeplusChild: string, family: string) {
  return <div className={styles.frame2407}>
    <div className={styles.frame2409}>
      <div className={styles.frame24071}>
        <p style={{ order: 0 }} className={styles.enrollNums}>{eOnly}</p>
        <p style={{ order: 1 }} className={styles.enrollNums}>{eeplusSpouse}</p>
        <p style={{ order: 2 }} className={styles.enrollNums}>{eeplusChild}</p>
        <p style={{ order: 3 }} className={styles.enrollNums}>{family}</p>
      </div>
      <div className={styles.frame2408}>
        <p className={styles.enrollTitle} style={{ order: 0 }}>Employee only</p>
        <p className={styles.enrollTitle} style={{ order: 1 }}>Employee + spouse</p>
        <p className={styles.enrollTitle} style={{ order: 2 }}>employee + child</p>
        <p className={styles.enrollTitle}style={{ order: 3 }}>family</p>
      </div>
    </div>
    <p className={styles.currEnrollment}> Current Enrollment</p>
  </div>
}

export function tablePlanHeader(planType: string, planName: string, order: number, logo?: JSX.Element) {
  return <div style={{ order: order }} className={styles.frame2459}>
    <div className={styles.frame1}>
      <p className={styles.planName}>{planName}</p>
    </div>
    {logo && <span className={styles.carrierLogo}>{logo}</span>}
    <p className={styles.timeLineText} style={ logo ? {} : { top: '45%' } }>{planType}</p>
  </div>
}

export function tableRow(column1: string, order: number, column2?: string, column3?: string, column4?: string, column5?: string, column6?: string, medicalPlanTable?: boolean) {
  const mergeCellsMPlanTable = (order: number) => ({ order: order, height: '35px', backgroundColor: '#4171C8', border: 'none' })
  const mergeCellsDVPlanTables = (order: number) => ({ order: order, backgroundColor: '#4171C8', border: 'none' })
  return <div style={medicalPlanTable ? { order: order, height: '35px' } : { order: order }} className={styles.frame2637}>
    <div className={styles.frame2632} style={(column1 === 'IN-NETWORK' || column1 === 'RATES') ? medicalPlanTable ? { height: '35px', backgroundColor: '#4171C8' } : { backgroundColor: '#4171C8' } : {}}>
      {column2?.length !== undefined && <div style={(column1 === 'IN-NETWORK' || column1 === 'RATES') ? medicalPlanTable ? mergeCellsMPlanTable(0) : mergeCellsDVPlanTables(0) : { order: 0 }} className={styles.frame2631}><p className={styles.percentValue}>{column2}</p></div>}
      {column3?.length !== undefined && <div style={(column1 === 'IN-NETWORK' || column1 === 'RATES') ? medicalPlanTable ? mergeCellsMPlanTable(1) : mergeCellsDVPlanTables(1) : { order: 1 }} className={styles.frame2631}><p className={styles.percentValue}>{column3}</p></div>}
      {column4?.length !== undefined && <div style={(column1 === 'IN-NETWORK' || column1 === 'RATES') ? medicalPlanTable ? mergeCellsMPlanTable(2) : mergeCellsDVPlanTables(2) : { order: 2 }} className={styles.frame2631}><p className={styles.percentValue}>{column4}</p></div>}
      {column5?.length !== undefined && <div style={(column1 === 'IN-NETWORK' || column1 === 'RATES') ? medicalPlanTable ? mergeCellsMPlanTable(3) : mergeCellsDVPlanTables(3) : { order: 3 }} className={styles.frame2631}><p className={styles.percentValue}>{column5}</p></div>}
      {column6?.length !== undefined && <div style={(column1 === 'IN-NETWORK' || column1 === 'RATES') ? medicalPlanTable ? mergeCellsMPlanTable(4) : mergeCellsDVPlanTables(4) : { order: 4 }} className={styles.frame2631}><p className={styles.percentValue}>{column6}</p></div>}
    </div>
    <div className={styles.frame2635} style={(column1 === 'IN-NETWORK' || column1 === 'RATES') ? medicalPlanTable ? { height: '35px', backgroundColor: '#4171C8', left: '50%', border: '', justifyContent: 'center' } : { backgroundColor: '#4171C8', left: '50%', justifyContent: 'center' } : {}}>
      <p className={styles.percentChangeText} style={(column1 === 'IN-NETWORK' || column1 === 'RATES') ? { color: '#FFFFFF' } : {}}>{column1}</p>
    </div>
  </div>
}

export function tableRowCopayOrRx(copay: boolean, column2?: MedicalPlan, column3?: MedicalPlan, column4?: MedicalPlan, column5?: MedicalPlan, column6?: MedicalPlan) {
  const order = copay ? 7 : 2
  return <div style={{ order: order, height: '35px' }} className={styles.frame2637}>
    <div className={styles.frame2632} style={{ height: '35px' }}>
      {column2 !== undefined && <div style={{ order: 0, height: '35px' }} className={styles.frame2631}>{copay ? copayBox(column2) : rxBox(column2)}</div> }
      {column3 !== undefined && <div style={{ order: 1, height: '35px' }} className={styles.frame2631}>{copay ? copayBox(column3) : rxBox(column3)}</div> }
      {column4 !== undefined && <div style={{ order: 2, height: '35px' }} className={styles.frame2631}>{copay ? copayBox(column4) : rxBox(column4)}</div> }
      {column5 !== undefined && <div style={{ order: 3, height: '35px' }} className={styles.frame2631}>{copay ? copayBox(column5) : rxBox(column5)}</div> }
      {column6 !== undefined && <div style={{ order: 4, height: '35px' }} className={styles.frame2631}>{copay ? copayBox(column6) : rxBox(column6)}</div> }
    </div>
    <div className={styles.frame2635} style={{ height: '35px' }}>
      <p className={styles.percentChangeText}>{copay ? 'COPAY' : 'RX'}</p>
    </div>
  </div>
}

function copayBox(plan: MedicalPlan) {
  const isLimitedPlan = plan.carrier === Carriers['Sidecar Health']
  return <div className={styles.medicalVisitAndPrescLabel} style={{ fontSize: '7px' }}>
    { isLimitedPlan
      ? limitedPlanCopy('Prescriptions', 'If prescription coverage is elected, pays a fixed amount for any eligible prescriptions')
      : <>
        <div style={{ order: 0, display: 'flex' }} >
          <p>Primary:&nbsp;</p>
          {visitAndPrescCopy(plan.copay.primaryCarePhysician, plan, isLimitedPlan, true)}
        </div>
        <div style={{ order: 1, display: 'flex' }} >
          <p>Specialist:&nbsp;</p>
          {visitAndPrescCopy(plan.copay.specialist, plan, isLimitedPlan, true)}
        </div>
        <div style={{ order: 2, display: 'flex' }} >
          <p>Urgent Care:&nbsp;</p>
          {visitAndPrescCopy(plan.copay.urgentCare, plan, isLimitedPlan, true)}
        </div>
      </>
    }
  </div>
}

function rxBox(plan: MedicalPlan) {
  const isLimitedPlan = plan.carrier === Carriers['Sidecar Health']
  return <div className={styles.medicalVisitAndPrescLabel} style={{ fontSize: '7px' }}>
    { isLimitedPlan
      ? limitedPlanCopy('Medically Necessary Care', 'Pays a fixed amount for any eligible service needed to preserve or restore your health')
      : <>
        <div style={{ order: 0, display: 'flex' }} >
          <p>Generic:&nbsp;</p>
          {visitAndPrescCopy(plan.prescription.generic, plan, isLimitedPlan, true)}
        </div>
        <div style={{ order: 1, display: 'flex' }} >
          <p>Preferred:&nbsp;</p>
          {visitAndPrescCopy(plan.prescription.preferredBrand, plan, isLimitedPlan, true)}
        </div>
        <div style={{ order: 2, display: 'flex' }} >
          <p>Speciality:&nbsp;</p>
          {visitAndPrescCopy(plan.prescription.specialty, plan, isLimitedPlan, true)}
        </div>
      </>
    }
  </div>
}

function limitedPlanCopy(title: string, text: string) {
  return <div style={{ display: 'flex', flexDirection: 'column', fontFamily: 'Proxima Nova', fontWeight: 600, fontSize: '7px', alignItems: 'center' }}>
    <p style={{ order: 0, marginBottom: '2px', fontWeight: 'bold' }}>{title}</p>
    <p style={{ order: 1 }}>{text}</p>
  </div>
}

export function enrollInfo(enrollCount: TierCount) {
  return <>
    {enrollmentInformation(enrollCount.individual.toString(), enrollCount.couple.toString(), enrollCount.single.toString(), enrollCount.family.toString())}
  </>
}

export default PlanProposal
