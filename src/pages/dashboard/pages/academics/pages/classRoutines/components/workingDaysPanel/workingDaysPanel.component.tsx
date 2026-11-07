import { Box, Chip, Stack, Typography } from '@mui/material'
import { useMemo, useState } from 'react'
import { GoPlus } from 'react-icons/go'
import { ButtonComp } from '@src/components/button/button.component'
import { TableComp } from '@src/components/tableComp/tableComp.components'
import { colors } from '@src/helpers/colors.helpers'
import { useDispatch, useSelector } from '@src/store/hooks.store'
import { deleteWorkingDayAction } from '@src/store/redux/dashboard/academics/classRoutines/classRoutines.slice'
import { WorkingDayModal } from '../workingDayModal/workingDayModal.component'

interface IWorkingDayRow {
  id: number
  name: string
  sequence_order: string
  is_working_day: boolean
}

interface Props {
  classId: number | null
  onRefresh: () => void
}

export function WorkingDaysPanel(props: Props) {
  const dispatch = useDispatch()
  const [openModal, setOpenModal] = useState(false)
  const [editDetails, setEditDetails] = useState<Academics.IWorkingDay | null>(
    null
  )

  const { data: workingDayList, loading } = useSelector(
    (store) => store.classRoutines.workingDayList
  )
  const { loading: deleteLoading } = useSelector(
    (store) => store.classRoutines.workingDayMutation
  )

  const rows: IWorkingDayRow[] = useMemo(
    () =>
      (workingDayList ?? []).map((el) => ({
        id: el.working_day_details.id,
        name: el.working_day_details.name,
        sequence_order: String(el.working_day_details.sequence_order ?? '—'),
        is_working_day: el.working_day_details.is_working_day,
      })),
    [workingDayList]
  )

  const handleDelete = (row: IWorkingDayRow, onClose?: () => void) => {
    if (!props.classId) {
      return
    }
    dispatch(
      deleteWorkingDayAction({
        classId: props.classId,
        workingDayId: row.id,
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
            Working Days
          </Typography>
          <Typography fontSize={12.5} color={colors.grey[600]}>
            The days of the week the class routine is followed.
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
          Add Working Day
        </ButtonComp>
      </Stack>

      <WorkingDayModal
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
          { field: 'name', name: 'Day' },
          { field: 'sequence_order', name: 'Order' },
          {
            field: 'is_working_day',
            name: 'Working Day',
            render: (val) => (
              <Chip
                size="small"
                label={val ? 'Working' : 'Holiday'}
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
            const matched = (workingDayList ?? []).find(
              (el) => el.working_day_details.id === item.id
            )
            if (matched) {
              setEditDetails(matched.working_day_details)
              setOpenModal(true)
            }
          },
          onDelete: handleDelete,
        }}
      />
    </Box>
  )
}
