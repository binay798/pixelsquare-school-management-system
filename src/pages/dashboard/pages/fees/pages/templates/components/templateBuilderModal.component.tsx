import {
  Box,
  Divider,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import moment from 'moment'
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react'
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
import { getClassSectionList } from '@src/store/redux/dashboard/academics/classSections/sections.service'
import { feeServices } from '@src/store/redux/dashboard/fee/fee.service'
import {
  createFeeTemplateAction,
  updateFeeTemplateAction,
} from '@src/store/redux/dashboard/fee/fee.config.slice'
import {
  BILLING_FREQUENCY_LABEL,
  BILLING_FREQUENCY_OPTIONS,
  feeSelectPortalProps,
  formatMoney,
  fromMinor,
  IOption,
  isMoney,
  TEMPLATE_STATUS_OPTIONS,
  toMinor,
} from '../../../fees.helpers'

interface Props {
  open: boolean
  onClose: () => void
  templateId: number | null
  onSaved: () => void
}

interface IItemRow {
  key: string
  fee_type_id: number | null
  amount: string
  quantity: string
  billing_frequency: Fee.BillingFrequency
  is_optional: boolean
}

interface IFormState {
  name: string
  code: string
  description: string
  academic_year_id: number | null
  class_id: number | null
  section_id: number | null
  effective_from: string
  effective_to: string
  status: Fee.TemplateStatus
}

const emptyForm: IFormState = {
  name: '',
  code: '',
  description: '',
  academic_year_id: null,
  class_id: null,
  section_id: null,
  effective_from: moment().format('YYYY-MM-DD'),
  effective_to: '',
  status: 'ACTIVE',
}

const newRow = (): IItemRow => ({
  key: `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
  fee_type_id: null,
  amount: '',
  quantity: '1',
  billing_frequency: 'ANNUAL',
  is_optional: false,
})

/**
 * Fee template builder (`POST /fees/templates`, `PATCH /fees/templates/:id`).
 *
 * The total shown here is a preview only: the backend recalculates and stores
 * `total_amount` from the persisted items.
 */
export function TemplateBuilderModal({
  open,
  onClose,
  templateId,
  onSaved,
}: Props) {
  const dispatch = useDispatch()
  const { data: academicYears } = useSelector(
    (store) => store.academicYear.academicYearList
  )
  const { data: classList } = useSelector((store) => store.classes.getClassList)
  const { loading: saving } = useSelector(
    (store) => store.feeConfig.templateMutation
  )

  const [form, setForm] = useState<IFormState>(emptyForm)
  const [items, setItems] = useState<IItemRow[]>([newRow()])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [feeTypes, setFeeTypes] = useState<Fee.IFeeType[]>([])
  const [sections, setSections] = useState<Academics.IClassSection[]>([])

  /* --------------------------- reference data --------------------------- */

  useEffect(() => {
    if (!open || feeTypes.length) {
      return
    }

    feeServices
      .listFeeTypesService({ is_active: true }, 1, 200)
      .then((res) => setFeeTypes(res.rows))
      .catch(() => setFeeTypes([]))
  }, [open, feeTypes.length])

  useEffect(() => {
    if (!form.class_id) {
      setSections([])

      return
    }

    getClassSectionList(form.class_id)
      .then((res) => setSections(res.data.map((row) => row.section_details)))
      .catch(() => setSections([]))
  }, [form.class_id])

  /* ------------------------------ detail ------------------------------- */

  useEffect(() => {
    if (!open) {
      return
    }

    setErrors({})
    setSections([])

    if (!templateId) {
      setForm({
        ...emptyForm,
        academic_year_id:
          academicYears?.find((year) => year.is_active)?.id ?? null,
      })
      setItems([newRow()])

      return
    }

    feeServices
      .getFeeTemplateService(templateId)
      .then((detail) => {
        setForm({
          name: detail.name,
          code: detail.code,
          description: detail.description ?? '',
          academic_year_id: detail.academic_year_id,
          class_id: detail.class_id,
          section_id: detail.section_id,
          effective_from: String(detail.effective_from).slice(0, 10),
          effective_to: detail.effective_to
            ? String(detail.effective_to).slice(0, 10)
            : '',
          status: detail.status,
        })
        setItems(
          detail.items.map((item) => ({
            key: `item-${item.id}`,
            fee_type_id: item.fee_type_id,
            amount: item.amount,
            quantity: String(item.quantity ?? 1),
            billing_frequency: item.billing_frequency,
            is_optional: item.is_optional,
          }))
        )
      })
      .catch(() => undefined)
  }, [open, templateId])

  /* ------------------------------- helpers ------------------------------ */

  const yearOptions = useMemo(
    () =>
      (academicYears ?? []).map((year) => ({
        value: String(year.id),
        label: `${year.name}${year.is_active ? ' (active)' : ''}`,
      })),
    [academicYears]
  )

  const classOptions: IOption[] = useMemo(
    () =>
      (classList?.rows ?? []).map((row) => ({
        value: String(row.class_details.id),
        label: row.class_details.name,
      })),
    [classList]
  )

  const sectionOptions: IOption[] = useMemo(
    () =>
      sections.map((section) => ({
        value: String(section.id),
        label: section.name,
      })),
    [sections]
  )

  const feeTypeOptions: IOption[] = useMemo(
    () =>
      feeTypes.map((feeType) => ({
        value: String(feeType.id),
        label: `${feeType.name} (${feeType.code})`,
      })),
    [feeTypes]
  )

  const total = useMemo(() => {
    const totalMinor = items.reduce((sum, item) => {
      const quantity = Number(item.quantity || 1)
      const safeQuantity =
        Number.isFinite(quantity) && quantity > 0 ? quantity : 1

      return sum + Math.round(toMinor(item.amount) * safeQuantity)
    }, 0)

    return fromMinor(totalMinor)
  }, [items])

  const set = <K extends keyof IFormState>(key: K, value: IFormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const patchItem = (key: string, patch: Partial<IItemRow>) =>
    setItems((prev) =>
      prev.map((item) => (item.key === key ? { ...item, ...patch } : item))
    )

  const moveItem = (index: number, direction: -1 | 1) =>
    setItems((prev) => {
      const next = [...prev]
      const target = index + direction

      if (target < 0 || target >= next.length) {
        return prev
      }

      const [moved] = next.splice(index, 1)
      next.splice(target, 0, moved)

      return next
    })

  const validate = () => {
    const next: Record<string, string> = {}

    if (form.name.trim().length < 2) {
      next.name = 'A template name of at least 2 characters is required.'
    }
    if (form.code.trim().length < 2) {
      next.code = 'A template code of at least 2 characters is required.'
    }
    if (!form.academic_year_id) {
      next.academic_year_id = 'Select the academic year of the template.'
    }
    if (!form.effective_from) {
      next.effective_from = 'An effective date is required.'
    }
    if (!items.length) {
      next.items = 'Add at least one fee component.'
    }

    items.forEach((item, index) => {
      if (!item.fee_type_id) {
        next[`item-${index}`] = 'Select a fee component.'
      } else if (!isMoney(item.amount)) {
        next[`item-${index}`] = 'Enter a positive amount (max 2 decimals).'
      }
    })

    setErrors(next)

    return Object.keys(next).length === 0
  }

  const submit = () => {
    if (!validate() || !form.academic_year_id) {
      return
    }

    const payload = {
      name: form.name.trim(),
      code: form.code.trim().toUpperCase(),
      description: form.description.trim() || null,
      academic_year_id: form.academic_year_id,
      class_id: form.class_id,
      section_id: form.section_id,
      effective_from: form.effective_from,
      effective_to: form.effective_to || null,
      status: form.status,
      items: items.map((item, index) => ({
        fee_type_id: Number(item.fee_type_id),
        amount: item.amount,
        quantity: item.quantity || '1',
        billing_frequency: item.billing_frequency,
        is_optional: item.is_optional,
        sort_order: index,
      })),
    }

    const onSuccess = () => {
      onSaved()
      onClose()
    }

    if (templateId) {
      dispatch(updateFeeTemplateAction({ templateId, payload, onSuccess }))

      return
    }

    dispatch(createFeeTemplateAction({ payload, onSuccess }))
  }

  return (
    <SpringModal open={open} close={onClose} size="lg">
      <Box sx={{ minWidth: { xs: 'auto', md: 780 } }}>
        <Typography fontSize={17} fontWeight={700} color={colors.grey[900]}>
          {templateId ? 'Edit fee template' : 'New fee template'}
        </Typography>
        <Typography fontSize={12.5} color={colors.grey[500]} mt={0.25} mb={2}>
          A template groups the fee components billed together for a class and
          an academic year. The backend recalculates the total from the items.
        </Typography>

        <Stack spacing={1.5}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <InputField
              labelDetail={{ text: 'Template name', required: true }}
              placeholder="e.g. Grade 10 Science"
              value={form.name}
              error={Boolean(errors.name)}
              helperText={errors.name}
              onChange={(event) => set('name', event.target.value)}
            />
            <InputField
              labelDetail={{ text: 'Template code', required: true }}
              placeholder="e.g. G10-SCI"
              value={form.code}
              error={Boolean(errors.code)}
              helperText={errors.code}
              onChange={(event) =>
                set('code', event.target.value.toUpperCase())
              }
            />
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <Box flex={1}>
              <Typography fontSize={13} color={colors.grey[800]} mb={1}>
                Academic year *
              </Typography>
              <SelectField
                {...feeSelectPortalProps}
                placeholder="Select academic year"
                options={yearOptions}
                value={
                  yearOptions.find(
                    (option) => option.value === String(form.academic_year_id)
                  ) ?? null
                }
                onChange={(option) => {
                  set(
                    'academic_year_id',
                    option ? Number((option as IOption).value) : null
                  )
                  setErrors((prev) => ({ ...prev, academic_year_id: '' }))
                }}
              />
              {errors.academic_year_id ? (
                <Typography fontSize={11.5} color="error" mt={0.5}>
                  {errors.academic_year_id}
                </Typography>
              ) : null}
            </Box>
            <Box flex={1}>
              <Typography fontSize={13} color={colors.grey[800]} mb={1}>
                Class (optional)
              </Typography>
              <SelectField
                {...feeSelectPortalProps}
                isClearable
                placeholder="All classes"
                options={classOptions}
                value={
                  classOptions.find(
                    (option) => option.value === String(form.class_id)
                  ) ?? null
                }
                onChange={(option) => {
                  const value = (option as IOption | null)?.value
                  setForm((prev) => ({
                    ...prev,
                    class_id: value ? Number(value) : null,
                    section_id: null,
                  }))
                }}
              />
            </Box>
            <Box flex={1}>
              <Typography fontSize={13} color={colors.grey[800]} mb={1}>
                Section (optional)
              </Typography>
              <SelectField
                {...feeSelectPortalProps}
                isClearable
                isDisabled={!form.class_id}
                placeholder="All sections"
                options={sectionOptions}
                value={
                  sectionOptions.find(
                    (option) => option.value === String(form.section_id)
                  ) ?? null
                }
                onChange={(option) => {
                  const value = (option as IOption | null)?.value
                  set('section_id', value ? Number(value) : null)
                }}
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
                  set(
                    'effective_from',
                    value && moment(value).isValid()
                      ? moment(value).format('YYYY-MM-DD')
                      : ''
                  )
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
                value={form.effective_to ? moment(form.effective_to) : null}
                onChange={(value) =>
                  set(
                    'effective_to',
                    value && moment(value).isValid()
                      ? moment(value).format('YYYY-MM-DD')
                      : ''
                  )
                }
                slotProps={{ textField: { size: 'small' } }}
              />
            </Box>
            <Box flex={1}>
              <Typography fontSize={13} color={colors.grey[800]} mb={1}>
                Status
              </Typography>
              <SelectField
                {...feeSelectPortalProps}
                options={TEMPLATE_STATUS_OPTIONS}
                value={
                  TEMPLATE_STATUS_OPTIONS.find(
                    (option) => option.value === form.status
                  ) ?? null
                }
                onChange={(option) =>
                  set('status', (option as IOption<Fee.TemplateStatus>).value)
                }
              />
            </Box>
          </Stack>

          <TextareaField
            variant="outlined"
            labelDetail={{ text: 'Description', required: false }}
            placeholder="Internal note about this template"
            minRows={2}
            value={form.description}
            onChange={(event) => set('description', event.target.value)}
          />

          <Divider />

          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Box>
              <Typography
                fontSize={14}
                fontWeight={700}
                color={colors.grey[900]}
              >
                Fee components
              </Typography>
              <Typography fontSize={11.5} color={colors.grey[500]}>
                Reorder with the arrows; optional items are only billed when
                they are explicitly selected on the invoice.
              </Typography>
            </Box>
            <ButtonComp
              size="small"
              variant="outlined"
              startIcon={<Plus size={13} />}
              onClick={() => setItems((prev) => [...prev, newRow()])}
            >
              Add component
            </ButtonComp>
          </Stack>

          {errors.items ? (
            <Typography fontSize={12} color="error">
              {errors.items}
            </Typography>
          ) : null}

          {items.map((item, index) => (
            <Box
              key={item.key}
              sx={{
                border: `1px solid ${
                  errors[`item-${index}`] ? colors.red[300] : colors.grey[200]
                }`,
                borderRadius: 2,
                p: 1.25,
                bgcolor: colors.grey[50],
              }}
            >
              <Box
                sx={{
                  display: 'grid',
                  gap: 1,
                  alignItems: 'center',
                  gridTemplateColumns: {
                    xs: '1fr',
                    md: '1.8fr 1fr 0.7fr 1fr auto',
                  },
                }}
              >
                <SelectField
                  {...feeSelectPortalProps}
                  placeholder="Fee component"
                  options={feeTypeOptions}
                  value={
                    feeTypeOptions.find(
                      (option) => option.value === String(item.fee_type_id)
                    ) ?? null
                  }
                  onChange={(option) =>
                    patchItem(item.key, {
                      fee_type_id: option
                        ? Number((option as IOption).value)
                        : null,
                    })
                  }
                />
                <InputField
                  placeholder="Amount"
                  value={item.amount}
                  onChange={(event) =>
                    patchItem(item.key, { amount: event.target.value })
                  }
                />
                <InputField
                  placeholder="Qty"
                  value={item.quantity}
                  onChange={(event) =>
                    patchItem(item.key, { quantity: event.target.value })
                  }
                />
                <SelectField
                  {...feeSelectPortalProps}
                  options={BILLING_FREQUENCY_OPTIONS}
                  value={
                    BILLING_FREQUENCY_OPTIONS.find(
                      (option) => option.value === item.billing_frequency
                    ) ?? null
                  }
                  onChange={(option) =>
                    patchItem(item.key, {
                      billing_frequency: (
                        option as IOption<Fee.BillingFrequency>
                      ).value,
                    })
                  }
                />
                <Stack direction="row" spacing={0} alignItems="center">
                  <Tooltip
                    title={
                      item.is_optional ? 'Optional item' : 'Mandatory item'
                    }
                  >
                    <ButtonComp
                      size="small"
                      variant={item.is_optional ? 'outlined' : 'text'}
                      onClick={() =>
                        patchItem(item.key, {
                          is_optional: !item.is_optional,
                        })
                      }
                      sx={{ minWidth: 0, px: 0.75 }}
                    >
                      <Typography fontSize={11}>
                        {item.is_optional ? 'Optional' : 'Required'}
                      </Typography>
                    </ButtonComp>
                  </Tooltip>
                  <Tooltip title="Move up">
                    <span>
                      <IconButton
                        size="small"
                        disabled={index === 0}
                        onClick={() => moveItem(index, -1)}
                      >
                        <ArrowUp size={13} />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title="Move down">
                    <span>
                      <IconButton
                        size="small"
                        disabled={index === items.length - 1}
                        onClick={() => moveItem(index, 1)}
                      >
                        <ArrowDown size={13} />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title="Remove">
                    <span>
                      <IconButton
                        size="small"
                        color="error"
                        disabled={items.length === 1}
                        onClick={() =>
                          setItems((prev) =>
                            prev.filter((row) => row.key !== item.key)
                          )
                        }
                      >
                        <Trash2 size={13} />
                      </IconButton>
                    </span>
                  </Tooltip>
                </Stack>
              </Box>

              {errors[`item-${index}`] ? (
                <Typography fontSize={11.5} color="error" mt={0.5}>
                  {errors[`item-${index}`]}
                </Typography>
              ) : (
                <Typography fontSize={11} color={colors.grey[500]} mt={0.4}>
                  {BILLING_FREQUENCY_LABEL[item.billing_frequency]} ·{' '}
                  {formatMoney(item.amount)} × {item.quantity || '1'}
                </Typography>
              )}
            </Box>
          ))}

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              gap: 1,
              p: 1.25,
              borderRadius: 2,
              bgcolor: colors.blue[50],
            }}
          >
            <Typography fontSize={13} color={colors.grey[700]}>
              Template total
            </Typography>
            <Typography fontSize={18} fontWeight={700} color={colors.blue[800]}>
              {formatMoney(total)}
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={1} justifyContent="flex-end" mt={2.5}>
          <ButtonComp variant="outlined" color="error" onClick={onClose}>
            Cancel
          </ButtonComp>
          <ButtonComp loading={saving} onClick={submit}>
            {templateId ? 'Save template' : 'Create template'}
          </ButtonComp>
        </Stack>
      </Box>
    </SpringModal>
  )
}
