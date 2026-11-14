import { Box, Checkbox, Stack, Typography } from '@mui/material'
import { useCallback, useEffect, useState } from 'react'
import moment from 'moment'
import { Bell, Mail, MessageSquare, Users } from 'lucide-react'
import { colors } from '@src/helpers/colors.helpers'
import { ButtonComp } from '@src/components/button/button.component'
import { SelectField } from '@src/components/select/select.component'
import { CustomDatePicker } from '@src/components/datePicker/datePicker.component'
import SpringModal from '@src/components/modal/modal.component'
import { useFeePermissions } from '@src/hooks/useFeePermissions.hooks'
import { useDispatch, useSelector } from '@src/store/hooks.store'
import {
  dispatchRemindersAction,
  getAgingSummaryAction,
  getDefaultersAction,
  scheduleRemindersAction,
} from '@src/store/redux/dashboard/fee/fee.dashboard.slice'
import { IDefaulterFilters } from '@src/store/redux/dashboard/fee/fee.service'
import {
  FeeAmount,
  FeeCellStack,
  FeeDataTable,
  IFeeColumn,
} from '../../components/feeDataTable.component'
import { FeePageHeader } from '../../components/feePageHeader.component'
import { FeePanel } from '../../components/feePanel.component'
import { FeeFilterBar } from '../../components/feeFilterBar.component'
import {
  FeeStatCard,
  FeeStatGrid,
} from '../../components/feeStatCard.component'
import { FeeStatusChip } from '../../components/feeStatusChip.component'
import {
  AGING_BUCKET_META,
  AGING_BUCKET_OPTIONS,
  formatDate,
  formatMoney,
  fullName,
  IOption,
} from '../../fees.helpers'
import { useFeeReference } from '../../hooks/useFeeReference.hooks'

const PAGE_LIMIT = 20

const BUCKET_KEYS: Fee.AgingBucket[] = [
  'NOT_DUE',
  'DAYS_1_30',
  'DAYS_31_60',
  'DAYS_61_90',
  'ABOVE_90',
]

export function FeeDefaultersPage() {
  const dispatch = useDispatch()
  const { can } = useFeePermissions()
  const { years } = useFeeReference()

  const { data: defaulters, loading } = useSelector(
    (store) => store.feeDashboard.defaulters
  )
  const { data: aging, loading: agingLoading } = useSelector(
    (store) => store.feeDashboard.aging
  )
  const {
    loading: reminderBusy,
    scheduleResult,
    dispatchResult,
  } = useSelector((store) => store.feeDashboard.reminderMutation)

  const [filters, setFilters] = useState<IDefaulterFilters>({})
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<number[]>([])
  const [reminderOpen, setReminderOpen] = useState(false)
  const [channels, setChannels] = useState<Fee.ReminderChannel[]>([
    'SMS',
    'EMAIL',
  ])

  const load = useCallback(() => {
    dispatch(getDefaultersAction({ filters, page, limit: PAGE_LIMIT }))
  }, [dispatch, filters, page])

  useEffect(() => {
    load()
    dispatch(
      getAgingSummaryAction({ academic_year_id: filters.academic_year_id })
    )
  }, [load, dispatch, filters.academic_year_id])

  const rows = defaulters?.rows ?? []
  const total = Number(defaulters?.total ?? 0)
  const totalPages = Math.max(1, Math.ceil(total / PAGE_LIMIT))

  const toggle = (invoiceId: number) =>
    setSelected((prev) =>
      prev.includes(invoiceId)
        ? prev.filter((id) => id !== invoiceId)
        : [...prev, invoiceId]
    )

  const columns: IFeeColumn<Fee.IDefaulterRow>[] = [
    {
      key: 'select',
      label: '',
      width: 40,
      render: (row) => (
        <Checkbox
          size="small"
          checked={selected.includes(row.invoice_id)}
          onChange={() => toggle(row.invoice_id)}
        />
      ),
    },
    {
      key: 'student',
      label: 'Student',
      render: (row) => (
        <FeeCellStack
          primary={fullName(row.firstname, row.lastname)}
          secondary={`Student #${row.student_id}`}
        />
      ),
    },
    {
      key: 'class_name',
      label: 'Class',
      hideBelow: 'md',
      render: (row) => (
        <FeeCellStack
          primary={row.class_name ?? '—'}
          secondary={row.section_name ?? undefined}
        />
      ),
    },
    {
      key: 'guardian',
      label: 'Billing guardian',
      hideBelow: 'lg',
      render: (row) => (
        <Typography fontSize={12} color={colors.grey[700]}>
          {row.guardian_id
            ? fullName(row.guardian_firstname, row.guardian_lastname)
            : 'No billing contact'}
        </Typography>
      ),
    },
    {
      key: 'invoice_number',
      label: 'Invoice',
      render: (row) => (
        <FeeCellStack
          primary={row.invoice_number}
          secondary={`due ${formatDate(row.due_date)}`}
        />
      ),
    },
    {
      key: 'outstanding_amount',
      label: 'Outstanding',
      align: 'right',
      render: (row) => (
        <FeeAmount
          value={formatMoney(row.outstanding_amount)}
          tone="danger"
          strong
        />
      ),
    },
    {
      key: 'overdue_days',
      label: 'Overdue',
      align: 'right',
      render: (row) => (
        <Typography fontSize={12.5} color={colors.grey[700]}>
          {row.overdue_days > 0 ? `${row.overdue_days} d` : '—'}
        </Typography>
      ),
    },
    {
      key: 'aging_bucket',
      label: 'Bucket',
      render: (row) => (
        <FeeStatusChip meta={AGING_BUCKET_META[row.aging_bucket]} />
      ),
    },
  ]

  return (
    <Box>
      <FeePageHeader
        title="Defaulters"
        subtitle="Open invoices with their aging bucket and the financially responsible guardian. Reminders are deduplicated by the backend."
        backTo="/dashboard/fees"
        actions={
          can('fee.notifications.send') ? (
            <>
              <ButtonComp
                variant="outlined"
                size="small"
                startIcon={<Bell size={14} />}
                onClick={() => setReminderOpen(true)}
              >
                Send reminders
              </ButtonComp>
              <ButtonComp
                size="small"
                startIcon={<Bell size={14} />}
                onClick={() => setReminderOpen(true)}
              >
                Bulk reminder ({selected.length || rows.length})
              </ButtonComp>
            </>
          ) : null
        }
      />

      <Box mb={2}>
        <FeeStatGrid columns={{ xs: 2, sm: 3, md: 5, xl: 5 }}>
          <FeeStatCard
            label="Total outstanding"
            value={formatMoney(aging?.total_outstanding)}
            caption={`as of ${formatDate(aging?.as_of_date)}`}
            icon={<Users size={15} />}
            accent={colors.red[600]}
            soft={colors.red[50]}
            loading={agingLoading}
          />
          {BUCKET_KEYS.map((key) => (
            <FeeStatCard
              key={key}
              label={AGING_BUCKET_META[key].label}
              value={formatMoney(aging?.buckets?.[key])}
              caption={
                filters.bucket === key ? 'Filtering this bucket' : 'Outstanding'
              }
              icon={<MessageSquare size={15} />}
              accent={AGING_BUCKET_META[key].dot}
              soft={AGING_BUCKET_META[key].bg}
              loading={agingLoading}
              active={filters.bucket === key}
              onClick={() => {
                setFilters((prev) => ({
                  ...prev,
                  bucket: prev.bucket === key ? undefined : key,
                }))
                setPage(1)
              }}
            />
          ))}
        </FeeStatGrid>
      </Box>

      <Box mb={1.75}>
        <FeeFilterBar
          active={Boolean(
            filters.academic_year_id ||
              filters.bucket ||
              filters.due_from ||
              filters.due_to
          )}
          onClear={() => {
            setFilters({})
            setPage(1)
          }}
          columns={4}
        >
          <Box>
            <Typography fontSize={12} color={colors.grey[600]} mb={0.75}>
              Academic year
            </Typography>
            <SelectField
              isClearable
              placeholder="All years"
              options={years}
              value={
                years.find(
                  (option) => option.value === String(filters.academic_year_id)
                ) ?? null
              }
              onChange={(option) => {
                setFilters((prev) => ({
                  ...prev,
                  academic_year_id: (option as IOption | null)?.value
                    ? Number((option as IOption).value)
                    : undefined,
                }))
                setPage(1)
              }}
            />
          </Box>
          <Box>
            <Typography fontSize={12} color={colors.grey[600]} mb={0.75}>
              Aging bucket
            </Typography>
            <SelectField
              isClearable
              placeholder="All buckets"
              options={AGING_BUCKET_OPTIONS}
              value={
                AGING_BUCKET_OPTIONS.find(
                  (option) => option.value === filters.bucket
                ) ?? null
              }
              onChange={(option) => {
                setFilters((prev) => ({
                  ...prev,
                  bucket: (option as IOption | null)?.value ?? undefined,
                }))
                setPage(1)
              }}
            />
          </Box>
          <Box>
            <CustomDatePicker
              labelDetail={{ text: 'Due from', required: false }}
              views={['day', 'month', 'year']}
              value={filters.due_from ? moment(filters.due_from) : null}
              onChange={(value) => {
                setFilters((prev) => ({
                  ...prev,
                  due_from:
                    value && moment(value).isValid()
                      ? moment(value).format('YYYY-MM-DD')
                      : undefined,
                }))
                setPage(1)
              }}
              slotProps={{ textField: { size: 'small' } }}
            />
          </Box>
          <Box>
            <CustomDatePicker
              labelDetail={{ text: 'Due to', required: false }}
              views={['day', 'month', 'year']}
              value={filters.due_to ? moment(filters.due_to) : null}
              onChange={(value) => {
                setFilters((prev) => ({
                  ...prev,
                  due_to:
                    value && moment(value).isValid()
                      ? moment(value).format('YYYY-MM-DD')
                      : undefined,
                }))
                setPage(1)
              }}
              slotProps={{ textField: { size: 'small' } }}
            />
          </Box>
        </FeeFilterBar>
      </Box>

      <FeePanel
        noPadding
        title={`${total} overdue invoice${total === 1 ? '' : 's'}`}
        subtitle="Select invoices to send a targeted reminder, or send to the whole filtered list."
        footer={
          <Stack direction="row" spacing={1} alignItems="center">
            {totalPages > 1 ? (
              <ButtonComp
                size="small"
                variant="text"
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={page === 1}
              >
                Prev
              </ButtonComp>
            ) : null}
            <Typography fontSize={12} color={colors.grey[600]}>
              Page {page} / {totalPages}
            </Typography>
            {totalPages > 1 ? (
              <ButtonComp
                size="small"
                variant="text"
                onClick={() =>
                  setPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={page === totalPages}
              >
                Next
              </ButtonComp>
            ) : null}
          </Stack>
        }
      >
        <FeeDataTable
          columns={columns}
          rows={rows}
          rowKey={(row) => row.invoice_id}
          loading={loading}
          skeletonRows={6}
          emptyTitle="No defaulter"
          emptyDescription="Every open invoice is within its due date."
        />
      </FeePanel>

      <SpringModal
        open={reminderOpen}
        close={() => setReminderOpen(false)}
        size="sm"
      >
        <Box sx={{ minWidth: { xs: 'auto', sm: 480 } }}>
          <Typography fontSize={16} fontWeight={700}>
            Send fee reminders
          </Typography>
          <Typography
            fontSize={12.5}
            color={colors.grey[500]}
            mt={0.25}
            mb={1.5}
          >
            The backend creates one reminder per invoice, guardian and channel
            per day — running it twice never spams a guardian.
          </Typography>

          <Stack direction="row" spacing={2} mb={1.5}>
            {(['SMS', 'EMAIL', 'IN_APP'] as Fee.ReminderChannel[]).map(
              (channel) => (
                <Stack key={channel} direction="row" alignItems="center">
                  <Checkbox
                    size="small"
                    checked={channels.includes(channel)}
                    onChange={(event) =>
                      setChannels((prev) =>
                        event.target.checked
                          ? [...prev, channel]
                          : prev.filter((item) => item !== channel)
                      )
                    }
                  />
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    {channel === 'EMAIL' ? (
                      <Mail size={13} />
                    ) : (
                      <MessageSquare size={13} />
                    )}
                    <Typography fontSize={12.5}>
                      {channel === 'IN_APP' ? 'In-app' : channel}
                    </Typography>
                  </Stack>
                </Stack>
              )
            )}
          </Stack>

          <Typography fontSize={12.5} color={colors.grey[700]}>
            Targets:{' '}
            <strong>
              {selected.length
                ? `${selected.length} selected invoice(s)`
                : `all ${rows.length} invoice(s) of this page`}
            </strong>
          </Typography>

          {scheduleResult ? (
            <Box
              sx={{
                mt: 1.25,
                p: 1.25,
                borderRadius: 2,
                bgcolor: colors.green[50],
                border: `1px solid ${colors.green[200]}`,
              }}
            >
              <Typography fontSize={12.5} color={colors.green[900]}>
                {scheduleResult.scheduled} scheduled · {scheduleResult.skipped}{' '}
                skipped (already reminded today)
              </Typography>
            </Box>
          ) : null}

          {dispatchResult ? (
            <Box
              sx={{
                mt: 1.25,
                p: 1.25,
                borderRadius: 2,
                bgcolor: colors.blue[50],
                border: `1px solid ${colors.blue[200]}`,
              }}
            >
              <Typography fontSize={12.5} color={colors.blue[900]}>
                {dispatchResult.sent} reminder(s) dispatched ·{' '}
                {dispatchResult.failed} failed
              </Typography>
            </Box>
          ) : null}

          <Stack direction="row" spacing={1} justifyContent="flex-end" mt={2.5}>
            <ButtonComp
              variant="outlined"
              loading={reminderBusy}
              onClick={() =>
                dispatch(
                  scheduleRemindersAction({
                    payload: {
                      invoice_ids: selected.length ? selected : undefined,
                      channels,
                      reminder_type: 'OVERDUE',
                    },
                  })
                )
              }
            >
              Schedule
            </ButtonComp>
            <ButtonComp
              loading={reminderBusy}
              onClick={() =>
                dispatch(
                  dispatchRemindersAction({
                    onSuccess: () => load(),
                  })
                )
              }
            >
              Dispatch pending
            </ButtonComp>
          </Stack>
        </Box>
      </SpringModal>
    </Box>
  )
}
