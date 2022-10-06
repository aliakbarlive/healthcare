import { useState } from 'react'
import { get } from 'Utilities/fetch++'
import { useAsync } from 'react-use'
import * as api from 'Utilities/pharaoh'
import { Group } from 'Utilities/pharaoh.types'

/* eslint-disable camelcase */

// globally store this immutable data for /dashboard/employer routes

// FIXME doesn’t respect log-out / log-in, needs to cache token and refetch if token changes

const store: Group | null = null

export default function useGroupManager<T = Group>(closure?: (rsp: Group) => Promise<T>): {loading: boolean, error: Error | null, value: T | null} {
  const [state, setState] = useState<T | null>(null)
  const async = useAsync(async() => {
    let rsp = store
    if (!rsp) {
      let groupID = localStorage.overrideGroupID as string
      if (!groupID) {
        const venues = await get('/v3/users/venues')
        groupID = venues.anubis.er[0]
      }
      if (!groupID) throw new Error('You do not administrate any groups')
      rsp = await api.v3.groups(groupID).GET() as Group
      if (!rsp) throw new Error('Group not found')
    }

    rsp.dates.effective = api.utcMidnightToLocalMidnight(rsp.dates.effective)

    if (closure) {
      setState(await closure(rsp))
    } else {
      setState(rsp as unknown as T)
    }
  }, [localStorage.overrideGroupID])
  if (async.loading) {
    return { loading: async.loading, error: null, value: null }
  } else if (async.error) {
    return { loading: false, error: async.error, value: null }
  } else {
    return { loading: false, error: null, value: state }
  }
}
