import {
  Box,
  Checkbox,
  Chip,
  Divider,
  FormControlLabel,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowLeft,
  ArrowUpRight,
  Lock,
  MessageSquare,
  Paperclip,
  Send,
  UserPlus,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { ButtonComp } from '@src/components/button/button.component'
import { InputField } from '@src/components/input/input.component'
import { SelectField } from '@src/components/select/select.component'
import SpringModal from '@src/components/modal/modal.component'
import { STATIC_URL } from '@src/helpers/api.helpers'
import { colors } from '@src/helpers/colors.helpers'
import { useComplaintPermissions } from '@src/hooks/useComplaintPermissions.hooks'
import { useDispatch, useSelector } from '@src/store/hooks.store'
import {
  addComplaintCommentAction,
  assignComplaintAction,
  changeComplaintStatusAction,
  getComplaintAssigneesAction,
  getComplaintDetailAction,
} from '@src/store/redux/dashboard/complaints/complaints.slice'
import {
  COMPLAINT_BASE_PATH,
  COMPLAINT_RESOLUTION_TYPE_OPTIONS,
  COMPLAINT_STATUS_META,
  formatComplaintDateTime,
  formatComplaintDate,
  fromNow,
  getAllowedComplaintTransitions,
  isComplaintLocked,
} from '../../complaints.helpers'
import {
  ComplaintConfidentialTag,
  ComplaintPriorityChip,
  ComplaintSeverityChip,
  ComplaintSlaBadge,
  ComplaintStatusChip,
} from '../../components/statusChip/complaintStatusChip.component'

const controlStyles = {
  control: (base: Record<string, unknown>) => ({
    ...base,
    minHeight: 36,
    fontSize: 13,
  }),
}

/** Only admins may pick these outcomes; the API re-checks them anyway. */
const RESOLVE_ONLY: Complaint.Status[] = [
  'resolved',
  'closed',
  'rejected',
  'reopened',
  'escalated',
]

export function ComplaintDetailPage() {
  const { complaintId } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { can } = useComplaintPermissions()

  const { data: detail, loading } = useSelector(
    (store) => store.complaints.complaintDetail
  )
  const assignees = useSelector(
    (store) => store.complaints.assignees.data ?? []
  )
  const { loading: commenting } = useSelector(
    (store) => store.complaints.commentMutation
  )
  const { loading: assigning } = useSelector(
    (store) => store.complaints.assignMutation
  )
  const { loading: statusLoading } = useSelector(
    (store) => store.complaints.statusMutation
  )

  const [commentBody, setCommentBody] = useState('')
  const [visibility, setVisibility] = useState<Complaint.Visibility>('internal')

  const [statusOpen, setStatusOpen] = useState(false)
  const [nextStatus, setNextStatus] = useState<Complaint.Status>('in_progress')
  const [reason, setReason] = useState('')
  const [resolutionType, setResolutionType] =
    useState<Complaint.ResolutionType>('resolved_by_school')
  const [resolutionSummary, setResolutionSummary] = useState('')

  const [assignOpen, setAssignOpen] = useState(false)
  const [assigneeId, setAssigneeId] = useState<number | ''>('')
  const [acknowledge, setAcknowledge] = useState(true)

  const id = Number(complaintId)

  useEffect(() => {
    if (!id) {
      return
    }

    dispatch(getComplaintDetailAction(id))
    dispatch(getComplaintAssigneesAction())
  }, [dispatch, id])

  const complaint = detail?.complaint_details

  const statusOptions = useMemo(() => {
    if (!complaint) {
      return []
    }

    return getAllowedComplaintTransitions(complaint.status)
      .filter((status) =>
        can('complaint.desk.resolve') ? true : !RESOLVE_ONLY.includes(status)
      )
      .map((status) => ({
        label: COMPLAINT_STATUS_META[status].label,
        value: status,
      }))
  }, [complaint, can])

  const refresh = () => {
    dispatch(getComplaintDetailAction(id))
  }

  const submitComment = () => {
    if (!commentBody.trim()) {
      return
    }

    dispatch(
      addComplaintCommentAction({
        complaintId: id,
        payload: {
          body: commentBody.trim(),
          comment_type: visibility === 'shared' ? 'reply' : 'note',
          visibility,
        },
        onSuccess: () => {
          setCommentBody('')
          refresh()
        },
      })
    )
  }

  const submitStatus = () => {
    if (nextStatus === 'resolved' && !resolutionSummary.trim()) {
      toast.error('A resolution summary is required.')
      return
    }

    if (
      ['reopened', 'rejected', 'withdrawn', 'escalated'].includes(nextStatus) &&
      !reason.trim()
    ) {
      toast.error('A reason is required for this transition.')
      return
    }

    dispatch(
      changeComplaintStatusAction({
        complaintId: id,
        payload: {
          status: nextStatus,
          reason: reason.trim() || undefined,
          resolution_type:
            nextStatus === 'resolved' ? resolutionType : undefined,
          resolution_summary:
            nextStatus === 'resolved' ? resolutionSummary.trim() : undefined,
        },
        onSuccess: () => {
          setStatusOpen(false)
          setReason('')
          setResolutionSummary('')
          refresh()
        },
      })
    )
  }

  const submitAssign = () => {
    if (!assigneeId) {
      toast.error('Choose a staff member.')
      return
    }

    dispatch(
      assignComplaintAction({
        complaintId: id,
        payload: {
          assigned_to_user_id: Number(assigneeId),
          acknowledge,
        },
        onSuccess: () => {
          setAssignOpen(false)
          refresh()
        },
      })
    )
  }

  if (loading && !detail) {
    return (
      <Box p={3}>
        <Skeleton height={40} />
        <Skeleton height={200} />
      </Box>
    )
  }

  if (!complaint) {
    return (
      <Stack p={3} spacing={2} alignItems="flex-start">
        <Typography fontSize={16} fontWeight={600} color={colors.grey[800]}>
          Complaint not found or restricted
        </Typography>
        <Typography fontSize={13} color={colors.grey[600]}>
          It may belong to another school, or it is confidential and assigned to
          somebody else.
        </Typography>
        <ButtonComp
          size="small"
          variant="outlined"
          startIcon={<ArrowLeft size={15} />}
          onClick={() => navigate(COMPLAINT_BASE_PATH)}
        >
          Back to the desk
        </ButtonComp>
      </Stack>
    )
  }

  const locked = isComplaintLocked(complaint.status)

  return (
    <Stack spacing={2} p={{ xs: 2, md: 3 }}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', md: 'center' }}
        spacing={1.5}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <ButtonComp
            size="small"
            variant="text"
            startIcon={<ArrowLeft size={15} />}
            onClick={() => navigate(COMPLAINT_BASE_PATH)}
          >
            Desk
          </ButtonComp>
          <Typography fontSize={12} fontWeight={700} color={colors.grey[500]}>
            {complaint.complaint_no}
          </Typography>
        </Stack>

        <Stack direction="row" spacing={1} flexWrap="wrap">
          {!locked && can('complaint.desk.assign') ? (
            <ButtonComp
              size="small"
              variant="outlined"
              startIcon={<UserPlus size={15} />}
              onClick={() => {
                setAssigneeId(complaint.assigned_to_user_id ?? '')
                setAssignOpen(true)
              }}
            >
              Assign
            </ButtonComp>
          ) : null}
          {statusOptions.length > 0 ? (
            <ButtonComp
              size="small"
              variant="contained"
              startIcon={<ArrowUpRight size={15} />}
              onClick={() => {
                setNextStatus(statusOptions[0].value)
                setStatusOpen(true)
              }}
            >
              Change status
            </ButtonComp>
          ) : null}
        </Stack>
      </Stack>

      <Box
        sx={{
          borderRadius: 3,
          border: `1px solid ${colors.grey[200]}`,
          bgcolor: '#fff',
          p: 2.5,
        }}
      >
        <Stack spacing={1.25}>
          <Stack
            direction="row"
            spacing={0.75}
            flexWrap="wrap"
            alignItems="center"
          >
            <ComplaintStatusChip status={complaint.status} />
            <ComplaintPriorityChip priority={complaint.priority} />
            <ComplaintSeverityChip severity={complaint.severity} />
            <ComplaintSlaBadge row={complaint} />
            {complaint.is_confidential ? <ComplaintConfidentialTag /> : null}
            {complaint.escalation_level > 0 ? (
              <Chip
                size="small"
                label={`Escalation L${complaint.escalation_level}`}
                sx={{
                  height: 22,
                  fontSize: 11.5,
                  fontWeight: 600,
                  bgcolor: colors.red[50],
                  color: colors.red[700],
                  border: `1px solid ${colors.red[200]}`,
                }}
              />
            ) : null}
            {complaint.reopen_count > 0 ? (
              <Chip
                size="small"
                label={`Reopened ×${complaint.reopen_count}`}
                sx={{ height: 22, fontSize: 11.5, fontWeight: 600 }}
              />
            ) : null}
          </Stack>

          <Typography fontSize={20} fontWeight={700} color={colors.grey[900]}>
            {complaint.title}
          </Typography>

          {complaint.merged_into_complaint_id ? (
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{
                bgcolor: colors.grey[50],
                border: `1px dashed ${colors.grey[300]}`,
                borderRadius: 2,
                p: 1,
              }}
            >
              <AlertTriangle size={14} color={colors.orange[700]} />
              <Typography fontSize={12.5} color={colors.grey[700]}>
                Duplicate of{' '}
                <Box
                  component="span"
                  sx={{
                    fontWeight: 700,
                    cursor: 'pointer',
                    color: colors.blue[700],
                  }}
                  onClick={() =>
                    navigate(
                      `${COMPLAINT_BASE_PATH}/${complaint.merged_into_complaint_id}`
                    )
                  }
                >
                  {complaint.merged_into_no}
                </Box>
                {complaint.merged_into_title
                  ? ` · ${complaint.merged_into_title}`
                  : ''}
              </Typography>
            </Stack>
          ) : null}

          <Divider />

          <Typography
            fontSize={13.5}
            color={colors.grey[800]}
            sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}
          >
            {complaint.description}
          </Typography>

          {detail?.attachments?.length ? (
            <Stack spacing={0.75} pt={1}>
              <Typography
                fontSize={12}
                fontWeight={700}
                color={colors.grey[600]}
              >
                Evidence
              </Typography>
              {detail.attachments.map((attachment) => {
                const href = attachment.external_url
                  ? attachment.external_url
                  : attachment.asset_path
                  ? `${STATIC_URL}/${attachment.asset_path}`
                  : null

                return (
                  <Stack
                    key={attachment.id}
                    direction="row"
                    spacing={1}
                    alignItems="center"
                  >
                    <Paperclip size={13} color={colors.grey[500]} />
                    {href ? (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ fontSize: 12.5, color: colors.blue[700] }}
                      >
                        {attachment.label ??
                          attachment.file_type ??
                          'Attachment'}
                      </a>
                    ) : (
                      <Typography fontSize={12.5} color={colors.grey[700]}>
                        {attachment.label ?? 'Attachment'}
                      </Typography>
                    )}
                  </Stack>
                )
              })}
            </Stack>
          ) : null}
        </Stack>
      </Box>

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
        <Stack
          spacing={1.5}
          sx={{
            borderRadius: 3,
            border: `1px solid ${colors.grey[200]}`,
            bgcolor: '#fff',
            p: 2.5,
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <MessageSquare size={15} color={colors.grey[600]} />
            <Typography fontSize={13} fontWeight={700} color={colors.grey[800]}>
              Timeline
            </Typography>
            <Typography fontSize={11.5} color={colors.grey[500]}>
              {detail?.comments.length ?? 0} entries
            </Typography>
          </Stack>

          <Stack spacing={1.25}>
            {(detail?.comments ?? []).map((comment) => {
              const isSystem = [
                'status_change',
                'assignment',
                'escalation',
                'resolution',
                'system',
              ].includes(comment.comment_type)

              if (isSystem) {
                return (
                  <Stack
                    key={comment.id}
                    direction="row"
                    spacing={1}
                    alignItems="flex-start"
                    sx={{
                      bgcolor: colors.grey[50],
                      border: `1px dashed ${colors.grey[300]}`,
                      borderRadius: 2,
                      px: 1.25,
                      py: 0.75,
                    }}
                  >
                    <Typography
                      fontSize={11.5}
                      color={colors.grey[600]}
                      sx={{ whiteSpace: 'pre-wrap', flex: 1 }}
                    >
                      {comment.body}
                    </Typography>
                    <Typography fontSize={10.5} color={colors.grey[500]} noWrap>
                      {fromNow(comment.created_at)}
                    </Typography>
                  </Stack>
                )
              }

              return (
                <Box
                  key={comment.id}
                  sx={{
                    borderRadius: 2,
                    border: `1px solid ${
                      comment.visibility === 'shared'
                        ? colors.green[200]
                        : colors.grey[200]
                    }`,
                    bgcolor:
                      comment.visibility === 'shared'
                        ? colors.green[50]
                        : '#fff',
                    p: 1.25,
                  }}
                >
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    spacing={1}
                  >
                    <Typography
                      fontSize={12}
                      fontWeight={700}
                      color={colors.grey[800]}
                    >
                      {comment.author_name ?? 'System'}
                    </Typography>
                    <Stack direction="row" spacing={0.75} alignItems="center">
                      <Typography fontSize={10.5} color={colors.grey[500]}>
                        {comment.visibility === 'shared'
                          ? 'Shareable reply'
                          : 'Internal note'}
                      </Typography>
                      <Typography fontSize={10.5} color={colors.grey[500]}>
                        · {formatComplaintDateTime(comment.created_at)}
                      </Typography>
                    </Stack>
                  </Stack>
                  <Typography
                    fontSize={13}
                    color={colors.grey[800]}
                    mt={0.5}
                    sx={{ whiteSpace: 'pre-wrap' }}
                  >
                    {comment.body}
                  </Typography>
                </Box>
              )
            })}

            {!detail?.comments.length ? (
              <Typography fontSize={12.5} color={colors.grey[500]}>
                No notes yet. The first internal note stops the response clock.
              </Typography>
            ) : null}
          </Stack>

          {!locked && can('complaint.desk.comment') ? (
            <Stack spacing={1} pt={1}>
              <Divider />
              <Stack direction="row" spacing={1} alignItems="center">
                <ButtonComp
                  size="small"
                  variant={visibility === 'internal' ? 'contained' : 'text'}
                  onClick={() => setVisibility('internal')}
                >
                  Internal note
                </ButtonComp>
                <ButtonComp
                  size="small"
                  variant={visibility === 'shared' ? 'contained' : 'text'}
                  onClick={() => setVisibility('shared')}
                >
                  Shareable reply
                </ButtonComp>
              </Stack>
              <InputField
                placeholder={
                  visibility === 'internal'
                    ? 'Investigation note, visible to the office only'
                    : 'Reply that may be shared with the complainant later'
                }
                multiline
                minRows={3}
                value={commentBody}
                onChange={(event) => setCommentBody(event.target.value)}
              />
              <Stack direction="row" justifyContent="flex-end">
                <ButtonComp
                  size="small"
                  variant="contained"
                  startIcon={<Send size={14} />}
                  loading={commenting}
                  onClick={submitComment}
                >
                  Add
                </ButtonComp>
              </Stack>
            </Stack>
          ) : (
            <Typography fontSize={12} color={colors.grey[500]}>
              This complaint is {complaint.status}: reopen it to add notes.
            </Typography>
          )}
        </Stack>

        <Stack spacing={2}>
          <Box
            sx={{
              borderRadius: 3,
              border: `1px solid ${colors.grey[200]}`,
              bgcolor: '#fff',
              p: 2,
            }}
          >
            <Typography
              fontSize={12}
              fontWeight={700}
              color={colors.grey[800]}
              mb={1}
            >
              Summary
            </Typography>
            <Stack spacing={0.75}>
              {[
                ['Category', complaint.category_name ?? '—'],
                ['Channel', complaint.channel.replace('_', ' ')],
                [
                  'Complainant',
                  complaint.is_anonymous
                    ? 'Anonymous'
                    : complaint.complainant_name ?? '—',
                ],
                ['Phone', complaint.complainant_phone ?? '—'],
                ['Logged by', complaint.created_by_name ?? '—'],
                ['Logged at', formatComplaintDateTime(complaint.created_at)],
                ['Assignee', complaint.assignee_name ?? 'Unassigned'],
                ['Department', complaint.department_name ?? '—'],
              ].map(([label, value]) => (
                <Stack
                  key={label}
                  direction="row"
                  justifyContent="space-between"
                  spacing={1}
                >
                  <Typography fontSize={11.5} color={colors.grey[500]}>
                    {label}
                  </Typography>
                  <Typography
                    fontSize={11.5}
                    fontWeight={600}
                    color={colors.grey[800]}
                    textAlign="right"
                  >
                    {value}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </Box>

          <Box
            sx={{
              borderRadius: 3,
              border: `1px solid ${colors.grey[200]}`,
              bgcolor: '#fff',
              p: 2,
            }}
          >
            <Typography
              fontSize={12}
              fontWeight={700}
              color={colors.grey[800]}
              mb={1}
            >
              SLA
            </Typography>
            <Stack spacing={0.75}>
              {[
                [
                  'First response due',
                  formatComplaintDateTime(complaint.response_due_at),
                ],
                [
                  'First response',
                  formatComplaintDateTime(complaint.first_response_at),
                ],
                [
                  'Resolution due',
                  formatComplaintDateTime(complaint.resolution_due_at),
                ],
                ['Resolved at', formatComplaintDateTime(complaint.resolved_at)],
                ['Escalation', `L${complaint.escalation_level}`],
              ].map(([label, value]) => (
                <Stack
                  key={label}
                  direction="row"
                  justifyContent="space-between"
                  spacing={1}
                >
                  <Typography fontSize={11.5} color={colors.grey[500]}>
                    {label}
                  </Typography>
                  <Typography
                    fontSize={11.5}
                    fontWeight={600}
                    color={colors.grey[800]}
                  >
                    {value}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </Box>

          <Box
            sx={{
              borderRadius: 3,
              border: `1px solid ${colors.grey[200]}`,
              bgcolor: '#fff',
              p: 2,
            }}
          >
            <Typography
              fontSize={12}
              fontWeight={700}
              color={colors.grey[800]}
              mb={1}
            >
              Parties
            </Typography>
            <Stack spacing={0.75}>
              {(detail?.parties ?? []).map((party) => (
                <Stack
                  key={party.id}
                  direction="row"
                  justifyContent="space-between"
                  spacing={1}
                >
                  <Typography fontSize={11.5} color={colors.grey[800]}>
                    {party.display_name ?? '—'}
                  </Typography>
                  <Typography fontSize={11} color={colors.grey[500]}>
                    {party.party_role.replace('_', ' ')}
                  </Typography>
                </Stack>
              ))}
              {!detail?.parties.length ? (
                <Typography fontSize={11.5} color={colors.grey[500]}>
                  No parties recorded.
                </Typography>
              ) : null}
            </Stack>
          </Box>

          <Box
            sx={{
              borderRadius: 3,
              border: `1px solid ${colors.grey[200]}`,
              bgcolor: '#fff',
              p: 2,
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center" mb={1}>
              <Lock size={12} color={colors.grey[500]} />
              <Typography
                fontSize={12}
                fontWeight={700}
                color={colors.grey[800]}
              >
                Audit trail
              </Typography>
            </Stack>
            <Stack spacing={0.6}>
              {(detail?.activity ?? []).slice(0, 12).map((entry) => (
                <Stack
                  key={entry.id}
                  direction="row"
                  justifyContent="space-between"
                  spacing={1}
                >
                  <Typography fontSize={11} color={colors.grey[700]}>
                    {entry.action.replace(/_/g, ' ')}
                    {entry.actor_name ? ` · ${entry.actor_name}` : ' · system'}
                  </Typography>
                  <Typography fontSize={10.5} color={colors.grey[500]} noWrap>
                    {formatComplaintDate(entry.created_at)}
                  </Typography>
                </Stack>
              ))}
              {!detail?.activity.length ? (
                <Typography fontSize={11.5} color={colors.grey[500]}>
                  The trail is visible to admins only.
                </Typography>
              ) : null}
            </Stack>
          </Box>
        </Stack>
      </Box>

      <SpringModal
        open={statusOpen}
        close={() => setStatusOpen(false)}
        size="sm"
      >
        <Stack spacing={1.5} p={2.5}>
          <Typography fontSize={15} fontWeight={700} color={colors.grey[900]}>
            Change status
          </Typography>

          <SelectField
            options={statusOptions}
            value={
              statusOptions.find((option) => option.value === nextStatus) ??
              null
            }
            onChange={(option) =>
              setNextStatus(
                (option as { value: Complaint.Status } | null)?.value ??
                  'in_progress'
              )
            }
            styles={controlStyles}
          />

          {nextStatus === 'resolved' ? (
            <>
              <Typography fontSize={12.5} fontWeight={500}>
                Resolution type
              </Typography>
              <SelectField
                options={COMPLAINT_RESOLUTION_TYPE_OPTIONS}
                value={
                  COMPLAINT_RESOLUTION_TYPE_OPTIONS.find(
                    (option) => option.value === resolutionType
                  ) ?? null
                }
                onChange={(option) =>
                  setResolutionType(
                    (option as { value: Complaint.ResolutionType } | null)
                      ?.value ?? 'resolved_by_school'
                  )
                }
                styles={controlStyles}
              />
              <InputField
                labelDetail={{ text: 'Resolution summary', required: true }}
                multiline
                minRows={3}
                value={resolutionSummary}
                onChange={(event) => setResolutionSummary(event.target.value)}
              />
            </>
          ) : null}

          <InputField
            labelDetail={{
              text: ['reopened', 'rejected', 'withdrawn', 'escalated'].includes(
                nextStatus
              )
                ? 'Reason'
                : 'Note (optional)',
              required: [
                'reopened',
                'rejected',
                'withdrawn',
                'escalated',
              ].includes(nextStatus),
            }}
            multiline
            minRows={2}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
          />

          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <ButtonComp
              size="small"
              variant="text"
              onClick={() => setStatusOpen(false)}
            >
              Cancel
            </ButtonComp>
            <ButtonComp
              size="small"
              variant="contained"
              loading={statusLoading}
              onClick={submitStatus}
            >
              Confirm
            </ButtonComp>
          </Stack>
        </Stack>
      </SpringModal>

      <SpringModal
        open={assignOpen}
        close={() => setAssignOpen(false)}
        size="xs"
      >
        <Stack spacing={1.5} p={2.5}>
          <Typography fontSize={15} fontWeight={700} color={colors.grey[900]}>
            Assign complaint
          </Typography>

          <SelectField
            placeholder="Choose a staff member"
            options={assignees.map((assignee) => ({
              label: `${assignee.full_name || assignee.email} · ${
                assignee.role
              }`,
              value: assignee.id,
            }))}
            value={
              assignees
                .map((assignee) => ({
                  label: `${assignee.full_name || assignee.email} · ${
                    assignee.role
                  }`,
                  value: assignee.id,
                }))
                .find((option) => option.value === assigneeId) ?? null
            }
            onChange={(option) =>
              setAssigneeId((option as { value: number } | null)?.value ?? '')
            }
            styles={controlStyles}
          />

          <FormControlLabel
            control={
              <Checkbox
                size="small"
                checked={acknowledge}
                onChange={(event) => setAcknowledge(event.target.checked)}
              />
            }
            label={
              <Typography fontSize={12.5} color={colors.grey[700]}>
                Also acknowledge (stops the response clock)
              </Typography>
            }
          />

          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <ButtonComp
              size="small"
              variant="text"
              onClick={() => setAssignOpen(false)}
            >
              Cancel
            </ButtonComp>
            <ButtonComp
              size="small"
              variant="contained"
              loading={assigning}
              onClick={submitAssign}
            >
              Assign
            </ButtonComp>
          </Stack>
        </Stack>
      </SpringModal>
    </Stack>
  )
}
