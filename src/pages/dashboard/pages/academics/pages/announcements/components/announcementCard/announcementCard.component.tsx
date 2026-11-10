import { Box, Skeleton, Stack, Typography } from '@mui/material'
import { CheckCheck, Eye, Pin } from 'lucide-react'
import { colors } from '@src/helpers/colors.helpers'
import {
  ANNOUNCEMENT_AUDIENCE_TYPE_META,
  ANNOUNCEMENT_CATEGORY_OPTIONS,
  formatAnnouncementDateTime,
  getPersonName,
  stripAnnouncementHtml,
} from '../../announcements.helpers'
import {
  AnnouncementPriorityChip,
  AnnouncementStatusChip,
} from '../statusChip/announcementStatusChip.component'

interface CardProps {
  row: Announcement.IFeedRowWithReceipt
  onClick: () => void
}

interface SkeletonProps {
  count?: number
}

const getCategoryLabel = (category: Announcement.Category) =>
  ANNOUNCEMENT_CATEGORY_OPTIONS.find((option) => option.value === category)
    ?.label ?? category

export function AnnouncementCard({ row, onClick }: CardProps) {
  const announcement = row.announcement_details
  const isUnread = !row.is_read
  const needsAcknowledgement =
    announcement.require_acknowledgement && !row.acknowledged_at

  return (
    <Box
      onClick={onClick}
      sx={{
        position: 'relative',
        cursor: 'pointer',
        borderRadius: 3,
        border: `1px solid ${
          needsAcknowledgement
            ? colors.amber[300]
            : isUnread
            ? colors.blue[200]
            : colors.grey[200]
        }`,
        bgcolor: '#fff',
        p: 2,
        transition: 'all 0.18s ease',
        boxShadow: '0 1px 2px rgba(15,23,42,0.04)',
        '&:hover': {
          borderColor: colors.blue[400],
          transform: 'translateY(-2px)',
          boxShadow: '0 14px 28px -20px rgba(37,99,235,0.45)',
        },
      }}
    >
      <Stack direction="row" alignItems="flex-start" spacing={1}>
        <Stack spacing={0.5} flex={1} minWidth={0}>
          <Stack direction="row" alignItems="center" spacing={0.75}>
            {announcement.is_pinned ? (
              <Pin size={13} color={colors.orange[600]} />
            ) : null}
            {isUnread ? (
              <Box
                sx={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  bgcolor: colors.blue[500],
                  flexShrink: 0,
                }}
              />
            ) : null}
            <Typography
              fontSize={14.5}
              fontWeight={700}
              color={colors.grey[900]}
              noWrap
            >
              {announcement.title}
            </Typography>
          </Stack>
          <Typography fontSize={11.5} color={colors.grey[500]}>
            {getCategoryLabel(announcement.category)}
            {' · '}
            {ANNOUNCEMENT_AUDIENCE_TYPE_META[announcement.audience_type]?.label}
            {' · '}
            {formatAnnouncementDateTime(
              announcement.publish_at ?? announcement.published_at
            )}
          </Typography>
        </Stack>
        <Stack
          direction="row"
          spacing={0.75}
          alignItems="center"
          flexShrink={0}
        >
          <AnnouncementPriorityChip priority={announcement.priority} />
          {announcement.status !== 'published' ? (
            <AnnouncementStatusChip status={announcement.status} size="small" />
          ) : null}
        </Stack>
      </Stack>

      <Typography
        fontSize={12.5}
        color={colors.grey[600]}
        mt={1}
        lineHeight={1.6}
        sx={{
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {announcement.summary?.trim() ||
          stripAnnouncementHtml(announcement.content, 200)}
      </Typography>

      <Stack
        direction="row"
        alignItems="center"
        spacing={1.5}
        mt={1.5}
        flexWrap="wrap"
        gap={1}
      >
        <Typography fontSize={11.5} color={colors.grey[500]}>
          By {getPersonName(row.creator_details)}
        </Typography>
        {row.read_at ? (
          <Stack direction="row" spacing={0.4} alignItems="center">
            <Eye size={11} color={colors.grey[400]} />
            <Typography fontSize={11} color={colors.grey[500]}>
              Read
            </Typography>
          </Stack>
        ) : null}
        {announcement.require_acknowledgement ? (
          <Stack
            direction="row"
            spacing={0.4}
            alignItems="center"
            sx={{
              color: row.acknowledged_at
                ? colors.green[700]
                : colors.amber[700],
            }}
          >
            <CheckCheck size={12} />
            <Typography fontSize={11} fontWeight={600} color="inherit">
              {row.acknowledged_at ? 'Acknowledged' : 'Acknowledge required'}
            </Typography>
          </Stack>
        ) : null}
      </Stack>
    </Box>
  )
}

export function AnnouncementCardSkeleton({ count = 4 }: SkeletonProps) {
  return (
    <Stack spacing={1.5}>
      {Array.from({ length: count }).map((_, index) => (
        <Box
          key={index}
          sx={{
            borderRadius: 3,
            border: `1px solid ${colors.grey[200]}`,
            bgcolor: '#fff',
            p: 2,
          }}
        >
          <Skeleton width="45%" height={22} />
          <Skeleton width="30%" height={16} />
          <Skeleton width="90%" height={16} />
        </Box>
      ))}
    </Stack>
  )
}
