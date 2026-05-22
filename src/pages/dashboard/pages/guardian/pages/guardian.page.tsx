import { Avatar, Box, Stack, Typography } from '@mui/material'
import { ButtonComp } from '@src/components/button/button.component'
import { TableComp } from '@src/components/tableComp/tableComp.components'
import { getImageUrl } from '@src/helpers/getImageUrl.helpers'
import { usePage } from '@src/helpers/getPageParams.helper'
import { useDispatch, useSelector } from '@src/store/hooks.store'
import { listGuardians } from '@src/store/redux/dashboard/guardian/guardian.slice'
import { useCallback, useEffect } from 'react'
import { GoPlus } from 'react-icons/go'
import { useNavigate } from 'react-router-dom'

export function GuardianPage() {
  const { page, limit } = usePage()
  const dispatch = useDispatch()
  const { data: guardianList } = useSelector((store) => store.guardians.list)
  const navigate = useNavigate()

  useEffect(() => {
    dispatch(listGuardians({ payload: { page, limit } }))
  }, [page, limit])

  const remappedGuardianList = useCallback(() => {
    return guardianList?.rows?.map((el) => ({
      id: el.guardian_details.id,
      name: `${el.user_profile_details.firstname} ${el.user_profile_details.lastname}`,
      mobile: el.user_profile_details.mobile,
      email: el.user_details.email,
      gender: el.user_profile_details.gender,
      photo: getImageUrl(el.asset_details.path),
    }))
  }, [guardianList])

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
            Manage Guardian
          </Typography>

          <Typography variant="body2" mt={1}>
            Update the school&apos;s details to keep records accurate and
            up-to-date.
          </Typography>
        </Box>
        <ButtonComp
          onClick={() => {
            navigate('/dashboard/guardian/create')
            // toggleOpenCreateModal(true)
            // setOpenCreateDepartment(true)
            // toggleOpenCreateClass(true)
          }}
          startIcon={<GoPlus />}
          size="medium"
        >
          Create
        </ButtonComp>
      </Stack>

      <TableComp
        columns={[
          {
            field: 'photo',
            name: 'Profile Photo',
            render: (_, item) => <Avatar src={item.photo} />,
          },
          { field: 'name', name: 'Name', render: (_, item) => `${item.name}` },
          { field: 'email', name: 'Email Address' },
          { field: 'mobile', name: 'Gender' },
        ]}
        loading={false}
        data={remappedGuardianList() ?? []}
        actions={{
          onEdit: (item) => {
            // setEditClassDetails(item)
            // setOpenCreateClass(true)
            // navigate(
            //   `/dashboard/human-resources/manage-employee/edit/${item.employee_id}`
            // )
            navigate(`/dashboard/guardian/edit/${item.id}`)
          },
          onDelete: () => {},
        }}
        showPagination={true}
        page={page}
        rowsPerPage={limit}
        search={() => {
          // handleSearchEmployee(txt)
        }}
      ></TableComp>
    </Box>
  )
}
