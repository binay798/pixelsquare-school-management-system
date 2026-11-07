import { Box, Stack, Typography } from '@mui/material'
import { useMemo, useState } from 'react'
import { GoPlus } from 'react-icons/go'
import { ButtonComp } from '@src/components/button/button.component'
import { TableComp } from '@src/components/tableComp/tableComp.components'
import { colors } from '@src/helpers/colors.helpers'
import { useDispatch, useSelector } from '@src/store/hooks.store'
import { deleteTimeSlotAction } from '@src/store/redux/dashboard/academics/classRoutines/classRoutines.slice'
import { formatRoutineTime } from '../../classRoutines.helpers'
import { TimeSlotModal } from '../timeSlotModal/timeSlotModal.component'

interface ITimeSlotRow {
  id: number
  name: string
  day: string
  template: string
  time: string
  slot_type: string
  sequence_order: string
}

interface Props {
  classId: number | null
  timeSlotList: Academics.ITimeSlotList[] | null
  workingDayList: Academics.IWorkingDayList[] | null
  scheduleTemplateList: Academics.IScheduleTemplateList[] | null
  onRefresh: () => void
}

export function TimeSlotsPanel(props: Props) {
  const dispatch = useDispatch()
  const [openModal, setOpenModal] = useState(false)
  const [editDetails, setEditDetails] =
    useState<Academics.ITimeSlotList | null>(null)

  const { data: timeSlotList, loading } = useSelector(
    (store) => store.classRoutines.timeSlotList
  )
  const { loading: deleteLoading } = useSelector(
    (store) => store.classRoutines.timeSlotMutation
  )

  const rows: ITimeSlotRow[] = useMemo(
    () =>
      (timeSlotList ?? []).map((el) => ({
        id: el.time_slot_details.id,
        name: el.time_slot_details.name,
        day: el.working_day_details?.name ?? '—',
        template: el.schedule_template_details?.name ?? '—',
        time: `${formatRoutineTime(
          el.time_slot_details.start_time
        )} - ${formatRoutineTime(el.time_slot_details.end_time)}`,
        slot_type: el.time_slot_details.slot_type,
        sequence_order: String(el.time_slot_details.sequence_order ?? '—'),
      })),
    [timeSlotList]
  )

  const handleDelete = (row: ITimeSlotRow, onClose?: () => void) => {
    if (!props.classId) {
      return
    }
    dispatch(
      deleteTimeSlotAction({
        classId: props.classId,
        timeSlotId: row.id,
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
            Time Slots
          </Typography>
          <Typography fontSize={12.5} color={colors.grey[600]}>
            Periods and breaks that make up a working day.
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
          Add Slot
        </ButtonComp>
      </Stack>

      <TimeSlotModal
        open={openModal}
        onClose={() => {
          setOpenModal(false)
          setEditDetails(null)
        }}
        classId={props.classId}
        workingDayList={props.workingDayList}
        scheduleTemplateList={props.scheduleTemplateList}
        details={editDetails}
        onSuccess={props.onRefresh}
      />

      <TableComp
        columns={[
          { field: 'name', name: 'Slot' },
          { field: 'day', name: 'Day' },
          { field: 'template', name: 'Template' },
          { field: 'time', name: 'Time' },
          {
            field: 'slot_type',
            name: 'Type',
            render: (val) => (
              <Typography
                fontSize={12}
                textTransform="capitalize"
                color={val === 'break' ? colors.orange[600] : colors.blue[700]}
              >
                {String(val)}
              </Typography>
            ),
          },
          { field: 'sequence_order', name: 'Order' },
        ]}
        data={rows}
        loading={loading}
        showPagination={false}
        deleteConfirmLoader={deleteLoading}
        deleteConfirmationModalDescription={
          <Typography fontSize={13}>
            Deleting a time slot also removes the routines assigned to it. This
            action cannot be undone.
          </Typography>
        }
        actions={{
          onEdit: (item) => {
            const matched = (timeSlotList ?? []).find(
              (el) => el.time_slot_details.id === item.id
            )
            if (matched) {
              setEditDetails(matched)
              setOpenModal(true)
            }
          },
          onDelete: handleDelete,
        }}
      />
    </Box>
  )
}
