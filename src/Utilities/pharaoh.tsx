import * as api from './fetch++'
import * as types from './pharaoh.types'
import moment, { Moment } from 'moment'
import { Label } from './config'
import { AncillaryPlanUnion, Contributions } from 'Utilities/Plans/ContributionCalculator'
import { ContributionSplit } from './Hooks/useStargate'
import { DeltaResponse } from 'Routes/shop/agency/payment'

/* eslint-disable @typescript-eslint/no-explicit-any */

/// used when signed in user account
export function clearLocalStorage() {
  const label = localStorage.label
  sessionStorage.clear()
  localStorage.clear()
  localStorage.label = label
}

function tokenStorage() {
  return localStorage
}

export function getToken() {
  const token = tokenStorage().token
  return token === 'undefined' ? undefined : token
}

const v1 = {
  stargate: (groupID?: string) => {
    if (groupID) {
      return api.get(`/stargate/${groupID}`)
    }
    return api.get('/stargate')
  },
  carriers: () => api.get('/carriers'),
  states: () => api.get('/states'),
  associations: (id: string) => ({
    GET: () => api.get(`/associations/${id}`),
    groups: () => api.get(`/associations/${id}/groups`)
  }),
  groups: (id?: string) => ({
    users: {
      GET: async() => await api.get(`/groups/${id}/users`) as ContributionSplit[],
      POST: (data: any) => api.post(`/groups/${id}/users`, data),
      waive: {
        PUT: (data: any) => api.put(`/groups/${id}/users/waive`, data)
      }
    },
    splits: {
      GET: () => api.get(`/groups/${id}/split`)
    },
    plans: {
      options: (type: string) => api.get(`/groups/${id}/plans/options/${type}`)
    }
  }),
  support: {
    mail: (payload: {subject: string, body: string, referrerURL: string, email?: string, isPlanApplication?: boolean, name?: string, phone?: string}) => {
      return api.post('/support/mail', payload)
    }
  },
  users: {
    resetPassword: async(data: any, token = '') => {
      const rsp = await api.post(`/users/reset-password/${token}`, data)
      if (token) setToken(rsp.token)
      return rsp
    },
    sessions: {
      POST: async(email: string, password: string) => {
        const rsp = await api.post('/users/sessions', { email, password }, false)
        clearLocalStorage()
        setToken(rsp.token)
        return rsp
      },
      DELETE: async() => {
        try {
          if (getToken()) {
            await api.delete_('/users/sessions')
          }
        } finally {
          clearLocalStorage()
        }
      }
    }
  }
}

const v2 = {
  users: (userId?: string) => ({
    plans: {
      GET: () => api.get(`/v2/users/${userId}/plans`)
    },
    gatekeeper: (data: any) => api.post('/v2/users/gatekeeper', data)
  }),
  brokers: {
    groups: (id: string | null = null) => ({
      GET: (status?: types.PipelineStatus) => api.get(`/v2/brokers/groups/${status ? `of/${status}` : ''}`),
      documents: (docID = '') => ({
        GET: () => api.get(`/v2/brokers/groups/${id}/documents`),
        DELETE: () => api.delete_(`/v2/brokers/groups/${id}/documents/${docID}`),
        PUT: (data: any) => api.put(`/v2/brokers/groups/${id}/documents/${docID}`, data),
        POST: (data: any) => api.post(`/v2/brokers/groups/${id}/documents`, data)
      }),
      users: () => api.get(`/v2/brokers/groups/${id}/users`)
    }),
    pipeline: () => api.get('/v2/brokers/pipeline'),
    pipeline_archived: () => api.get('/v2/brokers/pipeline/archived'),
    associations: (id: string | null = null) => ({
      GET: () => api.get('/v2/brokers/associations'),
      groups: () => api.get(`/v2/brokers/associations/${id}/groups`)
    }),
    reports: () => api.get('/v2/brokers/reports'),
    producers: (id: string | null = null) => ({
      GET: () => api.get(`/v2/brokers/producers/${id || ''}`),
      groups: ({
        GET: () => api.get(`/v2/brokers/producers/${id}/groups`)
      }),
      assign: {
        to: (groupID: string) => api.post(`/v2/brokers/producers/${id}/assign/to/${groupID}`)
      }
    })
  },
  forms: (id: string) => ({
    GET: () => api.get(`/v2/forms/${id}`),
    questions: () => ({
      GET: () => api.get(`/v2/forms/${id}/questions`)
    })
  }),
  groups: (id?: string) => ({
    POST: (data: any, label: Label) => api.post(`/v2/groups/${id || ''}`, data, true, label),
    plans: {
      GET: () => api.get(`/v2/groups/${id}/plans`),
      POST: (data: string[]) => api.post(`/v2/groups/${id}/plans`, data),
      DELETE: (planID: string) => api.delete_(`/v2/groups/${id}/plans/${planID}`),
      options: {
        recommended: (query = '') => api.get(`/v2/groups/${id}/plans/options/recommended${query}`)
      }
    },
    xlsx: (file: File) => api.upload('/v2/groups/xlsx', file),
    users: {
      GET: () => api.get(`/v2/groups/${id}/users`),
      invite: () => api.post(`/v2/groups/${id}/users/invite`),
      redflags: {
        GET: () => api.get(`/v2/groups/${id}/users/redflags`),
        POST: (data: any) => api.post(`/v2/groups/${id}/users/redflags`, data)
      },
      uhone: () => api.get(`/v2/groups/${id}/users/uhone`),
      underwriting: {
        GET: () => api.get(`/v2/groups/${id}/users/underwriting`),
        POST: (data: any) => api.post(`/v2/groups/${id}/users/underwriting`, data)
      }
    },
    invite: {
      manager: (email: string) => api.post(`/v2/groups/${id}/invite/manager`, { email })
    },
    associations: {
      all: () => api.get('/v2/associations/all')
    }
  }),
  notes: {
    GET: (id = '') => api.get(`/v2/notes/${id}`),
    POST: async function(targetID: string, content: string) {
      return api.post('/v2/notes', { targetID, content })
    },
    PUT: async(id: string, content: string) => api.put(`/v2/notes/${id}`, { content }),
    DELETE: async(id: string) => api.delete_(`/v2/notes/${id}`)
  },
  todos: (id = '') => ({
    GET: () => api.get(`/v2/todos/${id}`),
    POST: (data: any) => api.post(`/v2/todos/${id}`, data),
    PUT: (data: any) => api.put(`/v2/todos/${id}`, data),
    DELETE: () => api.delete_(`/v2/todos/${id}`)
  })
}

const v3 = {
  producers: {
    POST: (data: any) => api.post('/v3/producers', data),
    GET: () => api.get('/v3/producers/')
  },
  agency: {
    POST: (data: any) => api.post('/v3/agency', data),
    paymentMethod: {
      POST: (data: DeltaResponse) => api.post('/v3/agency/paymentMethod', data)
    },
    logo: {
      POST: (data: any) => api.post('/v3/agency/logo', data)
    },
    licenses: {
      GET: () => api.get('/v3/agency/licenses'),
      POST: (data: any) => api.post('/v3/agency/licenses', data)
    },
    landing: {
      GET: () => api.get('/v3/agency/landing'),
      POST: (data: any) => api.post('/v3/agency/landing', data)
    },
    finalize: {
      POST: (data: any) => api.post('/v3/agency/finalize', data)
    }
  },
  landing: (slug: string) => api.get(`/v3/landing/${slug}`),
  tickets: (token: string | null = null) => ({
    GET: () => api.get(`/v3/tickets/${token}`) as Promise<types.Ticket>,
    POST: (data: types.TicketPayload) => api.post('/v3/tickets', data)
  }),
  toastCollector: () => ({
    POST: (data: types.ToastCollectorPayload) => api.post('/v3/toastCollector', data)
  }),
  brokers: {
    GET: () => api.get('/v3/brokers') as Promise<types.Broker>,
    POST: (data: any) => api.post('/v3/brokers', data),
    getAppointed: (carrierName: string) => api.post(`/v3/brokers/${carrierName}/getAppointed`, carrierName),
    producers: (producerId?: string) => ({
      GET: () => api.get('/v3/brokers/producers'),
      appointments: (appointmentId?: string) => ({
        GET: () => api.get(`/v3/brokers/producers/${producerId}/appointments`),
        POST: (data: any) => api.post(`/v3/brokers/producers/${producerId}/appointments`, data),
        PUT: (data: any) => api.put(`/v3/brokers/producers/${producerId}/appointments/${appointmentId}`, data),
        DELETE: () => api.delete_(`/v3/brokers/producers/${producerId}/appointments/${appointmentId}`)
      })
    })
  },
  users: (id?: string) => ({
    POST: async(data: any) => {
      const rsp = await api.post('/v3/users', data, false)
      setToken(rsp.token)
      return rsp
    },
    PUT: (data: any) => api.put('/v3/users', data),
    GET: async() => {
      const rsp = await api.get(`/v3/users/${id}`) as types.Member
      rsp.qualifyingEvents = rsp.qualifyingEvents?.map(qle => {
        qle.date = utcMidnightToLocalMidnight(qle.date)!
        return qle
      })
      rsp.dob = utcMidnightToLocalMidnight(rsp.dob)
      rsp.dependents = rsp.dependents?.map(dep => {
        dep.dob = utcMidnightToLocalMidnight(dep.dob)!
        return dep
      })
      rsp.dates.effective = utcMidnightToLocalMidnight(rsp.dates.effective)
      rsp.dates.hire = utcMidnightToLocalMidnight(rsp.dates.hire)
      rsp.dates.termination = utcMidnightToLocalMidnight(rsp.dates.termination)
      return rsp
    },
    venues: () => api.get('/v3/users/venues'),
    qle: {
      GET: () => api.get(`/v3/users/${id}/qle`),
      POST: (data: any) => api.post(`/v3/users/${id}/qle`, data)
    },
    payments: {
      GET: () => api.get('/v3/users/payments'),
      POST: (data: any) => api.post('/v3/users/payments', data),
      premium: (data: any) => api.post('/v3/users/payments/premium', data),
      ach: (data: any) => api.put('/v3/users/payments/ach', data),
      promocodes: (data: any) => api.post('/v3/users/payments/promocodes', data)
    },
    plans: (type: string) => ({
      DELETE: () => api.delete_(`/v3/users/${id}/plans/${type}`)
    })
  }),
  groups: (groupID?: string) => ({
    GET: async() => {
      const rsp = await api.get(`/v3/groups/${groupID || ''}`) as types.Group
      for (const key in rsp.dates) {
        (rsp.dates as any)[key] = utcMidnightToLocalMidnight((rsp.dates as any)[key])
      }
      return rsp
    },
    PUT: async(data: types.PartialGroup) => {
      for (const key in data.dates) {
        (data.dates as any)[key] = localMidnightToPharaohFormat((data.dates as any)[key])
      }
      data.waitingPeriod = numberify(data.waitingPeriod)
      await api.put('/v3/groups', { ...data, id: groupID })
    },
    POST: async(data: any) => {
      for (const key in data.dates) {
        (data.dates as any)[key] = localMidnightToPharaohFormat((data.dates as any)[key])
      }
      await api.post('/v3/groups', data)
    },
    application: {
      GET: () => api.get(`/v3/groups/${groupID}/application`),
      POST: (data: any) => api.post(`/v3/groups/${groupID}/application`, data)
    },
    contributions: {
      GET: async() => await api.get(`/v3/groups/${groupID}/contributions`) as Contributions,
      PUT: (data: Contributions) => api.put(`/v3/groups/${groupID}/contributions`, data)
    },
    users: (memberId?: string) => ({
      GET: () => api.get(`/v3/groups/${groupID}/users`),
      POST: (data: any) => api.post(`/v3/groups/${groupID}/users`, data),
      promote: () => api.post(`/v3/groups/${groupID}/users/${memberId}/promote`),
      plans: {
        GET: () => api.get(`/v3/groups/${groupID}/users/${memberId}/plans`),
        options: {
          ancillary: () => api.get(`/v3/groups/${groupID}/users/${memberId}/plans/options/ancillary`)
        },
        prosper: {
          GET: async() => await api.get(`/v3/groups/${groupID}/users/${memberId}/plans/prosper`) as types.StandaloneProsper,
          PUT: () => api.put(`/v3/groups/${groupID}/users/${memberId}/plans/prosper`),
          DELETE: () => api.delete_(`/v3/groups/${groupID}/users/${memberId}/plans/prosper`)
        }
      },
      underwriting: {
        POST: (data: any) => api.post(`/v3/groups/${groupID}/users/${memberId}/underwriting`, data),
        GET: () => api.get(`/v3/groups/${groupID}/users/${memberId}/underwriting`)
      }
    }),
    plans: {
      GET: async() => await api.get(`/v3/groups/${groupID || ''}/plans`) as types.MedicalPlan[],
      POST: (data: any) => api.post(`/v3/groups/${groupID}/plans`, data),
      renewalPlans: {
        renewals: async() => await api.get(`/v3/groups/${groupID}/plans/renewal`) as types.MedicalPlan[]
      },
      options: {
        ancillary: {
          selected: async() => await api.get(`/v3/groups/${groupID}/plans/options/ancillary/selected`) as AncillaryPlanUnion[],
          GET: async() => await api.get(`/v3/groups/${groupID}/plans/options/ancillary`) as AncillaryPlanUnion[],
          POST: async(id: string) => await api.post(`/v3/groups/${groupID}/plans/options/ancillary`, { id }),
          DELETE: async(id: string) => await api.delete_(`/v3/groups/${groupID}/plans/options/ancillary/${id}`)
        }
      },
      validate: () => api.post(`/v3/groups/${groupID || ''}/plans/validate`)
    },
    contacts: {
      GET: () => api.get(`/v3/groups/${groupID}/contacts`),
      POST: (data: any) => api.post(`/v3/groups/${groupID}/contacts`, data)
    },
    payments: {
      ach: {
        PUT: (data: any) => api.put(`/v3/groups/${groupID}/payments/ach`, data)
      }
    },
    carrierApplication: {
      POST: (data: any) => api.post(`/v3/groups/${groupID}/carrierApplication`, data)
    },
    ehq: {
      POST: (data: any) => api.post(`/v3/groups/${groupID}/ehq`, data)
    },
    refresh: {
      POST: () => api.post(`/v3/groups/${groupID}/refresh`, {})
    },
    individual: {
      POST: (id?: string) => api.post(`/v3/groups/individual${id ? `/${id}` : ''}`, {})
    }
  }),
  members: (memberID?: string) => ({
    selections: {
      GET: () => api.get(`/v3/members/${memberID}/selections`)
    }
  }),
  integrations: {
    sidecar: {
      drugs: (name?: string) => api.get(`/v3/integrations/sidecar/drugs/${name || ''}`),
      stripeKey: () => api.get('/v3/integrations/sidecar/stripeKey'),
      group: (groupID?: string) => ({
        GET: () => api.get(`/v3/integrations/sidecar/group/${groupID}`),
        POST: (token: string) => api.post(`/v3/integrations/sidecar/group/${groupID}`, { token }),
        questions: {
          GET: () => api.get(`/v3/integrations/sidecar/group/${groupID}/questions`),
          POST: (data: any) => api.post(`/v3/integrations/sidecar/group/${groupID}/questions`, data)
        }
      }),
      member: (id?: string) => ({
        GET: () => api.get(`/v3/integrations/sidecar/member/${id}`),
        apply: {
          POST: (data: any) => api.post(`/v3/integrations/sidecar/member/${id}/apply`, data)
        },
        application: {
          STREAM: () => api.stream(`/v3/integrations/sidecar/member/${id}/application`, 'application/pdf')
        },
        policy: {
          STREAM: () => api.stream(`/v3/integrations/sidecar/member/${id}/policy`, 'application/pdf')
        },
        enroll: {
          POST: () => api.post(`/v3/integrations/sidecar/member/${id}/enroll`)
        },
        history: {
          GET: () => api.get(`/v3/integrations/sidecar/member/${id}/history`)
        }
      })
    },
    natgen: {
      groups: (groupID: string) => ({
        application: {
          GET: () => api.get(`/v3/integrations/natgen/${groupID}/application`),
          POST: (data: any) => api.post(`/v3/integrations/natgen/${groupID}/application`, data)
        }
      })
    }
  },
  qualifyingevents: () => api.get('/v3/qualifyingevents'),
  panic: (data: any) => api.post('/v3/panic', data)
}

function numberify(input: string | number | undefined): number | undefined {
  if (typeof input === 'string') {
    return parseInt(input)
  } else {
    return input
  }
}

export function setToken(newValue: string): void {
  const str = newValue?.trim()
  if (str) {
    tokenStorage().token = newValue
  } else {
    throw new Error('Invalid or empty token returned from server')
  }
}

function isAuthenticated(): boolean {
  return !!getToken()
}

function utcMidnightToLocalMidnight(input: any): Date | undefined {
  if (!input) return undefined
  if (typeof input !== 'string') return undefined
  const mk = moment(input).local()
  const offset = mk.utcOffset()
  return mk.minutes(-offset).toDate()
}

function localMidnightToUTCMidnight(input: Date | Moment | undefined): Moment | undefined {
  if (!input) return input
  if (!moment.isMoment(input)) input = moment(input).local()
  if (!input.isLocal()) input = input.local()
  const offset = input.utcOffset()
  return input.minutes(offset)
}

function localMidnightToPharaohFormat(input: Date | Moment | undefined): string | undefined {
  return localMidnightToUTCMidnight(input)?.format()
}

export {
  v1, v2, v3,
  isAuthenticated,
  utcMidnightToLocalMidnight,
  localMidnightToPharaohFormat
}
