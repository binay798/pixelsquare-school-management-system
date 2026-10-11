import { Box, Card, Stack, Typography } from '@mui/material'
import { ButtonComp } from '@src/components/button/button.component'
import {
  LOCAL_STORAGE,
  LOCAL_STORAGE_STATE,
} from '@src/constants/global.constants'
import { colors } from '@src/helpers/colors.helpers'
import { useDispatch, useSelector } from '@src/store/hooks.store'
import {
  deleteTopicAction,
  getTopicListAction,
} from '@src/store/redux/dashboard/academics/topics/topics.slice'
import { isEmpty } from 'lodash'
import { useCallback, useEffect, useState } from 'react'
import { FaListCheck } from 'react-icons/fa6'
import { IoAddOutline } from 'react-icons/io5'
import { useParams } from 'react-router-dom'
import { AddTopicModal } from './components/addTopicModal/addTopicModal.component'
import { ListTopics } from './components/listTopics/listTopics.component'

interface Props {
  chapterId?: number
  chapterName?: string
}
export function TopicComponent({ chapterId, chapterName }: Props) {
  const { subjectId } = useParams()
  const [classId, setClassId] = useState<number | null>(null)
  const [openAddTopicModal, setOpenAddTopicModal] = useState(false)
  const [topicToEdit, setTopicToEdit] = useState<Academics.ITopic | null>(null)
  const dispatch = useDispatch()
  const { data: topicList, loading: topicListLoading } = useSelector(
    (store) => store.topics.topicList
  )
  const { loading: deleteTopicLoading } = useSelector(
    (store) => store.topics.deleteTopic
  )

  useEffect(() => {
    const classIdVal = LOCAL_STORAGE.getItem(LOCAL_STORAGE_STATE.classId)
    if (!isEmpty(classIdVal)) {
      setClassId(Number(classIdVal))
    }
  }, [])

  const fetchTopicList = useCallback(() => {
    if (!classId || !subjectId || !chapterId) return

    dispatch(
      getTopicListAction({
        classId,
        subjectId: Number(subjectId),
        chapterId,
      })
    )
  }, [dispatch, classId, subjectId, chapterId])

  useEffect(() => {
    fetchTopicList()
  }, [fetchTopicList])

  const remappedTopicList = useCallback(
    () => topicList?.map((el) => el.topic_details),
    [topicList]
  )

  /**
   * `onSuccess` is handed over by `ListTopics`: its confirmation modal stays open
   * (confirm button loading) until the request resolves, so it closes the modal
   * itself and the list is re-fetched to drop the deleted topic.
   */
  const deleteTopic = (topic: Academics.ITopic, onSuccess?: () => void) => {
    if (!classId || !subjectId || !chapterId) return

    dispatch(
      deleteTopicAction({
        classId,
        subjectId: Number(subjectId),
        chapterId,
        topicId: topic.id,
        onSuccess: () => {
          onSuccess?.()
          fetchTopicList()
        },
      })
    )
  }

  const openCreateTopicModal = () => {
    setTopicToEdit(null)
    setOpenAddTopicModal(true)
  }

  const openEditTopicModal = (topic: Academics.ITopic) => {
    setTopicToEdit(topic)
    setOpenAddTopicModal(true)
  }

  const closeTopicModal = () => {
    setOpenAddTopicModal(false)
    setTopicToEdit(null)
  }

  return (
    <Box
      mt={2}
      sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}
    >
      <Card
        sx={{
          p: 1,
          borderRadius: 1,
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ flexShrink: 0 }}
        >
          <Stack direction="row" spacing={0.5} alignItems="center">
            <FaListCheck size={18} color={colors.grey[800]} />
            <Typography
              variant="caption"
              color={colors.grey[800]}
              fontWeight={500}
            >
              TOPICS
            </Typography>
          </Stack>
          {/* ADD TOPIC BUTTON */}
          <ButtonComp
            size="small"
            startIcon={<IoAddOutline />}
            disabled={!chapterId}
            onClick={openCreateTopicModal}
          >
            Add Topic
          </ButtonComp>
        </Stack>
        <ListTopics
          topics={remappedTopicList()}
          loading={topicListLoading}
          onEdit={openEditTopicModal}
          onDelete={deleteTopic}
          deleteLoading={deleteTopicLoading}
        />
      </Card>

      {/* ADD / EDIT TOPIC MODAL */}
      <AddTopicModal
        open={openAddTopicModal}
        onClose={closeTopicModal}
        details={topicToEdit}
        chapterId={chapterId}
        chapterName={chapterName}
        onSuccess={fetchTopicList}
      />
    </Box>
  )
}
