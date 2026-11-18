import { Box, Skeleton, Stack, Typography } from '@mui/material'
import {
  AlarmClock,
  CheckCircle2,
  Gauge,
  Inbox,
  ShieldAlert,
  Timer,
  UserX,
} from 'lucide-react'
import { colors } from '@src/helpers/colors.helpers'

export type TComplaintStatKey = 'open' | 'unassigned' | 'overdue' | 'escalated'

interface Props {
  stats: Complaint.IStats | null
  loading?: boolean
  activeKey?: TComplaintStatKey | ''
  onSelect?: (key: TComplaintStatKey) => void
}

/** Four actionable cards + four read-only indicators, the desk header. */
export function ComplaintStatCards({
  stats,
  loading = false,
  activeKey = '',
  onSelect,
}: Props) {
  const formatHours = (value: string | number | null) => {
    if (value === null || value === undefined || value === '') {
      return '—'
    }

    const hours = Number(value)

    return Number.isFinite(hours) ? `${Math.round(hours * 10) / 10} h` : '—'
  }

  const cards: {
    key: TComplaintStatKey
    label: string
    value: number
    accent: string
    soft: string
    icon: JSX.Element
  }[] = [
    {
      key: 'open',
      label: 'Open',
      value: Number(stats?.open ?? 0),
      accent: colors.blue[700],
      soft: colors.blue[50],
      icon: <Inbox size={16} />,
    },
    {
      key: 'unassigned',
      label: 'Unassigned',
      value: Number(stats?.unassigned ?? 0),
      accent: colors.amber[800],
      soft: colors.amber[50],
      icon: <UserX size={16} />,
    },
    {
      key: 'overdue',
      label: 'Overdue',
      value: Number(stats?.overdue ?? 0),
      accent: colors.red[700],
      soft: colors.red[50],
      icon: <AlarmClock size={16} />,
    },
    {
      key: 'escalated',
      label: 'Escalated',
      value: Number(stats?.escalated ?? 0),
      accent: colors.purple[700],
      soft: colors.purple[50],
      icon: <ShieldAlert size={16} />,
    },
  ]

  const indicators = [
    {
      label: 'SLA compliance',
      value:
        stats?.sla_compliance_pct === null ||
        stats?.sla_compliance_pct === undefined
          ? '—'
          : `${Number(stats.sla_compliance_pct)}%`,
      icon: <Gauge size={14} />,
      accent: colors.teal[700],
    },
    {
      label: 'Avg first response',
      value: formatHours(stats?.avg_first_response_hours ?? null),
      icon: <Timer size={14} />,
      accent: colors.blue[700],
    },
    {
      label: 'Avg resolution',
      value: formatHours(stats?.avg_resolution_hours ?? null),
      icon: <Gauge size={14} />,
      accent: colors.orange[800],
    },
    {
      label: 'Resolved this month',
      value: String(Number(stats?.resolved_this_month ?? 0)),
      icon: <CheckCircle2 size={14} />,
      accent: colors.green[700],
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
            md: 'repeat(4, minmax(0, 1fr))',
          },
        }}
      >
        {cards.map((card) => {
          const isActive = activeKey === card.key

          return (
            <Box
              key={card.key}
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
              <Stack direction="row" alignItems="center" spacing={1}>
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
              <Box mt={1.5}>
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
        {indicators.map((indicator) => (
          <Stack
            key={indicator.label}
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
            <Box sx={{ color: indicator.accent, display: 'flex' }}>
              {indicator.icon}
            </Box>
            <Typography fontSize={12} color={colors.grey[600]} noWrap>
              {indicator.label}
            </Typography>
            {loading ? (
              <Skeleton width={32} />
            ) : (
              <Typography
                fontSize={12.5}
                fontWeight={700}
                color={colors.grey[900]}
              >
                {indicator.value}
              </Typography>
            )}
          </Stack>
        ))}
      </Stack>
    </Stack>
  )
}
