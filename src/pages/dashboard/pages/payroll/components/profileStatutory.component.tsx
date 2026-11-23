import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Stack,
  Typography,
} from '@mui/material'
import { useEffect, useState } from 'react'
import { colors } from '@src/helpers/colors.helpers'
import { useDispatch, useSelector } from '@src/store/hooks.store'
import {
  getProfileAction,
  getStatutoryEnrollmentsAction,
  setStatutoryEnrollmentsAction,
} from '@src/store/redux/dashboard/payroll/payroll.slice'
import { usePayrollPermissions } from '@src/hooks/usePayrollPermissions.hooks'
import { FeePanel } from '../../fees/components/feePanel.component'

interface Props {
  employeeId: number
}

/**
 * Statutory scheme enrollment of one employee.
 *
 * The payroll engine applies **all** active rules when the employee has no
 * enrollment row, and only the selected schemes (plus income tax, which always
 * applies) once a selection exists. The panel therefore explains that an empty
 * selection is not "no scheme".
 */
export function ProfileStatutoryComponent({ employeeId }: Props) {
  const dispatch = useDispatch()
  const permissions = usePayrollPermissions()

  const { data, loading } = useSelector(
    (store) => store.payroll.statutoryEnrollments
  )

  const [selected, setSelected] = useState<number[]>([])
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    dispatch(getStatutoryEnrollmentsAction(employeeId))
  }, [dispatch, employeeId])

  useEffect(() => {
    setSelected(
      (data?.rules ?? [])
        .filter((rule) => rule.is_enrolled)
        .map((rule) => rule.rule_id)
    )
  }, [data])

  const toggle = (ruleId: number, checked: boolean) => {
    setSelected((prev) =>
      checked
        ? [...new Set([...prev, ruleId])]
        : prev.filter((id) => id !== ruleId)
    )
  }

  const save = async () => {
    try {
      setBusy(true)
      await dispatch(
        setStatutoryEnrollmentsAction({ employeeId, ruleIds: selected })
      ).unwrap()
      await dispatch(getProfileAction(employeeId))
    } catch {
      /* toast raised by the slice */
    } finally {
      setBusy(false)
    }
  }

  return (
    <FeePanel
      title="Statutory schemes"
      subtitle="PF / SSF / CIT / insurance the employee is enrolled in. Income tax always applies."
      action={
        permissions.can('payroll.profiles.manage') ? (
          <Button
            size="small"
            variant="contained"
            disabled={busy || loading}
            onClick={() => void save()}
          >
            Save enrollments
          </Button>
        ) : null
      }
    >
      <Stack spacing={1}>
        {data?.mode === 'ALL' ? (
          <Typography fontSize={12} color={colors.grey[600]}>
            No explicit enrollment yet: every active statutory rule applies.
            Selecting one or more schemes narrows payroll to that selection.
          </Typography>
        ) : null}

        {(data?.rules ?? []).length ? (
          data!.rules.map((rule) => (
            <Box
              key={rule.rule_id}
              sx={{
                px: 1.25,
                py: 0.75,
                borderRadius: 2,
                border: `1px solid ${colors.grey[200]}`,
              }}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    size="small"
                    checked={selected.includes(rule.rule_id)}
                    onChange={(event) =>
                      toggle(rule.rule_id, event.target.checked)
                    }
                  />
                }
                label={
                  <Typography fontSize={12.5}>
                    {rule.code} · {rule.name} — {rule.employee_rate}% employee /{' '}
                    {rule.employer_rate}% employer
                  </Typography>
                }
              />
            </Box>
          ))
        ) : (
          <Typography fontSize={12.5} color={colors.grey[600]}>
            No active statutory rule. Publish one on the Statutory rules screen.
          </Typography>
        )}
      </Stack>
    </FeePanel>
  )
}
