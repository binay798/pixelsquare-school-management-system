import { Box, Stack, Typography } from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, ChevronRight } from 'lucide-react'
import { ButtonComp } from '@src/components/button/button.component'
import { InputField } from '@src/components/input/input.component'
import { SelectField } from '@src/components/select/select.component'
import { colors } from '@src/helpers/colors.helpers'
import { useDispatch, useSelector } from '@src/store/hooks.store'
import { getAccountOptionsAction } from '@src/store/redux/dashboard/accounting/accounting.slice'
import {
  calculateRunAction,
  createPaymentAction,
  createRunAction,
  generatePayslipsAction,
  generatePeriodsAction,
  getPayrollDashboardAction,
  getPeriodsAction,
  getRunDetailAction,
  postRunToAccountingAction,
  transitionRunAction,
} from '@src/store/redux/dashboard/payroll/payroll.slice'
import { usePayrollPermissions } from '@src/hooks/usePayrollPermissions.hooks'
import { FeePageHeader } from '../fees/components/feePageHeader.component'
import { FeePanel } from '../fees/components/feePanel.component'
import { FeeStatusChip } from '../fees/components/feeStatusChip.component'
import {
  PAYROLL_BASE_PATH,
  PAYMENT_METHOD_OPTIONS,
  PERIOD_STATUS_META,
  PROCESS_STEPS,
  RUN_STATUS_META,
  RUN_TYPE_OPTIONS,
  canRunAction,
  formatDate,
  todayIso,
} from './payroll.helpers'
import type { IOption } from './payroll.helpers'

/**
 * Process payroll: the five step wizard (period → run → calculate → approve →
 * post & pay). Every step calls exactly one backend transition, and the run
 * status drives the enabled actions, so the screen can be left and resumed.
 */
export function PayrollProcessPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const permissions = usePayrollPermissions()

  const { data: periods } = useSelector((store) => store.payroll.periods)
  const { data: run } = useSelector((store) => store.payroll.runDetail)
  const { data: accountOptions } = useSelector(
    (store) => store.accounting.accountOptions
  )
  const { loading: mutationLoading } = useSelector(
    (store) => store.payroll.mutation
  )

  const [step, setStep] = useState(0)
  const [periodId, setPeriodId] = useState<number | null>(null)
  const [runType, setRunType] = useState<Payroll.RunType>('REGULAR')
  const [generateYear, setGenerateYear] = useState(
    String(new Date().getFullYear())
  )
  const [cashAccountId, setCashAccountId] = useState<number | null>(null)
  const [paymentMethod, setPaymentMethod] =
    useState<Payroll.PaymentMethod>('BANK_TRANSFER')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    dispatch(getPeriodsAction({ filters: {}, page: 1, limit: 36 }))
    dispatch(getAccountOptionsAction({ activeOnly: true }))
  }, [dispatch])

  useEffect(() => {
    if (!run) {
      return
    }
    if (run.status === 'DRAFT') {
      setStep(2)
    } else if (
      ['CALCULATED', 'UNDER_REVIEW', 'VERIFIED', 'REJECTED'].includes(
        run.status
      )
    ) {
      setStep(3)
    } else {
      setStep(4)
    }
  }, [run?.id, run?.status])

  const openPeriods = useMemo(
    () => (periods?.rows ?? []).filter((period) => period.status !== 'CLOSED'),
    [periods?.rows]
  )

  const selectedPeriod =
    openPeriods.find((period) => period.id === periodId) ?? null

  const periodOptions: IOption<string>[] = openPeriods.map((period) => ({
    value: String(period.id),
    label: `${period.period_key} · ${formatDate(
      period.start_date
    )} → ${formatDate(period.end_date)} · pay ${formatDate(period.pay_date)}`,
  }))

  const accountSelectOptions: IOption<string>[] = (accountOptions ?? []).map(
    (account) => ({
      value: String(account.id),
      label: `${account.account_code} · ${account.account_name}`,
    })
  )

  const execute = async (task: () => Promise<unknown>, reloadRun = true) => {
    setBusy(true)
    try {
      await task()
      if (reloadRun && run?.id) {
        await dispatch(getRunDetailAction(run.id))
      }
      await dispatch(getPeriodsAction({ filters: {}, page: 1, limit: 36 }))
      await dispatch(getPayrollDashboardAction())
    } catch {
      /* catchAsync already raised the toast */
    } finally {
      setBusy(false)
    }
  }

  const stepsDone = (index: number) => {
    if (!run) {
      return index === 0 && Boolean(periodId)
    }
    if (index <= 1) return true
    if (index === 2) return !['DRAFT', 'REJECTED'].includes(run.status)
    if (index === 3) {
      return [
        'APPROVED',
        'POSTED',
        'PAYMENT_AUTHORIZED',
        'PAID',
        'CLOSED',
      ].includes(run.status)
    }
    return ['PAYMENT_AUTHORIZED', 'PAID', 'CLOSED'].includes(run.status)
  }

  const disabled = busy || mutationLoading

  return (
    <Box>
      <FeePageHeader
        title="Process payroll"
        subtitle="Period → run → calculate → approve → post & pay. Each step is a backend transition, so the run can be resumed later."
        backTo={PAYROLL_BASE_PATH}
        backLabel="Payroll"
        actions={
          run ? (
            <ButtonComp
              size="small"
              variant="outlined"
              startIcon={<ChevronRight size={15} />}
              onClick={() => navigate(`${PAYROLL_BASE_PATH}/runs/${run.id}`)}
            >
              Run detail
            </ButtonComp>
          ) : null
        }
      />

      <Stack direction="row" spacing={1} mb={2} flexWrap="wrap" useFlexGap>
        {PROCESS_STEPS.map((item, index) => {
          const done = stepsDone(index)
          const active = step === index

          return (
            <Stack
              key={item.key}
              direction="row"
              spacing={0.75}
              alignItems="center"
              onClick={() => setStep(index)}
              sx={{
                px: 1.5,
                py: 0.75,
                borderRadius: 999,
                cursor: 'pointer',
                border: `1px solid ${
                  active ? colors.blue[500] : colors.grey[200]
                }`,
                bgcolor: active ? colors.blue[50] : '#fff',
              }}
            >
              {done ? (
                <CheckCircle2 size={14} color={colors.green[600]} />
              ) : (
                <Box
                  sx={{
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    border: `1px solid ${colors.grey[400]}`,
                    fontSize: 10,
                    display: 'grid',
                    placeItems: 'center',
                    color: colors.grey[600],
                  }}
                >
                  {index + 1}
                </Box>
              )}
              <Typography
                fontSize={12.5}
                fontWeight={600}
                color={active ? colors.blue[700] : colors.grey[700]}
              >
                {item.label}
              </Typography>
            </Stack>
          )
        })}
      </Stack>

      {run ? (
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1.5}
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          sx={{
            p: 1.5,
            mb: 2,
            borderRadius: 2,
            border: `1px solid ${colors.grey[200]}`,
            bgcolor: '#fff',
          }}
        >
          <Typography fontSize={14} fontWeight={700}>
            {run.run_number}
          </Typography>
          <FeeStatusChip meta={RUN_STATUS_META[run.status]} />
          <Typography fontSize={12.5} color={colors.grey[600]}>
            {run.period.period_key} · {run.employee_count} employees · net{' '}
            {run.total_net}
          </Typography>
        </Stack>
      ) : null}

      {step === 0 ? (
        <FeePanel
          title="1. Payroll period"
          subtitle="A period defines the attendance window and the pay date of the run."
        >
          <Stack spacing={2}>
            <Box>
              <Typography fontSize={13} color={colors.grey[800]} mb={1}>
                Open period
              </Typography>
              <SelectField
                placeholder="Select an open period"
                options={periodOptions}
                value={
                  periodOptions.find(
                    (option) => option.value === String(periodId ?? '')
                  ) ?? null
                }
                onChange={(option) => {
                  const value = (option as IOption<string> | null)?.value
                  setPeriodId(value ? Number(value) : null)
                }}
              />
            </Box>

            {selectedPeriod ? (
              <Stack direction="row" spacing={1} alignItems="center">
                <FeeStatusChip
                  meta={PERIOD_STATUS_META[selectedPeriod.status]}
                />
                <Typography fontSize={12.5} color={colors.grey[600]}>
                  {formatDate(selectedPeriod.start_date)} →{' '}
                  {formatDate(selectedPeriod.end_date)} · pay{' '}
                  {formatDate(selectedPeriod.pay_date)}
                </Typography>
              </Stack>
            ) : null}

            {permissions.canManagePeriods ? (
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1.25}
                alignItems={{ xs: 'stretch', sm: 'flex-end' }}
              >
                <Box sx={{ maxWidth: 200 }}>
                  <InputField
                    labelDetail={{
                      text: 'Generate a full year',
                      required: false,
                    }}
                    value={generateYear}
                    onChange={(event) => setGenerateYear(event.target.value)}
                  />
                </Box>
                <ButtonComp
                  size="small"
                  variant="outlined"
                  disabled={disabled}
                  onClick={() =>
                    execute(
                      () =>
                        dispatch(
                          generatePeriodsAction({ year: Number(generateYear) })
                        ).unwrap(),
                      false
                    )
                  }
                >
                  Generate periods
                </ButtonComp>
              </Stack>
            ) : null}

            <Box>
              <ButtonComp
                size="small"
                variant="contained"
                disabled={!periodId}
                onClick={() => setStep(1)}
              >
                Continue to run
              </ButtonComp>
            </Box>
          </Stack>
        </FeePanel>
      ) : null}

      {step === 1 ? (
        <FeePanel
          title="2. Payroll run"
          subtitle="One regular run per period. Use an off-cycle run for a bonus or a supplementary payment."
        >
          <Stack spacing={2}>
            <Box sx={{ maxWidth: 280 }}>
              <Typography fontSize={13} color={colors.grey[800]} mb={1}>
                Run type
              </Typography>
              <SelectField
                options={RUN_TYPE_OPTIONS}
                value={
                  RUN_TYPE_OPTIONS.find((option) => option.value === runType) ??
                  null
                }
                onChange={(option) => {
                  const value = (option as IOption<Payroll.RunType> | null)
                    ?.value
                  if (value) {
                    setRunType(value)
                  }
                }}
              />
            </Box>

            <Stack direction="row" spacing={1}>
              <ButtonComp
                size="small"
                variant="contained"
                disabled={!periodId || disabled}
                onClick={() =>
                  execute(async () => {
                    const created = await dispatch(
                      createRunAction({
                        period_id: Number(periodId),
                        run_type: runType,
                      })
                    ).unwrap()
                    await dispatch(getRunDetailAction(created.id))
                  }, false)
                }
              >
                Create run
              </ButtonComp>
              {run ? (
                <ButtonComp
                  size="small"
                  variant="outlined"
                  onClick={() => setStep(2)}
                >
                  Continue to calculation
                </ButtonComp>
              ) : null}
            </Stack>
          </Stack>
        </FeePanel>
      ) : null}

      {step === 2 ? (
        <FeePanel
          title="3. Calculate"
          subtitle="The engine reads attendance, assignments, loans, advances and approved adjustments, then snapshots them."
        >
          <Stack spacing={2}>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <ButtonComp
                size="small"
                variant="contained"
                disabled={!run || !permissions.canCalculate || disabled}
                onClick={() => {
                  if (!run) {
                    return
                  }
                  void execute(
                    () => dispatch(calculateRunAction(run.id)).unwrap(),
                    true
                  )
                }}
              >
                Calculate payroll
              </ButtonComp>
              {run ? (
                <ButtonComp
                  size="small"
                  variant="outlined"
                  onClick={() => setStep(3)}
                >
                  Continue to approval
                </ButtonComp>
              ) : null}
            </Stack>

            {run ? (
              <>
                <Stack direction="row" spacing={3} flexWrap="wrap" useFlexGap>
                  {[
                    ['Gross', run.total_gross],
                    ['Deductions', run.total_deductions],
                    ['Employer', run.total_employer_contributions],
                    ['Net', run.total_net],
                  ].map(([label, value]) => (
                    <Box key={label}>
                      <Typography fontSize={11} color={colors.grey[500]}>
                        {label}
                      </Typography>
                      <Typography fontSize={15} fontWeight={700}>
                        {value}
                      </Typography>
                    </Box>
                  ))}
                </Stack>

                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {run.exception_counts.length ? (
                    run.exception_counts.map((row) => (
                      <Box
                        key={`${row.severity}-${row.status}`}
                        sx={{
                          px: 1.25,
                          py: 0.5,
                          borderRadius: 2,
                          border: `1px solid ${colors.grey[200]}`,
                          fontSize: 12,
                        }}
                      >
                        {row.severity} · {row.status}: <b>{row.count}</b>
                      </Box>
                    ))
                  ) : (
                    <Typography fontSize={12.5} color={colors.green[700]}>
                      No exception raised by the engine.
                    </Typography>
                  )}
                </Stack>
              </>
            ) : (
              <Typography fontSize={13} color={colors.grey[600]}>
                Create the run first.
              </Typography>
            )}
          </Stack>
        </FeePanel>
      ) : null}

      {step === 3 && run ? (
        <FeePanel
          title="4. Approval chain"
          subtitle="Maker-checker: the preparer cannot verify or approve, the verifier cannot approve."
        >
          <Stack spacing={2}>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {(
                [
                  {
                    transition: 'submit',
                    label: 'Submit for review',
                    allowed: permissions.canSubmit,
                  },
                  {
                    transition: 'verify',
                    label: 'Verify',
                    allowed: permissions.canVerify,
                  },
                  {
                    transition: 'approve',
                    label: 'Approve',
                    allowed: permissions.canApprove,
                  },
                  {
                    transition: 'reject',
                    label: 'Reject',
                    allowed: permissions.canVerify,
                  },
                ] as const
              )
                .filter(
                  (item) =>
                    item.allowed && canRunAction(run.status, item.transition)
                )
                .map((item) => (
                  <ButtonComp
                    key={item.transition}
                    size="small"
                    variant={
                      item.transition === 'reject' ? 'outlined' : 'contained'
                    }
                    disabled={disabled}
                    onClick={() =>
                      execute(() =>
                        dispatch(
                          transitionRunAction({
                            runId: run.id,
                            transition: item.transition,
                          })
                        ).unwrap()
                      )
                    }
                  >
                    {item.label}
                  </ButtonComp>
                ))}
            </Stack>

            <Stack spacing={1}>
              {run.approvals.map((approval) => (
                <Stack
                  key={approval.id}
                  direction="row"
                  justifyContent="space-between"
                  sx={{
                    p: 1.25,
                    borderRadius: 2,
                    border: `1px solid ${colors.grey[200]}`,
                  }}
                >
                  <Typography fontSize={12.5}>
                    {approval.sequence}. {approval.stage} ·{' '}
                    {approval.actor_role ?? 'system'}
                  </Typography>
                  <Typography fontSize={12} color={colors.grey[600]}>
                    {approval.status}
                    {approval.acted_at
                      ? ` · ${formatDate(approval.acted_at)}`
                      : ''}
                  </Typography>
                </Stack>
              ))}
              {!run.approvals.length ? (
                <Typography fontSize={12.5} color={colors.grey[600]}>
                  The approval chain starts when the run is submitted.
                </Typography>
              ) : null}
            </Stack>
          </Stack>
        </FeePanel>
      ) : null}

      {step === 4 && run ? (
        <FeePanel title="5. Post to the ledger & pay">
          <Stack spacing={2}>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {canRunAction(run.status, 'post') && permissions.canPost ? (
                <ButtonComp
                  size="small"
                  variant="contained"
                  disabled={disabled}
                  onClick={() =>
                    execute(
                      () =>
                        dispatch(postRunToAccountingAction(run.id)).unwrap(),
                      true
                    )
                  }
                >
                  Post accrual to accounting
                </ButtonComp>
              ) : null}
              {canRunAction(run.status, 'authorize') &&
              permissions.canAuthorizePayment ? (
                <ButtonComp
                  size="small"
                  variant="contained"
                  disabled={disabled}
                  onClick={() =>
                    execute(() =>
                      dispatch(
                        transitionRunAction({
                          runId: run.id,
                          transition: 'authorize-payment',
                        })
                      ).unwrap()
                    )
                  }
                >
                  Authorize payment
                </ButtonComp>
              ) : null}
              {permissions.canGeneratePayslips &&
              ['APPROVED', 'POSTED', 'PAYMENT_AUTHORIZED', 'PAID'].includes(
                run.status
              ) ? (
                <ButtonComp
                  size="small"
                  variant="outlined"
                  disabled={disabled}
                  onClick={() =>
                    execute(
                      () => dispatch(generatePayslipsAction(run.id)).unwrap(),
                      false
                    )
                  }
                >
                  Generate payslips
                </ButtonComp>
              ) : null}
              {canRunAction(run.status, 'close') && permissions.canFinalize ? (
                <ButtonComp
                  size="small"
                  variant="outlined"
                  disabled={disabled}
                  onClick={() =>
                    execute(() =>
                      dispatch(
                        transitionRunAction({
                          runId: run.id,
                          transition: 'close',
                        })
                      ).unwrap()
                    )
                  }
                >
                  Close run
                </ButtonComp>
              ) : null}
            </Stack>

            {run.status === 'PAYMENT_AUTHORIZED' &&
            permissions.canCreatePayments ? (
              <Stack
                direction={{ xs: 'column', md: 'row' }}
                spacing={1.25}
                alignItems={{ xs: 'stretch', md: 'flex-end' }}
              >
                <Box sx={{ minWidth: 220 }}>
                  <Typography fontSize={13} mb={0.75}>
                    Cash / bank account
                  </Typography>
                  <SelectField
                    placeholder="Select an account"
                    options={accountSelectOptions}
                    value={
                      accountSelectOptions.find(
                        (option) => option.value === String(cashAccountId ?? '')
                      ) ?? null
                    }
                    onChange={(option) => {
                      const value = (option as IOption<string> | null)?.value
                      setCashAccountId(value ? Number(value) : null)
                    }}
                  />
                </Box>
                <Box sx={{ minWidth: 180 }}>
                  <Typography fontSize={13} mb={0.75}>
                    Payment method
                  </Typography>
                  <SelectField
                    options={PAYMENT_METHOD_OPTIONS}
                    value={
                      PAYMENT_METHOD_OPTIONS.find(
                        (option) => option.value === paymentMethod
                      ) ?? null
                    }
                    onChange={(option) => {
                      const value = (
                        option as IOption<Payroll.PaymentMethod> | null
                      )?.value
                      if (value) {
                        setPaymentMethod(value)
                      }
                    }}
                  />
                </Box>
                <ButtonComp
                  size="small"
                  variant="contained"
                  disabled={!cashAccountId || disabled}
                  onClick={() => {
                    void execute(async () => {
                      const payment = await dispatch(
                        createPaymentAction({
                          runId: run.id,
                          payment: {
                            payment_date: todayIso(),
                            payment_method: paymentMethod,
                            cash_account_id: Number(cashAccountId),
                          },
                        })
                      ).unwrap()
                      navigate(`${PAYROLL_BASE_PATH}/payments?run=${run.id}`)
                      return payment
                    }, false)
                  }}
                >
                  Create payment batch
                </ButtonComp>
              </Stack>
            ) : null}

            <Typography fontSize={12.5} color={colors.grey[700]}>
              Accounting: {run.accounting_event_status ?? 'not posted'}
              {run.accounting_transaction_id
                ? ` · transaction #${run.accounting_transaction_id}`
                : ''}
            </Typography>
          </Stack>
        </FeePanel>
      ) : null}
    </Box>
  )
}
