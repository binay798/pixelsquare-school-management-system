import {
  Box,
  Divider,
  LinearProgress,
  Skeleton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  BarChart3,
  CalendarClock,
  CheckCheck,
  Eye,
  ExternalLink,
  Megaphone,
  Pencil,
  Pin,
  Trash2,
  Users,
} from 'lucide-react'
import { ButtonComp } from '@src/components/button/button.component'
import { DeleteConfirmationModal } from '@src/components/confirmationModal/deleteConfirmationModal.component'
import { colors } from '@src/helpers/colors.helpers'
import { ROLE } from '@src/constants/users.constants'
import { useDispatch, useSelector } from '@src/store/hooks.store'
import {
  acknowledgeAnnouncementAction,
  deleteAnnouncementAction,
  getAnnouncementAnalyticsAction,
  getAnnouncementDetailAction,
  markAnnouncementReadAction,
  resetAnnouncementDetail,
  updateAnnouncementStatusAction,
} from '@src/store/redux/dashboard/academics/announcements/announcements.slice'
import {
  ANNOUNCEMENT_AUDIENCE_TYPE_META,
  ANNOUNCEMENT_BASE_PATH,
  ANNOUNCEMENT_CATEGORY_OPTIONS,
  ANNOUNCEMENT_STATUS_META,
  formatAnnouncementDate,
  formatAnnouncementDateTime,
  getAllowedTransitions,
  getPersonName,
  isAnnouncementLocked,
} from '../../announcements.helpers'
import {
  AnnouncementPriorityChip,
  AnnouncementStatusChip,
} from '../../components/statusChip/announcementStatusChip.component'
import { AnnouncementTargets } from '../../components/targets/announcementTargets.component'

const MANAGER_ROLES: string[] = [ROLE.superadmin, ROLE.admin, ROLE.staff]

const cardSx = {
  bgcolor: '#fff',
  border: `1px solid ${colors.grey[200]}`,
  borderRadius: 2.5,
  p: 2.5,
}

const getCategoryLabel = (category: Announcement.Category) =>
  ANNOUNCEMENT_CATEGORY_OPTIONS.find((option) => option.value === category)
    ?.label ?? category

/** One `label / value` row of the metadata card. */
function MetaRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Stack
      direction="row"
      alignItems="flex-start"
      justifyContent="space-between"
      spacing={2}
    >
      <Typography fontSize={12} color={colors.grey[500]} flexShrink={0}>
        {label}
      </Typography>
      <Box sx={{ textAlign: 'right', minWidth: 0 }}>{value}</Box>
    </Stack>
  )
}

export function AnnouncementDetailPage() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { announcementId } = useParams()
  const noticeId = Number(announcementId)

  const { data: auth } = useSelector((store) => store.auth.user)
  const { data: detail, loading } = useSelector(
    (store) => store.announcements.announcementDetail
  )
  const { data: analytics } = useSelector(
    (store) => store.announcements.analytics
  )
  const { loading: statusLoading } = useSelector(
    (store) => store.announcements.statusMutation
  )
  const { loading: deleting } = useSelector(
    (store) => store.announcements.deleteAnnouncement
  )
  const { loading: receiptLoading } = useSelector(
    (store) => store.announcements.receiptMutation
  )

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [readRequested, setReadRequested] = useState(false)

  const userRoles = auth?.userRoles ?? []
  const isManager = useMemo(
    () => userRoles.some((role) => MANAGER_ROLES.includes(role)),
    [userRoles]
  )

  // managers go back to the board, readers back to their notice board
  const backPath = isManager
    ? ANNOUNCEMENT_BASE_PATH
    : `${ANNOUNCEMENT_BASE_PATH}/feed`

  useEffect(() => {
    if (!noticeId) {
      return
    }
    dispatch(getAnnouncementDetailAction(noticeId))
    if (isManager) {
      dispatch(getAnnouncementAnalyticsAction(noticeId))
    }

    return () => {
      dispatch(resetAnnouncementDetail())
    }
  }, [dispatch, isManager, noticeId])

  const notice = detail?.announcement_details ?? null

  /** Marks the notice as read once, when a recipient opens it. */
  useEffect(() => {
    if (!detail || !notice || readRequested) {
      return
    }
    const isCreator = notice.created_by_user_id === auth?.user?.id
    if (detail.is_read || isCreator) {
      return
    }
    setReadRequested(true)
    dispatch(markAnnouncementReadAction(notice.id))
  }, [auth?.user?.id, detail, dispatch, notice, readRequested])

  const isLocked = isAnnouncementLocked(notice?.status)
  const transitions = notice ? getAllowedTransitions(notice.status) : []
  const needsAcknowledgement = Boolean(
    notice?.require_acknowledgement && detail && !detail.acknowledged_at
  )

  const handleStatusChange = (status: Announcement.Status) => {
    if (!notice) {
      return
    }
    dispatch(
      updateAnnouncementStatusAction({
        announcementId: notice.id,
        body: { status },
        onSuccess: () => dispatch(getAnnouncementDetailAction(notice.id)),
      })
    )
  }

  const handleDelete = () => {
    if (!notice) {
      return
    }
    dispatch(
      deleteAnnouncementAction({
        announcementId: notice.id,
        onSuccess: () => navigate(ANNOUNCEMENT_BASE_PATH),
      })
    )
  }

  if (loading && !notice) {
    return (
      <Box>
        <Skeleton height={34} width={280} />
        <Skeleton height={120} sx={{ borderRadius: 2, mt: 2 }} />
        <Skeleton height={280} sx={{ borderRadius: 2, mt: 2 }} />
      </Box>
    )
  }

  if (!notice) {
    return (
      <Box
        sx={{
          borderRadius: 3,
          border: `1px dashed ${colors.grey[300]}`,
          bgcolor: '#fff',
          py: 8,
          textAlign: 'center',
        }}
      >
        <Typography fontSize={15} fontWeight={600} color={colors.grey[800]}>
          This announcement is no longer available
        </Typography>
        <Typography fontSize={12.5} color={colors.grey[500]} mt={0.5}>
          It may have been deleted, or you no longer have access to it.
        </Typography>
        <ButtonComp
          sx={{ mt: 2 }}
          size="small"
          onClick={() => navigate(backPath)}
        >
          Back to announcements
        </ButtonComp>
      </Box>
    )
  }

  const totalRecipients = Number(
    analytics?.recipient_count ?? detail?.read_count ?? 0
  )
  const readCount = Number(analytics?.read_count ?? detail?.read_count ?? 0)
  const acknowledgementCount = Number(
    analytics?.acknowledgement_count ?? detail?.acknowledgement_count ?? 0
  )

  return (
    <Box>
      <Stack
        direction="row"
        alignItems="center"
        spacing={1}
        mb={2}
        flexWrap="wrap"
        gap={1}
      >
        <ButtonComp
          variant="outlined"
          color="inherit"
          size="small"
          startIcon={<ArrowLeft size={15} />}
          onClick={() => navigate(backPath)}
        >
          Back
        </ButtonComp>

        <Box sx={{ flex: 1 }} />

        {isManager ? (
          <ButtonComp
            variant="outlined"
            size="small"
            startIcon={<BarChart3 size={15} />}
            onClick={() =>
              navigate(`${ANNOUNCEMENT_BASE_PATH}/${notice.id}/recipients`)
            }
          >
            Recipients
          </ButtonComp>
        ) : null}

        {isManager && !isLocked ? (
          <ButtonComp
            variant="outlined"
            size="small"
            startIcon={<Pencil size={15} />}
            onClick={() =>
              navigate(`${ANNOUNCEMENT_BASE_PATH}/${notice.id}/edit`)
            }
          >
            Edit
          </ButtonComp>
        ) : null}

        {isManager && transitions.length > 0 ? (
          <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
            {transitions.map((status) => (
              <ButtonComp
                key={status}
                size="small"
                variant={status === 'published' ? 'contained' : 'outlined'}
                loading={statusLoading}
                startIcon={<Megaphone size={15} />}
                onClick={() => handleStatusChange(status)}
              >
                {ANNOUNCEMENT_STATUS_META[status].label}
              </ButtonComp>
            ))}
          </Stack>
        ) : null}

        {isManager ? (
          <Tooltip title="Delete announcement">
            <ButtonComp
              variant="outlined"
              color="error"
              size="small"
              startIcon={<Trash2 size={15} />}
              onClick={() => setDeleteOpen(true)}
            >
              Delete
            </ButtonComp>
          </Tooltip>
        ) : null}
      </Stack>

      <Box sx={{ ...cardSx, mb: 2 }}>
        <Stack direction="row" alignItems="flex-start" spacing={1.5}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" alignItems="center" spacing={0.75}>
              {notice.is_pinned ? (
                <Pin size={15} color={colors.orange[600]} />
              ) : null}
              <Typography
                variant="h6"
                fontWeight={700}
                color={colors.grey[900]}
              >
                {notice.title}
              </Typography>
            </Stack>

            {notice.summary ? (
              <Typography fontSize={13} color={colors.grey[600]} mt={0.75}>
                {notice.summary}
              </Typography>
            ) : null}

            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              mt={1.5}
              flexWrap="wrap"
              gap={1}
            >
              <AnnouncementStatusChip status={notice.status} size="small" />
              <AnnouncementPriorityChip priority={notice.priority} />
              <Typography fontSize={11.5} color={colors.grey[500]}>
                {getCategoryLabel(notice.category)}
              </Typography>
              <Typography fontSize={11.5} color={colors.grey[500]}>
                {'· '}
                {ANNOUNCEMENT_AUDIENCE_TYPE_META[notice.audience_type]?.label}
              </Typography>
              <Typography fontSize={11.5} color={colors.grey[500]}>
                {'· '}By {getPersonName(detail?.creator_details)}
              </Typography>
            </Stack>
          </Box>
        </Stack>
      </Box>

      {notice.status === 'draft' ? (
        <Box
          sx={{
            mb: 2,
            borderRadius: 2.5,
            border: `1px solid ${colors.amber[300]}`,
            bgcolor: colors.amber[50],
            px: 2,
            py: 1.25,
          }}
        >
          <Typography fontSize={12.5} color={colors.amber[800]}>
            This notice is still a draft — recipients cannot see it until it is
            published.
          </Typography>
        </Box>
      ) : null}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) 320px' },
          gap: 2,
          alignItems: 'start',
        }}
      >
        <Stack spacing={2}>
          {needsAcknowledgement ? (
            <Box
              sx={{
                borderRadius: 2.5,
                border: `1px solid ${colors.amber[300]}`,
                bgcolor: colors.amber[50],
                p: 1.75,
              }}
            >
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1.5}
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                justifyContent="space-between"
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <CheckCheck size={16} color={colors.amber[800]} />
                  <Typography fontSize={12.5} color={colors.amber[900]}>
                    This notice requires your acknowledgement.
                  </Typography>
                </Stack>
                <ButtonComp
                  size="small"
                  loading={receiptLoading}
                  startIcon={<CheckCheck size={14} />}
                  onClick={() =>
                    dispatch(acknowledgeAnnouncementAction(notice.id))
                  }
                >
                  Acknowledge
                </ButtonComp>
              </Stack>
            </Box>
          ) : null}

          <Box sx={cardSx}>
            <Typography
              fontSize={11.5}
              fontWeight={700}
              letterSpacing={0.5}
              textTransform="uppercase"
              color={colors.grey[500]}
            >
              Notice
            </Typography>
            <Divider sx={{ my: 1.5 }} />
            <Box
              sx={{
                fontSize: 13.5,
                lineHeight: 1.75,
                color: colors.grey[800],
                '& p': { mt: 0, mb: 1.25 },
                '& ul, & ol': { pl: 2.5, mb: 1.25 },
                '& li': { mb: 0.5 },
                '& h1, & h2, & h3, & h4': {
                  fontSize: 16,
                  fontWeight: 700,
                  color: colors.grey[900],
                  mt: 2,
                  mb: 1,
                },
                '& a': { color: colors.blue[600] },
                '& img': { maxWidth: '100%', borderRadius: 1.5 },
                '& table': { width: '100%', borderCollapse: 'collapse' },
                '& td, & th': {
                  border: `1px solid ${colors.grey[300]}`,
                  p: 1,
                },
              }}
              dangerouslySetInnerHTML={{ __html: notice.content }}
            />

            {notice.external_url ? (
              <Stack direction="row" spacing={0.5} alignItems="center" mt={1.5}>
                <ExternalLink size={14} color={colors.blue[600]} />
                <Typography
                  component="a"
                  href={notice.external_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  fontSize={12.5}
                  fontWeight={600}
                  color={colors.blue[600]}
                  sx={{
                    textDecoration: 'none',
                    '&:hover': { textDecoration: 'underline' },
                  }}
                >
                  Open linked resource
                </Typography>
              </Stack>
            ) : null}
          </Box>
        </Stack>

        <Stack spacing={2}>
          {isManager ? (
            <Box sx={cardSx}>
              <Stack
                direction="row"
                alignItems="center"
                spacing={0.75}
                mb={1.5}
              >
                <BarChart3 size={15} color={colors.grey[600]} />
                <Typography
                  fontSize={12.5}
                  fontWeight={700}
                  color={colors.grey[800]}
                >
                  Reach
                </Typography>
              </Stack>

              <Stack spacing={1.5}>
                <Box>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    mb={0.5}
                  >
                    <Typography fontSize={11.5} color={colors.grey[600]}>
                      Read
                    </Typography>
                    <Typography
                      fontSize={11.5}
                      fontWeight={700}
                      color={colors.grey[800]}
                    >
                      {readCount}/{totalRecipients}
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={Number(analytics?.read_percentage ?? 0)}
                    sx={{ height: 6, borderRadius: 3 }}
                  />
                </Box>

                {notice.require_acknowledgement ? (
                  <Box>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      mb={0.5}
                    >
                      <Typography fontSize={11.5} color={colors.grey[600]}>
                        Acknowledged
                      </Typography>
                      <Typography
                        fontSize={11.5}
                        fontWeight={700}
                        color={colors.grey[800]}
                      >
                        {acknowledgementCount}/{totalRecipients}
                      </Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={Number(analytics?.acknowledgement_percentage ?? 0)}
                      color="success"
                      sx={{ height: 6, borderRadius: 3 }}
                    />
                  </Box>
                ) : null}

                <ButtonComp
                  variant="text"
                  size="small"
                  startIcon={<Users size={14} />}
                  onClick={() =>
                    navigate(
                      `${ANNOUNCEMENT_BASE_PATH}/${notice.id}/recipients`
                    )
                  }
                >
                  View recipients
                </ButtonComp>
              </Stack>
            </Box>
          ) : null}

          <Box sx={cardSx}>
            <Typography
              fontSize={11.5}
              fontWeight={700}
              letterSpacing={0.5}
              textTransform="uppercase"
              color={colors.grey[500]}
            >
              Audience
            </Typography>
            <Divider sx={{ my: 1.5 }} />
            <AnnouncementTargets
              targets={detail?.targets_details ?? []}
              audienceType={notice.audience_type}
              max={4}
            />
          </Box>

          <Box sx={cardSx}>
            <Typography
              fontSize={11.5}
              fontWeight={700}
              letterSpacing={0.5}
              textTransform="uppercase"
              color={colors.grey[500]}
            >
              Schedule
            </Typography>
            <Divider sx={{ my: 1.5 }} />
            <Stack spacing={1.25}>
              <MetaRow
                label="Publish at"
                value={
                  <Typography fontSize={12.5} color={colors.grey[800]}>
                    {formatAnnouncementDateTime(
                      notice.publish_at ?? notice.published_at
                    )}
                  </Typography>
                }
              />
              <MetaRow
                label="Expires at"
                value={
                  <Stack
                    direction="row"
                    spacing={0.5}
                    alignItems="center"
                    justifyContent="flex-end"
                  >
                    <CalendarClock size={13} color={colors.grey[500]} />
                    <Typography fontSize={12.5} color={colors.grey[800]}>
                      {formatAnnouncementDate(notice.expires_at)}
                    </Typography>
                  </Stack>
                }
              />
              <MetaRow
                label="Published by"
                value={
                  <Typography fontSize={12.5} color={colors.grey[800]}>
                    {getPersonName(detail?.publisher_details)}
                  </Typography>
                }
              />
              <MetaRow
                label="Created"
                value={
                  <Typography fontSize={12.5} color={colors.grey[800]}>
                    {formatAnnouncementDate(notice.created_at)}
                  </Typography>
                }
              />
              <MetaRow
                label="Acknowledgement"
                value={
                  <Stack
                    direction="row"
                    spacing={0.5}
                    alignItems="center"
                    justifyContent="flex-end"
                  >
                    <Eye size={13} color={colors.grey[500]} />
                    <Typography fontSize={12.5} color={colors.grey[800]}>
                      {notice.require_acknowledgement
                        ? 'Required'
                        : 'Not required'}
                    </Typography>
                  </Stack>
                }
              />
            </Stack>
          </Box>
        </Stack>
      </Box>

      <DeleteConfirmationModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirmationClick={handleDelete}
        confirmLoader={deleting}
        confirmText="Delete"
      >
        <Typography fontSize={13} color={colors.grey[700]}>
          Deleting <strong>{notice.title}</strong> removes the notice and all of
          its delivery records. This cannot be undone.
        </Typography>
      </DeleteConfirmationModal>
    </Box>
  )
}
