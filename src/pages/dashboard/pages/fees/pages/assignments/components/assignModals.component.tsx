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
  bulkAssignAction,
  createAssignmentAction,
} from '@src/store/redux/dashboard/fee/fee.config.slice'
import { formatMoney, IOption, isMoney } from '../../../fees.helpers'
import {
  FeeStudentSelect,
  IStudentOption,
} from '../../../components/feeStudentSelect.component'
import { useFeeReference } from '../../../hooks/useFeeReference.hooks'

const useActiveTemplates = (open: boolean) => {
  const [templates, setTemplates] = useState<Fee.IFeeTemplate[]>([])

  useEffect(() => {
    if (!open || templates.length) {
      return
    }

    feeServices
      .listFeeTemplatesService({ status: 'ACTIVE' }, 1, 200)
      .then((res) => setTemplates(res.rows))
      .catch(() => setTemplates([]))
  }, [open, templates.length])

  return templates
}

interface SingleProps {
  open: boolean
  onClose: () => void
  onSaved: () => void
  studentId?: number | null
}

/** Assign one fee template to one student (`POST /fees/assignments`). */
export function AssignFeeModal({
  open,
  onClose,
  onSaved,
  studentId,
}: SingleProps) {
  const dispatch = useDispatch()
  const { years } = useFeeReference()
  const templates = useActiveTemplates(open)
  const { loading } = useSelector((store) => store.feeConfig.assignmentMutation)

  const [student, setStudent] = useState<IStudentOption | null>(null)
  const [form, setForm] = useState({
    academic_year_id: null as number | null,
    fee_template_id: null as number | null,
    assigned_amount: '',
    effective_from: moment().format('YYYY-MM-DD'),
    effective_to: '',
    is_exempt: false,
    notes: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!open) {
      return
    }

    setErrors({})
    setForm({
      academic_year_id: null,
      fee_template_id: null,
      assigned_amount: '',
      effective_from: moment().format('YYYY-MM-DD'),
      effective_to: '',
      is_exempt: false,
      notes: '',
    })
  }, [open])

  const templateOptions: IOption[] = useMemo(
    () =>
      templates.map((template) => ({
        value: String(template.id),
        label: `${template.name} · ${formatMoney(template.total_amount)}`,
      })),
    [templates]
  )

  const submit = () => {
    const next: Record<string, string> = {}

    if (!studentId && !student) {
      next.student = 'Select a student.'
    }
    if (!form.academic_year_id) {
      next.academic_year_id = 'Select the academic year.'
    }
    if (!form.fee_template_id) {
      next.fee_template_id = 'Select the fee template.'
    }
    if (form.assigned_amount && !isMoney(form.assigned_amount)) {
      next.assigned_amount = 'Use a positive amount with 2 decimals.'
    }

    setErrors(next)

    if (Object.keys(next).length) {
      return
    }

    dispatch(
      createAssignmentAction({
        payload: {
          student_id: Number(studentId ?? student?.value),
          academic_year_id: Number(form.academic_year_id),
          fee_template_id: form.fee_template_id,
          assigned_amount: form.assigned_amount || null,
          effective_from: form.effective_from,
          effective_to: form.effective_to || null,
          is_exempt: form.is_exempt,
          notes: form.notes.trim() || null,
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
      <Box sx={{ minWidth: { xs: 'auto', sm: 540 } }}>
        <Typography fontSize={16} fontWeight={700}>
          Assign fee template
        </Typography>
        <Typography
          fontSize={12.5}
          color={colors.grey[500]}
          mt={0.25}
          mb={1.75}
        >
          The backend refuses a second active assignment of the same template
          for the same student and year.
        </Typography>

        <Stack spacing={1.5}>
          {!studentId ? (
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
          ) : null}

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
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
            <Box flex={1}>
              <Typography fontSize={13} color={colors.grey[800]} mb={1}>
                Fee template *
              </Typography>
              <SelectField
                placeholder="Select template"
                options={templateOptions}
                value={
                  templateOptions.find(
                    (option) => option.value === String(form.fee_template_id)
                  ) ?? null
                }
                onChange={(option) => {
                  const value = (option as IOption | null)?.value
                  const template = templates.find(
                    (item) => String(item.id) === value
                  )
                  setForm((prev) => ({
                    ...prev,
                    fee_template_id: value ? Number(value) : null,
                    assigned_amount:
                      template?.total_amount ?? prev.assigned_amount,
                  }))
                }}
              />
              {errors.fee_template_id ? (
                <Typography fontSize={11.5} color="error" mt={0.5}>
                  {errors.fee_template_id}
                </Typography>
              ) : null}
            </Box>
          </Stack>

          <InputField
            labelDetail={{
              text: 'Assigned amount (optional)',
              required: false,
            }}
            placeholder="Defaults to the template total"
            value={form.assigned_amount}
            error={Boolean(errors.assigned_amount)}
            helperText={errors.assigned_amount}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                assigned_amount: event.target.value,
              }))
            }
          />

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <Box flex={1}>
              <CustomDatePicker
                labelDetail={{ text: 'Effective from', required: false }}
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
            </Box>
            <Box flex={1}>
              <CustomDatePicker
                labelDetail={{ text: 'Effective until', required: false }}
                views={['day', 'month', 'year']}
                value={form.effective_to ? moment(form.effective_to) : null}
                onChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    effective_to:
                      value && moment(value).isValid()
                        ? moment(value).format('YYYY-MM-DD')
                        : '',
                  }))
                }
                slotProps={{ textField: { size: 'small' } }}
              />
            </Box>
          </Stack>

          <FormControlLabel
            control={
              <Switch
                checked={form.is_exempt}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    is_exempt: event.target.checked,
                  }))
                }
              />
            }
            label={<Typography fontSize={13}>Exempt this student</Typography>}
          />

          <TextareaField
            variant="outlined"
            labelDetail={{ text: 'Notes', required: false }}
            placeholder="Reason, approval reference…"
            minRows={2}
            value={form.notes}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, notes: event.target.value }))
            }
          />
        </Stack>

        <Stack direction="row" spacing={1} justifyContent="flex-end" mt={2.5}>
          <ButtonComp variant="outlined" color="error" onClick={onClose}>
            Cancel
          </ButtonComp>
          <ButtonComp loading={loading} onClick={submit}>
            Assign
          </ButtonComp>
        </Stack>
      </Box>
    </SpringModal>
  )
}

interface BulkProps {
  open: boolean
  onClose: () => void
  onSaved: () => void
}

/**
 * Bulk assignment (`POST /fees/assignments/bulk`).
 *
 * The backend resolves the eligible students from the academic year / class /
 * section, skips the ones already assigned and reports the counters, so the UI
 * never has to send a student list.
 */
export function BulkAssignModal({ open, onClose, onSaved }: BulkProps) {
  const dispatch = useDispatch()
  const { years, classes, sectionsOf, ensureSections } = useFeeReference()
  const templates = useActiveTemplates(open)
  const { loading, result } = useSelector(
    (store) => store.feeConfig.bulkAssignment
  )

  const [form, setForm] = useState({
    academic_year_id: null as number | null,
    class_id: null as number | null,
    section_id: null as number | null,
    fee_template_id: null as number | null,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!open) {
      return
    }

    setErrors({})
    setForm({
      academic_year_id: null,
      class_id: null,
      section_id: null,
      fee_template_id: null,
    })
  }, [open])

  useEffect(() => {
    ensureSections(form.class_id)
  }, [form.class_id, ensureSections])

  const templateOptions: IOption[] = templates.map((template) => ({
    value: String(template.id),
    label: template.name,
  }))

  const sectionOptions: IOption[] = sectionsOf(form.class_id).map(
    (section) => ({
      value: String(section.id),
      label: section.name,
    })
  )

  const submit = () => {
    const next: Record<string, string> = {}

    if (!form.academic_year_id) {
      next.academic_year_id = 'Select the academic year.'
    }
    if (!form.fee_template_id) {
      next.fee_template_id = 'Select the fee template.'
    }

    setErrors(next)

    if (Object.keys(next).length) {
      return
    }

    dispatch(
      bulkAssignAction({
        payload: {
          academic_year_id: Number(form.academic_year_id),
          fee_template_id: Number(form.fee_template_id),
          class_id: form.class_id,
          section_id: form.section_id,
        },
        onSuccess: onSaved,
      })
    )
  }

  return (
    <SpringModal open={open} close={onClose} size="sm">
      <Box sx={{ minWidth: { xs: 'auto', sm: 520 } }}>
        <Typography fontSize={16} fontWeight={700}>
          Bulk assign a template
        </Typography>
        <Typography
          fontSize={12.5}
          color={colors.grey[500]}
          mt={0.25}
          mb={1.75}
        >
          Every active student of the selected academic year, class and section
          receives the template. Students already assigned are skipped.
        </Typography>

        <Stack spacing={1.5}>
          <Box>
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

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <Box flex={1}>
              <Typography fontSize={13} color={colors.grey[800]} mb={1}>
                Class
              </Typography>
              <SelectField
                isClearable
                placeholder="All classes"
                options={classes}
                value={
                  classes.find(
                    (option) => option.value === String(form.class_id)
                  ) ?? null
                }
                onChange={(option) =>
                  setForm((prev) => ({
                    ...prev,
                    class_id: (option as IOption | null)?.value
                      ? Number((option as IOption).value)
                      : null,
                    section_id: null,
                  }))
                }
              />
            </Box>
            <Box flex={1}>
              <Typography fontSize={13} color={colors.grey[800]} mb={1}>
                Section
              </Typography>
              <SelectField
                isClearable
                isDisabled={!form.class_id}
                placeholder="All sections"
                options={sectionOptions}
                value={
                  sectionOptions.find(
                    (option) => option.value === String(form.section_id)
                  ) ?? null
                }
                onChange={(option) =>
                  setForm((prev) => ({
                    ...prev,
                    section_id: (option as IOption | null)?.value
                      ? Number((option as IOption).value)
                      : null,
                  }))
                }
              />
            </Box>
          </Stack>

          <Box>
            <Typography fontSize={13} color={colors.grey[800]} mb={1}>
              Fee template *
            </Typography>
            <SelectField
              placeholder="Select template"
              options={templateOptions}
              value={
                templateOptions.find(
                  (option) => option.value === String(form.fee_template_id)
                ) ?? null
              }
              onChange={(option) =>
                setForm((prev) => ({
                  ...prev,
                  fee_template_id: (option as IOption | null)?.value
                    ? Number((option as IOption).value)
                    : null,
                }))
              }
            />
            {errors.fee_template_id ? (
              <Typography fontSize={11.5} color="error" mt={0.5}>
                {errors.fee_template_id}
              </Typography>
            ) : null}
          </Box>

          {result ? (
            <Box
              sx={{
                borderRadius: 2,
                border: `1px solid ${colors.green[200]}`,
                bgcolor: colors.green[50],
                p: 1.25,
              }}
            >
              <Typography fontSize={12.5} color={colors.green[900]}>
                {result.students} eligible · {result.created} assigned ·{' '}
                {result.skipped} already assigned
              </Typography>
            </Box>
          ) : null}
        </Stack>

        <Stack direction="row" spacing={1} justifyContent="flex-end" mt={2.5}>
          <ButtonComp variant="outlined" color="error" onClick={onClose}>
            Close
          </ButtonComp>
          <ButtonComp loading={loading} onClick={submit}>
            Assign to students
          </ButtonComp>
        </Stack>
      </Box>
    </SpringModal>
  )
}
