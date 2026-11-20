import {
  Avatar,
  Badge,
  Box,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Typography,
} from '@mui/material'
import { FaUser } from 'react-icons/fa'
import { IoLogOutSharp } from 'react-icons/io5'
import React from 'react'
import { IoSettingsSharp } from 'react-icons/io5'
import { useDispatch, useSelector } from '@src/store/hooks.store'
import { authSliceLogout } from '@src/store/redux/auth/auth.slice'
import { resetAppState } from '@src/store/reducers.store'
import { useNavigate } from 'react-router-dom'

export function AccountMenu() {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }

  const dispatch = useDispatch()
  const navigate = useNavigate()
  const user = useSelector((store) => store.auth.user.data?.user)
  const userRoles = useSelector((store) => store.auth.user.data?.userRoles)

  const logoutHandler = () => {
    handleClose()
    dispatch(authSliceLogout({}))
      .unwrap()
      // A failed request must not trap the user behind a dead logout button: the
      // store is reset either way and the router sends him to the sign-in screen.
      .catch(() => undefined)
      .finally(() => {
        // One build serves every school: drop every cached tenant slice so no page
        // of the previous school survives into the next session.
        dispatch(resetAppState())
        // The app uses a hash router (`#/login`), and `AuthRouter` rebuilds the
        // router from the URL on every render. Set the hash synchronously instead of
        // navigating through React state, and replace the entry so the dashboard
        // is not kept in the browser history.
        window.location.replace(
          `${window.location.pathname}${window.location.search}#/login`
        )
      })
  }
  const accountHandler = () => {
    handleClose()
    navigate('/dashboard/account')
  }

  return (
    <Box>
      <IconButton
        id="basic-button"
        aria-controls={open ? 'basic-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
      >
        <Badge variant="dot" color="error">
          <Avatar
            src="https://img.freepik.com/free-photo/portrait-white-man-isolated_53876-40306.jpg?semt=ais_hybrid"
            sx={{ width: 30, height: 30 }}
          />
        </Badge>
      </IconButton>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
        slotProps={{
          paper: {
            style: {
              width: 230,
            },
          },
        }}
      >
        <Box p={2} pt={0} pb={1}>
          <Typography noWrap>{user?.email ?? 'My account'}</Typography>
          <Typography variant="body2" color="textSecondary">
            {userRoles?.length ? userRoles.join(', ') : 'Signed in'}
          </Typography>
        </Box>
        <Divider />
        <MenuItem sx={{ marginTop: 1 }} onClick={accountHandler}>
          <Stack direction={'row'} spacing={2} alignItems={'center'}>
            <FaUser size={16} />
            <Typography>My Account</Typography>
          </Stack>
        </MenuItem>
        <MenuItem onClick={handleClose}>
          <Stack direction={'row'} spacing={2} alignItems={'center'}>
            <IoSettingsSharp size={18} />
            <Typography>Settings</Typography>
          </Stack>
        </MenuItem>
        <MenuItem onClick={logoutHandler}>
          <Stack direction={'row'} spacing={2} alignItems={'center'}>
            <IoLogOutSharp size={20} />
            <Typography>Logout</Typography>
          </Stack>
        </MenuItem>
      </Menu>
    </Box>
  )
}
