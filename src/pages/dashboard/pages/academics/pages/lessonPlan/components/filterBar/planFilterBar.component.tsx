import { Box, Divider, InputAdornment, Stack, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { RotateCcw, Search, SlidersHorizontal } from 'lucide-react'
import moment from 'moment'
import { ButtonComp } from '@src/components/button/button.component'
import { InputField } from '@src/components/input/input.component'
import { CustomDatePicker } from '@src/components/datePicker/datePicker.component'
import { SelectField } from '@src/components/select/select.component'
import { colors } from '@src/helpers/colors.helpers'
import { useDebounceValue } from '@src/hooks/useDebounceValue.hooks'
import { ILessonPlanFilters } from '@src/store/redux/dashboard/academics/lessonPlans/lessonPlans.service'
import {
  loadClassOptions,
  loadSectionOptions,
  loadSubjectOptions,
  loadTeacherOptions,
  PLAN_TYPE_OPTIONS,
  SelectOption,
  STATUS_FILTER_OPTIONS,
} from '../../lessonPlan.helpers'

interface Props {
  filters: ILessonPlanFilters
  onChange: (next: ILessonPlanFilters) => void
  showTeacherFilter?: boolean
}

const controlStyles = {
  control: (base: Record<string, unknown>) => ({
    ...base,
    minHeight: 36,
    fontSize: 13,
  }),
}

export function PlanFilterBar({
  filters,
  onChange,
  showTeacherFilter = false,
}: Props) {
  const [classOptions, setClassOptions] = useState<SelectOption[]>([])
  const [sectionOptions, setSectionOptions] = useState<SelectOption[]>([])
  const [subjectOptions, setSubjectOptions] = useState<SelectOption[]>([])
  const [teacherOptions, setTeacherOptions] = useState<SelectOption[]>([])
  const [searchText, setSearchText] = useState(filters.search ?? '')
  const debouncedSearch = useDebounceValue(searchText, 400)

  useEffect(() => {
    loadClassOptions()
      .then(setClassOptions)
      .catch(() => setClassOptions([]))
    if (showTeacherFilter) {
      loadTeacherOptions()
        .then(setTeacherOptions)
        .catch(() => setTeacherOptions([]))
    }
  }, [showTeacherFilter])

  useEffect(() => {
    setSearchText(filters.search ?? '')
  }, [filters.search])

  useEffect(() => {
    const current = filters.search ?? ''
    if (debouncedSearch.trim() !== current) {
      onChange({ ...filters, search: debouncedSearch.trim() })
    }
  }, [debouncedSearch])

  useEffect(() => {
    if (!filters.classId) {
      setSectionOptions([])
      setSubjectOptions([])

      return
    }
    loadSectionOptions(filters.classId)
      .then(setSectionOptions)
      .catch(() => setSectionOptions([]))
    loadSubjectOptions(filters.classId)
      .then(setSubjectOptions)
      .catch(() => setSubjectOptions([]))
  }, [filters.classId])

  const findOption = (options: SelectOption[], value?: number) =>
    options.find((option) => option.value === value) ?? null

  const hasActiveFilters = Boolean(
    filters.classId ||
      filters.classSectionId ||
      filters.subjectId ||
      filters.teacherId ||
      filters.status ||
      filters.planType ||
      filters.fromDate ||
      filters.toDate ||
      filters.search
  )

  return (
    <Box
      sx={{
        borderRadius: 3,
        border: `1px solid ${colors.grey[200]}`,
        bgcolor: '#fff',
        p: 1.75,
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1} mb={1.25}>
        <SlidersHorizontal size={15} color={colors.grey[500]} />
        <Typography fontSize={12} fontWeight={700} color={colors.grey[600]}>
          Filters
        </Typography>
        {hasActiveFilters ? (
          <ButtonComp
            size="small"
            variant="text"
            startIcon={<RotateCcw size={13} />}
            onClick={() => onChange({ status: '', planType: '', search: '' })}
            sx={{ fontSize: 11, ml: 'auto' }}
          >
            Reset
          </ButtonComp>
        ) : null}
      </Stack>

      <Divider sx={{ mb: 1.5 }} />

      <Box
        sx={{
          display: 'grid',
          gap: 1.25,
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, minmax(0, 1fr))',
            lg: 'repeat(4, minmax(0, 1fr))',
            xl: 'repeat(6, minmax(0, 1fr))',
          },
        }}
      >
        <SelectField
          placeholder="All classes"
          options={classOptions}
          isClearable
          value={findOption(classOptions, filters.classId)}
          onChange={(option) => {
            onChange({
              ...filters,
              classId: (option as SelectOption | null)?.value,
              classSectionId: undefined,
              subjectId: undefined,
            })
          }}
          styles={controlStyles}
        />
        <SelectField
          placeholder="All sections"
          options={sectionOptions}
          isClearable
          isDisabled={!filters.classId}
          value={findOption(sectionOptions, filters.classSectionId)}
          onChange={(option) =>
            onChange({
              ...filters,
              classSectionId: (option as SelectOption | null)?.value,
            })
          }
          styles={controlStyles}
        />
        <SelectField
          placeholder="All subjects"
          options={subjectOptions}
          isClearable
          isDisabled={!filters.classId}
          value={findOption(subjectOptions, filters.subjectId)}
          onChange={(option) =>
            onChange({
              ...filters,
              subjectId: (option as SelectOption | null)?.value,
            })
          }
          styles={controlStyles}
        />
        <SelectField
          placeholder="Any status"
          options={STATUS_FILTER_OPTIONS}
          isClearable
          value={
            STATUS_FILTER_OPTIONS.find(
              (option) => option.value === filters.status
            ) ?? null
          }
          onChange={(option) =>
            onChange({
              ...filters,
              status:
                (option as { value: LessonPlan.Status } | null)?.value ?? '',
            })
          }
          styles={controlStyles}
        />
        {showTeacherFilter ? (
          <SelectField
            placeholder="All teachers"
            options={teacherOptions}
            isClearable
            value={findOption(teacherOptions, filters.teacherId)}
            onChange={(option) =>
              onChange({
                ...filters,
                teacherId: (option as SelectOption | null)?.value,
              })
            }
            styles={controlStyles}
          />
        ) : null}
        <SelectField
          placeholder="Daily / weekly"
          options={PLAN_TYPE_OPTIONS}
          isClearable
          value={
            PLAN_TYPE_OPTIONS.find(
              (option) => option.value === filters.planType
            ) ?? null
          }
          onChange={(option) =>
            onChange({
              ...filters,
              planType:
                (option as { value: LessonPlan.PlanType } | null)?.value ?? '',
            })
          }
          styles={controlStyles}
        />
      </Box>

      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={1.25}
        mt={1.25}
        alignItems={{ xs: 'stretch', md: 'flex-end' }}
      >
        <Box sx={{ width: { xs: '100%', md: 190 } }}>
          <CustomDatePicker
            views={['day', 'month', 'year']}
            labelDetail={{ text: 'From date', required: false }}
            onChange={(value) =>
              onChange({
                ...filters,
                fromDate:
                  value && moment(value).isValid()
                    ? moment(value).format('YYYY-MM-DD')
                    : undefined,
              })
            }
            textFieldProps={{
              value: filters.fromDate ? moment(filters.fromDate) : null,
              size: 'small',
            }}
          />
        </Box>
        <Box sx={{ width: { xs: '100%', md: 190 } }}>
          <CustomDatePicker
            views={['day', 'month', 'year']}
            labelDetail={{ text: 'To date', required: false }}
            onChange={(value) =>
              onChange({
                ...filters,
                toDate:
                  value && moment(value).isValid()
                    ? moment(value).format('YYYY-MM-DD')
                    : undefined,
              })
            }
            textFieldProps={{
              value: filters.toDate ? moment(filters.toDate) : null,
              size: 'small',
            }}
          />
        </Box>
        <Box flex={1} minWidth={200}>
          <InputField
            placeholder="Search by title or objectives"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            startAdornment={
              <InputAdornment position="start">
                <Search size={16} color={colors.grey[500]} />
              </InputAdornment>
            }
          />
        </Box>
      </Stack>
    </Box>
  )
}
