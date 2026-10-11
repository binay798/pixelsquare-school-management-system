import { api } from '@src/helpers/api.helpers'

// TOPIC SERVICE
// POST /api/academics/classes/:classId/subjects/:subjectId/chapters/:chapterId/topics
// PATCH payload only — `subject_id` & `chapter_id` are resolved from the route
// params on the backend, so they are never sent from the client.
export interface CreateTopicDto
  extends Omit<
    Academics.ITopic,
    'id' | 'created_at' | 'updated_at' | 'subject_id' | 'chapter_id'
  > {}

export interface UpdateTopicDto extends Partial<CreateTopicDto> {}

const createTopic = async (
  classId: number,
  subjectId: number,
  chapterId: number,
  data: CreateTopicDto
) => {
  const res = await api<Api.Base<object>>('post')(
    `academics/classes/${classId}/subjects/${subjectId}/chapters/${chapterId}/topics`,
    undefined,
    data
  )

  return res.data.data
}

const getTopicList = async (
  classId: number,
  subjectId: number,
  chapterId: number
) => {
  const res = await api<Api.Base<Academics.ITopicList[]>>('get')(
    `academics/classes/${classId}/subjects/${subjectId}/chapters/${chapterId}/topics`
  )

  return res.data.data
}

const getTopicDetail = async (
  classId: number,
  subjectId: number,
  chapterId: number,
  topicId: number
) => {
  const res = await api<Api.Base<Academics.ITopic>>('get')(
    `academics/classes/${classId}/subjects/${subjectId}/chapters/${chapterId}/topics/${topicId}`
  )

  return res.data.data
}

const updateTopic = async (
  classId: number,
  subjectId: number,
  chapterId: number,
  topicId: number,
  data: UpdateTopicDto
) => {
  const res = await api<Api.Base<object>>('patch')(
    `academics/classes/${classId}/subjects/${subjectId}/chapters/${chapterId}/topics/${topicId}`,
    undefined,
    data
  )

  return res.data.data
}

const deleteTopic = async (
  classId: number,
  subjectId: number,
  chapterId: number,
  topicId: number
) => {
  const res = await api<Api.Base<object>>('delete')(
    `academics/classes/${classId}/subjects/${subjectId}/chapters/${chapterId}/topics/${topicId}`
  )

  return res.data.data
}

export const topicServices = {
  createTopic,
  getTopicList,
  getTopicDetail,
  updateTopic,
  deleteTopic,
}
