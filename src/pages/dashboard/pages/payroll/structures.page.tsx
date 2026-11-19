import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  Stack,
  Typography,
} from '@mui/material'
import moment from 'moment'
import { useEffect, useState } from 'react'
import { Trash2 } from 'lucide-react'
import { ButtonComp } from '@src/components/button/button.component'
import { CustomDatePicker } from '@src/components/datePicker/datePicker.component'
import { InputField } from '@src/components/input/input.component'
import { SelectField } from '@src/components/select/select.component'
import { colors } from '@src/helpers/colors.helpers'
import { useDispatch, useSelector } from '@src/store/hooks.store'
import {
  activateStructureAction,
  createStructureAction,
  deactivateStructureAction,
  getComponentsAction,
  getStructureDetailAction,
  getStructuresAction,
  updateStructureAction,
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
  EMPLOYMENT_TYPE_OPTIONS,
  PAYROLL_BASE_PATH,
  formatDate,
  todayIso,
} from './payroll.helpers'
import type { IOption } from './payroll.helpers'

type TStructureComponent = {
  component_id: number | null
  amount_override: string
  percentage_override: string
  is_mandatory: boolean
}

const emptyComponent: TStructureComponent = {
  component_id: null,
  amount_override: '',
  percentage_override: '',
  is_mandatory: true,
}

/** Salary structures: a named bundle of components assigned to employees. */
export function PayrollStructuresPage() {
  const dispatch = useDispatch()
  const permissions = usePayrollPermissions()

  const { data, loading } = useSelector((store) => store.payroll.structures)
  const { data: components } = useSelector(
    (store) => store.payroll.salaryComponents
  )

  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [editing, setEditing] = useState<{
    id: number
    code: string
    assignmentCount: number
  } | null>(null)
  const [statusConfirm, setStatusConfirm] = useState<{
    structure: Payroll.IStructure
    next: Payroll.StructureStatus
  } | null>(null)
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [employmentType, setEmploymentType] = useState<
    Payroll.EmploymentType | undefined
  >()
  const [grade, setGrade] = useState('')
  const [currency, setCurrency] = useState('NPR')
  const [effectiveFrom, setEffectiveFrom] = useState(todayIso())
  const [effectiveTo, setEffectiveTo] = useState('')
  const [rows, setRows] = useState<TStructureComponent[]>([
    { ...emptyComponent },
  ])
  const [formError, setFormError] = useState('')

  useEffect(() => {
    dispatch(getStructuresAction())
    dispatch(getComponentsAction({ is_active: true }))
  }, [dispatch])

  const componentOptions: IOption<string>[] = (components ?? []).map(
    (component) => ({
      value: String(component.id),
      label: `${component.code} · ${component.name}`,
    })
  )

  const openCreate = () => {
    setEditing(null)
    setCode('')
    setName('')
    setEmploymentType(undefined)
    setGrade('')
    setCurrency('NPR')
    setEffectiveFrom(todayIso())
    setEffectiveTo('')
    setRows([{ ...emptyComponent }])
    setFormError('')
    setOpen(true)
  }

  /**
   * Edit loads the detail (the list only carries counts): the component rows are
   * rebuilt from the stored overrides so a save never silently drops a component.
   */
  const openEdit = async (structure: Payroll.IStructure) => {
    try {
      setBusy(true)
      const detail = await dispatch(
        getStructureDetailAction(structure.id)
      ).unwrap()

      setEditing({
        id: detail.id,
        code: detail.code,
        assignmentCount: Number(
          detail.assignment_count ?? structure.assignment_count ?? 0
        ),
      })
      setCode(detail.code)
      setName(detail.name)
      setEmploymentType(detail.employment_type ?? undefined)
      setGrade(detail.grade ?? '')
      setCurrency(detail.currency ?? 'NPR')
      setEffectiveFrom(
        detail.effective_from
          ? moment(detail.effective_from).format('YYYY-MM-DD')
          : todayIso()
      )
      setEffectiveTo(
        detail.effective_to
          ? moment(detail.effective_to).format('YYYY-MM-DD')
          : ''
      )
      setRows(
        detail.components.length
          ? detail.components.map((component) => ({
              component_id: component.component_id,
              amount_override: component.amount_override ?? '',
              percentage_override: component.percentage_override ?? '',
              is_mandatory: component.is_mandatory,
            }))
          : [{ ...emptyComponent }]
      )
      setFormError('')
      setOpen(true)
    } catch {
      /* toast raised by the slice */
    } finally {
      setBusy(false)
    }
  }

  /**
   * The engine pays basic salary, prorates it and resolves every
   * `PERCENT_OF_BASIC` component from the component coded `BASIC`. A structure
   * without it raises `MISSING_BASIC_COMPONENT` on every employee of the run, so
   * the dialog refuses the save instead of letting the blocker surface later.
   */
  const save = async () => {
    const selectedComponents = rows.filter((row) => row.component_id)
    const basicComponent = (components ?? []).find(
      (component) => component.code === 'BASIC'
    )
    const hasBasic = Boolean(
      basicComponent &&
        selectedComponents.some(
          (row) => Number(row.component_id) === basicComponent.id
        )
    )

    if (!hasBasic) {
      setFormError(
        'A structure must include the BASIC earning component: the basic pay, the proration base and every percentage-of-basic amount are derived from it. Without it every payroll run of the assigned employees is blocked.'
      )
      return
    }

    setFormError('')

    try {
      setBusy(true)
      const payload = {
        name,
        employment_type: employmentType,
        grade: grade || null,
        currency,
        effective_from: effectiveFrom,
        effective_to: effectiveTo || null,
        components: rows
          .filter((row) => row.component_id)
          .map((row) => ({
            component_id: Number(row.component_id),
            amount_override: row.amount_override || null,
            percentage_override: row.percentage_override || null,
            is_mandatory: row.is_mandatory,
          })),
      }

      if (editing) {
        await dispatch(
          updateStructureAction({ structureId: editing.id, changes: payload })
        ).unwrap()
      } else {
        await dispatch(createStructureAction({ code, ...payload })).unwrap()
      }

      await dispatch(getStructuresAction())
      setOpen(false)
    } catch {
      /* toast raised by the slice */
    } finally {
      setBusy(false)
    }
  }

  const changeStatus = async () => {
    if (!statusConfirm) {
      return
    }

    try {
      setBusy(true)
      if (statusConfirm.next === 'ACTIVE') {
        await dispatch(
          activateStructureAction(statusConfirm.structure.id)
        ).unwrap()
      } else {
        await dispatch(
          deactivateStructureAction(statusConfirm.structure.id)
        ).unwrap()
      }
      await dispatch(getStructuresAction())
      setStatusConfirm(null)
    } catch {
      /* toast raised by the slice */
    } finally {
      setBusy(false)
    }
  }

  const updateRow = (index: number, patch: Partial<TStructureComponent>) =>
    setRows(
      rows.map((row, rowIndex) =>
        rowIndex === index ? { ...row, ...patch } : row
      )
    )

  const columns: IFeeColumn<Payroll.IStructure>[] = [
    {
      key: 'structure',
      label: 'Structure',
      render: (row) => (
        <FeeCellStack
          primary={`${row.code} · ${row.name}`}
          secondary={`${row.currency}${
            row.grade ? ` · grade ${row.grade}` : ''
          } · effective ${formatDate(row.effective_from)}`}
        />
      ),
    },
    {
      key: 'employment',
      label: 'Employment',
      hideBelow: 'md',
      render: (row) => (
        <Typography fontSize={12.5} color={colors.grey[700]}>
          {row.employment_type ?? 'All'}
        </Typography>
      ),
    },
    {
      key: 'components',
      label: 'Components',
      align: 'right',
      render: (row) => (
        <Typography fontSize={12.5}>{row.component_count}</Typography>
      ),
    },
    {
      key: 'assignments',
      label: 'Assigned',
      align: 'right',
      hideBelow: 'md',
      render: (row) => (
        <Typography fontSize={12.5}>{row.assignment_count}</Typography>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <Typography
          fontSize={12.5}
          fontWeight={600}
          color={row.status === 'ACTIVE' ? colors.green[700] : colors.grey[500]}
        >
          {row.status}
        </Typography>
      ),
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (row) =>
        permissions.canManageStructures ? (
          <Stack
            direction="row"
            spacing={0.5}
            justifyContent="flex-end"
            flexWrap="wrap"
            useFlexGap
          >
            <Button
              size="small"
              disabled={busy}
              onClick={() => void openEdit(row)}
            >
              Edit
            </Button>
            {row.status === 'ACTIVE' ? (
              <Button
                size="small"
                color="error"
                disabled={busy}
                onClick={() =>
                  setStatusConfirm({ structure: row, next: 'INACTIVE' })
                }
              >
                Deactivate
              </Button>
            ) : (
              <Button
                size="small"
                color="success"
                disabled={busy}
                onClick={() =>
                  setStatusConfirm({ structure: row, next: 'ACTIVE' })
                }
              >
                Activate
              </Button>
            )}
          </Stack>
        ) : null,
    },
  ]
  return (
    <Box>
      <FeePageHeader
        title="Salary structures"
        subtitle="A structure is the list of components an employee receives; the assignment gives it the base amount."
        backTo={PAYROLL_BASE_PATH}
        backLabel="Payroll"
        actions={
          permissions.canManageStructures ? (
            <ButtonComp size="small" variant="contained" onClick={openCreate}>
              New structure
            </ButtonComp>
          ) : null
        }
      />

      <FeePanel
        noPadding
        title="Structures"
        subtitle="The seeded DEFAULT structure is the fallback when an employee has no specific structure."
      >
        <FeeDataTable
          columns={columns}
          rows={data ?? []}
          rowKey={(row) => row.id}
          loading={loading}
          skeletonRows={6}
          emptyTitle="No structure"
          emptyDescription="Run the payroll seed or create the first structure."
        />
      </FeePanel>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          {editing ? `Edit ${editing.code}` : 'New salary structure'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={1.5} pt={1}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              <InputField
                labelDetail={{ text: 'Code', required: true }}
                placeholder="TEACHING_STAFF"
                value={code}
                disabled={Boolean(editing)}
                onChange={(event) => setCode(event.target.value.toUpperCase())}
              />
              <InputField
                labelDetail={{ text: 'Name', required: true }}
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              <Box sx={{ flex: 1 }}>
                <Typography fontSize={13} mb={0.75} width={300}>
                  Employment type (optional)
                </Typography>
                <SelectField
                  isClearable
                  placeholder="All employees"
                  options={EMPLOYMENT_TYPE_OPTIONS}
                  value={
                    EMPLOYMENT_TYPE_OPTIONS.find(
                      (option) => option.value === employmentType
                    ) ?? null
                  }
                  onChange={(option) => {
                    const value = (
                      option as IOption<Payroll.EmploymentType> | null
                    )?.value
                    setEmploymentType(value ?? undefined)
                  }}
                />
              </Box>
              <InputField
                labelDetail={{ text: 'Grade (optional)', required: false }}
                value={grade}
                onChange={(event) => setGrade(event.target.value)}
              />
              <InputField
                labelDetail={{ text: 'Currency', required: false }}
                value={currency}
                onChange={(event) =>
                  setCurrency(event.target.value.toUpperCase())
                }
              />
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              <Box sx={{ flex: 1 }}>
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
              </Box>
              <Box sx={{ flex: 1 }}>
                <CustomDatePicker
                  format="YYYY-MM-DD"
                  labelDetail={{
                    text: 'Effective to (optional)',
                    required: false,
                  }}
                  views={['day', 'month', 'year']}
                  value={effectiveTo ? moment(effectiveTo) : null}
                  onChange={(value) =>
                    setEffectiveTo(
                      value && moment(value).isValid()
                        ? moment(value).format('YYYY-MM-DD')
                        : ''
                    )
                  }
                  slotProps={{ textField: { size: 'small' } }}
                />
                {effectiveTo ? (
                  <Button size="small" onClick={() => setEffectiveTo('')}>
                    Clear end date
                  </Button>
                ) : null}
              </Box>
            </Stack>

            {editing && editing.assignmentCount > 0 ? (
              <Typography fontSize={12} color={colors.grey[700]}>
                {editing.assignmentCount} employee(s) are currently assigned to
                this structure. Component changes apply from the next
                calculation; already approved runs keep their snapshot.
              </Typography>
            ) : null}

            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography fontSize={13} fontWeight={600}>
                Components
              </Typography>
              <Button
                size="small"
                onClick={() => setRows([...rows, { ...emptyComponent }])}
              >
                Add component
              </Button>
            </Stack>

            <Stack spacing={1}>
              {rows.map((row, index) => (
                <Stack
                  key={index}
                  direction={{ xs: 'column', md: 'row' }}
                  spacing={1}
                  alignItems={{ xs: 'stretch', md: 'flex-end' }}
                  sx={{
                    p: 1.25,
                    borderRadius: 2,
                    border: `1px solid ${colors.grey[200]}`,
                  }}
                >
                  <Box sx={{ flex: 2 }}>
                    <Typography fontSize={12} mb={0.5}>
                      Component
                    </Typography>
                    <SelectField
                      placeholder="Select a component"
                      options={componentOptions}
                      value={
                        componentOptions.find(
                          (option) => option.value === String(row.component_id)
                        ) ?? null
                      }
                      onChange={(option) => {
                        const value = (option as IOption<string> | null)?.value
                        updateRow(index, {
                          component_id: value ? Number(value) : null,
                        })
                      }}
                    />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <InputField
                      labelDetail={{ text: 'Amount override', required: false }}
                      value={row.amount_override}
                      onChange={(event) =>
                        updateRow(index, {
                          amount_override: event.target.value,
                        })
                      }
                    />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <InputField
                      labelDetail={{ text: '% override', required: false }}
                      value={row.percentage_override}
                      onChange={(event) =>
                        updateRow(index, {
                          percentage_override: event.target.value,
                        })
                      }
                    />
                  </Box>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={row.is_mandatory}
                        onChange={(event) =>
                          updateRow(index, {
                            is_mandatory: event.target.checked,
                          })
                        }
                      />
                    }
                    label="Mandatory"
                  />
                  <IconButton
                    size="small"
                    disabled={rows.length === 1}
                    onClick={() =>
                      setRows(rows.filter((_, rowIndex) => rowIndex !== index))
                    }
                  >
                    <Trash2 size={15} />
                  </IconButton>
                </Stack>
              ))}
            </Stack>

            {formError ? (
              <Typography fontSize={12} color="error">
                {formError}
              </Typography>
            ) : null}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            disabled={busy || !code || !name}
            onClick={save}
          >
            {editing ? 'Save changes' : 'Create structure'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(statusConfirm)}
        onClose={() => (busy ? undefined : setStatusConfirm(null))}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          {statusConfirm?.next === 'ACTIVE' ? 'Activate' : 'Deactivate'}{' '}
          {statusConfirm?.structure.code}?
        </DialogTitle>
        <DialogContent>
          <Typography fontSize={13.5} color={colors.grey[700]}>
            {statusConfirm?.next === 'ACTIVE'
              ? 'An active structure can be assigned to employees and is used by the next calculation. If its end date is already in the past, extend it first.'
              : 'A deactivated structure can no longer be assigned. It can only be deactivated when no employee is assigned to it, because a run pays from the assignment.'}
          </Typography>
          {statusConfirm?.next === 'INACTIVE' &&
          Number(statusConfirm.structure.assignment_count) > 0 ? (
            <Typography fontSize={13} color="error" mt={1.5}>
              {statusConfirm.structure.assignment_count} employee(s) are still
              assigned to it.
            </Typography>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusConfirm(null)} disabled={busy}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color={statusConfirm?.next === 'ACTIVE' ? 'success' : 'error'}
            disabled={busy}
            onClick={changeStatus}
          >
            {statusConfirm?.next === 'ACTIVE' ? 'Activate' : 'Deactivate'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
