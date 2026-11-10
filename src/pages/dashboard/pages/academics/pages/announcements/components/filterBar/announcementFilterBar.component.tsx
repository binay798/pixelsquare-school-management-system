import { Box, Divider, InputAdornment, Stack, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { RotateCcw, Search, SlidersHorizontal } from 'lucide-react'
import moment from 'moment'
import { ButtonComp } from '@src/components/button/button.component'
import { InputField } from '@src/components/input/input.component'
import { CustomDatePicker } from '@src/components/datePicker/datePicker.component'
import { SelectField } from '@src/components/select/select.component'
import { StylesConfig } from 'react-select'
import { colors } from '@src/helpers/colors.helpers'
import { useDebounceValue } from '@src/hooks/useDebounceValue.hooks'
import { IAnnouncementFilters } from '@src/store/redux/dashboard/academics/announcements/announcements.service'
import {
  ANNOUNCEMENT_CATEGORY_OPTIONS,
  ANNOUNCEMENT_PRIORITY_OPTIONS,
  ANNOUNCEMENT_STATUS_FILTER_OPTIONS,
  AUDIENCE_TYPE_FILTER_OPTIONS,
} from '../../announcements.helpers'

interface Props {
  filters: IAnnouncementFilters
  onChange: (next: IAnnouncementFilters) => void
}

const controlStyles: StylesConfig = {
  control: (base) => ({
    ...base,
    minHeight: 36,
    fontSize: 13,
  }),
}

export function AnnouncementFilterBar({ filters, onChange }: Props) {
  const [searchText, setSearchText] = useState(filters.search ?? '')
  const debouncedSearch = useDebounceValue(searchText, 400)

  useEffect(() => {
    setSearchText(filters.search ?? '')
  }, [filters.search])

  useEffect(() => {
    const current = filters.search ?? ''
    if (debouncedSearch.trim() !== current) {
      onChange({ ...filters, search: debouncedSearch.trim() })
    }
  }, [debouncedSearch])

  const hasActiveFilters = Boolean(
    filters.status ||
      filters.category ||
      filters.priority ||
      filters.audienceType ||
      filters.fromDate ||
      filters.toDate ||
      filters.search
  )

  const reset = () =>
    onChange({
      status: '',
      category: '',
      priority: '',
      audienceType: '',
      search: '',
    })

  return (
    <Box
      sx={{
        borderRadius: 3,
        border: `1px solid ${colors.grey[200]}`,
        bgcolor: '#fff',
        p: 1.75,
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        mb={1.25}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <SlidersHorizontal size={15} color={colors.grey[600]} />
          <Typography fontSize={13} fontWeight={600} color={colors.grey[800]}>
            Filters
          </Typography>
        </Stack>
        {hasActiveFilters ? (
          <ButtonComp
            size="small"
            variant="text"
            startIcon={<RotateCcw size={13} />}
            onClick={reset}
          >
            Clear
          </ButtonComp>
        ) : null}
      </Stack>

      <Box
        sx={{
          display: 'grid',
          gap: 1.25,
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, minmax(0, 1fr))',
            lg: 'repeat(4, minmax(0, 1fr))',
          },
        }}
      >
        <SelectField
          placeholder="All statuses"
          options={ANNOUNCEMENT_STATUS_FILTER_OPTIONS}
          isClearable
          value={
            ANNOUNCEMENT_STATUS_FILTER_OPTIONS.find(
              (option) => option.value === filters.status
            ) ?? null
          }
          onChange={(option) =>
            onChange({
              ...filters,
              status:
                (option as { value: Announcement.Status } | null)?.value ?? '',
            })
          }
          styles={controlStyles}
        />
        <SelectField
          placeholder="All categories"
          options={ANNOUNCEMENT_CATEGORY_OPTIONS}
          isClearable
          value={
            ANNOUNCEMENT_CATEGORY_OPTIONS.find(
              (option) => option.value === filters.category
            ) ?? null
          }
          onChange={(option) =>
            onChange({
              ...filters,
              category:
                (option as { value: Announcement.Category } | null)?.value ??
                '',
            })
          }
          styles={controlStyles}
        />
        <SelectField
          placeholder="Any priority"
          options={ANNOUNCEMENT_PRIORITY_OPTIONS}
          isClearable
          value={
            ANNOUNCEMENT_PRIORITY_OPTIONS.find(
              (option) => option.value === filters.priority
            ) ?? null
          }
          onChange={(option) =>
            onChange({
              ...filters,
              priority:
                (option as { value: Announcement.Priority } | null)?.value ??
                '',
            })
          }
          styles={controlStyles}
        />
        <SelectField
          placeholder="Any audience"
          options={AUDIENCE_TYPE_FILTER_OPTIONS}
          isClearable
          value={
            AUDIENCE_TYPE_FILTER_OPTIONS.find(
              (option) => option.value === filters.audienceType
            ) ?? null
          }
          onChange={(option) =>
            onChange({
              ...filters,
              audienceType:
                (option as { value: Announcement.AudienceType } | null)
                  ?.value ?? '',
            })
          }
          styles={controlStyles}
        />
      </Box>

      <Divider sx={{ my: 1.5 }} />

      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={1.25}
        alignItems={{ xs: 'stretch', md: 'flex-end' }}
      >
        <Box sx={{ width: { xs: '100%', md: 190 } }}>
          <CustomDatePicker
            views={['day', 'month', 'year']}
            labelDetail={{ text: 'From date', required: false }}
            value={filters.fromDate ? moment(filters.fromDate) : null}
            onChange={(value) =>
              onChange({
                ...filters,
                fromDate:
                  value && moment(value).isValid()
                    ? moment(value).format('YYYY-MM-DD')
                    : undefined,
              })
            }
            slotProps={{ textField: { size: 'small' } }}
          />
        </Box>
        <Box sx={{ width: { xs: '100%', md: 190 } }}>
          <CustomDatePicker
            views={['day', 'month', 'year']}
            labelDetail={{ text: 'To date', required: false }}
            value={filters.toDate ? moment(filters.toDate) : null}
            onChange={(value) =>
              onChange({
                ...filters,
                toDate:
                  value && moment(value).isValid()
                    ? moment(value).format('YYYY-MM-DD')
                    : undefined,
              })
            }
            slotProps={{ textField: { size: 'small' } }}
          />
        </Box>
        <Box flex={1} minWidth={200}>
          <InputField
            placeholder="Search title, summary or content"
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
