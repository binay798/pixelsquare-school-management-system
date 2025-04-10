import { Typography } from '@mui/material'
import { Box, Stack } from '@mui/system'
import { ButtonComp } from '@src/components/button/button.component'
import { TableComp } from '@src/components/tableComp/tableComp.components'
import { GoPlus } from 'react-icons/go'
import { useDispatch, useSelector } from '@src/store/hooks.store'
import { useEffect, useState } from 'react'
import {
  getStudentTypeListAction,
  deleteStudentTypeAction,
} from '@src/store/redux/dashboard/managestudent/studenttype/studenttype.slice'
import { CreateStudentType } from '../create/create.page'
import { EditStudentType } from '../edit/edit.page'
import { isEmpty } from 'lodash'
import { usePage } from '@src/helpers/getPageParams.helper'

export const ListStudentType = () => {
  const [openCreateModal, setOpenCreateModal] = useState(false)
  const [selectedStudentType, setSelectedStudentType] =
    useState<Student.IStudentType | null>(null)
  const toggleOpenCreateModal = (val: boolean) => {
    setOpenCreateModal(val)
  }
  const dispatch = useDispatch()
  const { page, limit } = usePage()
  const { data: studentTypeList, loading: studentTypeLoading } = useSelector(
    (state) => state.studentType.studentTypelist
  )

  // console.log(studentTypeList)

  const { loading: deleteLoading } = useSelector(
    (store) => store.studentType.deleteStudentType
  )

  useEffect(() => {
    dispatch(getStudentTypeListAction({ payload: { page, limit } }))
  }, [page, limit])

  return (
    <Box>
      <Box>
        <Stack
          mb={3}
          direction="row"
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
              up-to-date
            </Typography>
          </Box>
          <ButtonComp
            onClick={() => {
              toggleOpenCreateModal(true)
            }}
            startIcon={<GoPlus />}
            size="medium"
          >
            Create
          </ButtonComp>
        </Stack>
        <CreateStudentType
          open={openCreateModal}
          onClose={() => toggleOpenCreateModal(false)}
        />
      </Box>
      <TableComp
        columns={[
          { field: 'name', name: 'Name' },
          { field: 'created_at', name: 'Created At' },
          { field: 'updated_at', name: 'Updated At' },
        ]}
        data={studentTypeList?.rows ?? []}
        actions={{
          onEdit: (item: Student.IStudentType) => {
            setSelectedStudentType(item)
          },
          onDelete: (item, onClose) => {
            dispatch(
              deleteStudentTypeAction({
                payload: { studentTypeId: item.id },
                onSuccess: () => {
                  dispatch(
                    getStudentTypeListAction({
                      payload: { page, limit },
                    })
                  )
                  onClose?.()
                },
              })
            )
          },
        }}
        // count={Math.ceil(Number(studentTypeList?.total) / 10)}
        loading={studentTypeLoading}
        count={Number(studentTypeList?.total)}
        page={page}
        rowsPerPage={limit}
        showPagination={true}
        deleteConfirmLoader={deleteLoading}
      ></TableComp>
      {/* EDIT STUDENT TYPE */}
      <EditStudentType
        open={!isEmpty(selectedStudentType)}
        onClose={() => {
          setSelectedStudentType(null)
        }}
        studentType={selectedStudentType}
      ></EditStudentType>
    </Box>
  )
}
