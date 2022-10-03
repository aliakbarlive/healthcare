import React from 'react'
import styles from './index.module.scss'
import { useAsync } from 'react-use'
import * as api from 'Utilities/pharaoh'
import Loader from 'Components/Rudimentary/Loader'
import Error from 'Components/Primitives/Error'
import { PrivateWizardPageProps } from 'Components/Stargate/Wizard/WizardRoute'
import usePersistableForm from 'Utilities/Hooks/usePersistableForm'
import { startCase } from 'lodash'
import CandorInput from 'Components/Rudimentary/CandorInput'
import Select from 'Components/Rudimentary/Select'
import CandorSwitch from 'Components/Rudimentary/CandorSwitch'

interface Drug {
  name: string
}

interface Answer {
  uuid: string
  text: string
}

interface HealthQuestion {
  text: string
  uuid: string
  state: string
  answers: Answer[]
}

interface HealthAnswers {
  id: string
  answers: Answer[]
  prescriptions: {name: string}[]
  procedures?: string
  voluntaryExclusions?: string
}

enum HealthQuestionType {
  prescriptions = 'prescriptions',
  procedures = 'procedures',
  voluntaryExclusions = 'voluntaryExclusions'
}

interface SidecarFormProps {
  questions: HealthQuestion[]
  answers: HealthAnswers[]
}

const SidecarForm: React.FC<PrivateWizardPageProps & SidecarFormProps> = ({ stargate, questions, answers, onwards }) => {
  const { group, groupMember: member, dependents } = stargate
  const { register, handleSubmit, control } = usePersistableForm('sidecarUnderwriting', { defaultValues: defaultValues() })

  function onsubmit(data: any) {
    const ids = [member!.id, ...(dependents?.map(dep => dep.id) || [])]
    const payload = ids.map(id => {
      const q = data[id]
      const prescriptions: string[] = q.prescriptions || []
      const procedures: string | undefined = q.procedures
      const voluntaryExclusions: string | undefined = q.voluntaryExclusions
      const answers = questions.flatMap(q => q.answers)
      return {
        id,
        answers: Object.keys(q)
          .filter(key => !['prescriptions', 'procedures', 'voluntaryExclusions'].includes(key) && q[key] === true)
          .map(key => answers.find(a => a.uuid === key)),
        prescriptions: prescriptions.map(drug => ({ name: drug })) as Drug[],
        procedures,
        voluntaryExclusions
      }
    })
    onwards(api.v3.integrations.sidecar.group(group!.id).questions.POST(payload))
  }

  function defaultValues() {
    if (!answers.length) return {}
    const defaultValues: any = {}
    answers.forEach(a => {
      defaultValues[a.id] = {}
      a.answers.forEach(b => { defaultValues[a.id][b.uuid] = true })
      defaultValues[a.id].prescriptions = a.prescriptions.map(p => p.name)
      defaultValues[a.id].procedures = a.procedures
      defaultValues[a.id].voluntaryExclusions = a.voluntaryExclusions
    })
    return defaultValues
  }

  function renderQuestion(question: HealthQuestion) {
    const { answers, text, uuid } = question
    let qType: HealthQuestionType | undefined

    if (/prescriptions/.test(text)) {
      qType = HealthQuestionType.prescriptions
    } else if (/exclude/.test(text)) {
      qType = HealthQuestionType.voluntaryExclusions
    } else if (/(procedures?|medical devices?)/.test(text)) {
      qType = HealthQuestionType.procedures
    }

    function render() {
      // Multi-choice questions (checkbox)
      if (answers && answers.length > 0) {
        return answers.map((answer) => {
          const { text: aText, uuid: aUuid } = answer
          return <div key={aUuid}>
            <p>{aText}</p>
            <div className={styles.checkboxes}>
              <label>
                <span>{member?.name} (Employee)</span>
                <CandorSwitch name={`${member!.id}.${aUuid}`} control={control}/>

              </label>
              {dependents?.map((dep, didx) => {
                const { firstName, lastName, relationship } = dep
                return <label key={`${uuid}.${aUuid}.${didx + 1}`}>
                  <span>{firstName} {lastName} ({startCase(relationship)})</span>
                  <CandorSwitch name={`${dep.id}.${aUuid}`} control={control}/>
                </label>
              })}
            </div>
          </div>
        })
      } else { // Text questions
        const wrapper = () => {
          const loadPrescriptions = (input: string) => {
            if (!input) return Promise.resolve([])
            return api.v3.integrations.sidecar.drugs(input).then((drugs: string[]) => drugs.map(drug => ({ value: drug, label: startCase(drug.toLowerCase()) }))).catch(() => ([]))
          }

          switch (qType) {
          case HealthQuestionType.prescriptions: {
            const noOptionsMessageCopy = (state: { inputValue: string }) =>
              !state.inputValue ? 'Please type the name of your prescription' : 'No results'

            return <>
              <Select
                control={control}
                cacheOptions={true}
                name={`${member!.id}.${qType}`}
                loadOptions={loadPrescriptions}
                isMulti
                noOptionsMessage={noOptionsMessageCopy}
                placeholder={`${member?.name} (Primary subscriber)`}
              />
              { dependents?.map((dep, didx) => {
                const { firstName, lastName, relationship } = dep
                return <Select
                  key={`${uuid}.${didx + 1}`}
                  control={control}
                  cacheOptions={true}
                  name={`${dep.id}.${qType}`}
                  loadOptions={loadPrescriptions}
                  isMulti
                  noOptionsMessage={noOptionsMessageCopy}
                  placeholder={`${firstName} ${lastName} (${startCase(relationship)})`}
                />
              })}
            </>
          }
          case HealthQuestionType.procedures:
          case HealthQuestionType.voluntaryExclusions:
          default:
            return <>
              <CandorInput ref={register} placeholder={`${member?.name} (Primary subscriber)`} name={`${member!.id}.${qType || uuid}`} type='text' />
              { dependents?.map((dep, didx) => {
                const { firstName, lastName, relationship } = dep
                return <CandorInput key={`${uuid}.${didx + 1}`} ref={register} placeholder={`${firstName} ${lastName} (${startCase(relationship)})`} name={`${dep.id}.${qType || uuid}`} type='text' />
              })}
            </>
          }
        }
        return <div className={styles.flat}>
          {wrapper()}
        </div>
      }
    }

    return <div key={uuid}>
      <p>{text}</p>
      {render()}
    </div>
  }

  return <div className={styles.mainContainer}>
    <header className={styles.header}>
      <h1 className='shop-h1-periwinkle'>Medical History</h1>
      <h2 className='shop-h2-navy'>Have you or any of your dependents received treatment, testing, consulted with or received a diagnosis from a physician or provider for any of the following within the past 5 years?</h2>
    </header>
    <form onSubmit={handleSubmit(onsubmit)} className={styles.form}>
      {questions?.map(renderQuestion)}
      <input type='submit' value='Next'/>
    </form>
  </div>
}

const EEShopMedical: React.FC<PrivateWizardPageProps> = ({ stargate, onwards }) => {
  const { group, groupMember } = stargate
  const async = useAsync(async() => {
    const questions = await api.v3.integrations.sidecar.group(group!.id).questions.GET().catch(onwards)
    const answers = await api.v3.integrations.sidecar.member(groupMember?.id).history.GET()
    return { questions, answers }
  })

  if (async.error) return <Error error={async.error!} />
  if (async.loading) return <Loader />

  return <SidecarForm
    stargate={stargate}
    onwards={() => onwards(Promise.resolve(stargate.config.showExistingCoverageChapter))}
    questions={async.value?.questions || []}
    answers={async.value?.answers || []}
  />
}

export default EEShopMedical
