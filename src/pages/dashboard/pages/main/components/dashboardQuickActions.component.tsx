import { Box, ButtonBase, Stack, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { colors } from '@src/helpers/colors.helpers'
import { useFeePermissions } from '@src/hooks/useFeePermissions.hooks'
import { useAccountingPermissions } from '@src/hooks/useAccountingPermissions.hooks'
import { DashboardPanel } from './dashboardPrimitives.component'
import { hasAnyRole, IQuickAction, QUICK_ACTIONS } from '../dashboard.helpers'

interface Props {
  roles: string[]
}

/**
 * Compact task launcher. Actions are filtered through the same role matrices
 * the modules use, so a user never sees a shortcut the API would reject.
 */
export function DashboardQuickActions({ roles }: Props) {
  const navigate = useNavigate()
  const { can: canFee } = useFeePermissions()
  const { canCreateJournal } = useAccountingPermissions()

  const isAllowed = (action: IQuickAction) => {
    if (action.permission === 'fee.collect') {
      return canFee('fee.payments.collect')
    }
    if (action.permission === 'accounting.journal') {
      return canCreateJournal
    }
    if (action.roles?.length) {
      return hasAnyRole(roles, action.roles)
    }

    return true
  }

  const actions = QUICK_ACTIONS.filter(isAllowed)

  if (actions.length === 0) {
    return null
  }

  return (
    <DashboardPanel
      title="Quick actions"
      subtitle="Jump straight into the task you need to complete"
    >
      <Box
        sx={{
          display: 'grid',
          gap: 0.75,
          gridTemplateColumns: {
            xs: 'repeat(2, minmax(0, 1fr))',
            sm: 'repeat(4, minmax(0, 1fr))',
            lg: 'repeat(8, minmax(0, 1fr))',
          },
        }}
      >
        {actions.map((action) => {
          const Icon = action.icon

          return (
            <ButtonBase
              key={action.key}
              onClick={() => navigate(action.href)}
              aria-label={action.label}
              sx={{
                width: '100%',
                borderRadius: 2.5,
                border: `1px solid ${colors.grey[100]}`,
                px: 1.1,
                py: 1.1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: 0.85,
                transition:
                  'border-color .15s ease, background .15s ease, transform .15s ease',
                '&:hover': {
                  borderColor: `${action.accent}55`,
                  bgcolor: `${action.accent}08`,
                  transform: 'translateY(-1px)',
                },
              }}
            >
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ width: '100%' }}
              >
                <Box
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: 1.5,
                    display: 'grid',
                    placeItems: 'center',
                    bgcolor: `${action.accent}14`,
                    color: action.accent,
                  }}
                >
                  <Icon size={14} />
                </Box>
              </Stack>
              <Typography
                fontSize={11.5}
                fontWeight={600}
                color={colors.grey[800]}
                lineHeight={1.25}
                textAlign="left"
              >
                {action.label}
              </Typography>
            </ButtonBase>
          )
        })}
      </Box>
    </DashboardPanel>
  )
}
