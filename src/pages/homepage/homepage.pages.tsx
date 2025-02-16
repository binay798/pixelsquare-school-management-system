import { Card, Paper, Stack, Typography } from '@mui/material'
import { AdminSidebar } from '@src/components/adminSidebar/sidebar.component'
import { InputField } from '@src/components/input/input.component'
import SpringModal from '@src/components/modal/modal.component'
import { SelectField } from '@src/components/select/select.component'
import { CustomSwitch } from '@src/components/switch/switch.component'
import { TestButtonComponents } from '@src/test/testButtons'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { IoEyeOutline } from 'react-icons/io5'
import { FaUser } from 'react-icons/fa'
import { TestMenu } from '@src/test/testMenu'
import { TestTabs } from '@src/test/testTabs'
import { ConfirmationModal } from '@src/components/confirmationModal/confirmationModal.component'
import { Loader } from '@src/components/loader/loader.component'
import { TableComp } from '@src/components/tableComp/tableComp.components'

export function Homepage() {
  const [open, setOpen] = useState(false)
  const [openConfirmation, setOpenConfirmation] = useState(false)
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
        <div
          style={{
            overflowY: 'auto',
            maxHeight: '100vh',
            width: '100%',
            padding: '0px 10px',
          }}
        >
          <button
            onClick={() => {
              toast.error('Hello there')
              // showToast('Helo')
            }}
          >
            Make toast
          </button>
          <button onClick={() => setOpen(true)}>Open Modal</button>
          <button onClick={() => setOpenConfirmation(true)}>
            Open Confirmation Modal
          </button>

          <ConfirmationModal
            open={openConfirmation}
            onClose={() => {
              setOpenConfirmation(false)
            }}
            onConfirmationClick={() => {}}
          >
            <div>Helo</div>
          </ConfirmationModal>

          <SpringModal close={() => setOpen(false)} open={open}>
            <Typography color={'secondary'}>Hello there</Typography>
          </SpringModal>
          <Typography>Hello there</Typography>

          {/* <Button color="info">Helo</Button>

      <Box>Hello there</Box> */}
          {/* name: string,
  calories: number,
  fat: number,
  carbs: number,
  protein: number */}
          <CustomSwitch />
          <Loader />
          <TableComp
            columns={[
              {
                field: 'name',
                name: 'Name',
                render: (val) => <div>{val}</div>,
              },
              {
                field: 'calories',
                name: 'Calories',
                render: (val) => <div>{val}</div>,
              },
              {
                field: 'fat',
                name: 'Fat',
                render: (val) => <div>{val}</div>,
              },
              {
                field: 'carbs',
                name: 'Carbs',
                render: (val) => <div>{val}</div>,
              },
              {
                field: 'protein',
                name: 'Protein',
                render: (val) => <div>{val}</div>,
              },
            ]}
            data={[
              {
                name: 'Frozen Yoghurt',
                calories: '145',
                fat: '45.66',
                carbs: '44',
                protein: '10',
              },
            ]}
            actions={{ onDelete: () => {} }}
          />
          {/* <FullPageLoader /> */}
          {/* <Button variant="outlined" color="primary">
        Click me
      </Button> */}
          <TestButtonComponents />
          <br />
          <TestMenu />
          <br />
          <TestTabs />
          <br />

          <SelectField
            // menuIsOpen
            placeholder="Select products"
            options={[
              { value: 'car', label: 'Car' },
              { label: 'Bike', value: 'bike' },
            ]}
          />
          {/* <Loader /> */}
          <br />
          <br />

          <Card>Hello</Card>
          <br />

          <InputField
            placeholder="Firstname"
            endAdornment={<IoEyeOutline size={22} />}
            startAdornment={<FaUser />}
          />

          <br />
          <Typography color="textSecondary">
            If you&apos;ve just made a payment, it may take a few hours for it
            to appear in the table below.
          </Typography>
          <br />

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
