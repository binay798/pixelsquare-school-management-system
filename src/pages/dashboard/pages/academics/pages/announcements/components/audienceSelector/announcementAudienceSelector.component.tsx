import { Box, Stack, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { Info, Users } from 'lucide-react'
import { InputField } from '@src/components/input/input.component'
import { SelectField } from '@src/components/select/select.component'
import { colors } from '@src/helpers/colors.helpers'
import {
  ANNOUNCEMENT_AUDIENCE_TYPE_META,
  AUDIENCE_TYPE_FILTER_OPTIONS,
  loadClassOptions,
  loadSectionOptions,
  loadStudentOptions,
  loadTeacherOptions,
  ROLE_AUDIENCE_OPTIONS,
  SelectOption,
} from '../../announcements.helpers'

type RoleOption = { label: string; value: string }

interface Props {
  value: Announcement.IAudience
  onChange: (audience: Announcement.IAudience) => void
  /** target rows of an existing notice, used to resolve the labels of ids */
  targets?: Announcement.ITarget[]
  error?: string
}

const controlStyles = {
  control: (base: Record<string, unknown>) => ({
    ...base,
    minHeight: 38,
    fontSize: 13.5,
  }),
}

const asOptions = (
  ids: number[] | undefined,
  options: SelectOption[]
): SelectOption[] =>
  (ids ?? []).map(
    (id) =>
      options.find((option) => option.value === id) ?? {
        label: `#${id}`,
        value: id,
      }
  )

export function AnnouncementAudienceSelector({
  value,
  onChange,
  targets = [],
  error,
}: Props) {
  const [classOptions, setClassOptions] = useState<SelectOption[]>([])
  const [teacherOptions, setTeacherOptions] = useState<SelectOption[]>([])
  const [studentOptions, setStudentOptions] = useState<SelectOption[]>([])
  const [sectionOptions, setSectionOptions] = useState<SelectOption[]>([])
  const [sectionClassId, setSectionClassId] = useState<number | null>(
    targets.find((target) => target.target_type === 'section')?.class_id ?? null
  )
  const [studentSearch, setStudentSearch] = useState('')
  const [userIdsText, setUserIdsText] = useState(
    (value.user_ids ?? []).join(', ')
  )

  useEffect(() => {
    loadClassOptions()
      .then(setClassOptions)
      .catch(() => setClassOptions([]))
    loadTeacherOptions()
      .then(setTeacherOptions)
      .catch(() => setTeacherOptions([]))
  }, [])

  useEffect(() => {
    loadStudentOptions()
      .then(setStudentOptions)
      .catch(() => setStudentOptions([]))
  }, [])

  useEffect(() => {
    if (!sectionClassId) {
      setSectionOptions([])

      return
    }
    loadSectionOptions(sectionClassId)
      .then(setSectionOptions)
      .catch(() => setSectionOptions([]))
  }, [sectionClassId])

  const handleStudentSearch = (text: string) => {
    setStudentSearch(text)
    loadStudentOptions(text)
      .then(setStudentOptions)
      .catch(() => setStudentOptions([]))
  }

  const meta = ANNOUNCEMENT_AUDIENCE_TYPE_META[value.type]

  return (
    <Stack spacing={2}>
      <Box>
        <Typography
          fontSize={13}
          fontWeight={600}
          color={colors.grey[800]}
          mb={1}
        >
          Audience
        </Typography>
        <SelectField
          options={AUDIENCE_TYPE_FILTER_OPTIONS}
          value={
            AUDIENCE_TYPE_FILTER_OPTIONS.find(
              (option) => option.value === value.type
            ) ?? null
          }
          onChange={(option) =>
            onChange({
              type:
                (option as { value: Announcement.AudienceType } | null)
                  ?.value ?? 'school',
            })
          }
          styles={controlStyles}
        />
        {error ? (
          <Typography fontSize={11.5} color={colors.red[600]} mt={0.75}>
            {error}
          </Typography>
        ) : null}
      </Box>

      <Stack
        direction="row"
        spacing={1}
        alignItems="flex-start"
        sx={{
          p: 1.25,
          borderRadius: 2,
          bgcolor: colors.blue[50],
          border: `1px solid ${colors.blue[100]}`,
        }}
      >
        <Info size={14} color={colors.blue[600]} style={{ marginTop: 2 }} />
        <Typography fontSize={12} color={colors.blue[800]} lineHeight={1.6}>
          <strong>{meta.label}</strong> · {meta.hint}
        </Typography>
      </Stack>

      {value.type === 'school' ? (
        <Stack direction="row" spacing={1} alignItems="center">
          <Users size={15} color={colors.green[600]} />
          <Typography fontSize={12.5} color={colors.grey[700]}>
            Every active member of the school will receive this notice.
          </Typography>
        </Stack>
      ) : null}

      {value.type === 'role' ? (
        <SelectField
          isMulti
          placeholder="Select the roles that must see the notice"
          options={ROLE_AUDIENCE_OPTIONS}
          value={ROLE_AUDIENCE_OPTIONS.filter((option) =>
            (value.roles ?? []).includes(option.value)
          )}
          onChange={(selected) =>
            onChange({
              type: 'role',
              roles: ((selected ?? []) as RoleOption[]).map(
                (option) => option.value
              ),
            })
          }
          styles={controlStyles}
        />
      ) : null}

      {value.type === 'class' ? (
        <SelectField
          isMulti
          placeholder="Select the classes"
          options={classOptions}
          value={asOptions(value.class_ids, classOptions)}
          onChange={(selected) =>
            onChange({
              type: 'class',
              class_ids: ((selected ?? []) as SelectOption[]).map(
                (option) => option.value
              ),
            })
          }
          styles={controlStyles}
        />
      ) : null}

      {value.type === 'section' ? (
        <Stack spacing={1.5}>
          <SelectField
            placeholder="Select the class of the section"
            options={classOptions}
            value={
              classOptions.find((option) => option.value === sectionClassId) ??
              null
            }
            onChange={(option) => {
              const classId = (option as SelectOption | null)?.value ?? null
              setSectionClassId(classId)
              onChange({ type: 'section', class_section_ids: [] })
            }}
            styles={controlStyles}
          />
          <SelectField
            isMulti
            isDisabled={!sectionClassId}
            placeholder={
              sectionClassId
                ? 'Select the sections'
                : 'Pick a class first to load its sections'
            }
            options={sectionOptions}
            value={asOptions(value.class_section_ids, sectionOptions)}
            onChange={(selected) =>
              onChange({
                type: 'section',
                class_section_ids: ((selected ?? []) as SelectOption[]).map(
                  (option) => option.value
                ),
              })
            }
            styles={controlStyles}
          />
        </Stack>
      ) : null}

      {value.type === 'student' ? (
        <Stack spacing={1.5}>
          <InputField
            placeholder="Search a student by name, admission number or guardian"
            value={studentSearch}
            onChange={(event) => handleStudentSearch(event.target.value)}
          />
          <SelectField
            isMulti
            placeholder="Select the students"
            options={studentOptions}
            value={asOptions(value.student_ids, studentOptions)}
            onChange={(selected) =>
              onChange({
                type: 'student',
                student_ids: ((selected ?? []) as SelectOption[]).map(
                  (option) => option.value
                ),
              })
            }
            styles={controlStyles}
          />
        </Stack>
      ) : null}

      {value.type === 'teacher' ? (
        <SelectField
          isMulti
          placeholder="Select the teachers"
          options={teacherOptions}
          value={asOptions(value.teacher_ids, teacherOptions)}
          onChange={(selected) =>
            onChange({
              type: 'teacher',
              teacher_ids: ((selected ?? []) as SelectOption[]).map(
                (option) => option.value
              ),
            })
          }
          styles={controlStyles}
        />
      ) : null}

      {value.type === 'user' ? (
        <Box>
          <InputField
            placeholder="Comma separated user ids, e.g. 12, 45"
            value={userIdsText}
            onChange={(event) => {
              const text = event.target.value
              setUserIdsText(text)
              onChange({
                type: 'user',
                user_ids: text
                  .split(',')
                  .map((id) => Number(id.trim()))
                  .filter((id) => Number.isFinite(id) && id > 0),
              })
            }}
          />
          <Typography fontSize={11.5} color={colors.grey[500]} mt={0.75}>
            Target single accounts by their user id. Prefer roles, classes or
            sections for day to day notices.
          </Typography>
        </Box>
      ) : null}
    </Stack>
  )
}
