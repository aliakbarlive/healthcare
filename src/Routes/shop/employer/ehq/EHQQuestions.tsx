/* eslint-disable camelcase */
import React from 'react'
import Select from 'Components/Rudimentary/Select'
import styles from './EHQQuestions.module.scss'
import Input from 'Components/Rudimentary/CandorInput'
import { FormProvider, useForm } from 'react-hook-form'
import useToast from 'Utilities/Hooks/useToast'
import useContentAdjustment from 'Utilities/Hooks/useContentAdjustment'
import * as api from 'Utilities/pharaoh'

interface Props {
  groupID: string
  callback?: () => void
}

const EHQQuestions: React.FC<Props> = props => {
  const form = useForm()
  const { handleSubmit, watch, register } = form
  const best_of_knowledge = watch('best_of_knowledge', 'true')
  const five_days_out = watch('five_days_out', 'false')
  const serious_disorder = watch('serious_disorder', 'false')
  const shock_loss = watch('shock_loss', 'false')
  const hospitalization = watch('hospitalization', 'false')
  const surgery = watch('surgery', 'false')
  const injury = watch('injury', 'false')
  const pregnancy = watch('pregnancy', 'false')
  const addToast = useToast()
  useContentAdjustment({ paddingTop: 0 })

  return <div className={styles.formContainer} >
    <FormProvider {...form}>
      <div className={styles.applicationComponent}>
        <h1>Employer Health Questionnaire</h1>
        <form autoComplete="off" onSubmit={handleSubmit(onSubmit)}>

          <p>Number of employees currently enrolled in your health insurance:</p>
          <Input name="current_enrolled" required />

          <p>Employer Plan Sponsor-Responsible Party Name:</p>
          <Input name="responsible_party" required />

          <p>Employer Plan Sponsor-Responsible Party Email:</p>
          <Input name="responsible_party_email" required />

          <p>I will answer the following questions for all plan participants and dependents to be covered under this health insurance coverage to the best of my knowledge.</p>
          <Select name="best_of_knowledge" required options={[
            { value: 'true', label: 'Yes' },
            { value: 'false', label: 'No' }
          ]} />

          { best_of_knowledge === 'false' && <>
            <p>If no, please explain:</p>
            <textarea className={styles.candorInput} name="best_of_knowledge_explanation" ref={register} required />
          </>}

          <p>Has anyone missed more than five consecutive workdays in the last 12 months due to injury or illness by them or their dependents?</p>
          <Select name="five_days_out" required options={[
            { value: 'true', label: 'Yes' },
            { value: 'false', label: 'No' }
          ]} />

          { five_days_out === 'true' && <>
            <p>If yes, please explain:</p>
            <textarea className={styles.candorInput} name="five_days_out_explanation" ref={register} required />
          </>}

          <p>Has anyone been treated in the past five years or anticipate being treated for a serious illness, immune system disorder, hemophilia, cancer, heart disorder/disease, Hepatitis C, kidney, or organ or tissue disorder/transplant, stroke, AIDS/ARC, type 1 diabetes, mental or nervous disorder, substance abuse or other accident/injury?</p>
          <Select name="serious_disorder" required options={[
            { value: 'true', label: 'Yes' },
            { value: 'false', label: 'No' }
          ]} />

          { serious_disorder === 'true' && <>
            <p>If yes, please explain:</p>
            <textarea className={styles.candorInput} name="serious_disorder_explanation" ref={register} required />
          </>}

          <p>Are there other known potential Shock Loss Claims and/or have any plan participant (employee or dependents) incurred $10,000 or more in accident and/or health and Rx claims within the last 12 months?</p>
          <Select name="shock_loss" required options={[
            { value: 'true', label: 'Yes' },
            { value: 'false', label: 'No' }
          ]} />

          { shock_loss === 'true' && <>
            <p>If yes, please explain:</p>
            <textarea className={styles.candorInput} name="shock_loss_explanation" ref={register} required />
          </>}

          <p>Are there any employees, spouses or dependents who are disabled, or confined in a hospital or treatment facility, or have been pre-certified within the last three months to have an upcoming procedure or treatment, or any employees who are on leave of absence to care for a dependent who will be a plan participant of this health plan? (For employees, disabled means absent from work and/or on leave of absence or Family and Medical Leave Act [FMLA] benefits due to his or her medical condition; for dependents, disabled means unable to perform his or her normal functions of a person of like age.</p>
          <Select name="hospitalization" required options={[
            { value: 'true', label: 'Yes' },
            { value: 'false', label: 'No' }
          ]} />

          { hospitalization === 'true' && <>
            <p>If yes, please explain:</p>
            <textarea className={styles.candorInput} name="hospitalization_explanation" ref={register} required />
          </>}

          <p>Has anyone within the last six months been advised to have surgery or does anyone anticipate hospitalization or treatment/outpatient procedure for any other reason?</p>
          <Select name="surgery" required options={[
            { value: 'true', label: 'Yes' },
            { value: 'false', label: 'No' }
          ]} />

          { surgery === 'true' && <>
            <p>If yes, please explain:</p>
            <textarea className={styles.candorInput} name="surgery_explanation" ref={register} required />
          </>}

          <p>Are there any employees who are not performing his or her normal duties due to illness or injury?</p>
          <Select name="injury" required options={[
            { value: 'true', label: 'Yes' },
            { value: 'false', label: 'No' }
          ]} />

          { injury === 'true' && <>
            <p>If yes, please explain:</p>
            <textarea className={styles.candorInput} name="injury_explanation" ref={register} required />
          </>}

          <p>Are any employees or their dependents pregnant and/or considered to be high risk for complications of pregnancy, or carrying multiple fetuses?</p>
          <Select name="pregnancy" required options={[
            { value: 'true', label: 'Yes' },
            { value: 'false', label: 'No' }
          ]} />

          { pregnancy === 'true' && <>
            <p>If yes, please explain:</p>
            <textarea className={styles.candorInput} name="pregnancy_explanation" ref={register} required />
          </>}

          <div className={styles.twoCol} style={{ marginTop: '3em' }}>
            <input className={styles.nextButton} type='submit' value='Submit' />
          </div>
        </form>
      </div>
    </FormProvider>
  </div>

  function onSubmit(data: any) {
    const keys = ['best_of_knowledge',
      'five_days_out',
      'serious_disorder',
      'shock_loss',
      'hospitalization',
      'surgery',
      'injury',
      'pregnancy'
    ]

    for (const key of keys) {
      if (!data[key]) {
        addToast(`Missing answer for ${key}`, 'error')
        return
      }

      data[key] = data[key] === 'true'
    }

    api.v3.groups(props.groupID).ehq.POST({ ...data, group_id: props.groupID }).then(props.callback).catch(addToast)
  }
}

export default EHQQuestions
