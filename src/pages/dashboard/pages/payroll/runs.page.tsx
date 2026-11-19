import { Box, Pagination, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, PlayCircle } from 'lucide-react'
import { ButtonComp } from '@src/components/button/button.component'
import { SelectField } from '@src/components/select/select.component'
import { colors } from '@src/helpers/colors.helpers'
import { useDispatch, useSelector } from '@src/store/hooks.store'
import { getRunsAction } from '@src/store/redux/dashboard/payroll/payroll.slice'
import { usePayrollPermissions } from '@src/hooks/usePayrollPermissions.hooks'
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
import {
  PAYROLL_BASE_PATH,
  RUN_STATUS_META,
  RUN_STATUS_OPTIONS,
  formatDate,
} from './payroll.helpers'
import type { IOption } from './payroll.helpers'

const PAGE_LIMIT = 20

/** Payroll runs listing (`GET /payroll/runs`). */
export function PayrollRunsPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { canPrepareRuns } = usePayrollPermissions()

  const { data, loading } = useSelector((store) => store.payroll.runs)

  const [status, setStatus] = useState<Payroll.RunStatus | undefined>(undefined)
  const [page, setPage] = useState(1)

  useEffect(() => {
    dispatch(getRunsAction({ filters: { status }, page, limit: PAGE_LIMIT }))
  }, [dispatch, page, status])

  const rows = data?.rows ?? []
  const total = Number(data?.total ?? 0)
  const totalPages = Math.ceil(total / PAGE_LIMIT)

  const columns: IFeeColumn<Payroll.IRun>[] = [
    {
      key: 'run',
      label: 'Run',
      render: (row) => (
        <FeeCellStack
          primary={row.run_number}
          secondary={`${row.period_key ?? ''} · ${formatDate(
            row.period_start
          )} → ${formatDate(row.period_end)}`}
        />
      ),
    },
    {
      key: 'type',
      label: 'Type',
      hideBelow: 'md',
      render: (row) => (
        <Typography fontSize={12.5} color={colors.grey[700]}>
          {row.run_type}
          {row.payroll_group_name ? ` · ${row.payroll_group_name}` : ''}
        </Typography>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <FeeStatusChip meta={RUN_STATUS_META[row.status]} />,
    },
    {
      key: 'employees',
      label: 'Employees',
      align: 'right',
      hideBelow: 'sm',
      render: (row) => (
        <Typography fontSize={12.5}>{row.employee_count}</Typography>
      ),
    },
    {
      key: 'gross',
      label: 'Gross',
      align: 'right',
      hideBelow: 'lg',
      render: (row) => <FeeAmount value={row.total_gross} />,
    },
    {
      key: 'net',
      label: 'Net',
      align: 'right',
      render: (row) => <FeeAmount value={row.total_net} strong />,
    },
    {
      key: 'pay_date',
      label: 'Pay date',
      align: 'right',
      hideBelow: 'md',
      render: (row) => (
        <Typography fontSize={12.5} color={colors.grey[600]}>
          {formatDate(row.pay_date)}
        </Typography>
      ),
    },
  ]

  return (
    <Box>
      <FeePageHeader
        title="Payroll runs"
        subtitle="Every run of every period, with its workflow stage and ledger status."
        backTo={PAYROLL_BASE_PATH}
        backLabel="Payroll"
        actions={
          canPrepareRuns ? (
            <ButtonComp
              size="small"
              variant="contained"
              startIcon={<PlayCircle size={15} />}
              onClick={() => navigate(`${PAYROLL_BASE_PATH}/process`)}
            >
              Process payroll
            </ButtonComp>
          ) : null
        }
      />

      <Box mb={2}>
        <FeeFilterBar
          columns={3}
          active={Boolean(status)}
          onClear={() => {
            setStatus(undefined)
            setPage(1)
          }}
        >
          <Box>
            <Typography fontSize={13} color={colors.grey[800]} mb={1}>
              Status
            </Typography>
            <SelectField
              isClearable
              placeholder="Any status"
              options={RUN_STATUS_OPTIONS}
              value={
                RUN_STATUS_OPTIONS.find((option) => option.value === status) ??
                null
              }
              onChange={(option) => {
                setStatus(
                  (option as IOption<Payroll.RunStatus> | null)?.value ??
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
        title="Runs"
        subtitle="A regular run is unique per period; off-cycle runs are used for bonuses and arrears."
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
          onRowClick={(row) => navigate(`${PAYROLL_BASE_PATH}/runs/${row.id}`)}
          emptyIcon={<FileText size={20} />}
          emptyTitle="No payroll run"
          emptyDescription="Start a run from “Process payroll”."
        />
      </FeePanel>
    </Box>
  )
}
