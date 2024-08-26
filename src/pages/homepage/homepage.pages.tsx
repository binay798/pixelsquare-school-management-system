import { Paper, Typography } from '@mui/material'
import SpringModal from '@src/components/modal/modal.component'
import { CustomSwitch } from '@src/components/switch/switch.component'
import { useState } from 'react'

export function Homepage() {
  const [open, setOpen] = useState(false)

  return (
    <Paper sx={{ width: '100vw', height: '100vh' }}>
      <button onClick={() => setOpen(true)}>Open Modal</button>

      <SpringModal close={() => setOpen(false)} open={open}>
        <Typography color={'secondary'}>Hello there</Typography>
      </SpringModal>

      {/* <Button color="info">Helo</Button>

      <Box>Hello there</Box> */}
      <CustomSwitch />
    </Paper>
  )
}
