import { Box, Card, Stack, Typography } from '@mui/material'
import { AddItemCard } from '@src/components/addItemCard/addItemCard.component'
import { CreateStudentTypeModal } from './components/createStudentTypeModal/createStudentTypeModal.component'
import { useEffect, useState } from 'react'
import { StudentTypeCard } from './components/studentTypeCard/studentTypeCard.component'
import { StudentTypeContainer } from './studentType.styles'
import { useDispatch, useSelector } from '@src/store/hooks.store'
import { Loader } from '@src/components/loader/loader.component'
import { getStudentTypeListAction } from '@src/store/redux/dashboard/manageStudents/manageStudents.slice'
import { DeleteConfirmationModal } from '@src/components/confirmationModal/deleteConfirmationModal.component'
import { IoWarningOutline } from 'react-icons/io5'
import { colors } from '@src/helpers/colors.helpers'

export function StudentTypePage() {
  const [openCreateStudentType, setOpenCreateStudentType] = useState(false)
  const [selectedStudentType, setSelectedStudentType] =
    useState<Students.IStudentType | null>(null)
  const [openDeleteType, setOpenDeleteType] = useState(false)
  const dispatch = useDispatch()
  const { data: studentTypeList, loading: studentTypeLoading } = useSelector(
    (store) => store.manageStudents.studentType.studentTypeList
  )
  const toggleModalState = (val: boolean) => {
    setOpenCreateStudentType(val)
  }

  useEffect(() => {
    dispatch(getStudentTypeListAction({}))
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
              Student Type
            </Typography>
            <Typography variant="body2" mt={1}>
              Update the school&apos;s details to keep records accurate and
              up-to-date.
            </Typography>
          </Box>
          {/* <ButtonComp
            onClick={() => {
              // toggleOpenCreateModal(true)
            }}
            startIcon={<GoPlus />}
            size="medium"
          >
            Create
          </ButtonComp> */}
          <CreateStudentTypeModal
            onClose={() => toggleModalState(false)}
            open={openCreateStudentType}
            details={selectedStudentType}
          />
        </Stack>
      </Box>
      <Box>
        <StudentTypeContainer>
          {studentTypeLoading ? <Loader /> : null}
          {studentTypeList?.map((el, id) => (
            <StudentTypeCard
              key={id}
              data={el}
              edit={(val) => {
                setSelectedStudentType(val)
                setOpenCreateStudentType(true)
              }}
              delete={(arg) => {
                setSelectedStudentType(arg)
                setOpenDeleteType(true)
              }}
            />
          ))}

          <AddItemCard
            title="Add Student Type"
            onClick={() => toggleModalState(true)}
          />
        </StudentTypeContainer>
      </Box>
      {/* DELETE CONFIRMATION MODAL */}
      <DeleteConfirmationModal
        onClose={() => {
          setOpenDeleteType(false)
          setSelectedStudentType(null)
        }}
        open={openDeleteType}
        onConfirmationClick={() => {}}
      >
        <Card
          sx={{
            p: 2,
            background: '#fefcea',
            border: `0.5px solid ${colors.grey[300]}`,
            borderRadius: 2,
          }}
        >
          <Stack
            direction={'row'}
            spacing={1}
            alignItems={'center'}
            justifyContent={'center'}
            mb={1}
          >
            <IoWarningOutline color={colors.red[400]} size={22} />
            <Typography fontWeight={600} color="error">
              Warning
            </Typography>
          </Stack>
          <Typography color="error" fontWeight={500}>
            This action is permanent and cannot be undone. Once deleted, the
            data will be lost and cannot be recovered
          </Typography>
        </Card>
      </DeleteConfirmationModal>
    </Box>
  )
}
