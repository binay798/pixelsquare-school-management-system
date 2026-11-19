import { Box, ButtonBase, Stack, Typography } from '@mui/material'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { ArrowRight, TrendingDown, TrendingUp } from 'lucide-react'
import { colors } from '@src/helpers/colors.helpers'
import {
  CHART_COLORS,
  DASHBOARD_ICONS,
  formatCompactMoney,
  formatDate,
  formatFullMoney,
  formatMonth,
  formatNumber,
} from '../dashboard.helpers'
import {
  DashboardEmptyState,
  DashboardPanel,
  SectionHeading,
  WidgetError,
  WidgetSkeleton,
} from './dashboardPrimitives.component'
import {
  CHART_AXIS_PROPS,
  CHART_GRID_PROPS,
  DashboardChartTooltip,
} from './dashboardChartTooltip.component'

interface Props {
  finance: Dashboard.IWidget<Dashboard.IFinance>
  onRetry: () => void
}

const CHART_HEIGHT = 210

const moneyTooltip = (value: string | number | undefined) =>
  formatFullMoney(value)

/** Financial overview: fee collection, position, income/expense and payroll. */
export function DashboardFinanceSection({ finance, onRetry }: Props) {
  const navigate = useNavigate()
  const data = finance.data

  const collectionSeries = useMemo(
    () =>
      (data?.collection_trend ?? []).map((row) => ({
        month: formatMonth(row.month),
        amount: Number(row.amount),
      })),
    [data?.collection_trend]
  )

  const incomeExpenseSeries = useMemo(
    () =>
      (data?.income_expense.monthly ?? []).map((row) => ({
        month: formatMonth(row.month),
        income: Number(row.income),
        expenses: Number(row.expenses),
      })),
    [data?.income_expense.monthly]
  )

  if (!data && finance.loading) {
    return (
      <Box>
        <SectionHeading
          eyebrow="Finance"
          title="Financial overview"
          subtitle="Fee collection, ledger position and payroll"
        />
        <Box
          sx={{
            display: 'grid',
            gap: 1.5,
            gridTemplateColumns: {
              xs: '1fr',
              lg: 'minmax(0, 1.45fr) minmax(0, 1fr)',
            },
            mb: 1.5,
          }}
        >
          <DashboardPanel>
            <WidgetSkeleton />
          </DashboardPanel>
          <DashboardPanel>
            <WidgetSkeleton />
          </DashboardPanel>
        </Box>
      </Box>
    )
  }

  if (!data) {
    return (
      <Box>
        <SectionHeading
          eyebrow="Finance"
          title="Financial overview"
          subtitle="Fee collection, ledger position and payroll"
        />
        <WidgetError message={finance.error} onRetry={onRetry} />
      </Box>
    )
  }

  const netPositive = Number(data.income_expense.net) >= 0

  return (
    <Box>
      <SectionHeading
        eyebrow="Finance"
        title="Financial overview"
        subtitle="Fee desk, double-entry ledger and payroll of the selected period"
        action={
          <ButtonBase
            onClick={() => navigate('/dashboard/accounting')}
            sx={{
              fontSize: 11.5,
              fontWeight: 600,
              color: colors.blue[700],
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.4,
            }}
          >
            Accounting workspace
            <ArrowRight size={12} />
          </ButtonBase>
        }
      />

      <Box
        sx={{
          display: 'grid',
          gap: 1.5,
          gridTemplateColumns: {
            xs: '1fr',
            lg: 'minmax(0, 1.45fr) minmax(0, 1fr)',
          },
          mb: 1.5,
        }}
      >
        <DashboardPanel
          title="Fee collection"
          subtitle={`${formatNumber(
            data.fees.invoice_count
          )} invoices · ${formatNumber(data.fees.payment_count)} payments`}
        >
          <Stack
            direction="row"
            spacing={2}
            rowGap={1}
            flexWrap="wrap"
            sx={{
              pb: 1.25,
              mb: 0.5,
              borderBottom: `1px solid ${colors.grey[100]}`,
            }}
          >
            {[
              {
                label: 'Invoiced',
                value: data.fees.invoiced,
                tone: colors.grey[900],
              },
              {
                label: 'Collected',
                value: data.fees.collected,
                tone: CHART_COLORS.teal,
              },
              {
                label: 'Outstanding (now)',
                value: data.fees.outstanding,
                tone: colors.grey[900],
              },
              {
                label: 'Overdue (now)',
                value: data.fees.overdue,
                tone: colors.red[600],
              },
            ].map((item) => (
              <Box key={item.label} sx={{ minWidth: 74 }}>
                <Typography fontSize={10.5} color={colors.grey[600]} noWrap>
                  {item.label}
                </Typography>
                <Typography
                  fontSize={13}
                  fontWeight={700}
                  color={item.tone}
                  noWrap
                >
                  {formatCompactMoney(item.value)}
                </Typography>
              </Box>
            ))}
            <Box sx={{ textAlign: 'right', minWidth: 74, ml: 'auto' }}>
              <Typography fontSize={10.5} color={colors.grey[600]} noWrap>
                Confirmed payments
              </Typography>
              <Typography
                fontSize={13}
                fontWeight={700}
                color={colors.grey[900]}
              >
                {formatNumber(data.fees.payment_count)}
              </Typography>
            </Box>
          </Stack>

          {collectionSeries.length === 0 ? (
            <DashboardEmptyState
              title="No confirmed payments in this period"
              description="Fee collections appear here as soon as the fee desk records payments."
              minHeight={CHART_HEIGHT - 40}
              action={
                <ButtonBase
                  onClick={() => navigate('/dashboard/fees/payments/collect')}
                  sx={{
                    px: 1.25,
                    py: 0.55,
                    borderRadius: 1.5,
                    bgcolor: colors.blue[600],
                    color: '#fff',
                    fontSize: 11.5,
                    fontWeight: 600,
                  }}
                >
                  Record payment
                </ButtonBase>
              }
            />
          ) : (
            <Box sx={{ width: '100%', height: CHART_HEIGHT }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={collectionSeries}
                  margin={{ top: 8, right: 6, bottom: 0, left: 4 }}
                >
                  <CartesianGrid {...CHART_GRID_PROPS} />
                  <XAxis dataKey="month" {...CHART_AXIS_PROPS} />
                  <YAxis
                    tickFormatter={(value: number) =>
                      formatCompactMoney(String(value)).replace('Rs ', '')
                    }
                    {...CHART_AXIS_PROPS}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(36,99,235,.04)' }}
                    content={
                      <DashboardChartTooltip valueFormatter={moneyTooltip} />
                    }
                  />
                  <Bar
                    dataKey="amount"
                    name="Collected"
                    fill={CHART_COLORS.teal}
                    radius={[4, 4, 0, 0]}
                    maxBarSize={34}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          )}
        </DashboardPanel>

        <DashboardPanel
          title="Financial position"
          subtitle={`Posted balances · as of ${formatDate(
            data.position.as_of
          )}`}
        >
          <Stack
            spacing={1.1}
            sx={{ height: '100%', justifyContent: 'center' }}
          >
            {[
              {
                label: 'Cash in hand',
                value: data.position.cash,
                icon: DASHBOARD_ICONS.cash,
                accent: CHART_COLORS.green,
                soft: colors.green[50],
              },
              {
                label: 'Bank balance',
                value: data.position.bank,
                icon: DASHBOARD_ICONS.bank,
                accent: CHART_COLORS.blue,
                soft: colors.blue[50],
              },
              {
                label: 'Accounts receivable',
                value: data.position.receivables,
                icon: DASHBOARD_ICONS.receivable,
                accent: CHART_COLORS.amber,
                soft: colors.amber[50],
              },
              {
                label: 'Accounts payable',
                value: data.position.payables,
                icon: DASHBOARD_ICONS.payable,
                accent: CHART_COLORS.red,
                soft: colors.red[50],
              },
            ].map((row) => {
              const Icon = row.icon

              return (
                <Stack
                  key={row.label}
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  spacing={1}
                  sx={{
                    px: 1.1,
                    py: 0.85,
                    borderRadius: 2,
                    bgcolor: colors.grey[50],
                  }}
                >
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    sx={{ minWidth: 0 }}
                  >
                    <Box
                      sx={{
                        width: 26,
                        height: 26,
                        borderRadius: 1.5,
                        display: 'grid',
                        placeItems: 'center',
                        bgcolor: row.soft,
                        color: row.accent,
                        flexShrink: 0,
                      }}
                    >
                      <Icon size={13} />
                    </Box>
                    <Typography fontSize={12} color={colors.grey[600]} noWrap>
                      {row.label}
                    </Typography>
                  </Stack>
                  <Typography
                    fontSize={13}
                    fontWeight={700}
                    color={colors.grey[900]}
                    noWrap
                  >
                    {formatCompactMoney(row.value)}
                  </Typography>
                </Stack>
              )
            })}

            <Typography fontSize={10.5} color={colors.grey[600]} mt={0.25}>
              Ledger balances come from the accounting service, net of reversed
              journals.
            </Typography>
          </Stack>
        </DashboardPanel>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gap: 1.5,
          gridTemplateColumns: {
            xs: '1fr',
            lg: 'minmax(0, 1.45fr) minmax(0, 1fr)',
          },
        }}
      >
        <DashboardPanel
          title="Income vs expenses"
          subtitle="Posted revenue and expense accounts"
          action={
            <Stack
              direction="row"
              spacing={0.5}
              alignItems="center"
              sx={{
                px: 0.9,
                py: 0.25,
                borderRadius: 999,
                bgcolor: netPositive ? colors.green[50] : colors.red[50],
                color: netPositive ? colors.green[700] : colors.red[700],
              }}
            >
              {netPositive ? (
                <TrendingUp size={12} />
              ) : (
                <TrendingDown size={12} />
              )}
              <Typography fontSize={10.5} fontWeight={700}>
                {netPositive ? 'Surplus' : 'Deficit'}{' '}
                {formatCompactMoney(data.income_expense.net)}
              </Typography>
            </Stack>
          }
        >
          {!data.income_expense.has_chart_of_accounts ? (
            <DashboardEmptyState
              title="Chart of accounts not provisioned"
              description="Income and expense figures come from the double-entry ledger. Set up the chart of accounts to activate this panel."
              minHeight={CHART_HEIGHT - 20}
              action={
                <ButtonBase
                  onClick={() => navigate('/dashboard/accounting/accounts')}
                  sx={{
                    px: 1.25,
                    py: 0.55,
                    borderRadius: 1.5,
                    border: `1px solid ${colors.grey[300]}`,
                    fontSize: 11.5,
                    fontWeight: 600,
                    color: colors.grey[700],
                  }}
                >
                  Open chart of accounts
                </ButtonBase>
              }
            />
          ) : incomeExpenseSeries.length === 0 ? (
            <DashboardEmptyState
              title="No posted journals in this period"
              description="Revenue and expense figures appear once journals are posted to the ledger."
              minHeight={CHART_HEIGHT - 20}
            />
          ) : (
            <>
              <Stack direction="row" spacing={2} mb={0.5}>
                <Box>
                  <Typography fontSize={10.5} color={colors.grey[600]}>
                    Total income
                  </Typography>
                  <Typography
                    fontSize={13}
                    fontWeight={700}
                    color={CHART_COLORS.green}
                  >
                    {formatFullMoney(data.income_expense.income)}
                  </Typography>
                </Box>
                <Box>
                  <Typography fontSize={10.5} color={colors.grey[600]}>
                    Total expenses
                  </Typography>
                  <Typography
                    fontSize={13}
                    fontWeight={700}
                    color={CHART_COLORS.red}
                  >
                    {formatFullMoney(data.income_expense.expenses)}
                  </Typography>
                </Box>
              </Stack>
              <Box sx={{ width: '100%', height: CHART_HEIGHT }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={incomeExpenseSeries}
                    margin={{ top: 8, right: 6, bottom: 0, left: 4 }}
                  >
                    <CartesianGrid {...CHART_GRID_PROPS} />
                    <XAxis dataKey="month" {...CHART_AXIS_PROPS} />
                    <YAxis
                      tickFormatter={(value: number) =>
                        formatCompactMoney(String(value)).replace('Rs ', '')
                      }
                      {...CHART_AXIS_PROPS}
                    />
                    <Tooltip
                      cursor={{ fill: 'rgba(36,99,235,.04)' }}
                      content={
                        <DashboardChartTooltip valueFormatter={moneyTooltip} />
                      }
                    />
                    <Bar
                      dataKey="income"
                      name="Income"
                      fill={CHART_COLORS.green}
                      radius={[3, 3, 0, 0]}
                      maxBarSize={22}
                    />
                    <Bar
                      dataKey="expenses"
                      name="Expenses"
                      fill={CHART_COLORS.red}
                      radius={[3, 3, 0, 0]}
                      maxBarSize={22}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </>
          )}
        </DashboardPanel>

        <DashboardPanel
          title="Payroll"
          subtitle="Runs within the selected period"
        >
          <Stack spacing={1.25} sx={{ height: '100%' }}>
            <Box
              sx={{
                borderRadius: 2,
                border: `1px solid ${colors.grey[100]}`,
                bgcolor: colors.grey[50],
                px: 1.25,
                py: 1,
              }}
            >
              <Typography fontSize={10.5} color={colors.grey[600]}>
                Employees on payroll
              </Typography>
              <Typography
                fontSize={20}
                fontWeight={700}
                color={colors.grey[900]}
              >
                {formatNumber(data.payroll.employees)}
              </Typography>
            </Box>

            <Stack direction="row" spacing={1}>
              <Box
                sx={{
                  flex: 1,
                  borderRadius: 2,
                  border: `1px solid ${colors.grey[100]}`,
                  px: 1.1,
                  py: 0.9,
                  minWidth: 0,
                }}
              >
                <Typography fontSize={10.5} color={colors.grey[600]}>
                  Processed
                </Typography>
                <Typography
                  fontSize={14}
                  fontWeight={700}
                  color={CHART_COLORS.green}
                  noWrap
                  title={formatFullMoney(data.payroll.processed_net)}
                >
                  {formatCompactMoney(data.payroll.processed_net)}
                </Typography>
                <Typography fontSize={10.5} color={colors.grey[600]}>
                  {formatNumber(data.payroll.processed_runs)} run
                  {data.payroll.processed_runs === 1 ? '' : 's'}
                </Typography>
              </Box>
              <Box
                sx={{
                  flex: 1,
                  borderRadius: 2,
                  border: `1px solid ${colors.amber[200]}`,
                  bgcolor: colors.amber[50],
                  px: 1.1,
                  py: 0.9,
                  minWidth: 0,
                }}
              >
                <Typography fontSize={10.5} color={colors.amber[900]}>
                  Pending
                </Typography>
                <Typography
                  fontSize={14}
                  fontWeight={700}
                  color={colors.amber[900]}
                  noWrap
                  title={formatFullMoney(data.payroll.pending_net)}
                >
                  {formatCompactMoney(data.payroll.pending_net)}
                </Typography>
                <Typography fontSize={10.5} color={colors.amber[800]}>
                  {formatNumber(data.payroll.pending_runs)} run
                  {data.payroll.pending_runs === 1 ? '' : 's'} to settle
                </Typography>
              </Box>
            </Stack>

            <Stack spacing={0.5} sx={{ mt: 'auto' }}>
              <Typography fontSize={10.5} color={colors.grey[600]}>
                Employer cost of processed runs
              </Typography>
              <Typography
                fontSize={12.5}
                fontWeight={600}
                color={colors.grey[800]}
              >
                {formatFullMoney(data.payroll.processed_cost)}
              </Typography>
              <Typography fontSize={10.5} color={colors.grey[600]}>
                Gross salary, deductions and employer contributions as computed
                by the payroll engine.
              </Typography>
            </Stack>
          </Stack>
        </DashboardPanel>
      </Box>
    </Box>
  )
}
