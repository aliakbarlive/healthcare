import React from 'react'
import PlanProposal, { enrollmentInformation, tablePlanHeader, tableRow } from './PlanProposal/PlanProposal'

export const GroupLifePlanProposal: React.FC<{ groupName: string, groupEffectiveDate?: Date }> = ({ groupName, groupEffectiveDate }) => {
  return <PlanProposal groupName={groupName} groupEffectiveDate={groupEffectiveDate} tablePlanHeaders={tablePlanHeaders()} proposalHeader='Group Life Plan Proposal' tableRows={tableRows()} enrollmentInfo={enrollInfo()}/>
}

function tablePlanHeaders() {
  return <>
    {tablePlanHeader('Current', 'Group Life', 0)}
    {tablePlanHeader('Renewal', 'Group Life', 1)}
  </>
}

function tableRows() {
  return <>
    {tableRow('benefit amount', 0, '$50,000', '$50,000')}
    {tableRow('', 1, '', '')}
    {tableRow('ad&d benefit', 2, 'Equal to basic life benefit', 'Equal to basic life benefit')}
    {tableRow('waiver of premium', 3, 'Included', 'Included')}
    {tableRow('reduction schedule', 4, 'Reduced by 35% at 65\nReduced by 50% at 70', 'Reduced by 35% at 65\nReduced by 50% at 70')}
    {tableRow('accelerated life benefit', 5, 'Included', 'Included')}
    {tableRow('conversion', 6, 'Included', 'Included')}
    {tableRow('employee contributions', 7, 'None', 'None')}
    {tableRow('rate guarantee', 8, '1 year', '1 year')}
    {tableRow('', 9, '', '')}
    {tableRow('life', 10, '$95.37', '$95.37')}
    {tableRow('ad&d', 11, '$451.96', '$451.96')}
    {tableRow('monthly premium', 12, '$4,372.08', '$4,372.08')}
    {tableRow('annual cost', 13, '', '2.24%')}
    {tableRow('Change from current', 14, '', '0')}
  </>
}

function enrollInfo() {
  return <>
    {enrollmentInformation('6', '1', '2', '0')}
  </>
}
