import { Box, Card, Chip, Skeleton, Stack, Typography } from '@mui/material'
import { TooltipIconBtn } from '@src/components/button/button.component'
import { DeleteConfirmationModal } from '@src/components/confirmationModal/deleteConfirmationModal.component'
import { colors } from '@src/helpers/colors.helpers'
import { isEmpty } from 'lodash'
import moment from 'moment'
import { useState } from 'react'
import { CiEdit } from 'react-icons/ci'
import { GoClock } from 'react-icons/go'
import { IoWarningOutline } from 'react-icons/io5'
import { MdOutlineDeleteOutline } from 'react-icons/md'

interface Props {
  topics?: Academics.ITopic[]
  loading?: boolean
  onEdit?: (topic: Academics.ITopic) => void
  /**
   * `onSuccess` must be called by the parent once the delete request resolves —
   * it closes the confirmation modal, which stays open (loading) until then.
   */
  onDelete?: (topic: Academics.ITopic, onSuccess?: () => void) => void
  deleteLoading?: boolean
}

interface TopicCardProps {
  topic: Academics.ITopic
  index: number
  onEdit?: (topic: Academics.ITopic) => void
  onDelete: (topic: Academics.ITopic) => void
}
function TopicCard({ topic, index, onEdit, onDelete }: TopicCardProps) {
  return (
    <Card
      variant="outlined"
      sx={{
        p: 1,
        borderRadius: 1,
        borderColor: colors.grey[300],
        bgcolor: colors.grey[50],
        transition: 'border-color 0.2s',
        '&:hover': { borderColor: colors.blue[300] },
      }}
    >
      <Stack direction="row" spacing={1} alignItems="flex-start">
        {/* SEQUENCE ORDER */}
        <Stack
          width={32}
          minWidth={32}
          height={32}
          bgcolor={colors.blue[100]}
          borderRadius={1}
          alignItems="center"
          justifyContent="center"
        >
          <Typography color="primary" fontWeight={700} variant="body2">
            {String(topic.sequence_order ?? index + 1).padStart(2, '0')}
          </Typography>
        </Stack>
        {/* TOPIC DETAILS */}
        <Stack direction="column" flex={1} minWidth={0}>
          <Typography fontWeight={600}>{topic.name}</Typography>
          <Typography
            variant="caption"
            color={colors.grey[700]}
            sx={{ wordBreak: 'break-word' }}
          >
            {topic.description || 'No description'}
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center" mt={0.5}>
            <Chip
              size="small"
              variant="outlined"
              color="primary"
              icon={<GoClock size={14} />}
              label={`${topic.estimated_periods ?? 0} periods`}
              sx={{ fontWeight: 500 }}
            />
            <Typography variant="caption" color={colors.grey[600]}>
              {topic.updated_at
                ? `Updated ${moment(topic.updated_at).format('DD MMM YYYY')}`
                : '-'}
            </Typography>
          </Stack>
        </Stack>
        {/* ACTIONS */}
        <Stack direction="row" alignItems="center">
          <TooltipIconBtn
            tooltipTitle="Edit topic"
            size="small"
            onClick={() => onEdit?.(topic)}
          >
            <CiEdit size={18} color={colors.blue[600]} />
          </TooltipIconBtn>
          <TooltipIconBtn
            tooltipTitle="Delete topic"
            size="small"
            onClick={() => onDelete(topic)}
          >
            <MdOutlineDeleteOutline size={18} color={colors.red[500]} />
          </TooltipIconBtn>
        </Stack>
      </Stack>
    </Card>
  )
}

export function ListTopics(props: Props) {
  const [topicToDelete, setTopicToDelete] = useState<Academics.ITopic | null>(
    null
  )
  const topics = props.topics

  const closeDeleteModal = () => {
    setTopicToDelete(null)
  }

  const confirmDelete = () => {
    if (isEmpty(topicToDelete) || !topicToDelete) return

    props.onDelete?.(topicToDelete, closeDeleteModal)
  }

  // LOADING STATE
  if (props.loading) {
    return (
      <Stack
        direction="column"
        spacing={1}
        mt={1}
        sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}
      >
        {[1, 2, 3].map((el) => (
          <Skeleton key={el} variant="rounded" height={72} />
        ))}
      </Stack>
    )
  }

  return (
    /* the list container itself is the only scroll region: it takes the space
       left in the card (topics header pinned) and its content is never clipped */
    <Box mt={1} sx={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
      {/* TOPIC CARD LIST */}
      {isEmpty(topics) ? (
        <Box textAlign="center" py={2}>
          <Typography variant="caption" color="textDisabled">
            No topics added yet
          </Typography>
        </Box>
      ) : (
        <Stack direction="column" spacing={1}>
          {topics?.map((topic, index) => (
            <TopicCard
              key={topic.id}
              topic={topic}
              index={index}
              onEdit={props.onEdit}
              onDelete={setTopicToDelete}
            />
          ))}
        </Stack>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      <DeleteConfirmationModal
        open={!isEmpty(topicToDelete)}
        onClose={closeDeleteModal}
        onConfirmationClick={confirmDelete}
        confirmText="Delete"
        confirmLoader={props.deleteLoading}
      >
        <Card
          sx={{
            p: 2,
            background: '#fefcea',
            border: `0.5px solid ${colors.grey[300]}`,
            borderRadius: 2,
          }}
        >
          <Stack
            direction={'row'}
            spacing={1}
            alignItems={'center'}
            justifyContent={'center'}
            mb={1}
          >
            <IoWarningOutline color={colors.red[400]} size={22} />
            <Typography fontWeight={600} color="error">
              Warning
            </Typography>
          </Stack>
          <Typography
            color="error"
            fontWeight={600}
            textAlign={'center'}
            mb={0.5}
          >
            {topicToDelete?.name}
          </Typography>
          <Typography color="error" fontWeight={500}>
            This action is permanent and cannot be undone. Once deleted, the
            data will be lost and cannot be recovered
          </Typography>
        </Card>
      </DeleteConfirmationModal>
    </Box>
  )
}
