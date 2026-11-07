import {
  Box,
  IconButton,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material'
import { ArrowUpRight, Paperclip, Pencil, Trash2 } from 'lucide-react'
import { colors } from '@src/helpers/colors.helpers'
import {
  formatPlanDate,
  getInitials,
  getPersonName,
  getPlanTitle,
} from '../../lessonPlan.helpers'
import { PlanStatusChip } from '../statusChip/planStatusChip.component'

interface Props {
  rows: LessonPlan.IListRow[]
  loading?: boolean
  canEdit?: boolean
  canDelete?: boolean
  onView: (row: LessonPlan.IListRow) => void
  onEdit: (row: LessonPlan.IListRow) => void
  onDelete?: (row: LessonPlan.IListRow) => void
}

const headerCellSx = {
  fontSize: 11.5,
  fontWeight: 700,
  letterSpacing: 0.4,
  textTransform: 'uppercase' as const,
  color: colors.grey[500],
  borderBottom: `1px solid ${colors.grey[200]}`,
  py: 1.25,
  whiteSpace: 'nowrap' as const,
}

export function PlanTable({
  rows,
  loading = false,
  canEdit = false,
  canDelete = false,
  onView,
  onEdit,
  onDelete,
}: Props) {
  return (
    <TableContainer
      sx={{
        borderRadius: 3,
        border: `1px solid ${colors.grey[200]}`,
        bgcolor: '#fff',
        overflow: 'hidden',
      }}
    >
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={headerCellSx}>Lesson plan</TableCell>
            <TableCell sx={headerCellSx}>Class</TableCell>
            <TableCell sx={headerCellSx}>Teacher</TableCell>
            <TableCell sx={headerCellSx}>Topics</TableCell>
            <TableCell sx={headerCellSx}>Status</TableCell>
            <TableCell sx={headerCellSx} align="right">
              Actions
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {loading
            ? Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  {Array.from({ length: 6 }).map((__, cellIndex) => (
                    <TableCell key={cellIndex}>
                      <Skeleton height={28} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            : null}

          {!loading && rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6}>
                <Stack alignItems="center" py={6} spacing={0.5}>
                  <Typography
                    fontSize={14}
                    fontWeight={600}
                    color={colors.grey[700]}
                  >
                    No lesson plans found
                  </Typography>
                  <Typography fontSize={12} color={colors.grey[500]}>
                    Adjust the filters or create a new lesson plan.
                  </Typography>
                </Stack>
              </TableCell>
            </TableRow>
          ) : null}

          {!loading && rows.length > 0
            ? rows.map((row) => (
                <PlanTableRow
                  key={row.lesson_plan_details.id}
                  row={row}
                  canEdit={canEdit}
                  canDelete={canDelete}
                  onView={onView}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))
            : null}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

interface IRowProps {
  row: LessonPlan.IListRow
  canEdit: boolean
  canDelete: boolean
  onView: (row: LessonPlan.IListRow) => void
  onEdit: (row: LessonPlan.IListRow) => void
  onDelete?: (row: LessonPlan.IListRow) => void
}

function PlanTableRow({
  row,
  canEdit,
  canDelete,
  onView,
  onEdit,
  onDelete,
}: IRowProps) {
  const plan = row.lesson_plan_details
  const teacherName = getPersonName(row.teacher_details)

  return (
    <TableRow
      hover
      sx={{ cursor: 'pointer', '&:last-child td': { borderBottom: 0 } }}
      onClick={() => onView(row)}
    >
      <TableCell sx={{ py: 1.5 }}>
        <Stack spacing={0.25}>
          <Typography fontSize={13.5} fontWeight={600} color={colors.grey[900]}>
            {getPlanTitle(plan)}
          </Typography>
          <Stack direction="row" spacing={0.75} alignItems="center">
            <Typography fontSize={11.5} color={colors.grey[500]}>
              {formatPlanDate(plan.plan_date, 'ddd, DD MMM YYYY')}
            </Typography>
            <Box
              sx={{
                width: 3,
                height: 3,
                borderRadius: '50%',
                bgcolor: colors.grey[300],
              }}
            />
            <Typography fontSize={11.5} color={colors.grey[500]}>
              {plan.plan_type === 'weekly' ? 'Weekly' : 'Daily'}
            </Typography>
          </Stack>
        </Stack>
      </TableCell>
      <TableCell>
        <Stack spacing={0.25}>
          <Typography fontSize={12.5} color={colors.grey[800]}>
            {row.class_details?.name}-{row.class_section_details?.name}
          </Typography>
          <Typography fontSize={11.5} color={colors.grey[500]}>
            {row.subject_details?.name}
          </Typography>
        </Stack>
      </TableCell>
      <TableCell>
        <Stack direction="row" spacing={0.75} alignItems="center">
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
            }}
          >
            {getInitials(teacherName)}
          </Box>
          <Typography fontSize={12.5} color={colors.grey[700]}>
            {teacherName || 'Unassigned'}
          </Typography>
        </Stack>
      </TableCell>
      <TableCell>
        <Stack direction="row" spacing={0.75} alignItems="center">
          <Typography fontSize={12.5} color={colors.grey[700]}>
            {row.topics_details?.length ?? 0}
          </Typography>
          <Paperclip size={12} color={colors.grey[400]} />
          <Typography fontSize={11.5} color={colors.grey[500]}>
            {row.resource_count ?? 0}
          </Typography>
        </Stack>
      </TableCell>
      <TableCell>
        <PlanStatusChip status={plan.status} size="small" />
      </TableCell>
      <TableCell align="right" onClick={(e) => e.stopPropagation()}>
        <Stack direction="row" spacing={0.25} justifyContent="flex-end">
          {canEdit ? (
            <Tooltip title="Edit">
              <IconButton size="small" onClick={() => onEdit(row)}>
                <Pencil size={14} color={colors.grey[600]} />
              </IconButton>
            </Tooltip>
          ) : null}
          {canDelete && onDelete ? (
            <Tooltip title="Delete">
              <IconButton size="small" onClick={() => onDelete(row)}>
                <Trash2 size={14} color={colors.red[400]} />
              </IconButton>
            </Tooltip>
          ) : null}
          <Tooltip title="Open">
            <IconButton size="small" onClick={() => onView(row)}>
              <ArrowUpRight size={15} color={colors.blue[600]} />
            </IconButton>
          </Tooltip>
        </Stack>
      </TableCell>
    </TableRow>
  )
}
