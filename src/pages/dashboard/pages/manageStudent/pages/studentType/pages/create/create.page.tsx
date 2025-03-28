import { Box, Card, Stack, Typography } from '@mui/material'
import { ButtonComp } from '@src/components/button/button.component'
import { FormBlock } from '@src/components/formBlock/formBlock.component'
import { InputField } from '@src/components/input/input.component'
import { useDispatch, useSelector } from '@src/store/hooks.store'
import { createStudentTypeAction } from '@src/store/redux/dashboard/managestudent/studenttype/studenttype.slice'
import { useState } from 'react'

export const CreateStudentType = () => {
  const dispatch = useDispatch()
  const [studentType, setStudentType] = useState('')

  const { loading: createStudentTypeLoading } = useSelector(
    (store) => store.studentType.createStudentType
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!studentType.trim()) return

    dispatch(createStudentTypeAction({ name: studentType }))
    setStudentType('')
  }

  return (
    <Box>
      <Box mb={3}>
        <Typography variant="h5" fontWeight={600}>
          Create Student Type
        </Typography>
      </Box>
      <Card sx={{ p: 2 }}>
        <form onSubmit={handleSubmit}>
          <FormBlock title="Student Type">
            <Stack spacing={2}>
              <InputField
                name="student_type"
                placeholder="Enter Student Type"
                labelDetail={{ text: 'Student Type Name', required: true }}
                value={studentType}
                onChange={(e) => setStudentType(e.target.value)}
              />
              <ButtonComp
                loading={createStudentTypeLoading}
                type="submit"
                size="medium"
              >
                Create Student
              </ButtonComp>
            </Stack>
          </FormBlock>
        </form>
      </Card>
    </Box>
  )
}
