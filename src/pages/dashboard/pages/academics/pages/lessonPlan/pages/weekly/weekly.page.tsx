import { Box, CircularProgress, Stack, Typography } from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import moment from 'moment'
import {
  ArrowLeft,
  CalendarPlus,
  ChevronLeft,
  ChevronRight,
  Clock,
  Sparkles,
} from 'lucide-react'
import { ButtonComp } from '@src/components/button/button.component'
import { SelectField } from '@src/components/select/select.component'
import { colors } from '@src/helpers/colors.helpers'
import { ROLE } from '@src/constants/users.constants'
import { useDispatch, useSelector } from '@src/store/hooks.store'
import { getWeeklyGridAction } from '@src/store/redux/dashboard/academics/lessonPlans/lessonPlans.slice'
import {
  formatPlanDate,
  formatTime,
  formatWeekRange,
  getPlanTitle,
  loadTeacherOptions,
  SelectOption,
} from '../../lessonPlan.helpers'
import { PlanStatusChip } from '../../components/statusChip/planStatusChip.component'

const BASE_PATH = '/dashboard/academics/lesson-plan'

const controlStyles = {
  control: (base: Record<string, unknown>) => ({
    ...base,
    minHeight: 36,
    fontSize: 13,
  }),
}

export function WeeklyPlannerPage() {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const { data: auth } = useSelector((store) => store.auth.user)
  const { data: grid, loading } = useSelector(
    (store) => store.lessonPlans.weeklyGrid
  )

  const [weekStart, setWeekStart] = useState(moment().startOf('isoWeek'))
  const [teacherOptions, setTeacherOptions] = useState<SelectOption[]>([])
  const [teacherId, setTeacherId] = useState<number | undefined>()

  const userRoles = auth?.userRoles ?? []
  const isAdmin = useMemo(
    () => userRoles.includes(ROLE.admin) || userRoles.includes(ROLE.superadmin),
    [userRoles]
  )

  useEffect(() => {
    if (!isAdmin) {
      return
    }
    loadTeacherOptions()
      .then((options) => {
        setTeacherOptions(options)
        setTeacherId((prev) => prev ?? options[0]?.value)
      })
      .catch(() => setTeacherOptions([]))
  }, [isAdmin])

  useEffect(() => {
    if (isAdmin && !teacherId) {
      return
    }
    dispatch(
      getWeeklyGridAction({
        weekStartDate: weekStart.format('YYYY-MM-DD'),
        teacherId: isAdmin ? teacherId : undefined,
      })
    )
  }, [dispatch, isAdmin, teacherId, weekStart])

  const days = grid?.days ?? []
  const unscheduledPlans = grid?.unscheduled_plans ?? []
  const isCurrentWeek = weekStart.isSame(moment().startOf('isoWeek'), 'day')

  const goToCreate = (params: {
    classId?: number
    sectionId?: number
    subjectId?: number
    date: string
  }) => {
    const query = new URLSearchParams({ date: params.date })
    if (params.classId) {
      query.set('classId', String(params.classId))
    }
    if (params.sectionId) {
      query.set('sectionId', String(params.sectionId))
    }
    if (params.subjectId) {
      query.set('subjectId', String(params.subjectId))
    }
    navigate(`${BASE_PATH}/create?${query.toString()}`)
  }

  return (
    <Box>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        alignItems={{ xs: 'flex-start', md: 'center' }}
        justifyContent="space-between"
        mb={3}
      >
        <Stack direction="row" spacing={1.25} alignItems="center">
          <ButtonComp
            size="small"
            variant="outlined"
            onClick={() => navigate(BASE_PATH)}
            sx={{ minWidth: 36, px: 1 }}
          >
            <ArrowLeft size={16} />
          </ButtonComp>
          <Box>
            <Typography variant="h6" fontWeight={700} color={colors.grey[900]}>
              Weekly planner
            </Typography>
            <Typography fontSize={12.5} color={colors.grey[600]} mt={0.25}>
              The timetable of the week merged with the lesson plans prepared
              for each period.
            </Typography>
          </Box>
        </Stack>
        {isAdmin ? (
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography fontSize={12} color={colors.grey[600]}>
              Teacher
            </Typography>
            <Box sx={{ width: 220 }}>
              <SelectField
                placeholder="Select teacher"
                options={teacherOptions}
                value={
                  teacherOptions.find((option) => option.value === teacherId) ??
                  null
                }
                onChange={(option) =>
                  setTeacherId((option as SelectOption | null)?.value)
                }
                styles={controlStyles}
              />
            </Box>
          </Stack>
        ) : null}
      </Stack>

      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        mb={2}
        sx={{
          px: 2,
          py: 1.5,
          borderRadius: 3,
          border: `1px solid ${colors.grey[200]}`,
          bgcolor: '#fff',
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <ButtonComp
            size="small"
            variant="outlined"
            onClick={() =>
              setWeekStart((prev) => prev.clone().subtract(7, 'days'))
            }
            sx={{ minWidth: 32, px: 0.75 }}
          >
            <ChevronLeft size={15} />
          </ButtonComp>
          <ButtonComp
            size="small"
            variant="outlined"
            onClick={() => setWeekStart((prev) => prev.clone().add(7, 'days'))}
            sx={{ minWidth: 32, px: 0.75 }}
          >
            <ChevronRight size={15} />
          </ButtonComp>
          <Box ml={1}>
            <Typography
              fontSize={13.5}
              fontWeight={700}
              color={colors.grey[900]}
            >
              {formatWeekRange(
                grid?.week_start_date ?? weekStart.format('YYYY-MM-DD')
              )}
            </Typography>
            <Typography fontSize={11} color={colors.grey[500]}>
              {isCurrentWeek ? 'Current week' : 'Week view'}
            </Typography>
          </Box>
        </Stack>
        <Stack direction="row" spacing={1}>
          <ButtonComp
            size="small"
            variant="text"
            onClick={() => setWeekStart(moment().startOf('isoWeek'))}
            disabled={isCurrentWeek}
          >
            Today
          </ButtonComp>
          <ButtonComp
            size="small"
            startIcon={<CalendarPlus size={15} />}
            onClick={() => goToCreate({ date: weekStart.format('YYYY-MM-DD') })}
          >
            New plan
          </ButtonComp>
        </Stack>
      </Stack>

      {loading ? (
        <Stack alignItems="center" py={8} spacing={1.5}>
          <CircularProgress size={24} />
          <Typography fontSize={12.5} color={colors.grey[500]}>
            Loading the week...
          </Typography>
        </Stack>
      ) : days.length === 0 ? (
        <Box
          sx={{
            borderRadius: 3,
            border: `1px dashed ${colors.grey[300]}`,
            bgcolor: '#fff',
            py: 8,
            textAlign: 'center',
          }}
        >
          <Typography fontSize={14.5} fontWeight={600} color={colors.grey[800]}>
            No periods scheduled for this week
          </Typography>
          <Typography fontSize={12.5} color={colors.grey[500]} mt={0.5}>
            Class routines must be assigned to this teacher to build the weekly
            planner.
          </Typography>
        </Box>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gap: 1.5,
            gridTemplateColumns: {
              xs: '1fr',
              md: 'repeat(2, minmax(0, 1fr))',
              xl: `repeat(${Math.min(
                Math.max(days.length, 1),
                5
              )}, minmax(0, 1fr))`,
            },
            alignItems: 'start',
          }}
        >
          {days.map((day) => (
            <DayColumn
              key={day.date}
              day={day}
              onOpenPlan={(planId) => navigate(`${BASE_PATH}/${planId}`)}
              onCreatePlan={(slot) =>
                goToCreate({
                  classId: slot.class_routine_details.class_id,
                  sectionId: slot.class_routine_details.class_section_id,
                  subjectId: slot.class_routine_details.subject_id,
                  date: day.date,
                })
              }
            />
          ))}
        </Box>
      )}

      {unscheduledPlans.length > 0 ? (
        <Box
          sx={{
            mt: 2,
            borderRadius: 3,
            border: `1px solid ${colors.grey[200]}`,
            bgcolor: '#fff',
            p: 2,
          }}
        >
          <Typography
            fontSize={12.5}
            fontWeight={700}
            color={colors.grey[700]}
            mb={1.25}
          >
            Unscheduled plans of this week
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
            {unscheduledPlans.map((plan) => (
              <Box
                key={plan.id}
                onClick={() => navigate(`${BASE_PATH}/${plan.id}`)}
                sx={{
                  px: 1.25,
                  py: 0.75,
                  borderRadius: 2,
                  border: `1px solid ${colors.grey[200]}`,
                  cursor: 'pointer',
                  '&:hover': { borderColor: colors.blue[300] },
                }}
              >
                <Typography
                  fontSize={12}
                  fontWeight={600}
                  color={colors.grey[800]}
                >
                  {getPlanTitle(plan)}
                </Typography>
                <Typography fontSize={10.5} color={colors.grey[500]}>
                  {formatPlanDate(plan.plan_date, 'ddd, DD MMM')}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Box>
      ) : null}
    </Box>
  )
}

function DayColumn({
  day,
  onOpenPlan,
  onCreatePlan,
}: {
  day: LessonPlan.IWeeklyDay
  onOpenPlan: (planId: number) => void
  onCreatePlan: (slot: LessonPlan.IWeeklySlot) => void
}) {
  const isToday = moment(day.date).isSame(moment(), 'day')

  return (
    <Box
      sx={{
        borderRadius: 3,
        border: `1px solid ${colors.grey[200]}`,
        bgcolor: '#fff',
        overflow: 'hidden',
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{
          px: 1.75,
          py: 1.25,
          bgcolor: isToday ? colors.blue[50] : colors.grey[50],
          borderBottom: `1px solid ${colors.grey[200]}`,
        }}
      >
        <Box>
          <Typography fontSize={12.5} fontWeight={700} color={colors.grey[800]}>
            {moment(day.date).format('dddd')}
          </Typography>
          <Typography fontSize={10.5} color={colors.grey[500]}>
            {moment(day.date).format('DD MMM YYYY')}
          </Typography>
        </Box>
        <Typography fontSize={10.5} color={colors.grey[500]}>
          {day.slots.length} period{day.slots.length === 1 ? '' : 's'}
        </Typography>
      </Stack>

      <Stack spacing={1} p={1.25}>
        {day.slots.map((slot) => {
          const plan = slot.lesson_plan_details

          return (
            <Box
              key={slot.class_routine_details.id}
              onClick={() => (plan ? onOpenPlan(plan.id) : onCreatePlan(slot))}
              sx={{
                borderRadius: 2,
                border: `1px solid ${
                  plan ? colors.blue[100] : colors.grey[200]
                }`,
                bgcolor: plan ? colors.blue[50] : '#fff',
                p: 1.25,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                '&:hover': {
                  borderColor: colors.blue[300],
                  boxShadow: '0 10px 20px -16px rgba(15,23,42,0.4)',
                },
              }}
            >
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                spacing={1}
              >
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <Clock size={11} color={colors.grey[500]} />
                  <Typography fontSize={10.5} color={colors.grey[600]}>
                    {formatTime(slot.time_slot_details.start_time)} –{' '}
                    {formatTime(slot.time_slot_details.end_time)}
                  </Typography>
                </Stack>
                {plan ? (
                  <PlanStatusChip status={plan.status} size="small" />
                ) : null}
              </Stack>

              <Typography
                fontSize={12.5}
                fontWeight={700}
                color={colors.grey[900]}
                mt={0.5}
                noWrap
              >
                {slot.subject_details?.name}
              </Typography>
              <Typography fontSize={11} color={colors.grey[500]} noWrap>
                {slot.class_details?.name}-{slot.class_section_details?.name}
              </Typography>

              {plan ? (
                <Typography
                  fontSize={11.5}
                  color={colors.blue[800]}
                  mt={0.5}
                  noWrap
                >
                  {getPlanTitle(plan)}
                </Typography>
              ) : (
                <Stack
                  direction="row"
                  spacing={0.5}
                  alignItems="center"
                  mt={0.5}
                >
                  <Sparkles size={11} color={colors.blue[400]} />
                  <Typography fontSize={11} color={colors.blue[600]}>
                    Tap to plan this lesson
                  </Typography>
                </Stack>
              )}
            </Box>
          )
        })}
      </Stack>
    </Box>
  )
}
