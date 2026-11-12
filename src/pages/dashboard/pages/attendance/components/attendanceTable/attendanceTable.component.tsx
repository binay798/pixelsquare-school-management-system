import { Fragment, useState } from 'react'
import {
  Avatar,
  Box,
  IconButton,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import { Check, CircleDot, SearchX, StickyNote, Users } from 'lucide-react'
import { ButtonComp } from '@src/components/button/button.component'
import { colors } from '@src/helpers/colors.helpers'
import { getInitials } from '../../attendance.helpers'
import { AttendanceSheetRow, AttendanceStatus } from '../../attendance.types'
import { AttendanceStatusSelector } from '../attendanceStatusSelector/attendanceStatusSelector.component'

interface Props {
  rows: AttendanceSheetRow[]
  loading: boolean
  /** size of the sheet before the local search / status filter */
  totalCount: number
  /** plural noun of the module, `students` */
  peopleLabel: string
  onStatusChange: (row: AttendanceSheetRow, status: AttendanceStatus) => void
  onNoteChange: (row: AttendanceSheetRow, note: string) => void
  onClearFilters?: () => void
  /** the search or a status card hides rows */
  filtered?: boolean
  disabled?: boolean
}

const headCellSx = {
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: 0.4,
  textTransform: 'uppercase',
  color: colors.grey[500],
  bgcolor: colors.grey[50],
  borderBottom: `1px solid ${colors.grey[200]}`,
  py: 1,
}

const badgeSx = (color: string) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '3px',
  fontSize: 10.5,
  fontWeight: 700,
  color,
})

function RowPlaceholder() {
  return (
    <TableRow>
      <TableCell sx={{ py: 1.25 }}>
        <Stack direction="row" alignItems="center" spacing={1.25}>
          <Skeleton variant="circular" width={32} height={32} />
          <Box flex={1}>
            <Skeleton variant="text" width="55%" height={16} />
            <Skeleton variant="text" width="30%" height={12} />
          </Box>
        </Stack>
      </TableCell>
      <TableCell>
        <Skeleton variant="circular" width={18} height={18} />
      </TableCell>
      <TableCell align="right">
        <Skeleton
          variant="rounded"
          width={150}
          height={28}
          sx={{ ml: 'auto' }}
        />
      </TableCell>
    </TableRow>
  )
}

function EmptyState({
  filtered,
  peopleLabel,
  onClearFilters,
}: {
  filtered: boolean
  peopleLabel: string
  onClearFilters?: () => void
}) {
  return (
    <TableRow>
      <TableCell colSpan={3} sx={{ border: 0 }}>
        <Stack alignItems="center" spacing={0.75} py={6} px={2}>
          {filtered ? (
            <SearchX size={24} color={colors.grey[400]} />
          ) : (
            <Users size={24} color={colors.grey[400]} />
          )}
          <Typography fontSize={14} fontWeight={600} color={colors.grey[700]}>
            {filtered ? 'No row matches the filters' : `No ${peopleLabel} yet`}
          </Typography>
          <Typography fontSize={12} color={colors.grey[500]} textAlign="center">
            {filtered
              ? 'Change the search or click a status card again to see everybody.'
              : 'Pick another day or another class section to load the sheet.'}
          </Typography>
          {filtered && onClearFilters ? (
            <ButtonComp size="small" variant="text" onClick={onClearFilters}>
              Clear filters
            </ButtonComp>
          ) : null}
        </Stack>
      </TableCell>
    </TableRow>
  )
}

/**
 * The sheet itself. One row per person, the status is always one click away and
 * the note is edited inline so marking a whole class never leaves the table.
 */
export function AttendanceTable({
  rows,
  loading,
  totalCount,
  peopleLabel,
  onStatusChange,
  onNoteChange,
  onClearFilters,
  filtered = false,
  disabled = false,
}: Props) {
  // only one note editor is open at a time, the labels stay aligned
  const [openNoteId, setOpenNoteId] = useState<number | null>(null)
  const isEmpty = !loading && rows.length === 0

  return (
    <TableContainer
      sx={{
        borderRadius: 3,
        border: `1px solid ${colors.grey[200]}`,
        bgcolor: '#fff',
        maxHeight: { xs: 460, md: 620 },
        overflow: 'auto',
      }}
    >
      <Table stickyHeader size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={headCellSx}>
              {peopleLabel} {totalCount > 0 ? `(${totalCount})` : ''}
            </TableCell>
            <TableCell sx={headCellSx} width={52} align="center">
              Note
            </TableCell>
            <TableCell sx={headCellSx} align="right">
              Status
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {loading
            ? Array.from({ length: 6 }).map((_, index) => (
                <RowPlaceholder key={index} />
              ))
            : null}

          {isEmpty ? (
            <EmptyState
              filtered={filtered}
              peopleLabel={peopleLabel}
              onClearFilters={onClearFilters}
            />
          ) : null}

          {!loading &&
            rows.map((row) => (
              <Fragment key={row.id}>
                <TableRow
                  hover
                  sx={{
                    '& td': {
                      borderBottom:
                        openNoteId === row.id
                          ? 'none'
                          : `1px solid ${colors.grey[100]}`,
                      py: 1,
                    },
                  }}
                >
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={1.25}>
                      <Avatar
                        src={row.photo}
                        alt={row.name}
                        sx={{
                          width: 32,
                          height: 32,
                          fontSize: 12,
                          fontWeight: 700,
                          bgcolor: colors.blue[50],
                          color: colors.blue[700],
                        }}
                      >
                        {getInitials(row.name)}
                      </Avatar>
                      <Box minWidth={0}>
                        <Typography
                          noWrap
                          sx={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: colors.grey[900],
                          }}
                        >
                          {row.name}
                        </Typography>
                        <Stack
                          direction="row"
                          alignItems="center"
                          spacing={0.75}
                          flexWrap="wrap"
                        >
                          <Typography
                            noWrap
                            sx={{ fontSize: 11, color: colors.grey[500] }}
                          >
                            {row.meta ? `${row.code} · ${row.meta}` : row.code}
                          </Typography>
                          {row.dirty ? (
                            <Box
                              component="span"
                              sx={badgeSx(colors.orange[800])}
                            >
                              <CircleDot size={9} /> Unsaved
                            </Box>
                          ) : row.attendanceId !== undefined ? (
                            <Box
                              component="span"
                              sx={badgeSx(colors.green[600])}
                            >
                              <Check size={10} /> Saved
                            </Box>
                          ) : null}
                        </Stack>
                      </Box>
                    </Stack>
                  </TableCell>

                  <TableCell align="center">
                    <Tooltip
                      title={row.currentNote ? 'Edit the note' : 'Add a note'}
                    >
                      <IconButton
                        size="small"
                        aria-label={`${
                          row.currentNote ? 'Edit' : 'Add'
                        } the note of ${row.name}`}
                        onClick={() =>
                          setOpenNoteId(openNoteId === row.id ? null : row.id)
                        }
                      >
                        <StickyNote
                          size={15}
                          color={
                            row.currentNote
                              ? colors.blue[600]
                              : colors.grey[400]
                          }
                        />
                      </IconButton>
                    </Tooltip>
                  </TableCell>

                  <TableCell align="right">
                    <AttendanceStatusSelector
                      value={row.currentStatus}
                      disabled={disabled}
                      onChange={(status) => onStatusChange(row, status)}
                    />
                  </TableCell>
                </TableRow>

                {openNoteId === row.id ? (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      sx={{
                        pt: 0,
                        pb: 1.25,
                        borderBottom: `1px solid ${colors.grey[100]}`,
                        bgcolor: colors.grey[50],
                      }}
                    >
                      <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        alignItems={{ xs: 'stretch', sm: 'center' }}
                        spacing={1}
                      >
                        <TextField
                          autoFocus
                          size="small"
                          fullWidth
                          multiline
                          maxRows={3}
                          value={row.currentNote}
                          disabled={disabled}
                          placeholder={`Remark for ${row.name} (optional)`}
                          onChange={(event) =>
                            onNoteChange(row, event.target.value)
                          }
                          inputProps={{ maxLength: 255 }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              fontSize: 13,
                              borderRadius: 2,
                              bgcolor: '#fff',
                            },
                          }}
                        />
                        <Stack
                          direction="row"
                          alignItems="center"
                          justifyContent="flex-end"
                          spacing={1}
                        >
                          <Typography
                            sx={{ fontSize: 11, color: colors.grey[500] }}
                          >
                            {row.currentNote.length}/255
                          </Typography>
                          <ButtonComp
                            size="small"
                            variant="text"
                            onClick={() => setOpenNoteId(null)}
                          >
                            Done
                          </ButtonComp>
                        </Stack>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ) : null}
              </Fragment>
            ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
