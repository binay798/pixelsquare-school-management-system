import { Box, CircularProgress, Stack, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, BookOpen, CheckCircle2, Clock, Layers } from 'lucide-react'
import { ButtonComp } from '@src/components/button/button.component'
import { SelectField } from '@src/components/select/select.component'
import { colors } from '@src/helpers/colors.helpers'
import { useDispatch, useSelector } from '@src/store/hooks.store'
import { getSyllabusCompletionAction } from '@src/store/redux/dashboard/academics/lessonPlans/lessonPlans.slice'
import {
  loadClassOptions,
  loadSectionOptions,
  loadSubjectOptions,
  SelectOption,
} from '../../lessonPlan.helpers'

const BASE_PATH = '/dashboard/academics/lesson-plan'

const controlStyles = {
  control: (base: Record<string, unknown>) => ({
    ...base,
    minHeight: 38,
    fontSize: 13.5,
  }),
}

export function SyllabusCompletionPage() {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const { data: report, loading } = useSelector(
    (store) => store.lessonPlans.syllabusCompletion
  )

  const [classOptions, setClassOptions] = useState<SelectOption[]>([])
  const [sectionOptions, setSectionOptions] = useState<SelectOption[]>([])
  const [subjectOptions, setSubjectOptions] = useState<SelectOption[]>([])
  const [classId, setClassId] = useState<number | undefined>()
  const [sectionId, setSectionId] = useState<number | undefined>()
  const [subjectId, setSubjectId] = useState<number | undefined>()

  useEffect(() => {
    loadClassOptions()
      .then((options) => {
        setClassOptions(options)
        setClassId((prev) => prev ?? options[0]?.value)
      })
      .catch(() => setClassOptions([]))
  }, [])

  useEffect(() => {
    if (!classId) {
      return
    }
    loadSectionOptions(classId)
      .then((options) => {
        setSectionOptions(options)
        setSectionId((prev) =>
          options.some((option) => option.value === prev)
            ? prev
            : options[0]?.value
        )
      })
      .catch(() => setSectionOptions([]))
    loadSubjectOptions(classId)
      .then((options) => {
        setSubjectOptions(options)
        setSubjectId((prev) =>
          options.some((option) => option.value === prev)
            ? prev
            : options[0]?.value
        )
      })
      .catch(() => setSubjectOptions([]))
  }, [classId])

  useEffect(() => {
    if (!sectionId || !subjectId) {
      return
    }
    dispatch(
      getSyllabusCompletionAction({
        classSectionId: sectionId,
        subjectId,
      })
    )
  }, [dispatch, sectionId, subjectId])

  const percentage = report?.completion_percentage ?? 0
  const chapters = report?.chapters ?? []
  const findOption = (options: SelectOption[], value?: number) =>
    options.find((option) => option.value === value) ?? null

  return (
    <Box>
      <Stack direction="row" spacing={1.25} alignItems="center" mb={3}>
        <ButtonComp
          size="small"
          variant="outlined"
          onClick={() => navigate(BASE_PATH)}
          sx={{ minWidth: 36, px: 1 }}
        >
          <ArrowLeft size={16} />
        </ButtonComp>
        <Box>
          <Typography variant="h6" fontWeight={700} color={colors.grey[900]}>
            Syllabus completion
          </Typography>
          <Typography fontSize={12.5} color={colors.grey[600]} mt={0.25}>
            Topics already covered through the lesson plans of a subject.
          </Typography>
        </Box>
      </Stack>

      <Box
        sx={{
          borderRadius: 3,
          border: `1px solid ${colors.grey[200]}`,
          bgcolor: '#fff',
          p: 2,
          mb: 2,
        }}
      >
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
              value={findOption(classOptions, classId)}
              onChange={(option) =>
                setClassId((option as SelectOption | null)?.value)
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
              isDisabled={!classId}
              value={findOption(sectionOptions, sectionId)}
              onChange={(option) =>
                setSectionId((option as SelectOption | null)?.value)
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
              isDisabled={!classId}
              value={findOption(subjectOptions, subjectId)}
              onChange={(option) =>
                setSubjectId((option as SelectOption | null)?.value)
              }
              styles={controlStyles}
            />
          </Box>
        </Box>
      </Box>

      {loading && !report ? (
        <Stack alignItems="center" py={8} spacing={1.5}>
          <CircularProgress size={24} />
          <Typography fontSize={12.5} color={colors.grey[500]}>
            Calculating syllabus coverage...
          </Typography>
        </Stack>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gap: 2,
            gridTemplateColumns: {
              xs: '1fr',
              lg: 'minmax(0, 320px) minmax(0, 1fr)',
            },
            alignItems: 'start',
          }}
        >
          <Box
            sx={{
              borderRadius: 3,
              border: `1px solid ${colors.grey[200]}`,
              bgcolor: '#fff',
              p: 2.5,
              textAlign: 'center',
            }}
          >
            <ProgressRing percentage={percentage} />
            <Typography
              fontSize={13}
              fontWeight={700}
              color={colors.grey[800]}
              mt={1.5}
            >
              Syllabus covered
            </Typography>
            <Typography fontSize={11.5} color={colors.grey[500]}>
              Based on the topics attached to lesson plans
            </Typography>

            <Stack
              direction="row"
              spacing={1}
              justifyContent="center"
              flexWrap="wrap"
              gap={1}
              mt={2}
            >
              <StatPill
                icon={<Layers size={13} />}
                label="Total"
                value={report?.total_topics ?? 0}
                color={colors.blue[600]}
                bg={colors.blue[50]}
              />
              <StatPill
                icon={<CheckCircle2 size={13} />}
                label="Taught"
                value={report?.taught_topics ?? 0}
                color={colors.green[600]}
                bg={colors.green[50]}
              />
              <StatPill
                icon={<Clock size={13} />}
                label="Pending"
                value={report?.pending_topics ?? 0}
                color={colors.orange[700]}
                bg={colors.orange[50]}
              />
            </Stack>
          </Box>

          <Box
            sx={{
              borderRadius: 3,
              border: `1px solid ${colors.grey[200]}`,
              bgcolor: '#fff',
              p: 2.5,
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1} mb={2}>
              <BookOpen size={16} color={colors.blue[600]} />
              <Typography
                fontSize={14.5}
                fontWeight={700}
                color={colors.grey[900]}
              >
                Chapter breakdown
              </Typography>
            </Stack>

            {chapters.length === 0 ? (
              <Typography fontSize={12.5} color={colors.grey[500]}>
                No chapters found for this subject yet.
              </Typography>
            ) : (
              <Stack spacing={1.75}>
                {chapters.map((chapter) => (
                  <Box key={chapter.chapter_id}>
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                      mb={0.5}
                    >
                      <Typography
                        fontSize={12.5}
                        fontWeight={600}
                        color={colors.grey[800]}
                      >
                        Ch {chapter.chapter_number} · {chapter.chapter_name}
                      </Typography>
                      <Typography fontSize={11.5} color={colors.grey[500]}>
                        {chapter.taught_topics}/{chapter.total_topics} topics ·{' '}
                        {chapter.completion_percentage}%
                      </Typography>
                    </Stack>
                    <Box
                      sx={{
                        height: 8,
                        borderRadius: 999,
                        bgcolor: colors.grey[100],
                        overflow: 'hidden',
                      }}
                    >
                      <Box
                        sx={{
                          width: `${Math.min(
                            chapter.completion_percentage,
                            100
                          )}%`,
                          height: '100%',
                          borderRadius: 999,
                          background:
                            chapter.completion_percentage >= 100
                              ? `linear-gradient(90deg, ${colors.green[400]}, ${colors.green[600]})`
                              : `linear-gradient(90deg, ${colors.blue[400]}, ${colors.indigo[500]})`,
                          transition: 'width 0.4s ease',
                        }}
                      />
                    </Box>
                  </Box>
                ))}
              </Stack>
            )}
          </Box>
        </Box>
      )}
    </Box>
  )
}

function ProgressRing({ percentage }: { percentage: number }) {
  const size = 168
  const stroke = 14
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const clamped = Math.min(Math.max(percentage, 0), 100)
  const offset = circumference - (clamped / 100) * circumference

  return (
    <Box sx={{ position: 'relative', width: size, height: size, mx: 'auto' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={colors.grey[100]}
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={clamped >= 100 ? colors.green[500] : colors.blue[600]}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <Stack
        alignItems="center"
        justifyContent="center"
        sx={{ position: 'absolute', inset: 0 }}
      >
        <Typography fontSize={30} fontWeight={700} color={colors.grey[900]}>
          {clamped}%
        </Typography>
        <Typography fontSize={11} color={colors.grey[500]}>
          completed
        </Typography>
      </Stack>
    </Box>
  )
}

function StatPill({
  icon,
  label,
  value,
  color,
  bg,
}: {
  icon: JSX.Element
  label: string
  value: number
  color: string
  bg: string
}) {
  return (
    <Stack
      direction="row"
      spacing={0.75}
      alignItems="center"
      sx={{ px: 1.25, py: 0.75, borderRadius: 2, bgcolor: bg, color }}
    >
      {icon}
      <Typography fontSize={11.5} fontWeight={600}>
        {label}
      </Typography>
      <Typography fontSize={12.5} fontWeight={700}>
        {value}
      </Typography>
    </Stack>
  )
}
