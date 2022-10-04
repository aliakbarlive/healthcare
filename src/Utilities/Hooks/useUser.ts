import * as api from '../fetch++'
import { useAsync } from 'react-use'
import { Tier } from 'Utilities/pharaoh.types'
import ReactGA from 'react-ga'
import { getToken } from 'Utilities/pharaoh'
import { AsyncState } from 'react-use/lib/useAsync'
import { analyticsTrackers } from 'Utilities/config'

// globally store this immutable data for /dashboard/employer routes

interface Store {
  token: string
  promise: Promise<Response>
}

let store: Store | null = null

export interface Response {
  id: string
  email: string
  groups: {id: string, name: string}[]
  powerLevel: PowerLevel
  name: string | null
  tier: Tier | null
  agencyID: string | null
  avatar?: string
  slug?: string
  whiteLabelAgencyID: string
}

export enum PowerLevel {
  individual,
  groupManager,
  associationManager,
  broker,
  superBroker,
  candorEmployee,
}

/// NOTE error is *probably* a FetchError (see fetch++.ts)
// FIXME will make the call multiple times until the async is resolved

export default function useUser<T = Response>(closure?: (rsp: Response) => Promise<T>): AsyncState<T> {
  const token = getToken()
  const async = useAsync(async() => {
    async function go() {
      const rsp = await api.get('/users')
      if (!rsp) throw new Error('Unexpected Error')
      rsp.powerLevel = rsp.power_level.level as PowerLevel
      delete rsp.power_level
      return rsp
    }

    let rsp
    if (store && store.token === token) {
      rsp = await store.promise
    } else {
      const promise = go()
      store = { token, promise }
      rsp = await promise

      setGlobalState(rsp)
    }
    if (closure) {
      rsp = await closure(rsp)
    }

    return rsp

    function setGlobalState(rsp: Response) {
      ReactGA.set({ userId: rsp.id }, analyticsTrackers())

      const obj = (window as any).intercomSettings
      if (obj) {
        obj.name = rsp.name
        obj.email = rsp.email
        // eslint-disable-next-line camelcase
        obj.user_id = rsp.id
      }
    }
  }, [token])

  return async
}
