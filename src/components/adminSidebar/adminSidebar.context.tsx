import React, { useContext, createContext, useState, useEffect } from 'react'
import { SIDEBAR_LOCAL_STORAGE_STATE_KEY } from './adminSidebar.constants'

const AdminContext = createContext<{
  openSidebar: boolean
  toggleShowSidebar?: (val: boolean) => void
}>({ openSidebar: true })

interface Props {
  children?: React.ReactElement
}
export function AdminSidebarContext(props: Props) {
  const [open, setOpen] = useState(true)

  const toggleShowSidebar = (val: boolean) => {
    setOpen(val)
    localStorage.setItem(SIDEBAR_LOCAL_STORAGE_STATE_KEY, String(val))
  }

  useEffect(() => {
    const localState = localStorage.getItem(SIDEBAR_LOCAL_STORAGE_STATE_KEY)
    if (localState === 'false') {
      setOpen(false)
    }
  }, [])

  return (
    <AdminContext.Provider value={{ openSidebar: open, toggleShowSidebar }}>
      {props.children}
    </AdminContext.Provider>
  )
}

export function useAdminSidebar() {
  const val = useContext(AdminContext)

  return val
}
