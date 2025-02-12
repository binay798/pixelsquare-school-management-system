import { Paper, Stack, Typography } from '@mui/material'
import { AdminSidebar } from '@src/components/adminSidebar/sidebar.component'
import { ButtonComp } from '@src/components/button/button.component'
import SpringModal from '@src/components/modal/modal.component'
import { SelectField } from '@src/components/select/select.component'
import { CustomSwitch } from '@src/components/switch/switch.component'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { FaCirclePlus } from 'react-icons/fa6'

export function Homepage() {
  const [open, setOpen] = useState(false)
  // const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  // const open = Boolean(anchorEl)
  // const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
  //   setAnchorEl(event.currentTarget)
  // }
  // const handleClose = () => {
  //   setAnchorEl(null)
  // }

  return (
    <Paper sx={{ width: '100vw', height: '100vh' }}>
      <Stack direction={'row'} spacing={2}>
        <AdminSidebar />
        <div>
          <button
            onClick={() => {
              toast.error('Hello there')
              // showToast('Helo')
            }}
          >
            Make toast
          </button>
          <button onClick={() => setOpen(true)}>Open Modal</button>

          <SpringModal close={() => setOpen(false)} open={open}>
            <Typography color={'secondary'}>Hello there</Typography>
          </SpringModal>
          <Typography>Hello there</Typography>

          {/* <Button color="info">Helo</Button>

      <Box>Hello there</Box> */}
          <CustomSwitch />
          {/* <Button variant="outlined" color="primary">
        Click me
      </Button> */}
          <Stack spacing={2} m={2} direction={'row'} alignItems={'center'}>
            <ButtonComp variant="outlined" size="large" color="primary">
              Click me
            </ButtonComp>
            <ButtonComp disableElevation size="large" color="secondary">
              Click me
            </ButtonComp>
            <ButtonComp color="error">Click me</ButtonComp>
            <ButtonComp color="info">Click me</ButtonComp>
            <ButtonComp variant="outlined" color="success">
              Click me
            </ButtonComp>
            <ButtonComp startIcon={<FaCirclePlus />} color="warning">
              Click me
            </ButtonComp>
          </Stack>

          <SelectField placeholder="Select products" />
          {/* <Loader /> */}

          {/* <div>
        <ButtonComp
          id="basic-button"
          aria-controls={open ? 'basic-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
          onClick={handleClick}
        >
          Dashboard
        </ButtonComp>
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          MenuListProps={{
            'aria-labelledby': 'basic-button',
          }}
        >
          <MenuItem onClick={handleClose}>
            <Typography>Profile</Typography>
          </MenuItem>
          <MenuItem onClick={handleClose}>My account</MenuItem>
          <MenuItem onClick={handleClose}>Logout</MenuItem>
        </Menu>
      </div> */}
        </div>
      </Stack>
    </Paper>
  )
}
