import { PipelineStatus } from 'Utilities/pharaoh.types'

interface PipelineStages {
  label: string
  key: PipelineStatus
  arrow: boolean
  startColor: string
  endColor: string
}

export const stages: PipelineStages[] = [
  {
    label: 'Suspect',
    key: PipelineStatus.suspect,
    arrow: true,
    startColor: '#ececf5',
    endColor: '#e3e2ef'
  },
  {
    label: 'Prospect',
    key: PipelineStatus.prospect,
    arrow: true,
    startColor: '#f0f0ff',
    endColor: '#e2e5ff'
  },
  {
    label: 'Qualifying\nLead',
    key: PipelineStatus.lead,
    arrow: true,
    startColor: '#ebeffd',
    endColor: '#dfe9fd'
  },
  {
    label: 'Plans\nProposed',
    key: PipelineStatus.proposed,
    arrow: true,
    startColor: '#eaf4ff',
    endColor: '#d8ebfd'
  },
  {
    label: 'Medical \nQuestionnaires \nSent',
    key: PipelineStatus.mqsent,
    arrow: true,
    startColor: '#eaf4ff',
    endColor: '#d8ebfd'
  },
  {
    label: 'Enrollment\nShop Sent to\nEmployees',
    key: PipelineStatus.sent,
    arrow: true,
    startColor: '#ebf9ff',
    endColor: '#d6f3ff'
  },
  {
    label: 'Enrolled',
    key: PipelineStatus.enrolled,
    arrow: false,
    startColor: '#daf8f6',
    endColor: '#b9efe0'
  },
  {
    label: 'Archived',
    key: PipelineStatus.archived,
    arrow: false,
    startColor: '#d9d9d9',
    endColor: '#e4e4e4'
  }]
