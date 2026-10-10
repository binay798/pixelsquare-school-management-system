import {
  Box,
  Card,
  Chip,
  Collapse,
  FormControl,
  FormLabel,
  IconButton,
  Stack,
  Typography,
} from '@mui/material'
import { ButtonComp } from '@src/components/button/button.component'
import { DeleteConfirmationModal } from '@src/components/confirmationModal/deleteConfirmationModal.component'
import { SelectField } from '@src/components/select/select.component'
import { colors } from '@src/helpers/colors.helpers'
import { useFormik } from 'formik'
import { useState } from 'react'
import { BiTargetLock } from 'react-icons/bi'
import { BsThreeDots } from 'react-icons/bs'
import { FaFilePdf, FaImage, FaRocket } from 'react-icons/fa'
import { FiPaperclip, FiTrash2, FiUploadCloud } from 'react-icons/fi'
import { GoChevronDown, GoChevronUp, GoPerson } from 'react-icons/go'
import { HiOutlineBookOpen, HiOutlineCalendar } from 'react-icons/hi'
import { IoWarningOutline } from 'react-icons/io5'
import { useNavigate } from 'react-router-dom'

type SelectOption = { label: string; value: string | number } | null

type DayTab =
  | 'Objectives'
  | 'Topics'
  | 'Activities'
  | 'Homework'
  | 'Attachments'

interface DayPlan {
  id: string
  day: string
  date: string
  status: 'Published' | 'Draft'
  accent: string
  learningObjectives: string
  topicsCovered: string[]
}

const weekRangeOptions = [
  { label: 'Week 1 (01 Jan - 07 Jan)', value: 'week-1' },
  { label: 'Week 2 (08 Jan - 14 Jan)', value: 'week-2' },
  { label: 'Week 3 (15 Jan - 21 Jan)', value: 'week-3' },
  { label: 'Week 4 (22 Jan - 28 Jan)', value: 'week-4' },
]

const overallStatusOptions = [
  { label: 'Draft', value: 'draft' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Completed', value: 'completed' },
  { label: 'Approved', value: 'approved' },
]

const dayTabs: DayTab[] = [
  'Objectives',
  'Topics',
  'Activities',
  'Homework',
  'Attachments',
]

const initialDays: DayPlan[] = [
  {
    id: 'monday',
    day: 'Monday',
    date: 'May 25, 2026',
    status: 'Published',
    accent: colors.blue[500],
    learningObjectives:
      'Students will be able to identify standard quadratic forms and find roots using the factoring method.',
    topicsCovered: [
      'Standard form of quadratic equations: ax² + bx + c = 0',
      'Identifying coefficients a, b, and c.',
      'Basic factoring techniques.',
    ],
  },
  {
    id: 'tuesday',
    day: 'Tuesday',
    date: 'May 26, 2026',
    status: 'Draft',
    accent: colors.purple[500],
    learningObjectives: '',
    topicsCovered: [],
  },
  {
    id: 'wednesday',
    day: 'Wednesday',
    date: 'May 27, 2026',
    status: 'Draft',
    accent: colors.pink[400],
    learningObjectives: '',
    topicsCovered: [],
  },
  {
    id: 'thursday',
    day: 'Thursday',
    date: 'May 28, 2026',
    status: 'Draft',
    accent: colors.orange[400],
    learningObjectives: '',
    topicsCovered: [],
  },
  {
    id: 'friday',
    day: 'Friday',
    date: 'May 29, 2026',
    status: 'Draft',
    accent: colors.teal[500],
    learningObjectives: '',
    topicsCovered: [],
  },
]

const sampleAttachments = [
  {
    id: 1,
    name: 'Factoring_Worksheet_Ch4.pdf',
    size: '1.2 MB',
    type: 'pdf' as const,
  },
  {
    id: 2,
    name: 'Parabola_Graph_Example.png',
    size: '845 KB',
    type: 'image' as const,
  },
]

export function CreateLessonPlanPage() {
  const navigate = useNavigate()
  const [expandedDay, setExpandedDay] = useState<string>('monday')
  const [activeTab, setActiveTab] = useState<DayTab>('Objectives')
  const [attachments, setAttachments] = useState(sampleAttachments)
  const [openDeleteModal, setOpenDeleteModal] = useState(false)

  const formik = useFormik<{
    class: SelectOption
    section: SelectOption
    subject: SelectOption
    teacher: SelectOption
    weekRange: SelectOption
    overallStatus: SelectOption
    chapter: SelectOption
    academicSection: SelectOption
  }>({
    initialValues: {
      class: null,
      section: null,
      subject: null,
      teacher: null,
      weekRange: null,
      overallStatus: null,
      chapter: null,
      academicSection: null,
    },
    onSubmit: () => {},
  })

  const selectFields: {
    name: keyof typeof formik.values
    label: string
    placeholder: string
    options: { label: string; value: string | number }[]
  }[] = [
    {
      name: 'class',
      label: 'Class',
      placeholder: 'Select class',
      options: [],
    },
    {
      name: 'section',
      label: 'Section',
      placeholder: 'Select section',
      options: [],
    },
    {
      name: 'subject',
      label: 'Subject',
      placeholder: 'Select subject',
      options: [],
    },
    {
      name: 'teacher',
      label: 'Teacher',
      placeholder: 'Select teacher',
      options: [],
    },
    {
      name: 'weekRange',
      label: 'Week Range',
      placeholder: 'Select week range',
      options: weekRangeOptions,
    },
    {
      name: 'overallStatus',
      label: 'Overall Status',
      placeholder: 'Select overall status',
      options: overallStatusOptions,
    },
    {
      name: 'chapter',
      label: 'Chapter',
      placeholder: 'Select chapter',
      options: [],
    },
    {
      name: 'academicSection',
      label: 'Academic Section',
      placeholder: 'Select academic section',
      options: [],
    },
  ]

  const toggleDay = (dayId: string) => {
    setExpandedDay((prev) => (prev === dayId ? '' : dayId))
    setActiveTab('Objectives')
  }

  return (
    <Box pb={4}>
      {/* Header */}
      <Box mb={3}>
        <Stack direction="row" spacing={1} mb={1.5}>
          <Chip
            label="CLASS 10-A"
            size="small"
            sx={{
              bgcolor: colors.indigo[50],
              color: colors.indigo[600],
              fontWeight: 600,
              fontSize: 11,
              borderRadius: '999px',
            }}
          />
          <Chip
            label="MATHEMATICS"
            size="small"
            sx={{
              bgcolor: colors.blue[50],
              color: colors.blue[600],
              fontWeight: 600,
              fontSize: 11,
              borderRadius: '999px',
            }}
          />
        </Stack>

        <Typography variant="h5" fontWeight={700} color={colors.grey[900]}>
          Week 15: Introduction to Quadratic Equations
        </Typography>

        <Stack direction="row" spacing={3} mt={1} flexWrap="wrap" useFlexGap>
          <Stack direction="row" spacing={0.75} alignItems="center">
            <HiOutlineCalendar size={16} color={colors.grey[500]} />
            <Typography variant="body2" color={colors.grey[600]}>
              May 25, 2026 – May 29, 2026
            </Typography>
          </Stack>
          <Stack direction="row" spacing={0.75} alignItems="center">
            <GoPerson size={16} color={colors.grey[500]} />
            <Typography variant="body2" color={colors.grey[600]}>
              Binay Shrestha
            </Typography>
          </Stack>
        </Stack>
      </Box>

      {/* Existing select fields */}
      <Card
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 2,
          boxShadow: 'none',
          border: `1px solid ${colors.grey[200]}`,
          overflow: 'visible',
        }}
      >
        <form onSubmit={formik.handleSubmit}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={2}
            useFlexGap
            flexWrap="wrap"
          >
            {selectFields.map((field) => (
              <FormControl
                key={field.name}
                required
                sx={{ flex: '1 1 calc(50% - 8px)', minWidth: 220 }}
              >
                <FormLabel
                  sx={{
                    fontSize: 13,
                    mb: 1,
                    color: colors.grey[600],
                  }}
                >
                  {field.label}
                </FormLabel>
                <SelectField
                  placeholder={field.placeholder}
                  options={field.options}
                  value={formik.values[field.name]}
                  onChange={(e) => formik.setFieldValue(field.name, e)}
                />
              </FormControl>
            ))}
          </Stack>
        </form>
      </Card>

      {/* Daily drafting cards */}
      <Stack spacing={2} mb={3}>
        {initialDays.map((day) => {
          const isExpanded = expandedDay === day.id

          return (
            <Card
              key={day.id}
              sx={{
                borderRadius: 2,
                boxShadow: 'none',
                border: `1px solid ${colors.grey[200]}`,
                borderLeft: `4px solid ${day.accent}`,
                overflow: 'hidden',
              }}
            >
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                px={2.5}
                py={2}
                sx={{ cursor: 'pointer' }}
                onClick={() => toggleDay(day.id)}
              >
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Box>
                    <Typography fontWeight={700} color={colors.grey[900]}>
                      {day.day}
                    </Typography>
                    <Typography variant="body2" color={colors.grey[500]}>
                      {day.date}
                    </Typography>
                  </Box>
                  <Chip
                    label={day.status}
                    size="small"
                    sx={{
                      height: 22,
                      fontSize: 11,
                      fontWeight: 600,
                      borderRadius: '999px',
                      ...(day.status === 'Published'
                        ? {
                            bgcolor: colors.green[50],
                            color: colors.green[700],
                          }
                        : {
                            bgcolor: colors.grey[100],
                            color: colors.grey[600],
                          }),
                    }}
                  />
                </Stack>

                <Stack direction="row" spacing={0.5} alignItems="center">
                  <IconButton size="small" onClick={(e) => e.stopPropagation()}>
                    <BsThreeDots size={16} color={colors.grey[500]} />
                  </IconButton>
                  <IconButton size="small">
                    {isExpanded ? (
                      <GoChevronUp size={18} color={colors.grey[600]} />
                    ) : (
                      <GoChevronDown size={18} color={colors.grey[600]} />
                    )}
                  </IconButton>
                </Stack>
              </Stack>

              <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                <Box px={2.5} pb={2.5}>
                  {/* Tabs */}
                  <Stack
                    direction="row"
                    spacing={1}
                    mb={2.5}
                    flexWrap="wrap"
                    useFlexGap
                  >
                    {dayTabs.map((tab) => {
                      const isActive = activeTab === tab
                      return (
                        <Box
                          key={tab}
                          onClick={() => setActiveTab(tab)}
                          sx={{
                            px: 1.75,
                            py: 0.75,
                            borderRadius: 1.5,
                            cursor: 'pointer',
                            bgcolor: isActive ? colors.blue[50] : 'transparent',
                            color: isActive
                              ? colors.blue[700]
                              : colors.grey[600],
                            fontWeight: isActive ? 600 : 500,
                            fontSize: 13,
                            '&:hover': {
                              bgcolor: isActive
                                ? colors.blue[50]
                                : colors.grey[50],
                            },
                          }}
                        >
                          {tab}
                        </Box>
                      )
                    })}
                  </Stack>

                  {activeTab === 'Objectives' && (
                    <Stack spacing={2.5}>
                      <ContentBlock
                        icon={
                          <BiTargetLock size={18} color={colors.blue[600]} />
                        }
                        title="Learning Objectives"
                      >
                        <Typography variant="body2" color={colors.grey[700]}>
                          {day.learningObjectives ||
                            'Add learning objectives for this day...'}
                        </Typography>
                      </ContentBlock>

                      <ContentBlock
                        icon={
                          <HiOutlineBookOpen
                            size={18}
                            color={colors.blue[600]}
                          />
                        }
                        title="Topics Covered"
                      >
                        {day.topicsCovered.length > 0 ? (
                          <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
                            {day.topicsCovered.map((topic) => (
                              <Typography
                                key={topic}
                                component="li"
                                variant="body2"
                                color={colors.grey[700]}
                                mb={0.5}
                              >
                                {topic}
                              </Typography>
                            ))}
                          </Box>
                        ) : (
                          <Typography variant="body2" color={colors.grey[500]}>
                            Add topics covered for this day...
                          </Typography>
                        )}
                      </ContentBlock>
                    </Stack>
                  )}

                  {activeTab === 'Topics' && (
                    <ContentBlock
                      icon={
                        <HiOutlineBookOpen size={18} color={colors.blue[600]} />
                      }
                      title="Topics"
                    >
                      <Typography variant="body2" color={colors.grey[500]}>
                        Drafting area for topics...
                      </Typography>
                    </ContentBlock>
                  )}

                  {activeTab === 'Activities' && (
                    <ContentBlock
                      icon={<BiTargetLock size={18} color={colors.blue[600]} />}
                      title="Activities"
                    >
                      <Typography variant="body2" color={colors.grey[500]}>
                        Drafting area for activities...
                      </Typography>
                    </ContentBlock>
                  )}

                  {activeTab === 'Homework' && (
                    <ContentBlock
                      icon={<FiPaperclip size={16} color={colors.blue[600]} />}
                      title="Homework"
                    >
                      <Typography variant="body2" color={colors.grey[500]}>
                        Drafting area for homework...
                      </Typography>
                    </ContentBlock>
                  )}

                  {activeTab === 'Attachments' && (
                    <AttachmentsSection
                      files={attachments}
                      onRemove={(id) =>
                        setAttachments((prev) =>
                          prev.filter((file) => file.id !== id)
                        )
                      }
                    />
                  )}
                </Box>
              </Collapse>

              {!isExpanded && (
                <Box px={2.5} pb={2.5} pt={0}>
                  <Box
                    sx={{
                      border: `1px solid ${colors.grey[200]}`,
                      borderRadius: 2,
                      bgcolor: '#fff',
                      px: 2,
                      py: 2.5,
                    }}
                  >
                    <Typography variant="body2" color={colors.grey[400]}>
                      Drafting area for {day.day}... Click to expand editors.
                    </Typography>
                  </Box>
                </Box>
              )}
            </Card>
          )
        })}
      </Stack>

      {/* Footer actions */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', sm: 'center' }}
        spacing={2}
        pt={1}
      >
        <ButtonComp
          size="medium"
          variant="text"
          startIcon={<FiTrash2 size={14} />}
          onClick={() => setOpenDeleteModal(true)}
          sx={{
            color: colors.red[500],
            justifyContent: 'flex-start',
            '&:hover': {
              bgcolor: colors.red[50],
              color: colors.red[600],
            },
          }}
        >
          Delete Week Plan
        </ButtonComp>

        <Stack direction="row" spacing={1.5} justifyContent="flex-end">
          <ButtonComp size="medium" variant="outlined" color="secondary">
            Save Draft
          </ButtonComp>
          <ButtonComp
            size="medium"
            startIcon={<FaRocket size={12} />}
            sx={{
              bgcolor: colors.indigo[600],
              '&:hover': { bgcolor: colors.indigo[700] },
            }}
          >
            Publish Plan
          </ButtonComp>
        </Stack>
      </Stack>

      <DeleteConfirmationModal
        open={openDeleteModal}
        onClose={() => setOpenDeleteModal(false)}
        confirmText="Delete"
        onConfirmationClick={() => {
          setOpenDeleteModal(false)
          navigate('/dashboard/academics/lesson-plan')
        }}
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
          <Typography color="error" fontWeight={500}>
            This action is permanent and cannot be undone. Once deleted, the
            week plan will be lost and cannot be recovered
          </Typography>
        </Card>
      </DeleteConfirmationModal>
    </Box>
  )
}

function ContentBlock({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode
  title: string
  children: React.ReactNode
}) {
  return (
    <Box>
      <Stack direction="row" spacing={1} alignItems="center" mb={1}>
        {icon}
        <Typography fontWeight={700} color={colors.grey[800]} fontSize={14}>
          {title}
        </Typography>
      </Stack>
      <Box
        sx={{
          border: `1px solid ${colors.grey[200]}`,
          borderRadius: 2,
          bgcolor: colors.grey[50],
          px: 2,
          py: 1.75,
        }}
      >
        {children}
      </Box>
    </Box>
  )
}

function AttachmentsSection({
  files,
  onRemove,
}: {
  files: typeof sampleAttachments
  onRemove: (id: number) => void
}) {
  return (
    <Box>
      <Stack direction="row" spacing={1} alignItems="center" mb={1.5}>
        <FiPaperclip size={16} color={colors.blue[600]} />
        <Typography fontWeight={700} color={colors.grey[800]} fontSize={14}>
          Attachments
        </Typography>
      </Stack>

      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        alignItems="stretch"
      >
        <Box
          sx={{
            flex: 1,
            border: `1.5px dashed ${colors.blue[200]}`,
            borderRadius: 2,
            bgcolor: colors.blue[50],
            minHeight: 140,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            px: 2,
            '&:hover': { bgcolor: colors.blue[100] },
          }}
        >
          <Stack alignItems="center" spacing={0.75}>
            <FiUploadCloud size={28} color={colors.blue[500]} />
            <Typography fontWeight={600} fontSize={13} color={colors.grey[800]}>
              Click or drag files to upload
            </Typography>
            <Typography variant="caption" color={colors.grey[500]}>
              PDF, DOCX, PPT, JPG up to 10MB
            </Typography>
          </Stack>
        </Box>

        <Stack spacing={1.25} sx={{ flex: 1 }}>
          {files.map((file) => (
            <Stack
              key={file.id}
              direction="row"
              alignItems="center"
              spacing={1.5}
              sx={{
                border: `1px solid ${colors.grey[200]}`,
                borderRadius: 2,
                bgcolor: '#fff',
                px: 1.5,
                py: 1.25,
              }}
            >
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 1.5,
                  bgcolor:
                    file.type === 'pdf' ? colors.red[50] : colors.blue[50],
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {file.type === 'pdf' ? (
                  <FaFilePdf size={16} color={colors.red[500]} />
                ) : (
                  <FaImage size={16} color={colors.blue[500]} />
                )}
              </Box>
              <Box flex={1} minWidth={0}>
                <Typography
                  fontWeight={600}
                  fontSize={13}
                  color={colors.grey[800]}
                  noWrap
                >
                  {file.name}
                </Typography>
                <Typography variant="caption" color={colors.grey[500]}>
                  {file.size}
                </Typography>
              </Box>
              <IconButton size="small" onClick={() => onRemove(file.id)}>
                <FiTrash2 size={14} color={colors.grey[500]} />
              </IconButton>
            </Stack>
          ))}
        </Stack>
      </Stack>
    </Box>
  )
}
