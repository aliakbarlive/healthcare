import React, { useState, ChangeEvent, ReactElement } from 'react'
import styles from './TodoList.module.css'
import { useKey, useAsyncRetry } from 'react-use'
import * as api from 'Utilities/pharaoh'
import Error from 'Components/Primitives/Error'
import Loader from 'Components/Rudimentary/Loader'
import { v4 as uuid } from 'uuid'
import useToast from 'Utilities/Hooks/useToast'
import CarrierApplication from 'Components/Anubis/CarrierApplication'
import CandorModal from 'Components/Rudimentary/CandorModal'
import UploadFileModal from './UploadFileModal'
import { startCase } from 'lodash'
import { useHistory } from 'react-router-dom'
import { Route } from 'Utilities/Route'
import InviteEmployeesModal from 'Components/Modals/Anubis/InviteEmployeesModal'
import AnubisModal from './AnubisModal'
import { GAButton } from 'Components/Tracking'
import { useForm } from 'react-hook-form'
import { Tier } from 'Utilities/pharaoh.types'

interface Props {
  id: string
  className?: string
  ees?: Member[]
}

export interface Member {
  id: string
  lastName: string
  firstNames: string
  plans: Plan[]
  status: string
  tobacco: boolean
  dependents: Member[]
  email: string
}

interface Plan {
  id: string
  name: string
  tier: Tier
  type: string
  carrier: string
  premiums?: {premium: string, split: {ee: string, er: string}}
}

enum Action {
  plans = 'plans',
  census = 'census',
  invites = 'invites',
  manager = 'manager',
  carrierApplication = 'carrierApplication',
  businessLicense = 'businessLicense',
  priorCarrierBill = 'priorCarrierBill',
  wageAndTaxReport = 'wageAndTaxReport',
  articlesOfIncorporation = 'articlesOfIncorporation',
  producerApplication = 'producerApplication',
  agencyApplication = 'agencyApplication',
  agencyLogo = 'agencyLogo',
  unclassified = 'unclassified'
}

interface ToDo {
  id: string
  content: string
  done: boolean
  action: Action
}

const TodoList: React.FC<Props> = ({ id: targetID, className, ees = [] }) => {
  const [disabled, setDisabled] = useState(false)
  const [todos, setTodos] = useState<ToDo[]>([])
  const addToast = useToast()
  const [activeToDo, setActiveToDo] = useState<ToDo | undefined>()
  const history = useHistory()

  // handle enter press to blur and thus trigger save
  useKey('Enter', () => (document.activeElement as HTMLInputElement)?.blur())
  const async = useAsyncRetry(async() => {
    setTodos(await api.v2.todos(targetID).GET())
  }, [targetID])

  if (async.loading) return <Loader/>
  if (async.error) return <Error error={async.error}/>

  const elements = todos.map((todo, index) => {
    // temp fix to remove non working code
    if (todo.content === 'Set up ACH payment information') { return null }
    const content = todo.action === Action.unclassified
      ? <input
        name={todo.id}
        value={todo.content}
        placeholder="What needs doing?"
        className={styles.text}
        onBlur={save}
        onChange={onChangeText}
        autoFocus={!todo.content}
      />
      : <button onClick={onActionableToDoClick(todo)} className={styles.text}>{todo.content}</button>
    const deleteButton = todo.action === Action.unclassified || todo.done
      ? <button onClick={() => onClickDelete(todo.id)} className={styles.delete}>
        <i className={`material-icons ${styles.arrow}`}>remove_circle_outline</i>
      </button>
      : undefined

    return <div key={index} className={styles.todo}>
      <input
        onChange={onChangeCheck}
        checked={todo.done}
        name={todo.id}
        type="checkbox"
        className={styles.check}
      />
      {content}
      {deleteButton}
    </div>
  })

  let uploadModalOpen
  switch (activeToDo?.action) {
  case Action.priorCarrierBill:
  case Action.articlesOfIncorporation:
  case Action.businessLicense:
  case Action.wageAndTaxReport:
  case Action.agencyLogo:
    uploadModalOpen = true
    break
  default:
    uploadModalOpen = false
  }

  return (<>
    <div className={`${styles.container} ${className}`}>
      <div className={styles.header}>
        <h1>Outstanding Items</h1>
        <GAButton analytics={`Add Item (${TodoList.name})`} onClick={onAddClick} className={styles.addTodo}>Add Item<i className='material-icons'>add_circle_outline</i></GAButton>
      </div>
      <fieldset disabled={disabled} className={styles.todos}>
        {elements}
      </fieldset>
      <CarrierApplicationModal
        isOpen={activeToDo?.action === Action.carrierApplication}
        groupID={targetID}
        callback={onCarrierApplicationClose}
      />
      <UploadFileModal
        isOpen={uploadModalOpen}
        title={startCase(activeToDo?.action)}
        copy={uploadModalCopy()}
        onSubmit={upload}
        onRequestClose={close}
      />
      <InviteEmployeesModal
        groupID={targetID}
        isOpen={activeToDo?.action === Action.invites}
        onRequestClose={close}
      />
      <InviteManagersModal
        groupID={targetID}
        ees={ees}
        isOpen={activeToDo?.action === Action.manager}
        onClose={close}
      />
    </div>
    <div className={styles.todoLabelCont}>Any item marked as complete will automatically be removed from your Outstanding Items after 7 days. </div>
  </>
  )
  async function onChangeCheck(event: ChangeEvent<HTMLInputElement>) {
    const { name: id, checked: done } = event.currentTarget
    if (!activeToDo) return
    setDisabled(true)
    try {
      await api.v2.todos(id).PUT({ done })
      setTodos(todos =>
        todos.map(todo => {
          if (todo.id === id) todo.done = done
          return todo
        }))
    } catch (error) {
      addToast(error as Error)
    } finally {
      setDisabled(false)
    }
  }

  async function onChangeText(event: ChangeEvent<HTMLInputElement>) {
    const { name: id, value: content } = event.currentTarget
    setTodos(todos => todos.map(todo => {
      if (todo.id === id) todo.content = content
      return todo
    }))
  }

  async function onClickDelete(id: string) {
    setDisabled(true)

    try {
      await api.v2.todos(id).DELETE()
      setTodos(todos => todos.filter(todo => todo.id !== id))
    } catch (error) {
      addToast(error as Error)
    } finally {
      setDisabled(false)
    }
  }

  async function save(event: React.FocusEvent<HTMLInputElement>) {
    const { name: id, value: content } = event.currentTarget

    // remove the ToDo if it is empty
    if (!content) {
      return setTodos(todos => todos.filter(todo => todo.id !== id))
    }

    setDisabled(true)

    try {
      await api.v2.todos(targetID).POST({ content, id })
    } catch (error) {
      addToast(error as Error)
    } finally {
      setDisabled(false)
    }
  }

  function onAddClick() {
    setTodos(todos =>
      todos.concat({ id: uuid(), content: '', done: false, action: Action.unclassified })
    )
  }

  async function onCarrierApplicationClose(success: boolean) {
    if (!success) return setActiveToDo(undefined)
    try {
      if (!activeToDo) return
      await api.v2.todos(activeToDo.id).PUT({ done: true })
      close()
      async.retry() // easiest way to update the checks
    } catch (error) {
      addToast(error as Error)
    }
  }

  function close() {
    setActiveToDo(undefined)
  }

  function uploadModalCopy(): ReactElement | string | undefined {
    switch (activeToDo?.action) {
    case Action.articlesOfIncorporation:
      return 'Your articles of incorporation'
    case Action.businessLicense:
      return 'Your business license'
    case Action.priorCarrierBill:
      return 'A bill from your current or prior carrier'
    case Action.wageAndTaxReport:
      return <>A Wage and Tax Report is your business&apos; quarterly report of wage and payroll tax withholding information. It includes your Department of Labor number, quarter and year, business name and address, and a complete list of your employees and their wages and taxes. View an example <a href='https://candor-public.s3.amazonaws.com/img/wage-tax-report-example.jpg'>here</a>.</>
    case Action.agencyLogo:
      return <>
        <p>Please upload your agency logo. It will be included in all proposals generated by your agency.</p>
        <p style={{ fontStyle: 'normal', fontWeight: 'bold', fontSize: '16px', lineHeight: '120%', margin: '0 auto 20px' }}>Accepted file types are .jpeg and .png.</p>
      </>
    }
  }

  async function upload(data: any) {
    if (!activeToDo) return

    const formData = new FormData()
    formData.append('file', data.file[0])
    formData.append('type', activeToDo.action)
    formData.append('note', startCase(activeToDo.action))

    // NOTE catches in `UploadFileModal`
    if (activeToDo.action === Action.agencyLogo) {
      await api.v3.agency.logo.POST(formData)
    } else {
      await api.v2.brokers.groups(targetID).documents().POST(formData)
    }
    await api.v2.todos(activeToDo.id).PUT({ done: true })

    close()

    // async.retry()
    // we need to reload the documents section and this is easier than
    // making a custom hook at this point :/
    window.location.reload()
  }

  function onActionableToDoClick(todo: ToDo): () => void {
    return () => {
      if (todo.done) return
      switch (todo.action) {
      case Action.plans:
        // TODO makes no sense to take them here if we still need the census
        localStorage.overrideGroupID = targetID
        history.push(Route.erStargate_CensusWaive)
        break
      case Action.census:
        localStorage.overrideGroupID = targetID
        history.push(Route.erStargate_Census)
        break
      case Action.manager:
        setActiveToDo(todo)
        break
      case Action.invites:
      case Action.carrierApplication:
      case Action.businessLicense:
      case Action.priorCarrierBill:
      case Action.wageAndTaxReport:
      case Action.agencyLogo:
      case Action.articlesOfIncorporation:
        setActiveToDo(todo)
        break
      case Action.producerApplication:
      case Action.agencyApplication:
        break
      case Action.unclassified:
        break
      }
    }
  }
}

const CarrierApplicationModal: React.FC<{
  groupID: string
  callback: (success: boolean) => void
  isOpen: boolean
}> = ({ groupID, callback: onComplete, isOpen }) => {
  // NOTE wanted to use AnubisModal for close button but that has height problems
  return <CandorModal isOpen={isOpen}>
    <CarrierApplication groupID={groupID} callback={() => onComplete(true)} cancelCallback={() => onComplete(false)} />
  </CandorModal>
}

const ZohoApplicationModal: React.FC<{ isOpen: boolean, onClose: () => void, url: string }> = ({ isOpen, onClose, url }) => {
  return <AnubisModal
    name={ZohoApplicationModal.name}
    styles={{ height: '80%', width: '80%' }}
    isOpen={isOpen}
    onRequestClose={onClose}
  >
    <iframe title='Zoho Application' height='100%' width='100%' src={url} />
  </AnubisModal>
}

const InviteManagersModal: React.FC<{ isOpen: boolean, onClose: () => void, groupID: string, ees: Member[] }> = ({ isOpen, onClose, groupID, ees }) => {
  const { register, watch, handleSubmit } = useForm()
  const watchAll = watch()
  const addToast = useToast()
  const eesOnly = ees?.filter(e => (e as any).class === 'employee')

  function onSave(data: any): Promise<void> {
    const ids = Object.keys(data).filter(id => data[id])
    return ids.length > 0
      ? Promise.all(ids.map(id => api.v3.groups(groupID).users(id).promote())).then(() => {
        addToast(`Invite${ids.length > 1 ? 's' : ''} sent successfully.`, { appearance: 'success', autoDismiss: true })
        onClose()
      })
      : Promise.resolve()
  }

  return <AnubisModal
    // styles={{ height: '50%', width: '80%' }}
    name={InviteManagersModal.name}
    isOpen={isOpen}
    onRequestClose={onClose}
  >
    <h1>Invite Group Managers</h1>
    {eesOnly?.length > 0
      ? <form onSubmit={handleSubmit(onSave)}>
        <p>Please select group managers:</p>
        {eesOnly.map(ee => <div key={ee.id}>
          <label>
            <input ref={register} type='checkbox' name={ee.id} />
            {`${ee.firstNames} ${ee.lastName}`}
          </label>
        </div>)}
        <br />
        <input type='submit' value='Submit' disabled={watchAll && !Object.values(watchAll)?.some(checked => checked)} />
      </form>
      : <p>There are no members to invite.</p>
    }
  </AnubisModal>
}

export default TodoList
