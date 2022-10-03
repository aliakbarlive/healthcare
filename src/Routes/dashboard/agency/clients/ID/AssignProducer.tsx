import React from 'react'
import styles from './AssignProducer.module.scss'
import { useAsync } from 'react-use'
import * as api from 'Utilities/pharaoh'
import Loader from 'Components/Rudimentary/Loader'
import Error from 'Components/Primitives/Error'
import { Group } from 'Utilities/pharaoh.types'
import Select from 'Components/Rudimentary/Select'
import { sortBy } from 'lodash'
import { FormProvider, useForm } from 'react-hook-form'
import useToast from 'Utilities/Hooks/useToast'

type Props = {
  group: Group
}

interface Producer {
  id: string
  name: string
}

const AssignProducer: React.FC<Props> = ({ group }) => {
  const async = useAsync(async() => {
    const rsp = await api.v3.brokers.producers().GET() as [Producer]
    return sortBy(rsp, 'name')
  })
  const form = useForm()
  const addToast = useToast()

  if (async.loading) return <Loader />
  if (async.error) return <Error error={async.error} />

  const brokers = async.value!.map(b => ({ value: b.id, label: b.name }))

  async function assignProducer(data: any) {
    try {
      await api.v2.brokers.producers(data.producer).assign.to(group.id!)
      addToast('Producer assigned to group', 'info')
    } catch (error) {
      addToast(error as Error)
    }
  }

  return <div className={styles.container}>
    <h2 className={styles.header}>Assign Producer</h2>
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(assignProducer)} style={{ width: '100%' }} >
        <Select name='producer' control={form.control} options={brokers} placeholder='Producer' backgroundColor='#fff'/>
        <button className={styles.assignButton} type='submit'>Assign</button>
      </form>
    </FormProvider>
  </div>
}

export default AssignProducer
