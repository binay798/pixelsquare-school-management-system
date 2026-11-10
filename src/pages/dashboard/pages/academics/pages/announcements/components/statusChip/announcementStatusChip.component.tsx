import { Box, Stack, Typography } from '@mui/material'
import {
  ANNOUNCEMENT_PRIORITY_META,
  ANNOUNCEMENT_STATUS_META,
  IStatusMeta,
} from '../../announcements.helpers'

interface StatusProps {
  status: Announcement.Status
  size?: 'small' | 'medium'
}

interface PriorityProps {
  priority: Announcement.Priority
  size?: 'small' | 'medium'
}

export function getStatusMeta(
  status?: Announcement.Status | null
): IStatusMeta {
  return (
    ANNOUNCEMENT_STATUS_META[status ?? 'draft'] ??
    ANNOUNCEMENT_STATUS_META.draft
  )
}

export function AnnouncementStatusChip({
  status,
  size = 'medium',
}: StatusProps) {
  const meta = getStatusMeta(status)
  const isSmall = size === 'small'

  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={0.75}
      sx={{
        display: 'inline-flex',
        px: isSmall ? 1 : 1.25,
        py: isSmall ? 0.25 : 0.5,
        borderRadius: 999,
        bgcolor: meta.bg,
        border: `1px solid ${meta.border}`,
        color: meta.text,
        width: 'fit-content',
        whiteSpace: 'nowrap',
      }}
    >
      <Box
        sx={{
          width: isSmall ? 6 : 7,
          height: isSmall ? 6 : 7,
          borderRadius: '50%',
          bgcolor: meta.dot,
          flexShrink: 0,
        }}
      />
      <Typography
        fontSize={isSmall ? 11 : 12}
        fontWeight={600}
        lineHeight={1.4}
        color="inherit"
      >
        {meta.label}
      </Typography>
    </Stack>
  )
}

export function AnnouncementPriorityChip({
  priority,
  size = 'small',
}: PriorityProps) {
  const meta =
    ANNOUNCEMENT_PRIORITY_META[priority] ?? ANNOUNCEMENT_PRIORITY_META.normal
  const isSmall = size === 'small'

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        px: isSmall ? 0.9 : 1.25,
        py: isSmall ? 0.15 : 0.4,
        borderRadius: 999,
        bgcolor: meta.bg,
        border: `1px solid ${meta.border}`,
        color: meta.text,
        whiteSpace: 'nowrap',
      }}
    >
      <Typography
        fontSize={isSmall ? 10.5 : 12}
        fontWeight={600}
        lineHeight={1.4}
        color="inherit"
      >
        {meta.label}
      </Typography>
    </Box>
  )
}
