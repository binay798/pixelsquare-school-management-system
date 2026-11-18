import {
  Box,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material'
import { Lock, UserRound } from 'lucide-react'
import { colors } from '@src/helpers/colors.helpers'
import { complaintInitials, fromNow } from '../../complaints.helpers'
import {
  ComplaintPriorityChip,
  ComplaintSeverityChip,
  ComplaintSlaBadge,
  ComplaintStatusChip,
} from '../statusChip/complaintStatusChip.component'

interface Props {
  rows: Complaint.IListRow[]
  loading?: boolean
  onView: (row: Complaint.IListRow) => void
  emptyMessage?: string
}

const headerCellSx = {
  fontSize: 11.5,
  fontWeight: 700,
  letterSpacing: 0.4,
  textTransform: 'uppercase' as const,
  color: colors.grey[500],
  borderBottom: `1px solid ${colors.grey[200]}`,
  py: 1.25,
  whiteSpace: 'nowrap' as const,
}

export function ComplaintTable({
  rows,
  loading = false,
  onView,
  emptyMessage = 'No complaints match these filters.',
}: Props) {
  if (loading && rows.length === 0) {
    return (
      <Box
        sx={{
          borderRadius: 3,
          border: `1px solid ${colors.grey[200]}`,
          bgcolor: '#fff',
          p: 2,
        }}
      >
        {[0, 1, 2, 3, 4].map((key) => (
          <Skeleton key={key} height={52} />
        ))}
      </Box>
    )
  }

  if (rows.length === 0) {
    return (
      <Box
        sx={{
          borderRadius: 3,
          border: `1px dashed ${colors.grey[300]}`,
          bgcolor: colors.grey[50],
          py: 6,
          textAlign: 'center',
        }}
      >
        <Typography fontSize={14} fontWeight={600} color={colors.grey[700]}>
          {emptyMessage}
        </Typography>
        <Typography fontSize={12.5} color={colors.grey[500]} mt={0.5}>
          Log a complaint from the office when the first one arrives.
        </Typography>
      </Box>
    )
  }

  return (
    <TableContainer
      sx={{
        borderRadius: 3,
        border: `1px solid ${colors.grey[200]}`,
        bgcolor: '#fff',
      }}
    >
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={headerCellSx}>Complaint</TableCell>
            <TableCell sx={headerCellSx}>Category</TableCell>
            <TableCell sx={headerCellSx}>Complainant</TableCell>
            <TableCell sx={headerCellSx}>Status</TableCell>
            <TableCell sx={headerCellSx}>Priority</TableCell>
            <TableCell sx={headerCellSx}>Severity</TableCell>
            <TableCell sx={headerCellSx}>Assignee</TableCell>
            <TableCell sx={headerCellSx}>Logged</TableCell>
            <TableCell sx={headerCellSx}>SLA</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow
              key={row.id}
              hover
              onClick={() => onView(row)}
              sx={{
                cursor: 'pointer',
                bgcolor: row.is_sla_breached ? colors.red[50] : undefined,
                '& td': { py: 1.25, verticalAlign: 'top' },
              }}
            >
              <TableCell>
                <Stack spacing={0.25} sx={{ maxWidth: 280 }}>
                  <Stack direction="row" spacing={0.75} alignItems="center">
                    <Typography
                      fontSize={11}
                      fontWeight={700}
                      color={colors.grey[500]}
                    >
                      {row.complaint_no}
                    </Typography>
                    {row.is_confidential ? (
                      <Tooltip title="Restricted to admins and the assignee">
                        <Box
                          sx={{ display: 'flex', color: colors.purple[600] }}
                        >
                          <Lock size={12} />
                        </Box>
                      </Tooltip>
                    ) : null}
                    {row.escalation_level > 0 ? (
                      <Typography
                        fontSize={10.5}
                        fontWeight={700}
                        color={colors.red[700]}
                      >
                        L{row.escalation_level}
                      </Typography>
                    ) : null}
                    {row.merged_into_no ? (
                      <Typography fontSize={10.5} color={colors.grey[500]}>
                        → {row.merged_into_no}
                      </Typography>
                    ) : null}
                  </Stack>
                  <Typography
                    fontSize={13}
                    fontWeight={600}
                    color={colors.grey[900]}
                    sx={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {row.title}
                  </Typography>
                </Stack>
              </TableCell>
              <TableCell>
                <Typography fontSize={12.5} color={colors.grey[800]}>
                  {row.category_name}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography fontSize={12.5} color={colors.grey[800]} noWrap>
                  {row.is_anonymous ? 'Anonymous' : row.complainant_name ?? '—'}
                </Typography>
                {row.complainant_phone ? (
                  <Typography fontSize={11} color={colors.grey[500]}>
                    {row.complainant_phone}
                  </Typography>
                ) : null}
              </TableCell>
              <TableCell>
                <ComplaintStatusChip status={row.status} />
              </TableCell>
              <TableCell>
                <ComplaintPriorityChip priority={row.priority} />
              </TableCell>
              <TableCell>
                <ComplaintSeverityChip severity={row.severity} />
              </TableCell>
              <TableCell>
                <Stack direction="row" spacing={0.75} alignItems="center">
                  <Box
                    sx={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      bgcolor: colors.blue[50],
                      color: colors.blue[700],
                      display: 'grid',
                      placeItems: 'center',
                      fontSize: 10,
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {row.assignee_name ? (
                      complaintInitials(row.assignee_name)
                    ) : (
                      <UserRound size={12} />
                    )}
                  </Box>
                  <Typography fontSize={12.5} color={colors.grey[800]} noWrap>
                    {row.assignee_name ?? row.department_name ?? 'Unassigned'}
                  </Typography>
                </Stack>
              </TableCell>
              <TableCell>
                <Tooltip title={row.created_at} arrow>
                  <Typography fontSize={12.5} color={colors.grey[700]}>
                    {fromNow(row.created_at)}
                  </Typography>
                </Tooltip>
              </TableCell>
              <TableCell>
                <ComplaintSlaBadge row={row} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
