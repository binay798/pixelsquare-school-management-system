import {
  Box,
  FormControlLabel,
  Stack,
  Switch,
  Tooltip,
  Typography,
} from '@mui/material'
import { useCallback, useEffect, useState } from 'react'
import moment from 'moment'
import { Calculator, Plus, Power, Timer } from 'lucide-react'
import { colors } from '@src/helpers/colors.helpers'
import { ButtonComp } from '@src/components/button/button.component'
import { SelectField } from '@src/components/select/select.component'
import { CustomDatePicker } from '@src/components/datePicker/datePicker.component'
import { ConfirmationModal } from '@src/components/confirmationModal/confirmationModal.component'
import { useFeePermissions } from '@src/hooks/useFeePermissions.hooks'
import { useDispatch, useSelector } from '@src/store/hooks.store'
import { feeServices } from '@src/store/redux/dashboard/fee/fee.service'
import {
  assessLateFeesAction,
  deactivateLateFeeRuleAction,
  getLateFeeRulesAction,
} from '@src/store/redux/dashboard/fee/fee.config.slice'
import {
  FeeAmount,
  FeeCellStack,
  FeeDataTable,
  IFeeColumn,
} from '../../components/feeDataTable.component'
import { FeePageHeader } from '../../components/feePageHeader.component'
import { FeePanel } from '../../components/feePanel.component'
import { FeeStatusChip } from '../../components/feeStatusChip.component'
import {
  formatDate,
  formatMoney,
  IOption,
  LATE_FEE_FREQUENCY_OPTIONS,
  LATE_FEE_TYPE_OPTIONS,
} from '../../fees.helpers'
import { LateFeeRuleModal } from './components/lateFeeRuleModal.component'

const ACTIVE_META = {
  label: 'Active',
  text: '#047857',
  bg: '#ecfdf5',
  border: '#a7f3d0',
  dot: '#10b981',
}
const INACTIVE_META = {
  label: 'Inactive',
  text: '#475569',
  bg: '#f1f5f9',
  border: '#e2e8f0',
  dot: '#94a3b8',
}

export function FeeLateFeesPage() {
  const dispatch = useDispatch()
  const { can } = useFeePermissions()

  const { data: rules, loading } = useSelector(
    (store) => store.feeConfig.lateFeeRules
  )
  const { loading: mutating } = useSelector(
    (store) => store.feeConfig.lateFeeRuleMutation
  )
  const { loading: assessing, result } = useSelector(
    (store) => store.feeConfig.lateFeeAssessment
  )

  const [feeTypes, setFeeTypes] = useState<Fee.IFeeType[]>([])
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Fee.ILateFeeRule | null>(null)
  const [deactivateTarget, setDeactivateTarget] =
    useState<Fee.ILateFeeRule | null>(null)

  const [assessDate, setAssessDate] = useState(moment().format('YYYY-MM-DD'))
  const [assessRuleId, setAssessRuleId] = useState<number | null>(null)
  const [dryRun, setDryRun] = useState(true)

  const load = useCallback(() => {
    dispatch(getLateFeeRulesAction({}))
  }, [dispatch])

  useEffect(() => {
    load()
    feeServices
      .listFeeTypesService({ is_active: true }, 1, 200)
      .then((res) => setFeeTypes(res.rows))
      .catch(() => setFeeTypes([]))
  }, [load])

  const ruleOptions: IOption[] = (rules ?? []).map((rule) => ({
    value: String(rule.id),
    label: rule.name,
  }))

  const runAssessment = () => {
    dispatch(
      assessLateFeesAction({
        as_of_date: assessDate || undefined,
        rule_id: assessRuleId ?? undefined,
        dry_run: dryRun,
      })
    )
  }

  const columns: IFeeColumn<Fee.ILateFeeRule>[] = [
    {
      key: 'name',
      label: 'Rule',
      render: (row) => (
        <FeeCellStack
          primary={row.name}
          secondary={`${LATE_FEE_TYPE_OPTIONS.find(
            (option) => option.value === row.calculation_type
          )?.label} · ${LATE_FEE_FREQUENCY_OPTIONS.find(
            (option) => option.value === row.frequency
          )?.label}`}
        />
      ),
    },
    {
      key: 'calculation_value',
      label: 'Value',
      align: 'right',
      render: (row) => (
        <FeeAmount
          value={
            row.calculation_type === 'PERCENTAGE'
              ? `${row.calculation_value}%`
              : formatMoney(row.calculation_value)
          }
          strong
        />
      ),
    },
    {
      key: 'grace_period_days',
      label: 'Grace',
      align: 'right',
      hideBelow: 'sm',
      render: (row) => (
        <Typography fontSize={12.5} color={colors.grey[700]}>
          {row.grace_period_days} day{row.grace_period_days === 1 ? '' : 's'}
        </Typography>
      ),
    },
    {
      key: 'maximum_penalty',
      label: 'Cap',
      align: 'right',
      hideBelow: 'md',
      render: (row) => (
        <FeeAmount value={formatMoney(row.maximum_penalty)} tone="muted" />
      ),
    },
    {
      key: 'effective_from',
      label: 'Effective',
      hideBelow: 'lg',
      render: (row) => (
        <FeeCellStack
          primary={formatDate(row.effective_from)}
          secondary={
            row.effective_until
              ? `until ${formatDate(row.effective_until)}`
              : undefined
          }
        />
      ),
    },
    {
      key: 'is_active',
      label: 'Status',
      render: (row) => (
        <FeeStatusChip meta={row.is_active ? ACTIVE_META : INACTIVE_META} />
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (row) => (
        <Stack direction="row" spacing={0.25} justifyContent="flex-end">
          {can('fee.late_fees.manage') ? (
            <Tooltip title="Edit rule">
              <span>
                <ButtonComp
                  size="small"
                  variant="text"
                  onClick={() => {
                    setEditing(row)
                    setFormOpen(true)
                  }}
                  sx={{ minWidth: 0, px: 0.75 }}
                >
                  <Timer size={14} />
                </ButtonComp>
              </span>
            </Tooltip>
          ) : null}
          {can('fee.late_fees.manage') && row.is_active ? (
            <Tooltip title="Deactivate">
              <span>
                <ButtonComp
                  size="small"
                  variant="text"
                  color="error"
                  onClick={() => setDeactivateTarget(row)}
                  sx={{ minWidth: 0, px: 0.75 }}
                >
                  <Power size={14} />
                </ButtonComp>
              </span>
            </Tooltip>
          ) : null}
        </Stack>
      ),
    },
  ]

  return (
    <Box>
      <FeePageHeader
        title="Late fee rules"
        subtitle="Fixed, percentage, daily or monthly penalties with a grace period and a cap. The assessment always runs on the backend."
        backTo="/dashboard/fees"
        actions={
          can('fee.late_fees.manage') ? (
            <ButtonComp
              startIcon={<Plus size={15} />}
              onClick={() => {
                setEditing(null)
                setFormOpen(true)
              }}
            >
              New rule
            </ButtonComp>
          ) : null
        }
      />

      <Box
        sx={{
          display: 'grid',
          gap: 1.5,
          gridTemplateColumns: { xs: '1fr', lg: '1.4fr 1fr' },
          mb: 1.75,
        }}
      >
        <FeePanel
          title="Run a late fee assessment"
          subtitle="Executed by the backend: it applies at most one penalty per invoice, rule and billing period."
        >
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={1.25}
            alignItems={{ xs: 'stretch', md: 'flex-end' }}
          >
            <Box sx={{ width: { xs: '100%', md: 170 } }}>
              <CustomDatePicker
                labelDetail={{ text: 'As of date', required: false }}
                views={['day', 'month', 'year']}
                value={assessDate ? moment(assessDate) : null}
                onChange={(value) =>
                  setAssessDate(
                    value && moment(value).isValid()
                      ? moment(value).format('YYYY-MM-DD')
                      : ''
                  )
                }
                slotProps={{ textField: { size: 'small' } }}
              />
            </Box>
            <Box flex={1}>
              <Typography fontSize={12} color={colors.grey[600]} mb={0.75}>
                Rule
              </Typography>
              <SelectField
                isClearable
                placeholder="All active rules"
                options={ruleOptions}
                value={
                  ruleOptions.find(
                    (option) => option.value === String(assessRuleId)
                  ) ?? null
                }
                onChange={(option) =>
                  setAssessRuleId(
                    (option as IOption | null)?.value
                      ? Number((option as IOption).value)
                      : null
                  )
                }
              />
            </Box>
            <FormControlLabel
              control={
                <Switch
                  checked={dryRun}
                  onChange={(event) => setDryRun(event.target.checked)}
                />
              }
              label={<Typography fontSize={12.5}>Dry run</Typography>}
            />
            <ButtonComp
              loading={assessing}
              startIcon={<Calculator size={14} />}
              disabled={!can('fee.late_fees.assess')}
              onClick={runAssessment}
              sx={{ whiteSpace: 'nowrap' }}
            >
              {dryRun ? 'Preview assessment' : 'Assess penalties'}
            </ButtonComp>
          </Stack>

          {result ? (
            <Box
              sx={{
                mt: 1.25,
                p: 1.25,
                borderRadius: 2,
                border: `1px solid ${colors.grey[200]}`,
                bgcolor: colors.grey[50],
              }}
            >
              <Typography fontSize={12.5} color={colors.grey[800]}>
                {result.dry_run ? 'Preview' : 'Applied'} as of{' '}
                {formatDate(result.as_of_date)} · {result.assessed} invoice
                {result.assessed === 1 ? '' : 's'} · {result.skipped} skipped ·{' '}
                {formatMoney(result.total_penalty)} penalty
              </Typography>
            </Box>
          ) : null}
        </FeePanel>

        <FeePanel
          title="How the engine charges a penalty"
          subtitle="Reference of the rules implemented by the fee engine."
        >
          <Stack spacing={0.75}>
            <Typography fontSize={12.5} color={colors.grey[700]}>
              • FIXED applies the configured amount, PERCENTAGE applies it to
              the outstanding balance.
            </Typography>
            <Typography fontSize={12.5} color={colors.grey[700]}>
              • DAILY multiplies by the chargeable days after the grace period,
              MONTHLY by the elapsed months.
            </Typography>
            <Typography fontSize={12.5} color={colors.grey[700]}>
              • `maximum_penalty` caps the result; penalties post to the late
              fee income account.
            </Typography>
          </Stack>
        </FeePanel>
      </Box>

      <FeePanel noPadding>
        <FeeDataTable
          columns={columns}
          rows={rules ?? []}
          rowKey={(row) => row.id}
          loading={loading}
          skeletonRows={5}
          emptyTitle="No late fee rules"
          emptyDescription="Create a rule to start charging penalties on overdue invoices."
        />
      </FeePanel>

      <LateFeeRuleModal
        open={formOpen}
        rule={editing}
        feeTypes={feeTypes}
        onClose={() => {
          setFormOpen(false)
          setEditing(null)
        }}
        onSaved={load}
      />

      <ConfirmationModal
        open={Boolean(deactivateTarget)}
        onClose={() => setDeactivateTarget(null)}
        heading="Deactivate this rule?"
        confirmText="Deactivate"
        confirmLoader={mutating}
        onConfirmationClick={() => {
          if (!deactivateTarget) {
            return
          }
          dispatch(
            deactivateLateFeeRuleAction({
              ruleId: deactivateTarget.id,
              onSuccess: () => {
                setDeactivateTarget(null)
                load()
              },
            })
          )
        }}
      >
        <Typography fontSize={13} color={colors.grey[700]}>
          Penalties already applied stay on the invoices. The rule stops being
          used by the next assessments.
        </Typography>
      </ConfirmationModal>
    </Box>
  )
}
