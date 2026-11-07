import { Box, Skeleton, Stack, Typography } from '@mui/material'
import {
  CheckCircle2,
  Clock,
  Layers,
  PencilLine,
  PlayCircle,
} from 'lucide-react'
import { colors } from '@src/helpers/colors.helpers'
import {
  LESSON_PLAN_STATUS_META,
  LESSON_PLAN_STATUS_ORDER,
} from '../../lessonPlan.helpers'

interface Props {
  rows: LessonPlan.IListRow[] | null
  loading?: boolean
  activeStatus?: LessonPlan.Status | ''
  onSelect?: (status: LessonPlan.Status | '') => void
}

const STAT_ICONS: Record<LessonPlan.Status, JSX.Element> = {
  draft: <PencilLine size={16} />,
  submitted: <Clock size={16} />,
  approved: <CheckCircle2 size={16} />,
  rejected: <PencilLine size={16} />,
  completed: <PlayCircle size={16} />,
}

export function PlanStatCards({
  rows,
  loading = false,
  activeStatus = '',
  onSelect,
}: Props) {
  const planRows = rows ?? []
  const counts = LESSON_PLAN_STATUS_ORDER.reduce(
    (acc, status) => {
      acc[status] = planRows.filter(
        (row) => row.lesson_plan_details?.status === status
      ).length

      return acc
    },
    {} as Record<LessonPlan.Status, number>
  )

  const cards: {
    key: LessonPlan.Status | ''
    label: string
    value: number
    accent: string
    soft: string
    icon: JSX.Element
  }[] = [
    {
      key: '',
      label: 'Total plans',
      value: planRows.length,
      accent: colors.blue[600],
      soft: colors.blue[50],
      icon: <Layers size={16} />,
    },
    ...(
      ['draft', 'submitted', 'approved', 'completed'] as LessonPlan.Status[]
    ).map((status) => ({
      key: status as LessonPlan.Status | '',
      label: LESSON_PLAN_STATUS_META[status].label,
      value: counts[status],
      accent: LESSON_PLAN_STATUS_META[status].dot,
      soft: LESSON_PLAN_STATUS_META[status].bg,
      icon: STAT_ICONS[status],
    })),
  ]

  return (
    <Box
      sx={{
        display: 'grid',
        gap: 2,
        gridTemplateColumns: {
          xs: 'repeat(2, minmax(0, 1fr))',
          md: 'repeat(3, minmax(0, 1fr))',
          xl: 'repeat(5, minmax(0, 1fr))',
        },
      }}
    >
      {cards.map((card) => {
        const isActive = activeStatus === card.key

        return (
          <Box
            key={card.label}
            onClick={() => onSelect?.(card.key)}
            sx={{
              position: 'relative',
              overflow: 'hidden',
              cursor: onSelect ? 'pointer' : 'default',
              borderRadius: 3,
              border: `1px solid ${isActive ? card.accent : colors.grey[200]}`,
              bgcolor: isActive ? card.soft : '#fff',
              p: 2,
              transition: 'all 0.18s ease',
              boxShadow: isActive
                ? `0 10px 24px -16px ${card.accent}`
                : '0 1px 2px rgba(15,23,42,0.04)',
              '&:hover': onSelect
                ? {
                    borderColor: card.accent,
                    transform: 'translateY(-2px)',
                    boxShadow: `0 14px 28px -18px ${card.accent}`,
                  }
                : undefined,
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                background: `radial-gradient(120% 120% at 100% 0%, ${card.soft} 0%, transparent 60%)`,
                pointerEvents: 'none',
              }}
            />
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              position="relative"
            >
              <Box
                sx={{
                  width: 30,
                  height: 30,
                  borderRadius: 2,
                  display: 'grid',
                  placeItems: 'center',
                  bgcolor: isActive ? card.accent : card.soft,
                  color: isActive ? '#fff' : card.accent,
                  flexShrink: 0,
                }}
              >
                {card.icon}
              </Box>
              <Typography
                fontSize={12}
                fontWeight={600}
                color={colors.grey[600]}
                noWrap
              >
                {card.label}
              </Typography>
            </Stack>
            <Box mt={1.5} position="relative">
              {loading ? (
                <Skeleton width={48} height={36} />
              ) : (
                <Typography
                  fontSize={28}
                  fontWeight={700}
                  lineHeight={1.1}
                  color={colors.grey[900]}
                >
                  {card.value}
                </Typography>
              )}
            </Box>
          </Box>
        )
      })}
    </Box>
  )
}
