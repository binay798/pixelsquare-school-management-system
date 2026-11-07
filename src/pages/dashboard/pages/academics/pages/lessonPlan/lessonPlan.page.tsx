import { Box, Pagination, Stack, Typography } from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CalendarRange,
  LayoutGrid,
  LayoutTemplate,
  ListChecks,
  Plus,
  Rows3,
} from 'lucide-react'
import { ButtonComp } from '@src/components/button/button.component'
import { DeleteConfirmationModal } from '@src/components/confirmationModal/deleteConfirmationModal.component'
import { colors } from '@src/helpers/colors.helpers'
import { ROLE } from '@src/constants/users.constants'
import { useDispatch, useSelector } from '@src/store/hooks.store'
import {
  deleteLessonPlanAction,
  getLessonPlanListAction,
  getLessonPlanStatsAction,
  getMyLessonPlanListAction,
} from '@src/store/redux/dashboard/academics/lessonPlans/lessonPlans.slice'
import { ILessonPlanFilters } from '@src/store/redux/dashboard/academics/lessonPlans/lessonPlans.service'
import { PlanCard } from './components/planCard/planCard.component'
import { PlanTable } from './components/planTable/planTable.component'
import { PlanStatCards } from './components/statCards/planStatCards.component'
import { PlanFilterBar } from './components/filterBar/planFilterBar.component'
import { isLessonPlanLocked, loadMyTeacherId } from './lessonPlan.helpers'

const PAGE_LIMIT = 9

const BASE_PATH = '/dashboard/academics/lesson-plan'

export function LessonPlanPage() {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const { data: auth } = useSelector((store) => store.auth.user)
  const { data: planList, loading } = useSelector(
    (store) => store.lessonPlans.planList
  )
  const { data: myPlanList, loading: myPlanLoading } = useSelector(
    (store) => store.lessonPlans.myPlanList
  )
  const { data: statsRows, loading: statsLoading } = useSelector(
    (store) => store.lessonPlans.planStats
  )
  const { loading: deleteLoading } = useSelector(
    (store) => store.lessonPlans.deletePlan
  )

  const [filters, setFilters] = useState<ILessonPlanFilters>({
    status: '',
    planType: '',
    search: '',
  })
  const [page, setPage] = useState(1)
  const [view, setView] = useState<'cards' | 'table'>('cards')
  const [onlyMine, setOnlyMine] = useState(false)
  const [myTeacherId, setMyTeacherId] = useState<number | undefined>()
  const [deleteTarget, setDeleteTarget] = useState<LessonPlan.IListRow | null>(
    null
  )

  const userRoles = auth?.userRoles ?? []
  const isAdmin = useMemo(
    () => userRoles.includes(ROLE.admin) || userRoles.includes(ROLE.superadmin),
    [userRoles]
  )

  useEffect(() => {
    loadMyTeacherId(auth?.user?.id)
      .then(setMyTeacherId)
      .catch(() => setMyTeacherId(undefined))
  }, [auth?.user?.id])

  useEffect(() => {
    setPage(1)
  }, [filters])

  useEffect(() => {
    if (onlyMine) {
      dispatch(
        getMyLessonPlanListAction({
          page,
          limit: PAGE_LIMIT,
          status: filters.status,
          fromDate: filters.fromDate,
          toDate: filters.toDate,
        })
      )
    } else {
      dispatch(getLessonPlanListAction({ filters, page, limit: PAGE_LIMIT }))
    }
    dispatch(getLessonPlanStatsAction(filters))
  }, [dispatch, filters, page, onlyMine])

  const activeList = onlyMine ? myPlanList : planList
  const rows = activeList?.rows ?? []
  const total = Number(activeList?.total ?? 0)
  const isTeacher = userRoles.includes(ROLE.teacher)
  const listLoading = onlyMine ? myPlanLoading : loading

  const canModify = (row: LessonPlan.IListRow) => {
    const plan = row.lesson_plan_details
    if (isLessonPlanLocked(plan.status)) {
      return false
    }

    return isAdmin || (Boolean(myTeacherId) && plan.teacher_id === myTeacherId)
  }

  // a school admin may remove any plan, a teacher only his own unlocked plan
  const canDeleteRow = (row: LessonPlan.IListRow) => isAdmin || canModify(row)

  const handleDelete = () => {
    if (!deleteTarget) {
      return
    }
    dispatch(
      deleteLessonPlanAction({
        lessonPlanId: deleteTarget.lesson_plan_details.id,
        onSuccess: () => {
          setDeleteTarget(null)
          if (onlyMine) {
            dispatch(
              getMyLessonPlanListAction({
                page,
                limit: PAGE_LIMIT,
                status: filters.status,
                fromDate: filters.fromDate,
                toDate: filters.toDate,
              })
            )
          } else {
            dispatch(
              getLessonPlanListAction({ filters, page, limit: PAGE_LIMIT })
            )
          }
          dispatch(getLessonPlanStatsAction(filters))
        },
      })
    )
  }

  return (
    <Box>
      <Stack
        mb={3}
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', md: 'center' }}
      >
        <Box>
          <Typography variant="h5" fontWeight={700} color={colors.grey[900]}>
            Lesson Plans
          </Typography>
          <Typography variant="body2" mt={0.5} color={colors.grey[600]}>
            {isAdmin
              ? 'Prepare, review and track the lessons delivered across every class section.'
              : 'Create your lesson plans, track the syllabus coverage and record post-lesson notes.'}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
          <ButtonComp
            size="small"
            variant="outlined"
            startIcon={<CalendarRange size={15} />}
            onClick={() => navigate(`${BASE_PATH}/weekly`)}
          >
            Weekly planner
          </ButtonComp>
          <ButtonComp
            size="small"
            variant="outlined"
            startIcon={<ListChecks size={15} />}
            onClick={() => navigate(`${BASE_PATH}/syllabus`)}
          >
            Syllabus
          </ButtonComp>
          {isAdmin ? (
            <ButtonComp
              size="small"
              variant="outlined"
              startIcon={<LayoutTemplate size={15} />}
              onClick={() => navigate(`${BASE_PATH}/templates`)}
            >
              Templates
            </ButtonComp>
          ) : null}
          <ButtonComp
            startIcon={<Plus size={16} />}
            onClick={() => navigate(`${BASE_PATH}/create`)}
          >
            New lesson plan
          </ButtonComp>
        </Stack>
      </Stack>

      <PlanStatCards
        rows={statsRows}
        loading={statsLoading}
        activeStatus={filters.status ?? ''}
        onSelect={(status) => setFilters((prev) => ({ ...prev, status }))}
      />

      <Box mt={2.5}>
        <PlanFilterBar
          filters={filters}
          onChange={setFilters}
          showTeacherFilter={isAdmin}
        />
      </Box>

      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        mt={2.5}
        mb={1.5}
      >
        <Typography fontSize={13} color={colors.grey[600]}>
          Showing{' '}
          <Box component="span" fontWeight={700} color={colors.grey[900]}>
            {rows.length}
          </Box>{' '}
          of{' '}
          <Box component="span" fontWeight={700} color={colors.grey[900]}>
            {total}
          </Box>{' '}
          {onlyMine ? 'of my lesson plans' : 'lesson plans'}
        </Typography>
        <Stack direction="row" spacing={1.25} alignItems="center">
          {isTeacher ? (
            <Stack
              direction="row"
              spacing={0.5}
              sx={{
                p: 0.5,
                borderRadius: 2,
                bgcolor: colors.grey[100],
                border: `1px solid ${colors.grey[200]}`,
              }}
            >
              <ButtonComp
                size="small"
                variant={onlyMine ? 'text' : 'contained'}
                color={onlyMine ? 'inherit' : 'primary'}
                onClick={() => {
                  setOnlyMine(false)
                  setPage(1)
                }}
                sx={{ minWidth: 'auto', px: 1.25 }}
              >
                All plans
              </ButtonComp>
              <ButtonComp
                size="small"
                variant={onlyMine ? 'contained' : 'text'}
                color={onlyMine ? 'primary' : 'inherit'}
                onClick={() => {
                  setOnlyMine(true)
                  setPage(1)
                }}
                sx={{ minWidth: 'auto', px: 1.25 }}
              >
                My plans
              </ButtonComp>
            </Stack>
          ) : null}
          <Stack
            direction="row"
            spacing={0.5}
            sx={{
              p: 0.5,
              borderRadius: 2,
              bgcolor: colors.grey[100],
              border: `1px solid ${colors.grey[200]}`,
            }}
          >
            <ButtonComp
              size="small"
              variant={view === 'cards' ? 'contained' : 'text'}
              color={view === 'cards' ? 'primary' : 'inherit'}
              startIcon={<LayoutGrid size={14} />}
              onClick={() => setView('cards')}
              sx={{ minWidth: 'auto', px: 1.25 }}
            >
              Cards
            </ButtonComp>
            <ButtonComp
              size="small"
              variant={view === 'table' ? 'contained' : 'text'}
              color={view === 'table' ? 'primary' : 'inherit'}
              startIcon={<Rows3 size={14} />}
              onClick={() => setView('table')}
              sx={{ minWidth: 'auto', px: 1.25 }}
            >
              Table
            </ButtonComp>
          </Stack>
        </Stack>
      </Stack>

      {view === 'cards' ? (
        rows.length === 0 && !listLoading ? (
          <Box
            sx={{
              borderRadius: 3,
              border: `1px dashed ${colors.grey[300]}`,
              bgcolor: '#fff',
              py: 7,
              textAlign: 'center',
            }}
          >
            <Typography fontSize={15} fontWeight={600} color={colors.grey[800]}>
              No lesson plans match your filters
            </Typography>
            <Typography
              fontSize={12.5}
              color={colors.grey[500]}
              mt={0.5}
              mb={2}
            >
              Clear the filters or start a brand new lesson plan.
            </Typography>
            <ButtonComp
              size="small"
              startIcon={<Plus size={15} />}
              onClick={() => navigate(`${BASE_PATH}/create`)}
            >
              New lesson plan
            </ButtonComp>
          </Box>
        ) : (
          <Box
            sx={{
              display: 'grid',
              gap: 2,
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            }}
          >
            {listLoading && rows.length === 0
              ? Array.from({ length: 6 }).map((_, index) => (
                  <Box
                    key={index}
                    sx={{
                      height: 172,
                      borderRadius: 3,
                      border: `1px solid ${colors.grey[200]}`,
                      bgcolor: colors.grey[50],
                    }}
                  />
                ))
              : rows.map((row) => (
                  <PlanCard
                    key={row.lesson_plan_details.id}
                    row={row}
                    canEdit={canModify(row)}
                    canDelete={canDeleteRow(row)}
                    onView={(item) =>
                      navigate(`${BASE_PATH}/${item.lesson_plan_details.id}`)
                    }
                    onEdit={(item) =>
                      navigate(
                        `${BASE_PATH}/${item.lesson_plan_details.id}/edit`
                      )
                    }
                    onDelete={setDeleteTarget}
                  />
                ))}
          </Box>
        )
      ) : null}

      {view === 'table' ? (
        <PlanTable
          rows={rows}
          loading={listLoading}
          canEdit={Boolean(isAdmin || myTeacherId)}
          canDelete={Boolean(isAdmin || myTeacherId)}
          onView={(item) =>
            navigate(`${BASE_PATH}/${item.lesson_plan_details.id}`)
          }
          onEdit={(item) => {
            if (!canModify(item)) {
              return
            }
            navigate(`${BASE_PATH}/${item.lesson_plan_details.id}/edit`)
          }}
          onDelete={(item) => {
            if (!canDeleteRow(item)) {
              return
            }
            setDeleteTarget(item)
          }}
        />
      ) : null}

      {total > PAGE_LIMIT ? (
        <Stack alignItems="center" mt={3}>
          <Pagination
            count={Math.ceil(total / PAGE_LIMIT)}
            page={page}
            onChange={(_, value) => setPage(value)}
            shape="rounded"
            color="primary"
          />
        </Stack>
      ) : null}

      <DeleteConfirmationModal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirmationClick={handleDelete}
        confirmLoader={deleteLoading}
        confirmText="Delete"
        heading="Delete this lesson plan?"
      >
        <Typography fontSize={13} color={colors.grey[600]}>
          {deleteTarget?.lesson_plan_details.title ?? 'This lesson plan'} and
          all of its topics and uploaded resources will be removed permanently.
        </Typography>
      </DeleteConfirmationModal>
    </Box>
  )
}
