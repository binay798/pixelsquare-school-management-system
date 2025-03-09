import { Box, Stack, Typography } from '@mui/material'
import { GoPlus } from 'react-icons/go'
import { ButtonComp } from '@src/components/button/button.component'
import { TableComp } from '@src/components/tableComp/tableComp.components'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from '@src/store/hooks.store'
import { getAcademicYearListSlice } from '@src/store/redux/dashboard/academicYear/academicYear.slice'
import moment from 'moment'
import { CustomChip } from '@src/components/chip/chip.component'
import { ConfirmationModal } from '@src/components/confirmationModal/confirmationModal.component'
import { DeleteConfirmationModal } from '@src/components/confirmationModal/deleteConfirmationModal.component'

export function AcademicYear() {
  const [openActivateModal, setOpenActivateModal] = useState(false)
  const [openDeleteModal, setOpenDeleteModal] = useState(false)
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { data, loading } = useSelector(
    (store) => store.academicYear.academicYearList
  )

  useEffect(() => {
    dispatch(getAcademicYearListSlice({ query: { page: 1, limit: 10 } }))
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
              Academic Year
            </Typography>
            <Typography variant="body2" mt={1}>
              Update the school&apos;s details to keep records accurate and
              up-to-date.
            </Typography>
          </Box>
          <ButtonComp
            onClick={() => {
              navigate('/dashboard/administrator/academic-year/create')
            }}
            startIcon={<GoPlus />}
            size="medium"
          >
            Create
          </ButtonComp>
        </Stack>
        {/* <Card sx={{ p: 2, minHeight: '80vh' }}> */}
        <TableComp
          columns={[
            { field: 'name', name: 'Name' },
            {
              field: 'session_start_at',
              name: 'Session Start',
              render: (_, item) => (
                <span>
                  {moment(item.session_start_at).format('YYYY-MM-DD')}
                </span>
              ),
            },
            {
              field: 'session_end_at',
              name: 'Session End',
              render: (_, item) => (
                <span>{moment(item.session_end_at).format('YYYY-MM-DD')}</span>
              ),
            },
            { field: 'note', name: 'Note' },
            {
              field: 'is_active',
              name: 'Status',
              render: (_, item) => (
                <span>
                  <CustomChip
                    label={item?.is_active ? 'Active' : 'In active'}
                    type={item?.is_active ? 'success' : 'error'}
                  />
                </span>
              ),
            },
            {
              field: 'custom',
              name: 'Change Active Status',
              render: (_, item) => (
                <Stack direction={'row'} spacing={1} justifyContent={'center'}>
                  {!item?.is_active ? (
                    <ButtonComp
                      color="success"
                      onClick={() => setOpenActivateModal(true)}
                    >
                      Activate
                    </ButtonComp>
                  ) : (
                    <ButtonComp color="error" variant="contained">
                      Deactivate
                    </ButtonComp>
                  )}
                </Stack>
              ),
            },
          ]}
          data={data ?? []}
          actions={{
            onEdit: (item) => {
              navigate(`/dashboard/administrator/academic-year/${item.id}/edit`)
            },
            onDelete: () => {
              setOpenDeleteModal(true)
            },
          }}
          loading={loading}
          showPagination={false}
        ></TableComp>
        {/* </Card> */}
        <ConfirmationModal
          onClose={() => {
            setOpenActivateModal(false)
          }}
          onConfirmationClick={() => {}}
          open={openActivateModal}
          confirmText="Activate"
        >
          <Typography>
            This will activate new academic year which will then be used as a
            base for latest data.
          </Typography>
        </ConfirmationModal>
        <DeleteConfirmationModal
          onClose={() => {
            setOpenDeleteModal(false)
          }}
          onConfirmationClick={() => {}}
          open={openDeleteModal}
          confirmText="Delete"
        >
          <Typography>
            This will activate new academic year which will then be used as a
            base for latest data.
          </Typography>
        </DeleteConfirmationModal>
      </Box>
    </Box>
  )
}
