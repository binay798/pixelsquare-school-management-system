import { Box, Chip, Stack, Tooltip, Typography } from '@mui/material'
import { AlertTriangle, Clock, ShieldAlert } from 'lucide-react'
import { colors } from '@src/helpers/colors.helpers'
import {
  COMPLAINT_PRIORITY_META,
  COMPLAINT_SEVERITY_META,
  COMPLAINT_STATUS_META,
  TSlaState,
  formatComplaintDateTime,
  slaStateOf,
} from '../../complaints.helpers'

/**
 * One chip component per concept so the list, the detail header and the reports
 * always render a status the same way (same pattern as the fee module).
 */

export function ComplaintStatusChip({ status }: { status: Complaint.Status }) {
  const meta = COMPLAINT_STATUS_META[status]

  return (
    <Tooltip title={meta.description} arrow>
      <Chip
        size="small"
        label={meta.label}
        sx={{
          bgcolor: meta.bg,
          color: meta.text,
          border: `1px solid ${meta.border}`,
          fontWeight: 600,
          fontSize: 11.5,
          height: 22,
        }}
      />
    </Tooltip>
  )
}

export function ComplaintPriorityChip({
  priority,
}: {
  priority: Complaint.Priority
}) {
  const meta = COMPLAINT_PRIORITY_META[priority]

  return (
    <Chip
      size="small"
      label={meta.label}
      sx={{
        bgcolor: meta.bg,
        color: meta.text,
        border: `1px solid ${meta.border}`,
        fontWeight: 600,
        fontSize: 11.5,
        height: 22,
      }}
    />
  )
}

export function ComplaintSeverityChip({
  severity,
}: {
  severity: Complaint.Severity
}) {
  const meta = COMPLAINT_SEVERITY_META[severity]

  return (
    <Chip
      size="small"
      label={meta.label}
      sx={{
        bgcolor: meta.bg,
        color: meta.text,
        border: `1px solid ${meta.border}`,
        fontWeight: 600,
        fontSize: 11.5,
        height: 22,
      }}
    />
  )
}

const SLA_META: Record<
  TSlaState,
  { label: string; color: string; bg: string; border: string }
> = {
  breached: {
    label: 'SLA breached',
    color: colors.red[700],
    bg: colors.red[50],
    border: colors.red[200],
  },
  due_soon: {
    label: 'Due soon',
    color: colors.orange[800],
    bg: colors.orange[50],
    border: colors.orange[200],
  },
  on_track: {
    label: 'On track',
    color: colors.green[700],
    bg: colors.green[50],
    border: colors.green[200],
  },
  met: {
    label: 'Met',
    color: colors.grey[700],
    bg: colors.grey[100],
    border: colors.grey[300],
  },
  none: {
    label: 'No SLA',
    color: colors.grey[600],
    bg: colors.grey[50],
    border: colors.grey[200],
  },
}

export function ComplaintSlaBadge({
  row,
}: {
  row: Pick<
    Complaint.IListRow,
    | 'status'
    | 'is_sla_breached'
    | 'first_response_at'
    | 'response_due_at'
    | 'resolution_due_at'
  >
}) {
  const state = slaStateOf(row)
  const meta = SLA_META[state]
  const due = row.resolution_due_at ?? row.response_due_at

  const icon =
    state === 'breached' ? (
      <AlertTriangle size={12} />
    ) : state === 'due_soon' ? (
      <Clock size={12} />
    ) : (
      <ShieldAlert size={12} />
    )

  return (
    <Tooltip
      title={due ? `Due ${formatComplaintDateTime(due)}` : meta.label}
      arrow
    >
      <Stack
        direction="row"
        spacing={0.5}
        alignItems="center"
        sx={{
          display: 'inline-flex',
          px: 0.75,
          py: 0.25,
          borderRadius: 1.5,
          bgcolor: meta.bg,
          border: `1px solid ${meta.border}`,
          color: meta.color,
        }}
      >
        {icon}
        <Typography fontSize={11} fontWeight={600} noWrap>
          {meta.label}
        </Typography>
      </Stack>
    </Tooltip>
  )
}

export function ComplaintConfidentialTag() {
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.5,
        fontSize: 11,
        fontWeight: 600,
        color: colors.purple[700],
        bgcolor: colors.purple[50],
        border: `1px solid ${colors.purple[200]}`,
        borderRadius: 1.5,
        px: 0.75,
        py: 0.15,
      }}
    >
      Restricted
    </Box>
  )
}
