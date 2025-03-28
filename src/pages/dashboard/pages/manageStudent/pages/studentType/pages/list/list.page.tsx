import { Typography } from '@mui/material'
import { Box, Stack } from '@mui/system'
import { ButtonComp } from '@src/components/button/button.component'
import { TableComp } from '@src/components/tableComp/tableComp.components'
import { GoPlus } from 'react-icons/go'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from '@src/store/hooks.store'
import { useEffect } from 'react'
import { getStudentTypeListAction } from '@src/store/redux/dashboard/managestudent/studenttype/studenttype.slice'

export const ListStudentType = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { data: studentTypeList, loading: studentTypeLoading } = useSelector(
    (store) => store.studentType.studentTypelist
  )

  useEffect(() => {
    dispatch(getStudentTypeListAction({ payload: { page: 1, limit: 10 } }))
    // console.log(studentTypeList)
  }, [dispatch])

  return (
    <Box>
      <Stack
        mb={3}
        direction="row"
        spacing={1}
        justifyContent="space-between"
        alignItems="center"
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
          onClick={() => navigate('/dashboard/manage-student/create')}
          startIcon={<GoPlus />}
          size="medium"
        >
          Create
        </ButtonComp>
      </Stack>

      <TableComp
        columns={[{ field: 'name', name: 'Name' }]}
        data={studentTypeList || []}
        loading={studentTypeLoading}
        actions={{
          onEdit: (item: { id: string | number }) => {
            navigate(`/dashboard/manage-student/edit/${item.id}`)
          },
        }}
        count={Math.ceil(Number(studentTypeList?.total) / 10)}
        page={1}
        rowsPerPage={10}
        showPagination={true}
      />
    </Box>
  )
}
