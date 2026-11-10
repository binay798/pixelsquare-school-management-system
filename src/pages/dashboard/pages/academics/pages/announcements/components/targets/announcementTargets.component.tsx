import { Box, Stack, Typography } from '@mui/material'
import { Users } from 'lucide-react'
import { colors } from '@src/helpers/colors.helpers'
import {
  ANNOUNCEMENT_AUDIENCE_TYPE_META,
  getTargetLabel,
} from '../../announcements.helpers'

interface Props {
  targets: Announcement.ITarget[]
  audienceType?: Announcement.AudienceType
  max?: number
  size?: 'small' | 'medium'
}

export function AnnouncementTargets({
  targets,
  audienceType,
  max = 3,
  size = 'small',
}: Props) {
  if (!targets.length && !audienceType) {
    return (
      <Typography fontSize={12} color={colors.grey[400]}>
        No audience
      </Typography>
    )
  }

  const visible = targets.slice(0, max)
  const rest = targets.length - visible.length
  const isSmall = size === 'small'

  return (
    <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5}>
      {targets.length === 0 && audienceType ? (
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.5,
            px: isSmall ? 0.9 : 1.25,
            py: isSmall ? 0.15 : 0.35,
            borderRadius: 999,
            bgcolor: colors.grey[100],
            border: `1px solid ${colors.grey[200]}`,
            color: colors.grey[700],
            whiteSpace: 'nowrap',
          }}
        >
          <Users size={isSmall ? 10 : 12} />
          <Typography fontSize={isSmall ? 10.5 : 12} fontWeight={600}>
            {ANNOUNCEMENT_AUDIENCE_TYPE_META[audienceType]?.label ??
              audienceType}
          </Typography>
        </Box>
      ) : null}

      {visible.map((target) => (
        <Box
          key={target.id}
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            px: isSmall ? 0.9 : 1.25,
            py: isSmall ? 0.15 : 0.35,
            borderRadius: 999,
            bgcolor: colors.indigo[50],
            border: `1px solid ${colors.indigo[100]}`,
            color: colors.indigo[700],
            whiteSpace: 'nowrap',
            maxWidth: 190,
          }}
        >
          <Typography
            fontSize={isSmall ? 10.5 : 12}
            fontWeight={600}
            noWrap
            color="inherit"
          >
            {getTargetLabel(target)}
          </Typography>
        </Box>
      ))}

      {rest > 0 ? (
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            px: isSmall ? 0.9 : 1.25,
            py: isSmall ? 0.15 : 0.35,
            borderRadius: 999,
            bgcolor: colors.grey[100],
            border: `1px solid ${colors.grey[200]}`,
            color: colors.grey[600],
            whiteSpace: 'nowrap',
          }}
        >
          <Typography fontSize={isSmall ? 10.5 : 12} fontWeight={600}>
            +{rest} more
          </Typography>
        </Box>
      ) : null}
    </Stack>
  )
}
