import { Box, Skeleton, Stack, Typography } from '@mui/material'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarClock, PlayCircle, Receipt, Wallet } from 'lucide-react'
import { ButtonComp } from '@src/components/button/button.component'
import { colors } from '@src/helpers/colors.helpers'
import { useDispatch, useSelector } from '@src/store/hooks.store'
import { getPayrollDashboardAction } from '@src/store/redux/dashboard/payroll/payroll.slice'
import { usePayrollPermissions } from '@src/hooks/usePayrollPermissions.hooks'
import { FeeAmount } from '../fees/components/feeDataTable.component'
import { FeePageHeader } from '../fees/components/feePageHeader.component'
import { FeePanel } from '../fees/components/feePanel.component'
import { FeeStatusChip } from '../fees/components/feeStatusChip.component'
import {
  PAYROLL_BASE_PATH,
  RUN_STATUS_META,
  formatDate,
  formatMoney,
} from './payroll.helpers'

const StatCard = ({
  label,
  value,
  icon,
  loading,
}: {
  label: string
  value: string
  icon: React.ReactNode
  loading: boolean
}) => (
  <Box
    sx={{
      p: 2,
      borderRadius: 3,
      border: `1px solid ${colors.grey[200]}`,
      bgcolor: '#fff',
    }}
  >
    <Stack direction="row" spacing={1} alignItems="center" mb={1}>
      <Box sx={{ color: colors.blue[700], display: 'flex' }}>{icon}</Box>
      <Typography fontSize={12} fontWeight={600} color={colors.grey[600]}>
        {label}
      </Typography>
    </Stack>
    {loading ? (
      <Skeleton width={120} height={30} />
    ) : (
      <Typography fontSize={22} fontWeight={700} color={colors.grey[900]}>
        {value}
      </Typography>
    )}
  </Box>
)

/** Payroll overview (`GET /payroll/reports/dashboard`). */
export function PayrollDashboardPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { canPrepareRuns } = usePayrollPermissions()

  const { data, loading } = useSelector((store) => store.payroll.dashboard)

  useEffect(() => {
    dispatch(getPayrollDashboardAction())
  }, [dispatch])

  const latest = data?.latest_run ?? null

  return (
    <Box>
      <FeePageHeader
        title="Payroll"
        subtitle="Periods, runs, approvals, disbursement and statutory remittances of the school."
        loading={loading && !data}
        actions={
          <Stack direction="row" spacing={1}>
            {canPrepareRuns ? (
              <ButtonComp
                size="small"
                variant="contained"
                startIcon={<PlayCircle size={15} />}
                onClick={() => navigate(`${PAYROLL_BASE_PATH}/process`)}
              >
                Process payroll
              </ButtonComp>
            ) : null}
            <ButtonComp
              size="small"
              variant="outlined"
              startIcon={<Receipt size={15} />}
              onClick={() => navigate(`${PAYROLL_BASE_PATH}/runs`)}
            >
              Runs
            </ButtonComp>
          </Stack>
        }
      />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: '1fr 1fr',
            lg: 'repeat(4, 1fr)',
          },
          gap: 1.5,
          mb: 2,
        }}
      >
        <StatCard
          label="Payroll employees"
          value={String(data?.employees ?? 0)}
          icon={<Wallet size={16} />}
          loading={loading}
        />
        <StatCard
          label="Pending approvals"
          value={String(data?.pending_approvals ?? 0)}
          icon={<CalendarClock size={16} />}
          loading={loading}
        />
        <StatCard
          label="Unpaid salary"
          value={formatMoney(data?.unpaid_salary.amount ?? '0')}
          icon={<Wallet size={16} />}
          loading={loading}
        />
        <StatCard
          label="Latest net payroll"
          value={formatMoney(latest?.total_net ?? '0')}
          icon={<Receipt size={16} />}
          loading={loading}
        />
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
          gap: 2,
        }}
      >
        <FeePanel
          title="Latest payroll run"
          subtitle="The most recent run, whatever its stage."
        >
          {loading && !data ? (
            <Skeleton height={120} />
          ) : latest ? (
            <Stack spacing={1.5}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography fontSize={15} fontWeight={700}>
                  {latest.run_number}
                </Typography>
                <FeeStatusChip meta={RUN_STATUS_META[latest.status]} />
              </Stack>
              <Typography fontSize={13} color={colors.grey[700]}>
                Period {latest.period_key} · pay date{' '}
                {formatDate(latest.pay_date)} · {latest.employee_count}{' '}
                employees
              </Typography>
              <Stack direction="row" spacing={3}>
                <Box>
                  <Typography fontSize={11} color={colors.grey[500]}>
                    Gross
                  </Typography>
                  <FeeAmount value={latest.total_gross} />
                </Box>
                <Box>
                  <Typography fontSize={11} color={colors.grey[500]}>
                    Deductions
                  </Typography>
                  <FeeAmount value={latest.total_deductions} tone="danger" />
                </Box>
                <Box>
                  <Typography fontSize={11} color={colors.grey[500]}>
                    Net
                  </Typography>
                  <FeeAmount value={latest.total_net} strong tone="success" />
                </Box>
              </Stack>
              <Box>
                <ButtonComp
                  size="small"
                  variant="text"
                  onClick={() =>
                    navigate(`${PAYROLL_BASE_PATH}/runs/${latest.id}`)
                  }
                >
                  Open run
                </ButtonComp>
              </Box>
            </Stack>
          ) : (
            <Typography fontSize={13} color={colors.grey[600]}>
              No payroll run yet. Start with “Process payroll”.
            </Typography>
          )}
        </FeePanel>

        <FeePanel
          title="Recent runs"
          subtitle="Last five payroll runs of the school."
        >
          <Stack spacing={1.25}>
            {(data?.recent_runs ?? []).map((run) => (
              <Stack
                key={run.id}
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{
                  p: 1.25,
                  borderRadius: 2,
                  border: `1px solid ${colors.grey[200]}`,
                  cursor: 'pointer',
                }}
                onClick={() => navigate(`${PAYROLL_BASE_PATH}/runs/${run.id}`)}
              >
                <Box>
                  <Typography fontSize={13} fontWeight={600}>
                    {run.run_number} · {run.period_key}
                  </Typography>
                  <Typography fontSize={11.5} color={colors.grey[500]}>
                    {run.employee_count} employees
                  </Typography>
                </Box>
                <Stack direction="row" spacing={2} alignItems="center">
                  <FeeAmount value={run.total_net} />
                  <FeeStatusChip meta={RUN_STATUS_META[run.status]} />
                </Stack>
              </Stack>
            ))}
            {!loading && !(data?.recent_runs ?? []).length ? (
              <Typography fontSize={13} color={colors.grey[600]}>
                No runs recorded yet.
              </Typography>
            ) : null}
          </Stack>
        </FeePanel>
      </Box>
    </Box>
  )
}
