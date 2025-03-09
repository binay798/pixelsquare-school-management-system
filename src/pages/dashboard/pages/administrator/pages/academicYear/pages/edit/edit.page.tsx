import { Box } from '@mui/material'
import { AcademicYearForm } from '../../components/academicYearForm/academicYearForm.component'
import { useParams } from 'react-router-dom'
import { useEffect } from 'react'

export function EditAcademicYear() {
  const { academicYearId } = useParams()

  useEffect(() => {}, [academicYearId])

  return (
    <Box>
      <AcademicYearForm />
    </Box>
  )
}
