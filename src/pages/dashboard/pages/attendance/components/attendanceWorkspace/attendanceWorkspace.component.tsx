import { ReactNode, useMemo, useState } from 'react'
import { Box, Stack, Typography } from '@mui/material'
import { CalendarCheck, RefreshCw } from 'lucide-react'
import moment from 'moment'
import { ButtonComp } from '@src/components/button/button.component'
import { ConfirmationModal } from '@src/components/confirmationModal/confirmationModal.component'
import { colors } from '@src/helpers/colors.helpers'
import {
  buildSubmissionPlan,
  formatAttendanceDay,
  formatSavedAt,
  isToday,
} from '../../attendance.helpers'
import {
  AttendancePerson,
  AttendanceSubmissionPlan,
} from '../../attendance.types'
import { useAttendanceSheet } from '../../hooks/useAttendanceSheet.hooks'
import { AttendanceBulkActions } from '../attendanceBulkActions/attendanceBulkActions.component'
import { AttendanceDateField } from '../attendanceFilters/attendanceDateField.component'
import { AttendanceFilters } from '../attendanceFilters/attendanceFilters.component'
import { AttendanceHistory } from '../attendanceHistory/attendanceHistory.component'
import { AttendancePageHeader } from '../attendancePageHeader/attendancePageHeader.component'
import { AttendanceSubmissionBar } from '../attendanceSubmissionBar/attendanceSubmissionBar.component'
import { AttendanceSummary } from '../attendanceSummary/attendanceSummary.component'
import { AttendanceTable } from '../attendanceTable/attendanceTable.component'

interface Props {
  title: string
  subtitle: string
  /** plural noun of the module, used by the table and the empty states */
  peopleLabel: string
  /** identity of the loaded sheet, drops the drafts when it changes */
  sheetKey: string
  people: AttendancePerson[]
  loading: boolean
  saving: boolean
  /** no class section selected yet, or the sheet is being reloaded */
  disabled?: boolean
  /** `YYYY-MM-DD` */
  date: string
  onDateChange: (date: string) => void
  onRefresh?: () => void
  /** module specific filters (class / class section) */
  filters?: ReactNode
  hasActiveFilters?: boolean
  onResetFilters?: () => void
  badges?: string[]
  /** writes the plan with the actions of the module and reloads the sheet */
  onSubmit: (plan: AttendanceSubmissionPlan) => Promise<boolean>
}

/**
 * Shared body of the student, teacher and employee attendance screens.
 *
 * Everything which is common to the three modules lives here: the day picker,
 * the summary, the sheet, the bulk marking, the submission and the report. The
 * pages only fetch their own endpoint and map their own rows, so the three
 * screens cannot drift apart.
 */
export function AttendanceWorkspace({
  title,
  subtitle,
  peopleLabel,
  sheetKey,
  people,
  loading,
  saving,
  disabled = false,
  date,
  onDateChange,
  onRefresh,
  filters,
  hasActiveFilters = false,
  onResetFilters,
  badges = [],
  onSubmit,
}: Props) {
  const sheet = useAttendanceSheet({ people, sheetKey })
  const plan = useMemo(() => buildSubmissionPlan(sheet.rows), [sheet.rows])
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [savedAtLabel, setSavedAtLabel] = useState('')

  const filtered =
    sheet.search.trim().length > 0 || sheet.statusFilter !== 'all'
  const writable = plan.creates.length + plan.updates.length

  const resetFilters = () => {
    sheet.setSearch('')
    sheet.setStatusFilter('all')
    onResetFilters?.()
  }

  const unmarkedHint =
    sheet.stats.unmarked === 0
      ? undefined
      : plan.hasSavedRecords
      ? `${sheet.stats.unmarked} people have no status and will stay unmarked.`
      : `${sheet.stats.unmarked} people have no status, they will be saved as absent.`

  const handleConfirm = async () => {
    const done = await onSubmit(plan)

    if (done) {
      setSavedAtLabel(formatSavedAt(new Date()))
    }

    setConfirmOpen(false)
  }

  return (
    <Box>
      <Stack spacing={2}>
        <AttendancePageHeader
          title={title}
          subtitle={subtitle}
          badges={badges}
          actions={
            <>
              {onRefresh ? (
                <ButtonComp
                  size="small"
                  variant="outlined"
                  startIcon={<RefreshCw size={14} />}
                  loading={loading}
                  onClick={onRefresh}
                >
                  Reload
                </ButtonComp>
              ) : null}
              <ButtonComp
                size="small"
                variant="outlined"
                startIcon={<CalendarCheck size={14} />}
                disabled={isToday(date) || loading}
                onClick={() => onDateChange(moment().format('YYYY-MM-DD'))}
              >
                Today
              </ButtonComp>
            </>
          }
        />

        <AttendanceFilters
          hasActiveFilters={hasActiveFilters || filtered}
          onReset={resetFilters}
          columns={3}
        >
          {filters}
          <AttendanceDateField
            date={date}
            onChange={onDateChange}
            disabled={loading}
          />
        </AttendanceFilters>

        <AttendanceSummary
          stats={sheet.stats}
          activeFilter={sheet.statusFilter}
          onFilterChange={sheet.setStatusFilter}
          loading={loading}
        />

        <AttendanceBulkActions
          search={sheet.search}
          onSearchChange={sheet.setSearch}
          visibleCount={sheet.visibleRows.length}
          onMarkAll={(status) => sheet.markRows(sheet.visibleRows, status)}
          dirtyCount={sheet.stats.dirty}
          onDiscard={sheet.resetDraft}
          disabled={disabled}
        />

        <AttendanceTable
          rows={sheet.visibleRows}
          loading={loading}
          totalCount={sheet.rows.length}
          peopleLabel={peopleLabel}
          onStatusChange={sheet.setStatus}
          onNoteChange={sheet.setNote}
          onClearFilters={resetFilters}
          filtered={filtered}
          disabled={disabled}
        />

        <AttendanceSubmissionBar
          stats={sheet.stats}
          saving={saving}
          canSubmit={writable > 0}
          hasSavedRecords={plan.hasSavedRecords}
          unmarkedHint={unmarkedHint}
          savedAtLabel={savedAtLabel}
          onSave={() => setConfirmOpen(true)}
          disabled={disabled}
        />

        <AttendanceHistory
          rows={sheet.rows}
          stats={sheet.stats}
          date={date}
          savedAtLabel={savedAtLabel}
          loading={loading}
          disabled={disabled}
        />
      </Stack>

      <ConfirmationModal
        open={confirmOpen}
        heading={`${
          plan.hasSavedRecords ? 'Update' : 'Save'
        } the attendance of ${formatAttendanceDay(date)}?`}
        confirmText={plan.hasSavedRecords ? 'Update' : 'Save'}
        confirmLoader={saving}
        onClose={() => setConfirmOpen(false)}
        onConfirmationClick={handleConfirm}
      >
        <Stack spacing={0.5} alignItems="center">
          <Typography sx={{ fontSize: 13, color: colors.grey[700] }}>
            {peopleLabel} of {formatAttendanceDay(date)}
          </Typography>
          <Typography sx={{ fontSize: 12.5, color: colors.grey[600] }}>
            {sheet.stats.present} present · {sheet.stats.absent} absent ·{' '}
            {sheet.stats.leave} on leave
            {sheet.stats.unmarked > 0
              ? ` · ${sheet.stats.unmarked} not marked`
              : ''}
          </Typography>
          <Typography
            sx={{ fontSize: 12, color: colors.grey[500], textAlign: 'center' }}
          >
            {plan.creates.length > 0
              ? `${plan.creates.length} record${
                  plan.creates.length > 1 ? 's' : ''
                } will be created`
              : ''}
            {plan.creates.length > 0 && plan.updates.length > 0 ? ' and ' : ''}
            {plan.updates.length > 0
              ? `${plan.updates.length} record${
                  plan.updates.length > 1 ? 's' : ''
                } will be updated`
              : ''}
          </Typography>
        </Stack>
      </ConfirmationModal>
    </Box>
  )
}
