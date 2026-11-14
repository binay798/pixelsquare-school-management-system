import { Box, FormControlLabel, Stack, Switch, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import moment from 'moment'
import SpringModal from '@src/components/modal/modal.component'
import { ButtonComp } from '@src/components/button/button.component'
import { InputField } from '@src/components/input/input.component'
import { SelectField } from '@src/components/select/select.component'
import { CustomDatePicker } from '@src/components/datePicker/datePicker.component'
import { colors } from '@src/helpers/colors.helpers'
import { useDispatch, useSelector } from '@src/store/hooks.store'
import {
  createLateFeeRuleAction,
  updateLateFeeRuleAction,
} from '@src/store/redux/dashboard/fee/fee.config.slice'
import {
  IOption,
  isMoney,
  LATE_FEE_FREQUENCY_OPTIONS,
  LATE_FEE_TYPE_OPTIONS,
} from '../../../fees.helpers'
import { useFeeAccounts } from '../../../hooks/useFeeAccounts.hooks'

interface Props {
  open: boolean
  onClose: () => void
  rule: Fee.ILateFeeRule | null
  feeTypes: Fee.IFeeType[]
  onSaved: () => void
}

export function LateFeeRuleModal({
  open,
  onClose,
  rule,
  feeTypes,
  onSaved,
}: Props) {
  const dispatch = useDispatch()
  const { accounts } = useFeeAccounts()
  const { loading } = useSelector(
    (store) => store.feeConfig.lateFeeRuleMutation
  )

  const [form, setForm] = useState({
    name: '',
    calculation_type: 'FIXED' as Fee.LateFeeCalculationType,
    calculation_value: '',
    grace_period_days: '0',
    maximum_penalty: '',
    frequency: 'ONE_TIME' as Fee.LateFeeFrequency,
    applies_to_fee_type_id: null as number | null,
    accounting_account_id: null as number | null,
    effective_from: moment().format('YYYY-MM-DD'),
    effective_until: '',
    is_active: true,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!open) {
      return
    }

    setErrors({})

    if (rule) {
      setForm({
        name: rule.name,
        calculation_type: rule.calculation_type,
        calculation_value: rule.calculation_value,
        grace_period_days: String(rule.grace_period_days ?? 0),
        maximum_penalty: rule.maximum_penalty ?? '',
        frequency: rule.frequency,
        applies_to_fee_type_id: rule.applies_to_fee_type_id,
        accounting_account_id: rule.accounting_account_id,
        effective_from: String(rule.effective_from).slice(0, 10),
        effective_until: rule.effective_until
          ? String(rule.effective_until).slice(0, 10)
          : '',
        is_active: rule.is_active,
      })

      return
    }

    setForm({
      name: '',
      calculation_type: 'FIXED',
      calculation_value: '',
      grace_period_days: '0',
      maximum_penalty: '',
      frequency: 'ONE_TIME',
      applies_to_fee_type_id: null,
      accounting_account_id: null,
      effective_from: moment().format('YYYY-MM-DD'),
      effective_until: '',
      is_active: true,
    })
  }, [open, rule])

  const feeTypeOptions: IOption[] = feeTypes.map((feeType) => ({
    value: String(feeType.id),
    label: feeType.name,
  }))

  const accountOptions: IOption[] = accounts.map((account) => ({
    value: String(account.id),
    label: `${account.account_code} · ${account.account_name}`,
  }))

  const submit = () => {
    const next: Record<string, string> = {}

    if (form.name.trim().length < 2) {
      next.name = 'A rule name of at least 2 characters is required.'
    }
    if (!isMoney(form.calculation_value)) {
      next.calculation_value = 'Enter a positive value (max 2 decimals).'
    }
    if (
      form.calculation_type === 'PERCENTAGE' &&
      Number(form.calculation_value) > 100
    ) {
      next.calculation_value = 'A percentage can never exceed 100.'
    }
    if (form.maximum_penalty && !isMoney(form.maximum_penalty)) {
      next.maximum_penalty = 'Use a positive amount.'
    }
    if (!form.effective_from) {
      next.effective_from = 'An effective date is required.'
    }

    setErrors(next)

    if (Object.keys(next).length) {
      return
    }

    const payload = {
      name: form.name.trim(),
      calculation_type: form.calculation_type,
      calculation_value: form.calculation_value,
      grace_period_days: Number(form.grace_period_days || 0),
      maximum_penalty: form.maximum_penalty || null,
      frequency: form.frequency,
      applies_to_fee_type_id: form.applies_to_fee_type_id,
      accounting_account_id: form.accounting_account_id,
      effective_from: form.effective_from,
      effective_until: form.effective_until || null,
      is_active: form.is_active,
    }

    const onSuccess = () => {
      onSaved()
      onClose()
    }

    if (rule) {
      dispatch(updateLateFeeRuleAction({ ruleId: rule.id, payload, onSuccess }))

      return
    }

    dispatch(createLateFeeRuleAction({ payload, onSuccess }))
  }

  return (
    <SpringModal open={open} close={onClose} size="md">
      <Box sx={{ minWidth: { xs: 'auto', sm: 580 } }}>
        <Typography fontSize={16} fontWeight={700}>
          {rule ? 'Edit late fee rule' : 'New late fee rule'}
        </Typography>
        <Typography fontSize={12.5} color={colors.grey[500]} mt={0.25} mb={2}>
          The penalty is always assessed server side: the frontend never
          computes a charge. One penalty per invoice, rule and billing period.
        </Typography>

        <Stack spacing={1.5}>
          <InputField
            labelDetail={{ text: 'Rule name', required: true }}
            placeholder="e.g. Standard monthly late fee"
            value={form.name}
            error={Boolean(errors.name)}
            helperText={errors.name}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, name: event.target.value }))
            }
          />

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <Box flex={1}>
              <Typography fontSize={13} color={colors.grey[800]} mb={1}>
                Calculation type *
              </Typography>
              <SelectField
                options={LATE_FEE_TYPE_OPTIONS}
                value={
                  LATE_FEE_TYPE_OPTIONS.find(
                    (option) => option.value === form.calculation_type
                  ) ?? null
                }
                onChange={(option) =>
                  setForm((prev) => ({
                    ...prev,
                    calculation_type: (
                      option as IOption<Fee.LateFeeCalculationType>
                    ).value,
                  }))
                }
              />
            </Box>
            <InputField
              labelDetail={{
                text:
                  form.calculation_type === 'PERCENTAGE'
                    ? 'Value (%)'
                    : 'Value (amount)',
                required: true,
              }}
              placeholder={
                form.calculation_type === 'PERCENTAGE' ? '2' : '100.00'
              }
              value={form.calculation_value}
              error={Boolean(errors.calculation_value)}
              helperText={errors.calculation_value}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  calculation_value: event.target.value,
                }))
              }
            />
            <Box flex={1}>
              <Typography fontSize={13} color={colors.grey[800]} mb={1}>
                Frequency
              </Typography>
              <SelectField
                options={LATE_FEE_FREQUENCY_OPTIONS}
                value={
                  LATE_FEE_FREQUENCY_OPTIONS.find(
                    (option) => option.value === form.frequency
                  ) ?? null
                }
                onChange={(option) =>
                  setForm((prev) => ({
                    ...prev,
                    frequency: (option as IOption<Fee.LateFeeFrequency>).value,
                  }))
                }
              />
            </Box>
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <InputField
              labelDetail={{ text: 'Grace period (days)', required: false }}
              placeholder="0"
              value={form.grace_period_days}
              helperText="Days after the due date before the penalty applies."
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  grace_period_days: event.target.value.replace(/[^0-9]/g, ''),
                }))
              }
            />
            <InputField
              labelDetail={{ text: 'Maximum penalty', required: false }}
              placeholder="Cap the penalty"
              value={form.maximum_penalty}
              error={Boolean(errors.maximum_penalty)}
              helperText={errors.maximum_penalty}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  maximum_penalty: event.target.value,
                }))
              }
            />
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <Box flex={1}>
              <Typography fontSize={13} color={colors.grey[800]} mb={1}>
                Applies to fee type
              </Typography>
              <SelectField
                isClearable
                placeholder="All fee types"
                options={feeTypeOptions}
                value={
                  feeTypeOptions.find(
                    (option) =>
                      option.value === String(form.applies_to_fee_type_id)
                  ) ?? null
                }
                onChange={(option) =>
                  setForm((prev) => ({
                    ...prev,
                    applies_to_fee_type_id: (option as IOption | null)?.value
                      ? Number((option as IOption).value)
                      : null,
                  }))
                }
              />
            </Box>
            <Box flex={1}>
              <Typography fontSize={13} color={colors.grey[800]} mb={1}>
                Penalty income account
              </Typography>
              <SelectField
                isClearable
                placeholder="System default"
                options={accountOptions}
                value={
                  accountOptions.find(
                    (option) =>
                      option.value === String(form.accounting_account_id)
                  ) ?? null
                }
                onChange={(option) =>
                  setForm((prev) => ({
                    ...prev,
                    accounting_account_id: (option as IOption | null)?.value
                      ? Number((option as IOption).value)
                      : null,
                  }))
                }
              />
            </Box>
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <Box flex={1}>
              <CustomDatePicker
                labelDetail={{ text: 'Effective from *', required: true }}
                views={['day', 'month', 'year']}
                value={form.effective_from ? moment(form.effective_from) : null}
                onChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    effective_from:
                      value && moment(value).isValid()
                        ? moment(value).format('YYYY-MM-DD')
                        : '',
                  }))
                }
                slotProps={{ textField: { size: 'small' } }}
              />
              {errors.effective_from ? (
                <Typography fontSize={11.5} color="error" mt={0.5}>
                  {errors.effective_from}
                </Typography>
              ) : null}
            </Box>
            <Box flex={1}>
              <CustomDatePicker
                labelDetail={{ text: 'Effective until', required: false }}
                views={['day', 'month', 'year']}
                value={
                  form.effective_until ? moment(form.effective_until) : null
                }
                onChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    effective_until:
                      value && moment(value).isValid()
                        ? moment(value).format('YYYY-MM-DD')
                        : '',
                  }))
                }
                slotProps={{ textField: { size: 'small' } }}
              />
            </Box>
            <Box flex={1} display="flex" alignItems="center">
              <FormControlLabel
                control={
                  <Switch
                    checked={form.is_active}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        is_active: event.target.checked,
                      }))
                    }
                  />
                }
                label={<Typography fontSize={13}>Active</Typography>}
              />
            </Box>
          </Stack>
        </Stack>

        <Stack direction="row" spacing={1} justifyContent="flex-end" mt={2.5}>
          <ButtonComp variant="outlined" color="error" onClick={onClose}>
            Cancel
          </ButtonComp>
          <ButtonComp loading={loading} onClick={submit}>
            {rule ? 'Save rule' : 'Create rule'}
          </ButtonComp>
        </Stack>
      </Box>
    </SpringModal>
  )
}
