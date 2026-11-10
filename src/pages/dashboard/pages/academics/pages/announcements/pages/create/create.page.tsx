import { Box, Divider, Stack, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useFormik } from 'formik'
import * as yup from 'yup'
import moment from 'moment'
import {
  ArrowLeft,
  CalendarClock,
  Info,
  Lock,
  Megaphone,
  Pin,
  Send,
  Users,
} from 'lucide-react'
import { ButtonComp } from '@src/components/button/button.component'
import {
  InputField,
  TextareaField,
} from '@src/components/input/input.component'
import { SelectField } from '@src/components/select/select.component'
import { CustomSwitch } from '@src/components/switch/switch.component'
import { TinyMceEditor } from '@src/components/tinyMce/tinyMceEditor.component'
import { CustomDatePicker } from '@src/components/datePicker/datePicker.component'
import { colors } from '@src/helpers/colors.helpers'
import { useDispatch, useSelector } from '@src/store/hooks.store'
import {
  createAnnouncementAction,
  getAnnouncementDetailAction,
  updateAnnouncementAction,
} from '@src/store/redux/dashboard/academics/announcements/announcements.slice'
import {
  ICreateAnnouncementDto,
  IUpdateAnnouncementDto,
} from '@src/store/redux/dashboard/academics/announcements/announcements.service'
import { AnnouncementAudienceSelector } from '../../components/audienceSelector/announcementAudienceSelector.component'
import { AnnouncementStatusChip } from '../../components/statusChip/announcementStatusChip.component'
import {
  ANNOUNCEMENT_BASE_PATH,
  ANNOUNCEMENT_CATEGORY_OPTIONS,
  ANNOUNCEMENT_PRIORITY_OPTIONS,
  audienceFromTargets,
  isAnnouncementLocked,
  isAudienceFilled,
  stripAnnouncementHtml,
} from '../../announcements.helpers'

const DEFAULT_PUBLISH_TIME = '09:00'

type CreateStatus = Exclude<Announcement.Status, 'archived'>

/** Statuses a notice can be created with (archiving is an action, not a state). */
const STATUS_OPTIONS: { label: string; value: CreateStatus }[] = [
  { label: 'Draft', value: 'draft' },
  { label: 'Scheduled', value: 'scheduled' },
  { label: 'Published', value: 'published' },
]

interface IFormValues {
  title: string
  summary: string
  content: string
  category: Announcement.Category
  priority: Announcement.Priority
  status: CreateStatus
  audience: Announcement.IAudience
  is_pinned: boolean
  require_acknowledgement: boolean
  publish_date: string
  publish_time: string
  expires_date: string
  expires_time: string
  external_url: string
}

const controlStyles = {
  control: (base: Record<string, unknown>) => ({
    ...base,
    minHeight: 38,
    fontSize: 13.5,
  }),
}

const validationSchema = yup.object({
  title: yup
    .string()
    .trim()
    .required('Give the notice a title')
    .max(180, 'Keep the title under 180 characters'),
  content: yup
    .string()
    .test('notice-body', 'Write the notice body', (value) =>
      Boolean(stripAnnouncementHtml(value, 5).replace('…', '').trim().length)
    ),
  audience: yup
    .mixed()
    .test('audience', 'Pick at least one recipient group', (value) =>
      isAudienceFilled(value as Announcement.IAudience)
    ),
  publish_date: yup.string().when('status', {
    is: 'scheduled',
    then: (schema) => schema.required('Pick the publish date'),
  }),
})

/** Combines the date and time inputs of the form into the ISO string of the API. */
const combineDateTime = (date: string, time: string) => {
  if (!date) {
    return undefined
  }
  const value = moment(
    `${date} ${time || DEFAULT_PUBLISH_TIME}`,
    'YYYY-MM-DD HH:mm'
  )

  return value.isValid() ? value.toISOString() : undefined
}

/** Resolves the react-select option object matching a stored value. */
function findOption<T extends string | number>(
  options: { label: string; value: T }[],
  value: T
) {
  return options.find((option) => option.value === value) ?? null
}

const cardSx = {
  bgcolor: '#fff',
  border: `1px solid ${colors.grey[200]}`,
  borderRadius: 2.5,
  p: 2.5,
}

const sectionTitleSx = {
  width: 28,
  height: 28,
  borderRadius: 1.5,
  display: 'grid',
  placeItems: 'center',
}

export function CreateAnnouncementPage() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { announcementId } = useParams()
  const isEdit = Boolean(announcementId)
  const noticeId = Number(announcementId)

  const { data: detail, loading: detailLoading } = useSelector(
    (store) => store.announcements.announcementDetail
  )
  const { loading: creating } = useSelector(
    (store) => store.announcements.createAnnouncement
  )
  const { loading: updating } = useSelector(
    (store) => store.announcements.updateAnnouncement
  )

  const [prefilled, setPrefilled] = useState(false)

  const formik = useFormik<IFormValues>({
    initialValues: {
      title: '',
      summary: '',
      content: '',
      category: 'general',
      priority: 'normal',
      status: 'draft',
      audience: { type: 'school' },
      is_pinned: false,
      require_acknowledgement: false,
      publish_date: moment().format('YYYY-MM-DD'),
      publish_time: DEFAULT_PUBLISH_TIME,
      expires_date: '',
      expires_time: '',
      external_url: '',
    },
    validationSchema,
    onSubmit: (values) => {
      const publishAt = combineDateTime(
        values.publish_date,
        values.publish_time
      )
      const expiresAt = combineDateTime(
        values.expires_date,
        values.expires_time
      )

      if (isEdit) {
        const body: IUpdateAnnouncementDto = {
          title: values.title.trim(),
          summary: values.summary.trim() || undefined,
          content: values.content,
          category: values.category,
          priority: values.priority,
          audience: values.audience,
          is_pinned: values.is_pinned,
          require_acknowledgement: values.require_acknowledgement,
          publish_at: undefined,
          // publish_at: publishAt,
          expires_at: expiresAt,
          external_url: values.external_url.trim() || undefined,
        }
        dispatch(
          updateAnnouncementAction({
            announcementId: noticeId,
            body,
            onSuccess: () => navigate(`${ANNOUNCEMENT_BASE_PATH}/${noticeId}`),
          })
        )

        return
      }

      const body: ICreateAnnouncementDto = {
        title: values.title.trim(),
        content: values.content,
        category: values.category,
        priority: values.priority,
        status: values.status,
        audience: values.audience,
        is_pinned: values.is_pinned,
        require_acknowledgement: values.require_acknowledgement,
      }
      if (values.summary.trim()) {
        body.summary = values.summary.trim()
      }
      if (values.status === 'scheduled' && publishAt) {
        body.publish_at = publishAt
      }
      if (expiresAt) {
        body.expires_at = expiresAt
      }
      if (values.external_url.trim()) {
        body.external_url = values.external_url.trim()
      }

      dispatch(
        createAnnouncementAction({
          body,
          onSuccess: (id) => navigate(`${ANNOUNCEMENT_BASE_PATH}/${id}`),
        })
      )
    },
  })

  useEffect(() => {
    setPrefilled(false)
  }, [noticeId])

  useEffect(() => {
    if (!isEdit || !noticeId) {
      return
    }
    dispatch(getAnnouncementDetailAction(noticeId))
  }, [dispatch, isEdit, noticeId])

  useEffect(() => {
    if (!isEdit || !detail || prefilled) {
      return
    }
    const notice = detail.announcement_details
    if (notice.id !== noticeId) {
      return
    }
    formik.setValues({
      title: notice.title ?? '',
      summary: notice.summary ?? '',
      content: notice.content ?? '',
      category: notice.category,
      priority: notice.priority,
      status: notice.status === 'archived' ? 'draft' : notice.status,
      audience: audienceFromTargets(
        detail.targets_details ?? [],
        notice.audience_type
      ),
      is_pinned: Boolean(notice.is_pinned),
      require_acknowledgement: Boolean(notice.require_acknowledgement),
      publish_date: notice.publish_at
        ? moment(notice.publish_at).format('YYYY-MM-DD')
        : '',
      publish_time: notice.publish_at
        ? moment(notice.publish_at).format('HH:mm')
        : DEFAULT_PUBLISH_TIME,
      expires_date: notice.expires_at
        ? moment(notice.expires_at).format('YYYY-MM-DD')
        : '',
      expires_time: notice.expires_at
        ? moment(notice.expires_at).format('HH:mm')
        : '',
      external_url: notice.external_url ?? '',
    })
    setPrefilled(true)
  }, [detail, isEdit, prefilled, noticeId])

  const notice = detail?.announcement_details
  const isLocked = isEdit ? isAnnouncementLocked(notice?.status) : false
  const bodyLength = stripAnnouncementHtml(formik.values.content, 20000).length
  const saving = creating || updating || detailLoading
  const title = isEdit ? 'Edit notice' : 'New announcement'
  const subtitle = isEdit
    ? 'Update the wording, audience or schedule of this notice.'
    : 'Compose a notice and pick who needs to see it.'

  const statusHint = (() => {
    if (formik.values.status === 'draft') {
      return 'Saved quietly — visible only to you and other staff who can publish.'
    }
    if (formik.values.status === 'scheduled') {
      return `Goes live on ${moment(
        formik.values.publish_date,
        'YYYY-MM-DD'
      ).format('DD MMM YYYY')} at ${
        formik.values.publish_time || DEFAULT_PUBLISH_TIME
      }.`
    }

    return 'Published right away — recipients are notified immediately.'
  })()

  const handleBack = () => {
    if (isEdit) {
      navigate(`${ANNOUNCEMENT_BASE_PATH}/${noticeId}`)

      return
    }
    navigate(ANNOUNCEMENT_BASE_PATH)
  }

  return (
    <Box sx={{ pb: 4, maxWidth: 1120, mx: 'auto' }}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        spacing={2}
        mb={2.5}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <ButtonComp
            variant="text"
            size="small"
            startIcon={<ArrowLeft size={16} />}
            onClick={handleBack}
          >
            Back
          </ButtonComp>
          <Box>
            <Typography fontSize={19} fontWeight={700} color={colors.grey[900]}>
              {title}
            </Typography>
            <Typography fontSize={12.5} color={colors.grey[500]}>
              {subtitle}
            </Typography>
          </Box>
        </Stack>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          {isEdit && notice ? (
            <AnnouncementStatusChip status={notice.status} />
          ) : null}
          <ButtonComp variant="outlined" onClick={handleBack} disabled={saving}>
            Cancel
          </ButtonComp>
          <ButtonComp
            variant="contained"
            startIcon={<Send size={16} />}
            onClick={() => formik.handleSubmit()}
            loading={saving}
            disabled={isLocked}
          >
            {isEdit ? 'Save changes' : 'Create notice'}
          </ButtonComp>
        </Stack>
      </Stack>

      {isLocked ? (
        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
          sx={{
            mb: 2,
            p: 1.5,
            borderRadius: 2,
            bgcolor: colors.amber[50],
            border: `1px solid ${colors.amber[200]}`,
          }}
        >
          <Lock size={16} color={colors.amber[800]} />
          <Typography fontSize={12.5} color={colors.amber[900]}>
            This notice is already published and locked. Archive it first if you
            need to stop delivery.
          </Typography>
        </Stack>
      ) : null}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) 336px' },
          gap: 2,
          alignItems: 'start',
        }}
      >
        <Stack spacing={2}>
          <Box
            sx={{
              bgcolor: '#fff',
              border: `1px solid ${colors.grey[200]}`,
              borderRadius: 2.5,
              p: 2.5,
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1} mb={2}>
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: 1.5,
                  display: 'grid',
                  placeItems: 'center',
                  bgcolor: colors.blue[50],
                  color: colors.blue[600],
                }}
              >
                <Megaphone size={15} />
              </Box>
              <Typography
                fontSize={14}
                fontWeight={700}
                color={colors.grey[900]}
              >
                Notice content
              </Typography>
            </Stack>

            <Stack spacing={1.75}>
              <InputField
                name="title"
                placeholder="e.g. Parent-teacher meeting on Friday"
                value={formik.values.title}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={Boolean(formik.touched.title && formik.errors.title)}
                helperText={
                  formik.touched.title ? String(formik.errors.title ?? '') : ''
                }
                labelDetail={{ text: 'Title', required: true }}
                size="small"
              />

              <TextareaField
                name="summary"
                placeholder="One line that shows up in the feed and notifications"
                value={formik.values.summary}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                minRows={2}
                variant="outlined"
                helperText="Optional. Keep it under 200 characters."
                labelDetail={{ text: 'Short summary', required: false }}
              />

              <Box>
                <Typography
                  fontSize={12.5}
                  fontWeight={600}
                  color={colors.grey[700]}
                  mb={0.75}
                >
                  Body
                </Typography>
                <Box
                  sx={{
                    border: `1px solid ${
                      formik.touched.content && formik.errors.content
                        ? colors.red[400]
                        : colors.grey[200]
                    }`,
                    borderRadius: 2,
                    overflow: 'hidden',
                  }}
                >
                  <TinyMceEditor
                    value={formik.values.content}
                    onChange={(value) => formik.setFieldValue('content', value)}
                    onBlur={() => formik.setFieldTouched('content', true)}
                    placeholder="Write what the school needs to know …"
                  />
                </Box>
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  mt={0.5}
                >
                  <Typography
                    fontSize={11.5}
                    color={
                      formik.touched.content && formik.errors.content
                        ? colors.red[500]
                        : colors.grey[500]
                    }
                  >
                    {formik.touched.content && formik.errors.content
                      ? String(formik.errors.content)
                      : 'Rich text is supported — tables, links and lists.'}
                  </Typography>
                  <Typography fontSize={11.5} color={colors.grey[500]}>
                    {bodyLength} characters
                  </Typography>
                </Stack>
              </Box>

              <InputField
                name="external_url"
                placeholder="https://…"
                value={formik.values.external_url}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                helperText="Optional. Adds a “Read more” link to the notice."
                labelDetail={{ text: 'External link', required: false }}
                size="small"
              />
            </Stack>
          </Box>

          <Box
            sx={{
              bgcolor: '#fff',
              border: `1px solid ${colors.grey[200]}`,
              borderRadius: 2.5,
              p: 2.5,
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1} mb={2}>
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: 1.5,
                  display: 'grid',
                  placeItems: 'center',
                  bgcolor: colors.purple[50],
                  color: colors.purple[600],
                }}
              >
                <Users size={15} />
              </Box>
              <Typography
                fontSize={14}
                fontWeight={700}
                color={colors.grey[900]}
              >
                Audience
              </Typography>
            </Stack>

            <AnnouncementAudienceSelector
              value={formik.values.audience}
              onChange={(audience) =>
                formik.setFieldValue('audience', audience)
              }
              targets={detail?.targets_details ?? []}
              error={
                formik.touched.audience
                  ? (formik.errors.audience as string)
                  : ''
              }
            />
          </Box>
        </Stack>

        <Stack spacing={2}>
          <Box sx={cardSx}>
            <Stack direction="row" alignItems="center" spacing={1} mb={2}>
              <Box
                sx={{
                  ...sectionTitleSx,
                  bgcolor: colors.blue[50],
                  color: colors.blue[600],
                }}
              >
                <CalendarClock size={15} />
              </Box>
              <Typography
                fontSize={14}
                fontWeight={700}
                color={colors.grey[900]}
              >
                Publishing
              </Typography>
            </Stack>

            <Stack spacing={1.75}>
              {!isEdit ? (
                <Box>
                  <Typography
                    fontSize={12}
                    fontWeight={600}
                    color={colors.grey[700]}
                    mb={0.75}
                  >
                    Status
                  </Typography>
                  <SelectField
                    placeholder="Select status"
                    options={STATUS_OPTIONS}
                    value={findOption(STATUS_OPTIONS, formik.values.status)}
                    onChange={(option) =>
                      formik.setFieldValue(
                        'status',
                        (option as { value: CreateStatus } | null)?.value ??
                          'draft'
                      )
                    }
                    styles={controlStyles}
                  />
                  <Typography fontSize={11.5} color={colors.grey[500]} mt={0.5}>
                    {statusHint}
                  </Typography>
                </Box>
              ) : null}

              <Box>
                <Typography
                  fontSize={12}
                  fontWeight={600}
                  color={colors.grey[700]}
                  mb={0.75}
                >
                  Category
                </Typography>
                <SelectField
                  placeholder="Select category"
                  options={ANNOUNCEMENT_CATEGORY_OPTIONS}
                  value={findOption(
                    ANNOUNCEMENT_CATEGORY_OPTIONS,
                    formik.values.category
                  )}
                  onChange={(option) =>
                    formik.setFieldValue(
                      'category',
                      (option as { value: Announcement.Category } | null)
                        ?.value ?? 'general'
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
                  Priority
                </Typography>
                <SelectField
                  placeholder="Select priority"
                  options={ANNOUNCEMENT_PRIORITY_OPTIONS}
                  value={findOption(
                    ANNOUNCEMENT_PRIORITY_OPTIONS,
                    formik.values.priority
                  )}
                  onChange={(option) =>
                    formik.setFieldValue(
                      'priority',
                      (option as { value: Announcement.Priority } | null)
                        ?.value ?? 'normal'
                    )
                  }
                  styles={controlStyles}
                />
              </Box>

              <Divider sx={{ my: 0.25 }} />

              <Box>
                <Typography
                  fontSize={12}
                  fontWeight={600}
                  color={colors.grey[700]}
                  mb={0.75}
                >
                  Publish date
                </Typography>
                <Stack direction="row" spacing={1}>
                  <Box sx={{ flex: 1 }}>
                    <CustomDatePicker
                      views={['day', 'month', 'year']}
                      onChange={(value) => {
                        formik.setFieldValue(
                          'publish_date',
                          value && moment(value).isValid()
                            ? moment(value).format('YYYY-MM-DD')
                            : ''
                        )
                      }}
                      textFieldProps={{
                        value: formik.values.publish_date
                          ? moment(formik.values.publish_date)
                          : null,
                        size: 'small',
                        error: Boolean(
                          formik.touched.publish_date &&
                            formik.errors.publish_date
                        ),
                        helperText:
                          formik.touched.publish_date &&
                          formik.errors.publish_date
                            ? String(formik.errors.publish_date)
                            : '',
                      }}
                    />
                  </Box>
                  <Box sx={{ width: 116 }}>
                    <InputField
                      type="time"
                      name="publish_time"
                      value={formik.values.publish_time}
                      onChange={formik.handleChange}
                      size="small"
                    />
                  </Box>
                </Stack>
              </Box>

              <Box>
                <Typography
                  fontSize={12}
                  fontWeight={600}
                  color={colors.grey[700]}
                  mb={0.75}
                >
                  Expires on
                </Typography>
                <Stack direction="row" spacing={1}>
                  <Box sx={{ flex: 1 }}>
                    <CustomDatePicker
                      views={['day', 'month', 'year']}
                      onChange={(value) => {
                        formik.setFieldValue(
                          'expires_date',
                          value && moment(value).isValid()
                            ? moment(value).format('YYYY-MM-DD')
                            : ''
                        )
                      }}
                      textFieldProps={{
                        value: formik.values.expires_date
                          ? moment(formik.values.expires_date)
                          : null,
                        size: 'small',
                        placeholder: 'No expiry',
                      }}
                    />
                  </Box>
                  <Box sx={{ width: 116 }}>
                    <InputField
                      type="time"
                      name="expires_time"
                      value={formik.values.expires_time}
                      onChange={formik.handleChange}
                      size="small"
                      disabled={!formik.values.expires_date}
                    />
                  </Box>
                </Stack>
                <Typography fontSize={11.5} color={colors.grey[500]} mt={0.5}>
                  Leave empty if the notice should stay on the board.
                </Typography>
              </Box>

              <Divider sx={{ my: 0.25 }} />

              <Stack
                direction="row"
                alignItems="flex-start"
                justifyContent="space-between"
                spacing={1.5}
              >
                <Stack direction="row" spacing={1} alignItems="flex-start">
                  <Pin
                    size={14}
                    color={colors.grey[500]}
                    style={{ marginTop: 2 }}
                  />
                  <Box>
                    <Typography
                      fontSize={12.5}
                      fontWeight={600}
                      color={colors.grey[800]}
                    >
                      Pin to top
                    </Typography>
                    <Typography fontSize={11.5} color={colors.grey[500]}>
                      Keeps the notice above the regular ones.
                    </Typography>
                  </Box>
                </Stack>
                <CustomSwitch
                  checked={formik.values.is_pinned}
                  onChange={(event) =>
                    formik.setFieldValue('is_pinned', event.target.checked)
                  }
                />
              </Stack>

              <Stack
                direction="row"
                alignItems="flex-start"
                justifyContent="space-between"
                spacing={1.5}
              >
                <Stack direction="row" spacing={1} alignItems="flex-start">
                  <Info
                    size={14}
                    color={colors.grey[500]}
                    style={{ marginTop: 2 }}
                  />
                  <Box>
                    <Typography
                      fontSize={12.5}
                      fontWeight={600}
                      color={colors.grey[800]}
                    >
                      Require acknowledgement
                    </Typography>
                    <Typography fontSize={11.5} color={colors.grey[500]}>
                      Recipients must confirm they have read it.
                    </Typography>
                  </Box>
                </Stack>
                <CustomSwitch
                  checked={formik.values.require_acknowledgement}
                  onChange={(event) =>
                    formik.setFieldValue(
                      'require_acknowledgement',
                      event.target.checked
                    )
                  }
                />
              </Stack>

              <ButtonComp
                fullWidth
                loading={saving}
                disabled={isLocked}
                onClick={() => formik.handleSubmit()}
              >
                {isEdit ? 'Save changes' : 'Create notice'}
              </ButtonComp>
            </Stack>
          </Box>

          <Box
            sx={{
              ...cardSx,
              background:
                'linear-gradient(135deg, rgba(36,99,235,0.07), rgba(99,102,241,0.05))',
              border: `1px solid ${colors.blue[100]}`,
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1} mb={1}>
              <Megaphone size={15} color={colors.blue[600]} />
              <Typography
                fontSize={13.5}
                fontWeight={700}
                color={colors.grey[900]}
              >
                Before you publish
              </Typography>
            </Stack>
            <Stack spacing={1}>
              {[
                'Drafts stay in the board until you publish or schedule them.',
                'A scheduled notice goes live automatically on its publish date.',
                'Pinning keeps urgent notices at the top of the feed.',
                'Every published notice creates a receipt for each recipient.',
              ].map((tip) => (
                <Stack
                  key={tip}
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
                    {tip}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </Box>
        </Stack>
      </Box>
    </Box>
  )
}
