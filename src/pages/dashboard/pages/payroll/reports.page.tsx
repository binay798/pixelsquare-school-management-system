import { Box, Button, Stack, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { InputField } from '@src/components/input/input.component'
import { colors } from '@src/helpers/colors.helpers'
import { useDispatch, useSelector } from '@src/store/hooks.store'
import {
  getDepartmentExpenseAction,
  getOutstandingAction,
  getReconciliationAction,
  getStatutoryAction,
  getYtdAction,
} from '@src/store/redux/dashboard/payroll/payroll.slice'
import {
  FeeAmount,
  FeeCellStack,
  FeeDataTable,
  IFeeColumn,
} from '../fees/components/feeDataTable.component'
import { FeePageHeader } from '../fees/components/feePageHeader.component'
import { FeePanel } from '../fees/components/feePanel.component'
import { PAYROLL_BASE_PATH, formatDate, formatMoney } from './payroll.helpers'

/** Payroll reports: department expense, YTD, outstanding, statutory, ledger. */
export function PayrollReportsPage() {
  const dispatch = useDispatch()

  const departmentExpense = useSelector(
    (store) => store.payroll.departmentExpense
  )
  const ytd = useSelector((store) => store.payroll.ytd)
  const outstanding = useSelector((store) => store.payroll.outstanding)
  const reconciliation = useSelector((store) => store.payroll.reconciliation)
  const statutory = useSelector((store) => store.payroll.statutory)

  const [runId, setRunId] = useState('')

  useEffect(() => {
    dispatch(getDepartmentExpenseAction({}))
    dispatch(getYtdAction({}))
    dispatch(getOutstandingAction())
    dispatch(getReconciliationAction())
  }, [dispatch])

  const departmentColumns: IFeeColumn<Payroll.IDepartmentExpenseRow>[] = [
    {
      key: 'department',
      label: 'Department',
      render: (row) => (
        <FeeCellStack
          primary={row.department}
          secondary={`${row.employees} employees · ${row.runs} runs`}
        />
      ),
    },
    {
      key: 'gross',
      label: 'Gross',
      align: 'right',
      render: (row) => <FeeAmount value={row.gross} />,
    },
    {
      key: 'employer',
      label: 'Employer',
      align: 'right',
      hideBelow: 'md',
      render: (row) => <FeeAmount value={row.employer_contributions} />,
    },
    {
      key: 'total',
      label: 'Total cost',
      align: 'right',
      render: (row) => <FeeAmount value={row.total_cost} strong />,
    },
  ]

  const ytdColumns: IFeeColumn<Payroll.IYtdReport['rows'][number]>[] = [
    {
      key: 'employee',
      label: 'Employee',
      render: (row) => (
        <FeeCellStack
          primary={[row.firstname, row.lastname].filter(Boolean).join(' ')}
          secondary={`${row.designation} · ${row.runs} runs`}
        />
      ),
    },
    {
      key: 'gross',
      label: 'Gross',
      align: 'right',
      render: (row) => <FeeAmount value={row.gross} />,
    },
    {
      key: 'deductions',
      label: 'Deductions',
      align: 'right',
      hideBelow: 'md',
      render: (row) => <FeeAmount value={row.deductions} tone="danger" />,
    },
    {
      key: 'net',
      label: 'Net',
      align: 'right',
      render: (row) => <FeeAmount value={row.net} strong />,
    },
  ]

  const statutoryColumns: IFeeColumn<
    Payroll.IStatutoryReport['schemes'][number]
  >[] = [
    {
      key: 'code',
      label: 'Scheme',
      render: (row) => (
        <Typography fontSize={12.5}>{row.statutory_code}</Typography>
      ),
    },
    {
      key: 'employee',
      label: 'Employee side',
      align: 'right',
      render: (row) => <FeeAmount value={row.employee_amount} />,
    },
    {
      key: 'employer',
      label: 'Employer side',
      align: 'right',
      render: (row) => <FeeAmount value={row.employer_amount} />,
    },
  ]

  const currency = (value?: string) => formatMoney(value ?? '0')

  return (
    <Box>
      <FeePageHeader
        title="Payroll reports"
        subtitle="Everything below is computed from the finalized payroll documents and the ledger, never recomputed."
        backTo={PAYROLL_BASE_PATH}
        backLabel="Payroll"
      />

      <Stack spacing={2}>
        <FeePanel
          noPadding
          title="Department expense"
          subtitle="Finalized runs only, grouped by department."
        >
          <FeeDataTable
            columns={departmentColumns}
            rows={departmentExpense.data ?? []}
            rowKey={(row) => row.department}
            loading={departmentExpense.loading}
            skeletonRows={5}
            emptyTitle="No finalized payroll"
            emptyDescription="Approve and post a run to see the department split."
          />
        </FeePanel>

        <FeePanel
          noPadding
          title="Year to date"
          subtitle={
            ytd.data
              ? `${formatDate(ytd.data.fiscal_year.start_date)} → ${formatDate(
                  ytd.data.fiscal_year.end_date
                )}`
              : 'Current fiscal year'
          }
        >
          <FeeDataTable
            columns={ytdColumns}
            rows={ytd.data?.rows ?? []}
            rowKey={(row) => row.employee_id}
            loading={ytd.loading}
            skeletonRows={5}
            emptyTitle="No YTD data"
            emptyDescription="No finalized payroll in the fiscal year yet."
          />
        </FeePanel>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
            gap: 2,
          }}
        >
          <FeePanel
            title="Outstanding salary"
            subtitle={`Total ${currency(outstanding.data?.total)}`}
          >
            <Stack spacing={1}>
              {(outstanding.data?.runs ?? []).map((row) => (
                <Stack
                  key={row.run_id}
                  direction="row"
                  justifyContent="space-between"
                  sx={{
                    p: 1.25,
                    borderRadius: 2,
                    border: `1px solid ${colors.grey[200]}`,
                  }}
                >
                  <FeeCellStack
                    primary={`${row.run_number} · ${row.period_key}`}
                    secondary={`${
                      row.employees_with_balance
                    } employees · pay ${formatDate(row.pay_date)}`}
                  />
                  <FeeAmount value={row.outstanding} />
                </Stack>
              ))}
              {!outstanding.loading &&
              !(outstanding.data?.runs ?? []).length ? (
                <Typography fontSize={12.5} color={colors.green[700]}>
                  Every posted run is fully paid.
                </Typography>
              ) : null}
            </Stack>
          </FeePanel>

          <FeePanel
            title="Payroll ↔ ledger reconciliation"
            subtitle="Ledger balances must equal the payroll outstanding liability."
          >
            <Stack spacing={1.25}>
              {[
                {
                  label: 'Salary payable (2200)',
                  ledger: reconciliation.data?.salary_payable.ledger_balance,
                  payroll:
                    reconciliation.data?.salary_payable.payroll_outstanding,
                  variance: reconciliation.data?.salary_payable.variance,
                  ok: reconciliation.data?.salary_payable.is_reconciled,
                },
                {
                  label: 'Statutory payables',
                  ledger: reconciliation.data?.statutory.ledger_balance,
                  payroll: reconciliation.data?.statutory.liability,
                  variance: reconciliation.data?.statutory.variance,
                  ok: reconciliation.data?.statutory.is_reconciled,
                },
              ].map((row) => (
                <Box
                  key={row.label}
                  sx={{
                    p: 1.25,
                    borderRadius: 2,
                    border: `1px solid ${
                      row.ok ? colors.green[200] : colors.orange[200]
                    }`,
                  }}
                >
                  <Stack direction="row" justifyContent="space-between">
                    <Typography fontSize={12.5} fontWeight={600}>
                      {row.label}
                    </Typography>
                    <Typography
                      fontSize={12}
                      fontWeight={600}
                      color={row.ok ? colors.green[700] : colors.orange[800]}
                    >
                      {row.ok
                        ? 'reconciled'
                        : `variance ${currency(row.variance)}`}
                    </Typography>
                  </Stack>
                  <Typography fontSize={12} color={colors.grey[600]}>
                    Ledger {currency(row.ledger)} · payroll{' '}
                    {currency(row.payroll)}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </FeePanel>
        </Box>

        <FeePanel
          noPadding
          title="Statutory report"
          subtitle="Employee and employer side per scheme for one run."
          action={
            <Stack direction="row" spacing={1} alignItems="flex-end">
              <Box sx={{ width: 120 }}>
                <InputField
                  placeholder="Run id"
                  value={runId}
                  onChange={(event) => setRunId(event.target.value)}
                />
              </Box>
              <Button
                size="small"
                variant="outlined"
                disabled={!runId}
                onClick={() => dispatch(getStatutoryAction(Number(runId)))}
              >
                Load
              </Button>
            </Stack>
          }
        >
          <FeeDataTable
            columns={statutoryColumns}
            rows={statutory.data?.schemes ?? []}
            rowKey={(row) => row.statutory_code}
            loading={statutory.loading}
            skeletonRows={4}
            emptyTitle="No statutory amount"
            emptyDescription="Load a run that carries TDS / PF / SSF deductions."
          />
        </FeePanel>
      </Stack>
    </Box>
  )
}
