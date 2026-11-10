import {
  Box,
  CircularProgress,
  Divider,
  Stack,
  Typography,
} from '@mui/material'
import { BadgeCheck, CalendarDays, GraduationCap } from 'lucide-react'
import SpringModal from '@src/components/modal/modal.component'
import { TinyMceViewer } from '@src/components/tinyMce/tinyMceViewer.component'
import { colors } from '@src/helpers/colors.helpers'
import { formatPlanDate, getPlanTitle } from '../../lessonPlan.helpers'
import { PlanStatusChip } from '../statusChip/planStatusChip.component'

interface Props {
  open: boolean
  onClose: () => void
  summary: LessonPlan.IDetail | null
  loading?: boolean
}

export function SummaryPreviewModal({
  open,
  onClose,
  summary,
  loading,
}: Props) {
  const plan = summary?.lesson_plan_details
  const topics = summary?.topics_details ?? []
  const resources = summary?.resources_details ?? []

  const sections = plan
    ? ([
        { label: 'Learning objectives', value: plan.objectives },
        { label: 'Methodology', value: plan.methodology },
        { label: 'Resources required', value: plan.resources },
        { label: 'Assessment', value: plan.assessment },
        { label: 'Homework', value: plan.homework },
      ] as const)
    : []

  return (
    <SpringModal open={open} close={onClose} size="sm">
      <Box sx={{ width: '100%' }}>
        {loading || !plan ? (
          <Stack alignItems="center" py={8} spacing={1.5}>
            <CircularProgress size={24} />
            <Typography fontSize={12.5} color={colors.grey[500]}>
              Loading the student view...
            </Typography>
          </Stack>
        ) : (
          <>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{
                px: 1.5,
                py: 1,
                borderRadius: 2,
                bgcolor: colors.blue[50],
                color: colors.blue[700],
                mb: 2,
              }}
            >
              <GraduationCap size={15} />
              <Typography fontSize={11.5} fontWeight={600}>
                This is what students and guardians see. Teacher reflections and
                review notes stay private.
              </Typography>
            </Stack>

            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              spacing={1}
            >
              <Box>
                <Typography
                  fontSize={17}
                  fontWeight={700}
                  color={colors.grey[900]}
                >
                  {getPlanTitle(plan)}
                </Typography>
                <Typography fontSize={11.5} color={colors.grey[500]} mt={0.25}>
                  {summary?.subject_details?.name} ·{' '}
                  {summary?.class_details?.name}-
                  {summary?.class_section_details?.name}
                </Typography>
              </Box>
              <PlanStatusChip status={plan.status} size="small" />
            </Stack>

            <Stack
              direction="row"
              spacing={1.5}
              alignItems="center"
              mt={1.25}
              mb={2}
            >
              <Stack direction="row" spacing={0.5} alignItems="center">
                <CalendarDays size={13} color={colors.grey[500]} />
                <Typography fontSize={11.5} color={colors.grey[600]}>
                  {formatPlanDate(plan.plan_date, 'ddd, DD MMM YYYY')}
                </Typography>
              </Stack>
              {plan.is_published ? (
                <Stack
                  direction="row"
                  spacing={0.5}
                  alignItems="center"
                  sx={{ color: colors.green[600] }}
                >
                  <BadgeCheck size={13} />
                  <Typography fontSize={11.5} fontWeight={600}>
                    Published
                  </Typography>
                </Stack>
              ) : null}
            </Stack>

            <Divider sx={{ mb: 2 }} />

            <Stack spacing={1.75}>
              {sections.map((section) => (
                <Box key={section.label}>
                  <Typography
                    fontSize={11}
                    fontWeight={700}
                    letterSpacing={0.3}
                    textTransform="uppercase"
                    color={colors.grey[500]}
                    mb={0.25}
                  >
                    {section.label}
                  </Typography>
                  <TinyMceViewer content={section.value} dense />
                </Box>
              ))}

              <Box>
                <Typography
                  fontSize={11}
                  fontWeight={700}
                  letterSpacing={0.3}
                  textTransform="uppercase"
                  color={colors.grey[500]}
                  mb={0.5}
                >
                  Topics covered
                </Typography>
                {topics.length === 0 ? (
                  <Typography fontSize={13} color={colors.grey[400]}>
                    Not specified.
                  </Typography>
                ) : (
                  <Stack
                    direction="row"
                    spacing={0.75}
                    flexWrap="wrap"
                    gap={0.75}
                  >
                    {topics.map((topic) => (
                      <Box
                        key={topic.id}
                        sx={{
                          px: 1,
                          py: 0.25,
                          borderRadius: 1,
                          bgcolor: colors.grey[100],
                        }}
                      >
                        <Typography fontSize={11.5} color={colors.grey[700]}>
                          {topic.name}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                )}
              </Box>

              {resources.length > 0 ? (
                <Box>
                  <Typography
                    fontSize={11}
                    fontWeight={700}
                    letterSpacing={0.3}
                    textTransform="uppercase"
                    color={colors.grey[500]}
                    mb={0.5}
                  >
                    Attachments
                  </Typography>
                  <Stack spacing={0.75}>
                    {resources.map((resource) => (
                      <Typography
                        key={resource.id}
                        fontSize={12.5}
                        color={colors.blue[700]}
                      >
                        {resource.label ?? 'Attachment'}
                      </Typography>
                    ))}
                  </Stack>
                </Box>
              ) : null}
            </Stack>
          </>
        )}
      </Box>
    </SpringModal>
  )
}
