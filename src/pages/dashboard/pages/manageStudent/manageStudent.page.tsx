import { Box } from '@mui/material'
import { Outlet } from 'react-router-dom'

export function ManageStudent() {
  return (
    <Box>
      <Outlet />
    </Box>
  )
}
