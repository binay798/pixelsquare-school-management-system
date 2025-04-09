import { Box, Stack, Typography } from '@mui/material'
import { ButtonComp } from '@src/components/button/button.component'
import { GoPlus } from 'react-icons/go'
import { CreateSubjectModal } from './components/createSubjectModal/createSubjectModal.component'
import { useState } from 'react'

export function ClassSubjectsPage() {
  const [openCreateSubject, setOpenCreateSubject] = useState(false)
  const toggleCloseCreateSubject = (val: boolean) => {
    setOpenCreateSubject(val)
  }

  return (
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
            Manage Subjects
          </Typography>

          <Typography variant="body2" mt={1}>
            Update the school&apos;s details to keep records accurate and
            up-to-date.
          </Typography>
        </Box>
        <ButtonComp
          onClick={() => {
            // navigate('/dashboard/teachers/create')
            // toggleOpenCreateModal(true)
            // setOpenCreateDepartment(true)
            toggleCloseCreateSubject(true)
          }}
          startIcon={<GoPlus />}
          size="medium"
        >
          Create
        </ButtonComp>
      </Stack>
      {/* CREATE SUBJECT MODAL */}
      <CreateSubjectModal
        open={openCreateSubject}
        onClose={() => toggleCloseCreateSubject(false)}
        details={null}
      />
    </Box>
  )
}
