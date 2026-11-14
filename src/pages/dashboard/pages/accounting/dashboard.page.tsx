import { Box, Stack, Typography } from '@mui/material'
import { useCallback, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, CalendarClock, Plus, RefreshCw, Scale } from 'lucide-react'
import { ButtonComp } from '@src/components/button/button.component'
import { colors } from '@src/helpers/colors.helpers'
import { useAccountingPermissions } from '@src/hooks/useAccountingPermissions.hooks'
import { useDispatch, useSelector } from '@src/store/hooks.store'
import {
  getAccountingDashboardAction,
  setupChartOfAccountsAction,
} from '@src/store/redux/dashboard/accounting/accounting.slice'
import {
  FeeAmount,
  FeeCellStack,
  FeeDataTable,
  IFeeColumn,
} from '../fees/components/feeDataTable.component'
import { FeeEmptyState } from '../fees/components/feeEmptyState.component'
import { FeePageHeader } from '../fees/components/feePageHeader.component'
import { FeePanel } from '../fees/components/feePanel.component'
import {
  FeeStatCard,
  FeeStatGrid,
} from '../fees/components/feeStatCard.component'
import { FeeStatusChip } from '../fees/components/feeStatusChip.component'
import {
  ACCOUNT_TYPE_META,
  ACCOUNT_TYPE_ORDER,
  ACCOUNTING_BASE_PATH,
  accountMovement,
  formatDate,
  formatMinorMoney,
  formatMoney,
  toMinor,
  TRANSACTION_STATUS_META,
} from './accounting.helpers'

/**
 * Accounting overview.
 *
 * Every figure is computed from the payload of `getAccountingDashboardAction`,
 * which only calls real accounting endpoints (`/accounts`, `/transactions`,
 * `/periods`). Nothing is mocked: when the chart of accounts is still empty the
 * screen offers to provision the default one.
 */
export function AccountingDashboardPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { canManageAccounts, canCreateJournal } = useAccountingPermissions()

  const { data, loading } = useSelector((store) => store.accounting.dashboard)
  const { loading: settingUp } = useSelector(
    (store) => store.accounting.chartSetup
  )

  const load = useCallback(() => {
    dispatch(getAccountingDashboardAction())
  }, [dispatch])

  useEffect(() => {
    load()
  }, [load])

  const accounts = data?.accounts.rows ?? []
  const accountTotal = Number(data?.accounts.total ?? 0)

  /** Posted movement per account type, in integer minor units. */
  const summary = useMemo(() => {
    const byType = ACCOUNT_TYPE_ORDER.map((type) => {
      const rows = accounts.filter((account) => account.account_type === type)

      return rows.reduce(
        (total, account) => {
          const movement = accountMovement(account)

          return {
            type,
            count: total.count + 1,
            debit: total.debit + toMinor(movement.debit),
            credit: total.credit + toMinor(movement.credit),
          }
        },
        { type, count: 0, debit: 0, credit: 0 }
      )
    })

    return {
      byType,
      totalDebit: byType.reduce((total, row) => total + row.debit, 0),
      totalCredit: byType.reduce((total, row) => total + row.credit, 0),
      activeAccounts: accounts.filter((account) => account.is_active).length,
      maxDebit: Math.max(...byType.map((row) => row.debit), 1),
    }
  }, [accounts])

  const recentColumns: IFeeColumn<Accounting.IJournal>[] = [
    {
      key: 'journal',
      label: 'Journal',
      render: (row) => (
        <FeeCellStack
          primary={row.transaction_number}
          secondary={row.description}
        />
      ),
    },
    {
      key: 'date',
      label: 'Date',
      hideBelow: 'sm',
      render: (row) => (
        <Typography fontSize={12} color={colors.grey[600]}>
          {formatDate(row.transaction_date)}
        </Typography>
      ),
    },
    {
      key: 'amount',
      label: 'Debit',
      align: 'right',
      render: (row) => (
        <FeeAmount value={formatMoney(row.total_debit)} strong />
      ),
    },
    {
      key: 'status',
      label: 'Status',
      align: 'right',
      render: (row) => (
        <FeeStatusChip meta={TRANSACTION_STATUS_META[row.status]} />
      ),
    },
  ]

  return (
    <Box>
      <FeePageHeader
        title="Accounting & finance"
        subtitle="Double entry ledger of the school: chart of accounts, journal entries and fiscal periods. All figures come from the accounting API."
        actions={
          <>
            <ButtonComp
              size="small"
              variant="outlined"
              startIcon={<RefreshCw size={14} />}
              onClick={load}
              loading={loading}
            >
              Refresh
            </ButtonComp>
            <ButtonComp
              size="small"
              variant="outlined"
              startIcon={<BookOpen size={14} />}
              onClick={() => navigate(`${ACCOUNTING_BASE_PATH}/accounts`)}
            >
              Chart of accounts
            </ButtonComp>
            {canCreateJournal ? (
              <ButtonComp
                size="small"
                startIcon={<Plus size={14} />}
                onClick={() => navigate(`${ACCOUNTING_BASE_PATH}/journal`)}
              >
                Journal entries
              </ButtonComp>
            ) : null}
          </>
        }
      />

      <FeeStatGrid columns={{ xs: 2, sm: 3, md: 3, xl: 5 }}>
        <FeeStatCard
          label="Accounts"
          value={accountTotal}
          caption={`${summary.activeAccounts} active`}
          icon={<BookOpen size={15} />}
          loading={loading && !data}
          onClick={() => navigate(`${ACCOUNTING_BASE_PATH}/accounts`)}
        />
        <FeeStatCard
          label="Posted journals"
          value={data?.counts.posted ?? 0}
          caption="Immutable entries"
          accent={colors.green[700]}
          soft={colors.green[50]}
          icon={<Scale size={15} />}
          loading={loading && !data}
          onClick={() =>
            navigate(`${ACCOUNTING_BASE_PATH}/journal?status=POSTED`)
          }
        />
        <FeeStatCard
          label="Draft journals"
          value={data?.counts.draft ?? 0}
          caption="Awaiting approval or posting"
          accent={colors.orange[800]}
          soft={colors.orange[50]}
          icon={<CalendarClock size={15} />}
          loading={loading && !data}
          onClick={() =>
            navigate(`${ACCOUNTING_BASE_PATH}/journal?status=DRAFT`)
          }
        />
        <FeeStatCard
          label="Reversed"
          value={data?.counts.reversed ?? 0}
          caption="Reversal entries raised"
          accent={colors.red[600]}
          soft={colors.red[50]}
          icon={<RefreshCw size={15} />}
          loading={loading && !data}
          onClick={() =>
            navigate(`${ACCOUNTING_BASE_PATH}/journal?status=REVERSED`)
          }
        />
        <FeeStatCard
          label="Posted debits"
          value={formatMinorMoney(summary.totalDebit)}
          caption={`Credits ${formatMinorMoney(summary.totalCredit)}`}
          accent={colors.blue[700]}
          soft={colors.blue[50]}
          icon={<Scale size={15} />}
          loading={loading && !data}
          tooltip="Sum of the posted movements returned by GET /accounting/accounts"
        />
      </FeeStatGrid>

      {!loading && data && accountTotal === 0 ? (
        <Box
          sx={{
            mt: 2,
            borderRadius: 3,
            border: `1px dashed ${colors.blue[200]}`,
            bgcolor: colors.blue[50],
            p: 2,
          }}
        >
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            justifyContent="space-between"
          >
            <Box>
              <Typography
                fontSize={14}
                fontWeight={700}
                color={colors.blue[900]}
              >
                The chart of accounts is empty
              </Typography>
              <Typography fontSize={12.5} color={colors.blue[800]} mt={0.25}>
                Provision the default school chart of accounts. Accounts that
                already exist are skipped by the backend, so it is safe to
                repeat.
              </Typography>
            </Box>
            {canManageAccounts ? (
              <ButtonComp
                size="small"
                loading={settingUp}
                onClick={() =>
                  dispatch(
                    setupChartOfAccountsAction({
                      onSuccess: () => {
                        load()
                      },
                    })
                  )
                }
              >
                Provision chart
              </ButtonComp>
            ) : null}
          </Stack>
        </Box>
      ) : null}

      <Box
        sx={{
          mt: 2,
          display: 'grid',
          gap: 2,
          gridTemplateColumns: { xs: '1fr', lg: '1.1fr 1fr' },
          alignItems: 'start',
        }}
      >
        <FeePanel
          title="Movement by account type"
          subtitle="Posted debits and credits aggregated from the chart of accounts"
          action={
            <ButtonComp
              size="small"
              variant="text"
              onClick={() => navigate(`${ACCOUNTING_BASE_PATH}/reports`)}
            >
              Reports
            </ButtonComp>
          }
          footer={
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography fontSize={12} color={colors.grey[600]}>
                Totals
              </Typography>
              <Stack direction="row" spacing={2.5}>
                <Typography
                  fontSize={12}
                  fontWeight={700}
                  color={colors.grey[900]}
                >
                  Dr {formatMinorMoney(summary.totalDebit)}
                </Typography>
                <Typography
                  fontSize={12}
                  fontWeight={700}
                  color={colors.grey[900]}
                >
                  Cr {formatMinorMoney(summary.totalCredit)}
                </Typography>
              </Stack>
            </Stack>
          }
        >
          <Stack spacing={1.5}>
            {summary.byType.map((row) => {
              const meta = ACCOUNT_TYPE_META[row.type]
              const width = Math.round((row.debit / summary.maxDebit) * 100)

              return (
                <Box key={row.type}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={0.6}
                  >
                    <Stack direction="row" spacing={0.9} alignItems="center">
                      <Box
                        component="span"
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: 0.5,
                          bgcolor: meta.dot,
                        }}
                      />
                      <Typography
                        fontSize={12.5}
                        fontWeight={600}
                        color={colors.grey[800]}
                      >
                        {meta.label}
                      </Typography>
                      <Typography fontSize={11.5} color={colors.grey[500]}>
                        {row.count} account{row.count === 1 ? '' : 's'}
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={1.5}>
                      <Typography fontSize={11.5} color={colors.grey[600]}>
                        Dr {formatMinorMoney(row.debit)}
                      </Typography>
                      <Typography fontSize={11.5} color={colors.grey[600]}>
                        Cr {formatMinorMoney(row.credit)}
                      </Typography>
                    </Stack>
                  </Stack>
                  <Box
                    sx={{
                      height: 6,
                      borderRadius: 999,
                      bgcolor: colors.grey[100],
                      overflow: 'hidden',
                    }}
                  >
                    <Box
                      sx={{
                        width: `${width}%`,
                        height: '100%',
                        borderRadius: 999,
                        bgcolor: meta.dot,
                        transition: 'width 240ms ease',
                      }}
                    />
                  </Box>
                </Box>
              )
            })}
          </Stack>
        </FeePanel>

        <FeePanel
          noPadding
          title="Fiscal periods"
          subtitle="Open periods accept new journal entries"
          action={
            <ButtonComp
              size="small"
              variant="text"
              startIcon={<CalendarClock size={13} />}
              onClick={() => navigate(`${ACCOUNTING_BASE_PATH}/periods`)}
            >
              Manage
            </ButtonComp>
          }
        >
          {data?.openPeriods.length ? (
            <Stack
              divider={
                <Box sx={{ borderTop: `1px solid ${colors.grey[100]}` }} />
              }
            >
              {data.openPeriods.map((period) => (
                <Stack
                  key={period.id}
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  spacing={1}
                  sx={{ px: 2, py: 1.4 }}
                >
                  <Box>
                    <Typography
                      fontSize={12.5}
                      fontWeight={600}
                      color={colors.grey[900]}
                    >
                      {period.period_name}
                    </Typography>
                    <Typography fontSize={11.5} color={colors.grey[500]}>
                      {formatDate(period.start_date)} —{' '}
                      {formatDate(period.end_date)}
                    </Typography>
                  </Box>
                  <Typography fontSize={11.5} color={colors.grey[600]}>
                    FY {period.fiscal_year}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          ) : (
            <FeeEmptyState
              icon={<CalendarClock size={20} />}
              title="No open period"
              description="Open a fiscal period before recording journal entries."
              minHeight={150}
              action={
                <ButtonComp
                  size="small"
                  onClick={() => navigate(`${ACCOUNTING_BASE_PATH}/periods`)}
                >
                  Fiscal periods
                </ButtonComp>
              }
            />
          )}
        </FeePanel>
      </Box>

      <Box mt={2}>
        <FeePanel
          noPadding
          title="Recent journal entries"
          subtitle="Latest transactions recorded by the accounting engine"
          action={
            <ButtonComp
              size="small"
              variant="text"
              onClick={() => navigate(`${ACCOUNTING_BASE_PATH}/journal`)}
            >
              Open journal
            </ButtonComp>
          }
        >
          <FeeDataTable
            columns={recentColumns}
            rows={data?.recent.rows ?? []}
            rowKey={(row) => row.id}
            loading={loading && !data}
            skeletonRows={4}
            emptyIcon={<Scale size={20} />}
            emptyTitle="No journal entries yet"
            emptyDescription="Fee invoices, collections and manual journals will appear here once posted."
            onRowClick={(row) =>
              navigate(`${ACCOUNTING_BASE_PATH}/journal/${row.id}`)
            }
          />
        </FeePanel>
      </Box>
    </Box>
  )
}
