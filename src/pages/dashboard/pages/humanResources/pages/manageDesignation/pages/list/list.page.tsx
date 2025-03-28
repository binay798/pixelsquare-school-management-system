import { Box, Stack, Typography } from '@mui/material'
import { ButtonComp } from '@src/components/button/button.component'
import { TableComp } from '@src/components/tableComp/tableComp.components'
import { useEffect, useState } from 'react'
import { GoPlus } from 'react-icons/go'
// import { useNavigate } from 'react-router-dom'
import { CreateDesignationModal } from '../../components/createDesignationModal/createDesignationModal.component'
import { usePage } from '@src/helpers/getPageParams.helper'
import { useDispatch, useSelector } from '@src/store/hooks.store'
import {
  deleteDesignationAction,
  listDesignationAction,
} from '@src/store/redux/dashboard/humanResources/designations/designations.slice'
import { EditDesignationModal } from '../../components/editDesignationModal/editDesignationModal.component'
import { isEmpty } from 'lodash'

export function ListDesignation() {
  // const navigate = useNavigate()
  const [openCreateModal, setOpenCreateModal] = useState(false)
  const [selectedDesignation, setSelectedDesignation] =
    useState<HumanResource.IDesignation | null>(null)
  const toggleOpenCreateModal = (val: boolean) => {
    setOpenCreateModal(val)
  }
  const { page, limit } = usePage()
  const dispatch = useDispatch()
  const { data: designationList, loading: listDesignationLoading } =
    useSelector((store) => store.designations.designationList)

  const { loading: deleteLoading } = useSelector(
    (store) => store.designations.deleteDesignation
  )

  useEffect(() => {
    dispatch(listDesignationAction({ payload: { page, limit } }))
  }, [page, limit])

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
              Manage Employee Designation
            </Typography>
            <Typography variant="body2" mt={1}>
              Update the school&apos;s details to keep records accurate and
              up-to-date.
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
        {/* CREATE DESIGNATION MODAL */}
        <CreateDesignationModal
          open={openCreateModal}
          onClose={() => toggleOpenCreateModal(false)}
        />
      </Box>
      <TableComp
        columns={[
          { field: 'designation', name: 'Designation Name' },
          { field: 'created_at', name: 'Created At' },
          { field: 'updated_at', name: 'Updated At' },
        ]}
        data={designationList?.rows ?? []}
        actions={{
          onEdit: (item) => {
            setSelectedDesignation(item)
          },
          onDelete: (item, onClose) => {
            dispatch(
              deleteDesignationAction({
                payload: { designationId: item.id },
                onSuccess: () => {
                  onClose?.()
                  dispatch(listDesignationAction({ payload: { page, limit } }))
                },
              })
            )
          },
        }}
        loading={listDesignationLoading}
        count={Number(designationList?.total)}
        page={page}
        rowsPerPage={limit}
        showPagination={true}
        deleteConfirmLoader={deleteLoading}
      ></TableComp>

      {/* EDIT DESIGNATION MODAL */}
      <EditDesignationModal
        open={!isEmpty(selectedDesignation)}
        onClose={() => {
          setSelectedDesignation(null)
        }}
        designation={selectedDesignation}
      />
    </Box>
  )
}
