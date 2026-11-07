import {
  Box,
  CircularProgress,
  Divider,
  Stack,
  Typography,
} from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useFormik } from 'formik'
import * as yup from 'yup'
import moment from 'moment'
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  Check,
  FileQuestion,
  Layers,
  Lightbulb,
  Lock,
  Sparkles,
  Users,
} from 'lucide-react'
import { ButtonComp } from '@src/components/button/button.component'
import {
  InputField,
  TextareaField,
} from '@src/components/input/input.component'
import { CustomDatePicker } from '@src/components/datePicker/datePicker.component'
import { SelectField } from '@src/components/select/select.component'
import { colors } from '@src/helpers/colors.helpers'
import { ROLE } from '@src/constants/users.constants'
import { useDispatch, useSelector } from '@src/store/hooks.store'
import {
  createLessonPlanAction,
  getLessonPlanDetailAction,
  getLessonPlanTemplateListAction,
  updateLessonPlanAction,
} from '@src/store/redux/dashboard/academics/lessonPlans/lessonPlans.slice'
import {
  ICreateLessonPlanDto,
  IUpdateLessonPlanDto,
} from '@src/store/redux/dashboard/academics/lessonPlans/lessonPlans.service'
import { TopicsPickerModal } from '../../components/topicsPickerModal/topicsPickerModal.component'
import { PlanStatusChip } from '../../components/statusChip/planStatusChip.component'
import {
  formatPlanDate,
  getPersonName,
  isLessonPlanLocked,
  loadClassOptions,
  loadSectionOptions,
  loadSubjectOptions,
  loadTeacherOptions,
  PLAN_TYPE_OPTIONS,
  SelectOption,
} from '../../lessonPlan.helpers'

const BASE_PATH = '/dashboard/academics/lesson-plan'

type ContentKey =
  | 'objectives'
  | 'methodology'
  | 'resources'
  | 'assessment'
  | 'homework'

const CONTENT_FIELDS: {
  key: ContentKey
  label: string
  placeholder: string
  rows: number
  icon: JSX.Element
}[] = [
  {
    key: 'objectives',
    label: 'Learning objectives',
    placeholder: 'Students will be able to ...',
    rows: 3,
    icon: <Layers size={14} />,
  },
  {
    key: 'methodology',
    label: 'Methodology / teaching strategy',
    placeholder: 'Lecture, group work, guided practice ...',
    rows: 3,
    icon: <BookOpen size={14} />,
  },
  {
    key: 'resources',
    label: 'Resources required',
    placeholder: 'Whiteboard, worksheets, projector ...',
    rows: 2,
    icon: <Sparkles size={14} />,
  },
  {
    key: 'assessment',
    label: 'Assessment',
    placeholder: 'How will you check the understanding of the class?',
    rows: 2,
    icon: <Check size={14} />,
  },
  {
    key: 'homework',
    label: 'Homework',
    placeholder: 'Exercises to assign after the lesson ...',
    rows: 2,
    icon: <Lightbulb size={14} />,
  },
]

const validationSchema = yup.object({
  class_id: yup.number().nullable().required('Select a class'),
  class_section_id: yup.number().nullable().required('Select a section'),
  subject_id: yup.number().nullable().required('Select a subject'),
  plan_date: yup.string().required('Select the lesson date'),
  title: yup.string(),
})

const controlStyles = {
  control: (base: Record<string, unknown>) => ({
    ...base,
    minHeight: 38,
    fontSize: 13.5,
  }),
}

interface IFormValues {
  class_id: number | null
  class_section_id: number | null
  subject_id: number | null
  teacher_id: number | null
  template_id: number | null
  plan_type: LessonPlan.PlanType
  plan_date: string
  week_start_date: string
  title: string
  objectives: string
  methodology: string
  resources: string
  assessment: string
  homework: string
  topic_ids: number[]
}

export function CreateLessonPlanPage() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { lessonPlanId } = useParams()
  const [searchParams] = useSearchParams()
  const isEdit = Boolean(lessonPlanId)
  const planId = Number(lessonPlanId)

  const { data: auth } = useSelector((store) => store.auth.user)
  const { data: detail, loading: detailLoading } = useSelector(
    (store) => store.lessonPlans.planDetail
  )
  const { data: templateList } = useSelector(
    (store) => store.lessonPlans.templateList
  )
  const { loading: creating } = useSelector(
    (store) => store.lessonPlans.createPlan
  )
  const { loading: updating } = useSelector(
    (store) => store.lessonPlans.updatePlan
  )

  const [classOptions, setClassOptions] = useState<SelectOption[]>([])
  const [sectionOptions, setSectionOptions] = useState<SelectOption[]>([])
  const [subjectOptions, setSubjectOptions] = useState<SelectOption[]>([])
  const [teacherOptions, setTeacherOptions] = useState<SelectOption[]>([])
  const [topicsOpen, setTopicsOpen] = useState(false)
  const [topics, setTopics] = useState<{ id: number; name: string }[]>([])
  const [prefilled, setPrefilled] = useState(false)
  const [detailRequested, setDetailRequested] = useState(false)

  const userRoles = auth?.userRoles ?? []
  const isAdmin = useMemo(
    () => userRoles.includes(ROLE.admin) || userRoles.includes(ROLE.superadmin),
    [userRoles]
  )

  const formik = useFormik<IFormValues>({
    initialValues: {
      class_id: null,
      class_section_id: null,
      subject_id: null,
      teacher_id: null,
      template_id: null,
      plan_type: 'daily',
      plan_date: moment().format('YYYY-MM-DD'),
      week_start_date: moment().startOf('isoWeek').format('YYYY-MM-DD'),
      title: '',
      objectives: '',
      methodology: '',
      resources: '',
      assessment: '',
      homework: '',
      topic_ids: [],
    },
    validationSchema,
    onSubmit: (values) => {
      if (isEdit) {
        const body: IUpdateLessonPlanDto = {
          plan_type: values.plan_type,
          plan_date: values.plan_date,
          week_start_date:
            values.plan_type === 'weekly' ? values.week_start_date : null,
          template_id: values.template_id,
          title: values.title || null,
          objectives: values.objectives || null,
          methodology: values.methodology || null,
          resources: values.resources || null,
          assessment: values.assessment || null,
          homework: values.homework || null,
          topic_ids: values.topic_ids,
        }
        dispatch(
          updateLessonPlanAction({
            lessonPlanId: planId,
            body,
            onSuccess: () => navigate(`${BASE_PATH}/${planId}`),
          })
        )

        return
      }

      const body: ICreateLessonPlanDto = {
        class_id: values.class_id as number,
        class_section_id: values.class_section_id as number,
        subject_id: values.subject_id as number,
        plan_type: values.plan_type,
        plan_date: values.plan_date,
      }
      if (values.topic_ids.length > 0) {
        body.topic_ids = values.topic_ids
      }
      if (values.plan_type === 'weekly' && values.week_start_date) {
        body.week_start_date = values.week_start_date
      }
      if (values.template_id) {
        body.template_id = values.template_id
      }
      if (isAdmin && values.teacher_id) {
        body.teacher_id = values.teacher_id
      }
      if (values.title) {
        body.title = values.title
      }
      CONTENT_FIELDS.forEach((field) => {
        if (values[field.key]) {
          body[field.key] = values[field.key]
        }
      })

      dispatch(
        createLessonPlanAction({
          body,
          onSuccess: (id) => navigate(`${BASE_PATH}/${id}`),
        })
      )
    },
  })

  useEffect(() => {
    if (isEdit) {
      return
    }
    const classId = Number(searchParams.get('classId')) || null
    const sectionId = Number(searchParams.get('sectionId')) || null
    const subjectId = Number(searchParams.get('subjectId')) || null
    const date = searchParams.get('date')

    if (classId) {
      formik.setFieldValue('class_id', classId)
    }
    if (sectionId) {
      formik.setFieldValue('class_section_id', sectionId)
    }
    if (subjectId) {
      formik.setFieldValue('subject_id', subjectId)
    }
    if (date && moment(date).isValid()) {
      formik.setFieldValue('plan_date', moment(date).format('YYYY-MM-DD'))
      formik.setFieldValue(
        'week_start_date',
        moment(date).startOf('isoWeek').format('YYYY-MM-DD')
      )
    }
  }, [isEdit, searchParams])

  useEffect(() => {
    loadClassOptions()
      .then(setClassOptions)
      .catch(() => setClassOptions([]))
    dispatch(getLessonPlanTemplateListAction(true))
    if (isAdmin) {
      loadTeacherOptions()
        .then(setTeacherOptions)
        .catch(() => setTeacherOptions([]))
    }
  }, [dispatch, isAdmin])

  useEffect(() => {
    const classId = formik.values.class_id
    if (!classId) {
      setSectionOptions([])
      setSubjectOptions([])

      return
    }
    loadSectionOptions(classId)
      .then(setSectionOptions)
      .catch(() => setSectionOptions([]))
    loadSubjectOptions(classId)
      .then(setSubjectOptions)
      .catch(() => setSubjectOptions([]))
  }, [formik.values.class_id])

  useEffect(() => {
    setPrefilled(false)
    setTopics([])
    setDetailRequested(false)
  }, [planId])

  useEffect(() => {
    if (!isEdit || !planId) {
      return
    }
    setDetailRequested(true)
    dispatch(getLessonPlanDetailAction(planId))
  }, [dispatch, isEdit, planId])

  useEffect(() => {
    if (
      !isEdit ||
      !detail ||
      prefilled ||
      detail.lesson_plan_details.id !== planId
    ) {
      return
    }
    const planItem = detail.lesson_plan_details
    formik.setValues({
      class_id: planItem.class_id,
      class_section_id: planItem.class_section_id,
      subject_id: planItem.subject_id,
      teacher_id: planItem.teacher_id,
      template_id: planItem.template_id,
      plan_type: planItem.plan_type,
      plan_date: planItem.plan_date,
      week_start_date: planItem.week_start_date ?? '',
      title: planItem.title ?? '',
      objectives: planItem.objectives ?? '',
      methodology: planItem.methodology ?? '',
      resources: planItem.resources ?? '',
      assessment: planItem.assessment ?? '',
      homework: planItem.homework ?? '',
      topic_ids: (detail.topics_details ?? []).map((topic) => topic.id),
    })
    setTopics(
      (detail.topics_details ?? []).map((topic) => ({
        id: topic.id,
        name: topic.name,
      }))
    )
    setPrefilled(true)
  }, [detail, isEdit, prefilled])

  const selectedTemplate = useMemo(
    () =>
      (templateList ?? []).find(
        (template) => template.id === formik.values.template_id
      ) ?? null,
    [templateList, formik.values.template_id]
  )

  const findOption = (options: SelectOption[], value?: number | null) =>
    options.find((option) => option.value === value) ?? null

  const handleTemplateChange = (option: SelectOption | null) => {
    formik.setFieldValue('template_id', option?.value ?? null)
    const template = (templateList ?? []).find(
      (item) => item.id === option?.value
    )
    if (!template) {
      return
    }
    if (!formik.values.objectives && template.default_objectives) {
      formik.setFieldValue('objectives', template.default_objectives)
    }
    if (!formik.values.methodology && template.default_methodology) {
      formik.setFieldValue('methodology', template.default_methodology)
    }
    if (!formik.values.assessment && template.default_assessment) {
      formik.setFieldValue('assessment', template.default_assessment)
    }
  }

  const isFieldVisible = (key: string) => {
    if (!selectedTemplate || (selectedTemplate.fields ?? []).length === 0) {
      return true
    }

    return (selectedTemplate.fields ?? []).some((field) => field.key === key)
  }

  const fieldMeta = (key: string, fallbackLabel: string) => {
    const field = (selectedTemplate?.fields ?? []).find(
      (item) => item.key === key
    )

    return {
      label: field?.label ?? fallbackLabel,
      required: Boolean(field?.required),
      placeholder: field?.placeholder,
    }
  }

  const planItem =
    isEdit && detail?.lesson_plan_details.id === planId
      ? detail.lesson_plan_details
      : undefined
  const detailReady = Boolean(planItem)
  const locked = Boolean(planItem && isLessonPlanLocked(planItem.status))
  const saving = creating || updating
  const topicCount = topics.length

  const templateOptions = (templateList ?? []).map((template) => ({
    label: template.is_default
      ? `${template.name} (school default)`
      : template.name,
    value: template.id,
  }))

  if (isEdit && !detailReady && (detailLoading || !detailRequested)) {
    return (
      <Stack alignItems="center" justifyContent="center" py={10} spacing={1.5}>
        <CircularProgress size={26} />
        <Typography fontSize={13} color={colors.grey[500]}>
          Loading lesson plan...
        </Typography>
      </Stack>
    )
  }

  if (isEdit && !detailReady) {
    return (
      <Box
        sx={{
          maxWidth: 520,
          mx: 'auto',
          mt: 6,
          p: 4,
          borderRadius: 3,
          border: `1px solid ${colors.grey[200]}`,
          bgcolor: '#fff',
          textAlign: 'center',
        }}
      >
        <Box
          sx={{
            width: 48,
            height: 48,
            mx: 'auto',
            mb: 1.5,
            borderRadius: '50%',
            display: 'grid',
            placeItems: 'center',
            bgcolor: colors.grey[100],
            color: colors.grey[600],
          }}
        >
          <FileQuestion size={22} />
        </Box>
        <Typography fontSize={17} fontWeight={700} color={colors.grey[900]}>
          Lesson plan not found
        </Typography>
        <Typography fontSize={13} color={colors.grey[600]} mt={0.5} mb={2.5}>
          We couldn&apos;t load this lesson plan. It may have been deleted or
          you may not have access to it.
        </Typography>
        <ButtonComp
          startIcon={<ArrowLeft size={15} />}
          onClick={() => navigate(BASE_PATH)}
        >
          Back to plans
        </ButtonComp>
      </Box>
    )
  }

  if (locked) {
    return (
      <Box
        sx={{
          maxWidth: 520,
          mx: 'auto',
          mt: 6,
          p: 4,
          borderRadius: 3,
          border: `1px solid ${colors.grey[200]}`,
          bgcolor: '#fff',
          textAlign: 'center',
        }}
      >
        <Box
          sx={{
            width: 48,
            height: 48,
            mx: 'auto',
            mb: 1.5,
            borderRadius: '50%',
            display: 'grid',
            placeItems: 'center',
            bgcolor: colors.grey[100],
            color: colors.grey[600],
          }}
        >
          <Lock size={22} />
        </Box>
        <Typography fontSize={17} fontWeight={700} color={colors.grey[900]}>
          This lesson plan is locked
        </Typography>
        <Typography fontSize={13} color={colors.grey[600]} mt={0.5} mb={2.5}>
          Approved and completed plans can no longer be edited. Reopen the plan
          from its detail page if a correction is required.
        </Typography>
        <ButtonComp
          startIcon={<ArrowLeft size={15} />}
          onClick={() => navigate(`${BASE_PATH}/${planId}`)}
        >
          Back to plan
        </ButtonComp>
      </Box>
    )
  }

  const cardSx = {
    borderRadius: 3,
    border: `1px solid ${colors.grey[200]}`,
    bgcolor: '#fff',
    p: 2.5,
  }

  return (
    <Box>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        alignItems={{ xs: 'flex-start', md: 'center' }}
        justifyContent="space-between"
        mb={3}
      >
        <Stack direction="row" spacing={1.25} alignItems="center">
          <ButtonComp
            size="small"
            variant="outlined"
            onClick={() => navigate(BASE_PATH)}
            sx={{ minWidth: 36, px: 1 }}
          >
            <ArrowLeft size={16} />
          </ButtonComp>
          <Box>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography
                variant="h6"
                fontWeight={700}
                color={colors.grey[900]}
              >
                {isEdit ? 'Edit lesson plan' : 'New lesson plan'}
              </Typography>
              {planItem ? (
                <PlanStatusChip status={planItem.status} size="small" />
              ) : null}
            </Stack>
            <Typography fontSize={12.5} color={colors.grey[600]} mt={0.25}>
              {isEdit
                ? 'Update the content, topics and schedule of this lesson plan.'
                : 'Plan the lesson, attach the syllabus topics and share it with your coordinator.'}
            </Typography>
          </Box>
        </Stack>
        <Stack direction="row" spacing={1}>
          <ButtonComp
            variant="outlined"
            size="medium"
            onClick={() =>
              navigate(isEdit ? `${BASE_PATH}/${planId}` : BASE_PATH)
            }
          >
            Cancel
          </ButtonComp>
          <ButtonComp
            size="medium"
            loading={saving}
            onClick={() => formik.handleSubmit()}
          >
            {isEdit ? 'Save changes' : 'Create lesson plan'}
          </ButtonComp>
        </Stack>
      </Stack>

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
        <Stack spacing={2}>
          <Box sx={cardSx}>
            <Stack direction="row" alignItems="center" spacing={1} mb={2}>
              <CalendarDays size={16} color={colors.blue[600]} />
              <Typography
                fontSize={14.5}
                fontWeight={700}
                color={colors.grey[900]}
              >
                Class &amp; schedule
              </Typography>
            </Stack>

            <Box
              sx={{
                display: 'grid',
                gap: 1.5,
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
              }}
            >
              <Box>
                <Typography
                  fontSize={12}
                  fontWeight={600}
                  color={colors.grey[700]}
                  mb={0.75}
                >
                  Class
                </Typography>
                <SelectField
                  placeholder="Select class"
                  options={classOptions}
                  isDisabled={isEdit}
                  value={findOption(classOptions, formik.values.class_id)}
                  onChange={(option) =>
                    formik.setFieldValue(
                      'class_id',
                      (option as SelectOption | null)?.value ?? null
                    )
                  }
                  styles={controlStyles}
                />
              </Box>
              <Box>
                <Typography
                  fontSize={12}
                  fontWeight={600}
                  color={colors.grey[700]}
                  mb={0.75}
                >
                  Section
                </Typography>
                <SelectField
                  placeholder="Select section"
                  options={sectionOptions}
                  isDisabled={isEdit || !formik.values.class_id}
                  value={findOption(
                    sectionOptions,
                    formik.values.class_section_id
                  )}
                  onChange={(option) =>
                    formik.setFieldValue(
                      'class_section_id',
                      (option as SelectOption | null)?.value ?? null
                    )
                  }
                  styles={controlStyles}
                />
              </Box>
              <Box>
                <Typography
                  fontSize={12}
                  fontWeight={600}
                  color={colors.grey[700]}
                  mb={0.75}
                >
                  Subject
                </Typography>
                <SelectField
                  placeholder="Select subject"
                  options={subjectOptions}
                  isDisabled={isEdit || !formik.values.class_id}
                  value={findOption(subjectOptions, formik.values.subject_id)}
                  onChange={(option) =>
                    formik.setFieldValue(
                      'subject_id',
                      (option as SelectOption | null)?.value ?? null
                    )
                  }
                  styles={controlStyles}
                />
              </Box>
            </Box>

            {formik.errors.class_id && formik.touched.class_id ? (
              <Typography fontSize={11.5} color="error" mt={0.75}>
                {formik.errors.class_id}
              </Typography>
            ) : null}

            <Divider sx={{ my: 2 }} />

            <Box
              sx={{
                display: 'grid',
                gap: 1.5,
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
              }}
            >
              <Box>
                <Typography
                  fontSize={12}
                  fontWeight={600}
                  color={colors.grey[700]}
                  mb={0.75}
                >
                  Plan type
                </Typography>
                <SelectField
                  options={PLAN_TYPE_OPTIONS}
                  value={
                    PLAN_TYPE_OPTIONS.find(
                      (option) => option.value === formik.values.plan_type
                    ) ?? null
                  }
                  onChange={(option) =>
                    formik.setFieldValue(
                      'plan_type',
                      (option as { value: LessonPlan.PlanType } | null)
                        ?.value ?? 'daily'
                    )
                  }
                  styles={controlStyles}
                />
              </Box>
              <Box>
                <Typography
                  fontSize={12}
                  fontWeight={600}
                  color={colors.grey[700]}
                  mb={0.75}
                >
                  Lesson date
                </Typography>
                <CustomDatePicker
                  views={['day', 'month', 'year']}
                  onChange={(value) => {
                    if (value && moment(value).isValid()) {
                      formik.setFieldValue(
                        'plan_date',
                        moment(value).format('YYYY-MM-DD')
                      )
                    }
                  }}
                  textFieldProps={{
                    value: formik.values.plan_date
                      ? moment(formik.values.plan_date)
                      : null,
                    size: 'small',
                  }}
                />
              </Box>
              {formik.values.plan_type === 'weekly' ? (
                <Box>
                  <Typography
                    fontSize={12}
                    fontWeight={600}
                    color={colors.grey[700]}
                    mb={0.75}
                  >
                    Week start date
                  </Typography>
                  <CustomDatePicker
                    views={['day', 'month', 'year']}
                    onChange={(value) => {
                      if (value && moment(value).isValid()) {
                        formik.setFieldValue(
                          'week_start_date',
                          moment(value).format('YYYY-MM-DD')
                        )
                      }
                    }}
                    textFieldProps={{
                      value: formik.values.week_start_date
                        ? moment(formik.values.week_start_date)
                        : null,
                      size: 'small',
                    }}
                  />
                </Box>
              ) : null}
              {isAdmin ? (
                <Box>
                  <Typography
                    fontSize={12}
                    fontWeight={600}
                    color={colors.grey[700]}
                    mb={0.75}
                  >
                    Authoring teacher
                  </Typography>
                  <SelectField
                    placeholder="Assign to a teacher"
                    options={teacherOptions}
                    isClearable
                    isDisabled={isEdit}
                    value={findOption(teacherOptions, formik.values.teacher_id)}
                    onChange={(option) =>
                      formik.setFieldValue(
                        'teacher_id',
                        (option as SelectOption | null)?.value ?? null
                      )
                    }
                    styles={controlStyles}
                  />
                </Box>
              ) : null}
            </Box>
          </Box>

          <Box sx={cardSx}>
            <Stack direction="row" alignItems="center" spacing={1} mb={2}>
              <BookOpen size={16} color={colors.blue[600]} />
              <Typography
                fontSize={14.5}
                fontWeight={700}
                color={colors.grey[900]}
              >
                Lesson content
              </Typography>
            </Stack>

            <Box
              sx={{
                display: 'grid',
                gap: 1.5,
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
                mb: 1.5,
              }}
            >
              <Box>
                <Typography
                  fontSize={12}
                  fontWeight={600}
                  color={colors.grey[700]}
                  mb={0.75}
                >
                  Plan template
                </Typography>
                <SelectField
                  placeholder="Use the school default"
                  options={templateOptions}
                  isClearable
                  value={findOption(templateOptions, formik.values.template_id)}
                  onChange={(option) =>
                    handleTemplateChange(option as SelectOption | null)
                  }
                  styles={controlStyles}
                />
              </Box>
              <Box>
                <Typography
                  fontSize={12}
                  fontWeight={600}
                  color={colors.grey[700]}
                  mb={0.75}
                >
                  Lesson title
                </Typography>
                <InputField
                  name="title"
                  placeholder="e.g. Introduction to quadratic equations"
                  value={formik.values.title}
                  onChange={formik.handleChange}
                />
              </Box>
            </Box>

            <Stack spacing={1.75}>
              {CONTENT_FIELDS.filter((field) => isFieldVisible(field.key)).map(
                (field) => {
                  const meta = fieldMeta(field.key, field.label)

                  return (
                    <Box key={field.key}>
                      <Stack
                        direction="row"
                        alignItems="center"
                        spacing={0.75}
                        mb={0.75}
                      >
                        <Box sx={{ color: colors.blue[500], display: 'flex' }}>
                          {field.icon}
                        </Box>
                        <Typography
                          fontSize={12}
                          fontWeight={600}
                          color={colors.grey[700]}
                        >
                          {meta.label}
                          {meta.required ? (
                            <Box
                              component="span"
                              sx={{ color: colors.red[400] }}
                            >
                              {' '}
                              *
                            </Box>
                          ) : null}
                        </Typography>
                      </Stack>
                      <TextareaField
                        variant="outlined"
                        name={field.key}
                        placeholder={meta.placeholder ?? field.placeholder}
                        multiline
                        minRows={field.rows}
                        value={formik.values[field.key]}
                        onChange={formik.handleChange}
                      />
                    </Box>
                  )
                }
              )}
            </Stack>
          </Box>

          <Box sx={cardSx}>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              mb={1.5}
            >
              <Stack direction="row" alignItems="center" spacing={1}>
                <Layers size={16} color={colors.blue[600]} />
                <Typography
                  fontSize={14.5}
                  fontWeight={700}
                  color={colors.grey[900]}
                >
                  Topics covered
                </Typography>
                <Box
                  sx={{
                    px: 0.75,
                    py: 0.1,
                    borderRadius: 999,
                    bgcolor: colors.blue[50],
                    color: colors.blue[700],
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                >
                  {topicCount}
                </Box>
              </Stack>
              <ButtonComp
                size="small"
                variant="outlined"
                onClick={() => setTopicsOpen(true)}
                disabled={!formik.values.class_id || !formik.values.subject_id}
              >
                {topicCount > 0 ? 'Edit topics' : 'Choose topics'}
              </ButtonComp>
            </Stack>

            {topicCount === 0 ? (
              <Box
                sx={{
                  borderRadius: 2,
                  border: `1px dashed ${colors.grey[300]}`,
                  bgcolor: colors.grey[50],
                  py: 3,
                  textAlign: 'center',
                }}
              >
                <Typography fontSize={12.5} color={colors.grey[500]}>
                  {formik.values.subject_id
                    ? 'No syllabus topics selected yet. Pick the topics this lesson will cover.'
                    : 'Select a class and subject first to load the syllabus topics.'}
                </Typography>
              </Box>
            ) : (
              <Stack direction="row" spacing={0.75} flexWrap="wrap" gap={0.75}>
                {topics.map((topic) => (
                  <Box
                    key={topic.id}
                    sx={{
                      px: 1,
                      py: 0.4,
                      borderRadius: 1.5,
                      border: `1px solid ${colors.blue[100]}`,
                      bgcolor: colors.blue[50],
                    }}
                  >
                    <Typography fontSize={11.5} color={colors.blue[800]}>
                      {topic.name}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            )}
          </Box>
        </Stack>

        <Stack spacing={2}>
          <Box sx={cardSx}>
            <Typography
              fontSize={14.5}
              fontWeight={700}
              color={colors.grey[900]}
              mb={1.75}
            >
              Plan summary
            </Typography>

            <Stack spacing={1.25}>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
              >
                <Typography fontSize={12} color={colors.grey[500]}>
                  Status
                </Typography>
                {planItem ? (
                  <PlanStatusChip status={planItem.status} size="small" />
                ) : (
                  <Typography
                    fontSize={12.5}
                    fontWeight={600}
                    color={colors.grey[800]}
                  >
                    Draft on save
                  </Typography>
                )}
              </Stack>
              {[
                {
                  label: 'Class',
                  value:
                    findOption(classOptions, formik.values.class_id)?.label ??
                    '—',
                },
                {
                  label: 'Section',
                  value:
                    findOption(sectionOptions, formik.values.class_section_id)
                      ?.label ?? '—',
                },
                {
                  label: 'Subject',
                  value:
                    findOption(subjectOptions, formik.values.subject_id)
                      ?.label ?? '—',
                },
                {
                  label: 'Lesson date',
                  value: formatPlanDate(formik.values.plan_date),
                },
                {
                  label: 'Plan type',
                  value:
                    formik.values.plan_type === 'weekly'
                      ? 'Weekly plan'
                      : 'Daily plan',
                },
                {
                  label: 'Topics',
                  value: `${topicCount} selected`,
                },
                {
                  label: 'Template',
                  value: selectedTemplate?.name ?? 'School default',
                },
                ...(planItem && planItem.teacher_id
                  ? [
                      {
                        label: 'Teacher',
                        value: getPersonName(detail?.teacher_details),
                      },
                    ]
                  : []),
              ].map((item) => (
                <Stack
                  key={item.label}
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  spacing={1}
                >
                  <Typography fontSize={12} color={colors.grey[500]}>
                    {item.label}
                  </Typography>
                  <Typography
                    fontSize={12.5}
                    fontWeight={600}
                    color={colors.grey[800]}
                    textAlign="right"
                  >
                    {item.value}
                  </Typography>
                </Stack>
              ))}
            </Stack>

            <Divider sx={{ my: 2 }} />

            <ButtonComp
              fullWidth
              size="medium"
              loading={saving}
              onClick={() => formik.handleSubmit()}
            >
              {isEdit ? 'Save changes' : 'Create lesson plan'}
            </ButtonComp>
            <Typography
              fontSize={11}
              color={colors.grey[500]}
              textAlign="center"
              mt={1}
            >
              The plan is saved as a draft. Submit it for review from the plan
              detail page.
            </Typography>
          </Box>

          <Box
            sx={{
              ...cardSx,
              background:
                'linear-gradient(135deg, rgba(36,99,235,0.08), rgba(99,102,241,0.06))',
              border: `1px solid ${colors.blue[100]}`,
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1} mb={1}>
              <Users size={15} color={colors.blue[600]} />
              <Typography
                fontSize={13.5}
                fontWeight={700}
                color={colors.grey[900]}
              >
                How the workflow works
              </Typography>
            </Stack>
            <Stack spacing={1}>
              {[
                'Draft — you are still preparing the plan.',
                'Submitted — your coordinator reviews it.',
                'Approved — published to the students of the section.',
                'Completed — record a reflection after the lesson.',
              ].map((step) => (
                <Stack
                  key={step}
                  direction="row"
                  spacing={1}
                  alignItems="flex-start"
                >
                  <Box
                    sx={{
                      width: 5,
                      height: 5,
                      borderRadius: '50%',
                      bgcolor: colors.blue[400],
                      mt: 0.9,
                      flexShrink: 0,
                    }}
                  />
                  <Typography fontSize={12} color={colors.grey[700]}>
                    {step}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </Box>
        </Stack>
      </Box>

      <TopicsPickerModal
        open={topicsOpen}
        onClose={() => setTopicsOpen(false)}
        classId={formik.values.class_id ?? undefined}
        subjectId={formik.values.subject_id ?? undefined}
        selectedTopicIds={formik.values.topic_ids}
        onSubmit={(topicIds, selectedTopics) => {
          formik.setFieldValue('topic_ids', topicIds)
          setTopics(selectedTopics)
          setTopicsOpen(false)
        }}
      />
    </Box>
  )
}
