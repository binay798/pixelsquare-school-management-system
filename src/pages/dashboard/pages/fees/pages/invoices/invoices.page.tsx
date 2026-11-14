import {
  Box,
  InputAdornment,
  Pagination,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import moment from 'moment'
import {
  Ban,
  Banknote,
  Eye,
  FileText,
  Plus,
  RefreshCw,
  Search,
  SlidersHorizontal,
} from 'lucide-react'
import { colors } from '@src/helpers/colors.helpers'
import { ButtonComp } from '@src/components/button/button.component'
import { InputField } from '@src/components/input/input.component'
import { SelectField } from '@src/components/select/select.component'
import { CustomDatePicker } from '@src/components/datePicker/datePicker.component'
import { useDebounceValue } from '@src/hooks/useDebounceValue.hooks'
import { useFeePermissions } from '@src/hooks/useFeePermissions.hooks'
import { useDispatch, useSelector } from '@src/store/hooks.store'
import {
  cancelInvoiceAction,
  getInvoicesAction,
  issueInvoiceAction,
  refreshOverdueAction,
} from '@src/store/redux/dashboard/fee/fee.invoices.slice'
import { IInvoiceFilters } from '@src/store/redux/dashboard/fee/fee.service'
import {
  FeeAmount,
  FeeCellStack,
  FeeDataTable,
  IFeeColumn,
} from '../../components/feeDataTable.component'
import { FeePageHeader } from '../../components/feePageHeader.component'
import { FeePanel } from '../../components/feePanel.component'
import { FeeFilterBar } from '../../components/feeFilterBar.component'
import { FeeStatusChip } from '../../components/feeStatusChip.component'
import { FeeReasonModal } from '../../components/feeReasonModal.component'
import {
  formatDate,
  formatMoney,
  fullName,
  IOption,
  INVOICE_STATUS_META,
  INVOICE_STATUS_OPTIONS,
} from '../../fees.helpers'
import { useFeeReference } from '../../hooks/useFeeReference.hooks'

const PAGE_LIMIT = 20
const INVOICE_BASE_PATH = '/dashboard/fees/invoices'

const OVERDUE_OPTIONS: IOption[] = [
  { value: 'true', label: 'Outstanding only' },
]

export function FeeInvoicesPage() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { can } = useFeePermissions()
  const { years } = useFeeReference()
  const [searchParams] = useSearchParams()

  const { data: list, loading } = useSelector(
    (store) => store.feeInvoices.invoices
  )
  const { loading: mutating } = useSelector(
    (store) => store.feeInvoices.invoiceMutation
  )

  const [filters, setFilters] = useState<IInvoiceFilters>({
    outstanding_only: searchParams.get('outstanding') === '1' || undefined,
  })
  const [searchText, setSearchText] = useState('')
  const debouncedSearch = useDebounceValue(searchText, 400)
  const [page, setPage] = useState(1)
  const [cancelTarget, setCancelTarget] = useState<Fee.IInvoice | null>(null)
  const [showAdvanced, setShowAdvanced] = useState(false)

  useEffect(() => {
    const term = debouncedSearch.trim()

    setFilters((prev) =>
      (prev.search ?? '') === term ? prev : { ...prev, search: term }
    )
    setPage(1)
  }, [debouncedSearch])

  const load = useCallback(() => {
    dispatch(getInvoicesAction({ filters, page, limit: PAGE_LIMIT }))
  }, [dispatch, filters, page])

  useEffect(() => {
    load()
  }, [load])

  const columns: IFeeColumn<Fee.IInvoice>[] = [
    {
      key: 'invoice_number',
      label: 'Invoice',
      render: (row) => (
        <FeeCellStack
          primary={row.invoice_number}
          secondary={fullName(row.firstname, row.lastname)}
        />
      ),
    },
    {
      key: 'issue_date',
      label: 'Issued / due',
      hideBelow: 'md',
      render: (row) => (
        <FeeCellStack
          primary={formatDate(row.issue_date)}
          secondary={`due ${formatDate(row.due_date)}`}
        />
      ),
    },
    {
      key: 'total_amount',
      label: 'Total',
      align: 'right',
      render: (row) => <FeeAmount value={formatMoney(row.total_amount)} />,
    },
    {
      key: 'paid_amount',
      label: 'Paid',
      align: 'right',
      hideBelow: 'sm',
      render: (row) => (
        <FeeAmount value={formatMoney(row.paid_amount)} tone="success" />
      ),
    },
    {
      key: 'outstanding_amount',
      label: 'Outstanding',
      align: 'right',
      render: (row) => (
        <FeeAmount
          value={formatMoney(row.outstanding_amount)}
          tone={Number(row.outstanding_amount) > 0 ? 'danger' : 'muted'}
          strong
        />
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <FeeStatusChip meta={INVOICE_STATUS_META[row.status]} />,
    },
    {
      key: 'accounting_event_status',
      label: 'Accounting',
      hideBelow: 'lg',
      render: (row) => (
        <FeeStatusChip
          meta={{
            label: row.accounting_event_status.replace('_', ' ').toLowerCase(),
            text: '#334155',
            bg: '#f8fafc',
            border: '#e2e8f0',
            dot:
              row.accounting_event_status === 'POSTED'
                ? '#10b981'
                : row.accounting_event_status === 'FAILED'
                ? '#ef4444'
                : '#f59e0b',
          }}
        />
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (row) => (
        <Stack direction="row" spacing={0.25} justifyContent="flex-end">
          <Tooltip title="View invoice">
            <span>
              <ButtonComp
                size="small"
                variant="text"
                onClick={() => navigate(`${INVOICE_BASE_PATH}/${row.id}`)}
                sx={{ minWidth: 0, px: 0.75 }}
              >
                <Eye size={14} />
              </ButtonComp>
            </span>
          </Tooltip>
          {can('fee.invoices.generate') && row.status === 'DRAFT' ? (
            <Tooltip title="Issue invoice">
              <span>
                <ButtonComp
                  size="small"
                  variant="text"
                  color="success"
                  onClick={() =>
                    dispatch(
                      issueInvoiceAction({
                        invoiceId: row.id,
                        onSuccess: () => load(),
                      })
                    )
                  }
                  sx={{ minWidth: 0, px: 0.75 }}
                >
                  <FileText size={14} />
                </ButtonComp>
              </span>
            </Tooltip>
          ) : null}
          {can('fee.payments.collect') &&
          Number(row.outstanding_amount) > 0 &&
          row.status !== 'DRAFT' ? (
            <Tooltip title="Collect payment">
              <span>
                <ButtonComp
                  size="small"
                  variant="text"
                  onClick={() =>
                    navigate(
                      `/dashboard/fees/payments/collect?studentId=${row.student_id}&invoiceId=${row.id}`
                    )
                  }
                  sx={{ minWidth: 0, px: 0.75 }}
                >
                  <Banknote size={14} />
                </ButtonComp>
              </span>
            </Tooltip>
          ) : null}
          {can('fee.invoices.cancel') &&
          ['DRAFT', 'ISSUED', 'PARTIALLY_PAID', 'OVERDUE'].includes(
            row.status
          ) ? (
            <Tooltip title="Cancel invoice">
              <span>
                <ButtonComp
                  size="small"
                  variant="text"
                  color="error"
                  onClick={() => setCancelTarget(row)}
                  sx={{ minWidth: 0, px: 0.75 }}
                >
                  <Ban size={14} />
                </ButtonComp>
              </span>
            </Tooltip>
          ) : null}
        </Stack>
      ),
    },
  ]

  const total = Number(list?.total ?? 0)
  const totalPages = Math.max(1, Math.ceil(total / PAGE_LIMIT))

  return (
    <Box>
      <FeePageHeader
        title="Invoice management"
        subtitle="Issued invoices keep their financial snapshot. Amounts are never edited: use a controlled adjustment instead."
        backTo="/dashboard/fees"
        actions={
          <>
            <ButtonComp
              size="small"
              variant="outlined"
              startIcon={<RefreshCw size={14} />}
              disabled={!can('fee.invoices.generate')}
              onClick={() =>
                dispatch(refreshOverdueAction({ onSuccess: () => load() }))
              }
            >
              Refresh overdue
            </ButtonComp>
            {can('fee.invoices.generate') ? (
              <ButtonComp
                startIcon={<Plus size={15} />}
                onClick={() => navigate(`${INVOICE_BASE_PATH}/generate`)}
              >
                Generate invoices
              </ButtonComp>
            ) : null}
          </>
        }
      />

      <Box mb={1.75}>
        <FeeFilterBar
          active={Boolean(
            filters.status ||
              filters.academic_year_id ||
              filters.outstanding_only ||
              filters.date_from ||
              filters.date_to ||
              filters.search
          )}
          onClear={() => {
            setSearchText('')
            setFilters({})
            setPage(1)
          }}
          columns={4}
        >
          <Box>
            <Typography fontSize={12} color={colors.grey[600]} mb={0.75}>
              Search
            </Typography>
            <InputField
              placeholder="Invoice number or student name"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              startAdornment={
                <InputAdornment position="start">
                  <Search size={15} color={colors.grey[500]} />
                </InputAdornment>
              }
            />
          </Box>
          <Box>
            <Typography fontSize={12} color={colors.grey[600]} mb={0.75}>
              Status
            </Typography>
            <SelectField
              isClearable
              placeholder="All statuses"
              options={INVOICE_STATUS_OPTIONS}
              value={
                INVOICE_STATUS_OPTIONS.find(
                  (option) => option.value === filters.status
                ) ?? null
              }
              onChange={(option) => {
                setFilters((prev) => ({
                  ...prev,
                  status: (option as IOption | null)?.value ?? undefined,
                }))
                setPage(1)
              }}
            />
          </Box>
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
              Balance
            </Typography>
            <SelectField
              isClearable
              placeholder="All invoices"
              options={OVERDUE_OPTIONS}
              value={filters.outstanding_only ? OVERDUE_OPTIONS[0] : null}
              onChange={(option) => {
                setFilters((prev) => ({
                  ...prev,
                  outstanding_only: Boolean((option as IOption | null)?.value),
                }))
                setPage(1)
              }}
            />
          </Box>
        </FeeFilterBar>

        <Stack direction="row" justifyContent="flex-end" mt={1}>
          <ButtonComp
            size="small"
            variant="text"
            startIcon={<SlidersHorizontal size={13} />}
            onClick={() => setShowAdvanced((prev) => !prev)}
          >
            {showAdvanced ? 'Hide date filters' : 'More filters'}
          </ButtonComp>
        </Stack>
      </Box>

      {showAdvanced ? (
        <Box mb={1.75}>
          <FeeFilterBar columns={2}>
            <Box>
              <CustomDatePicker
                labelDetail={{ text: 'Issued from', required: false }}
                views={['day', 'month', 'year']}
                value={filters.date_from ? moment(filters.date_from) : null}
                onChange={(value) => {
                  setFilters((prev) => ({
                    ...prev,
                    date_from:
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
                labelDetail={{ text: 'Issued to', required: false }}
                views={['day', 'month', 'year']}
                value={filters.date_to ? moment(filters.date_to) : null}
                onChange={(value) => {
                  setFilters((prev) => ({
                    ...prev,
                    date_to:
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
      ) : null}

      <FeePanel
        noPadding
        title={`${total} invoice${total === 1 ? '' : 's'}`}
        footer={
          totalPages > 1 ? (
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, value) => setPage(value)}
              size="small"
              color="primary"
            />
          ) : null
        }
      >
        <FeeDataTable
          columns={columns}
          rows={list?.rows ?? []}
          rowKey={(row) => row.id}
          loading={loading}
          skeletonRows={6}
          emptyIcon={<FileText size={20} />}
          emptyTitle="No invoices found"
          emptyDescription="Adjust the filters or generate a new batch of invoices."
          emptyAction={
            can('fee.invoices.generate') ? (
              <ButtonComp
                size="small"
                startIcon={<Plus size={14} />}
                onClick={() => navigate(`${INVOICE_BASE_PATH}/generate`)}
              >
                Generate invoices
              </ButtonComp>
            ) : null
          }
        />
      </FeePanel>

      <FeeReasonModal
        open={Boolean(cancelTarget)}
        onClose={() => setCancelTarget(null)}
        heading={`Cancel invoice ${cancelTarget?.invoice_number ?? ''}?`}
        description="The invoice keeps its number and snapshot; the receivable is reversed through the accounting engine. Any paid amount must be refunded first."
        label="Cancellation reason"
        confirmText="Cancel invoice"
        loading={mutating}
        onConfirm={(reason) => {
          if (!cancelTarget) {
            return
          }
          dispatch(
            cancelInvoiceAction({
              invoiceId: cancelTarget.id,
              reason,
              onSuccess: () => {
                setCancelTarget(null)
                load()
              },
            })
          )
        }}
      />
    </Box>
  )
}
