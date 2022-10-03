import { ContributionSplit, Group, Member } from 'Utilities/Hooks/useStargate'
import { ContributionSplitType } from 'Components/Stargate/Contribution/ContributionAmount'
import { useList } from 'react-use'
import { useState, useEffect } from 'react'
import useToast from 'Utilities/Hooks/useToast'
import { put, delete_ } from 'Utilities/fetch++'
import { v4 as uuid } from 'uuid'

type UseSplit = [
  ContributionSplit[],
  string[], {
    create: () => void
    delete: (id: string) => void
    toggleMember: (memberID: string, splitID: string) => void
    setName: (id: string, name: string) => void
    setContribution: (splitID: string, value: string, type: ContributionSplitType) => void
    async: Promise<void>
  }
]

function useSplits(group: Group | undefined, members: Member[], initialSplits: ContributionSplit[]): UseSplit {
  const [splits, { push, removeAt }] = useList(initialSplits)
  const splitMemberIDs = new Set(splits.flatMap(({ members }) => members))
  const unsplitMembers = members.filter(member => !splitMemberIDs.has(member.id)).map(({ id }) => id)
  const [promise, setPromise] = useState(Promise.resolve())
  const addToast = useToast()

  useEffect(() => {
    if (splits === initialSplits) { return }
    splits.forEach(split => send(split.id))
    // eslint-disable-next-line
  }, [splits])

  return [splits, unsplitMembers, {
    create: () => {
      if (splits.length < 6) {
        push({
          isEquitable: true,
          id: uuid(),
          name: '',
          members: []
        })
      } else {
        addToast(new Error('You can have—at most—six contribution groups.'))
      }
    },
    delete: (id: string) => {
      removeAt(splits.findIndex(split => split.id === id))
      retract(id)
    },
    toggleMember: (memberID: string, splitID: string) => {
      const members = splits.find(split => split.id === splitID)?.members
      if (!members) return
      const index = members.indexOf(memberID)
      if (index >= 0) {
        members.splice(index, 1)
      } else {
        members.push(memberID)
      }
      send(splitID)
    },
    setName: (id: string, name: string) => {
      const split = splits.find(split => split.id === id)
      if (split) {
        split.name = name
        send(id)
      }
    },
    setContribution: (id: string, value: string, type: ContributionSplitType) => {
      const split = splits.find(split => split.id === id)
      if (split) {
        split.contribution = value
        split.isEquitable = type === ContributionSplitType.allTiers
        send(id)
      }
    },
    async: Promise.resolve()
  }]

  function send(id: string) {
    const split = splits.find(split => split.id === id)
    if (split) {
      setPromise(promise.then(() => put(`/groups/${group?.id}/split`, split)).catch(addToast))
    } else {
      console.warn('NOPE!')
    }
  }

  function retract(id: string) {
    setPromise(promise.then(() => delete_(`/groups/${group?.id}/split/${id}`)).catch(addToast))
  }
}

export default useSplits
