import { Box, FormControlLabel, Stack, Switch, Typography } from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import moment from 'moment'
import SpringModal from '@src/components/modal/modal.component'
import { ButtonComp } from '@src/components/button/button.component'
import {
  InputField,
  TextareaField,
} from '@src/components/input/input.component'
import { SelectField } from '@src/components/select/select.component'
import { CustomDatePicker } from '@src/components/datePicker/datePicker.component'
import { colors } from '@src/helpers/colors.helpers'
import { useDispatch, useSelector } from '@src/store/hooks.store'
import { feeServices } from '@src/store/redux/dashboard/fee/fee.service'
import {
  createScholarshipAction,
  updateScholarshipAction,
} from '@src/store/redux/dashboard/fee/fee.config.slice'
import {
  DISCOUNT_CATEGORY_OPTIONS,
  DISCOUNT_TYPE_OPTIONS,
  IOption,
  isMoney,
} from '../../../fees.helpers'
import { useFeeReference } from '../../../hooks/useFeeReference.hooks'

interface Props {
  open: boolean
  onClose: () => void
  scholarship: Fee.IScholarship | null
  onSaved: () => void
}

export function ScholarshipFormModal({
  open,
  onClose,
  scholarship,
  onSaved,
}: Props) {
  const dispatch = useDispatch()
  const { years } = useFeeReference()
  const { loading } = useSelector(
    (store) => store.feeConfig.scholarshipMutation
  )

  const [feeTypes, setFeeTypes] = useState<Fee.IFeeType[]>([])
  const [form, setForm] = useState({
    name: '',
    code: '',
    description: '',
    discount_type: 'PERCENTAGE' as Fee.DiscountType,
    discount_value: '',
    discount_category: 'MERIT_SCHOLARSHIP' as Fee.DiscountCategory,
    calculation_priority: '10',
    applies_to_fee_type_id: null as number | null,
    maximum_discount_amount: '',
    minimum_fee_amount: '',
    academic_year_id: null as number | null,
    valid_from: moment().format('YYYY-MM-DD'),
    valid_until: '',
    maximum_beneficiaries: '',
    requires_approval: false,
    is_active: true,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!open) {
      return
    }

    if (!feeTypes.length) {
      feeServices
        .listFeeTypesService({ is_active: true }, 1, 200)
        .then((res) => setFeeTypes(res.rows))
        .catch(() => setFeeTypes([]))
    }

    setErrors({})

    if (scholarship) {
      setForm({
        name: scholarship.name,
        code: scholarship.code,
        description: scholarship.description ?? '',
        discount_type: scholarship.discount_type,
        discount_value: scholarship.discount_value,
        discount_category: scholarship.discount_category,
        calculation_priority: String(scholarship.calculation_priority),
        applies_to_fee_type_id: scholarship.applies_to_fee_type_id,
        maximum_discount_amount: scholarship.maximum_discount_amount ?? '',
        minimum_fee_amount: scholarship.minimum_fee_amount ?? '',
        academic_year_id: scholarship.academic_year_id,
        valid_from: String(scholarship.valid_from).slice(0, 10),
        valid_until: scholarship.valid_until
          ? String(scholarship.valid_until).slice(0, 10)
          : '',
        maximum_beneficiaries: scholarship.maximum_beneficiaries
          ? String(scholarship.maximum_beneficiaries)
          : '',
        requires_approval: scholarship.requires_approval,
        is_active: scholarship.is_active,
      })

      return
    }

    setForm((prev) => ({
      ...prev,
      name: '',
      code: '',
      description: '',
      discount_value: '',
      maximum_discount_amount: '',
      minimum_fee_amount: '',
      maximum_beneficiaries: '',
      valid_from: moment().format('YYYY-MM-DD'),
      valid_until: '',
    }))
  }, [open, scholarship])

  const feeTypeOptions: IOption[] = useMemo(
    () =>
      feeTypes.map((feeType) => ({
        value: String(feeType.id),
        label: `${feeType.name} (${feeType.code})`,
      })),
    [feeTypes]
  )

  const submit = () => {
    const next: Record<string, string> = {}

    if (form.name.trim().length < 2) {
      next.name = 'A name of at least 2 characters is required.'
    }
    if (form.code.trim().length < 2) {
      next.code = 'A code of at least 2 characters is required.'
    }
    if (!isMoney(form.discount_value)) {
      next.discount_value = 'Enter a positive value with 2 decimals.'
    }
    if (
      form.discount_type === 'PERCENTAGE' &&
      Number(form.discount_value) > 100
    ) {
      next.discount_value = 'A percentage can never exceed 100.'
    }
    if (
      form.maximum_discount_amount &&
      !isMoney(form.maximum_discount_amount)
    ) {
      next.maximum_discount_amount = 'Use a positive amount.'
    }
    if (form.minimum_fee_amount && !isMoney(form.minimum_fee_amount)) {
      next.minimum_fee_amount = 'Use a positive amount.'
    }
    if (!form.valid_from) {
      next.valid_from = 'A validity start date is required.'
    }

    setErrors(next)

    if (Object.keys(next).length) {
      return
    }

    const payload = {
      name: form.name.trim(),
      code: form.code.trim().toUpperCase(),
      description: form.description.trim() || null,
      discount_type: form.discount_type,
      discount_value: form.discount_value,
      discount_category: form.discount_category,
      calculation_priority: Number(form.calculation_priority || 10),
      applies_to_fee_type_id: form.applies_to_fee_type_id,
      maximum_discount_amount: form.maximum_discount_amount || null,
      minimum_fee_amount: form.minimum_fee_amount || null,
      academic_year_id: form.academic_year_id,
      valid_from: form.valid_from,
      valid_until: form.valid_until || null,
      maximum_beneficiaries: form.maximum_beneficiaries
        ? Number(form.maximum_beneficiaries)
        : null,
      requires_approval: form.requires_approval,
      is_active: form.is_active,
    }

    const onSuccess = () => {
      onSaved()
      onClose()
    }

    if (scholarship) {
      dispatch(
        updateScholarshipAction({
          scholarshipId: scholarship.id,
          payload,
          onSuccess,
        })
      )

      return
    }

    dispatch(createScholarshipAction({ payload, onSuccess }))
  }

  return (
    <SpringModal open={open} close={onClose} size="md">
      <Box sx={{ minWidth: { xs: 'auto', sm: 620 } }}>
        <Typography fontSize={16} fontWeight={700}>
          {scholarship
            ? 'Edit scholarship / discount'
            : 'New scholarship / discount'}
        </Typography>
        <Typography fontSize={12.5} color={colors.grey[500]} mt={0.25} mb={2}>
          Concessions are applied by the backend engine in the order of their
          calculation priority, then by the lowest amount produced.
        </Typography>

        <Stack spacing={1.5}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <InputField
              labelDetail={{ text: 'Name', required: true }}
              placeholder="e.g. Merit scholarship 2026"
              value={form.name}
              error={Boolean(errors.name)}
              helperText={errors.name}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, name: event.target.value }))
              }
            />
            <InputField
              labelDetail={{ text: 'Code', required: true }}
              placeholder="e.g. MERIT26"
              value={form.code}
              error={Boolean(errors.code)}
              helperText={errors.code}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  code: event.target.value.toUpperCase(),
                }))
              }
            />
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <Box flex={1}>
              <Typography fontSize={13} color={colors.grey[800]} mb={1}>
                Discount type *
              </Typography>
              <SelectField
                options={DISCOUNT_TYPE_OPTIONS}
                value={
                  DISCOUNT_TYPE_OPTIONS.find(
                    (option) => option.value === form.discount_type
                  ) ?? null
                }
                onChange={(option) =>
                  setForm((prev) => ({
                    ...prev,
                    discount_type: (option as IOption<Fee.DiscountType>).value,
                  }))
                }
              />
            </Box>
            <InputField
              labelDetail={{
                text:
                  form.discount_type === 'PERCENTAGE'
                    ? 'Value (%)'
                    : 'Value (amount)',
                required: true,
              }}
              placeholder={
                form.discount_type === 'PERCENTAGE' ? '10' : '500.00'
              }
              value={form.discount_value}
              error={Boolean(errors.discount_value)}
              helperText={errors.discount_value}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  discount_value: event.target.value,
                }))
              }
            />
            <InputField
              labelDetail={{ text: 'Priority', required: false }}
              placeholder="10"
              value={form.calculation_priority}
              helperText="Lower runs first."
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  calculation_priority: event.target.value.replace(
                    /[^0-9]/g,
                    ''
                  ),
                }))
              }
            />
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <Box flex={1}>
              <Typography fontSize={13} color={colors.grey[800]} mb={1}>
                Category
              </Typography>
              <SelectField
                options={DISCOUNT_CATEGORY_OPTIONS}
                value={
                  DISCOUNT_CATEGORY_OPTIONS.find(
                    (option) => option.value === form.discount_category
                  ) ?? null
                }
                onChange={(option) =>
                  setForm((prev) => ({
                    ...prev,
                    discount_category: (option as IOption<Fee.DiscountCategory>)
                      .value,
                  }))
                }
              />
            </Box>
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
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <InputField
              labelDetail={{ text: 'Maximum discount', required: false }}
              placeholder="Cap per invoice line"
              value={form.maximum_discount_amount}
              error={Boolean(errors.maximum_discount_amount)}
              helperText={errors.maximum_discount_amount}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  maximum_discount_amount: event.target.value,
                }))
              }
            />
            <InputField
              labelDetail={{ text: 'Minimum fee amount', required: false }}
              placeholder="Only above this amount"
              value={form.minimum_fee_amount}
              error={Boolean(errors.minimum_fee_amount)}
              helperText={errors.minimum_fee_amount}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  minimum_fee_amount: event.target.value,
                }))
              }
            />
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <Box flex={1}>
              <Typography fontSize={13} color={colors.grey[800]} mb={1}>
                Academic year
              </Typography>
              <SelectField
                isClearable
                placeholder="All years"
                options={years}
                value={
                  years.find(
                    (option) => option.value === String(form.academic_year_id)
                  ) ?? null
                }
                onChange={(option) =>
                  setForm((prev) => ({
                    ...prev,
                    academic_year_id: (option as IOption | null)?.value
                      ? Number((option as IOption).value)
                      : null,
                  }))
                }
              />
            </Box>
            <Box flex={1}>
              <CustomDatePicker
                labelDetail={{ text: 'Valid from *', required: true }}
                views={['day', 'month', 'year']}
                value={form.valid_from ? moment(form.valid_from) : null}
                onChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    valid_from:
                      value && moment(value).isValid()
                        ? moment(value).format('YYYY-MM-DD')
                        : '',
                  }))
                }
                slotProps={{ textField: { size: 'small' } }}
              />
              {errors.valid_from ? (
                <Typography fontSize={11.5} color="error" mt={0.5}>
                  {errors.valid_from}
                </Typography>
              ) : null}
            </Box>
            <Box flex={1}>
              <CustomDatePicker
                labelDetail={{ text: 'Valid until', required: false }}
                views={['day', 'month', 'year']}
                value={form.valid_until ? moment(form.valid_until) : null}
                onChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    valid_until:
                      value && moment(value).isValid()
                        ? moment(value).format('YYYY-MM-DD')
                        : '',
                  }))
                }
                slotProps={{ textField: { size: 'small' } }}
              />
            </Box>
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <InputField
              labelDetail={{ text: 'Maximum beneficiaries', required: false }}
              placeholder="Unlimited"
              value={form.maximum_beneficiaries}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  maximum_beneficiaries: event.target.value.replace(
                    /[^0-9]/g,
                    ''
                  ),
                }))
              }
            />
            <Box flex={1}>
              <FormControlLabel
                control={
                  <Switch
                    checked={form.requires_approval}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        requires_approval: event.target.checked,
                      }))
                    }
                  />
                }
                label={<Typography fontSize={13}>Requires approval</Typography>}
              />
            </Box>
            <Box flex={1}>
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

          <TextareaField
            variant="outlined"
            labelDetail={{ text: 'Description', required: false }}
            placeholder="Eligibility criteria, approval note…"
            minRows={2}
            value={form.description}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, description: event.target.value }))
            }
          />
        </Stack>

        <Stack direction="row" spacing={1} justifyContent="flex-end" mt={2.5}>
          <ButtonComp variant="outlined" color="error" onClick={onClose}>
            Cancel
          </ButtonComp>
          <ButtonComp loading={loading} onClick={submit}>
            {scholarship ? 'Save changes' : 'Create scholarship'}
          </ButtonComp>
        </Stack>
      </Box>
    </SpringModal>
  )
}
