import { Box, Stack, Typography } from '@mui/material'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import moment from 'moment'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  Banknote,
  CircleDollarSign,
  Coins,
  FileText,
  Percent,
  RotateCcw,
  Wallet,
} from 'lucide-react'
import { colors } from '@src/helpers/colors.helpers'
import { ButtonComp } from '@src/components/button/button.component'
import { CustomDatePicker } from '@src/components/datePicker/datePicker.component'
import { useDispatch, useSelector } from '@src/store/hooks.store'
import { useFeePermissions } from '@src/hooks/useFeePermissions.hooks'
import {
  getAccountingStatusAction,
  getAgingSummaryAction,
  getFeeDashboardAction,
} from '@src/store/redux/dashboard/fee/fee.dashboard.slice'
import { getRefundsAction } from '@src/store/redux/dashboard/fee/fee.refunds.slice'
import {
  FeeAmount,
  FeeCellStack,
  FeeDataTable,
  IFeeColumn,
} from './components/feeDataTable.component'
import { FeePageHeader } from './components/feePageHeader.component'
import { FeeStatCard, FeeStatGrid } from './components/feeStatCard.component'
import { FeePanel } from './components/feePanel.component'
import {
  FeeChartCard,
  FeeChartTooltip,
  FEE_CHART_COLORS,
} from './components/feeChartCard.component'
import {
  FeeLegendItem,
  FeeStatusChip,
} from './components/feeStatusChip.component'
import {
  AGING_BUCKET_META,
  formatDate,
  formatMoney,
  formatPercent,
  fullName,
  INVOICE_STATUS_META,
  INTEGRATION_STATUS_META,
  PAYMENT_METHOD_LABEL,
  PAYMENT_STATUS_META,
  REFUND_STATUS_META,
} from './fees.helpers'

const FEE_DASHBOARD_PATH = '/dashboard/fees'

export function FeeDashboardPage() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { can } = useFeePermissions()

  const { data: dashboard, loading } = useSelector(
    (store) => store.feeDashboard.dashboard
  )
  const { data: aging, loading: agingLoading } = useSelector(
    (store) => store.feeDashboard.aging
  )
  const { data: refunds, loading: refundsLoading } = useSelector(
    (store) => store.feeRefunds.refunds
  )
  const { status: accounting, loading: accountingLoading } = useSelector(
    (store) => store.feeDashboard.accounting
  )

  const [dateFrom, setDateFrom] = useState(
    moment().startOf('year').format('YYYY-MM-DD')
  )
  const [dateTo, setDateTo] = useState(moment().format('YYYY-MM-DD'))

  const load = useCallback(() => {
    dispatch(
      getFeeDashboardAction({
        filters: { date_from: dateFrom, date_to: dateTo },
      })
    )
    dispatch(getAgingSummaryAction({}))
    dispatch(getRefundsAction({ page: 1, limit: 5 }))
    if (can('fee.accounting_sync.view')) {
      dispatch(getAccountingStatusAction({}))
    }
  }, [dispatch, dateFrom, dateTo, can])

  useEffect(() => {
    load()
  }, [load])

  const totals = dashboard?.totals

  const monthly = useMemo(
    () =>
      (dashboard?.monthly_collection ?? []).map((row) => ({
        month: moment(row.month, ['YYYY-MM', 'YYYY-MM-DD']).format('MMM YY'),
        amount: Number(row.amount ?? 0),
      })),
    [dashboard]
  )
  const daily = useMemo(
    () =>
      (dashboard?.daily_collection ?? []).slice(-14).map((row) => ({
        date: moment(row.date).format('DD MMM'),
        amount: Number(row.amount ?? 0),
      })),
    [dashboard]
  )
  const classWise = useMemo(
    () =>
      (dashboard?.class_wise_collection ?? [])
        .map((row) => ({
          name: row.class_name,
          amount: Number(row.amount ?? 0),
        }))
        .slice(0, 8),
    [dashboard]
  )
  const feeTypeWise = useMemo(
    () =>
      (dashboard?.fee_type_wise ?? [])
        .map((row) => ({
          name: row.fee_type_name,
          value: Number(row.amount ?? 0),
          discount: Number(row.discount ?? 0),
        }))
        .filter((row) => row.value > 0)
        .slice(0, 7),
    [dashboard]
  )
  const agingRows = useMemo(() => {
    const buckets = aging?.buckets

    return (
      [
        'NOT_DUE',
        'DAYS_1_30',
        'DAYS_31_60',
        'DAYS_61_90',
        'ABOVE_90',
      ] as Fee.AgingBucket[]
    ).map((key) => ({ key, value: Number(buckets?.[key] ?? 0) }))
  }, [aging])

  const collectedVsOutstanding = useMemo(
    () => [
      { name: 'Collected', value: Number(totals?.collected ?? 0) },
      { name: 'Outstanding', value: Number(totals?.outstanding ?? 0) },
    ],
    [totals]
  )

  const failedEvents = accounting?.unresolved ?? []

  const invoiceColumns: IFeeColumn<Fee.IRecentInvoiceRow>[] = [
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
      key: 'due_date',
      label: 'Due date',
      hideBelow: 'sm',
      render: (row) => (
        <Typography fontSize={12.5} color={colors.grey[700]}>
          {formatDate(row.due_date)}
        </Typography>
      ),
    },
    {
      key: 'total_amount',
      label: 'Total',
      align: 'right',
      render: (row) => <FeeAmount value={formatMoney(row.total_amount)} />,
    },
    {
      key: 'outstanding_amount',
      label: 'Outstanding',
      align: 'right',
      hideBelow: 'md',
      render: (row) => (
        <FeeAmount
          value={formatMoney(row.outstanding_amount)}
          tone="danger"
          strong
        />
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <FeeStatusChip meta={INVOICE_STATUS_META[row.status]} />,
    },
  ]

  const paymentColumns: IFeeColumn<Fee.IRecentPaymentRow>[] = [
    {
      key: 'payment_number',
      label: 'Payment',
      render: (row) => (
        <FeeCellStack
          primary={row.payment_number}
          secondary={fullName(row.firstname, row.lastname)}
        />
      ),
    },
    {
      key: 'payment_date',
      label: 'Date',
      hideBelow: 'sm',
      render: (row) => (
        <Typography fontSize={12.5} color={colors.grey[700]}>
          {formatDate(row.payment_date)}
        </Typography>
      ),
    },
    {
      key: 'payment_method',
      label: 'Method',
      hideBelow: 'md',
      render: (row) => (
        <Typography fontSize={12} color={colors.grey[600]}>
          {PAYMENT_METHOD_LABEL[row.payment_method] ?? row.payment_method}
        </Typography>
      ),
    },
    {
      key: 'total_amount',
      label: 'Amount',
      align: 'right',
      render: (row) => (
        <FeeAmount
          value={formatMoney(row.total_amount)}
          tone="success"
          strong
        />
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <FeeStatusChip meta={PAYMENT_STATUS_META[row.status]} />,
    },
  ]

  const outstandingColumns: IFeeColumn<Fee.ITopOutstandingRow>[] = [
    {
      key: 'student_id',
      label: 'Student',
      render: (row) => (
        <FeeCellStack
          primary={fullName(row.firstname, row.lastname)}
          secondary={`Student ID #${row.student_id}`}
        />
      ),
    },
    {
      key: 'outstanding',
      label: 'Outstanding',
      align: 'right',
      render: (row) => (
        <FeeAmount value={formatMoney(row.outstanding)} tone="danger" strong />
      ),
    },
  ]

  const refundColumns: IFeeColumn<Fee.IRefund>[] = [
    {
      key: 'refund_number',
      label: 'Refund',
      render: (row) => (
        <FeeCellStack
          primary={row.refund_number}
          secondary={formatDate(row.created_at)}
        />
      ),
    },
    {
      key: 'amount',
      label: 'Amount',
      align: 'right',
      render: (row) => <FeeAmount value={formatMoney(row.amount)} />,
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <FeeStatusChip meta={REFUND_STATUS_META[row.status]} />,
    },
  ]

  return (
    <Box>
      <FeePageHeader
        title="Fee overview"
        subtitle="Operational collection performance. Statutory revenue and receivables stay in the accounting engine — this dashboard never re-states them."
        actions={
          <>
            <ButtonComp
              size="small"
              variant="outlined"
              startIcon={<RotateCcw size={14} />}
              onClick={load}
            >
              Refresh
            </ButtonComp>
            {can('fee.payments.collect') ? (
              <ButtonComp
                size="small"
                startIcon={<Banknote size={14} />}
                onClick={() =>
                  navigate(`${FEE_DASHBOARD_PATH}/payments/collect`)
                }
              >
                Collect payment
              </ButtonComp>
            ) : null}
          </>
        }
        meta={
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            flexWrap="wrap"
            rowGap={1}
          >
            <Box sx={{ width: 165 }}>
              <CustomDatePicker
                labelDetail={{ text: 'From', required: false }}
                views={['day', 'month', 'year']}
                value={dateFrom ? moment(dateFrom) : null}
                onChange={(value) =>
                  setDateFrom(
                    value && moment(value).isValid()
                      ? moment(value).format('YYYY-MM-DD')
                      : ''
                  )
                }
                slotProps={{ textField: { size: 'small' } }}
              />
            </Box>
            <Box sx={{ width: 165 }}>
              <CustomDatePicker
                labelDetail={{ text: 'To', required: false }}
                views={['day', 'month', 'year']}
                value={dateTo ? moment(dateTo) : null}
                onChange={(value) =>
                  setDateTo(
                    value && moment(value).isValid()
                      ? moment(value).format('YYYY-MM-DD')
                      : ''
                  )
                }
                slotProps={{ textField: { size: 'small' } }}
              />
            </Box>
          </Stack>
        }
      />

      <Box mb={2}>
        <FeeStatGrid columns={{ xs: 2, sm: 2, md: 4, xl: 4 }}>
          <FeeStatCard
            label="Total invoiced"
            value={formatMoney(totals?.invoiced, { compact: true })}
            caption={`${totals?.invoice_count ?? 0} invoices`}
            icon={<FileText size={15} />}
            accent={colors.blue[600]}
            soft={colors.blue[50]}
            loading={loading}
            tooltip="Sum of the non cancelled invoices of the selected period."
            onClick={() => navigate(`${FEE_DASHBOARD_PATH}/invoices`)}
          />
          <FeeStatCard
            label="Total collected"
            value={formatMoney(totals?.collected, { compact: true })}
            caption={`${totals?.payment_count ?? 0} payments`}
            icon={<Banknote size={15} />}
            accent={colors.green[700]}
            soft={colors.green[50]}
            loading={loading}
            tooltip="Cash actually received (confirmed payments) in the period."
            onClick={() => navigate(`${FEE_DASHBOARD_PATH}/payments`)}
          />
          <FeeStatCard
            label="Outstanding"
            value={formatMoney(totals?.outstanding, { compact: true })}
            caption="Open receivable"
            icon={<CircleDollarSign size={15} />}
            accent={colors.orange[700]}
            soft={colors.orange[50]}
            loading={loading}
            tooltip="Outstanding balance of the open invoices."
            onClick={() =>
              navigate(`${FEE_DASHBOARD_PATH}/invoices?outstanding=1`)
            }
          />
          <FeeStatCard
            label="Overdue"
            value={formatMoney(totals?.overdue, { compact: true })}
            caption="Past the due date"
            icon={<CircleDollarSign size={15} />}
            accent={colors.red[600]}
            soft={colors.red[50]}
            loading={loading}
            tooltip="Outstanding balance of the invoices flagged OVERDUE."
            onClick={() => navigate(`${FEE_DASHBOARD_PATH}/defaulters`)}
          />
          <FeeStatCard
            label="Advance payments"
            value={formatMoney(totals?.advances, { compact: true })}
            caption="Held as student advance"
            icon={<Wallet size={15} />}
            accent={colors.indigo[500]}
            soft={colors.indigo[50]}
            loading={loading}
            tooltip="Wallet balances: money received before it was earned (liability 2400)."
            onClick={() => navigate(`${FEE_DASHBOARD_PATH}/wallets`)}
          />
          <FeeStatCard
            label="Discounts"
            value={formatMoney(totals?.discounts, { compact: true })}
            caption="Scholarships & concessions"
            icon={<Percent size={15} />}
            accent={colors.purple[500]}
            soft={colors.purple[50]}
            loading={loading}
            tooltip="Total discount recognised on the invoices of the period."
            onClick={() => navigate(`${FEE_DASHBOARD_PATH}/scholarships`)}
          />
          <FeeStatCard
            label="Refunds"
            value={formatMoney(totals?.refunded, { compact: true })}
            caption={`${totals?.refund_count ?? 0} processed`}
            icon={<Coins size={15} />}
            accent={colors.teal[700]}
            soft={colors.teal[50]}
            loading={loading}
            tooltip="Refunds already processed (cash out)."
            onClick={() => navigate(`${FEE_DASHBOARD_PATH}/refunds`)}
          />
          <FeeStatCard
            label="Collection rate"
            value={formatPercent(totals?.collection_rate)}
            caption="Collected ÷ invoiced"
            icon={<Percent size={15} />}
            accent={colors.cyan[700]}
            soft={colors.cyan[50]}
            loading={loading}
            tooltip="Collected divided by invoiced for the selected period."
            onClick={() => navigate(`${FEE_DASHBOARD_PATH}/reports`)}
          />
        </FeeStatGrid>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gap: 1.5,
          gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, minmax(0, 1fr))' },
          mb: 2,
        }}
      >
        <FeeChartCard
          title="Monthly collection trend"
          subtitle="Confirmed payments per month"
          loading={loading}
          isEmpty={monthly.length === 0}
        >
          <ResponsiveContainer width="100%" height={230}>
            <LineChart
              data={monthly}
              margin={{ top: 8, right: 8, bottom: 0, left: -12 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={colors.grey[200]}
                vertical={false}
              />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11 }}
                stroke={colors.grey[400]}
              />
              <YAxis
                tick={{ fontSize: 11 }}
                stroke={colors.grey[400]}
                width={64}
              />
              <Tooltip content={<FeeChartTooltip />} />
              <Line
                type="monotone"
                dataKey="amount"
                name="Collected"
                stroke={colors.blue[600]}
                strokeWidth={2.4}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </FeeChartCard>

        <FeeChartCard
          title="Daily collection"
          subtitle="Last 14 collection days"
          loading={loading}
          isEmpty={daily.length === 0}
        >
          <ResponsiveContainer width="100%" height={230}>
            <AreaChart
              data={daily}
              margin={{ top: 8, right: 8, bottom: 0, left: -12 }}
            >
              <defs>
                <linearGradient
                  id="feeDailyGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor={colors.green[600]}
                    stopOpacity={0.35}
                  />
                  <stop
                    offset="100%"
                    stopColor={colors.green[600]}
                    stopOpacity={0.02}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={colors.grey[200]}
                vertical={false}
              />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10.5 }}
                stroke={colors.grey[400]}
              />
              <YAxis
                tick={{ fontSize: 11 }}
                stroke={colors.grey[400]}
                width={64}
              />
              <Tooltip content={<FeeChartTooltip />} />
              <Area
                type="monotone"
                dataKey="amount"
                name="Collected"
                stroke={colors.green[700]}
                strokeWidth={2}
                fill="url(#feeDailyGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </FeeChartCard>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gap: 1.5,
          gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, minmax(0, 1fr))' },
          mb: 2,
        }}
      >
        <FeeChartCard
          title="Class-wise collection"
          subtitle="Collected amount per class"
          loading={loading}
          isEmpty={classWise.length === 0}
        >
          <ResponsiveContainer width="100%" height={240}>
            <BarChart
              data={classWise}
              layout="vertical"
              margin={{ top: 4, right: 16, bottom: 0, left: 8 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={colors.grey[200]}
                horizontal={false}
              />
              <XAxis
                type="number"
                tick={{ fontSize: 11 }}
                stroke={colors.grey[400]}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 11 }}
                stroke={colors.grey[400]}
                width={90}
              />
              <Tooltip content={<FeeChartTooltip />} />
              <Bar
                dataKey="amount"
                name="Collected"
                fill={colors.blue[500]}
                radius={[0, 6, 6, 0]}
                barSize={14}
              />
            </BarChart>
          </ResponsiveContainer>
        </FeeChartCard>

        <FeeChartCard
          title="Fee type-wise collection"
          subtitle="Net collected per fee type"
          loading={loading}
          isEmpty={feeTypeWise.length === 0}
          legend={
            <Stack direction="row" spacing={1.5} flexWrap="wrap" rowGap={0.5}>
              {feeTypeWise.slice(0, 5).map((row, index) => (
                <FeeLegendItem
                  key={row.name}
                  color={FEE_CHART_COLORS[index % FEE_CHART_COLORS.length]}
                  label={row.name}
                />
              ))}
            </Stack>
          }
        >
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Tooltip content={<FeeChartTooltip />} />
              <Pie
                data={feeTypeWise}
                dataKey="value"
                nameKey="name"
                innerRadius={52}
                outerRadius={88}
                paddingAngle={2}
              >
                {feeTypeWise.map((row, index) => (
                  <Cell
                    key={row.name}
                    fill={FEE_CHART_COLORS[index % FEE_CHART_COLORS.length]}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </FeeChartCard>

        <FeeChartCard
          title="Outstanding vs collected"
          subtitle="Share of the period receivable"
          loading={loading}
          isEmpty={collectedVsOutstanding.every((row) => row.value === 0)}
          legend={
            <Stack direction="row" spacing={2}>
              <FeeLegendItem color={colors.green[600]} label="Collected" />
              <FeeLegendItem color={colors.orange[600]} label="Outstanding" />
            </Stack>
          }
        >
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Tooltip content={<FeeChartTooltip />} />
              <Pie
                data={collectedVsOutstanding}
                dataKey="value"
                nameKey="name"
                innerRadius={58}
                outerRadius={92}
                startAngle={90}
                endAngle={-270}
              >
                <Cell fill={colors.green[600]} />
                <Cell fill={colors.orange[600]} />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </FeeChartCard>

        <FeeChartCard
          title="Defaulter distribution"
          subtitle={`Aging of the receivable as of ${formatDate(
            aging?.as_of_date
          )}`}
          loading={agingLoading}
          isEmpty={agingRows.every((row) => row.value === 0)}
          legend={
            <Stack direction="row" spacing={1.5} flexWrap="wrap" rowGap={0.5}>
              {agingRows.map((row) => (
                <FeeLegendItem
                  key={row.key}
                  color={AGING_BUCKET_META[row.key].dot}
                  label={AGING_BUCKET_META[row.key].label}
                />
              ))}
            </Stack>
          }
        >
          <ResponsiveContainer width="100%" height={240}>
            <BarChart
              data={agingRows}
              margin={{ top: 8, right: 8, bottom: 0, left: -12 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={colors.grey[200]}
                vertical={false}
              />
              <XAxis
                dataKey="key"
                tickFormatter={(value: Fee.AgingBucket) =>
                  AGING_BUCKET_META[value].label
                }
                tick={{ fontSize: 10 }}
                stroke={colors.grey[400]}
              />
              <YAxis
                tick={{ fontSize: 11 }}
                stroke={colors.grey[400]}
                width={64}
              />
              <Tooltip content={<FeeChartTooltip />} />
              <Bar
                dataKey="value"
                name="Outstanding"
                radius={[6, 6, 0, 0]}
                barSize={26}
              >
                {agingRows.map((row) => (
                  <Cell key={row.key} fill={AGING_BUCKET_META[row.key].dot} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </FeeChartCard>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gap: 1.5,
          gridTemplateColumns: { xs: '1fr', xl: 'repeat(2, minmax(0, 1fr))' },
          mb: 2,
        }}
      >
        <FeePanel
          title="Recent payments"
          subtitle="Latest confirmed collections"
          noPadding
          action={
            <ButtonComp
              size="small"
              variant="text"
              endIcon={<Banknote size={13} />}
              onClick={() => navigate(`${FEE_DASHBOARD_PATH}/payments`)}
            >
              View all
            </ButtonComp>
          }
        >
          <FeeDataTable
            columns={paymentColumns}
            rows={dashboard?.recent_payments ?? []}
            rowKey={(row) => row.id}
            loading={loading}
            skeletonRows={4}
            dense
            emptyTitle="No payments yet"
            emptyDescription="Collected payments appear here as soon as they are confirmed."
          />
        </FeePanel>

        <FeePanel
          title="Recent invoices"
          subtitle="Newest billed documents"
          noPadding
          action={
            <ButtonComp
              size="small"
              variant="text"
              endIcon={<FileText size={13} />}
              onClick={() => navigate(`${FEE_DASHBOARD_PATH}/invoices`)}
            >
              View all
            </ButtonComp>
          }
        >
          <FeeDataTable
            columns={invoiceColumns}
            rows={dashboard?.recent_invoices ?? []}
            rowKey={(row) => row.id}
            loading={loading}
            skeletonRows={4}
            dense
            emptyTitle="No invoices yet"
            emptyDescription="Generated invoices appear here."
          />
        </FeePanel>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gap: 1.5,
          gridTemplateColumns: { xs: '1fr', lg: 'repeat(3, minmax(0, 1fr))' },
        }}
      >
        <FeePanel
          title="Top outstanding students"
          subtitle="Highest receivable balance"
          noPadding
        >
          <FeeDataTable
            columns={outstandingColumns}
            rows={dashboard?.top_outstanding ?? []}
            rowKey={(row) => row.student_id}
            loading={loading}
            skeletonRows={4}
            dense
            emptyTitle="Nothing outstanding"
            emptyDescription="Every open invoice is fully paid."
          />
        </FeePanel>

        <FeePanel
          title="Recent refunds"
          subtitle="Last refund requests"
          noPadding
        >
          <FeeDataTable
            columns={refundColumns}
            rows={refunds?.rows ?? []}
            rowKey={(row) => row.id}
            loading={refundsLoading}
            skeletonRows={4}
            dense
            emptyTitle="No refunds recorded"
          />
        </FeePanel>

        <FeePanel
          title="Accounting sync"
          subtitle="Fee events waiting for the ledger"
          noPadding
        >
          <FeeDataTable
            columns={[
              {
                key: 'event_type',
                label: 'Event',
                render: (row) => (
                  <FeeCellStack
                    primary={row.event_type.replace('FEE_', '')}
                    secondary={formatDate(row.created_at)}
                  />
                ),
              },
              {
                key: 'status',
                label: 'Status',
                render: (row) => (
                  <FeeStatusChip meta={INTEGRATION_STATUS_META[row.status]} />
                ),
              },
            ]}
            rows={failedEvents.slice(0, 5)}
            rowKey={(row) => row.id}
            loading={accountingLoading}
            skeletonRows={4}
            dense
            emptyTitle="Everything is posted"
            emptyDescription="No fee event is waiting for an accounting journal."
          />
        </FeePanel>
      </Box>
    </Box>
  )
}
