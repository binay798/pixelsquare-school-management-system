import {
  Box,
  CircularProgress,
  Divider,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  BadgeCheck,
  Ban,
  BookOpen,
  CheckCircle2,
  ClipboardList,
  Clock,
  Eye,
  FileText,
  History,
  Lock,
  MessageSquare,
  Pencil,
  PlayCircle,
  RotateCcw,
  Send,
  Target,
  Trash2,
  Upload,
  User,
} from 'lucide-react'
import { ButtonComp } from '@src/components/button/button.component'
import { DeleteConfirmationModal } from '@src/components/confirmationModal/deleteConfirmationModal.component'
import { TinyMceEditor } from '@src/components/tinyMce/tinyMceEditor.component'
import { TinyMceViewer } from '@src/components/tinyMce/tinyMceViewer.component'
import { colors } from '@src/helpers/colors.helpers'
import { ROLE } from '@src/constants/users.constants'
import { useDispatch, useSelector } from '@src/store/hooks.store'
import {
  addLessonPlanTopicsAction,
  attachLessonPlanLinkAction,
  deleteLessonPlanAction,
  deleteLessonPlanResourceAction,
  getLessonPlanDetailAction,
  getLessonPlanSummaryAction,
  removeLessonPlanTopicAction,
  resetLessonPlanDetail,
  updateLessonPlanReflectionAction,
  updateLessonPlanStatusAction,
  uploadLessonPlanResourcesAction,
} from '@src/store/redux/dashboard/academics/lessonPlans/lessonPlans.slice'
import { TopicsPickerModal } from '../../components/topicsPickerModal/topicsPickerModal.component'
import { SummaryPreviewModal } from '../../components/summaryPreviewModal/summaryPreviewModal.component'
import { ResourcePanel } from '../../components/resourcePanel/resourcePanel.component'
import { ReviewDecisionModal } from '../../components/reviewDecisionModal/reviewDecisionModal.component'
import {
  PlanStatusChip,
  getStatusMeta,
} from '../../components/statusChip/planStatusChip.component'
import {
  formatPlanDate,
  getAllowedTransitions,
  getPersonName,
  getPlanTitle,
  isLessonPlanLocked,
  loadMyTeacherId,
} from '../../lessonPlan.helpers'

const BASE_PATH = '/dashboard/academics/lesson-plan'

interface IStatusAction {
  status: LessonPlan.Status
  label: string
  icon: JSX.Element
  variant: 'contained' | 'outlined' | 'text'
  color: 'primary' | 'success' | 'error' | 'inherit' | 'warning'
}

const STATUS_ACTION_META: Record<LessonPlan.Status, IStatusAction> = {
  draft: {
    status: 'draft',
    label: 'Move to draft',
    icon: <RotateCcw size={15} />,
    variant: 'outlined',
    color: 'inherit',
  },
  submitted: {
    status: 'submitted',
    label: 'Submit for review',
    icon: <Send size={15} />,
    variant: 'contained',
    color: 'primary',
  },
  approved: {
    status: 'approved',
    label: 'Approve',
    icon: <CheckCircle2 size={15} />,
    variant: 'contained',
    color: 'success',
  },
  rejected: {
    status: 'rejected',
    label: 'Reject',
    icon: <Ban size={15} />,
    variant: 'outlined',
    color: 'error',
  },
  completed: {
    status: 'completed',
    label: 'Mark completed',
    icon: <PlayCircle size={15} />,
    variant: 'contained',
    color: 'primary',
  },
}

const cardSx = {
  borderRadius: 3,
  border: `1px solid ${colors.grey[200]}`,
  bgcolor: '#fff',
  p: 2.5,
}

export function LessonPlanDetailPage() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { lessonPlanId } = useParams()
  const planId = Number(lessonPlanId)

  const { data: auth } = useSelector((store) => store.auth.user)
  const { data: detail, loading } = useSelector(
    (store) => store.lessonPlans.planDetail
  )
  const { data: summary, loading: summaryLoading } = useSelector(
    (store) => store.lessonPlans.planSummary
  )
  const { loading: statusLoading } = useSelector(
    (store) => store.lessonPlans.statusMutation
  )
  const { loading: reflectionLoading } = useSelector(
    (store) => store.lessonPlans.reflectionMutation
  )
  const { loading: topicLoading } = useSelector(
    (store) => store.lessonPlans.topicMutation
  )
  const { loading: resourceLoading } = useSelector(
    (store) => store.lessonPlans.resourceMutation
  )
  const { loading: deleteLoading } = useSelector(
    (store) => store.lessonPlans.deletePlan
  )

  const [myTeacherId, setMyTeacherId] = useState<number | undefined>()
  const [reflection, setReflection] = useState('')
  const [reflectionPrefilled, setReflectionPrefilled] = useState(false)
  const [reviewDecision, setReviewDecision] = useState<
    'approved' | 'rejected' | null
  >(null)
  const [topicsOpen, setTopicsOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [summaryOpen, setSummaryOpen] = useState(false)

  const userRoles = auth?.userRoles ?? []
  const isAdmin = useMemo(
    () => userRoles.includes(ROLE.admin) || userRoles.includes(ROLE.superadmin),
    [userRoles]
  )

  useEffect(() => {
    if (!planId) {
      return
    }
    dispatch(resetLessonPlanDetail())
    dispatch(getLessonPlanDetailAction(planId))
  }, [dispatch, planId])

  useEffect(() => {
    loadMyTeacherId(auth?.user?.id)
      .then(setMyTeacherId)
      .catch(() => setMyTeacherId(undefined))
  }, [auth?.user?.id])

  const plan = detail?.lesson_plan_details
  const topics = detail?.topics_details ?? []
  const resources = detail?.resources_details ?? []

  useEffect(() => {
    setReflectionPrefilled(false)
    setReviewDecision(null)
    setTopicsOpen(false)
    setDeleteOpen(false)
    setSummaryOpen(false)
  }, [planId])

  useEffect(() => {
    if (!plan || reflectionPrefilled || plan.id !== planId) {
      return
    }
    setReflection(plan.teacher_reflection ?? '')
    setReflectionPrefilled(true)
  }, [plan, reflectionPrefilled, planId])

  const refresh = () => dispatch(getLessonPlanDetailAction(planId))

  const isAuthor = Boolean(
    myTeacherId && plan?.teacher_id && plan.teacher_id === myTeacherId
  )
  const locked = Boolean(plan && isLessonPlanLocked(plan.status))
  const canModify = Boolean(plan) && !locked && (isAdmin || isAuthor)
  // a school admin may remove any plan, a teacher only his own unlocked plan
  const canDelete = Boolean(plan) && (isAdmin || (isAuthor && !locked))

  const allTransitions = plan ? getAllowedTransitions(plan.status, isAdmin) : []
  const reviewActions: LessonPlan.Status[] =
    plan?.status === 'submitted' && isAdmin ? ['approved', 'rejected'] : []
  const otherActions = allTransitions.filter(
    (status) => !reviewActions.includes(status)
  )

  const resolveAction = (status: LessonPlan.Status): IStatusAction => {
    const meta = STATUS_ACTION_META[status]
    if (plan?.status === 'completed' && status === 'approved') {
      return {
        ...meta,
        label: 'Reopen plan',
        icon: <RotateCcw size={15} />,
        variant: 'outlined',
        color: 'inherit',
      }
    }
    if (plan?.status === 'rejected' && status === 'submitted') {
      return { ...meta, label: 'Resubmit for review' }
    }
    if (plan?.status === 'submitted' && status === 'draft') {
      return { ...meta, label: 'Recall to draft' }
    }

    return meta
  }

  const handleStatusChange = (
    status: LessonPlan.Status,
    reviewComment?: string
  ) => {
    dispatch(
      updateLessonPlanStatusAction({
        lessonPlanId: planId,
        status,
        review_comment: reviewComment,
        onSuccess: () => {
          setReviewDecision(null)
          refresh()
        },
      })
    )
  }

  const handleDelete = () => {
    dispatch(
      deleteLessonPlanAction({
        lessonPlanId: planId,
        onSuccess: () => navigate(BASE_PATH),
      })
    )
  }

  if (loading && !detail) {
    return (
      <Stack alignItems="center" justifyContent="center" py={12} spacing={1.5}>
        <CircularProgress size={28} />
        <Typography fontSize={13} color={colors.grey[500]}>
          Loading lesson plan...
        </Typography>
      </Stack>
    )
  }

  if (!detail || !plan) {
    return (
      <Box
        sx={{
          maxWidth: 480,
          mx: 'auto',
          mt: 6,
          p: 4,
          borderRadius: 3,
          border: `1px solid ${colors.grey[200]}`,
          bgcolor: '#fff',
          textAlign: 'center',
        }}
      >
        <Typography fontSize={16} fontWeight={700} color={colors.grey[900]}>
          Lesson plan not found
        </Typography>
        <Typography fontSize={13} color={colors.grey[600]} mt={0.5} mb={2.5}>
          It may have been deleted or you do not have access to it.
        </Typography>
        <ButtonComp
          startIcon={<ArrowLeft size={15} />}
          onClick={() => navigate(BASE_PATH)}
        >
          Back to lesson plans
        </ButtonComp>
      </Box>
    )
  }

  const statusMeta = getStatusMeta(plan.status)

  return (
    <Box>
      <Stack
        direction={{ xs: 'column', lg: 'row' }}
        spacing={2}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', lg: 'flex-start' }}
        mb={3}
      >
        <Stack direction="row" spacing={1.5} alignItems="flex-start">
          <ButtonComp
            size="small"
            variant="outlined"
            onClick={() => navigate(BASE_PATH)}
            sx={{ minWidth: 36, px: 1, mt: 0.5 }}
          >
            <ArrowLeft size={16} />
          </ButtonComp>
          <Box>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              flexWrap="wrap"
              gap={1}
            >
              <Typography
                variant="h6"
                fontWeight={700}
                color={colors.grey[900]}
              >
                {getPlanTitle(plan)}
              </Typography>
              <PlanStatusChip status={plan.status} />
              {plan.is_published ? (
                <Stack
                  direction="row"
                  spacing={0.5}
                  alignItems="center"
                  sx={{
                    px: 1,
                    py: 0.25,
                    borderRadius: 999,
                    bgcolor: colors.blue[50],
                    color: colors.blue[700],
                  }}
                >
                  <BadgeCheck size={13} />
                  <Typography fontSize={11} fontWeight={600}>
                    Published
                  </Typography>
                </Stack>
              ) : null}
              {locked ? (
                <Stack
                  direction="row"
                  spacing={0.5}
                  alignItems="center"
                  sx={{ color: colors.grey[500] }}
                >
                  <Lock size={13} />
                  <Typography fontSize={11} fontWeight={600}>
                    Locked
                  </Typography>
                </Stack>
              ) : null}
            </Stack>
            <Typography fontSize={12.5} color={colors.grey[600]} mt={0.5}>
              {detail.subject_details?.name} · {detail.class_details?.name}-
              {detail.class_section_details?.name} ·{' '}
              {formatPlanDate(plan.plan_date, 'ddd, DD MMM YYYY')} ·{' '}
              {plan.plan_type === 'weekly' ? 'Weekly plan' : 'Daily plan'}
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
          <ButtonComp
            size="small"
            variant="outlined"
            startIcon={<Eye size={14} />}
            onClick={() => {
              setSummaryOpen(true)
              dispatch(getLessonPlanSummaryAction(planId))
            }}
          >
            Student view
          </ButtonComp>
          {canModify ? (
            <ButtonComp
              size="small"
              variant="outlined"
              startIcon={<Pencil size={14} />}
              onClick={() => navigate(`${BASE_PATH}/${planId}/edit`)}
            >
              Edit
            </ButtonComp>
          ) : null}
          {canDelete ? (
            <Tooltip title="Delete plan">
              <ButtonComp
                size="small"
                variant="outlined"
                color="error"
                startIcon={<Trash2 size={14} />}
                onClick={() => setDeleteOpen(true)}
              >
                Delete
              </ButtonComp>
            </Tooltip>
          ) : null}
          {reviewActions.map((status) => {
            const meta = resolveAction(status)

            return (
              <ButtonComp
                key={status}
                size="small"
                variant={meta.variant}
                color={meta.color}
                startIcon={meta.icon}
                onClick={() =>
                  setReviewDecision(status as 'approved' | 'rejected')
                }
              >
                {meta.label}
              </ButtonComp>
            )
          })}
          {otherActions.map((status) => {
            const meta = resolveAction(status)

            return (
              <ButtonComp
                key={status}
                size="small"
                variant={meta.variant}
                color={meta.color}
                startIcon={meta.icon}
                loading={statusLoading}
                onClick={() => handleStatusChange(status)}
              >
                {meta.label}
              </ButtonComp>
            )
          })}
        </Stack>
      </Stack>

      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: {
            xs: '1fr',
            lg: 'minmax(0, 2fr) minmax(0, 1fr)',
          },
          alignItems: 'start',
        }}
      >
        <Stack spacing={2}>
          <Box sx={cardSx}>
            <Stack direction="row" alignItems="center" spacing={1} mb={2}>
              <ClipboardList size={16} color={colors.blue[600]} />
              <Typography
                fontSize={14.5}
                fontWeight={700}
                color={colors.grey[900]}
              >
                Lesson overview
              </Typography>
            </Stack>

            <Stack spacing={2}>
              {(
                [
                  {
                    key: 'objectives' as const,
                    label: 'Learning objectives',
                    icon: <Target size={13} />,
                  },
                  {
                    key: 'methodology' as const,
                    label: 'Methodology',
                    icon: <BookOpen size={13} />,
                  },
                  {
                    key: 'resources' as const,
                    label: 'Resources required',
                    icon: <FileText size={13} />,
                  },
                  {
                    key: 'assessment' as const,
                    label: 'Assessment',
                    icon: <CheckCircle2 size={13} />,
                  },
                  {
                    key: 'homework' as const,
                    label: 'Homework',
                    icon: <Pencil size={13} />,
                  },
                ] as const
              ).map((section) => (
                <Box key={section.key}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={0.75}
                    mb={0.5}
                  >
                    <Box sx={{ color: colors.blue[500], display: 'flex' }}>
                      {section.icon}
                    </Box>
                    <Typography
                      fontSize={12}
                      fontWeight={700}
                      letterSpacing={0.2}
                      color={colors.grey[600]}
                      textTransform="uppercase"
                    >
                      {section.label}
                    </Typography>
                  </Stack>
                  <TinyMceViewer content={plan[section.key]} />
                </Box>
              ))}
            </Stack>
          </Box>

          <Box sx={cardSx}>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              mb={1.5}
            >
              <Stack direction="row" alignItems="center" spacing={1}>
                <BookOpen size={16} color={colors.blue[600]} />
                <Typography
                  fontSize={14.5}
                  fontWeight={700}
                  color={colors.grey[900]}
                >
                  Syllabus topics
                </Typography>
                <Box
                  sx={{
                    px: 0.75,
                    py: 0.1,
                    borderRadius: 999,
                    bgcolor: colors.blue[50],
                    color: colors.blue[700],
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                >
                  {topics.length}
                </Box>
              </Stack>
              {canModify ? (
                <ButtonComp
                  size="small"
                  variant="outlined"
                  onClick={() => setTopicsOpen(true)}
                >
                  Manage topics
                </ButtonComp>
              ) : null}
            </Stack>

            {topics.length === 0 ? (
              <Typography fontSize={12.5} color={colors.grey[500]}>
                No syllabus topics attached to this lesson yet.
              </Typography>
            ) : (
              <Stack spacing={1}>
                {topics.map((topic) => (
                  <Stack
                    key={topic.id}
                    direction="row"
                    alignItems="center"
                    spacing={1.5}
                    sx={{
                      border: `1px solid ${colors.grey[200]}`,
                      borderRadius: 2,
                      px: 1.5,
                      py: 1,
                    }}
                  >
                    <Box
                      sx={{
                        px: 0.75,
                        py: 0.25,
                        borderRadius: 1,
                        bgcolor: colors.grey[100],
                        color: colors.grey[600],
                        fontSize: 10.5,
                        fontWeight: 700,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      CH {topic.chapter_number}
                    </Box>
                    <Box flex={1} minWidth={0}>
                      <Typography
                        fontSize={13}
                        fontWeight={600}
                        color={colors.grey[800]}
                        noWrap
                      >
                        {topic.name}
                      </Typography>
                      <Typography fontSize={11} color={colors.grey[500]} noWrap>
                        {topic.chapter_name}
                        {topic.estimated_periods
                          ? ` · ${topic.estimated_periods} periods`
                          : ''}
                      </Typography>
                    </Box>
                    {canModify ? (
                      <Tooltip title="Remove topic">
                        <Box
                          component="button"
                          onClick={() =>
                            dispatch(
                              removeLessonPlanTopicAction({
                                lessonPlanId: planId,
                                topicId: topic.id,
                                onSuccess: refresh,
                              })
                            )
                          }
                          disabled={topicLoading}
                          sx={{
                            border: 'none',
                            background: 'transparent',
                            cursor: 'pointer',
                            display: 'flex',
                            color: colors.grey[400],
                            '&:hover': { color: colors.red[400] },
                          }}
                        >
                          <Trash2 size={14} />
                        </Box>
                      </Tooltip>
                    ) : null}
                  </Stack>
                ))}
              </Stack>
            )}
          </Box>

          <Box sx={cardSx}>
            <ResourcePanel
              resources={resources}
              locked={!canModify}
              loading={resourceLoading}
              onUpload={(files) =>
                dispatch(
                  uploadLessonPlanResourcesAction({
                    lessonPlanId: planId,
                    files,
                    onSuccess: refresh,
                  })
                )
              }
              onAttachLink={(payload) =>
                dispatch(
                  attachLessonPlanLinkAction({
                    lessonPlanId: planId,
                    url: payload.url,
                    label: payload.label,
                    onSuccess: refresh,
                  })
                )
              }
              onDelete={(resourceId) =>
                dispatch(
                  deleteLessonPlanResourceAction({
                    lessonPlanId: planId,
                    resourceId,
                    onSuccess: refresh,
                  })
                )
              }
            />
          </Box>

          <Box sx={cardSx}>
            <Stack direction="row" alignItems="center" spacing={1} mb={1.5}>
              <MessageSquare size={16} color={colors.blue[600]} />
              <Typography
                fontSize={14.5}
                fontWeight={700}
                color={colors.grey[900]}
              >
                Post-lesson reflection
              </Typography>
            </Stack>

            {isAuthor ? (
              <>
                <Typography fontSize={12.5} color={colors.grey[600]} mb={1.25}>
                  What worked well? What needs to change the next time this
                  lesson is delivered?
                </Typography>
                <TinyMceEditor
                  placeholder="Write your reflection after the lesson has been delivered..."
                  height={190}
                  compact
                  value={reflection}
                  onChange={setReflection}
                />
                <Stack
                  direction="row"
                  justifyContent="flex-end"
                  spacing={1}
                  mt={1.5}
                >
                  <ButtonComp
                    size="small"
                    variant="outlined"
                    onClick={() => setReflection(plan.teacher_reflection ?? '')}
                  >
                    Reset
                  </ButtonComp>
                  <ButtonComp
                    size="small"
                    startIcon={<Upload size={14} />}
                    loading={reflectionLoading}
                    disabled={reflection === (plan.teacher_reflection ?? '')}
                    onClick={() =>
                      dispatch(
                        updateLessonPlanReflectionAction({
                          lessonPlanId: planId,
                          teacherReflection: reflection,
                          onSuccess: refresh,
                        })
                      )
                    }
                  >
                    Save reflection
                  </ButtonComp>
                </Stack>
              </>
            ) : plan.teacher_reflection ? (
              <TinyMceViewer content={plan.teacher_reflection} />
            ) : (
              <Typography fontSize={12.5} color={colors.grey[500]}>
                The teacher has not recorded a reflection for this lesson yet.
              </Typography>
            )}
          </Box>
        </Stack>

        <Stack spacing={2} sx={{ position: { lg: 'sticky' }, top: { lg: 16 } }}>
          <Box sx={cardSx}>
            <Typography
              fontSize={14.5}
              fontWeight={700}
              color={colors.grey[900]}
              mb={1.5}
            >
              Plan details
            </Typography>
            <Stack spacing={1.25}>
              {[
                { label: 'Class', value: detail.class_details?.name ?? '—' },
                {
                  label: 'Section',
                  value: detail.class_section_details?.name ?? '—',
                },
                {
                  label: 'Subject',
                  value: detail.subject_details?.name ?? '—',
                },
                {
                  label: 'Teacher',
                  value: getPersonName(detail.teacher_details) || 'Unassigned',
                },
                {
                  label: 'Plan type',
                  value: plan.plan_type === 'weekly' ? 'Weekly' : 'Daily',
                },
                { label: 'Lesson date', value: formatPlanDate(plan.plan_date) },
                ...(plan.week_start_date
                  ? [
                      {
                        label: 'Week of',
                        value: formatPlanDate(plan.week_start_date),
                      },
                    ]
                  : []),
                {
                  label: 'Created',
                  value: formatPlanDate(
                    plan.created_at,
                    'DD MMM YYYY, hh:mm A'
                  ),
                },
                {
                  label: 'Updated',
                  value: formatPlanDate(
                    plan.updated_at,
                    'DD MMM YYYY, hh:mm A'
                  ),
                },
              ].map((item) => (
                <Stack
                  key={item.label}
                  direction="row"
                  justifyContent="space-between"
                  spacing={1}
                >
                  <Typography fontSize={12} color={colors.grey[500]}>
                    {item.label}
                  </Typography>
                  <Typography
                    fontSize={12.5}
                    fontWeight={600}
                    color={colors.grey[800]}
                    textAlign="right"
                  >
                    {item.value}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </Box>

          <Box sx={cardSx}>
            <Stack direction="row" alignItems="center" spacing={1} mb={1.5}>
              <History size={16} color={colors.blue[600]} />
              <Typography
                fontSize={14.5}
                fontWeight={700}
                color={colors.grey[900]}
              >
                Review &amp; lifecycle
              </Typography>
            </Stack>

            <Stack direction="row" alignItems="center" spacing={1} mb={1.5}>
              <PlanStatusChip status={plan.status} size="small" />
              <Typography fontSize={11.5} color={colors.grey[500]}>
                {statusMeta.description}
              </Typography>
            </Stack>

            <Stack spacing={1.5}>
              <TimelineRow
                icon={<Clock size={13} />}
                title="Created"
                time={formatPlanDate(plan.created_at, 'DD MMM YYYY, hh:mm A')}
                tone={colors.grey[500]}
              />
              {plan.reviewed_at ? (
                <TimelineRow
                  icon={<BadgeCheck size={13} />}
                  title={`Reviewed by ${
                    getPersonName(detail.reviewer_details) || 'coordinator'
                  }`}
                  time={formatPlanDate(
                    plan.reviewed_at,
                    'DD MMM YYYY, hh:mm A'
                  )}
                  tone={
                    plan.status === 'rejected'
                      ? colors.red[400]
                      : colors.green[500]
                  }
                />
              ) : null}
              {plan.completed_at ? (
                <TimelineRow
                  icon={<PlayCircle size={13} />}
                  title="Lesson completed"
                  time={formatPlanDate(
                    plan.completed_at,
                    'DD MMM YYYY, hh:mm A'
                  )}
                  tone={colors.indigo[500]}
                />
              ) : null}
            </Stack>

            {plan.review_comment ? (
              <>
                <Divider sx={{ my: 1.75 }} />
                <Typography
                  fontSize={11.5}
                  fontWeight={700}
                  color={colors.grey[600]}
                  mb={0.5}
                  textTransform="uppercase"
                >
                  Review comment
                </Typography>
                <Box
                  sx={{
                    p: 1.25,
                    borderRadius: 2,
                    bgcolor:
                      plan.status === 'rejected'
                        ? colors.red[50]
                        : colors.green[50],
                    border: `1px solid ${
                      plan.status === 'rejected'
                        ? colors.red[100]
                        : colors.green[100]
                    }`,
                  }}
                >
                  <Typography fontSize={12.5} color={colors.grey[800]}>
                    {plan.review_comment}
                  </Typography>
                </Box>
              </>
            ) : null}
          </Box>

          <Box
            sx={{
              ...cardSx,
              display: 'flex',
              alignItems: 'center',
              gap: 1.25,
              p: 2,
            }}
          >
            <Box
              sx={{
                width: 30,
                height: 30,
                borderRadius: '50%',
                display: 'grid',
                placeItems: 'center',
                bgcolor: colors.indigo[50],
                color: colors.indigo[600],
                flexShrink: 0,
              }}
            >
              <User size={15} />
            </Box>
            <Box>
              <Typography
                fontSize={12.5}
                fontWeight={700}
                color={colors.grey[800]}
              >
                {getPersonName(detail.teacher_details) || 'Unassigned teacher'}
              </Typography>
              <Typography fontSize={11} color={colors.grey[500]}>
                Author of this lesson plan
              </Typography>
            </Box>
          </Box>
        </Stack>
      </Box>

      <TopicsPickerModal
        open={topicsOpen}
        onClose={() => setTopicsOpen(false)}
        classId={plan.class_id}
        subjectId={plan.subject_id}
        selectedTopicIds={topics.map((topic) => topic.id)}
        loading={topicLoading}
        onSubmit={async (topicIds) => {
          setTopicsOpen(false)
          const currentIds = topics.map((topic) => topic.id)
          const added = topicIds.filter((id) => !currentIds.includes(id))
          const removed = currentIds.filter((id) => !topicIds.includes(id))

          if (added.length > 0) {
            await dispatch(
              addLessonPlanTopicsAction({
                lessonPlanId: planId,
                topicIds: added,
              })
            )
          }
          for (const topicId of removed) {
            await dispatch(
              removeLessonPlanTopicAction({ lessonPlanId: planId, topicId })
            )
          }
          refresh()
        }}
      />

      <ReviewDecisionModal
        open={Boolean(reviewDecision)}
        onClose={() => setReviewDecision(null)}
        decision={reviewDecision ?? 'approved'}
        planTitle={getPlanTitle(plan)}
        loading={statusLoading}
        onSubmit={(comment) => {
          if (!reviewDecision) {
            return
          }
          handleStatusChange(reviewDecision, comment)
        }}
      />

      <SummaryPreviewModal
        open={summaryOpen}
        onClose={() => setSummaryOpen(false)}
        summary={summary}
        loading={summaryLoading}
      />

      <DeleteConfirmationModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirmationClick={handleDelete}
        confirmLoader={deleteLoading}
        confirmText="Delete"
        heading="Delete this lesson plan?"
      >
        <Typography fontSize={13} color={colors.grey[600]}>
          The plan, its syllabus topics and every uploaded resource will be
          removed permanently.
        </Typography>
      </DeleteConfirmationModal>
    </Box>
  )
}

function TimelineRow({
  icon,
  title,
  time,
  tone,
}: {
  icon: JSX.Element
  title: string
  time: string
  tone: string
}) {
  return (
    <Stack direction="row" spacing={1.25} alignItems="flex-start">
      <Box
        sx={{
          width: 24,
          height: 24,
          borderRadius: '50%',
          display: 'grid',
          placeItems: 'center',
          bgcolor: colors.grey[100],
          color: tone,
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Box flex={1} minWidth={0}>
        <Typography fontSize={12.5} fontWeight={600} color={colors.grey[800]}>
          {title}
        </Typography>
        <Typography fontSize={11} color={colors.grey[500]}>
          {time}
        </Typography>
      </Box>
    </Stack>
  )
}
