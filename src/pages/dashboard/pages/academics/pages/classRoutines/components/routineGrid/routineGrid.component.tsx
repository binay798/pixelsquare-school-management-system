import {
  Box,
  Card,
  Chip,
  CircularProgress,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import { useMemo } from 'react'
import { IoTrashOutline } from 'react-icons/io5'
import { GoPlus } from 'react-icons/go'
import { colors } from '@src/helpers/colors.helpers'
import {
  IRoutineSlotSeries,
  buildRoutineGrid,
  formatRoutineTime,
  getTeacherFullName,
  groupRoutinesByWorkingDay,
} from '../../classRoutines.helpers'

export interface IAssignSlotPayload {
  workingDayId: number
  workingDayName: string
  timeSlotSeries: Pick<
    IRoutineSlotSeries,
    'name' | 'start_time' | 'end_time' | 'slot_type'
  >
}

interface Props {
  routineList: Academics.IClassRoutineList[] | null
  workingDayList: Academics.IWorkingDayList[] | null
  timeSlotList: Academics.ITimeSlotList[] | null
  templateId?: number | null
  loading?: boolean
  showSection?: boolean
  emptyText?: string
  onAssign?: (details: IAssignSlotPayload) => void
  onEdit?: (routine: Academics.IClassRoutineList) => void
  onDelete?: (routine: Academics.IClassRoutineList) => void
}

interface RoutineItemProps {
  routine: Academics.IClassRoutineList
  showSection?: boolean
  onEdit?: (routine: Academics.IClassRoutineList) => void
  onDelete?: (routine: Academics.IClassRoutineList) => void
}

function RoutineItem({
  routine,
  showSection,
  onEdit,
  onDelete,
}: RoutineItemProps) {
  const isEditable = Boolean(onEdit || onDelete)

  return (
    <Card
      variant="outlined"
      onClick={() => onEdit?.(routine)}
      sx={{
        p: 1,
        borderRadius: 1.5,
        bgcolor: '#f5f9ff',
        borderColor: colors.blue[100],
        cursor: isEditable ? 'pointer' : 'default',
        '&:hover': isEditable
          ? { borderColor: colors.blue[300], bgcolor: colors.blue[50] }
          : undefined,
      }}
    >
      <Stack direction="row" alignItems="flex-start" spacing={0.5}>
        <Box flex={1} minWidth={0}>
          <Typography
            fontSize={12.5}
            fontWeight={600}
            color={colors.blue[800]}
            noWrap
          >
            {routine.subject_details?.name}
          </Typography>
          <Typography fontSize={11.5} color={colors.grey[700]} noWrap>
            {getTeacherFullName(routine)}
          </Typography>
          {showSection ? (
            <Typography fontSize={11} color={colors.grey[600]} noWrap>
              {routine.class_section_details?.name}
            </Typography>
          ) : null}
        </Box>
        {onDelete ? (
          <Tooltip title="Delete routine">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation()
                onDelete(routine)
              }}
            >
              <IoTrashOutline size={14} color={colors.red[400]} />
            </IconButton>
          </Tooltip>
        ) : null}
      </Stack>
    </Card>
  )
}

function EmptyCell({ onAssign }: { onAssign?: () => void }) {
  if (!onAssign) {
    return (
      <Typography fontSize={12} color={colors.grey[400]}>
        —
      </Typography>
    )
  }

  return (
    <Tooltip title="Assign routine">
      <Box
        onClick={onAssign}
        sx={{
          width: '100%',
          minHeight: 34,
          borderRadius: 1.5,
          border: `1px dashed ${colors.grey[300]}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: colors.grey[500],
          cursor: 'pointer',
          '&:hover': {
            borderColor: colors.blue[400],
            color: colors.blue[600],
            bgcolor: colors.blue[50],
          },
        }}
      >
        <GoPlus size={16} />
      </Box>
    </Tooltip>
  )
}
function RoutineGridDesktop(props: Props) {
  const { rows, workingDays } = useMemo(
    () =>
      buildRoutineGrid({
        routineList: props.routineList,
        workingDayList: props.workingDayList,
        timeSlotList: props.timeSlotList,
        templateId: props.templateId,
      }),
    [
      props.routineList,
      props.workingDayList,
      props.timeSlotList,
      props.templateId,
    ]
  )

  return (
    <TableContainer
      sx={{
        border: `1px solid ${colors.grey[200]}`,
        borderRadius: 2,
        overflowX: 'auto',
      }}
    >
      <Table size="small" sx={{ minWidth: 720 }}>
        <TableHead>
          <TableRow>
            <TableCell
              sx={{
                position: 'sticky',
                left: 0,
                zIndex: 2,
                bgcolor: colors.grey[50],
                fontWeight: 600,
                fontSize: 12.5,
                minWidth: 130,
              }}
            >
              Time / Day
            </TableCell>
            {workingDays.map((day) => (
              <TableCell
                key={day.id}
                align="center"
                sx={{
                  bgcolor: colors.grey[50],
                  fontWeight: 600,
                  fontSize: 12.5,
                  minWidth: 150,
                }}
              >
                {day.name}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map(({ series, cells }) => {
            if (series.slot_type === 'break') {
              return (
                <TableRow key={series.key}>
                  <TableCell
                    sx={{
                      position: 'sticky',
                      left: 0,
                      bgcolor: '#fffdf3',
                      fontSize: 12,
                    }}
                  >
                    <Typography fontSize={12} fontWeight={600}>
                      {series.name}
                    </Typography>
                    <Typography fontSize={11} color={colors.grey[600]}>
                      {formatRoutineTime(series.start_time)} -{' '}
                      {formatRoutineTime(series.end_time)}
                    </Typography>
                  </TableCell>
                  <TableCell
                    colSpan={workingDays.length}
                    align="center"
                    sx={{
                      bgcolor: '#fffdf3',
                      fontSize: 12,
                      color: colors.grey[600],
                    }}
                  >
                    Break
                  </TableCell>
                </TableRow>
              )
            }

            return (
              <TableRow key={series.key}>
                <TableCell
                  sx={{
                    position: 'sticky',
                    left: 0,
                    zIndex: 1,
                    bgcolor: '#fff',
                    fontSize: 12,
                  }}
                >
                  <Typography fontSize={12} fontWeight={600}>
                    {series.name}
                  </Typography>
                  <Typography fontSize={11} color={colors.grey[600]}>
                    {formatRoutineTime(series.start_time)} -{' '}
                    {formatRoutineTime(series.end_time)}
                  </Typography>
                </TableCell>
                {workingDays.map((day) => (
                  <TableCell key={day.id} sx={{ verticalAlign: 'top' }}>
                    <Stack spacing={0.75}>
                      {cells[day.id]?.map((routine) => (
                        <RoutineItem
                          key={routine.class_routine_details.id}
                          routine={routine}
                          showSection={props.showSection}
                          onEdit={props.onEdit}
                          onDelete={props.onDelete}
                        />
                      ))}
                      {!cells[day.id]?.length ? (
                        <EmptyCell
                          onAssign={
                            props.onAssign
                              ? () =>
                                  props.onAssign?.({
                                    workingDayId: day.id,
                                    workingDayName: day.name,
                                    timeSlotSeries: series,
                                  })
                              : undefined
                          }
                        />
                      ) : null}
                    </Stack>
                  </TableCell>
                ))}
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

function RoutineGridMobile(props: Props) {
  const dayGroups = useMemo(
    () =>
      groupRoutinesByWorkingDay(
        props.routineList,
        props.workingDayList,
        props.templateId
      ),
    [props.routineList, props.workingDayList, props.templateId]
  )

  return (
    <Stack spacing={1.5}>
      {dayGroups.map(({ workingDay, routines }) => (
        <Card
          key={workingDay.id}
          variant="outlined"
          sx={{ borderRadius: 2, borderColor: colors.grey[200] }}
        >
          <Box
            px={1.75}
            py={1.25}
            bgcolor={colors.grey[50]}
            borderBottom={`1px solid ${colors.grey[200]}`}
          >
            <Typography fontSize={13} fontWeight={600}>
              {workingDay.name}
            </Typography>
          </Box>
          <Stack spacing={1} p={1.5}>
            {routines.map((routine) => (
              <Box
                key={routine.class_routine_details.id}
                onClick={() => props.onEdit?.(routine)}
                sx={{
                  border: `1px solid ${colors.grey[200]}`,
                  borderRadius: 1.5,
                  p: 1.25,
                  cursor: props.onEdit ? 'pointer' : 'default',
                }}
              >
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  spacing={1}
                >
                  <Typography
                    fontSize={12}
                    fontWeight={600}
                    color={colors.blue[700]}
                  >
                    {formatRoutineTime(routine.time_slot_details?.start_time)} -{' '}
                    {formatRoutineTime(routine.time_slot_details?.end_time)}
                  </Typography>
                  <Typography fontSize={11} color={colors.grey[600]}>
                    {routine.time_slot_details?.name}
                  </Typography>
                </Stack>
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={0.75}
                  mt={0.75}
                  flexWrap="wrap"
                  useFlexGap
                >
                  <Typography fontSize={12.5} fontWeight={600}>
                    {routine.subject_details?.name}
                  </Typography>
                  {props.showSection ? (
                    <Chip
                      size="small"
                      label={routine.class_section_details?.name}
                      sx={{ height: 20, fontSize: 11 }}
                    />
                  ) : null}
                </Stack>
                <Typography fontSize={11.5} color={colors.grey[700]} mt={0.25}>
                  {getTeacherFullName(routine)}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Card>
      ))}
    </Stack>
  )
}

export default function RoutineGrid(props: Props) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const hasWorkingDays = Boolean(
    (props.workingDayList ?? []).filter(
      (el) => el.working_day_details.is_working_day
    ).length
  )
  const hasTimeSlots = Boolean(
    (props.timeSlotList ?? []).filter((el) =>
      props.templateId
        ? el.time_slot_details.schedule_template_id === props.templateId
        : true
    ).length
  )

  if (props.loading) {
    return (
      <Stack alignItems="center" justifyContent="center" py={6} spacing={1.5}>
        <CircularProgress size={26} />
        <Typography fontSize={13} color={colors.grey[600]}>
          Loading routine...
        </Typography>
      </Stack>
    )
  }

  if (!hasWorkingDays || !hasTimeSlots) {
    return (
      <Box
        py={6}
        px={2}
        textAlign="center"
        border={`1px dashed ${colors.grey[300]}`}
        borderRadius={2}
      >
        <Typography fontSize={13} fontWeight={600} color={colors.grey[700]}>
          Routine is not configured yet
        </Typography>
        <Typography fontSize={12} color={colors.grey[500]} mt={0.5}>
          Add working days and time slots to generate the class routine grid.
        </Typography>
      </Box>
    )
  }

  if (!props.routineList?.length) {
    return (
      <Box
        py={6}
        px={2}
        textAlign="center"
        border={`1px dashed ${colors.grey[300]}`}
        borderRadius={2}
      >
        <Typography fontSize={13} fontWeight={600} color={colors.grey[700]}>
          No routine assigned
        </Typography>
        <Typography fontSize={12} color={colors.grey[500]} mt={0.5}>
          {props.emptyText ?? 'Assign periods to build the class routine.'}
        </Typography>
      </Box>
    )
  }

  return isMobile ? (
    <RoutineGridMobile {...props} />
  ) : (
    <RoutineGridDesktop {...props} />
  )
}
