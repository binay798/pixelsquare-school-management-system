import { Box, Stack, Typography } from '@mui/material'
import { ReactNode } from 'react'
import { colors } from '@src/helpers/colors.helpers'
import { IStatusMeta } from '../fees.helpers'

interface Props {
  meta: IStatusMeta
  label?: ReactNode
  size?: 'small' | 'medium'
  icon?: ReactNode
}

/**
 * Status pill driven by the shared metadata maps (`INVOICE_STATUS_META`, …), so
 * every screen renders the same colour for the same backend status.
 */
export function FeeStatusChip({ meta, label, size = 'small', icon }: Props) {
  const isSmall = size === 'small'

  return (
    <Stack
      component="span"
      direction="row"
      spacing={0.75}
      alignItems="center"
      sx={{
        display: 'inline-flex',
        px: isSmall ? 1 : 1.25,
        py: isSmall ? 0.3 : 0.5,
        borderRadius: 999,
        bgcolor: meta.bg,
        border: `1px solid ${meta.border}`,
        color: meta.text,
        fontSize: isSmall ? 11.5 : 12.5,
        fontWeight: 600,
        whiteSpace: 'nowrap',
        lineHeight: 1.4,
      }}
    >
      {icon ?? (
        <Box
          component="span"
          sx={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            bgcolor: meta.dot,
            flexShrink: 0,
          }}
        />
      )}
      {label ?? meta.label}
    </Stack>
  )
}

interface DotProps {
  color: string
  label: string
}

/** Small inline legend chip (charts, summary rows). */
export function FeeLegendItem({ color, label }: DotProps) {
  return (
    <Stack direction="row" spacing={0.75} alignItems="center">
      <Box
        sx={{ width: 8, height: 8, borderRadius: 0.5, bgcolor: color }}
        component="span"
      />
      <Typography fontSize={12} color={colors.grey[600]}>
        {label}
      </Typography>
    </Stack>
  )
}
