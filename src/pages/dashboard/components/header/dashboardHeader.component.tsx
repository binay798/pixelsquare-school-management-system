import { AiOutlineMenuFold } from 'react-icons/ai'
import { AiOutlineMenuUnfold } from 'react-icons/ai'
import { IoNotifications } from 'react-icons/io5'
import { FiSearch } from 'react-icons/fi'
import {
  DashboardHeaderContainer,
  HeaderSearchField,
} from './dashboardHeader.styles'
import { Box, IconButton, Stack, Typography } from '@mui/material'
import { useAdminSidebar } from '@src/components/adminSidebar/adminSidebar.context'
import { colors } from '@src/helpers/colors.helpers'
import { useSelector } from '@src/store/hooks.store'
import { AccountMenu } from './components/accountMenu/accountMenu.component'

export function DashboardHeader() {
  const { openSidebar, toggleShowSidebar } = useAdminSidebar()
  // The session carries the tenant, so the header can name the school of the
  // current build — which is the same build for every school.
  const school = useSelector((store) => store.auth.user.data?.school)

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
            {school ? (
              <Box
                sx={{
                  display: { xs: 'none', md: 'block' },
                  textAlign: 'right',
                  lineHeight: 1.25,
                  mr: 0.5,
                }}
              >
                <Typography
                  fontSize={12.5}
                  fontWeight={600}
                  color={colors.grey[700]}
                  noWrap
                >
                  {school.name}
                </Typography>
                <Typography
                  fontSize={11}
                  letterSpacing={'0.6px'}
                  color={colors.grey[500]}
                >
                  {school.code}
                </Typography>
              </Box>
            ) : null}
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
