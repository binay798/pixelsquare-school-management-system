import { Alert, AlertTitle, Box, Stack, Typography } from '@mui/material'
import { ButtonComp } from '@src/components/button/button.component'
import { InputField } from '@src/components/input/input.component'
import SpringModal from '@src/components/modal/modal.component'
import { useDispatch, useSelector } from '@src/store/hooks.store'
import { useState, useEffect } from 'react'
import {
  editStudentTypeAction,
  getStudentTypeListAction,
} from '@src/store/redux/dashboard/managestudent/studenttype/studenttype.slice'
import { usePage } from '@src/helpers/getPageParams.helper'

interface Props {
  open: boolean
  onClose: () => void
  studentType: Student.IStudentType | null
}

export function EditStudentType({ open, onClose, studentType }: Props) {
  const dispatch = useDispatch()
  const { page, limit } = usePage()
  const { loading: editStudentTypeLoading } = useSelector(
    (store) => store.studentType.editStudentType
  )

  const [studentTypeName, setStudentTypeName] = useState('')

  useEffect(() => {
    if (studentType?.name) {
      setStudentTypeName(studentType.name)
    }
  }, [studentType])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!studentTypeName.trim() || !studentType) return

    dispatch(
      editStudentTypeAction({
        payload: {
          studentType: studentTypeName.trim(),
          studentTypeId: studentType.id,
        },
        onSuccess: () => {
          onClose()
          setStudentTypeName('')
          dispatch(getStudentTypeListAction({ payload: { page, limit } }))
        },
      })
    )
  }

  return (
    <SpringModal open={open} close={onClose}>
      <Box>
        <Typography variant="h6" fontWeight={600}>
          Edit Student Type
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
            type="text"
            placeholder="Student Type"
            labelDetail={{ required: true, text: 'Student Type' }}
            value={studentTypeName}
            onChange={(e) => setStudentTypeName(e.target.value)}
          />
          <Stack direction="row" mt={2} gap={2} justifyContent="flex-end">
            <ButtonComp size="medium" variant="text" onClick={onClose}>
              Cancel
            </ButtonComp>
            <ButtonComp
              loading={editStudentTypeLoading}
              type="submit"
              size="medium"
              disabled={!studentTypeName.trim()}
            >
              Update
            </ButtonComp>
          </Stack>
        </form>
      </Box>
    </SpringModal>
  )
}
