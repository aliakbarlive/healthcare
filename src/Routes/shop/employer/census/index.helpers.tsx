import { Member, Dependent, StargateResponse as Stargate, Gender } from 'Utilities/Hooks/useStargate'
import { post } from 'Utilities/fetch++'
import { localMidnightToPharaohFormat } from 'Utilities/pharaoh'
import { compact, startCase } from 'lodash'
import { PowerLevel } from 'Utilities/Hooks/useUser'
import { firstNames, lastName } from 'Utilities/etc'
import { EnrollmentStatus, Relationship } from 'Utilities/pharaoh.types'
import { v4 as uuid } from 'uuid'
import moment from 'moment'

export interface CensusMember extends Omit<Member, 'name' | 'tier' | 'is_waived'> {
  firstName: string
  lastName: string
}

export interface FormData {
  ees: CensusMember[]
}

export function mangle(stargate: Stargate): CensusMember[] {
  if (stargate.members.length === 0 && stargate.user.power_level <= PowerLevel.groupManager) {
    /// add the group manager if no members otherwise
    return [{
      id: stargate.user.id,
      firstName: stargate.user.first_name || '',
      lastName: stargate.user.last_name || '',
      email: stargate.user.email,
      dependents: [],
      medical_underwriting_complete: false,
      enrollmentStatus: EnrollmentStatus.notInvited
    }]
  }

  return stargate.members.map(ee => ({
    ...ee,
    firstName: firstNames(ee.name) || '',
    lastName: lastName(ee.name) || '',
    dependents: ee.dependents
  }))
}

export async function submit(data: FormData, submitButtonPressed: boolean, onwards: (api: Promise<void>) => Promise<void>, addToast: (obj: any) => void, groupID: string) {
  if (submitButtonPressed) {
    onwards(go())
  } else {
    try {
      await go()
    } catch (error) {
      addToast(error)
    }
  }
  async function go() {
    const payload = convert()
    if (submitButtonPressed || payload.length) {
      // ^^ only POST if there’s data or if “Next” button was pressed
      await post(`/groups/${groupID}/users`, payload)
    }
  }
  // payload for POST is different (obv. lol)
  function convert() {
    let rv = data.ees
    rv = rv.filter(nonempty)
    if (!submitButtonPressed) rv = rv.filter(complete)
    return rv.map(transform)

    function transform(member: CensusMember) {
      return {
        id: member.id,
        name: compact([member.firstName, member.lastName]).join(' '),
        email: member.email,
        gender: member.gender,
        countyId: member.countyId,
        zip_code: member.zip,
        date_of_birth: localMidnightToPharaohFormat(member.dateOfBirth),
        dependents: deps()
      }
      function deps() {
        if (!member.dependents) return []
        let rv = member.dependents.filter(nonempty)
        if (!submitButtonPressed) rv = rv.filter(complete)
        return rv.map(dep => ({
          ...dep,
          relationship: dep.relationship,
          dateOfBirth: localMidnightToPharaohFormat(dep.dateOfBirth),
          zipCode: member.zip
        }))

        function nonempty(dep: Dependent) {
          if (!dep.firstName && !dep.lastName && !dep.dateOfBirth) {
            return false
          } else {
            return true
          }
        }
        function complete(dep: Dependent) {
          return dep.firstName && dep.lastName && dep.dateOfBirth
        }
      }
    }
  }
}

export function nonempty(member: CensusMember) {
  // don’t ever submit completely empty records
  if (!member.firstName && !member.lastName && !member.gender && !member.countyId && !member.zip && !member.dateOfBirth) {
    return false
  } else {
    return true
  }
}
function complete(member: CensusMember) {
  return member.firstName && member.lastName && member.gender && member.countyId && member.zip && member.dateOfBirth
}

export function isSpouse(dep: Partial<Dependent>): boolean {
  switch (dep.relationship) {
  case Relationship.spouse:
  case Relationship.lifePartner:
    return true
  case Relationship.child:
    return false
  }
  console.warn('Enum contains unexpected members')
  return false
}

export function relationshipCopy(dep: Partial<Dependent>): string {
  switch (dep.relationship) {
  case Relationship.lifePartner:
    return 'Domestic Partner'
  default:
    return startCase(dep.relationship?.toString())
  }
}

interface XLSXBase {
  firstName: string
  lastName: string
  dateOfBirth: Date
  gender: Gender
  zipCode: string
  tobbacoUse: boolean
}

interface XLSXMember extends XLSXBase {
  email: string
  dependents: XLSXDependent[]
  // enrollmentType: EnrollmentType
  // fullTimePartTime: FooTime
  isWaiving?: boolean
}

interface XLSXDependent extends XLSXBase {
  type: XLSXDependentType
}

enum XLSXDependentType {
  spouse = 'spouse',
  child = 'child',
  domesticPartner = 'domesticPartner'
}

export function mangleXLSX(data: XLSXMember[]): CensusMember[] {
  return data.map(member => ({
    ...member,
    zip: member.zipCode,
    gender: member.gender,
    dependents: member.dependents.map(dep => ({
      ...dep,
      id: uuid(),
      gender: dep.gender,
      relationship: convert(dep.type),
      dateOfBirth: moment(dep.dateOfBirth).toDate()
    })),
    id: uuid(),
    dateOfBirth: moment(member.dateOfBirth).toDate(),
    medical_underwriting_complete: false,
    enrollmentStatus: EnrollmentStatus.notInvited
  }))

  function convert(type: XLSXDependentType): Relationship {
    switch (type) {
    case XLSXDependentType.spouse:
      return Relationship.spouse
    case XLSXDependentType.domesticPartner:
      return Relationship.lifePartner
    case XLSXDependentType.child:
      return Relationship.child
    }
  }
}
