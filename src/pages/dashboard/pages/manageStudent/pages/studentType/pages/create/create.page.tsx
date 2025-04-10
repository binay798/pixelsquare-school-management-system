import { Alert, AlertTitle, Box, Stack, Typography } from '@mui/material'
import { ButtonComp } from '@src/components/button/button.component'
import { InputField } from '@src/components/input/input.component'
import SpringModal from '@src/components/modal/modal.component'
import { useDispatch, useSelector } from '@src/store/hooks.store'
import {
  createStudentTypeAction,
  getStudentTypeListAction,
} from '@src/store/redux/dashboard/managestudent/studenttype/studenttype.slice'
import { useState } from 'react'
import { usePage } from '@src/helpers/getPageParams.helper'

interface Props {
  open: boolean
  onClose: () => void
}

export const CreateStudentType = (props: Props) => {
  const dispatch = useDispatch()
  const { page, limit } = usePage()
  const [studentType, setStudentType] = useState('')
  const [error, setError] = useState('')

  const { loading: createStudentTypeLoading } = useSelector(
    (store) => store.studentType.createStudentType
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!studentType.trim()) {
      setError('Student type is required')
      return
    }

    setError('')
    dispatch(
      createStudentTypeAction({
        name: studentType.trim(),
        onSuccess: () => {
          props.onClose()
          setStudentType('')
          dispatch(getStudentTypeListAction({ payload: { page, limit } }))
        },
      })
    )
  }

  return (
    <SpringModal open={props.open} close={props.onClose}>
      <Box>
        <Typography variant="h6" fontWeight={600}>
          Create Student Type
        </Typography>
        <br />
        <form onSubmit={handleSubmit}>
          <Alert severity="info" sx={{ mb: 2 }}>
            <AlertTitle>Student Type</AlertTitle>
            Student Types categorize students for structuring, reporting, and
            performance tracking.
          </Alert>

          <InputField
            name="student_type"
            placeholder="Enter Student Type"
            labelDetail={{ text: 'Student Type Name', required: true }}
            value={studentType}
            onChange={(e) => setStudentType(e.target.value)}
            error={!!error}
            helperText={error}
          />

          <Stack direction={'row'} mt={2} gap={2} justifyContent={'flex-end'}>
            <ButtonComp size="medium" variant="text" onClick={props.onClose}>
              Cancel
            </ButtonComp>
            <ButtonComp
              loading={createStudentTypeLoading}
              type="submit"
              size="medium"
              disabled={!studentType.trim()}
            >
              Create
            </ButtonComp>
          </Stack>
        </form>
      </Box>
    </SpringModal>
  )
}
