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
import { useEffect, useMemo, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { ButtonComp } from '@src/components/button/button.component'
import { CustomDatePicker } from '@src/components/datePicker/datePicker.component'
import { InputField } from '@src/components/input/input.component'
import { SelectField } from '@src/components/select/select.component'
import { colors } from '@src/helpers/colors.helpers'
import { useDispatch, useSelector } from '@src/store/hooks.store'
import {
  createStatutoryRuleAction,
  deactivateStatutoryRuleAction,
  getStatutoryRulesAction,
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
  PAYROLL_BASE_PATH,
  STATUTORY_BASE_LABEL,
  STATUTORY_BASE_OPTIONS,
  STATUTORY_CODE_LABEL,
  STATUTORY_CODE_OPTIONS,
  STATUTORY_SLAB_MODE_LABEL,
  STATUTORY_SLAB_MODE_OPTIONS,
  formatDate,
  todayIso,
} from './payroll.helpers'
import type { IOption, IStatusMeta } from './payroll.helpers'

type TSlabForm = {
  slab_from: string
  slab_to: string
  rate: string
  fixed_amount: string
}

type TForm = {
  code: Payroll.StatutoryCode
  name: string
  jurisdiction: string
  calculation_base: Payroll.StatutoryCalculationBase
  slab_mode: Payroll.StatutorySlabMode
  employee_rate: string
  employer_rate: string
  is_annualised: boolean
  effective_from: string
  effective_to: string
  slabs: TSlabForm[]
}

const emptySlab: TSlabForm = {
  slab_from: '',
  slab_to: '',
  rate: '',
  fixed_amount: '',
}

const emptyForm: TForm = {
  code: 'TDS',
  name: 'Income Tax (TDS)',
  jurisdiction: 'NP',
  calculation_base: 'TAXABLE_GROSS',
  slab_mode: 'PROGRESSIVE',
  employee_rate: '0',
  employer_rate: '0',
  is_annualised: true,
  effective_from: todayIso(),
  effective_to: '',
  slabs: [{ ...emptySlab }],
}

const RULE_STATUS_META: Record<'ACTIVE' | 'INACTIVE', IStatusMeta> = {
  ACTIVE: {
    text: '#15803d',
    bg: '#f0fdf4',
    border: '#bbf7d0',
    dot: '#22c55e',
    label: 'Active',
  },
  INACTIVE: {
    text: '#6b7280',
    bg: '#f9fafb',
    border: '#e5e7eb',
    dot: '#9ca3af',
    label: 'Inactive',
  },
}

/**
 * Statutory rules (TDS / PF / SSF / CIT / insurance).
 *
 * A rate change is published as a **new effective dated version**, never as an
 * edit: a finalized payroll run keeps the rates it was calculated with. The
 * screen therefore only deactivates a version; the New version dialog creates
 * the next one.
 */
export function PayrollStatutoryRulesPage() {
  const dispatch = useDispatch()
  const permissions = usePayrollPermissions()

  const { data, loading } = useSelector((store) => store.payroll.statutoryRules)

  const [search, setSearch] = useState('')
  const [codeFilter, setCodeFilter] = useState<
    Payroll.StatutoryCode | undefined
  >()
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [form, setForm] = useState<TForm>(emptyForm)

  useEffect(() => {
    dispatch(getStatutoryRulesAction())
  }, [dispatch])

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase()

    return (data ?? []).filter((rule) => {
      if (codeFilter && rule.code !== codeFilter) {
        return false
      }
      if (!term) {
        return true
      }

      return (
        rule.code.toLowerCase().includes(term) ||
        rule.name.toLowerCase().includes(term)
      )
    })
  }, [data, search, codeFilter])

  const close = () => {
    setOpen(false)
    setForm(emptyForm)
  }

  const setSlab = (index: number, patch: Partial<TSlabForm>) => {
    setForm((prev) => ({
      ...prev,
      slabs: prev.slabs.map((slab, position) =>
        position === index ? { ...slab, ...patch } : slab
      ),
    }))
  }

  const save = async () => {
    try {
      setBusy(true)
      await dispatch(
        createStatutoryRuleAction({
          code: form.code,
          name: form.name.trim(),
          jurisdiction: form.jurisdiction.trim() || undefined,
          calculation_base: form.calculation_base,
          slab_mode: form.slab_mode,
          employee_rate: form.employee_rate.trim() || null,
          employer_rate: form.employer_rate.trim() || null,
          is_annualised: form.is_annualised,
          effective_from: form.effective_from,
          effective_to: form.effective_to || null,
          slabs:
            form.slab_mode === 'PROGRESSIVE'
              ? form.slabs.map((slab) => ({
                  slab_from: slab.slab_from.trim() || null,
                  slab_to: slab.slab_to.trim() || null,
                  rate: slab.rate.trim() || null,
                  fixed_amount: slab.fixed_amount.trim() || null,
                }))
              : [],
        })
      ).unwrap()
      await dispatch(getStatutoryRulesAction())
      close()
    } catch {
      /* toast raised by the slice */
    } finally {
      setBusy(false)
    }
  }

  const deactivate = async (ruleId: number) => {
    try {
      setBusy(true)
      await dispatch(deactivateStatutoryRuleAction(ruleId)).unwrap()
      await dispatch(getStatutoryRulesAction())
    } catch {
      /* toast raised by the slice */
    } finally {
      setBusy(false)
    }
  }

  const columns: IFeeColumn<Payroll.IStatutoryRule>[] = [
    {
      key: 'rule',
      label: 'Scheme',
      render: (row) => (
        <FeeCellStack
          primary={`${row.code} · ${row.name}`}
          secondary={`${STATUTORY_BASE_LABEL[row.calculation_base]} · ${
            STATUTORY_SLAB_MODE_LABEL[row.slab_mode]
          }`}
        />
      ),
    },
    {
      key: 'rates',
      label: 'Employee / employer',
      align: 'right',
      render: (row) =>
        row.slab_mode === 'PROGRESSIVE' ? (
          <Typography fontSize={12.5} color={colors.grey[700]}>
            {row.slabs.length} slab{row.slabs.length === 1 ? '' : 's'}
          </Typography>
        ) : (
          <FeeCellStack
            primary={`${row.employee_rate}%`}
            secondary={`${row.employer_rate}% employer`}
          />
        ),
    },
    {
      key: 'effective',
      label: 'Effective',
      hideBelow: 'md',
      render: (row) => (
        <Typography fontSize={12.5} color={colors.grey[700]}>
          {formatDate(row.effective_from)}
          {row.effective_to ? ` → ${formatDate(row.effective_to)}` : ' → open'}
        </Typography>
      ),
    },
    {
      key: 'enrollments',
      label: 'Enrolled',
      align: 'right',
      hideBelow: 'lg',
      render: (row) => (
        <Typography fontSize={12.5}>{row.enrollment_count}</Typography>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <FeeStatusChip
          meta={
            row.is_active ? RULE_STATUS_META.ACTIVE : RULE_STATUS_META.INACTIVE
          }
        />
      ),
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (row) =>
        permissions.canManageSettings && row.is_active ? (
          <Button
            size="small"
            color="error"
            disabled={busy}
            onClick={() => void deactivate(row.id)}
          >
            Deactivate
          </Button>
        ) : null,
    },
  ]

  return (
    <Box>
      <FeePageHeader
        title="Statutory rules"
        subtitle="TDS / PF / SSF / CIT / insurance rates, effective dated and reproducible. A rate change is a new version, never an edit of history."
        backTo={PAYROLL_BASE_PATH}
        backLabel="Payroll"
        actions={
          permissions.canManageSettings ? (
            <ButtonComp
              size="small"
              variant="contained"
              startIcon={<Plus size={15} />}
              onClick={() => {
                setForm(emptyForm)
                setOpen(true)
              }}
            >
              New rule version
            </ButtonComp>
          ) : null
        }
      />

      <Box mb={2}>
        <FeeFilterBar
          columns={3}
          active={Boolean(search || codeFilter)}
          onClear={() => {
            setSearch('')
            setCodeFilter(undefined)
          }}
        >
          <Box>
            <Typography fontSize={13} color={colors.grey[800]} mb={1}>
              Scheme
            </Typography>
            <InputField
              placeholder="Code or name"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </Box>
          <Box>
            <Typography fontSize={13} color={colors.grey[800]} mb={1}>
              Code
            </Typography>
            <SelectField
              isClearable
              placeholder="Any code"
              options={STATUTORY_CODE_OPTIONS}
              value={
                STATUTORY_CODE_OPTIONS.find(
                  (option) => option.value === codeFilter
                ) ?? null
              }
              onChange={(option) =>
                setCodeFilter(
                  (option as IOption<Payroll.StatutoryCode> | null)?.value ??
                    undefined
                )
              }
            />
          </Box>
        </FeeFilterBar>
      </Box>

      <FeePanel
        noPadding
        title="Rule versions"
        subtitle="The engine reads the latest active version effective on the payroll period end date."
      >
        <FeeDataTable
          columns={columns}
          rows={rows}
          rowKey={(row) => row.id}
          loading={loading}
          skeletonRows={6}
          emptyTitle="No statutory rule"
          emptyDescription="Publish the first version of each scheme before running payroll."
        />
      </FeePanel>

      <StatutoryRuleDialog
        open={open}
        busy={busy}
        form={form}
        setForm={setForm}
        setSlab={setSlab}
        onClose={close}
        onSave={() => void save()}
      />
    </Box>
  )
}

type TSetForm = (value: TForm | ((prev: TForm) => TForm)) => void

interface TDialogProps {
  open: boolean
  busy: boolean
  form: TForm
  setForm: TSetForm
  setSlab: (index: number, patch: Partial<TSlabForm>) => void
  onClose: () => void
  onSave: () => void
}

function StatutoryRuleDialog({
  open,
  busy,
  form,
  setForm,
  setSlab,
  onClose,
  onSave,
}: TDialogProps) {
  const set = (patch: Partial<TForm>) =>
    setForm((prev) => ({ ...prev, ...patch }))

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>New statutory rule version</DialogTitle>
      <DialogContent>
        <Stack spacing={2} pt={1}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
              gap: 1.5,
            }}
          >
            <Box>
              <Typography fontSize={12} mb={0.5}>
                Scheme
              </Typography>
              <SelectField
                options={STATUTORY_CODE_OPTIONS}
                value={
                  STATUTORY_CODE_OPTIONS.find(
                    (option) => option.value === form.code
                  ) ?? null
                }
                onChange={(option) => {
                  const value = (
                    option as IOption<Payroll.StatutoryCode> | null
                  )?.value
                  if (value) {
                    set({
                      code: value,
                      name: STATUTORY_CODE_LABEL[value],
                      is_annualised: value === 'TDS',
                      calculation_base:
                        value === 'TDS' ? 'TAXABLE_GROSS' : 'BASIC',
                      slab_mode: value === 'TDS' ? 'PROGRESSIVE' : 'NONE',
                    })
                  }
                }}
              />
            </Box>
            <InputField
              labelDetail={{ text: 'Name', required: true }}
              value={form.name}
              onChange={(event) => set({ name: event.target.value })}
            />
            <InputField
              labelDetail={{ text: 'Jurisdiction', required: false }}
              value={form.jurisdiction}
              onChange={(event) => set({ jurisdiction: event.target.value })}
            />
            <Box>
              <Typography fontSize={12} mb={0.5}>
                Calculation base
              </Typography>
              <SelectField
                options={STATUTORY_BASE_OPTIONS}
                value={
                  STATUTORY_BASE_OPTIONS.find(
                    (option) => option.value === form.calculation_base
                  ) ?? null
                }
                onChange={(option) => {
                  const value = (
                    option as IOption<Payroll.StatutoryCalculationBase> | null
                  )?.value
                  if (value) {
                    set({ calculation_base: value })
                  }
                }}
              />
            </Box>
            <Box>
              <Typography fontSize={12} mb={0.5}>
                Slab mode
              </Typography>
              <SelectField
                options={STATUTORY_SLAB_MODE_OPTIONS}
                value={
                  STATUTORY_SLAB_MODE_OPTIONS.find(
                    (option) => option.value === form.slab_mode
                  ) ?? null
                }
                onChange={(option) => {
                  const value = (
                    option as IOption<Payroll.StatutorySlabMode> | null
                  )?.value
                  if (value) {
                    set({
                      slab_mode: value,
                      slabs:
                        value === 'PROGRESSIVE' && !form.slabs.length
                          ? [{ ...emptySlab }]
                          : form.slabs,
                    })
                  }
                }}
              />
            </Box>
            <InputField
              labelDetail={{ text: 'Employee rate (%)', required: false }}
              value={form.employee_rate}
              onChange={(event) => set({ employee_rate: event.target.value })}
            />
            <InputField
              labelDetail={{ text: 'Employer rate (%)', required: false }}
              value={form.employer_rate}
              onChange={(event) => set({ employer_rate: event.target.value })}
            />
            <CustomDatePicker
              format="YYYY-MM-DD"
              labelDetail={{ text: 'Effective from', required: true }}
              views={['day', 'month', 'year']}
              value={form.effective_from ? moment(form.effective_from) : null}
              onChange={(value) =>
                set({
                  effective_from:
                    value && moment(value).isValid()
                      ? moment(value).format('YYYY-MM-DD')
                      : todayIso(),
                })
              }
              slotProps={{ textField: { size: 'small' } }}
            />
            <CustomDatePicker
              format="YYYY-MM-DD"
              labelDetail={{ text: 'Effective to', required: false }}
              views={['day', 'month', 'year']}
              value={form.effective_to ? moment(form.effective_to) : null}
              onChange={(value) =>
                set({
                  effective_to:
                    value && moment(value).isValid()
                      ? moment(value).format('YYYY-MM-DD')
                      : '',
                })
              }
              slotProps={{ textField: { size: 'small' } }}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={form.is_annualised}
                  onChange={(event) =>
                    set({ is_annualised: event.target.checked })
                  }
                />
              }
              label="Applied on an annualised base (progressive tax)"
            />
          </Box>

          <Typography fontSize={11.5} color={colors.grey[600]}>
            A published version is immutable. To change a rate, publish a new
            version with a later effective date; a finalized payroll run keeps
            the rates it was calculated with.
          </Typography>

          {form.slab_mode === 'PROGRESSIVE' ? (
            <Box>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                mb={1}
              >
                <Typography fontSize={13} fontWeight={700}>
                  Tax slabs
                </Typography>
                <Button
                  size="small"
                  startIcon={<Plus size={14} />}
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      slabs: [...prev.slabs, { ...emptySlab }],
                    }))
                  }
                >
                  Add slab
                </Button>
              </Stack>
              <Stack spacing={1}>
                {form.slabs.map((slab, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: {
                        xs: '1fr 1fr',
                        md: '1fr 1fr 1fr 1fr auto',
                      },
                      gap: 1,
                      alignItems: 'center',
                    }}
                  >
                    <InputField
                      labelDetail={{ text: 'From', required: false }}
                      value={slab.slab_from}
                      onChange={(event) =>
                        setSlab(index, { slab_from: event.target.value })
                      }
                    />
                    <InputField
                      labelDetail={{
                        text: 'To (blank = above)',
                        required: false,
                      }}
                      value={slab.slab_to}
                      onChange={(event) =>
                        setSlab(index, { slab_to: event.target.value })
                      }
                    />
                    <InputField
                      labelDetail={{ text: 'Rate %', required: false }}
                      value={slab.rate}
                      onChange={(event) =>
                        setSlab(index, { rate: event.target.value })
                      }
                    />
                    <InputField
                      labelDetail={{ text: 'Fixed amount', required: false }}
                      value={slab.fixed_amount}
                      onChange={(event) =>
                        setSlab(index, { fixed_amount: event.target.value })
                      }
                    />
                    <IconButton
                      size="small"
                      disabled={form.slabs.length <= 1}
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          slabs: prev.slabs.filter(
                            (_, position) => position !== index
                          ),
                        }))
                      }
                    >
                      <Trash2 size={15} />
                    </IconButton>
                  </Box>
                ))}
              </Stack>
            </Box>
          ) : null}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          disabled={busy || !form.name.trim() || !form.effective_from}
          onClick={onSave}
        >
          Publish version
        </Button>
      </DialogActions>
    </Dialog>
  )
}
