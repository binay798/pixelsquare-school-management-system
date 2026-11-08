import { Box, Card, Chip, Divider, Stack, Typography } from '@mui/material'
import { IoIosCheckmarkCircle } from 'react-icons/io'
import { colors } from '@src/helpers/colors.helpers'
import { IAccountSection } from '../../account.constants'

interface Props {
  section: IAccountSection
}

/**
 * Placeholder of a section which is not released yet.
 *
 * It keeps the layout of the implemented section, so the upcoming form can be
 * dropped in without any change of the page.
 */
export function AccountComingSoonPanel(props: Props) {
  return (
    <Card sx={{ p: { xs: 2, md: 3 } }}>
      <Stack direction={'row'} spacing={2} alignItems={'center'} mb={2.5}>
        <Box
          sx={{
            width: 42,
            height: 42,
            borderRadius: 2,
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: colors.grey[100],
            color: colors.grey[600],
          }}
        >
          {props.section.icon}
        </Box>
        <Box>
          <Stack direction={'row'} spacing={1} alignItems={'center'}>
            <Typography variant="h6" fontWeight={600}>
              {props.section.title}
            </Typography>
            <Chip
              size="small"
              label="Coming soon"
              sx={{
                height: 20,
                fontSize: 11,
                fontWeight: 600,
                background: colors.amber[100],
                color: colors.amber[900],
              }}
            />
          </Stack>
          <Typography variant="body2">{props.section.description}</Typography>
        </Box>
      </Stack>
      <Divider sx={{ mb: 3 }} />

      <Typography variant="body2" fontWeight={500} mb={1.5}>
        What you will be able to do here
      </Typography>
      <Stack spacing={1}>
        {props.section.plans.map((plan) => (
          <Stack key={plan} direction={'row'} spacing={1} alignItems={'center'}>
            <IoIosCheckmarkCircle size={16} color={colors.green[500]} />
            <Typography variant="body2" color="text.secondary">
              {plan}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Card>
  )
}
