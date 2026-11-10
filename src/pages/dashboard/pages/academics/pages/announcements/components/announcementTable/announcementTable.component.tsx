import {
  Box,
  IconButton,
  Menu,
  MenuItem,
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
import { useState } from 'react'
import {
  ArrowUpRight,
  BarChart3,
  MoreVertical,
  Pencil,
  Pin,
  Trash2,
} from 'lucide-react'
import { colors } from '@src/helpers/colors.helpers'
import {
  ANNOUNCEMENT_STATUS_META,
  formatAnnouncementDate,
  getAllowedTransitions,
  getPersonName,
  isAnnouncementLocked,
} from '../../announcements.helpers'
import {
  AnnouncementPriorityChip,
  AnnouncementStatusChip,
} from '../statusChip/announcementStatusChip.component'
import { AnnouncementTargets } from '../targets/announcementTargets.component'

interface Props {
  rows: Announcement.IListRow[]
  loading?: boolean
  canModify?: boolean
  onView: (row: Announcement.IListRow) => void
  onEdit: (row: Announcement.IListRow) => void
  onRecipients: (row: Announcement.IListRow) => void
  onDelete?: (row: Announcement.IListRow) => void
  onStatusChange?: (
    row: Announcement.IListRow,
    status: Announcement.Status
  ) => void
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

export function AnnouncementTable({
  rows,
  loading = false,
  canModify = false,
  onView,
  onEdit,
  onRecipients,
  onDelete,
  onStatusChange,
}: Props) {
  return (
    <TableContainer
      sx={{
        borderRadius: 3,
        border: `1px solid ${colors.grey[200]}`,
        bgcolor: '#fff',
        overflow: 'hidden',
      }}
    >
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={headerCellSx}>Announcement</TableCell>
            <TableCell sx={headerCellSx}>Audience</TableCell>
            <TableCell sx={headerCellSx}>Priority</TableCell>
            <TableCell sx={headerCellSx}>Status</TableCell>
            <TableCell sx={headerCellSx}>Reach</TableCell>
            <TableCell sx={headerCellSx}>Author</TableCell>
            <TableCell sx={headerCellSx} align="right">
              Actions
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {loading
            ? Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  {Array.from({ length: 7 }).map((__, cellIndex) => (
                    <TableCell key={cellIndex}>
                      <Skeleton height={28} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            : null}

          {!loading && rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7}>
                <Stack alignItems="center" py={6} spacing={0.5}>
                  <Typography
                    fontSize={14}
                    fontWeight={600}
                    color={colors.grey[700]}
                  >
                    No announcements found
                  </Typography>
                  <Typography fontSize={12} color={colors.grey[500]}>
                    Adjust the filters or publish a new notice.
                  </Typography>
                </Stack>
              </TableCell>
            </TableRow>
          ) : null}

          {!loading && rows.length > 0
            ? rows.map((row) => (
                <AnnouncementTableRow
                  key={row.announcement_details.id}
                  row={row}
                  canModify={canModify}
                  onView={onView}
                  onEdit={onEdit}
                  onRecipients={onRecipients}
                  onDelete={onDelete}
                  onStatusChange={onStatusChange}
                />
              ))
            : null}
        </TableBody>
      </Table>
    </TableContainer>
  )

  interface RowProps {
    row: Announcement.IListRow
    canModify: boolean
    onView: (row: Announcement.IListRow) => void
    onEdit: (row: Announcement.IListRow) => void
    onRecipients: (row: Announcement.IListRow) => void
    onDelete?: (row: Announcement.IListRow) => void
    onStatusChange?: (
      row: Announcement.IListRow,
      status: Announcement.Status
    ) => void
  }

  function AnnouncementTableRow({
    row,
    canModify,
    onView,
    onEdit,
    onRecipients,
    onDelete,
    onStatusChange,
  }: RowProps) {
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
    const announcement = row.announcement_details
    const locked = isAnnouncementLocked(announcement.status)
    const transitions = getAllowedTransitions(announcement.status).filter(
      (status) => status !== announcement.status
    )

    return (
      <TableRow hover sx={{ cursor: 'pointer' }} onClick={() => onView(row)}>
        <TableCell sx={{ py: 1.5, maxWidth: 320 }}>
          <Stack spacing={0.25}>
            <Stack direction="row" alignItems="center" spacing={0.75}>
              {announcement.is_pinned ? (
                <Pin size={12} color={colors.orange[600]} />
              ) : null}
              <Typography
                fontSize={13.5}
                fontWeight={600}
                color={colors.grey[900]}
                noWrap
              >
                {announcement.title}
              </Typography>
              {announcement.require_acknowledgement ? (
                <Tooltip title="Acknowledgement required">
                  <Box
                    sx={{
                      px: 0.6,
                      py: 0.05,
                      borderRadius: 1,
                      bgcolor: colors.amber[50],
                      border: `1px solid ${colors.amber[200]}`,
                      color: colors.amber[800],
                      fontSize: 9.5,
                      fontWeight: 700,
                    }}
                  >
                    ACK
                  </Box>
                </Tooltip>
              ) : null}
            </Stack>
            <Typography fontSize={11.5} color={colors.grey[500]} noWrap>
              {formatAnnouncementDate(
                announcement.publish_at,
                'DD MMM YYYY, hh:mm A'
              )}
              {' · '}
              {ANNOUNCEMENT_STATUS_META[announcement.status].label}
            </Typography>
          </Stack>
        </TableCell>
        <TableCell sx={{ maxWidth: 220 }}>
          <AnnouncementTargets
            targets={row.targets_details ?? []}
            audienceType={announcement.audience_type}
            max={2}
          />
        </TableCell>
        <TableCell>
          <AnnouncementPriorityChip priority={announcement.priority} />
        </TableCell>
        <TableCell>
          <AnnouncementStatusChip status={announcement.status} size="small" />
        </TableCell>
        <TableCell>
          <Stack spacing={0.25}>
            <Typography fontSize={12.5} color={colors.grey[800]}>
              {Number(row.read_count ?? 0)} read
            </Typography>
            <Typography fontSize={11} color={colors.grey[500]}>
              {Number(row.acknowledgement_count ?? 0)} acknowledged
            </Typography>
          </Stack>
        </TableCell>
        <TableCell>
          <Typography fontSize={12.5} color={colors.grey[700]} noWrap>
            {getPersonName(row.creator_details)}
          </Typography>
        </TableCell>
        <TableCell align="right" onClick={(event) => event.stopPropagation()}>
          <Stack direction="row" spacing={0.25} justifyContent="flex-end">
            <Tooltip title="Recipients">
              <IconButton size="small" onClick={() => onRecipients(row)}>
                <BarChart3 size={14} color={colors.grey[600]} />
              </IconButton>
            </Tooltip>
            {canModify && !locked ? (
              <Tooltip title="Edit">
                <IconButton size="small" onClick={() => onEdit(row)}>
                  <Pencil size={14} color={colors.grey[600]} />
                </IconButton>
              </Tooltip>
            ) : null}
            {canModify && onStatusChange && transitions.length > 0 ? (
              <>
                <Tooltip title="Change status">
                  <IconButton
                    size="small"
                    onClick={(event) => setAnchorEl(event.currentTarget)}
                  >
                    <MoreVertical size={14} color={colors.grey[600]} />
                  </IconButton>
                </Tooltip>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={() => setAnchorEl(null)}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                >
                  {transitions.map((status) => (
                    <MenuItem
                      key={status}
                      onClick={() => {
                        setAnchorEl(null)
                        onStatusChange(row, status)
                      }}
                      sx={{ fontSize: 13 }}
                    >
                      Move to {ANNOUNCEMENT_STATUS_META[status].label}
                    </MenuItem>
                  ))}
                </Menu>
              </>
            ) : null}
            {canModify && onDelete ? (
              <Tooltip title="Delete">
                <IconButton size="small" onClick={() => onDelete(row)}>
                  <Trash2 size={14} color={colors.red[400]} />
                </IconButton>
              </Tooltip>
            ) : null}
            <Tooltip title="Open">
              <IconButton size="small" onClick={() => onView(row)}>
                <ArrowUpRight size={15} color={colors.blue[600]} />
              </IconButton>
            </Tooltip>
          </Stack>
        </TableCell>
      </TableRow>
    )
  }
}
