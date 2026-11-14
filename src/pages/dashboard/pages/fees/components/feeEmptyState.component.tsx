import { Box, Stack, Typography } from '@mui/material'
import { ReactNode } from 'react'
import { Inbox } from 'lucide-react'
import { colors } from '@src/helpers/colors.helpers'

interface Props {
  title?: string
  description?: string
  icon?: ReactNode
  action?: ReactNode
  minHeight?: number
}

/** Empty state used by every fee table / list. */
export function FeeEmptyState({
  title = 'Nothing here yet',
  description,
  icon,
  action,
  minHeight = 180,
}: Props) {
  return (
    <Stack
      alignItems="center"
      justifyContent="center"
      spacing={0.75}
      sx={{ minHeight, py: 4, px: 2, textAlign: 'center' }}
    >
      <Box
        sx={{
          width: 44,
          height: 44,
          borderRadius: '50%',
          display: 'grid',
          placeItems: 'center',
          bgcolor: colors.grey[100],
          color: colors.grey[500],
          mb: 0.5,
        }}
      >
        {icon ?? <Inbox size={20} />}
      </Box>
      <Typography fontSize={14} fontWeight={600} color={colors.grey[800]}>
        {title}
      </Typography>
      {description ? (
        <Typography fontSize={12.5} color={colors.grey[500]} maxWidth={420}>
          {description}
        </Typography>
      ) : null}
      {action ? <Box mt={1}>{action}</Box> : null}
    </Stack>
  )
}
