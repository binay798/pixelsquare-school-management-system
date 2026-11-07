import { Box, Chip, Stack, Typography } from '@mui/material'
import { useMemo, useState } from 'react'
import { GoPlus } from 'react-icons/go'
import { ButtonComp } from '@src/components/button/button.component'
import { TableComp } from '@src/components/tableComp/tableComp.components'
import { colors } from '@src/helpers/colors.helpers'
import { useDispatch, useSelector } from '@src/store/hooks.store'
import { deleteScheduleTemplateAction } from '@src/store/redux/dashboard/academics/classRoutines/classRoutines.slice'
import { ScheduleTemplateModal } from '../scheduleTemplateModal/scheduleTemplateModal.component'

interface IScheduleTemplateRow {
  id: number
  name: string
  is_active: boolean
}

interface Props {
  classId: number | null
  onRefresh: () => void
}

export function ScheduleTemplatesPanel(props: Props) {
  const dispatch = useDispatch()
  const [openModal, setOpenModal] = useState(false)
  const [editDetails, setEditDetails] =
    useState<Academics.IScheduleTemplate | null>(null)

  const { data: scheduleTemplateList, loading } = useSelector(
    (store) => store.classRoutines.scheduleTemplateList
  )
  const { loading: deleteLoading } = useSelector(
    (store) => store.classRoutines.scheduleTemplateMutation
  )

  const rows: IScheduleTemplateRow[] = useMemo(
    () =>
      (scheduleTemplateList ?? []).map((el) => ({
        id: el.schedule_template_details.id,
        name: el.schedule_template_details.name,
        is_active: el.schedule_template_details.is_active,
      })),
    [scheduleTemplateList]
  )

  const handleDelete = (row: IScheduleTemplateRow, onClose?: () => void) => {
    if (!props.classId) {
      return
    }
    dispatch(
      deleteScheduleTemplateAction({
        classId: props.classId,
        scheduleTemplateId: row.id,
        onSuccess: () => {
          onClose?.()
          props.onRefresh()
        },
      })
    )
  }

  return (
    <Box>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        mb={2}
      >
        <Box>
          <Typography fontSize={15} fontWeight={600}>
            Schedule Templates
          </Typography>
          <Typography fontSize={12.5} color={colors.grey[600]}>
            Templates group the time slots of a class routine.
          </Typography>
        </Box>
        <ButtonComp
          size="small"
          startIcon={<GoPlus />}
          disabled={!props.classId}
          onClick={() => {
            setEditDetails(null)
            setOpenModal(true)
          }}
        >
          Add Template
        </ButtonComp>
      </Stack>

      <ScheduleTemplateModal
        open={openModal}
        onClose={() => {
          setOpenModal(false)
          setEditDetails(null)
        }}
        classId={props.classId}
        details={editDetails}
        onSuccess={props.onRefresh}
      />

      <TableComp
        columns={[
          { field: 'name', name: 'Template' },
          {
            field: 'is_active',
            name: 'Status',
            render: (val) => (
              <Chip
                size="small"
                label={val ? 'Active' : 'Inactive'}
                sx={{
                  height: 22,
                  fontSize: 11.5,
                  bgcolor: val ? colors.green[50] : colors.grey[100],
                  color: val ? colors.green[700] : colors.grey[600],
                }}
              />
            ),
          },
        ]}
        data={rows}
        loading={loading}
        showPagination={false}
        deleteConfirmLoader={deleteLoading}
        actions={{
          onEdit: (item) => {
            const matched = (scheduleTemplateList ?? []).find(
              (el) => el.schedule_template_details.id === item.id
            )
            if (matched) {
              setEditDetails(matched.schedule_template_details)
              setOpenModal(true)
            }
          },
          onDelete: handleDelete,
        }}
      />
    </Box>
  )
}
