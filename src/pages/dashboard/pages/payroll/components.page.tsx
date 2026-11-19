import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Stack,
  Typography,
} from '@mui/material'
import { useEffect, useState } from 'react'
import { ButtonComp } from '@src/components/button/button.component'
import { InputField } from '@src/components/input/input.component'
import { SelectField } from '@src/components/select/select.component'
import { colors } from '@src/helpers/colors.helpers'
import { useDispatch, useSelector } from '@src/store/hooks.store'
import {
  createComponentAction,
  deactivateComponentAction,
  getComponentsAction,
  updateComponentAction,
} from '@src/store/redux/dashboard/payroll/payroll.slice'
import { usePayrollPermissions } from '@src/hooks/usePayrollPermissions.hooks'
import {
  FeeCellStack,
  FeeDataTable,
} from '../fees/components/feeDataTable.component'
import type { IFeeColumn } from '../fees/components/feeDataTable.component'
import { FeeFilterBar } from '../fees/components/feeFilterBar.component'
import { FeePageHeader } from '../fees/components/feePageHeader.component'
import { FeePanel } from '../fees/components/feePanel.component'
import { FeeStatusChip } from '../fees/components/feeStatusChip.component'
import {
  CALCULATION_TYPE_OPTIONS,
  COMPONENT_TYPE_META,
  COMPONENT_TYPE_OPTIONS,
  PAYROLL_BASE_PATH,
  formatMoney,
} from './payroll.helpers'
import type { IOption } from './payroll.helpers'

type TForm = {
  code: string
  name: string
  component_type: Payroll.SalaryComponentType
  calculation_type: Payroll.CalculationType
  percentage: string
  default_amount: string
  formula: string
  sequence: string
  statutory_code: string
  is_taxable: boolean
  is_prorated: boolean
  show_on_payslip: boolean
}

const emptyForm: TForm = {
  code: '',
  name: '',
  component_type: 'EARNING',
  calculation_type: 'FIXED',
  percentage: '',
  default_amount: '',
  formula: '',
  sequence: '100',
  statutory_code: '',
  is_taxable: true,
  is_prorated: true,
  show_on_payslip: true,
}

/** Salary components: the building blocks a salary structure is made of. */
export function PayrollComponentsPage() {
  const dispatch = useDispatch()
  const permissions = usePayrollPermissions()

  const { data, loading } = useSelector(
    (store) => store.payroll.salaryComponents
  )

  const [typeFilter, setTypeFilter] = useState<
    Payroll.SalaryComponentType | undefined
  >()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Payroll.IComponent | null>(null)
  const [form, setForm] = useState<TForm>(emptyForm)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    dispatch(getComponentsAction({ component_type: typeFilter }))
  }, [dispatch, typeFilter])

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setOpen(true)
  }

  const openEdit = (component: Payroll.IComponent) => {
    setEditing(component)
    setForm({
      code: component.code,
      name: component.name,
      component_type: component.component_type,
      calculation_type: component.calculation_type,
      percentage: component.percentage ?? '',
      default_amount: component.default_amount ?? '',
      formula: component.formula ?? '',
      sequence: String(component.sequence),
      statutory_code: component.statutory_code ?? '',
      is_taxable: component.is_taxable,
      is_prorated: component.is_prorated,
      show_on_payslip: component.show_on_payslip,
    })
    setOpen(true)
  }

  const save = async () => {
    try {
      setBusy(true)
      const payload = {
        name: form.name,
        component_type: form.component_type,
        calculation_type: form.calculation_type,
        percentage: form.percentage || null,
        default_amount: form.default_amount || null,
        formula: form.formula || null,
        sequence: Number(form.sequence) || 100,
        statutory_code: form.statutory_code || null,
        is_taxable: form.is_taxable,
        is_prorated: form.is_prorated,
        show_on_payslip: form.show_on_payslip,
      }

      if (editing) {
        await dispatch(
          updateComponentAction({ componentId: editing.id, changes: payload })
        ).unwrap()
      } else {
        await dispatch(
          createComponentAction({ code: form.code, ...payload })
        ).unwrap()
      }

      await dispatch(getComponentsAction({ component_type: typeFilter }))
      setOpen(false)
    } catch {
      /* toast raised by the slice */
    } finally {
      setBusy(false)
    }
  }

  const deactivate = async (component: Payroll.IComponent) => {
    try {
      setBusy(true)
      await dispatch(deactivateComponentAction(component.id)).unwrap()
      await dispatch(getComponentsAction({ component_type: typeFilter }))
    } catch {
      /* toast raised by the slice */
    } finally {
      setBusy(false)
    }
  }

  const columns: IFeeColumn<Payroll.IComponent>[] = [
    {
      key: 'component',
      label: 'Component',
      render: (row) => (
        <FeeCellStack
          primary={`${row.code} · ${row.name}`}
          secondary={`seq ${row.sequence}${
            row.statutory_code ? ` · ${row.statutory_code}` : ''
          }`}
        />
      ),
    },
    {
      key: 'type',
      label: 'Type',
      render: (row) => (
        <FeeStatusChip meta={COMPONENT_TYPE_META[row.component_type]} />
      ),
    },
    {
      key: 'calculation',
      label: 'Calculation',
      hideBelow: 'md',
      render: (row) => (
        <Typography fontSize={12.5} color={colors.grey[700]}>
          {row.calculation_type}
        </Typography>
      ),
    },
    {
      key: 'value',
      label: 'Value',
      align: 'right',
      render: (row) => (
        <Typography fontSize={12.5}>
          {row.percentage
            ? `${row.percentage}%`
            : row.default_amount
            ? formatMoney(row.default_amount)
            : row.formula ?? '—'}
        </Typography>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <Typography
          fontSize={12.5}
          fontWeight={600}
          color={row.is_active ? colors.green[700] : colors.grey[500]}
        >
          {row.is_active ? 'Active' : 'Inactive'}
        </Typography>
      ),
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (row) =>
        permissions.canManageComponents ? (
          <Stack direction="row" spacing={0.5} justifyContent="flex-end">
            <Button size="small" disabled={busy} onClick={() => openEdit(row)}>
              Edit
            </Button>
            {row.is_active ? (
              <Button
                size="small"
                color="error"
                disabled={busy}
                onClick={() => void deactivate(row)}
              >
                Deactivate
              </Button>
            ) : null}
          </Stack>
        ) : null,
    },
  ]
  return (
    <Box>
      <FeePageHeader
        title="Salary components"
        subtitle="Each component declares how its amount is derived; the structure then decides which components an employee gets."
        backTo={PAYROLL_BASE_PATH}
        backLabel="Payroll"
        actions={
          permissions.canManageComponents ? (
            <ButtonComp size="small" variant="contained" onClick={openCreate}>
              New component
            </ButtonComp>
          ) : null
        }
      />

      <Box mb={2}>
        <FeeFilterBar
          columns={3}
          active={Boolean(typeFilter)}
          onClear={() => setTypeFilter(undefined)}
        >
          <Box>
            <Typography fontSize={13} color={colors.grey[800]} mb={1}>
              Component type
            </Typography>
            <SelectField
              isClearable
              placeholder="Any type"
              options={COMPONENT_TYPE_OPTIONS}
              value={
                COMPONENT_TYPE_OPTIONS.find(
                  (option) => option.value === typeFilter
                ) ?? null
              }
              onChange={(option) =>
                setTypeFilter(
                  (option as IOption<Payroll.SalaryComponentType> | null)
                    ?.value ?? undefined
                )
              }
            />
          </Box>
        </FeeFilterBar>
      </Box>

      <FeePanel
        noPadding
        title="Components"
        subtitle="Deactivating a component keeps its history: the engine only reads active rows."
      >
        <FeeDataTable
          columns={columns}
          rows={data ?? []}
          rowKey={(row) => row.id}
          loading={loading}
          skeletonRows={8}
          emptyTitle="No component"
          emptyDescription="Run the payroll seed or create the first component."
        />
      </FeePanel>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {editing ? `Edit ${editing.code}` : 'New salary component'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={1.5} pt={1}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              <InputField
                labelDetail={{ text: 'Code', required: true }}
                placeholder="BASIC"
                value={form.code}
                disabled={Boolean(editing)}
                onChange={(event) =>
                  setForm({ ...form, code: event.target.value.toUpperCase() })
                }
              />
              <InputField
                labelDetail={{ text: 'Name', required: true }}
                value={form.name}
                onChange={(event) =>
                  setForm({ ...form, name: event.target.value })
                }
              />
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              <Box sx={{ flex: 1 }}>
                <Typography fontSize={13} mb={0.75}>
                  Component type
                </Typography>
                <SelectField
                  options={COMPONENT_TYPE_OPTIONS}
                  value={
                    COMPONENT_TYPE_OPTIONS.find(
                      (option) => option.value === form.component_type
                    ) ?? null
                  }
                  onChange={(option) => {
                    const value = (
                      option as IOption<Payroll.SalaryComponentType> | null
                    )?.value
                    if (value) {
                      setForm({ ...form, component_type: value })
                    }
                  }}
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography fontSize={13} mb={0.75}>
                  Calculation
                </Typography>
                <SelectField
                  options={CALCULATION_TYPE_OPTIONS}
                  value={
                    CALCULATION_TYPE_OPTIONS.find(
                      (option) => option.value === form.calculation_type
                    ) ?? null
                  }
                  onChange={(option) => {
                    const value = (
                      option as IOption<Payroll.CalculationType> | null
                    )?.value
                    if (value) {
                      setForm({ ...form, calculation_type: value })
                    }
                  }}
                />
              </Box>
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              <InputField
                labelDetail={{ text: 'Percentage', required: false }}
                placeholder="10"
                value={form.percentage}
                onChange={(event) =>
                  setForm({ ...form, percentage: event.target.value })
                }
              />
              <InputField
                labelDetail={{ text: 'Default amount', required: false }}
                placeholder="0.00"
                value={form.default_amount}
                onChange={(event) =>
                  setForm({ ...form, default_amount: event.target.value })
                }
              />
            </Stack>
            <InputField
              labelDetail={{ text: 'Formula', required: false }}
              placeholder="BASIC * 0.1"
              value={form.formula}
              onChange={(event) =>
                setForm({ ...form, formula: event.target.value })
              }
            />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              <InputField
                labelDetail={{ text: 'Sequence', required: false }}
                value={form.sequence}
                onChange={(event) =>
                  setForm({ ...form, sequence: event.target.value })
                }
              />
              <InputField
                labelDetail={{ text: 'Statutory code', required: false }}
                placeholder="TDS / PF / SSF / CIT"
                value={form.statutory_code}
                onChange={(event) =>
                  setForm({ ...form, statutory_code: event.target.value })
                }
              />
            </Stack>
            <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={form.is_taxable}
                    onChange={(event) =>
                      setForm({ ...form, is_taxable: event.target.checked })
                    }
                  />
                }
                label="Taxable"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={form.is_prorated}
                    onChange={(event) =>
                      setForm({ ...form, is_prorated: event.target.checked })
                    }
                  />
                }
                label="Prorated on payable days"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={form.show_on_payslip}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        show_on_payslip: event.target.checked,
                      })
                    }
                  />
                }
                label="Show on payslip"
              />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            disabled={busy || !form.code || !form.name}
            onClick={save}
          >
            {editing ? 'Save changes' : 'Create component'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
