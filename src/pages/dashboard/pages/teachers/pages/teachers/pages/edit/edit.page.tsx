import { Box } from '@mui/material'
import { CreateTeacherComp } from '../../components/createTeacherComp/createTeacher.component'
import { useParams } from 'react-router-dom'
import { useEffect } from 'react'
import { useDispatch } from '@src/store/hooks.store'
import { getTeacherDetailAction } from '@src/store/redux/dashboard/teachers/teachers.slice'

export function EditTeacherPage() {
  const { teacherId } = useParams()
  const dispatch = useDispatch()

  useEffect(() => {
    if (teacherId) {
      // GET TEACHER DETAIL
      dispatch(getTeacherDetailAction({ teacherId: Number(teacherId) }))
    }
  }, [teacherId])

  return (
    <Box>
      <CreateTeacherComp />
    </Box>
  )
}
