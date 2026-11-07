import { Box, Card, Stack, Typography } from '@mui/material'
import { useEffect, useMemo } from 'react'
import { ROLE } from '@src/constants/users.constants'
import { colors } from '@src/helpers/colors.helpers'
import { useDispatch, useSelector } from '@src/store/hooks.store'
import { getMyRoutineListAction } from '@src/store/redux/dashboard/academics/classRoutines/classRoutines.slice'
import { AdminRoutineView } from './components/adminRoutineView/adminRoutineView.component'
import { MyRoutineView } from './components/myRoutineView/myRoutineView.component'

export function ClassRoutinesPage() {
  const dispatch = useDispatch()
  const { data: auth } = useSelector((store) => store.auth.user)

  const userRoles = auth?.userRoles ?? []

  const isAdmin = useMemo(
    () => userRoles.includes(ROLE.admin) || userRoles.includes(ROLE.superadmin),
    [userRoles]
  )
  const isTeacherOrStudent = useMemo(
    () => userRoles.includes(ROLE.teacher) || userRoles.includes(ROLE.student),
    [userRoles]
  )

  useEffect(() => {
    if (!isAdmin && isTeacherOrStudent) {
      dispatch(getMyRoutineListAction(undefined))
    }
  }, [dispatch, isAdmin, isTeacherOrStudent])

  return (
    <Box>
      <Stack
        mb={3}
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1}
        justifyContent={'space-between'}
        alignItems={{ xs: 'flex-start', sm: 'center' }}
      >
        <Box>
          <Typography variant="h5" fontWeight={600}>
            Class Routine
          </Typography>

          <Typography variant="body2" mt={1} color={colors.grey[600]}>
            {isAdmin
              ? 'Assign subjects and teachers to class periods and manage the schedule setup.'
              : 'View your weekly class schedule with periods, subjects and teachers.'}
          </Typography>
        </Box>
      </Stack>

      {isAdmin ? <AdminRoutineView /> : null}
      {!isAdmin && isTeacherOrStudent ? <MyRoutineView /> : null}
      {!isAdmin && !isTeacherOrStudent ? (
        <Card sx={{ p: 3, borderRadius: 2 }}>
          <Typography fontSize={14} color={colors.grey[600]}>
            Class routines are available for admins, teachers and students only.
          </Typography>
        </Card>
      ) : null}
    </Box>
  )
}
