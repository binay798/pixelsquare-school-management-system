import { Box, Stack } from '@mui/material'
import { AdminSidebar } from '@src/components/adminSidebar/sidebar.component'
import { Outlet } from 'react-router-dom'
import { DashboardMainBody } from './dashboard.styles'
import { DashboardHeader } from './components/header/dashboardHeader.component'
import { AdminSidebarContext } from '@src/components/adminSidebar/adminSidebar.context'
// import { CustomBreadCrumbs } from '@src/components/customBreadCrumbs/customBreadCrumbs.component'

export function Dashboard() {
  return (
    <Box>
      <AdminSidebarContext>
        <Stack direction={'row'}>
          <AdminSidebar />
          <DashboardMainBody>
            <DashboardHeader />

            <Box p={2} px={6}>
              <Box my={1} mb={4}>
                {/* <CustomBreadCrumbs /> */}
              </Box>
              <Outlet />
            </Box>
          </DashboardMainBody>
        </Stack>
      </AdminSidebarContext>
    </Box>
  )
}
