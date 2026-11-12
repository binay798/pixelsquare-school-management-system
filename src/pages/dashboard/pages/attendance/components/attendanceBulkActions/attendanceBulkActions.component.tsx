import {
  Box,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { CheckCheck, RotateCcw, Search, UserX } from 'lucide-react'
import { ButtonComp } from '@src/components/button/button.component'
import { colors } from '@src/helpers/colors.helpers'
import { AttendanceStatus } from '../../attendance.types'

interface Props {
  search: string
  onSearchChange: (value: string) => void
  /** rows left after the search and the status cards */
  visibleCount: number
  onMarkAll: (status: AttendanceStatus) => void
  /** rows changed but not saved yet */
  dirtyCount: number
  onDiscard: () => void
  disabled?: boolean
}

/**
 * Search and bulk marking of the sheet. The bulk actions apply to the rows
 * currently visible, which is what makes them useful on a filtered sheet (only
 * the absentees of a section, only the rows still unmarked, ...).
 */
export function AttendanceBulkActions({
  search,
  onSearchChange,
  visibleCount,
  onMarkAll,
  dirtyCount,
  onDiscard,
  disabled = false,
}: Props) {
  const bulkDisabled = disabled || visibleCount === 0

  return (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      alignItems={{ xs: 'stretch', md: 'center' }}
      justifyContent="space-between"
      spacing={1}
      sx={{
        px: 1.5,
        py: 1.25,
        borderRadius: 3,
        border: `1px solid ${colors.grey[200]}`,
        bgcolor: '#fff',
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
        <TextField
          size="small"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search by name"
          disabled={disabled}
          sx={{
            width: { xs: '100%', sm: 260 },
            '& .MuiOutlinedInput-root': { fontSize: 13, borderRadius: 2 },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search size={14} color={colors.grey[500]} />
              </InputAdornment>
            ),
          }}
        />
        <Typography sx={{ fontSize: 12, color: colors.grey[500] }}>
          {visibleCount} shown
        </Typography>
      </Stack>

      <Stack
        direction="row"
        alignItems="center"
        spacing={1}
        flexWrap="wrap"
        rowGap={1}
      >
        <ButtonComp
          size="small"
          variant="outlined"
          disabled={bulkDisabled}
          startIcon={<CheckCheck size={14} />}
          tooltipTitle="Mark every visible row as present"
          tooltipPlacement="top"
          onClick={() => onMarkAll('present')}
        >
          Mark all present
        </ButtonComp>
        <ButtonComp
          size="small"
          variant="outlined"
          disabled={bulkDisabled}
          startIcon={<UserX size={14} />}
          tooltipTitle="Mark every visible row as absent"
          tooltipPlacement="top"
          onClick={() => onMarkAll('absent')}
        >
          Mark all absent
        </ButtonComp>
        {dirtyCount > 0 ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ButtonComp
              size="small"
              variant="text"
              color="error"
              startIcon={<RotateCcw size={13} />}
              onClick={onDiscard}
            >
              Discard {dirtyCount}
            </ButtonComp>
          </Box>
        ) : null}
      </Stack>
    </Stack>
  )
}
