import { Box, IconButton, Stack, Tooltip, Typography } from '@mui/material'
import moment from 'moment'
import {
  ArrowUpRight,
  CalendarDays,
  Paperclip,
  Pencil,
  Trash2,
} from 'lucide-react'
import { colors } from '@src/helpers/colors.helpers'
import {
  getInitials,
  getPersonName,
  getPlanTitle,
} from '../../lessonPlan.helpers'
import { PlanStatusChip } from '../statusChip/planStatusChip.component'

interface Props {
  row: LessonPlan.IListRow
  canEdit?: boolean
  canDelete?: boolean
  onView: (row: LessonPlan.IListRow) => void
  onEdit: (row: LessonPlan.IListRow) => void
  onDelete?: (row: LessonPlan.IListRow) => void
}

export function PlanCard({
  row,
  canEdit = false,
  canDelete = false,
  onView,
  onEdit,
  onDelete,
}: Props) {
  const plan = row.lesson_plan_details
  const planDate = moment(plan.plan_date)
  const teacherName = getPersonName(row.teacher_details) || 'Unassigned'
  const topics = row.topics_details ?? []

  return (
    <Box
      onClick={() => onView(row)}
      sx={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 3,
        border: `1px solid ${colors.grey[200]}`,
        bgcolor: '#fff',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all 0.18s ease',
        boxShadow: '0 1px 2px rgba(15,23,42,0.04)',
        '&:hover': {
          borderColor: colors.blue[300],
          transform: 'translateY(-2px)',
          boxShadow: '0 18px 36px -24px rgba(15,23,42,0.45)',
        },
        '&:hover .plan-card-actions': { opacity: 1 },
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="center" p={2} pb={1.5}>
        <Box
          sx={{
            width: 46,
            borderRadius: 2,
            textAlign: 'center',
            py: 0.5,
            bgcolor: colors.blue[50],
            color: colors.blue[700],
            flexShrink: 0,
          }}
        >
          <Typography fontSize={16} fontWeight={700} lineHeight={1.1}>
            {planDate.format('DD')}
          </Typography>
          <Typography
            fontSize={10}
            fontWeight={700}
            letterSpacing={0.6}
            textTransform="uppercase"
          >
            {planDate.format('MMM')}
          </Typography>
        </Box>
        <Box flex={1} minWidth={0}>
          <Typography
            fontSize={14.5}
            fontWeight={700}
            color={colors.grey[900]}
            sx={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {getPlanTitle(plan)}
          </Typography>
          <Typography fontSize={11.5} color={colors.grey[500]} noWrap mt={0.25}>
            {row.subject_details?.name} · {row.class_details?.name}-
            {row.class_section_details?.name}
          </Typography>
        </Box>
        <PlanStatusChip status={plan.status} size="small" />
      </Stack>

      <Box px={2} pb={1.5} flex={1}>
        {topics.length === 0 ? (
          <Typography fontSize={12} color={colors.grey[400]}>
            No syllabus topics attached yet.
          </Typography>
        ) : (
          <Stack direction="row" spacing={0.75} flexWrap="wrap" gap={0.75}>
            {topics.slice(0, 2).map((topic) => (
              <Box
                key={topic.id}
                sx={{
                  px: 1,
                  py: 0.25,
                  borderRadius: 1,
                  bgcolor: colors.grey[100],
                  maxWidth: '100%',
                }}
              >
                <Typography fontSize={11} color={colors.grey[700]} noWrap>
                  {topic.name}
                </Typography>
              </Box>
            ))}
            {topics.length > 2 ? (
              <Typography fontSize={11} color={colors.grey[500]} py={0.25}>
                +{topics.length - 2} more
              </Typography>
            ) : null}
          </Stack>
        )}
      </Box>

      <Stack
        direction="row"
        alignItems="center"
        spacing={1}
        px={2}
        py={1.25}
        sx={{ borderTop: `1px solid ${colors.grey[100]}` }}
      >
        <Box
          sx={{
            width: 24,
            height: 24,
            borderRadius: '50%',
            display: 'grid',
            placeItems: 'center',
            bgcolor: colors.indigo[50],
            color: colors.indigo[600],
            fontSize: 10,
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          {getInitials(teacherName)}
        </Box>
        <Typography fontSize={11.5} color={colors.grey[600]} noWrap flex={1}>
          {teacherName}
        </Typography>
        <Stack direction="row" spacing={0.5} alignItems="center">
          <CalendarDays size={13} color={colors.grey[400]} />
          <Typography fontSize={11} color={colors.grey[500]}>
            {plan.plan_type === 'weekly' ? 'Weekly' : 'Daily'}
          </Typography>
        </Stack>
        <Stack direction="row" spacing={0.5} alignItems="center">
          <Paperclip size={13} color={colors.grey[400]} />
          <Typography fontSize={11} color={colors.grey[500]}>
            {row.resource_count ?? 0}
          </Typography>
        </Stack>
        <Stack
          className="plan-card-actions"
          direction="row"
          spacing={0.25}
          sx={{ opacity: { xs: 1, md: 0 }, transition: 'opacity 0.15s ease' }}
          onClick={(event) => event.stopPropagation()}
        >
          {canEdit ? (
            <Tooltip title="Edit plan">
              <IconButton size="small" onClick={() => onEdit(row)}>
                <Pencil size={14} color={colors.grey[600]} />
              </IconButton>
            </Tooltip>
          ) : null}
          {canDelete && onDelete ? (
            <Tooltip title="Delete plan">
              <IconButton size="small" onClick={() => onDelete(row)}>
                <Trash2 size={14} color={colors.red[400]} />
              </IconButton>
            </Tooltip>
          ) : null}
          <Tooltip title="Open plan">
            <IconButton size="small" onClick={() => onView(row)}>
              <ArrowUpRight size={15} color={colors.blue[600]} />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>
    </Box>
  )
}
