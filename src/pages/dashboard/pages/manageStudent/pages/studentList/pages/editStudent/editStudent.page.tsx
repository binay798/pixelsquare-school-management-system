import { Box, Stack, Typography } from '@mui/material'
import { CreateStudentComp } from '../../../../components/createStudentComp/createStudent.component'
import { useParams } from 'react-router-dom'
import { useEffect } from 'react'
import { isEmpty } from 'lodash'
import { useDispatch } from '@src/store/hooks.store'
import { getStudentDetailAction } from '@src/store/redux/dashboard/manageStudents/manageStudents.slice'

export function EditStudentPage() {
  const { studentId } = useParams()
  const dispatch = useDispatch()

  useEffect(() => {
    // FETCH STUDENT DETAILS
    if (!isEmpty(studentId)) {
      dispatch(getStudentDetailAction({ studentId: Number(studentId) }))
    }
  }, [studentId])

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
              Edit Student
            </Typography>

            <Typography variant="body2" mt={1}>
              Update the school&apos;s details to keep records accurate and
              up-to-date.
            </Typography>
          </Box>
        </Stack>
      </Box>
      <CreateStudentComp details={null} />
    </Box>
  )
}
