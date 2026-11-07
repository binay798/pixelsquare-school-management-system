import { api } from '@src/helpers/api.helpers'

// MARK: - DTOs
export interface ICreateLessonPlanDto {
  class_id: number
  class_section_id: number
  subject_id: number
  class_routine_id?: number
  template_id?: number
  teacher_id?: number
  plan_type?: LessonPlan.PlanType
  plan_date: string
  week_start_date?: string
  title?: string
  objectives?: string
  methodology?: string
  resources?: string
  assessment?: string
  homework?: string
  is_published?: boolean
  topic_ids?: number[]
}

export interface IUpdateLessonPlanDto {
  class_routine_id?: number | null
  template_id?: number | null
  plan_type?: LessonPlan.PlanType
  plan_date?: string
  week_start_date?: string | null
  title?: string | null
  objectives?: string | null
  methodology?: string | null
  resources?: string | null
  assessment?: string | null
  homework?: string | null
  is_published?: boolean
  topic_ids?: number[]
}

export interface ILessonPlanFilters {
  classId?: number
  classSectionId?: number
  subjectId?: number
  teacherId?: number
  status?: LessonPlan.Status | ''
  planType?: LessonPlan.PlanType | ''
  fromDate?: string
  toDate?: string
  search?: string
}

export interface ICreateLessonPlanTemplateDto {
  name: string
  description?: string
  is_default?: boolean
  is_active?: boolean
  fields?: LessonPlan.ITemplateField[]
  default_objectives?: string
  default_methodology?: string
  default_assessment?: string
}

export type IUpdateLessonPlanTemplateDto = Partial<ICreateLessonPlanTemplateDto>

type TQueryParams = { [key: string]: number | string }

const buildPlanFilterParams = (filters?: ILessonPlanFilters) => {
  const params: TQueryParams = {}

  if (filters?.classId) {
    params.classId = filters.classId
  }
  if (filters?.classSectionId) {
    params.classSectionId = filters.classSectionId
  }
  if (filters?.subjectId) {
    params.subjectId = filters.subjectId
  }
  if (filters?.teacherId) {
    params.teacherId = filters.teacherId
  }
  if (filters?.status) {
    params.status = filters.status
  }
  if (filters?.planType) {
    params.planType = filters.planType
  }
  if (filters?.fromDate) {
    params.fromDate = filters.fromDate
  }
  if (filters?.toDate) {
    params.toDate = filters.toDate
  }
  if (filters?.search) {
    params.search = filters.search
  }

  return params
}

// MARK: - LESSON PLAN
const getLessonPlanListService = async (
  filters?: ILessonPlanFilters,
  page = 1,
  limit = 10
) => {
  const res = await api<Api.Base<LessonPlan.IList>>('get')(
    'academics/lesson-plans',
    { ...buildPlanFilterParams(filters), page, limit }
  )

  return res.data.data
}

const getMyLessonPlanListService = async (data?: {
  page?: number
  limit?: number
  status?: LessonPlan.Status | ''
  fromDate?: string
  toDate?: string
}) => {
  const params: TQueryParams = {
    page: data?.page ?? 1,
    limit: data?.limit ?? 10,
  }
  if (data?.status) {
    params.status = data.status
  }
  if (data?.fromDate) {
    params.fromDate = data.fromDate
  }
  if (data?.toDate) {
    params.toDate = data.toDate
  }

  const res = await api<Api.Base<LessonPlan.IList>>('get')(
    'academics/lesson-plans/mine',
    params
  )

  return res.data.data
}

const getLessonPlanDetailService = async (lessonPlanId: number) => {
  const res = await api<Api.Base<LessonPlan.IDetail>>('get')(
    `academics/lesson-plans/${lessonPlanId}`
  )

  return res.data.data
}

const getLessonPlanSummaryService = async (lessonPlanId: number) => {
  const res = await api<Api.Base<LessonPlan.IDetail>>('get')(
    `academics/lesson-plans/${lessonPlanId}/summary`
  )

  return res.data.data
}

const createLessonPlanService = async (data: ICreateLessonPlanDto) => {
  const res = await api<Api.Base<{ id: number }>>('post')(
    'academics/lesson-plans',
    undefined,
    data
  )

  return res.data.data
}

const updateLessonPlanService = async (
  lessonPlanId: number,
  data: IUpdateLessonPlanDto
) => {
  const res = await api<Api.Base<object>>('patch')(
    `academics/lesson-plans/${lessonPlanId}`,
    undefined,
    data
  )

  return res.data.data
}

const deleteLessonPlanService = async (lessonPlanId: number) => {
  const res = await api<Api.Base<object>>('delete')(
    `academics/lesson-plans/${lessonPlanId}`
  )

  return res.data.data
}

const updateLessonPlanStatusService = async (
  lessonPlanId: number,
  data: { status: LessonPlan.Status; review_comment?: string }
) => {
  const res = await api<Api.Base<object>>('patch')(
    `academics/lesson-plans/${lessonPlanId}/status`,
    undefined,
    data
  )

  return res.data.data
}

const updateLessonPlanReflectionService = async (
  lessonPlanId: number,
  teacherReflection: string
) => {
  const res = await api<Api.Base<object>>('patch')(
    `academics/lesson-plans/${lessonPlanId}/reflection`,
    undefined,
    { teacher_reflection: teacherReflection }
  )

  return res.data.data
}

const addLessonPlanTopicsService = async (
  lessonPlanId: number,
  topicIds: number[]
) => {
  const res = await api<Api.Base<object>>('post')(
    `academics/lesson-plans/${lessonPlanId}/topics`,
    undefined,
    { topic_ids: topicIds }
  )

  return res.data.data
}

const removeLessonPlanTopicService = async (
  lessonPlanId: number,
  topicId: number
) => {
  const res = await api<Api.Base<object>>('delete')(
    `academics/lesson-plans/${lessonPlanId}/topics/${topicId}`
  )

  return res.data.data
}

const uploadLessonPlanResourcesService = async (
  lessonPlanId: number,
  files: File[]
) => {
  const fd = new FormData()
  files.forEach((file) => {
    fd.append('lessonPlanAttachment', file)
  })

  const res = await api<Api.Base<{ ids: number[] }>>('post')(
    `academics/lesson-plans/${lessonPlanId}/resources`,
    undefined,
    fd,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  )

  return res.data.data
}

const attachLessonPlanLinkService = async (
  lessonPlanId: number,
  data: { url: string; label?: string }
) => {
  const res = await api<Api.Base<{ id: number }>>('post')(
    `academics/lesson-plans/${lessonPlanId}/resources/link`,
    undefined,
    data
  )

  return res.data.data
}

const deleteLessonPlanResourceService = async (
  lessonPlanId: number,
  resourceId: number
) => {
  const res = await api<Api.Base<object>>('delete')(
    `academics/lesson-plans/${lessonPlanId}/resources/${resourceId}`
  )

  return res.data.data
}

const getWeeklyGridService = async (data: {
  weekStartDate?: string
  teacherId?: number
}) => {
  const params: TQueryParams = {}

  if (data.weekStartDate) {
    params.weekStartDate = data.weekStartDate
  }
  if (data.teacherId) {
    params.teacherId = data.teacherId
  }

  const res = await api<Api.Base<LessonPlan.IWeeklyGrid>>('get')(
    'academics/lesson-plans/weekly',
    params
  )

  return res.data.data
}

const getSyllabusCompletionService = async (data: {
  classSectionId: number
  subjectId: number
}) => {
  const res = await api<Api.Base<LessonPlan.ISyllabusCompletion>>('get')(
    'academics/lesson-plans/syllabus-completion',
    { classSectionId: data.classSectionId, subjectId: data.subjectId }
  )

  return res.data.data
}

// MARK: - LESSON PLAN TEMPLATE
const getLessonPlanTemplateListService = async (activeOnly?: boolean) => {
  const res = await api<Api.Base<LessonPlan.ITemplate[]>>('get')(
    'academics/lesson-plan-templates',
    activeOnly ? { activeOnly: 'true' } : undefined
  )

  return res.data.data
}

const getLessonPlanTemplateDetailService = async (templateId: number) => {
  const res = await api<Api.Base<LessonPlan.ITemplate>>('get')(
    `academics/lesson-plan-templates/${templateId}`
  )

  return res.data.data
}

const getDefaultLessonPlanTemplateService = async () => {
  const res = await api<Api.Base<{ template: LessonPlan.ITemplate | null }>>(
    'get'
  )('academics/lesson-plan-templates/default')

  return res.data.data
}

const createLessonPlanTemplateService = async (
  data: ICreateLessonPlanTemplateDto
) => {
  const res = await api<Api.Base<{ id: number }>>('post')(
    'academics/lesson-plan-templates',
    undefined,
    data
  )

  return res.data.data
}

const updateLessonPlanTemplateService = async (
  templateId: number,
  data: IUpdateLessonPlanTemplateDto
) => {
  const res = await api<Api.Base<object>>('patch')(
    `academics/lesson-plan-templates/${templateId}`,
    undefined,
    data
  )

  return res.data.data
}

const setDefaultLessonPlanTemplateService = async (templateId: number) => {
  const res = await api<Api.Base<object>>('patch')(
    `academics/lesson-plan-templates/${templateId}/default`
  )

  return res.data.data
}

const deleteLessonPlanTemplateService = async (templateId: number) => {
  const res = await api<Api.Base<object>>('delete')(
    `academics/lesson-plan-templates/${templateId}`
  )

  return res.data.data
}

export const lessonPlanServices = {
  getLessonPlanListService,
  getMyLessonPlanListService,
  getLessonPlanDetailService,
  getLessonPlanSummaryService,
  createLessonPlanService,
  updateLessonPlanService,
  deleteLessonPlanService,
  updateLessonPlanStatusService,
  updateLessonPlanReflectionService,
  addLessonPlanTopicsService,
  removeLessonPlanTopicService,
  uploadLessonPlanResourcesService,
  attachLessonPlanLinkService,
  deleteLessonPlanResourceService,
  getWeeklyGridService,
  getSyllabusCompletionService,
  getLessonPlanTemplateListService,
  getLessonPlanTemplateDetailService,
  getDefaultLessonPlanTemplateService,
  createLessonPlanTemplateService,
  updateLessonPlanTemplateService,
  setDefaultLessonPlanTemplateService,
  deleteLessonPlanTemplateService,
}
