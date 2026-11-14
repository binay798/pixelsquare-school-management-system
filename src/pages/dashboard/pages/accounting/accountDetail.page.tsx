import { Box, Pagination, Stack, Typography } from '@mui/material'
import moment from 'moment'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { BookOpen, Hash, RefreshCw, Scale, Wallet } from 'lucide-react'
import { ButtonComp } from '@src/components/button/button.component'
import { CustomDatePicker } from '@src/components/datePicker/datePicker.component'
import { colors } from '@src/helpers/colors.helpers'
import { useDispatch, useSelector } from '@src/store/hooks.store'
import {
  getAccountDetailAction,
  resetAccountDetail,
} from '@src/store/redux/dashboard/accounting/accounting.slice'
import { ILedgerFilters } from '@src/store/redux/dashboard/accounting/accounting.service'
import {
  FeeAmount,
  FeeCellStack,
  FeeDataTable,
  IFeeColumn,
} from '../fees/components/feeDataTable.component'
import { FeePageHeader } from '../fees/components/feePageHeader.component'
import { FeePanel } from '../fees/components/feePanel.component'
import { FeeFilterBar } from '../fees/components/feeFilterBar.component'
import {
  FeeStatCard,
  FeeStatGrid,
} from '../fees/components/feeStatCard.component'
import { FeeStatusChip } from '../fees/components/feeStatusChip.component'
import {
  ACCOUNT_SUBTYPE_LABEL,
  ACCOUNT_TYPE_META,
  ACCOUNTING_BASE_PATH,
  formatDate,
  formatMinorMoney,
  formatMoney,
  TRANSACTION_TYPE_META,
  toMinor,
} from './accounting.helpers'

const PAGE_LIMIT = 25

/** Ledger of a single account (`GET /accounting/accounts/:id`). */
export function AccountingAccountDetailPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const accountId = Number(id)

  const { data, loading } = useSelector(
    (store) => store.accounting.accountDetail
  )

  const [filters, setFilters] = useState<ILedgerFilters>({})
  const [page, setPage] = useState(1)

  useEffect(() => {
    if (!accountId || Number.isNaN(accountId)) {
      return undefined
    }

    dispatch(
      getAccountDetailAction({
        accountId,
        filters,
        page,
        limit: PAGE_LIMIT,
      })
    )

    return () => {
      dispatch(resetAccountDetail())
    }
  }, [accountId, dispatch, filters, page])

  const account = data?.account
  const ledger = data?.ledger
  const rows = ledger?.rows ?? []
  const total = Number(ledger?.total ?? 0)
  const totalPages = Math.ceil(total / PAGE_LIMIT)

  /** Page level movement, clearly scoped to the visible rows. */
  const pageTotals = useMemo(
    () => ({
      debit: rows.reduce((sum, row) => sum + toMinor(row.debit_amount), 0),
      credit: rows.reduce((sum, row) => sum + toMinor(row.credit_amount), 0),
    }),
    [rows]
  )

  const columns: IFeeColumn<Accounting.ILedgerRow>[] = [
    {
      key: 'date',
      label: 'Date',
      width: 110,
      render: (row) => (
        <Typography fontSize={12} color={colors.grey[700]}>
          {formatDate(row.transaction_date)}
        </Typography>
      ),
    },
    {
      key: 'journal',
      label: 'Journal',
      render: (row) => (
        <FeeCellStack
          primary={row.transaction_number}
          secondary={row.description ?? '—'}
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
          {row.source_module.replace(/_/g, ' ').toLowerCase()}
        </Typography>
      ),
    },
    {
      key: 'debit',
      label: 'Debit',
      align: 'right',
      render: (row) => (
        <FeeAmount
          value={
            toMinor(row.debit_amount) ? formatMoney(row.debit_amount) : '—'
          }
          tone={toMinor(row.debit_amount) ? 'default' : 'muted'}
        />
      ),
    },
    {
      key: 'credit',
      label: 'Credit',
      align: 'right',
      render: (row) => (
        <FeeAmount
          value={
            toMinor(row.credit_amount) ? formatMoney(row.credit_amount) : '—'
          }
          tone={toMinor(row.credit_amount) ? 'default' : 'muted'}
        />
      ),
    },
  ]

  if (!accountId || Number.isNaN(accountId)) {
    return (
      <Box>
        <FeePageHeader
          title="Account not found"
          subtitle="The requested account id is not a valid number."
          backTo={`${ACCOUNTING_BASE_PATH}/accounts`}
          backLabel="Chart of accounts"
        />
      </Box>
    )
  }

  return (
    <Box>
      <FeePageHeader
        title={
          account
            ? `${account.account_code} · ${account.account_name}`
            : 'Account ledger'
        }
        subtitle={
          account?.description ?? 'Posted ledger lines of this account.'
        }
        backTo={`${ACCOUNTING_BASE_PATH}/accounts`}
        backLabel="Chart of accounts"
        loading={loading && !data}
        meta={
          account ? (
            <Stack direction="row" spacing={0.75} flexWrap="wrap" rowGap={0.75}>
              <FeeStatusChip meta={ACCOUNT_TYPE_META[account.account_type]} />
              {account.account_subtype ? (
                <Typography
                  fontSize={11.5}
                  color={colors.grey[600]}
                  sx={{
                    px: 1,
                    py: 0.35,
                    borderRadius: 999,
                    border: `1px solid ${colors.grey[200]}`,
                  }}
                >
                  {ACCOUNT_SUBTYPE_LABEL[account.account_subtype]}
                </Typography>
              ) : null}
              {account.is_system_account ? (
                <Typography
                  fontSize={11.5}
                  color={colors.grey[600]}
                  sx={{
                    px: 1,
                    py: 0.35,
                    borderRadius: 999,
                    border: `1px solid ${colors.grey[200]}`,
                  }}
                >
                  System account
                </Typography>
              ) : null}
              {!account.is_active ? (
                <Typography
                  fontSize={11.5}
                  color={colors.red[600]}
                  sx={{
                    px: 1,
                    py: 0.35,
                    borderRadius: 999,
                    border: `1px solid ${colors.red[200]}`,
                  }}
                >
                  Inactive
                </Typography>
              ) : null}
            </Stack>
          ) : null
        }
        actions={
          <>
            <ButtonComp
              size="small"
              variant="outlined"
              startIcon={<RefreshCw size={14} />}
              onClick={() =>
                dispatch(
                  getAccountDetailAction({
                    accountId,
                    filters,
                    page,
                    limit: PAGE_LIMIT,
                  })
                )
              }
            >
              Refresh
            </ButtonComp>
            <ButtonComp
              size="small"
              variant="outlined"
              startIcon={<BookOpen size={14} />}
              onClick={() => navigate(`${ACCOUNTING_BASE_PATH}/journal`)}
            >
              Journal
            </ButtonComp>
          </>
        }
      />

      <FeeStatGrid columns={{ xs: 2, md: 4 }}>
        <FeeStatCard
          label="Account type"
          value={account ? ACCOUNT_TYPE_META[account.account_type].label : '—'}
          caption={
            account?.normal_balance === 'DEBIT'
              ? 'Normal debit'
              : 'Normal credit'
          }
          icon={<BookOpen size={15} />}
          loading={loading && !data}
        />
        <FeeStatCard
          label="Ledger lines"
          value={total}
          caption="All posted lines of this account"
          icon={<Hash size={15} />}
          loading={loading && !data}
        />
        <FeeStatCard
          label="Page debit"
          value={formatMinorMoney(pageTotals.debit)}
          caption={`${rows.length} row${
            rows.length === 1 ? '' : 's'
          } on this page`}
          accent={colors.blue[700]}
          soft={colors.blue[50]}
          icon={<Scale size={15} />}
          loading={loading && !data}
        />
        <FeeStatCard
          label="Page credit"
          value={formatMinorMoney(pageTotals.credit)}
          caption="Visible movement only"
          accent={colors.green[700]}
          soft={colors.green[50]}
          icon={<Scale size={15} />}
          loading={loading && !data}
        />
      </FeeStatGrid>

      <Box mt={2} mb={2}>
        <FeeFilterBar
          columns={3}
          active={Boolean(filters.date_from || filters.date_to)}
          onClear={() => {
            setFilters({})
            setPage(1)
          }}
        >
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
        title={`${total} ledger line${total === 1 ? '' : 's'}`}
        subtitle="Only posted journal lines move an account balance."
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
            navigate(`${ACCOUNTING_BASE_PATH}/journal/${row.transaction_id}`)
          }
          emptyIcon={<Wallet size={20} />}
          emptyTitle="No ledger lines"
          emptyDescription={
            filters.date_from || filters.date_to
              ? 'No posted line falls inside the selected date range.'
              : 'This account has not been used by any posted journal entry yet.'
          }
        />
      </FeePanel>
    </Box>
  )
}
