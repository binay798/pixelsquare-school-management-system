import { Card, Stack, Typography } from '@mui/material'
import { colors } from '@src/helpers/colors.helpers'

interface Props {
  label: string
  value: string | number
  hint?: string
  tone?: 'primary' | 'success' | 'warning' | 'error' | 'neutral'
}

const TONES: Record<
  NonNullable<Props['tone']>,
  { bg: string; color: string }
> = {
  primary: { bg: colors.blue[50], color: colors.blue[700] },
  success: { bg: colors.green[50], color: colors.green[700] },
  warning: { bg: colors.orange[50], color: colors.orange[800] },
  error: { bg: colors.red[50], color: colors.red[700] },
  neutral: { bg: colors.grey[100], color: colors.grey[800] },
}

export function RoomStatCard({ label, value, hint, tone = 'neutral' }: Props) {
  const palette = TONES[tone]

  return (
    <Card
      variant="outlined"
      sx={{
        p: 2,
        borderRadius: 2.5,
        bgcolor: palette.bg,
        borderColor: 'transparent',
        height: '100%',
      }}
    >
      <Stack spacing={0.5}>
        <Typography fontSize={12.5} fontWeight={600} color={palette.color}>
          {label}
        </Typography>
        <Typography variant="h5" fontWeight={700} color={palette.color}>
          {value}
        </Typography>
        {hint ? (
          <Typography fontSize={11.5} color={colors.grey[700]}>
            {hint}
          </Typography>
        ) : null}
      </Stack>
    </Card>
  )
}
