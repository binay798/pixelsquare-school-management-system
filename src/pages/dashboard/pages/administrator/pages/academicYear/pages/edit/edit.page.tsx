import { Box } from '@mui/material'
import { AcademicYearForm } from '../../components/academicYearForm/academicYearForm.component'
import { useParams } from 'react-router-dom'
import { useEffect } from 'react'
import { useDispatch } from '@src/store/hooks.store'
import { getAcademicYearDetailsSlice } from '@src/store/redux/dashboard/academicYear/academicYear.slice'

export function EditAcademicYear() {
  const { academicYearId } = useParams()
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(
      getAcademicYearDetailsSlice({
        payload: { academicYearId: Number(academicYearId) },
      })
    )
  }, [academicYearId])

  return (
    <Box>
      <AcademicYearForm />
    </Box>
  )
}
