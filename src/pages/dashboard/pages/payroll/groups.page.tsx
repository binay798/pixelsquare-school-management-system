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
import { useEffect, useState } from 'react'
import { Users } from 'lucide-react'
import { ButtonComp } from '@src/components/button/button.component'
import { InputField } from '@src/components/input/input.component'
import { SelectField } from '@src/components/select/select.component'
import { colors } from '@src/helpers/colors.helpers'
import { useDispatch, useSelector } from '@src/store/hooks.store'
import {
  createGroupAction,
  deactivateGroupAction,
  getGroupsAction,
  getStructuresAction,
} from '@src/store/redux/dashboard/payroll/payroll.slice'
import { usePayrollPermissions } from '@src/hooks/usePayrollPermissions.hooks'
import {
  FeeCellStack,
  FeeDataTable,
} from '../fees/components/feeDataTable.component'
import type { IFeeColumn } from '../fees/components/feeDataTable.component'
import { FeePageHeader } from '../fees/components/feePageHeader.component'
import { FeePanel } from '../fees/components/feePanel.component'
import { FREQUENCY_OPTIONS, PAYROLL_BASE_PATH } from './payroll.helpers'
import type { IOption } from './payroll.helpers'

/** Payroll groups: a named subset of employees (e.g. teaching vs support staff). */
export function PayrollGroupsPage() {
  const dispatch = useDispatch()
  const permissions = usePayrollPermissions()

  const { data, loading } = useSelector((store) => store.payroll.groups)
  const { data: structures } = useSelector((store) => store.payroll.structures)

  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [name, setName] = useState('')
  const [frequency, setFrequency] = useState<Payroll.Frequency>('MONTHLY')
  const [structureId, setStructureId] = useState<number | null>(null)

  useEffect(() => {
    dispatch(getGroupsAction())
    dispatch(getStructuresAction())
  }, [dispatch])

  const structureOptions: IOption<string>[] = (structures ?? []).map(
    (structure) => ({
      value: String(structure.id),
      label: `${structure.code} · ${structure.name}`,
    })
  )

  const create = async () => {
    try {
      setBusy(true)
      await dispatch(
        createGroupAction({
          name,
          frequency,
          default_structure_id: structureId,
        })
      ).unwrap()
      await dispatch(getGroupsAction())
      setOpen(false)
      setName('')
      setStructureId(null)
    } catch {
      /* toast raised by the slice */
    } finally {
      setBusy(false)
    }
  }

  const deactivate = async (groupId: number) => {
    try {
      setBusy(true)
      await dispatch(deactivateGroupAction(groupId)).unwrap()
      await dispatch(getGroupsAction())
    } catch {
      /* toast raised by the slice */
    } finally {
      setBusy(false)
    }
  }

  const columns: IFeeColumn<Payroll.IPayrollGroup>[] = [
    {
      key: 'group',
      label: 'Group',
      render: (row) => (
        <FeeCellStack
          primary={row.name}
          secondary={`${row.frequency}${row.is_active ? '' : ' · inactive'}`}
        />
      ),
    },
    {
      key: 'structure',
      label: 'Default structure',
      hideBelow: 'md',
      render: (row) => (
        <Typography fontSize={12.5} color={colors.grey[700]}>
          {structureOptions.find(
            (option) => option.value === String(row.default_structure_id ?? '')
          )?.label ?? '—'}
        </Typography>
      ),
    },
    {
      key: 'periods',
      label: 'Periods',
      align: 'right',
      render: (row) => (
        <Typography fontSize={12.5}>{row.period_count}</Typography>
      ),
    },
    {
      key: 'runs',
      label: 'Runs',
      align: 'right',
      hideBelow: 'md',
      render: (row) => <Typography fontSize={12.5}>{row.run_count}</Typography>,
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (row) =>
        permissions.canManageComponents && row.is_active ? (
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
        title="Payroll groups"
        subtitle="A group splits the payroll (teaching staff, support staff, a branch) and can carry its own default structure."
        backTo={PAYROLL_BASE_PATH}
        backLabel="Payroll"
        actions={
          permissions.canManageComponents ? (
            <ButtonComp
              size="small"
              variant="contained"
              onClick={() => setOpen(true)}
            >
              New group
            </ButtonComp>
          ) : null
        }
      />

      <FeePanel
        noPadding
        title="Groups"
        subtitle="Periods and runs can be scoped to a group; inactive groups stay as history."
      >
        <FeeDataTable
          columns={columns}
          rows={data ?? []}
          rowKey={(row) => row.id}
          loading={loading}
          skeletonRows={5}
          emptyIcon={<Users size={20} />}
          emptyTitle="No payroll group"
          emptyDescription="Create one group per payroll population you pay separately."
        />
      </FeePanel>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>New payroll group</DialogTitle>
        <DialogContent>
          <Stack spacing={1.5} pt={1}>
            <InputField
              labelDetail={{ text: 'Name', required: true }}
              placeholder="Teaching staff"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
            <Box>
              <Typography fontSize={13} mb={0.75}>
                Frequency
              </Typography>
              <SelectField
                options={FREQUENCY_OPTIONS}
                value={
                  FREQUENCY_OPTIONS.find(
                    (option) => option.value === frequency
                  ) ?? null
                }
                onChange={(option) => {
                  const value = (option as IOption<Payroll.Frequency> | null)
                    ?.value
                  if (value) {
                    setFrequency(value)
                  }
                }}
              />
            </Box>
            <Box>
              <Typography fontSize={13} mb={0.75}>
                Default structure (optional)
              </Typography>
              <SelectField
                isClearable
                placeholder="No default"
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
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            disabled={busy || name.trim().length < 2}
            onClick={() => void create()}
          >
            Create group
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
