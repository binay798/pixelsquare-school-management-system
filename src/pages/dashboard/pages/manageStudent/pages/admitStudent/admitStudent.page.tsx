import { Box, Stack, Typography } from '@mui/material'

import { CreateStudentComp } from '../../components/createStudentComp/createStudent.component'
import { useEffect } from 'react'
import { useDispatch } from '@src/store/hooks.store'
import { resetSelectedStudent } from '@src/store/redux/dashboard/manageStudents/manageStudents.slice'

export function AdmitStudentPage() {
  const dispatch = useDispatch()
  useEffect(() => {
    dispatch(resetSelectedStudent())
  }, [])

  return (
    <Box>
      <Box>
        <Stack
          mb={3}
          direction={'row'}
          spacing={1}
          justifyContent={'space-between'}
          alignItems={'center'}
        >
          <Box>
            <Typography variant="h5" fontWeight={600}>
              Admit Students
            </Typography>

            <Typography variant="body2" mt={1}>
              Update the school&apos;s details to keep records accurate and
              up-to-date.
            </Typography>
          </Box>
        </Stack>
      </Box>
      <CreateStudentComp />
    </Box>
  )
}
