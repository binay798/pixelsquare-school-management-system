import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material'
import moment from 'moment'
import { useEffect, useState } from 'react'
import { Settings2 } from 'lucide-react'
import { ButtonComp } from '@src/components/button/button.component'
import { CustomDatePicker } from '@src/components/datePicker/datePicker.component'
import { InputField } from '@src/components/input/input.component'
import { SelectField } from '@src/components/select/select.component'
import { colors } from '@src/helpers/colors.helpers'
import { getAccountOptionsAction } from '@src/store/redux/dashboard/accounting/accounting.slice'
import { useDispatch, useSelector } from '@src/store/hooks.store'
import {
  createPolicyVersionAction,
  getMappingsAction,
  getSettingsAction,
  upsertMappingAction,
} from '@src/store/redux/dashboard/payroll/payroll.slice'
import { usePayrollPermissions } from '@src/hooks/usePayrollPermissions.hooks'
import {
  FeeCellStack,
  FeeDataTable,
} from '../fees/components/feeDataTable.component'
import type { IFeeColumn } from '../fees/components/feeDataTable.component'
import { FeePageHeader } from '../fees/components/feePageHeader.component'
import { FeePanel } from '../fees/components/feePanel.component'
import {
  FREQUENCY_OPTIONS,
  LATE_DEDUCTION_MODE_OPTIONS,
  MAPPING_KEY_LABEL,
  OVERTIME_BASIS_OPTIONS,
  PAYABLE_BASIS_OPTIONS,
  PAYROLL_BASE_PATH,
  ROUNDING_MODE_OPTIONS,
  formatDate,
  todayIso,
} from './payroll.helpers'
import type { IOption } from './payroll.helpers'

type TPolicyForm = {
  frequency: Payroll.Frequency
  payable_day_basis: Payroll.PayableDayBasis
  fixed_working_days_per_month: string
  daily_working_hours: string
  overtime_multiplier: string
  overtime_basis: Payroll.OvertimeBasis
  half_day_weight: string
  deduct_unpaid_leave: boolean
  late_deduction_mode: Payroll.LateDeductionMode
  late_deduction_amount: string
  rounding_mode: Payroll.RoundingMode
  periods_per_year: string
}

/**
 * Payroll settings: the effective policy (versioned, effective dated), the policy
 * history and the payroll ↔ chart of accounts mapping used by the journal builder.
 */
export function PayrollSettingsPage() {
  const dispatch = useDispatch()
  const permissions = usePayrollPermissions()

  const { data: settings, loading } = useSelector(
    (store) => store.payroll.settings
  )
  const { data: mappings, loading: mappingsLoading } = useSelector(
    (store) => store.payroll.mappings
  )
  const { data: accountOptions } = useSelector(
    (store) => store.accounting.accountOptions
  )

  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [effectiveFrom, setEffectiveFrom] = useState(todayIso())
  const [form, setForm] = useState<TPolicyForm | null>(null)

  useEffect(() => {
    dispatch(getSettingsAction())
    dispatch(getMappingsAction())
    dispatch(getAccountOptionsAction({ activeOnly: true }))
  }, [dispatch])

  const policy = settings?.effective_policy

  const startVersion = () => {
    if (!policy) {
      return
    }

    setEffectiveFrom(todayIso())
    setForm({
      frequency: policy.frequency,
      payable_day_basis: policy.payable_day_basis,
      fixed_working_days_per_month: String(policy.fixed_working_days_per_month),
      daily_working_hours: String(policy.daily_working_hours),
      overtime_multiplier: String(policy.overtime_multiplier),
      overtime_basis: policy.overtime_basis,
      half_day_weight: String(policy.half_day_weight),
      deduct_unpaid_leave: policy.deduct_unpaid_leave,
      late_deduction_mode: policy.late_deduction_mode,
      late_deduction_amount: policy.late_deduction_amount ?? '0',
      rounding_mode: policy.rounding_mode,
      periods_per_year: String(policy.periods_per_year),
    })
    setOpen(true)
  }

  const saveVersion = async () => {
    if (!form) {
      return
    }

    try {
      setBusy(true)
      await dispatch(
        createPolicyVersionAction({
          effective_from: effectiveFrom,
          policy: {
            frequency: form.frequency,
            payable_day_basis: form.payable_day_basis,
            fixed_working_days_per_month: Number(
              form.fixed_working_days_per_month
            ),
            daily_working_hours: Number(form.daily_working_hours),
            overtime_multiplier: Number(form.overtime_multiplier),
            overtime_basis: form.overtime_basis,
            half_day_weight: Number(form.half_day_weight),
            deduct_unpaid_leave: form.deduct_unpaid_leave,
            late_deduction_mode: form.late_deduction_mode,
            late_deduction_amount: form.late_deduction_amount,
            rounding_mode: form.rounding_mode,
            periods_per_year: Number(form.periods_per_year),
          },
        })
      ).unwrap()
      await dispatch(getSettingsAction())
      setOpen(false)
    } catch {
      /* toast raised by the slice */
    } finally {
      setBusy(false)
    }
  }

  const accountSelectOptions: IOption<string>[] = (accountOptions ?? []).map(
    (account) => ({
      value: String(account.id),
      label: `${account.account_code} · ${account.account_name}`,
    })
  )

  const mappingColumns: IFeeColumn<Payroll.IMapping>[] = [
    {
      key: 'key',
      label: 'Mapping',
      render: (row) => (
        <FeeCellStack
          primary={MAPPING_KEY_LABEL[row.mapping_key] ?? row.mapping_key}
          secondary={row.description ?? undefined}
        />
      ),
    },
    {
      key: 'account',
      label: 'Account',
      render: (row) =>
        permissions.canManageSettings ? (
          <SelectField
            placeholder="Select an account"
            options={accountSelectOptions}
            value={
              accountSelectOptions.find(
                (option) => option.value === String(row.account_id)
              ) ?? null
            }
            onChange={(option) => {
              const value = (option as IOption<string> | null)?.value
              if (!value) {
                return
              }
              void dispatch(
                upsertMappingAction({
                  mapping_key: row.mapping_key,
                  account_id: Number(value),
                })
              )
                .unwrap()
                .then(() => dispatch(getMappingsAction()))
                .catch(() => undefined)
            }}
          />
        ) : (
          <Typography fontSize={12.5}>
            {row.account_code} · {row.account_name}
          </Typography>
        ),
    },
  ]

  const versionColumns: IFeeColumn<Payroll.IPolicyVersion>[] = [
    {
      key: 'version',
      label: 'Version',
      render: (row) => (
        <FeeCellStack
          primary={`v${row.version}`}
          secondary={row.is_active ? 'active' : 'inactive'}
        />
      ),
    },
    {
      key: 'effective',
      label: 'Effective from',
      render: (row) => (
        <Typography fontSize={12.5}>
          {formatDate(row.effective_from)}
        </Typography>
      ),
    },
    {
      key: 'basis',
      label: 'Basis',
      hideBelow: 'md',
      render: (row) => (
        <Typography fontSize={12} color={colors.grey[600]}>
          {row.policy?.payable_day_basis ?? '—'} ·{' '}
          {row.policy?.frequency ?? '—'}
        </Typography>
      ),
    },
  ]

  const policyRows: [string, string][] = policy
    ? [
        ['Frequency', policy.frequency],
        ['Payable days', policy.payable_day_basis],
        ['Fixed days', String(policy.fixed_working_days_per_month)],
        ['Daily hours', String(policy.daily_working_hours)],
        ['Overtime ×', String(policy.overtime_multiplier)],
        ['Overtime basis', policy.overtime_basis],
        ['Half day', String(policy.half_day_weight)],
        ['Unpaid leave', policy.deduct_unpaid_leave ? 'deducted' : 'paid'],
        ['Late deduction', policy.late_deduction_mode],
        ['Late amount', policy.late_deduction_amount ?? '0'],
        ['Rounding', policy.rounding_mode],
        ['Periods / year', String(policy.periods_per_year)],
      ]
    : []
  return (
    <Box>
      <FeePageHeader
        title="Payroll settings"
        subtitle="The effective policy is versioned and effective dated: a new version never rewrites history."
        backTo={PAYROLL_BASE_PATH}
        backLabel="Payroll"
        loading={loading && !settings}
        actions={
          permissions.canManageSettings ? (
            <ButtonComp
              size="small"
              variant="contained"
              startIcon={<Settings2 size={15} />}
              disabled={!policy}
              onClick={startVersion}
            >
              New policy version
            </ButtonComp>
          ) : null
        }
      />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
          gap: 2,
        }}
      >
        <FeePanel
          title="Effective policy"
          subtitle={
            settings?.policy_version
              ? `v${settings.policy_version.version} · effective ${formatDate(
                  settings.policy_version.effective_from
                )}`
              : undefined
          }
        >
          {loading && !policy ? (
            <Skeleton height={160} />
          ) : policy ? (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(3, 1fr)' },
                gap: 1.5,
              }}
            >
              {policyRows.map(([label, value]) => (
                <Box key={label}>
                  <Typography fontSize={11} color={colors.grey[500]}>
                    {label}
                  </Typography>
                  <Typography fontSize={13} fontWeight={600}>
                    {value}
                  </Typography>
                </Box>
              ))}
            </Box>
          ) : (
            <Typography fontSize={13} color={colors.grey[600]}>
              Payroll is not provisioned for this school yet.
            </Typography>
          )}
        </FeePanel>

        <FeePanel
          noPadding
          title="Policy history"
          subtitle="Each run stores the policy version it was calculated with."
        >
          <FeeDataTable
            columns={versionColumns}
            rows={settings?.versions ?? []}
            rowKey={(row) => row.id}
            loading={loading}
            skeletonRows={4}
            emptyTitle="No policy version"
            emptyDescription="Create the first version to start payroll."
          />
        </FeePanel>
      </Box>

      <Box mt={2}>
        <FeePanel
          noPadding
          title="Accounting mapping"
          subtitle="Every payroll journal line is built from these accounts; unmapped keys fall back to the chart of accounts code."
        >
          <FeeDataTable
            columns={mappingColumns}
            rows={mappings?.mappings ?? []}
            rowKey={(row) => row.id}
            loading={mappingsLoading}
            skeletonRows={6}
            emptyTitle="No mapping"
            emptyDescription="Run the payroll seed to provision the default mapping."
          />
        </FeePanel>
      </Box>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>New payroll policy version</DialogTitle>
        <DialogContent>
          {form ? (
            <Stack spacing={1.5} pt={1}>
              <CustomDatePicker
                format="YYYY-MM-DD"
                labelDetail={{ text: 'Effective from', required: true }}
                views={['day', 'month', 'year']}
                value={effectiveFrom ? moment(effectiveFrom) : null}
                onChange={(value) =>
                  setEffectiveFrom(
                    value && moment(value).isValid()
                      ? moment(value).format('YYYY-MM-DD')
                      : todayIso()
                  )
                }
                slotProps={{ textField: { size: 'small' } }}
              />
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                  gap: 1.5,
                }}
              >
                <Box>
                  <Typography fontSize={13} mb={0.75}>
                    Frequency
                  </Typography>
                  <SelectField
                    options={FREQUENCY_OPTIONS}
                    value={
                      FREQUENCY_OPTIONS.find(
                        (option) => option.value === form.frequency
                      ) ?? null
                    }
                    onChange={(option) => {
                      const value = (
                        option as IOption<Payroll.Frequency> | null
                      )?.value
                      if (value) {
                        setForm({ ...form, frequency: value })
                      }
                    }}
                  />
                </Box>
                <Box>
                  <Typography fontSize={13} mb={0.75}>
                    Payable day basis
                  </Typography>
                  <SelectField
                    options={PAYABLE_BASIS_OPTIONS}
                    value={
                      PAYABLE_BASIS_OPTIONS.find(
                        (option) => option.value === form.payable_day_basis
                      ) ?? null
                    }
                    onChange={(option) => {
                      const value = (
                        option as IOption<Payroll.PayableDayBasis> | null
                      )?.value
                      if (value) {
                        setForm({ ...form, payable_day_basis: value })
                      }
                    }}
                  />
                </Box>
                <InputField
                  labelDetail={{
                    text: 'Fixed working days / month',
                    required: false,
                  }}
                  value={form.fixed_working_days_per_month}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      fixed_working_days_per_month: event.target.value,
                    })
                  }
                />
                <InputField
                  labelDetail={{ text: 'Daily working hours', required: false }}
                  value={form.daily_working_hours}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      daily_working_hours: event.target.value,
                    })
                  }
                />
              </Box>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                  gap: 1.5,
                }}
              >
                <InputField
                  labelDetail={{ text: 'Overtime multiplier', required: false }}
                  value={form.overtime_multiplier}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      overtime_multiplier: event.target.value,
                    })
                  }
                />
                <Box>
                  <Typography fontSize={13} mb={0.75}>
                    Overtime basis
                  </Typography>
                  <SelectField
                    options={OVERTIME_BASIS_OPTIONS}
                    value={
                      OVERTIME_BASIS_OPTIONS.find(
                        (option) => option.value === form.overtime_basis
                      ) ?? null
                    }
                    onChange={(option) => {
                      const value = (
                        option as IOption<Payroll.OvertimeBasis> | null
                      )?.value
                      if (value) {
                        setForm({ ...form, overtime_basis: value })
                      }
                    }}
                  />
                </Box>
                <InputField
                  labelDetail={{ text: 'Half day weight', required: false }}
                  value={form.half_day_weight}
                  onChange={(event) =>
                    setForm({ ...form, half_day_weight: event.target.value })
                  }
                />
                <InputField
                  labelDetail={{ text: 'Periods per year', required: false }}
                  value={form.periods_per_year}
                  onChange={(event) =>
                    setForm({ ...form, periods_per_year: event.target.value })
                  }
                />
                <Box>
                  <Typography fontSize={13} mb={0.75}>
                    Rounding mode
                  </Typography>
                  <SelectField
                    options={ROUNDING_MODE_OPTIONS}
                    value={
                      ROUNDING_MODE_OPTIONS.find(
                        (option) => option.value === form.rounding_mode
                      ) ?? null
                    }
                    onChange={(option) => {
                      const value = (
                        option as IOption<Payroll.RoundingMode> | null
                      )?.value
                      if (value) {
                        setForm({ ...form, rounding_mode: value })
                      }
                    }}
                  />
                </Box>
                <Box>
                  <Typography fontSize={13} mb={0.75}>
                    Late deduction mode
                  </Typography>
                  <SelectField
                    options={LATE_DEDUCTION_MODE_OPTIONS}
                    value={
                      LATE_DEDUCTION_MODE_OPTIONS.find(
                        (option) => option.value === form.late_deduction_mode
                      ) ?? null
                    }
                    onChange={(option) => {
                      const value = (
                        option as IOption<Payroll.LateDeductionMode> | null
                      )?.value
                      if (value) {
                        setForm({ ...form, late_deduction_mode: value })
                      }
                    }}
                  />
                </Box>
                <InputField
                  labelDetail={{
                    text: 'Late deduction amount',
                    required: false,
                  }}
                  value={form.late_deduction_amount}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      late_deduction_amount: event.target.value,
                    })
                  }
                />
              </Box>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={form.deduct_unpaid_leave}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        deduct_unpaid_leave: event.target.checked,
                      })
                    }
                  />
                }
                label="Deduct unpaid leave from the salary"
              />
            </Stack>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" disabled={busy} onClick={saveVersion}>
            Save version
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
