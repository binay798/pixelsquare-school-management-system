import { Box, Card, Chip, Stack, Typography } from '@mui/material'
import moment from 'moment'
import { useMemo, useState } from 'react'
import { uniqBy } from 'lodash'
import { StylesConfig } from 'react-select'
import {
  SelectField,
  customReactSelectStyles,
} from '@src/components/select/select.component'
import { colors } from '@src/helpers/colors.helpers'
import { useSelector } from '@src/store/hooks.store'
import RoutineGrid from '../routineGrid/routineGrid.component'
import { routineSelectPortalProps } from '../../classRoutines.helpers'

const selectStyles: StylesConfig = {
  ...customReactSelectStyles,
  menuList: () => ({
    maxHeight: 200,
    overflowY: 'auto',
  }),
}

interface ISelectOption {
  label: string
  value: number
}

export function MyRoutineView() {
  const [selectedSection, setSelectedSection] = useState<ISelectOption | null>(
    null
  )
  const { data: myRoutineList, loading } = useSelector(
    (store) => store.classRoutines.myRoutineList
  )

  const sectionOptions: ISelectOption[] = useMemo(
    () =>
      uniqBy(
        (myRoutineList ?? []).map((el) => ({
          label: el.class_section_details?.name,
          value: el.class_section_details?.id,
        })),
        (el) => el.value
      ),
    [myRoutineList]
  )

  const routineList = useMemo(
    () =>
      selectedSection
        ? (myRoutineList ?? []).filter(
            (el) => el.class_section_details?.id === selectedSection.value
          )
        : myRoutineList,
    [myRoutineList, selectedSection]
  )

  const workingDayList = useMemo<Academics.IWorkingDayList[]>(() => {
    const days = (routineList ?? []).map((el) => ({
      working_day_details: {
        ...el.working_day_details,
        is_working_day: true,
        created_at: '',
        updated_at: '',
        school_id: 0,
      },
    }))

    return uniqBy(days, (el) => el.working_day_details.id)
  }, [routineList])

  const timeSlotList = useMemo<Academics.ITimeSlotList[]>(() => {
    const slots = (routineList ?? []).map((el) => ({
      time_slot_details: {
        ...el.time_slot_details,
        schedule_template_id: el.schedule_template_details?.id ?? 0,
        working_day_id: el.working_day_details?.id ?? 0,
        created_at: '',
        updated_at: '',
        school_id: 0,
      },
      schedule_template_details: el.schedule_template_details,
      working_day_details: el.working_day_details,
    }))

    return uniqBy(slots, (el) => el.time_slot_details.id)
  }, [routineList])

  const todayClassesCount = useMemo(
    () =>
      (routineList ?? []).filter(
        (el) =>
          el.working_day_details?.name?.toLowerCase() ===
          moment().format('dddd').toLowerCase()
      ).length,
    [routineList]
  )

  return (
    <Stack spacing={2}>
      <Card sx={{ p: 2, borderRadius: 2 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
        >
          <Box>
            <Typography fontSize={16} fontWeight={600}>
              My Routine
            </Typography>
            <Typography fontSize={12.5} color={colors.grey[600]}>
              Your weekly class schedule.
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} alignItems="center">
            <Chip
              size="small"
              label={`${(routineList ?? []).length} classes / week`}
              sx={{
                height: 24,
                fontSize: 12,
                bgcolor: colors.blue[50],
                color: colors.blue[700],
              }}
            />
            <Chip
              size="small"
              label={`${todayClassesCount} today`}
              sx={{
                height: 24,
                fontSize: 12,
                bgcolor: colors.green[50],
                color: colors.green[700],
              }}
            />
          </Stack>
        </Stack>

        {sectionOptions.length > 1 ? (
          <Box mt={2} maxWidth={280}>
            <Typography fontSize={12.5} fontWeight={500} mb={0.75}>
              Section
            </Typography>
            <SelectField
              placeholder="All sections"
              options={sectionOptions}
              value={selectedSection}
              onChange={(val) => {
                setSelectedSection(val as ISelectOption | null)
              }}
              isClearable
              {...routineSelectPortalProps}
              styles={selectStyles}
            />
          </Box>
        ) : null}
      </Card>

      <Card sx={{ p: { xs: 1.5, sm: 2 }, borderRadius: 2 }}>
        <RoutineGrid
          routineList={routineList}
          workingDayList={workingDayList}
          timeSlotList={timeSlotList}
          loading={loading}
          showSection={sectionOptions.length > 1}
          emptyText="No classes have been scheduled for you yet."
        />
      </Card>
    </Stack>
  )
}
