import { Box, Skeleton, Stack, Typography } from '@mui/material'
import {
  Archive,
  BellRing,
  CalendarClock,
  CheckCheck,
  Eye,
  Layers,
  Send,
} from 'lucide-react'
import { colors } from '@src/helpers/colors.helpers'
import { ANNOUNCEMENT_STATUS_META } from '../../announcements.helpers'

interface Props {
  stats: Announcement.IStats | null
  loading?: boolean
  activeStatus?: Announcement.Status | ''
  onSelect?: (status: Announcement.Status | '') => void
}

interface ICard {
  key: Announcement.Status | ''
  label: string
  value: number
  accent: string
  soft: string
  icon: JSX.Element
}

export function AnnouncementStatCards({
  stats,
  loading = false,
  activeStatus = '',
  onSelect,
}: Props) {
  const cards: ICard[] = [
    {
      key: '',
      label: 'Total notices',
      value: Number(stats?.total ?? 0),
      accent: colors.blue[600],
      soft: colors.blue[50],
      icon: <Layers size={16} />,
    },
    {
      key: 'draft',
      label: ANNOUNCEMENT_STATUS_META.draft.label,
      value: Number(stats?.draft ?? 0),
      accent: ANNOUNCEMENT_STATUS_META.draft.dot,
      soft: ANNOUNCEMENT_STATUS_META.draft.bg,
      icon: <Send size={16} />,
    },
    {
      key: 'scheduled',
      label: ANNOUNCEMENT_STATUS_META.scheduled.label,
      value: Number(stats?.scheduled ?? 0),
      accent: ANNOUNCEMENT_STATUS_META.scheduled.dot,
      soft: ANNOUNCEMENT_STATUS_META.scheduled.bg,
      icon: <CalendarClock size={16} />,
    },
    {
      key: 'published',
      label: 'Live now',
      value: Number(stats?.published ?? 0),
      accent: ANNOUNCEMENT_STATUS_META.published.dot,
      soft: ANNOUNCEMENT_STATUS_META.published.bg,
      icon: <BellRing size={16} />,
    },
    {
      key: 'archived',
      label: ANNOUNCEMENT_STATUS_META.archived.label,
      value: Number(stats?.archived ?? 0),
      accent: ANNOUNCEMENT_STATUS_META.archived.dot,
      soft: ANNOUNCEMENT_STATUS_META.archived.bg,
      icon: <Archive size={16} />,
    },
  ]

  const receiptCards = [
    {
      label: 'Total reads',
      value: Number(stats?.total_reads ?? 0),
      icon: <Eye size={14} />,
      accent: colors.teal[600],
    },
    {
      label: 'Acknowledgements',
      value: Number(stats?.total_acknowledgements ?? 0),
      icon: <CheckCheck size={14} />,
      accent: colors.green[700],
    },
    {
      label: 'Expired',
      value: Number(stats?.expired ?? 0),
      icon: <Archive size={14} />,
      accent: colors.orange[700],
    },
  ]

  return (
    <Stack spacing={1.5}>
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
                border: `1px solid ${
                  isActive ? card.accent : colors.grey[200]
                }`,
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

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25}>
        {receiptCards.map((card) => (
          <Stack
            key={card.label}
            direction="row"
            spacing={0.75}
            alignItems="center"
            sx={{
              px: 1.5,
              py: 0.75,
              borderRadius: 2,
              border: `1px dashed ${colors.grey[300]}`,
              bgcolor: colors.grey[50],
              flex: 1,
            }}
          >
            <Box sx={{ color: card.accent, display: 'flex' }}>{card.icon}</Box>
            <Typography fontSize={12} color={colors.grey[600]}>
              {card.label}
            </Typography>
            {loading ? (
              <Skeleton width={28} />
            ) : (
              <Typography
                fontSize={12.5}
                fontWeight={700}
                color={colors.grey[900]}
              >
                {card.value}
              </Typography>
            )}
          </Stack>
        ))}
      </Stack>
    </Stack>
  )
}
