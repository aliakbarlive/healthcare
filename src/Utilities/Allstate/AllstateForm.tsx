import _, { startCase } from 'lodash'
import moment from 'moment'
import React, { useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { $enum } from 'ts-enum-util'
import { GroupMember, Dependent, User, UserMetadata, ConsumerProfile, Group, Gender } from 'Utilities/Hooks/useStargate'
import useToast from 'Utilities/Hooks/useToast'
import * as api from 'Utilities/pharaoh'
import { Relationship } from 'Utilities/pharaoh.types'
import styles from './AllstateForm.module.scss'
import {
  EnrollmentApplication,
  EnrollmentApplicationForm,
  EnrollmentApplicationGeneralCondition,
  EnrollmentApplicationQuestion,
  EnrollmentEarningsBasis,
  EnrollmentEmployeeStatus,
  EnrollmentEmploymentStatus,
  EnrollmentEnrollmentType,
  EnrollmentMaritalStatus,
  EnrollmentPersonsToBeCovered,
  EnrollmentResponseType,
  EnrollmentWaiverReason,
  Gender as EnrollmentGender,
  Relationship as EnrollmentRelationship
} from './models'

interface Props {
  group: Group
  user: User
  userMetadata?: UserMetadata
  groupMember: GroupMember
  dependents: Dependent[]
  consumerProfile?: ConsumerProfile
  application: EnrollmentApplicationForm
  next: () => void
}

type InputProps = (React.InputHTMLAttributes<HTMLInputElement> | React.TextareaHTMLAttributes<HTMLTextAreaElement>) & {
  question?: EnrollmentApplicationQuestion
  name: string
}

const formattedDate = (date?: Date): string | undefined => !date ? undefined : moment(date).format('YYYY-MM-DD')

const AllstateForm: React.FC<Props> = ({ application, group, user, userMetadata, groupMember, dependents, consumerProfile, next }) => {
  const [applicationForm] = useState(application)
  const { GeneralConditions: generalConditions, Questions: questions } = applicationForm
  const { register, handleSubmit, control, watch } = useForm({ defaultValues: defaultValues() })
  const watchAll = watch()
  const addToast = useToast()
  const allConditions = generalConditions?.map(gc => gc?.Conditions?.map(c => c.Code ? c.Code[0].toUpperCase() + c.Code.substr(1) : undefined)).flat()

  const Input: React.FC<InputProps> = ({ question, name, ...props }) => {
    if (!question) { return <></> }
    const { ResponseType: type, Description: description } = question

    // https://react-hook-form.com/api/#useFieldArray
    // It's important to apply ref={register()} instead of ref={register} when working with useFieldArray so register will get invoked during map.
    switch (type) {
    case EnrollmentResponseType.Text:
      return <input {...props as React.InputHTMLAttributes<HTMLInputElement>} ref={register()} type='text' placeholder={description || undefined} name={name} />
    case EnrollmentResponseType.TextArea:
      return <textarea {...props as React.TextareaHTMLAttributes<HTMLTextAreaElement>} ref={register()} placeholder={description || undefined} name={name} />
    case EnrollmentResponseType.Date:
      return <input {...props as React.InputHTMLAttributes<HTMLInputElement>} ref={register({ valueAsDate: true })} type='date' placeholder={description || undefined} name={name} />
    case EnrollmentResponseType.YesNo:
      return <input {...props as React.InputHTMLAttributes<HTMLInputElement>} ref={register()} type='checkbox' placeholder={description || undefined} name={name} />
    default: return <></>
    }
  }

  function defaultValues() {
    const defaultValues: any = {}

    if (!defaultValues.Members || !Array.isArray(defaultValues.Members)) {
      defaultValues.Members = []
    }

    function fillMember(member: any) {
      const firstName = member.first_name || member.name?.split(' ')?.[0]
      const lastName = member.last_name || member.name?.split(' ')?.[1]
      const birthDate = formattedDate(member.date_of_birth || member.dateOfBirth)

      defaultValues.Members!.push({
        BirthDate: birthDate,
        FirstName: firstName,
        LastName: lastName,
        Gender: member.gender === Gender.male ? EnrollmentGender.Male : member.gender === Gender.female ? EnrollmentGender.Female : undefined,
        Height: member.height,
        Weight: member.weight,
        IsWaived: groupMember.is_waived, // is_waived only applies to groupMember
        // FIXME this feels dirty using member.name to detect if `member` is a GroupMember
        MaritalStatus: member.name ? dependents.some(d => d.relationship === Relationship.spouse) ? EnrollmentMaritalStatus.Married : EnrollmentMaritalStatus.Single : undefined,
        Relationship: member.relationship ? member.relationship === Relationship.child ? EnrollmentRelationship.Child : EnrollmentRelationship.Spouse : EnrollmentRelationship.Employee,
        SocialSecurityNumber: ((member.ssn || user.ssn) as string).replaceAll(/[^0-9]+/g, ''),
        UsedTobacco: !!member.last_tobacco_use_date || !!member.lastUsedTobacco
      })
    }

    // Members
    fillMember(groupMember)
    dependents.forEach(fillMember)

    // EE Info
    let employeeStatus: EnrollmentEmployeeStatus | undefined

    switch (userMetadata?.taxWithholdingStatus) {
    case 0: // w2
      employeeStatus = EnrollmentEmployeeStatus.W2
      break
    case 1: // tenNinetyNine
      employeeStatus = EnrollmentEmployeeStatus.F1099
      break
    case 2: // ownerOrPartner
      employeeStatus = EnrollmentEmployeeStatus.OwnerPartner
      break
    }

    defaultValues.EmploymentInformation = {
      AverageHoursPerWeek: userMetadata?.hoursPerWeek,
      EmployeeStatus: employeeStatus,
      FullTimeDate: formattedDate(groupMember.hireDate),
      JobTitle: groupMember.jobTitle
    }

    // CoverageInformation
    defaultValues.CoverageInformation = {
      EnrollmentTypeDetails: null,
      ChildCount: dependents.filter(d => d.relationship === Relationship.child).length
    }

    // ContactInformation
    defaultValues.ContactInformation = {
      CellPhone: groupMember.phone_number?.replaceAll(/[^0-9]+/g, ''),
      Email: groupMember.email,
      HomeAddress: {
        AddressLine1: groupMember.address1,
        City: groupMember.city,
        // eslint-disable-next-line camelcase
        State: consumerProfile?.state_code,
        Zip: groupMember.zip_code
      },
      MailingAddress: {
        AddressLine1: userMetadata?.mailingAddress1 || groupMember.address1,
        City: userMetadata?.mailingCity || groupMember.city,
        // eslint-disable-next-line camelcase
        State: userMetadata?.mailingState || consumerProfile?.state_code,
        Zip: userMetadata?.mailingZIP || groupMember.zip_code
      }
    }

    // EmployerName
    defaultValues.EmployerName = group.name

    return defaultValues
  }

  function mapCodeToQuestion(code?: string | null): EnrollmentApplicationQuestion | undefined {
    return questions?.find((q) => q.Code === code)
  }

  async function onSubmit(data: any) {
    // NatGenAPI quirks dunno what to do about these really

    // Initialize MedicalHistory.Conditions with false values
    if (!data.MedicalHistory) {
      data.MedicalHistory = {
        Conditions: {}
      }
    }
    if (!data.MedicalHistory.Conditions) {
      data.MedicalHistory.Conditions = {}
    }
    allConditions?.forEach(c => c && (data.MedicalHistory.Conditions[c] = false))

    // HACK: bug in RHF nested checkbox values turn to arrays instead of booleans
    data.Members.forEach((m: any) => {
      Object.keys(m.Conditions).forEach(k => {
        Object.keys(m.Conditions[k].Responses).forEach(kj => {
          const q = mapCodeToQuestion(kj[0].toLowerCase() + kj.substr(1))
          if (q?.ResponseType === 'YesNo') {
            m.Conditions[k].Responses[kj] = Boolean(Array.isArray(m.Conditions[k].Responses[kj]) && m.Conditions[k].Responses[kj].length > 0)
          }
        })
      })
    })

    // Set MedicalHistory.Conditions based on Members conditions
    data.Members.forEach((m: any) => {
      Object.keys(m.Conditions).forEach(k => {
        if (Object.values(m.Conditions[k].Responses).filter(v => !!v).length > 0) {
          data.MedicalHistory.Conditions[k] = true
        }
      })
    })

    // Initialize Medications property
    data.Members.forEach((m: any) => {
      Object.keys(m.Conditions).forEach(k => {
        if (!m.Conditions[k].Medications) {
          m.Conditions[k].Medications = {
            Responses: []
          }
        }
      })
    })

    // Delete any Condition missing TreatmentDetails
    data.Members.forEach((m: any) => {
      Object.keys(m.Conditions).forEach(k => {
        for (const _j of Object.keys(m.Conditions[k].Responses)) {
          if (!m.Conditions[k].Responses?.TreatmentDetails || m.Conditions[k].Responses?.TreatmentDetails === '' || m.Conditions[k].Responses?.TreatmentDetails.length < 1) {
            delete m.Conditions[k]
            break
          }
        }
      })
    })

    // Nullify EnrollmentTypeDetails
    if (data.CoverageInformation?.EnrollmentTypeDetails === '') {
      data.CoverageInformation.EnrollmentTypeDetails = null
    }

    return api.v3.integrations.natgen.groups(groupMember.group_id).application.POST(data as EnrollmentApplication)
      .then(next)
      .catch(addToast)
  }

  function additionalInsuranceInformation() {
    return <div className={styles.additionalInsuranceInformation}>
      <label>Has Additional Insurance:
        <input ref={register} type='checkbox' name='AdditionalInsuranceInformation.HasAdditionalInsurance' />
      </label>
      <label>Has Medicare:
        <input ref={register} type='checkbox' name='AdditionalInsuranceInformation.HasMedicare' />
      </label>
      <label>Will Medicare Remain Active:
        <input ref={register} type='checkbox' name='AdditionalInsuranceInformation.WillMedicareRemainActive' />
      </label>
      <label>Carrier Name:
        <input ref={register} type='text' name='AdditionalInsuranceInformation.CarrierName' />
      </label>
      <label>Id And Group Number:
        <input ref={register} type='text' name='AdditionalInsuranceInformation.IdAndGroupNumber' />
      </label>
    </div>
  }

  function contactInformation() {
    function address(prefix: string) {
      return <div className={styles.address}>
        <label>Address Line 1
          <input ref={register} type='text' name={`ContactInformation.${prefix}.AddressLine1`} />
        </label>
        <label>City
          <input ref={register} type='text' name={`ContactInformation.${prefix}.City`} />
        </label>
        <label>State
          <input ref={register} type='text' name={`ContactInformation.${prefix}.State`} />
        </label>
        <label>Zip
          <input ref={register} type='text' name={`ContactInformation.${prefix}.Zip`} />
        </label>
      </div>
    }
    return <>
      <div className={styles.contactInformation}>
        <label>Email
          <input ref={register} type='text' name='ContactInformation.Email' />
        </label>
        <label>Cell Phone
          <input ref={register} type='text' name='ContactInformation.CellPhone' />
        </label>
        <label>Home Phone
          <input ref={register} type='text' name='ContactInformation.HomePhone' />
        </label>
        <label>Work Phone
          <input ref={register} type='text' name='WorkPhone' />
        </label>
      </div>
      <details>
        <summary>Home Address</summary>
        {address('HomeAddress')}
      </details>
      <details>
        <summary>Mailing Address</summary>
        {address('MailingAddress')}
      </details>
    </>
  }

  function coverageInformation() {
    return <div className={styles.coverageInformation}>
      <label>Child Count
        <input ref={register({ valueAsNumber: true })} type='number' min='0' name='CoverageInformation.ChildCount' />
      </label>
      <label>Enrollment Type
        <select ref={register}name='CoverageInformation.EnrollmentType'>
          {$enum(EnrollmentEnrollmentType).getValues().map((t, i) => <option key={i} value={t}>{startCase(t)}</option>)}
        </select>
      </label>
      <label>Enrollment Type Details
        <input ref={register} type='text' name='CoverageInformation.EnrollmentTypeDetails' required />
      </label>
      <label>Persons To Be Covered
        <select ref={register}name='CoverageInformation.PersonsToBeCovered'>
          {$enum(EnrollmentPersonsToBeCovered).getValues().map((t, i) => <option key={i} value={t}>{startCase(t)}</option>)}
        </select>
      </label>
      {watchAll?.CoverageInformation?.EnrollmentType === EnrollmentEnrollmentType.Waiver &&
        <>
          <label>Waiver Reason
            <select ref={register} name='CoverageInformation.WaiverReason'>
              {$enum(EnrollmentWaiverReason).getValues().map((t, i) => <option key={i} value={t}>{startCase(t)}</option>)}
            </select>
          </label>
          <label>Waiver Reason Details
            <input ref={register} type='text' name='CoverageInformation.WaiverReasonDetails' />
          </label>
        </>
      }
    </div>
  }

  function employmentInformation() {
    return <div className={styles.employmentInformation}>
      <label>Job Title:
        <input ref={register} type='text' name='EmploymentInformation.JobTitle' />
      </label>
      <label>Average Hours Per Week
        <input ref={register({ valueAsNumber: true })} type='number' min='0' name='EmploymentInformation.AverageHoursPerWeek' />
      </label>
      <label>Cobra Effective Date
        <input ref={register({ valueAsDate: true })} type='date' name='EmploymentInformation.CobraEffectiveDate' />
      </label>
      <label>Earnings Basis
        <select ref={register} name='EmploymentInformation.EarningsBasis'>
          {$enum(EnrollmentEarningsBasis).getValues().map((t, i) => <option key={i} value={t}>{startCase(t)}</option>)}
        </select>
      </label>
      <label>Employment Status
        <select ref={register} name='EmploymentInformation.EmploymentStatus'>
          {$enum(EnrollmentEmploymentStatus).getValues().map((t, i) => <option key={i} value={t}>{startCase(t)}</option>)}
        </select>
      </label>
      <label>Employee Status
        <select ref={register}name='EmploymentInformation.EmployeeStatus'>
          {$enum(EnrollmentEmployeeStatus).getValues().map((t, i) => <option key={i} value={t}>{startCase(t)}</option>)}
        </select>
      </label>
      <label>Full Time Date
        <input ref={register({ valueAsDate: true })} type='date' name='EmploymentInformation.FullTimeDate' />
      </label>
    </div>
  }

  function medicalHistory() {
    return <div className={styles.medicalHistory}>
      <label>Advised Of Future Treatment
        <input ref={register} type='checkbox' name='MedicalHistory.AdvisedOfFutureTreatment' />
      </label>
      <label>Advised Of Medication
        <input ref={register} type='checkbox' name='MedicalHistory.AdvisedOfMedication' />
      </label>
      <label>Diagnosed Or Treated Other
        <input ref={register} type='checkbox' name='MedicalHistory.DiagnosedOrTreatedOther' />
      </label>
      <label>Additional Details
        <input ref={register} type='text' name='MedicalHistory.AdditionalDetails' />
      </label>
    </div>
  }

  function memberConditions(prefix: string) {
    return <>
      {generalConditions?.map((condition: EnrollmentApplicationGeneralCondition, idx) => {
        const { Description: description, Conditions: conditions } = condition
        return <details key={idx}>
          <summary>{description}</summary>
          {conditions?.map((specCondition, sidx) => {
            const { Code: specCode, Description: specDesc, Questions: specQuestions, RxQuestions: specRxQuestions } = specCondition
            const rxBaseName = `${prefix}.Conditions.${specCode ? specCode![0].toUpperCase() + specCode!.substr(1) : undefined}.Medications.Responses`
            const { fields: rxFields, append, remove } = useFieldArray({
              control,
              name: rxBaseName
            })
            return <article key={sidx}>
              <h3>{specDesc}</h3>
              <div className={styles.conditionQuestions}>
                {specQuestions?.map((sQuestion, index) => {
                  const { Code: sCode } = sQuestion
                  const question = mapCodeToQuestion(sCode)
                  const name = `${prefix}.Conditions.${specCode ? specCode![0].toUpperCase() + specCode!.substr(1) : undefined}.Responses.${question?.Code ? question!.Code[0].toUpperCase() + question!.Code.substr(1) : undefined}`
                  return <label key={index} style={{ display: 'block' }}>{question?.Description}
                    <Input name={name} question={question} required={question?.Code === 'TreatmentDetails'} defaultValue=''/>
                  </label>
                })}
              </div>
              <h4>Medications</h4>
              {rxFields.map((rxField, index) => {
                return <details key={`${rxField.id}[${index}]`} open>
                  <summary className={styles.conditionMedicationsHeader}>
                    Medication #{index + 1}
                    <input type='button' className={styles.remove} onClick={() => remove(index)} value='Remove' />
                  </summary>
                  <div className={styles.conditionMedications}> {
                    specRxQuestions?.map(rx => {
                      const { Code: sCode } = rx
                      const question = mapCodeToQuestion(sCode)
                      return <label key={`${rxField.id}[${index}].${sCode}`}>{question?.Description}
                        <Input name={`${rxBaseName}[${index}].${sCode}`} question={question} defaultValue={rxField[sCode as string]}/>
                      </label>
                    })
                  } </div>
                </details>
              })}
              <input type='button' className={styles.add} onClick={() => append({})} value='Add Medication' />
            </article>
          })}
        </details>
      })}
    </>
  }

  function members() {
    return [groupMember, ...dependents].map((m: any, idx) => {
      return <details key={idx}>
        <summary>{m.name ? m.name : `${m.firstName || m.first_name} ${m.lastName || m.last_name}`}</summary>
        <div className={styles.memberName}>
          <label>First Name
            <input ref={register()} type='text' name={`Members[${idx}].FirstName`} />
          </label>
          <label>Middle Initial
            <input ref={register()} type='text' name={`Members[${idx}].MiddleInitial`} />
          </label>
          <label>Last Name
            <input ref={register()} type='text' name={`Members[${idx}].LastName`} />
          </label>
        </div>
        <div className={styles.memberSpecs}>
          <label>Gender
            <select ref={register()}name={`Members[${idx}].Gender`}>
              {$enum(EnrollmentGender).getValues().map((v, i) => <option key={i} value={v}>{v}</option>)}
            </select>
          </label>
          <label>Height
            <input ref={register({ valueAsNumber: true })} type='number' min='0' name={`Members[${idx}].Height`} />
          </label>
          <label>Weight
            <input ref={register({ valueAsNumber: true })} type='number' min='0' name={`Members[${idx}].Weight`} />
          </label>
        </div>
        <div className={styles.memberAbout}>
          <label>Birth Date
            <input ref={register({ valueAsDate: true })} type='date' name={`Members[${idx}].BirthDate`} />
          </label>
          <label>Marital Status
            <select ref={register()}name={`Members[${idx}].MaritalStatus`}>
              {$enum(EnrollmentMaritalStatus).getValues().map((v, i) => <option key={i} value={v}>{startCase(v)}</option>)}
            </select>
          </label>
          <label>Relationship
            <select ref={register()}name={`Members[${idx}].Relationship`}>
              {$enum(EnrollmentRelationship).getValues().map((v, i) => <option key={i} value={v}>{startCase(v)}</option>)}
            </select>
          </label>
          <label>Social Security Number
            <input ref={register()} type='text' name={`Members[${idx}].SocialSecurityNumber`} />
          </label>
        </div>
        <div className={styles.memberMisc}>
          <label>Is Waived
            <input ref={register()} type='checkbox' name={`Members[${idx}].IsWaived`} />
          </label>
          <label>Used Tobacco
            <input ref={register()} type='checkbox' name={`Members[${idx}].UsedTobacco`} />
          </label>
          <label>Has Additional Insurance
            <input ref={register()} type='checkbox' name={`Members[${idx}].HasAdditionalInsurance`} />
          </label>
          <label>Has Medicare
            <input ref={register()} type='checkbox' name={`Members[${idx}].HasMedicare`} />
          </label>
        </div>
        <details>
          <summary>Conditions</summary>
          {memberConditions(`Members[${idx}]`)}
        </details>
      </details>
    })
  }

  function authorization() {
    return <div className={styles.authAndSignature}>
      <label>Agree To Authorization
        <input ref={register} type='checkbox' name='AgreedToAuthorization' required={watchAll.CoverageInformation.EnrollmentType !== EnrollmentEnrollmentType.Waiver} />
      </label>
      <label>Agree To Federal Mandate
        <input ref={register} type='checkbox' name='AgreedToFederalMandate' />
      </label>
      <label>Employer Name
        <input ref={register} type='text' name='EmployerName' />
      </label>
      <label>Signature
        <input ref={register} type='text' name='Signature' required/>
      </label>
    </div>
  }

  function enrollmentApplication() {
    return <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
      <details>
        <summary>Additional Insurance Information:</summary>
        {additionalInsuranceInformation()}
      </details>
      <details>
        <summary>Contact Information:</summary>
        {contactInformation()}
      </details>
      <details>
        <summary>Coverage Information:</summary>
        {coverageInformation()}
      </details>
      <details>
        <summary>Employment Information:</summary>
        {employmentInformation()}
      </details>
      <details>
        <summary>Medical History:</summary>
        {medicalHistory()}
      </details>
      <details>
        <summary>Members</summary>
        {members()}
      </details>
      <details>
        <summary>Authorization and Signature</summary>
        {authorization()}
      </details>
      <input type='submit' value='Submit' />
    </form>
  }

  return enrollmentApplication()
}

export default AllstateForm
