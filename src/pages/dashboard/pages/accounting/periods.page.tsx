import { Box, Pagination, Stack, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarPlus, Search } from 'lucide-react'
import { ButtonComp } from '@src/components/button/button.component'
import { InputField } from '@src/components/input/input.component'
import SpringModal from '@src/components/modal/modal.component'
import { SelectField } from '@src/components/select/select.component'
import { colors } from '@src/helpers/colors.helpers'
import { useAccountingPermissions } from '@src/hooks/useAccountingPermissions.hooks'
import { useDispatch, useSelector } from '@src/store/hooks.store'
import {
  createPeriodAction,
  getPeriodsAction,
} from '@src/store/redux/dashboard/accounting/accounting.slice'
import { IPeriodFilters } from '@src/store/redux/dashboard/accounting/accounting.service'
import {
  FeeAmount,
  FeeCellStack,
  FeeDataTable,
  IFeeColumn,
} from '../fees/components/feeDataTable.component'
import { FeePageHeader } from '../fees/components/feePageHeader.component'
import { FeePanel } from '../fees/components/feePanel.component'
import { FeeFilterBar } from '../fees/components/feeFilterBar.component'
import { FeeStatusChip } from '../fees/components/feeStatusChip.component'
import {
  ACCOUNTING_BASE_PATH,
  formatDate,
  formatMoney,
  IOption,
  PERIOD_STATUS_META,
  PERIOD_STATUS_OPTIONS,
} from './accounting.helpers'

const PAGE_LIMIT = 20

interface IPeriodForm {
  period_name: string
  fiscal_year: string
  start_date: string
  end_date: string
}

const emptyPeriod: IPeriodForm = {
  period_name: '',
  fiscal_year: String(new Date().getFullYear()),
  start_date: '',
  end_date: '',
}

/** Fiscal periods (`GET /accounting/periods`). */
export function AccountingPeriodsPage() {
  const dispatch = useDispatch()
  const { canManagePeriods } = useAccountingPermissions()

  const { data, loading } = useSelector((store) => store.accounting.periods)
  const { loading: saving } = useSelector(
    (store) => store.accounting.periodMutation
  )

  const [filters, setFilters] = useState<IPeriodFilters>({})
  const [fiscalYear, setFiscalYear] = useState('')
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState<IPeriodForm>(emptyPeriod)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const load = (nextPage = page) =>
    dispatch(
      getPeriodsAction({
        filters,
        page: nextPage,
        limit: PAGE_LIMIT,
      })
    )

  useEffect(() => {
    load()
  }, [dispatch, filters, page])

  const rows = data?.rows ?? []
  const total = Number(data?.total ?? 0)
  const totalPages = Math.ceil(total / PAGE_LIMIT)

  const columns: IFeeColumn<Accounting.IPeriod>[] = [
    {
      key: 'period',
      label: 'Period',
      render: (row) => (
        <Link
          to={`${ACCOUNTING_BASE_PATH}/periods/${row.id}`}
          style={{ textDecoration: 'none' }}
        >
          <Typography fontSize={13} fontWeight={600} color={colors.grey[900]}>
            {row.period_name}
          </Typography>
          <Typography fontSize={11.5} color={colors.grey[500]}>
            FY {row.fiscal_year}
          </Typography>
        </Link>
      ),
    },
    {
      key: 'range',
      label: 'Range',
      render: (row) => (
        <FeeCellStack
          primary={`${formatDate(row.start_date)} → ${formatDate(
            row.end_date
          )}`}
        />
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <FeeStatusChip meta={PERIOD_STATUS_META[row.status]} />,
    },
    {
      key: 'entries',
      label: 'Entries',
      align: 'right',
      hideBelow: 'md',
      render: (row) => (
        <Typography fontSize={12.5} color={colors.grey[700]}>
          {row.transaction_count ?? 0}
        </Typography>
      ),
    },
    {
      key: 'drafts',
      label: 'Drafts',
      align: 'right',
      hideBelow: 'md',
      render: (row) => (
        <Typography fontSize={12.5} color={colors.grey[700]}>
          {row.draft_count ?? 0}
        </Typography>
      ),
    },
    {
      key: 'posted',
      label: 'Posted debit',
      align: 'right',
      render: (row) => (
        <FeeAmount value={formatMoney(row.posted_debit ?? '0')} />
      ),
    },
  ]

  const submit = () => {
    const next: Record<string, string> = {}

    if (form.period_name.trim().length < 3) {
      next.period_name = 'A period name of at least 3 characters is required.'
    }
    if (form.fiscal_year.trim().length < 4) {
      next.fiscal_year = 'The fiscal year is required (4 digits, e.g. 2025).'
    }
    if (!form.start_date || !form.end_date) {
      next.range = 'Both the start and the end date are required.'
    } else if (form.end_date <= form.start_date) {
      next.range = 'The end date must be after the start date.'
    }

    setErrors(next)

    if (Object.keys(next).length > 0) {
      return
    }

    dispatch(
      createPeriodAction({
        payload: {
          period_name: form.period_name.trim(),
          fiscal_year: form.fiscal_year.trim(),
          start_date: form.start_date,
          end_date: form.end_date,
        },
        onSuccess: () => {
          setModalOpen(false)
          setForm(emptyPeriod)

          if (page === 1) {
            load(1)
          } else {
            setPage(1)
          }
        },
      })
    )
  }

  return (
    <Box>
      <FeePageHeader
        title="Accounting periods"
        subtitle="Entries can only be posted inside an open period. Closing a period freezes its ledger."
        actions={
          canManagePeriods ? (
            <ButtonComp
              size="small"
              startIcon={<CalendarPlus size={15} />}
              onClick={() => {
                setForm(emptyPeriod)
                setErrors({})
                setModalOpen(true)
              }}
            >
              New period
            </ButtonComp>
          ) : null
        }
      />

      <Box mb={2}>
        <FeeFilterBar
          columns={3}
          title="Period filters"
          active={Boolean(filters.status || fiscalYear)}
          onClear={() => {
            setFiscalYear('')
            setFilters({})
            setPage(1)
          }}
        >
          <Box>
            <InputField
              labelDetail={{ text: 'Fiscal year', required: false }}
              placeholder="2025"
              value={fiscalYear}
              startAdornment={<Search size={14} />}
              onChange={(event) => {
                setFiscalYear(event.target.value.replace(/[^0-9]/g, ''))
                setFilters((prev) => ({
                  ...prev,
                  fiscal_year:
                    event.target.value.replace(/[^0-9]/g, '') || undefined,
                }))
                setPage(1)
              }}
            />
          </Box>
          <Box>
            <Typography fontSize={13} color={colors.grey[800]} mb={1}>
              Status
            </Typography>
            <SelectField
              isClearable
              placeholder="Any status"
              options={PERIOD_STATUS_OPTIONS}
              value={
                PERIOD_STATUS_OPTIONS.find(
                  (option) => option.value === filters.status
                ) ?? null
              }
              onChange={(option) => {
                setFilters((prev) => ({
                  ...prev,
                  status: (option as IOption<Accounting.PeriodStatus> | null)
                    ?.value,
                }))
                setPage(1)
              }}
            />
          </Box>
        </FeeFilterBar>
      </Box>

      <FeePanel
        noPadding
        title="Periods"
        subtitle="Closing is irreversible from the UI unless a finance manager reopens the period with a reason."
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
          rows={rows}
          rowKey={(row) => row.id}
          loading={loading}
          skeletonRows={6}
          emptyIcon={<CalendarPlus size={20} />}
          emptyTitle="No accounting periods"
          emptyDescription="Create the fiscal periods before posting any journal entry."
        />
      </FeePanel>

      <SpringModal open={modalOpen} close={() => setModalOpen(false)} size="sm">
        <Box sx={{ p: 2.5, minWidth: { xs: 'auto', sm: 460 } }}>
          <Typography fontSize={16} fontWeight={700} color={colors.grey[900]}>
            New accounting period
          </Typography>
          <Typography fontSize={12.5} color={colors.grey[500]} mt={0.25} mb={2}>
            Periods must not overlap: the backend rejects a range that collides
            with an existing one.
          </Typography>

          <Stack spacing={1.5}>
            <InputField
              labelDetail={{ text: 'Period name', required: true }}
              placeholder="2025-01"
              value={form.period_name}
              error={Boolean(errors.period_name)}
              helperText={errors.period_name}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  period_name: event.target.value,
                }))
              }
            />
            <InputField
              labelDetail={{ text: 'Fiscal year', required: true }}
              placeholder="2025"
              value={form.fiscal_year}
              error={Boolean(errors.fiscal_year)}
              helperText={errors.fiscal_year}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  fiscal_year: event.target.value.replace(/[^0-9]/g, ''),
                }))
              }
            />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              <Box flex={1}>
                <InputField
                  type="date"
                  labelDetail={{ text: 'Start date', required: true }}
                  value={form.start_date}
                  error={Boolean(errors.range)}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      start_date: event.target.value,
                    }))
                  }
                />
              </Box>
              <Box flex={1}>
                <InputField
                  type="date"
                  labelDetail={{ text: 'End date', required: true }}
                  value={form.end_date}
                  error={Boolean(errors.range)}
                  helperText={errors.range}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      end_date: event.target.value,
                    }))
                  }
                />
              </Box>
            </Stack>
          </Stack>

          <Stack direction="row" spacing={1} justifyContent="flex-end" mt={2.5}>
            <ButtonComp
              size="small"
              variant="outlined"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </ButtonComp>
            <ButtonComp size="small" loading={saving} onClick={submit}>
              Create period
            </ButtonComp>
          </Stack>
        </Box>
      </SpringModal>
    </Box>
  )
}
