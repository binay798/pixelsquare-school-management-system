import { Box, Stack, Typography } from '@mui/material'
import { LESSON_PLAN_STATUS_META, IStatusMeta } from '../../lessonPlan.helpers'

interface Props {
  status: LessonPlan.Status
  size?: 'small' | 'medium'
}

export function getStatusMeta(status?: LessonPlan.Status | null): IStatusMeta {
  return (
    LESSON_PLAN_STATUS_META[status ?? 'draft'] ?? LESSON_PLAN_STATUS_META.draft
  )
}

export function PlanStatusChip({ status, size = 'medium' }: Props) {
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
