import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from '@mui/material'
import moment from 'moment'
import { useState } from 'react'
import { CustomDatePicker } from '@src/components/datePicker/datePicker.component'
import { InputField } from '@src/components/input/input.component'
import { SelectField } from '@src/components/select/select.component'
import { colors } from '@src/helpers/colors.helpers'
import { useDispatch, useSelector } from '@src/store/hooks.store'
import {
  createArrearsAction,
  createAssignmentAction,
  createRevisionAction,
  decideRevisionAction,
  getArrearsPreviewAction,
  getProfileAction,
} from '@src/store/redux/dashboard/payroll/payroll.slice'
import { usePayrollPermissions } from '@src/hooks/usePayrollPermissions.hooks'
import { FeeAmount } from '../../fees/components/feeDataTable.component'
import { FeePanel } from '../../fees/components/feePanel.component'
import { FeeStatusChip } from '../../fees/components/feeStatusChip.component'
import {
  INCREMENT_TYPE_OPTIONS,
  REVISION_STATUS_META,
  formatDate,
  todayIso,
} from '../payroll.helpers'
import type { IOption } from '../payroll.helpers'

interface Props {
  employeeId: number
}

/**
 * Salary tab of the payroll profile: assignments (base amount per structure),
 * revisions (with approval) and the arrears of a retroactive revision.
 */
export function ProfileSalaryComponent({ employeeId }: Props) {
  const dispatch = useDispatch()
  const permissions = usePayrollPermissions()

  const { data: profile } = useSelector((store) => store.payroll.profileDetail)
  const { data: structures } = useSelector((store) => store.payroll.structures)
  const { data: preview } = useSelector((store) => store.payroll.arrearsPreview)

  const [busy, setBusy] = useState(false)
  const [showAssignmentForm, setShowAssignmentForm] = useState(false)
  const [structureId, setStructureId] = useState<number | null>(null)
  const [baseAmount, setBaseAmount] = useState('')
  const [assignmentDate, setAssignmentDate] = useState(todayIso())
  const [showRevisionForm, setShowRevisionForm] = useState(false)
  const [incrementType, setIncrementType] =
    useState<Payroll.IncrementType>('AMOUNT')
  const [newAmount, setNewAmount] = useState('')
  const [incrementValue, setIncrementValue] = useState('')
  const [revisionDate, setRevisionDate] = useState(todayIso())
  const [arrearsOpen, setArrearsOpen] = useState(false)
  const [activeRevision, setActiveRevision] = useState<number | null>(null)

  const structureOptions: IOption<string>[] = (structures ?? []).map(
    (structure) => ({
      value: String(structure.id),
      label: `${structure.code} · ${structure.name}`,
    })
  )

  const run = async (task: () => Promise<unknown>) => {
    try {
      setBusy(true)
      await task()
      await dispatch(getProfileAction(employeeId))
    } catch {
      /* toast raised by the slice */
    } finally {
      setBusy(false)
    }
  }

  const createAssignment = () =>
    run(async () => {
      await dispatch(
        createAssignmentAction({
          employee_id: employeeId,
          salary_structure_id: Number(structureId),
          base_amount: baseAmount,
          effective_from: assignmentDate,
        })
      ).unwrap()
      setShowAssignmentForm(false)
      setStructureId(null)
      setBaseAmount('')
    })

  const createRevision = () =>
    run(async () => {
      await dispatch(
        createRevisionAction({
          employee_id: employeeId,
          assignment_id: profile?.assignments?.[0]?.id,
          increment_type: incrementType,
          ...(incrementType === 'AMOUNT'
            ? { new_amount: newAmount }
            : { increment_value: incrementValue }),
          effective_date: revisionDate,
        })
      ).unwrap()
      setShowRevisionForm(false)
      setNewAmount('')
      setIncrementValue('')
    })

  const decide = (revisionId: number, decision: 'APPROVE' | 'REJECT') =>
    run(() => dispatch(decideRevisionAction({ revisionId, decision })).unwrap())

  const openArrears = async (revisionId: number) => {
    try {
      setActiveRevision(revisionId)
      setArrearsOpen(true)
      await dispatch(getArrearsPreviewAction(revisionId)).unwrap()
    } catch {
      setArrearsOpen(false)
    }
  }

  return (
    <Stack spacing={2}>
      <FeePanel
        title="Salary assignments"
        subtitle="The active assignment carries the base amount the engine pays."
        action={
          permissions.canManageComponents ? (
            <Button
              size="small"
              onClick={() => setShowAssignmentForm((value) => !value)}
            >
              {showAssignmentForm ? 'Close' : 'New assignment'}
            </Button>
          ) : null
        }
      >
        <Stack spacing={1}>
          {(profile?.assignments ?? []).map((assignment) => (
            <Stack
              key={assignment.id}
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{
                p: 1.25,
                borderRadius: 2,
                border: `1px solid ${colors.grey[200]}`,
              }}
            >
              <Box>
                <Typography fontSize={12.5} fontWeight={600}>
                  {assignment.structure_code} · {assignment.structure_name}
                </Typography>
                <Typography fontSize={11.5} color={colors.grey[600]}>
                  from {formatDate(assignment.effective_from)} ·{' '}
                  {assignment.status}
                </Typography>
              </Box>
              <FeeAmount value={assignment.base_amount} strong />
            </Stack>
          ))}
          {!(profile?.assignments ?? []).length ? (
            <Typography fontSize={12.5} color={colors.grey[600]}>
              No salary assigned yet.
            </Typography>
          ) : null}

          {showAssignmentForm ? (
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={1}
              alignItems={{ xs: 'stretch', md: 'flex-end' }}
              sx={{
                p: 1.25,
                borderRadius: 2,
                border: `1px dashed ${colors.grey[300]}`,
              }}
            >
              <Box sx={{ flex: 2 }}>
                <Typography fontSize={12} mb={0.5} width={200}>
                  Structure
                </Typography>
                <SelectField
                  placeholder="Select a structure"
                  options={structureOptions}
                  value={
                    structureOptions.find(
                      (option) => option.value === String(structureId ?? '')
                    ) ?? null
                  }
                  onChange={(option) => {
                    const value = (option as IOption<string> | null)?.value
                    setStructureId(value ? Number(value) : null)
                  }}
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <InputField
                  labelDetail={{ text: 'Base amount', required: true }}
                  value={baseAmount}
                  onChange={(event) => setBaseAmount(event.target.value)}
                  style={{ width: 300 }}
                />
              </Box>
              <CustomDatePicker
                format="YYYY-MM-DD"
                labelDetail={{ text: 'Effective from', required: true }}
                views={['day', 'month', 'year']}
                value={assignmentDate ? moment(assignmentDate) : null}
                onChange={(value) =>
                  setAssignmentDate(
                    value && moment(value).isValid()
                      ? moment(value).format('YYYY-MM-DD')
                      : todayIso()
                  )
                }
                slotProps={{ textField: { size: 'small' } }}
              />
              <Button
                variant="contained"
                size="small"
                disabled={busy || !structureId || !baseAmount}
                onClick={() => void createAssignment()}
              >
                Assign
              </Button>
            </Stack>
          ) : null}
        </Stack>
      </FeePanel>

      <FeePanel
        title="Salary revisions"
        action={
          permissions.canManageComponents ? (
            <Button
              size="small"
              onClick={() => setShowRevisionForm((value) => !value)}
            >
              {showRevisionForm ? 'Close' : 'New revision'}
            </Button>
          ) : null
        }
      >
        <Stack spacing={1}>
          {(profile?.revisions ?? []).map((revision) => (
            <Stack
              key={revision.id}
              direction={{ xs: 'column', md: 'row' }}
              spacing={1}
              justifyContent="space-between"
              alignItems={{ xs: 'flex-start', md: 'center' }}
              sx={{
                p: 1.25,
                borderRadius: 2,
                border: `1px solid ${colors.grey[200]}`,
              }}
            >
              <Box>
                <Typography fontSize={12.5} fontWeight={600}>
                  {revision.previous_amount} → {revision.new_amount}
                  {revision.increment_type === 'PERCENT' &&
                  revision.increment_value
                    ? ` (${revision.increment_value}%)`
                    : ''}
                </Typography>
                <Typography fontSize={11.5} color={colors.grey[600]}>
                  effective {formatDate(revision.effective_date)}
                  {revision.is_retroactive ? ' · retroactive' : ''}
                  {revision.applied_payroll_run_id
                    ? ` · applied in run #${revision.applied_payroll_run_id}`
                    : ''}
                </Typography>
              </Box>
              <Stack direction="row" spacing={1} alignItems="center">
                <FeeStatusChip meta={REVISION_STATUS_META[revision.status]} />
                {revision.status === 'PENDING' &&
                permissions.can('payroll.revisions.approve') ? (
                  <>
                    <Button
                      size="small"
                      disabled={busy}
                      onClick={() => void decide(revision.id, 'APPROVE')}
                    >
                      Approve
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      disabled={busy}
                      onClick={() => void decide(revision.id, 'REJECT')}
                    >
                      Reject
                    </Button>
                  </>
                ) : null}
                {revision.status === 'APPROVED' && revision.is_retroactive ? (
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => void openArrears(revision.id)}
                  >
                    Arrears
                  </Button>
                ) : null}
              </Stack>
            </Stack>
          ))}
          {!(profile?.revisions ?? []).length ? (
            <Typography fontSize={12.5} color={colors.grey[600]}>
              No revision requested yet.
            </Typography>
          ) : null}

          {showRevisionForm ? (
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={1}
              alignItems={{ xs: 'stretch', md: 'flex-end' }}
              sx={{
                p: 1.25,
                borderRadius: 2,
                border: `1px dashed ${colors.grey[300]}`,
              }}
            >
              <Box sx={{ flex: 1 }}>
                <Typography fontSize={12} mb={0.5}>
                  Increment type
                </Typography>
                <SelectField
                  options={INCREMENT_TYPE_OPTIONS}
                  value={
                    INCREMENT_TYPE_OPTIONS.find(
                      (option) => option.value === incrementType
                    ) ?? null
                  }
                  onChange={(option) => {
                    const value = (
                      option as IOption<Payroll.IncrementType> | null
                    )?.value
                    if (value) {
                      setIncrementType(value)
                    }
                  }}
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                {incrementType === 'AMOUNT' ? (
                  <InputField
                    labelDetail={{ text: 'New amount', required: true }}
                    value={newAmount}
                    onChange={(event) => setNewAmount(event.target.value)}
                  />
                ) : (
                  <InputField
                    labelDetail={{ text: 'Increment %', required: true }}
                    value={incrementValue}
                    onChange={(event) => setIncrementValue(event.target.value)}
                  />
                )}
              </Box>
              <CustomDatePicker
                format="YYYY-MM-DD"
                labelDetail={{ text: 'Effective date', required: true }}
                views={['day', 'month', 'year']}
                value={revisionDate ? moment(revisionDate) : null}
                onChange={(value) =>
                  setRevisionDate(
                    value && moment(value).isValid()
                      ? moment(value).format('YYYY-MM-DD')
                      : todayIso()
                  )
                }
                slotProps={{ textField: { size: 'small' } }}
              />
              <Button
                variant="contained"
                size="small"
                disabled={
                  busy ||
                  (incrementType === 'AMOUNT' ? !newAmount : !incrementValue)
                }
                onClick={() => void createRevision()}
              >
                Request
              </Button>
            </Stack>
          ) : null}
        </Stack>
      </FeePanel>

      <Dialog
        open={arrearsOpen}
        onClose={() => setArrearsOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Arrears preview</DialogTitle>
        <DialogContent>
          {preview?.arrears ? (
            <Stack spacing={1.25} pt={1}>
              <Stack direction="row" spacing={3}>
                <Box>
                  <Typography fontSize={11} color={colors.grey[500]}>
                    Total arrears
                  </Typography>
                  <FeeAmount
                    value={preview.arrears.total}
                    strong
                    tone="success"
                  />
                </Box>
                <Box>
                  <Typography fontSize={11} color={colors.grey[500]}>
                    Periods considered
                  </Typography>
                  <Typography fontSize={14} fontWeight={700}>
                    {preview.paid_periods}
                  </Typography>
                </Box>
                <Box>
                  <Typography fontSize={11} color={colors.grey[500]}>
                    Overpaid
                  </Typography>
                  <FeeAmount value={preview.arrears.overpaid} tone="muted" />
                </Box>
              </Stack>
              <Stack spacing={0.75}>
                {preview.arrears.periods.map((period) => (
                  <Stack
                    key={period.period_key}
                    direction="row"
                    justifyContent="space-between"
                    sx={{
                      p: 1,
                      borderRadius: 2,
                      border: `1px solid ${colors.grey[200]}`,
                    }}
                  >
                    <Typography fontSize={12.5}>{period.period_key}</Typography>
                    <Typography fontSize={12} color={colors.grey[600]}>
                      expected {period.expected_basic} · paid{' '}
                      {period.paid_basic}
                    </Typography>
                    <FeeAmount value={period.difference} />
                  </Stack>
                ))}
              </Stack>
              <Typography fontSize={11.5} color={colors.grey[600]}>
                Creating the adjustment stores one ARREAR row per revision (the
                per-period breakdown stays in its details) and the next run
                picks it up once approved.
              </Typography>
            </Stack>
          ) : (
            <Typography fontSize={13} color={colors.grey[600]} pt={1}>
              No finalized period underpaid this revision, or the preview is
              still loading.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setArrearsOpen(false)}>Close</Button>
          <Button
            variant="contained"
            disabled={busy || !preview?.arrears}
            onClick={() => {
              if (!activeRevision) {
                return
              }
              void (async () => {
                try {
                  setBusy(true)
                  await dispatch(createArrearsAction(activeRevision)).unwrap()
                  await dispatch(getProfileAction(employeeId))
                  setArrearsOpen(false)
                } catch {
                  /* toast raised by the slice */
                } finally {
                  setBusy(false)
                }
              })()
            }}
          >
            Create adjustment
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  )
}
