import {
  Alert,
  Box,
  Dialog,
  IconButton,
  Stack,
  Typography,
} from '@mui/material'
import { ArrowUpRight, LifeBuoy, ShieldCheck, X } from 'lucide-react'
import { ButtonComp } from '@src/components/button/button.component'
import { colors } from '@src/helpers/colors.helpers'

interface Props {
  open: boolean
  onClose: () => void
}

const STEPS = [
  'Contact your school office or IT desk.',
  'Ask an administrator to reset your password from user management.',
  'Sign in with the temporary password, then change it from your profile.',
]

/**
 * There is no self-service reset endpoint yet, so the login page must not send
 * people to a dead link. This modal explains the real recovery path instead.
 * MUI Dialog is used here (instead of the app's fixed-width SpringModal) because
 * this screen is the first one visitors see and must fit a 320px phone.
 */
export function LoginHelpModal({ open, onClose }: Props) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      aria-labelledby="login-help-title"
      slotProps={{
        backdrop: {
          sx: {
            backgroundColor: 'rgba(11, 18, 32, 0.48)',
            backdropFilter: 'blur(2px)',
          },
        },
        paper: {
          sx: {
            borderRadius: '18px',
            backgroundImage: 'none',
            boxShadow: '0 30px 70px -24px rgba(15, 23, 42, 0.45)',
          },
        },
      }}
    >
      <Box sx={{ position: 'relative', p: { xs: 2, sm: 2.75 } }}>
        <IconButton
          aria-label="Close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            top: 10,
            right: 10,
            color: colors.grey[500],
            '&:hover': { color: colors.grey[800] },
          }}
        >
          <X size={17} />
        </IconButton>

        <Stack spacing={2.25}>
          <Stack direction="row" spacing={1.5} alignItems="center" pr={4}>
            <Box
              sx={{
                width: { xs: 38, sm: 44 },
                height: { xs: 38, sm: 44 },
                flexShrink: 0,
                borderRadius: '12px',
                display: 'grid',
                placeItems: 'center',
                color: colors.blue[700],
                bgcolor: colors.blue[50],
                border: `1px solid ${colors.blue[100]}`,
              }}
            >
              <LifeBuoy size={20} />
            </Box>
            <Box>
              <Typography
                id="login-help-title"
                fontSize={{ xs: 14.5, sm: 16 }}
                fontWeight={700}
                color={colors.grey[900]}
                lineHeight={1.3}
              >
                Need help signing in?
              </Typography>
              <Typography fontSize={12} color={colors.grey[500]} mt={0.25}>
                Password resets are handled by your school administrator.
              </Typography>
            </Box>
          </Stack>

          <Stack spacing={1.25}>
            {STEPS.map((step, index) => (
              <Stack
                key={step}
                direction="row"
                spacing={1.25}
                alignItems="flex-start"
              >
                <Box
                  sx={{
                    width: 22,
                    height: 22,
                    flexShrink: 0,
                    mt: '1px',
                    borderRadius: '50%',
                    display: 'grid',
                    placeItems: 'center',
                    bgcolor: colors.blue[50],
                    color: colors.blue[700],
                    border: `1px solid ${colors.blue[100]}`,
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                >
                  {index + 1}
                </Box>
                <Typography
                  fontSize={12.5}
                  lineHeight={1.7}
                  color={colors.grey[700]}
                  sx={{ overflowWrap: 'anywhere' }}
                >
                  {step}
                </Typography>
              </Stack>
            ))}
          </Stack>

          <Alert
            severity="info"
            icon={<ShieldCheck size={16} />}
            sx={{
              borderRadius: '10px',
              alignItems: 'center',
              bgcolor: colors.blue[50],
              color: colors.blue[900],
              fontSize: 12,
              '& .MuiAlert-icon': { color: colors.blue[600] },
            }}
          >
            For security, passwords are never shared over email or chat.
          </Alert>

          <Stack direction="row" justifyContent="flex-end">
            <ButtonComp
              onClick={onClose}
              size="medium"
              endIcon={<ArrowUpRight size={15} />}
              sx={{
                height: 38,
                px: 2.5,
                borderRadius: '10px',
                fontSize: 12.5,
                fontWeight: 600,
                background: colors.grey[900],
                backgroundImage: 'none',
                color: '#fff',
                '&:hover': {
                  background: colors.grey[800],
                  backgroundImage: 'none',
                },
              }}
            >
              Got it
            </ButtonComp>
          </Stack>
        </Stack>
      </Box>
    </Dialog>
  )
}
