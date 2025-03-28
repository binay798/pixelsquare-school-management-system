import { Alert, AlertTitle, Box, Stack, Typography } from '@mui/material'
import { ButtonComp } from '@src/components/button/button.component'
import { InputField } from '@src/components/input/input.component'
import { useDispatch, useSelector } from '@src/store/hooks.store'
import { editStudentTypeAction } from '@src/store/redux/dashboard/managestudent/studenttype/studenttype.slice'
import { useState } from 'react'

export function EditStudentType({ studentTypeId }: { studentTypeId: number }) {
  const dispatch = useDispatch()
  const [studentType, setStudentType] = useState('')
  const { loading: editStudentTypeLoading } = useSelector(
    (store) => store.studentType.editStudentType
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (studentType.trim() === '') {
      alert('Student Type is required')
      return
    }

    dispatch(
      editStudentTypeAction({
        payload: { studentType, studentTypeId: Number(studentTypeId) || 0 },
        onSuccess: () => {
          alert('Student Type updated successfully')
          setStudentType('')
        },
      })
    )
  }

  return (
    <Box>
      <Typography variant="h6" fontWeight={600}>
        Edit Designation
      </Typography>
      <br />
      <form onSubmit={handleSubmit}>
        <Alert severity="info" sx={{ mb: 2 }}>
          <AlertTitle>Student Type</AlertTitle>
          Students are assigned designations, which serve as a basis for
          performance analysis, career progression, and organizational
          structuring.
        </Alert>
        <InputField
          placeholder="Student Type"
          value={studentType}
          onChange={(e) => setStudentType(e.target.value)}
        />

        <Stack direction="row" mt={2} gap={2} justifyContent="flex-end">
          <ButtonComp size="medium" variant="text">
            Cancel
          </ButtonComp>
          <ButtonComp type="submit" disabled={editStudentTypeLoading}>
            {editStudentTypeLoading ? 'Updating...' : 'Update'}
          </ButtonComp>
        </Stack>
      </form>
    </Box>
  )
}
