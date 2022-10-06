import React from 'react'
import NewClientModal from './NewClientModal'
import AddButton from './AddButton'
import { useHistory } from 'react-router-dom'
import { Route } from 'Utilities/Route'
import { useToggle } from 'react-use'

const AddNewClient: React.FC<{refresh: () => void}> = ({ refresh }) => {
  const history = useHistory()
  const [open, toggle] = useToggle(false)
  const [clientBtnShow, setClientBtnShow] = React.useState(false)
  return <>
    <NewClientModal isOpen={open} onRequestClose={onClose} clientBtnShow ={setClientBtnShow} />
    {clientBtnShow && <AddButton
      analytics={`Add New Client (${AddNewClient.name})`}
      onClick={toggle}
    >
      Add New Client
    </AddButton>}
  </>

  function onClose(id: string | null = null) {
    toggle(false)
    refresh()
    if (id) {
      history.push(`${Route.agencyDashboardClients}/${id}`)
    }
  }
}

export default AddNewClient
