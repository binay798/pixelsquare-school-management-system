import { Box, Chip, Divider, Stack, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { AlertTriangle, CheckCircle2, ShieldCheck } from 'lucide-react'
import SpringModal from '@src/components/modal/modal.component'
import { ButtonComp } from '@src/components/button/button.component'
import { TextareaField } from '@src/components/input/input.component'
import { colors } from '@src/helpers/colors.helpers'

interface Props {
  open: boolean
  onClose: () => void
  decision: 'approved' | 'rejected'
  planTitle?: string
  loading?: boolean
  onSubmit: (comment?: string) => void
}

export function ReviewDecisionModal({
  open,
  onClose,
  decision,
  planTitle,
  loading = false,
  onSubmit,
}: Props) {
  const [comment, setComment] = useState('')
  const isApprove = decision === 'approved'

  useEffect(() => {
    if (open) {
      setComment('')
    }
  }, [open])

  return (
    <SpringModal open={open} close={onClose} size="xs">
      <Box sx={{ width: '100%' }}>
        <Stack alignItems="center" spacing={1} mb={2}>
          <Box
            sx={{
              width: 46,
              height: 46,
              borderRadius: '50%',
              display: 'grid',
              placeItems: 'center',
              bgcolor: isApprove ? colors.green[50] : colors.red[50],
              color: isApprove ? colors.green[600] : colors.red[600],
            }}
          >
            {isApprove ? (
              <CheckCircle2 size={22} />
            ) : (
              <AlertTriangle size={22} />
            )}
          </Box>
          <Typography fontSize={17} fontWeight={700} color={colors.grey[900]}>
            {isApprove ? 'Approve this lesson plan?' : 'Send back for changes?'}
          </Typography>
          <Typography fontSize={13} color={colors.grey[600]} textAlign="center">
            {isApprove
              ? 'The plan will be published to the students of this section.'
              : 'The teacher will be notified to update the plan and resubmit.'}
          </Typography>
          {planTitle ? (
            <Chip
              size="small"
              label={planTitle}
              sx={{
                maxWidth: 340,
                bgcolor: colors.grey[100],
                fontWeight: 600,
                fontSize: 12,
              }}
            />
          ) : null}
        </Stack>

        <Divider sx={{ mb: 2 }} />

        <TextareaField
          variant="outlined"
          labelDetail={{
            text: isApprove ? 'Review note (optional)' : 'Reason for rejection',
            required: !isApprove,
          }}
          placeholder={
            isApprove
              ? 'Looks good. Keep the group activity as planned.'
              : 'Please add the assessment strategy and align the objectives.'
          }
          multiline
          minRows={3}
          value={comment}
          onChange={(event) => setComment(event.target.value)}
        />

        <Stack
          direction="row"
          spacing={1}
          mt={3}
          justifyContent="flex-end"
          alignItems="center"
        >
          {!isApprove && !comment.trim() ? (
            <Stack
              direction="row"
              spacing={0.5}
              alignItems="center"
              sx={{ color: colors.grey[500], mr: 'auto' }}
            >
              <ShieldCheck size={14} />
              <Typography fontSize={11}>
                A comment helps the teacher fix the plan.
              </Typography>
            </Stack>
          ) : null}
          <ButtonComp variant="outlined" size="medium" onClick={onClose}>
            Cancel
          </ButtonComp>
          <ButtonComp
            size="medium"
            color={isApprove ? 'success' : 'error'}
            loading={loading}
            disabled={!isApprove && !comment.trim()}
            onClick={() => onSubmit(comment.trim() || undefined)}
          >
            {isApprove ? 'Approve plan' : 'Reject plan'}
          </ButtonComp>
        </Stack>
      </Box>
    </SpringModal>
  )
}
