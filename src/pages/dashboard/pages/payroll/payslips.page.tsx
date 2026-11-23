import { Box, Button, Pagination, Stack, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { Download, FileText } from 'lucide-react'
import { InputField } from '@src/components/input/input.component'
import { SelectField } from '@src/components/select/select.component'
import { colors } from '@src/helpers/colors.helpers'
import { useDispatch, useSelector } from '@src/store/hooks.store'
import {
  getPayslipsAction,
  publishPayslipAction,
} from '@src/store/redux/dashboard/payroll/payroll.slice'
import { usePayrollPermissions } from '@src/hooks/usePayrollPermissions.hooks'
import { payrollServices } from '@src/store/redux/dashboard/payroll/payroll.service'
import {
  FeeAmount,
  FeeCellStack,
  FeeDataTable,
  IFeeColumn,
} from '../fees/components/feeDataTable.component'
import { FeeFilterBar } from '../fees/components/feeFilterBar.component'
import { FeePageHeader } from '../fees/components/feePageHeader.component'
import { FeePanel } from '../fees/components/feePanel.component'
import { FeeStatusChip } from '../fees/components/feeStatusChip.component'
import { PAYROLL_BASE_PATH } from './payroll.helpers'
import type { IOption, IStatusMeta } from './payroll.helpers'

const PAGE_LIMIT = 20

const PAYSLIP_STATUS_META: Record<Payroll.PayslipStatus, IStatusMeta> = {
  GENERATED: {
    text: '#1d4ed8',
    bg: '#eff6ff',
    border: '#bfdbfe',
    dot: '#2563eb',
    label: 'Generated',
  },
  PUBLISHED: {
    text: '#15803d',
    bg: '#f0fdf4',
    border: '#bbf7d0',
    dot: '#22c55e',
    label: 'Published',
  },
  SENT: {
    text: '#15803d',
    bg: '#f0fdf4',
    border: '#bbf7d0',
    dot: '#22c55e',
    label: 'Sent',
  },
  VIEWED: {
    text: '#6d28d9',
    bg: '#f5f3ff',
    border: '#ddd6fe',
    dot: '#8b5cf6',
    label: 'Viewed',
  },
}

const PAYSLIP_STATUS_OPTIONS: IOption<Payroll.PayslipStatus>[] = [
  { value: 'GENERATED', label: 'Generated' },
  { value: 'PUBLISHED', label: 'Published' },
  { value: 'SENT', label: 'Sent' },
  { value: 'VIEWED', label: 'Viewed' },
]

/** Payslips listing and PDF download (`GET /payroll/payslips`). */
export function PayrollPayslipsPage() {
  const dispatch = useDispatch()
  const permissions = usePayrollPermissions()

  const { data, loading } = useSelector((store) => store.payroll.payslips)

  const [periodKey, setPeriodKey] = useState('')
  const [status, setStatus] = useState<Payroll.PayslipStatus | undefined>()
  const [page, setPage] = useState(1)
  const [downloading, setDownloading] = useState<number | null>(null)
  const [publishing, setPublishing] = useState<number | null>(null)

  useEffect(() => {
    dispatch(
      getPayslipsAction({
        filters: { period_key: periodKey.trim() || undefined, status },
        page,
        limit: PAGE_LIMIT,
      })
    )
  }, [dispatch, page, periodKey, status])

  const rows = data?.rows ?? []
  const totalPages = Math.ceil(Number(data?.total ?? 0) / PAGE_LIMIT)

  const download = async (payslip: Payroll.IPayslip) => {
    try {
      setDownloading(payslip.id)
      const blob = await payrollServices.downloadPayslipPdfService(payslip.id)
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')

      link.href = url
      link.download = `${payslip.payslip_number}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } finally {
      setDownloading(null)
    }
  }

  const publish = async (payslip: Payroll.IPayslip) => {
    try {
      setPublishing(payslip.id)
      await dispatch(publishPayslipAction(payslip.id)).unwrap()
      await dispatch(
        getPayslipsAction({
          filters: { period_key: periodKey.trim() || undefined, status },
          page,
          limit: PAGE_LIMIT,
        })
      )
    } catch {
      /* toast raised by the slice */
    } finally {
      setPublishing(null)
    }
  }

  const columns: IFeeColumn<Payroll.IPayslip>[] = [
    {
      key: 'payslip',
      label: 'Payslip',
      render: (row) => (
        <FeeCellStack
          primary={row.payslip_number}
          secondary={
            [row.employee?.firstname, row.employee?.lastname]
              .filter(Boolean)
              .join(' ') || undefined
          }
        />
      ),
    },
    {
      key: 'period',
      label: 'Period',
      hideBelow: 'md',
      render: (row) => (
        <Typography fontSize={12.5}>{row.period_key}</Typography>
      ),
    },
    {
      key: 'gross',
      label: 'Gross',
      align: 'right',
      hideBelow: 'lg',
      render: (row) => <FeeAmount value={row.gross_amount} />,
    },
    {
      key: 'deductions',
      label: 'Deductions',
      align: 'right',
      hideBelow: 'lg',
      render: (row) => <FeeAmount value={row.total_deductions} tone="danger" />,
    },
    {
      key: 'net',
      label: 'Net',
      align: 'right',
      render: (row) => <FeeAmount value={row.net_amount} strong />,
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <FeeStatusChip meta={PAYSLIP_STATUS_META[row.status]} />,
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (row) => (
        <Stack
          direction="row"
          spacing={0.5}
          justifyContent="flex-end"
          alignItems="center"
        >
          {permissions.canPublishPayslips && !row.published_at ? (
            <Button
              size="small"
              variant="text"
              disabled={publishing === row.id}
              onClick={(event) => {
                event.stopPropagation()
                void publish(row)
              }}
            >
              Publish
            </Button>
          ) : null}
          <Button
            size="small"
            variant="text"
            startIcon={<Download size={14} />}
            disabled={downloading === row.id}
            onClick={(event) => {
              event.stopPropagation()
              void download(row)
            }}
          >
            PDF
          </Button>
        </Stack>
      ),
    },
  ]

  return (
    <Box>
      <FeePageHeader
        title="Payslips"
        subtitle="Documents generated from an approved run. The PDF is rendered by the Typst service."
        backTo={PAYROLL_BASE_PATH}
        backLabel="Payroll"
      />

      <Box mb={2}>
        <FeeFilterBar
          columns={3}
          active={Boolean(periodKey || status)}
          onClear={() => {
            setPeriodKey('')
            setStatus(undefined)
            setPage(1)
          }}
        >
          <Box>
            <Typography fontSize={13} color={colors.grey[800]} mb={1}>
              Period key
            </Typography>
            <InputField
              placeholder="2026-11"
              value={periodKey}
              onChange={(event) => {
                setPeriodKey(event.target.value)
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
              options={PAYSLIP_STATUS_OPTIONS}
              value={
                PAYSLIP_STATUS_OPTIONS.find(
                  (option) => option.value === status
                ) ?? null
              }
              onChange={(option) => {
                setStatus(
                  (option as IOption<Payroll.PayslipStatus> | null)?.value ??
                    undefined
                )
                setPage(1)
              }}
            />
          </Box>
        </FeeFilterBar>
      </Box>

      <FeePanel
        noPadding
        title="Payslip documents"
        subtitle="Generate them from an approved run, then download or publish."
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
          emptyIcon={<FileText size={20} />}
          emptyTitle="No payslip"
          emptyDescription="Generate payslips from an approved payroll run."
        />
      </FeePanel>
    </Box>
  )
}
