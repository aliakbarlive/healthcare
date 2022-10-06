import React, { useState } from 'react'
import styles from 'Components/Stargate/Underwriting/Underwriting.module.scss'
import { ErrorMessage } from '@hookform/error-message'
import usePersistableForm from 'Utilities/Hooks/usePersistableForm'
import CandorInput from 'Components/Rudimentary/CandorInput'
import CandorSwitch from 'Components/Rudimentary/CandorSwitch'
import { CandorDatePicker } from 'Components/Anubis/CandorForm'
import _ from 'lodash'
import moment from 'moment'
import { useToggle } from 'react-use'
import useToast from 'Utilities/Hooks/useToast'
import NextButton, { ButtonStates } from 'Components/Stargate/NextButton/NextButton'

const alphaIndex: (index: number) => string = (index: number) => 'abcdefghijklmnopqrstuvwxyz'.charAt(index % 26)

/* Possible returned event values from docusign
 * access_code_failed: Recipient used incorrect access code.
 * cancel: Recipient canceled the signing operation, possibly by using the Finish Later option.
 * decline: Recipient declined to sign.
 * exception: A system error occurred during the signing process.
 * fax_pending: Recipient has a fax pending.
 * id_check_failed: Recipient failed an ID check.
 * session_timeout: The session timed out. An account can control this timeout by using the Signer Session Timeout option.
 * signing_complete: The recipient completed the signing ceremony.
 * ttl_expired: The Time To Live token for the envelope has expired. After being successfully invoked, these tokens expire after 5 minutes or if the envelope is voided.
 * viewing_complete: The recipient completed viewing an envelope that is in a read-only/terminal state, such as completed, declined, or voided.
 */
export enum ReturnEvent {
  ACCESS_CODE_FAILED = 'access_code_failed',
  CANCEL = 'cancel',
  DECLINE = 'decline',
  EXCEPTION = 'exception',
  FAX_PENDING = 'fax_pending',
  ID_CHECK_FAILED = 'id_check_failed',
  SESSION_TIMEOUT = 'session_timeout',
  SIGNING_COMPLETE = 'signing_complete',
  TTL_EXPIRED = 'ttl_expired',
  VIEWING_COMPLETE = 'viewing_complete'
}

enum RecipientTabs {
  checkboxTabs = 'checkboxTabs',
  dateTabs = 'dateTabs',
  radioGroupTabs = 'radioGroupTabs',
  textTabs = 'textTabs',
  ssnTabs = 'ssnTabs',
  tabGroups = 'tabGroups'
}

enum TabGroupRules {
  selectAtLeast = 'SelectAtLeast',
  selectAtMost = 'SelectAtMost',
  selectExactly = 'SelectExactly',
  selectARange = 'SelectARange'
}

interface Props {
  id: string
  envelope: any
  onSubmit: (envelope: any) => Promise<any>
}

const DocuSignForm: React.FC<Props> = ({ id, envelope: envelope_, onSubmit }) => {
  const [buttonState, setButtonState] = useState<ButtonStates>('')
  const [disabled, setDisabled] = useToggle(false)
  const [envelope, setEnvelope] = useState<any>(envelope_)
  const { register, handleSubmit, watch, control, errors } = usePersistableForm(`underwriting-${id}`)
  const addToast = useToast()
  const watchTabs = watch()

  async function onDSSubmit(data: any) {
    setButtonState('loading')
    setDisabled(true)
    const updatedTabs = _.chain(allTabs.map((tab: any) => {
      const tabLabel = tab?.tabLabel || tab?.groupName || tab?.groupLabel
      if (!tabLabel) {
        return tab
      }

      switch (tab.tabKey) {
      case RecipientTabs.radioGroupTabs:
        tab.radios = tab.radios.map((radio: any) => {
          radio.selected = (data[tabLabel] === radio.value).toString()
          radio.locked = (!!data[tabLabel]).toString()
          return radio
        })
        break
      case RecipientTabs.textTabs:
      case RecipientTabs.ssnTabs:
        if (data[tabLabel] !== undefined) {
          tab.value = data[tabLabel]
          tab.locked = (!!data[tabLabel]).toString()
        }
        break
      case RecipientTabs.dateTabs:
        if (data[tabLabel]) {
          const dateFormat = extractPlaceholder(tab)?.toUpperCase() // moment expects uppercase for its date format
          tab.value = moment.utc(data[tabLabel]).format(dateFormat || 'MM/DD/YYYY').toString()
          tab.locked = (!!data[tabLabel]).toString()
        }
        break
      case RecipientTabs.checkboxTabs:
        // FIXME: cannot lock checkboxes that belong to a tabGroup due to DocuSign issue https://stackoverflow.com/a/60857220/10913628
        if (tab.tabGroupLabels) {
          tab.selected = (!!data[tab.tabGroupLabels[0]]?.includes(tab.name)).toString()
        } else {
          tab.selected = (!!data[tabLabel]).toString()
        }
        // tab.locked = true.toString()
        break
      }

      return tab
    })).groupBy('tabKey').value()

    envelope.recipients.signers[0].tabs = updatedTabs

    setEnvelope(envelope)

    try {
      const rsp = await onSubmit(envelope)
      if (rsp.docuSignUrl) {
        window.open(rsp.docuSignUrl, '_self')
      }
      setButtonState('success')
    } catch (error) {
      setButtonState('error')
      addToast(error)
    } finally {
      setDisabled(false)
    }
  }

  const extractPlaceholder = (tab: any) => {
    const pattern = new RegExp(/^.*\((.*)\)\s*:?\s*$/) // captures the content of the last pair of parentheses
    const tooltip = tab?.name || tab?.tooltip
    if (tooltip) {
      const match = tooltip.match(pattern)
      return match?.length > 1 ? match[1] : undefined
    }
  }

  // FIXME: implement DocuSign typing
  const recipients: any = envelope?.recipients
  const signers = recipients?.signers || []
  const { tabs } = signers[0]

  function mapTabToQuestion(tab: any, index: number, subIndex?: number): any {
    const { tabKey, tabId, validationPattern, validationMessage, value } = tab
    const tabLabel = tab?.tabLabel || tab?.groupName || tab?.groupLabel // radioGroupTab uses `groupName` for its tabLabel, tabGroups uses `groupLabel`
    const tabName = tab?.name || tab?.tooltip // radioGroupTab uses `tooltip` while everything else use `name` for tooltip
    const radios = tab?.radios
    const required = tab?.required?.toLowerCase() === 'true' || !!radios?.find((r: any) => r?.required === 'true')

    const qindex = `${index + 1}${subIndex || subIndex === 0 ? alphaIndex(subIndex) : ''}`
    const question = `${qindex}. ${tabName || tabLabel || tabId || '(question missing)'}${required ? ' *' : ''}`

    const render = () => {
      switch (tabKey) {
      case RecipientTabs.textTabs:
      case RecipientTabs.ssnTabs:
        return <>
          <label>
            <span>{question}</span>
            <CandorInput
              ref={register({
                required: {
                  value: required,
                  message: 'This field is required.'
                },
                pattern: {
                  value: new RegExp(validationPattern),
                  message: validationMessage
                }
              })}
              name={tabLabel}
              placeholder={extractPlaceholder(tab)}
              defaultValue={tab?.value}
              type={'text'}
            />
            <ErrorMessage errors={errors} name={tabLabel} />
          </label>
        </>
      case RecipientTabs.dateTabs:
      {
        const datePlaceholder = extractPlaceholder(tab)
        const dateFormat = datePlaceholder?.replace('mm', 'MM') // react-datepicker format
        return <label>
          <span>{question}</span>
          <CandorDatePicker
            control={control}
            name={tabLabel}
            value={watchTabs[tabLabel] || tab?.value ? moment.utc(tab.value).format(dateFormat?.toUpperCase() || 'MM/DD/YYYY').toString() : undefined}
            required={tab?.required === 'true'}
            placeholder={datePlaceholder}
            dateFormat={dateFormat}
          />
        </label>
      }
      case RecipientTabs.checkboxTabs:
        if (tab.tabGroupLabels && tab.tabGroupLabels.length > 0) {
          return null
        } else {
          return <label>
            <span>{question}</span>
            {/* May be broken. Used to return true/false as a string but is now returning the boolean value. */}
            <CandorSwitch
              name={tabLabel}
              control={control}
              defaultValue={tab?.selected}
            />
            <ErrorMessage errors={errors} name={tabLabel} />
          </label>
        }
      case RecipientTabs.radioGroupTabs:
        return <div key={tabLabel}>
          <p>{question}</p>
          {radios?.map((option: any, index: number) => {
            const key = `${tabLabel}.${index}`
            return <div key={key} className={styles.radio}>
              <input
                ref={register({
                  required: {
                    value: option?.required === 'true',
                    message: 'This field is required.'
                  }
                })}
                id={key}
                name={tabLabel}
                type={'radio'}
                defaultChecked={option?.selected === 'true'}
                value={option?.value}
              />
              <label htmlFor={key}>{` ${option?.value}`}</label>
            </div>
          })}
          <ErrorMessage errors={errors} name={tabLabel} />
        </div>
      case RecipientTabs.tabGroups:
      {
        const groupQuestion = `${qindex}. ${validationMessage}`
        const checkboxes = allTabs.filter((t: any) => t.tabKey === RecipientTabs.checkboxTabs && t.tabGroupLabels?.includes(tabLabel))
        const selectedCbs = checkboxes?.filter((cb: any) => cb.selected === 'true')
        const selectedCbsCount = (watchTabs[tabLabel] || selectedCbs).length || 0
        const { minimumRequired, maximumAllowed, groupRule } = tab
        return checkboxes?.length > 0 && <div key={tabLabel}>
          <span>{groupQuestion}</span>
          {checkboxes.map((cb: any) => {
            const key = cb.tabLabel
            return <div key={key}>
              <input
                ref={register({
                  validate: () => {
                    const minRequired = parseInt(minimumRequired)
                    const maxAllowed = parseInt(maximumAllowed)
                    switch (groupRule) {
                    case TabGroupRules.selectExactly:
                      if (selectedCbsCount !== minRequired) {
                        return `You must ${_.startCase(groupRule).toLowerCase()} ${minRequired} option${minRequired > 1 ? 's' : ''}.`
                      }
                      break
                    case TabGroupRules.selectAtMost:
                      if (selectedCbsCount > maxAllowed) {
                        return `You can ${_.startCase(groupRule).toLowerCase()} ${maxAllowed} option${maxAllowed > 1 ? 's' : ''}.`
                      }
                      break
                    case TabGroupRules.selectAtLeast:
                      if (selectedCbsCount < minRequired) {
                        return `You must ${_.startCase(groupRule).toLowerCase()} ${minRequired} option${minRequired > 1 ? 's' : ''}.`
                      }
                      break
                    case TabGroupRules.selectARange:
                      if (selectedCbsCount > maxAllowed || selectedCbsCount < minRequired) {
                        return `You must ${_.startCase(groupRule).toLowerCase()} within ${minimumRequired} and ${maximumAllowed}.`
                      }
                      break
                    }
                  }
                })}
                id={key}
                name={tabLabel}
                type={'checkbox'}
                defaultChecked={cb?.selected === 'true'}
                value={cb?.name}
              />
              <label htmlFor={key}>{` ${cb?.name || tabLabel}`}</label>
            </div>
          })}
          <ErrorMessage errors={errors} name={tabLabel} />
        </div>
      }
      default:
        return null
      }
    }
    const subTabs = allTabs.filter((sub: any) => {
      /* NOTE render sub tabs when watchTabs is empty.
       * watchTabs can be empty when the page is initialized because watch()
       * is being called before we `register` the inputs.
       * https://react-hook-form.com/api/#watch
       */
      const parent = allTabs.find((t: any) => t.tabLabel === sub?.conditionalParentLabel)
      const watchTabValue = watchTabs[sub?.conditionalParentLabel] || watchTabs[parent?.tabGroupLabels?.[0]]
      const watchTabEqualParent = sub?.conditionalParentValue === 'on'
        ? watchTabValue === 'true' : sub?.conditionalParentValue === watchTabValue || watchTabValue?.includes(parent?.name)
      const subTabEqualParent = sub?.conditionalParentValue === value ||
        sub?.conditionalParentValue === 'on' ? tab?.selected === 'true' : false || // Match checkbox tabs
        !!radios?.find((radio: any) => (radio?.selected === 'true' && radio?.value === sub?.conditionalParentValue))

      return (sub?.conditionalParentLabel === tabLabel) &&
        (watchTabValue ? watchTabEqualParent : subTabEqualParent)
    })

    return <>
      {render()}
      {subTabs.length > 0 && subTabs.map((sub: any, sIndex: number) => mapTabToQuestion(sub, index, sIndex))}
    </>
  }

  // NOTE: `tabKey` is made up to flatten all tabs
  const allTabs = _.sortBy(Object.keys(tabs).map(tabKey => tabs[tabKey].map((tab: any) => tab ? { ...tab, tabKey } : tab)).flat(1),
    ['pageNumber', 'yPosition', 'xPosition'].map(k => (tab: any) => tab[k] || tab.radios[0][k])
  )
  const parentTabs = allTabs.map((tab: any) => {
    const { tabKey, conditionalParentLabel } = tab
    // exclude conditional questions, non supported tab types. Any question passes this is a parent question.
    return !Object.values(RecipientTabs).includes(tabKey) || conditionalParentLabel ? null : tab
  }).filter((tab: any) => !!tab) // filter out nulls
  const questions = parentTabs.map((tab: any, index: number) => mapTabToQuestion(tab, index))

  return <form className={styles.form} onSubmit={handleSubmit(onDSSubmit)}>
    <fieldset disabled={disabled}>
      <div className={styles.questionsContainer}>
        {questions}
      </div>
      <div className={styles.submitArea}>
        <NextButton state={buttonState} className='shop-next-button' type="submit" value="Next Step" controlled />
      </div>
    </fieldset>
  </form>
}

export default DocuSignForm
