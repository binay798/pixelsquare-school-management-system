import { Box, Pagination, Typography } from '@mui/material'
import moment from 'moment'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, Plus, Search } from 'lucide-react'
import { ButtonComp } from '@src/components/button/button.component'
import { InputField } from '@src/components/input/input.component'
import { CustomDatePicker } from '@src/components/datePicker/datePicker.component'
import { SelectField } from '@src/components/select/select.component'
import { colors } from '@src/helpers/colors.helpers'
import { useAccountingPermissions } from '@src/hooks/useAccountingPermissions.hooks'
import { useDebounceValue } from '@src/hooks/useDebounceValue.hooks'
import { useDispatch, useSelector } from '@src/store/hooks.store'
import { getJournalsAction } from '@src/store/redux/dashboard/accounting/accounting.slice'
import { IJournalFilters } from '@src/store/redux/dashboard/accounting/accounting.service'
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
  SOURCE_MODULE_LABEL,
  TRANSACTION_STATUS_META,
  TRANSACTION_STATUS_OPTIONS,
  TRANSACTION_TYPE_META,
  TRANSACTION_TYPE_OPTIONS,
} from './accounting.helpers'

const PAGE_LIMIT = 20

/** Journal listing (`GET /accounting/transactions`). */
export function AccountingJournalPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { canCreateJournal } = useAccountingPermissions()

  const { data, loading } = useSelector((store) => store.accounting.journals)

  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<IJournalFilters>({})
  const [page, setPage] = useState(1)
  const debouncedSearch = useDebounceValue(search, 400)

  useEffect(() => {
    const term = debouncedSearch.trim()

    dispatch(
      getJournalsAction({
        filters: { ...filters, search: term || undefined },
        page,
        limit: PAGE_LIMIT,
      })
    )
  }, [debouncedSearch, dispatch, filters, page])

  const rows = data?.rows ?? []
  const total = Number(data?.total ?? 0)
  const totalPages = Math.ceil(total / PAGE_LIMIT)

  const filtersActive = useMemo(
    () => Boolean(search || Object.values(filters).some(Boolean)),
    [filters, search]
  )

  const columns: IFeeColumn<Accounting.IJournal>[] = [
    {
      key: 'number',
      label: 'Entry',
      render: (row) => (
        <FeeCellStack
          primary={row.transaction_number}
          secondary={formatDate(row.transaction_date)}
        />
      ),
    },
    {
      key: 'description',
      label: 'Description',
      render: (row) => (
        <FeeCellStack
          primary={row.description}
          secondary={
            row.reference_number ? `Ref ${row.reference_number}` : undefined
          }
        />
      ),
    },
    {
      key: 'type',
      label: 'Type',
      hideBelow: 'md',
      render: (row) => (
        <FeeStatusChip meta={TRANSACTION_TYPE_META[row.transaction_type]} />
      ),
    },
    {
      key: 'source',
      label: 'Source',
      hideBelow: 'lg',
      render: (row) => (
        <Typography fontSize={11.5} color={colors.grey[600]}>
          {SOURCE_MODULE_LABEL[row.source_module]}
        </Typography>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <FeeStatusChip meta={TRANSACTION_STATUS_META[row.status]} />
      ),
    },
    {
      key: 'amount',
      label: 'Debit total',
      align: 'right',
      render: (row) => <FeeAmount value={formatMoney(row.total_debit)} />,
    },
  ]

  return (
    <Box>
      <FeePageHeader
        title="Journal entries"
        subtitle="Every manual and automatic double entry transaction of the school."
        actions={
          canCreateJournal ? (
            <ButtonComp
              size="small"
              startIcon={<Plus size={15} />}
              onClick={() => navigate(`${ACCOUNTING_BASE_PATH}/journal/new`)}
            >
              New entry
            </ButtonComp>
          ) : null
        }
      />

      <Box mb={2}>
        <FeeFilterBar
          active={filtersActive}
          onClear={() => {
            setSearch('')
            setFilters({})
            setPage(1)
          }}
          footer={
            <Typography fontSize={11.5} color={colors.grey[500]}>
              {total} entr{total === 1 ? 'y' : 'ies'} matching the current
              filters.
            </Typography>
          }
        >
          <Box>
            <InputField
              labelDetail={{ text: 'Search', required: false }}
              placeholder="Number, description or reference"
              value={search}
              startAdornment={<Search size={14} />}
              onChange={(event) => {
                setSearch(event.target.value)
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
              options={TRANSACTION_STATUS_OPTIONS}
              value={
                TRANSACTION_STATUS_OPTIONS.find(
                  (option) => option.value === filters.status
                ) ?? null
              }
              onChange={(option) => {
                setFilters((prev) => ({
                  ...prev,
                  status: (
                    option as IOption<Accounting.TransactionStatus> | null
                  )?.value,
                }))
                setPage(1)
              }}
            />
          </Box>
          <Box>
            <Typography fontSize={13} color={colors.grey[800]} mb={1}>
              Entry type
            </Typography>
            <SelectField
              isClearable
              placeholder="Any type"
              options={TRANSACTION_TYPE_OPTIONS}
              value={
                TRANSACTION_TYPE_OPTIONS.find(
                  (option) => option.value === filters.transaction_type
                ) ?? null
              }
              onChange={(option) => {
                setFilters((prev) => ({
                  ...prev,
                  transaction_type: (
                    option as IOption<Accounting.TransactionType> | null
                  )?.value,
                }))
                setPage(1)
              }}
            />
          </Box>
          <Box>
            <CustomDatePicker
              labelDetail={{ text: 'From date', required: false }}
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
              labelDetail={{ text: 'To date', required: false }}
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

      <FeePanel
        noPadding
        title="Transactions"
        subtitle="Draft entries can still be edited or deleted by the finance team, posted entries can only be reversed."
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
          skeletonRows={8}
          onRowClick={(row) =>
            navigate(`${ACCOUNTING_BASE_PATH}/journal/${row.id}`)
          }
          emptyIcon={<FileText size={20} />}
          emptyTitle="No journal entries"
          emptyDescription={
            filtersActive
              ? 'No transaction matches the selected filters.'
              : 'Journal entries are created manually here or automatically by the fees module.'
          }
        />
      </FeePanel>
    </Box>
  )
}
