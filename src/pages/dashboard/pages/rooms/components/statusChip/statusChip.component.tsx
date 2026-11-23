import { Chip } from '@mui/material'
import { titleCase } from '../../rooms.helpers'

const COLORS: Record<
  string,
  'default' | 'success' | 'warning' | 'error' | 'info' | 'primary'
> = {
  available: 'success',
  active: 'success',
  confirmed: 'success',
  completed: 'success',
  maintenance: 'warning',
  pending: 'warning',
  in_progress: 'info',
  open: 'info',
  inactive: 'default',
  cancelled: 'error',
}

export function StatusChip({ status }: { status: string }) {
  return (
    <Chip
      size="small"
      label={titleCase(status)}
      color={COLORS[status] ?? 'default'}
      sx={{ height: 22, fontSize: 11, fontWeight: 600 }}
    />
  )
}
