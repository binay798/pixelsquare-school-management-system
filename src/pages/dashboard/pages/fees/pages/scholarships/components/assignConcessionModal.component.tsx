import { Box, Stack, Typography } from '@mui/material'
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
import { assignConcessionAction } from '@src/store/redux/dashboard/fee/fee.config.slice'
import { formatMoney, IOption } from '../../../fees.helpers'
import { previewDiscount } from '../../../fees.preview'
import {
  FeeStudentSelect,
  IStudentOption,
} from '../../../components/feeStudentSelect.component'
import { useFeeReference } from '../../../hooks/useFeeReference.hooks'

interface Props {
  open: boolean
  onClose: () => void
  onSaved: () => void
  scholarship: Fee.IScholarship | null
  scholarships: Fee.IScholarship[]
}

/** Attach a scholarship to a student (`POST /fees/concessions`). */
export function AssignConcessionModal({
  open,
  onClose,
  onSaved,
  scholarship,
  scholarships,
}: Props) {
  const dispatch = useDispatch()
  const { years } = useFeeReference()
  const { loading } = useSelector((store) => store.feeConfig.concessionMutation)

  const [student, setStudent] = useState<IStudentOption | null>(null)
  const [form, setForm] = useState({
    scholarship_discount_id: null as number | null,
    academic_year_id: null as number | null,
    valid_from: moment().format('YYYY-MM-DD'),
    valid_until: '',
    remarks: '',
  })
  const [baseAmount, setBaseAmount] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!open) {
      return
    }

    setErrors({})
    setStudent(null)
    setBaseAmount('')
    setForm({
      scholarship_discount_id: scholarship?.id ?? null,
      academic_year_id: scholarship?.academic_year_id ?? null,
      valid_from: moment().format('YYYY-MM-DD'),
      valid_until: '',
      remarks: '',
    })
  }, [open, scholarship])

  const options: IOption[] = useMemo(
    () =>
      scholarships.map((item) => ({
        value: String(item.id),
        label: `${item.name} · ${
          item.discount_type === 'PERCENTAGE'
            ? `${item.discount_value}%`
            : formatMoney(item.discount_value)
        }`,
      })),
    [scholarships]
  )

  const selected = scholarships.find(
    (item) => item.id === form.scholarship_discount_id
  )

  const preview = selected
    ? previewDiscount(baseAmount, {
        discount_type: selected.discount_type,
        discount_value: selected.discount_value,
        maximum_discount_amount: selected.maximum_discount_amount,
        minimum_fee_amount: selected.minimum_fee_amount,
      })
    : null

  const submit = () => {
    const next: Record<string, string> = {}

    if (!student) {
      next.student = 'Select a student.'
    }
    if (!form.scholarship_discount_id) {
      next.scholarship = 'Select a scholarship or discount.'
    }
    if (!form.academic_year_id) {
      next.academic_year_id = 'Select the academic year.'
    }

    setErrors(next)

    if (Object.keys(next).length || !student) {
      return
    }

    dispatch(
      assignConcessionAction({
        payload: {
          student_id: student.value,
          scholarship_discount_id: Number(form.scholarship_discount_id),
          academic_year_id: Number(form.academic_year_id),
          valid_from: form.valid_from,
          valid_until: form.valid_until || null,
          remarks: form.remarks.trim() || null,
        },
        onSuccess: () => {
          onSaved()
          onClose()
        },
      })
    )
  }

  return (
    <SpringModal open={open} close={onClose} size="sm">
      <Box sx={{ minWidth: { xs: 'auto', sm: 560 } }}>
        <Typography fontSize={16} fontWeight={700}>
          Assign scholarship / discount
        </Typography>
        <Typography
          fontSize={12.5}
          color={colors.grey[500]}
          mt={0.25}
          mb={1.75}
        >
          The concession is applied to every future invoice of the student
          inside its validity window. Rules requiring approval stay PENDING
          until a supervisor decides.
        </Typography>

        <Stack spacing={1.5}>
          <Box>
            <Typography fontSize={13} color={colors.grey[800]} mb={1}>
              Student *
            </Typography>
            <FeeStudentSelect value={student} onChange={setStudent} />
            {errors.student ? (
              <Typography fontSize={11.5} color="error" mt={0.5}>
                {errors.student}
              </Typography>
            ) : null}
          </Box>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <Box flex={1}>
              <Typography fontSize={13} color={colors.grey[800]} mb={1}>
                Scholarship / discount *
              </Typography>
              <SelectField
                placeholder="Select a rule"
                options={options}
                value={
                  options.find(
                    (option) =>
                      option.value === String(form.scholarship_discount_id)
                  ) ?? null
                }
                onChange={(option) =>
                  setForm((prev) => ({
                    ...prev,
                    scholarship_discount_id: (option as IOption | null)?.value
                      ? Number((option as IOption).value)
                      : null,
                  }))
                }
              />
              {errors.scholarship ? (
                <Typography fontSize={11.5} color="error" mt={0.5}>
                  {errors.scholarship}
                </Typography>
              ) : null}
            </Box>
            <Box flex={1}>
              <Typography fontSize={13} color={colors.grey[800]} mb={1}>
                Academic year *
              </Typography>
              <SelectField
                placeholder="Select year"
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
              {errors.academic_year_id ? (
                <Typography fontSize={11.5} color="error" mt={0.5}>
                  {errors.academic_year_id}
                </Typography>
              ) : null}
            </Box>
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <Box flex={1}>
              <CustomDatePicker
                labelDetail={{ text: 'Valid from', required: false }}
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

          <Box
            sx={{
              borderRadius: 2,
              border: `1px dashed ${colors.grey[300]}`,
              bgcolor: colors.grey[50],
              p: 1.25,
            }}
          >
            <Typography
              fontSize={12.5}
              fontWeight={600}
              color={colors.grey[800]}
            >
              Discount preview
            </Typography>
            <Typography fontSize={11.5} color={colors.grey[500]} mb={1}>
              Display only — the invoice preview endpoint recalculates every
              line with the real engine.
            </Typography>
            <InputField
              placeholder="Base tuition amount, e.g. 5000"
              value={baseAmount}
              onChange={(event) => setBaseAmount(event.target.value)}
            />
            {preview ? (
              <Stack spacing={0.35} mt={1}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography fontSize={12} color={colors.grey[600]}>
                    Original
                  </Typography>
                  <Typography fontSize={12} fontWeight={600}>
                    {formatMoney(baseAmount)}
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography fontSize={12} color={colors.grey[600]}>
                    Discount
                  </Typography>
                  <Typography
                    fontSize={12}
                    fontWeight={600}
                    color={colors.green[700]}
                  >
                    − {formatMoney(preview.applied)}
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography fontSize={12} color={colors.grey[600]}>
                    Final payable
                  </Typography>
                  <Typography
                    fontSize={13}
                    fontWeight={700}
                    color={colors.blue[700]}
                  >
                    {formatMoney(preview.final_amount)}
                  </Typography>
                </Stack>
                {preview.skipped ? (
                  <Typography fontSize={11} color={colors.orange[800]}>
                    {preview.reason}
                  </Typography>
                ) : null}
                {preview.capped ? (
                  <Typography fontSize={11} color={colors.orange[800]}>
                    Capped by the maximum discount of the rule.
                  </Typography>
                ) : null}
              </Stack>
            ) : null}
          </Box>

          <TextareaField
            variant="outlined"
            labelDetail={{ text: 'Remarks', required: false }}
            placeholder="Approval reference, supporting note…"
            minRows={2}
            value={form.remarks}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, remarks: event.target.value }))
            }
          />
        </Stack>

        <Stack direction="row" spacing={1} justifyContent="flex-end" mt={2.5}>
          <ButtonComp variant="outlined" color="error" onClick={onClose}>
            Cancel
          </ButtonComp>
          <ButtonComp loading={loading} onClick={submit}>
            Assign concession
          </ButtonComp>
        </Stack>
      </Box>
    </SpringModal>
  )
}
