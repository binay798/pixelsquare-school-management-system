import { Box, Stack, Typography } from '@mui/material'
import { useCallback, useEffect, useState } from 'react'
import moment from 'moment'
import { Download, FileSpreadsheet, Printer } from 'lucide-react'
import { colors } from '@src/helpers/colors.helpers'
import { ButtonComp } from '@src/components/button/button.component'
import { SelectField } from '@src/components/select/select.component'
import { CustomDatePicker } from '@src/components/datePicker/datePicker.component'
import { useDispatch, useSelector } from '@src/store/hooks.store'
import {
  getCollectionReportAction,
  getDiscountReportAction,
  getLateFeeReportAction,
  getOutstandingReportAction,
  getRefundReportAction,
  getWalletReportAction,
} from '@src/store/redux/dashboard/fee/fee.dashboard.slice'
import { IReportFilters } from '@src/store/redux/dashboard/fee/fee.service'
import { FeePageHeader } from '../../components/feePageHeader.component'
import { FeePanel } from '../../components/feePanel.component'
import { FeeFilterBar } from '../../components/feeFilterBar.component'
import {
  FeeAmount,
  FeeCellStack,
  FeeDataTable,
  IFeeColumn,
} from '../../components/feeDataTable.component'
import {
  downloadCsv,
  formatDate,
  formatMoney,
  IOption,
  printElement,
} from '../../fees.helpers'
import { useFeeReference } from '../../hooks/useFeeReference.hooks'

type TReportKey =
  | 'collections'
  | 'outstanding'
  | 'discounts'
  | 'refunds'
  | 'wallets'
  | 'late_fees'

const REPORT_OPTIONS: IOption<TReportKey>[] = [
  { value: 'collections', label: 'Fee collection report' },
  { value: 'outstanding', label: 'Outstanding fee report' },
  { value: 'discounts', label: 'Scholarship & discount report' },
  { value: 'refunds', label: 'Refund report' },
  { value: 'wallets', label: 'Advance payment (wallet) report' },
  { value: 'late_fees', label: 'Late fee report' },
]

const GROUP_BY_OPTIONS: IOption[] = [
  { value: 'DAY', label: 'Daily' },
  { value: 'MONTH', label: 'Monthly' },
  { value: 'PAYMENT_METHOD', label: 'Payment method' },
]

export function FeeReportsPage() {
  const dispatch = useDispatch()
  const { years } = useFeeReference()

  const [report, setReport] = useState<TReportKey>('collections')
  const [filters, setFilters] = useState<IReportFilters>({
    date_from: moment().startOf('month').format('YYYY-MM-DD'),
    date_to: moment().format('YYYY-MM-DD'),
    group_by: 'DAY',
  })

  const collections = useSelector((store) => store.feeDashboard.collections)
  const outstanding = useSelector((store) => store.feeDashboard.outstanding)
  const discounts = useSelector((store) => store.feeDashboard.discounts)
  const refundReport = useSelector((store) => store.feeDashboard.refundReport)
  const walletReport = useSelector((store) => store.feeDashboard.walletReport)
  const lateFeeReport = useSelector((store) => store.feeDashboard.lateFeeReport)

  const load = useCallback(() => {
    if (report === 'collections') {
      dispatch(getCollectionReportAction({ filters }))

      return
    }
    if (report === 'outstanding') {
      dispatch(getOutstandingReportAction({ filters }))

      return
    }
    if (report === 'discounts') {
      dispatch(getDiscountReportAction({ filters }))

      return
    }
    if (report === 'refunds') {
      dispatch(getRefundReportAction({ filters }))

      return
    }
    if (report === 'late_fees') {
      dispatch(getLateFeeReportAction({ filters }))

      return
    }

    dispatch(getWalletReportAction({ page: 1, limit: 200 }))
  }, [dispatch, filters, report])

  useEffect(() => {
    load()
  }, [load])

  const collectionColumns: IFeeColumn<Fee.ICollectionReport['rows'][0]>[] = [
    {
      key: 'bucket',
      label: filters.group_by === 'MONTH' ? 'Month' : 'Period',
      render: (row) => (
        <Typography fontSize={12.5} fontWeight={600}>
          {row.bucket}
        </Typography>
      ),
    },
    {
      key: 'payments',
      label: 'Payments',
      align: 'right',
      render: (row) => (
        <Typography fontSize={12.5} color={colors.grey[700]}>
          {row.payments}
        </Typography>
      ),
    },
    {
      key: 'amount',
      label: 'Collected',
      align: 'right',
      render: (row) => (
        <FeeAmount value={formatMoney(row.amount)} tone="success" strong />
      ),
    },
  ]

  const groupedColumns: IFeeColumn<Fee.IGroupedReportRow>[] = [
    {
      key: 'group',
      label: 'Group',
      render: (row) => (
        <FeeCellStack
          primary={
            row.class_name ??
            row.section_name ??
            row.fee_type_name ??
            row.bucket ??
            `#${row.class_id ?? row.fee_type_id ?? '—'}`
          }
          secondary={row.group_by ?? undefined}
        />
      ),
    },
    {
      key: 'invoiced',
      label: 'Invoiced',
      align: 'right',
      render: (row) => <FeeAmount value={formatMoney(row.invoiced)} />,
    },
    {
      key: 'collected',
      label: 'Collected',
      align: 'right',
      render: (row) => (
        <FeeAmount value={formatMoney(row.collected)} tone="success" />
      ),
    },
    {
      key: 'outstanding',
      label: 'Outstanding',
      align: 'right',
      render: (row) => (
        <FeeAmount value={formatMoney(row.outstanding)} tone="danger" />
      ),
    },
    {
      key: 'invoice_count',
      label: 'Invoices',
      align: 'right',
      hideBelow: 'sm',
      render: (row) => (
        <Typography fontSize={12.5} color={colors.grey[700]}>
          {row.invoice_count ?? '—'}
        </Typography>
      ),
    },
  ]

  const discountColumns: IFeeColumn<Fee.IDiscountReportRow>[] = [
    {
      key: 'name',
      label: 'Scholarship',
      render: (row) => (
        <FeeCellStack
          primary={row.name ?? '—'}
          secondary={row.code ?? undefined}
        />
      ),
    },
    {
      key: 'beneficiaries',
      label: 'Beneficiaries',
      align: 'right',
      render: (row) => (
        <Typography fontSize={12.5} color={colors.grey[700]}>
          {row.beneficiaries ?? '—'}
        </Typography>
      ),
    },
    {
      key: 'discount',
      label: 'Discount',
      align: 'right',
      render: (row) => (
        <FeeAmount
          value={formatMoney(row.discount ?? row.applied)}
          tone="success"
        />
      ),
    },
  ]

  const refundColumns: IFeeColumn<Fee.IRefundReportRow>[] = [
    {
      key: 'refund_number',
      label: 'Refund',
      render: (row) => (
        <FeeCellStack
          primary={row.refund_number ?? '—'}
          secondary={row.refund_type?.replace(/_/g, ' ').toLowerCase()}
        />
      ),
    },
    {
      key: 'created_at',
      label: 'Requested',
      hideBelow: 'sm',
      render: (row) => (
        <Typography fontSize={12} color={colors.grey[700]}>
          {formatDate(row.created_at)}
        </Typography>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <Typography fontSize={12} color={colors.grey[700]}>
          {row.status ?? '—'}
        </Typography>
      ),
    },
    {
      key: 'amount',
      label: 'Amount',
      align: 'right',
      render: (row) => (
        <FeeAmount value={formatMoney(row.amount)} tone="danger" strong />
      ),
    },
  ]

  const walletColumns: IFeeColumn<Fee.IWalletReportRow>[] = [
    {
      key: 'student_id',
      label: 'Student',
      render: (row) => (
        <FeeCellStack
          primary={
            `${row.firstname ?? ''} ${row.lastname ?? ''}`.trim() ||
            `Student #${row.student_id}`
          }
          secondary={`Student #${row.student_id}`}
        />
      ),
    },
    {
      key: 'credits',
      label: 'Credits',
      align: 'right',
      hideBelow: 'sm',
      render: (row) => (
        <FeeAmount value={formatMoney(row.credits)} tone="success" />
      ),
    },
    {
      key: 'debits',
      label: 'Debits',
      align: 'right',
      hideBelow: 'md',
      render: (row) => (
        <FeeAmount value={formatMoney(row.debits)} tone="danger" />
      ),
    },
    {
      key: 'balance',
      label: 'Balance',
      align: 'right',
      render: (row) => (
        <FeeAmount
          value={formatMoney(row.balance ?? row.current_balance)}
          strong
        />
      ),
    },
  ]

  const lateFeeColumns: IFeeColumn<Fee.ILateFeeReportRow>[] = [
    {
      key: 'invoice_number',
      label: 'Invoice',
      render: (row) => (
        <FeeCellStack
          primary={row.invoice_number ?? `#${row.invoice_id}`}
          secondary={row.rule_name ?? undefined}
        />
      ),
    },
    {
      key: 'effective_date',
      label: 'Effective',
      hideBelow: 'sm',
      render: (row) => (
        <Typography fontSize={12} color={colors.grey[700]}>
          {formatDate(row.effective_date)}
        </Typography>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <Typography fontSize={12} color={colors.grey[700]}>
          {row.status ?? '—'}
        </Typography>
      ),
    },
    {
      key: 'amount',
      label: 'Penalty',
      align: 'right',
      render: (row) => <FeeAmount value={formatMoney(row.amount)} strong />,
    },
  ]

  const currentLoading =
    (report === 'collections' && collections.loading) ||
    (report === 'outstanding' && outstanding.loading) ||
    (report === 'discounts' && discounts.loading) ||
    (report === 'refunds' && refundReport.loading) ||
    (report === 'wallets' && walletReport.loading) ||
    (report === 'late_fees' && lateFeeReport.loading)

  const currentRows = (report === 'collections'
    ? collections.data?.rows ?? []
    : report === 'outstanding'
    ? outstanding.data?.rows ?? []
    : report === 'discounts'
    ? discounts.data?.rows ?? []
    : report === 'refunds'
    ? refundReport.data?.rows ?? []
    : report === 'wallets'
    ? walletReport.data?.rows ?? []
    : lateFeeReport.data?.rows ?? []) as unknown as Record<string, unknown>[]

  return (
    <Box>
      <FeePageHeader
        title="Fee reports"
        subtitle="Operational reports computed by the backend. Every figure below comes from an API aggregate, never from the paginated rows of a table."
        backTo="/dashboard/fees"
        actions={
          <>
            <ButtonComp
              size="small"
              variant="outlined"
              startIcon={<FileSpreadsheet size={14} />}
              disabled={!currentRows.length}
              onClick={() =>
                downloadCsv(
                  `fee-${report}`,
                  Object.keys(currentRows[0] ?? {}).map((key) => ({
                    key,
                    label: key,
                  })),
                  currentRows
                )
              }
            >
              Export CSV
            </ButtonComp>
            <ButtonComp
              size="small"
              variant="outlined"
              startIcon={<Printer size={14} />}
              onClick={() => printElement('fee-report-print', 'fee-report')}
            >
              Print
            </ButtonComp>
          </>
        }
      />

      <Box mb={1.75}>
        <FeeFilterBar
          columns={4}
          title="Report parameters"
          onClear={() =>
            setFilters({
              date_from: moment().startOf('month').format('YYYY-MM-DD'),
              date_to: moment().format('YYYY-MM-DD'),
              group_by: 'DAY',
            })
          }
          active
        >
          <Box>
            <Typography fontSize={12} color={colors.grey[600]} mb={0.75}>
              Report
            </Typography>
            <SelectField
              options={REPORT_OPTIONS}
              value={
                REPORT_OPTIONS.find((option) => option.value === report) ?? null
              }
              onChange={(option) =>
                setReport((option as IOption<TReportKey>).value as TReportKey)
              }
            />
          </Box>
          <Box>
            <CustomDatePicker
              labelDetail={{ text: 'From', required: false }}
              views={['day', 'month', 'year']}
              value={filters.date_from ? moment(filters.date_from) : null}
              onChange={(value) =>
                setFilters((prev) => ({
                  ...prev,
                  date_from:
                    value && moment(value).isValid()
                      ? moment(value).format('YYYY-MM-DD')
                      : undefined,
                }))
              }
              slotProps={{ textField: { size: 'small' } }}
            />
          </Box>
          <Box>
            <CustomDatePicker
              labelDetail={{ text: 'To', required: false }}
              views={['day', 'month', 'year']}
              value={filters.date_to ? moment(filters.date_to) : null}
              onChange={(value) =>
                setFilters((prev) => ({
                  ...prev,
                  date_to:
                    value && moment(value).isValid()
                      ? moment(value).format('YYYY-MM-DD')
                      : undefined,
                }))
              }
              slotProps={{ textField: { size: 'small' } }}
            />
          </Box>
          {report === 'collections' ? (
            <Box>
              <Typography fontSize={12} color={colors.grey[600]} mb={0.75}>
                Group by
              </Typography>
              <SelectField
                options={GROUP_BY_OPTIONS}
                value={
                  GROUP_BY_OPTIONS.find(
                    (option) => option.value === filters.group_by
                  ) ?? null
                }
                onChange={(option) =>
                  setFilters((prev) => ({
                    ...prev,
                    group_by: (option as IOption).value,
                  }))
                }
              />
            </Box>
          ) : (
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
                    (option) =>
                      option.value === String(filters.academic_year_id)
                  ) ?? null
                }
                onChange={(option) =>
                  setFilters((prev) => ({
                    ...prev,
                    academic_year_id: (option as IOption | null)?.value
                      ? Number((option as IOption).value)
                      : undefined,
                  }))
                }
              />
            </Box>
          )}
        </FeeFilterBar>
      </Box>

      <Box id="fee-report-print">
        <FeePanel
          noPadding
          title={
            REPORT_OPTIONS.find((option) => option.value === report)?.label
          }
          subtitle={
            collections.data?.period
              ? `${formatDate(
                  collections.data.period.date_from
                )} → ${formatDate(collections.data.period.date_to)}`
              : undefined
          }
        >
          {report === 'collections' ? (
            <FeeDataTable
              columns={collectionColumns}
              rows={collections.data?.rows ?? []}
              rowKey={(row) => row.bucket}
              loading={currentLoading}
              skeletonRows={6}
              emptyTitle="No collection for this period"
            />
          ) : null}

          {report === 'outstanding' ? (
            <FeeDataTable
              columns={groupedColumns}
              rows={outstanding.data?.rows ?? []}
              rowKey={(row) => `${row.class_id ?? row.fee_type_id ?? 'group'}`}
              loading={currentLoading}
              skeletonRows={6}
              emptyTitle="Nothing outstanding"
            />
          ) : null}

          {report === 'discounts' ? (
            <FeeDataTable
              columns={discountColumns}
              rows={discounts.data?.rows ?? []}
              rowKey={(row) =>
                `${row.scholarship_id ?? row.code ?? 'discount'}`
              }
              loading={currentLoading}
              skeletonRows={6}
              emptyTitle="No discount applied"
            />
          ) : null}

          {report === 'refunds' ? (
            <FeeDataTable
              columns={refundColumns}
              rows={refundReport.data?.rows ?? []}
              rowKey={(row) => `${row.refund_number ?? 'refund'}`}
              loading={currentLoading}
              skeletonRows={6}
              emptyTitle="No refund in this period"
            />
          ) : null}

          {report === 'wallets' ? (
            <FeeDataTable
              columns={walletColumns}
              rows={walletReport.data?.rows ?? []}
              rowKey={(row) => row.student_id}
              loading={currentLoading}
              skeletonRows={6}
              emptyTitle="No wallet balance"
            />
          ) : null}

          {report === 'late_fees' ? (
            <FeeDataTable
              columns={lateFeeColumns}
              rows={lateFeeReport.data?.rows ?? []}
              rowKey={(row) => `${row.invoice_id ?? 'late-fee'}`}
              loading={currentLoading}
              skeletonRows={6}
              emptyTitle="No late fee in this period"
            />
          ) : null}
        </FeePanel>
      </Box>

      <Box mt={1.5}>
        <Stack direction="row" spacing={1} flexWrap="wrap" rowGap={0.5}>
          <Typography fontSize={11.5} color={colors.grey[500]}>
            <Download size={12} style={{ verticalAlign: 'middle' }} /> CSV
            export and print use the backend computed rows — the UI never
            aggregates the financial figures itself.
          </Typography>
        </Stack>
      </Box>
    </Box>
  )
}
