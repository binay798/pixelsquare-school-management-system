import { AiOutlineMenuFold } from 'react-icons/ai'
import { AiOutlineMenuUnfold } from 'react-icons/ai'
import { IoNotifications } from 'react-icons/io5'
import { FiSearch } from 'react-icons/fi'
import {
  DashboardHeaderContainer,
  HeaderSearchField,
} from './dashboardHeader.styles'
import { Box, IconButton, Stack } from '@mui/material'
import { useAdminSidebar } from '@src/components/adminSidebar/adminSidebar.context'
import { colors } from '@src/helpers/colors.helpers'
import { AccountMenu } from './components/accountMenu/accountMenu.component'

export function DashboardHeader() {
  const { openSidebar, toggleShowSidebar } = useAdminSidebar()

  return (
    <DashboardHeaderContainer>
      <Stack
        direction={'row'}
        justifyContent={'space-between'}
        alignItems={'center'}
      >
        <Box>
          <Stack direction={'row'} spacing={1}>
            {openSidebar ? (
              <IconButton onClick={() => toggleShowSidebar?.(false)}>
                <AiOutlineMenuFold />
              </IconButton>
            ) : (
              <IconButton onClick={() => toggleShowSidebar?.(true)}>
                <AiOutlineMenuUnfold />
              </IconButton>
            )}
            <HeaderSearchField
              startAdornment={<FiSearch size={20} color={colors.grey[400]} />}
              placeholder="Search anything..."
            />
          </Stack>
        </Box>
        <Box>
          <Stack direction="row" alignItems={'center'} spacing={1}>
            <IconButton>
              <IoNotifications size={20} />
            </IconButton>
            <Box borderLeft={`1px solid ${colors.green[200]}`} height={30} />
            <AccountMenu />
          </Stack>
        </Box>
      </Stack>
    </DashboardHeaderContainer>
  )
}
