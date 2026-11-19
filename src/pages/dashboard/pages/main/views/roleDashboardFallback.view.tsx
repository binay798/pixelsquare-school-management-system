import { Box, ButtonBase, Stack, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Megaphone, UserRound } from 'lucide-react'
import { colors } from '@src/helpers/colors.helpers'
import { useDashboardIdentity } from '../hooks/useDashboard.hooks'
import { formatLongDate, getGreeting } from '../dashboard.helpers'
import { DashboardPanel } from '../components/dashboardPrimitives.component'

const LINKS = [
  {
    label: 'Notice board',
    description: 'Announcements published by the school',
    href: '/dashboard/academics/announcements/feed',
    icon: Megaphone,
  },
  {
    label: 'My account',
    description: 'Profile, contact details and password',
    href: '/dashboard/account',
    icon: UserRound,
  },
]

/**
 * Fallback workspace for roles that do not own the operational dashboard yet.
 * It shows no metrics at all: teacher / student / guardian views will be
 * registered in `dashboardViews.ts` and replace this component.
 */
export function RoleDashboardFallbackView() {
  const navigate = useNavigate()
  const identity = useDashboardIdentity()
  const roleLabel = identity.roles.length
    ? identity.roles.map((role) => role.replace(/_/g, ' ')).join(', ')
    : 'member'

  return (
    <Box sx={{ pb: 4, maxWidth: 900 }}>
      <Box sx={{ mb: 2.5 }}>
        <Typography
          component="h1"
          fontSize={{ xs: 22, md: 26 }}
          fontWeight={700}
          letterSpacing={-0.3}
          color={colors.grey[900]}
        >
          {getGreeting()}, {identity.greetingName}
        </Typography>
        <Typography fontSize={13} color={colors.grey[600]} mt={0.5}>
          Your {roleLabel} workspace is being tailored. The operational
          dashboard is reserved for school administrators.
        </Typography>
        <Typography fontSize={11} color={colors.grey[600]} mt={0.75}>
          {formatLongDate()}
        </Typography>
      </Box>

      <DashboardPanel
        title="Available today"
        subtitle="Everything you can already use in the school workspace"
      >
        <Stack spacing={0.75}>
          {LINKS.map((link) => {
            const Icon = link.icon

            return (
              <ButtonBase
                key={link.href}
                onClick={() => navigate(link.href)}
                sx={{
                  width: '100%',
                  textAlign: 'left',
                  borderRadius: 2,
                  border: `1px solid ${colors.grey[100]}`,
                  px: 1.4,
                  py: 1.1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.25,
                  '&:hover': {
                    borderColor: colors.grey[300],
                    bgcolor: colors.grey[50],
                  },
                }}
              >
                <Box
                  sx={{
                    width: 30,
                    height: 30,
                    borderRadius: 1.75,
                    display: 'grid',
                    placeItems: 'center',
                    bgcolor: colors.blue[50],
                    color: colors.blue[700],
                  }}
                >
                  <Icon size={14} />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    fontSize={12.5}
                    fontWeight={600}
                    color={colors.grey[800]}
                  >
                    {link.label}
                  </Typography>
                  <Typography fontSize={11} color={colors.grey[600]}>
                    {link.description}
                  </Typography>
                </Box>
                <ArrowRight size={14} color={colors.grey[600]} />
              </ButtonBase>
            )
          })}
        </Stack>
      </DashboardPanel>
    </Box>
  )
}
