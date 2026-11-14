import {
  Box,
  Divider,
  FormControlLabel,
  Stack,
  Switch,
  Typography,
} from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import SpringModal from '@src/components/modal/modal.component'
import { ButtonComp } from '@src/components/button/button.component'
import {
  InputField,
  TextareaField,
} from '@src/components/input/input.component'
import { SelectField } from '@src/components/select/select.component'
import { colors } from '@src/helpers/colors.helpers'
import { useDispatch, useSelector } from '@src/store/hooks.store'
import {
  createFeeTypeAction,
  updateFeeTypeAction,
} from '@src/store/redux/dashboard/fee/fee.config.slice'
import {
  FEE_CATEGORY_OPTIONS,
  IOption,
  isMoney,
  REVENUE_POLICY_OPTIONS,
} from '../../../fees.helpers'

interface Props {
  open: boolean
  onClose: () => void
  feeType: Fee.IFeeType | null
  onSaved: () => void
}

interface IFormState {
  name: string
  code: string
  description: string
  default_amount: string
  category: Fee.FeeCategory
  accounting_account_id: number | null
  revenue_recognition_policy: Fee.RevenueRecognitionPolicy
  is_mandatory: boolean
  is_recurring: boolean
  is_refundable: boolean
  is_active: boolean
}

const emptyForm: IFormState = {
  name: '',
  code: '',
  description: '',
  default_amount: '',
  category: 'TUITION',
  accounting_account_id: null,
  revenue_recognition_policy: 'ON_ISSUE',
  is_mandatory: true,
  is_recurring: true,
  is_refundable: false,
  is_active: true,
}

/** Create / edit form of a fee type (`POST` / `PATCH /fees/types`). */
export function FeeTypeFormModal({ open, onClose, feeType, onSaved }: Props) {
  const dispatch = useDispatch()
  const { data: accounts } = useSelector((store) => store.feeDashboard.accounts)
  const { loading: saving } = useSelector(
    (store) => store.feeConfig.feeTypeMutation
  )

  const [form, setForm] = useState<IFormState>(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!open) {
      return
    }

    setErrors({})

    if (feeType) {
      setForm({
        name: feeType.name,
        code: feeType.code,
        description: feeType.description ?? '',
        default_amount: feeType.default_amount ?? '',
        category: feeType.category,
        accounting_account_id: feeType.accounting_account_id,
        revenue_recognition_policy: feeType.revenue_recognition_policy,
        is_mandatory: feeType.is_mandatory,
        is_recurring: feeType.is_recurring,
        is_refundable: feeType.is_refundable,
        is_active: feeType.is_active,
      })

      return
    }

    setForm(emptyForm)
  }, [open, feeType])

  const accountOptions: IOption[] = useMemo(
    () =>
      (accounts ?? []).map((account) => ({
        value: String(account.id),
        label: `${account.account_code} · ${account.account_name}`,
      })),
    [accounts]
  )

  const set = <K extends keyof IFormState>(key: K, value: IFormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const validate = () => {
    const next: Record<string, string> = {}

    if (form.name.trim().length < 2) {
      next.name = 'A name of at least 2 characters is required.'
    }
    if (form.code.trim().length < 2) {
      next.code = 'A code of at least 2 characters is required.'
    }
    if (form.default_amount && !isMoney(form.default_amount)) {
      next.default_amount = 'Use a positive amount with at most 2 decimals.'
    }

    setErrors(next)

    return Object.keys(next).length === 0
  }

  const submit = () => {
    if (!validate()) {
      return
    }

    const payload = {
      name: form.name.trim(),
      code: form.code.trim().toUpperCase(),
      description: form.description.trim() || null,
      default_amount: form.default_amount ? form.default_amount : null,
      category: form.category,
      accounting_account_id: form.accounting_account_id,
      revenue_recognition_policy: form.revenue_recognition_policy,
      is_mandatory: form.is_mandatory,
      is_recurring: form.is_recurring,
      is_refundable: form.is_refundable,
      is_active: form.is_active,
    }

    const onSuccess = () => {
      onSaved()
      onClose()
    }

    if (feeType) {
      dispatch(
        updateFeeTypeAction({ feeTypeId: feeType.id, payload, onSuccess })
      )

      return
    }

    dispatch(createFeeTypeAction({ payload, onSuccess }))
  }

  return (
    <SpringModal open={open} close={onClose} size="md">
      <Box sx={{ minWidth: { xs: 'auto', sm: 560 } }}>
        <Typography fontSize={17} fontWeight={700} color={colors.grey[900]}>
          {feeType ? 'Edit fee type' : 'New fee type'}
        </Typography>
        <Typography fontSize={12.5} color={colors.grey[500]} mt={0.25} mb={2}>
          A fee type is the billable definition. Its revenue account is what the
          accounting engine credits when an invoice is issued.
        </Typography>

        <Stack spacing={1.5}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <InputField
              labelDetail={{ text: 'Fee name', required: true }}
              placeholder="e.g. Tuition fee"
              value={form.name}
              error={Boolean(errors.name)}
              helperText={errors.name}
              onChange={(event) => set('name', event.target.value)}
            />
            <InputField
              labelDetail={{ text: 'Fee code', required: true }}
              placeholder="e.g. TUITION"
              value={form.code}
              error={Boolean(errors.code)}
              helperText={errors.code}
              onChange={(event) =>
                set('code', event.target.value.toUpperCase())
              }
            />
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <InputField
              labelDetail={{ text: 'Default amount', required: false }}
              placeholder="0.00"
              value={form.default_amount}
              error={Boolean(errors.default_amount)}
              helperText={
                errors.default_amount ??
                'Suggested amount when the fee type is added to a template.'
              }
              onChange={(event) => set('default_amount', event.target.value)}
            />
            <Box width={800}>
              <Typography fontSize={13} color={colors.grey[800]} mb={1}>
                Category
              </Typography>
              <SelectField
                options={FEE_CATEGORY_OPTIONS}
                value={
                  FEE_CATEGORY_OPTIONS.find(
                    (option) => option.value === form.category
                  ) ?? null
                }
                onChange={(option) =>
                  set('category', (option as IOption<Fee.FeeCategory>).value)
                }
              />
            </Box>
          </Stack>

          <Box>
            <Typography fontSize={13} color={colors.grey[800]} mb={1}>
              Revenue account (chart of accounts)
            </Typography>
            <SelectField
              isClearable
              isLoading={!accounts}
              options={accountOptions}
              placeholder="System default revenue account"
              value={
                accountOptions.find(
                  (option) =>
                    option.value === String(form.accounting_account_id)
                ) ?? null
              }
              onChange={(option) =>
                set(
                  'accounting_account_id',
                  option ? Number((option as IOption).value) : null
                )
              }
            />
          </Box>

          <Box>
            <Typography fontSize={13} color={colors.grey[800]} mb={1}>
              Revenue recognition
            </Typography>
            <SelectField
              options={REVENUE_POLICY_OPTIONS}
              value={
                REVENUE_POLICY_OPTIONS.find(
                  (option) => option.value === form.revenue_recognition_policy
                ) ?? null
              }
              onChange={(option) =>
                set(
                  'revenue_recognition_policy',
                  (option as IOption<Fee.RevenueRecognitionPolicy>).value
                )
              }
            />
            <Typography fontSize={11.5} color={colors.grey[500]} mt={0.5}>
              DEFERRED credits Deferred Revenue instead of income until the fee
              is earned.
            </Typography>
          </Box>

          <TextareaField
            labelDetail={{ text: 'Description', required: false }}
            placeholder="Optional internal note"
            variant="outlined"
            minRows={2}
            value={form.description}
            onChange={(event) => set('description', event.target.value)}
          />

          <Divider />

          <Box
            sx={{
              display: 'grid',
              gap: 0.25,
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
            }}
          >
            <FormControlLabel
              control={
                <Switch
                  checked={form.is_mandatory}
                  onChange={(event) =>
                    set('is_mandatory', event.target.checked)
                  }
                />
              }
              label={<Typography fontSize={13}>Mandatory fee</Typography>}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={form.is_recurring}
                  onChange={(event) =>
                    set('is_recurring', event.target.checked)
                  }
                />
              }
              label={<Typography fontSize={13}>Recurring fee</Typography>}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={form.is_refundable}
                  onChange={(event) =>
                    set('is_refundable', event.target.checked)
                  }
                />
              }
              label={<Typography fontSize={13}>Refundable</Typography>}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={form.is_active}
                  onChange={(event) => set('is_active', event.target.checked)}
                />
              }
              label={<Typography fontSize={13}>Active</Typography>}
            />
          </Box>
        </Stack>

        <Stack direction="row" spacing={1} justifyContent="flex-end" mt={2.5}>
          <ButtonComp variant="outlined" color="error" onClick={onClose}>
            Cancel
          </ButtonComp>
          <ButtonComp loading={saving} onClick={submit}>
            {feeType ? 'Save changes' : 'Create fee type'}
          </ButtonComp>
        </Stack>
      </Box>
    </SpringModal>
  )
}
