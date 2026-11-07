import { Box, Card, Stack, Typography } from '@mui/material'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { StylesConfig } from 'react-select'
import { GoPlus } from 'react-icons/go'
import { ButtonComp } from '@src/components/button/button.component'
import {
  AsyncSelectField,
  SelectField,
  customReactSelectStyles,
} from '@src/components/select/select.component'
import { colors } from '@src/helpers/colors.helpers'
import { useDispatch, useSelector } from '@src/store/hooks.store'
import { getClassList } from '@src/store/redux/dashboard/academics/classes/classes.service'
import { getClassSectionList } from '@src/store/redux/dashboard/academics/classSections/sections.service'
import {
  deleteClassRoutineAction,
  getClassRoutineListAction,
  getScheduleTemplateListAction,
  getTimeSlotListAction,
  getWorkingDayListAction,
} from '@src/store/redux/dashboard/academics/classRoutines/classRoutines.slice'
import RoutineGrid, {
  IAssignSlotPayload,
} from '../routineGrid/routineGrid.component'
import { routineSelectPortalProps } from '../../classRoutines.helpers'
import { AssignRoutineModal } from '../assignRoutineModal/assignRoutineModal.component'
import { TimeSlotsPanel } from '../timeSlotsPanel/timeSlotsPanel.component'
import { WorkingDaysPanel } from '../workingDaysPanel/workingDaysPanel.component'
import { ScheduleTemplatesPanel } from '../scheduleTemplatesPanel/scheduleTemplatesPanel.component'

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

type TTab = 'routine' | 'time-slots' | 'working-days' | 'templates'

const ROUTINE_TABS: { key: TTab; label: string }[] = [
  { key: 'routine', label: 'Routine' },
  { key: 'time-slots', label: 'Time Slots' },
  { key: 'working-days', label: 'Working Days' },
  { key: 'templates', label: 'Templates' },
]

export function AdminRoutineView() {
  const dispatch = useDispatch()

  const [selectedClass, setSelectedClass] = useState<ISelectOption | null>(null)
  const [selectedSection, setSelectedSection] = useState<ISelectOption | null>(
    null
  )
  const [selectedTemplate, setSelectedTemplate] =
    useState<ISelectOption | null>(null)
  const [sectionOptions, setSectionOptions] = useState<ISelectOption[]>([])
  const [activeTab, setActiveTab] = useState<TTab>('routine')
  const [openAssignModal, setOpenAssignModal] = useState(false)
  const [assignDefaults, setAssignDefaults] =
    useState<IAssignSlotPayload | null>(null)
  const [editRoutine, setEditRoutine] =
    useState<Academics.IClassRoutineList | null>(null)

  const { data: routineList, loading: routineLoading } = useSelector(
    (store) => store.classRoutines.routineList
  )
  const { data: timeSlotList } = useSelector(
    (store) => store.classRoutines.timeSlotList
  )
  const { data: workingDayList } = useSelector(
    (store) => store.classRoutines.workingDayList
  )
  const { data: scheduleTemplateList } = useSelector(
    (store) => store.classRoutines.scheduleTemplateList
  )

  const classId = selectedClass?.value ?? null

  const remappedClassList = async (): Promise<ISelectOption[]> => {
    const data = await getClassList()

    return (
      data?.data?.rows?.map((el) => ({
        label: el.class_details?.name,
        value: el.class_details?.id,
      })) ?? []
    )
  }

  useEffect(() => {
    const loadClassList = async () => {
      const options = await remappedClassList()
      if (options.length) {
        setSelectedClass(options[0])
      }
    }
    loadClassList()
  }, [])

  useEffect(() => {
    if (!classId) {
      return
    }

    dispatch(getWorkingDayListAction({ classId }))
    dispatch(getTimeSlotListAction({ classId }))
    dispatch(getScheduleTemplateListAction({ classId }))

    const loadSectionList = async () => {
      const data = await getClassSectionList(classId)
      const options =
        data?.data?.map((el) => ({
          label: el.section_details?.name,
          value: el.section_details?.id,
        })) ?? []
      setSectionOptions(options)
      setSelectedSection(options.length ? options[0] : null)
    }
    loadSectionList()
  }, [classId, dispatch])

  useEffect(() => {
    if (!scheduleTemplateList?.length) {
      setSelectedTemplate(null)

      return
    }
    const active =
      scheduleTemplateList.find(
        (el) => el.schedule_template_details.is_active
      ) ?? scheduleTemplateList[0]

    setSelectedTemplate({
      label: active.schedule_template_details.name,
      value: active.schedule_template_details.id,
    })
  }, [scheduleTemplateList])

  const sectionId = selectedSection?.value ?? null

  const refreshConfig = useCallback(() => {
    if (!classId) {
      return
    }
    dispatch(getWorkingDayListAction({ classId }))
    dispatch(getTimeSlotListAction({ classId }))
    dispatch(getScheduleTemplateListAction({ classId }))
  }, [classId, dispatch])

  const refreshRoutines = useCallback(() => {
    if (!classId) {
      return
    }
    dispatch(
      getClassRoutineListAction({
        classId,
        classSectionId: sectionId ?? undefined,
      })
    )
  }, [classId, sectionId, dispatch])

  useEffect(() => {
    refreshRoutines()
  }, [refreshRoutines])

  const refreshAll = useCallback(() => {
    refreshConfig()
    refreshRoutines()
  }, [refreshConfig, refreshRoutines])

  const templateOptions: ISelectOption[] = useMemo(
    () =>
      (scheduleTemplateList ?? []).map((el) => ({
        label: el.schedule_template_details.name,
        value: el.schedule_template_details.id,
      })),
    [scheduleTemplateList]
  )

  const handleOpenAssign = (details?: IAssignSlotPayload | null) => {
    setEditRoutine(null)
    setAssignDefaults(details ?? null)
    setOpenAssignModal(true)
  }

  const handleOpenEdit = (routine: Academics.IClassRoutineList) => {
    setAssignDefaults(null)
    setEditRoutine(routine)
    setOpenAssignModal(true)
  }

  const handleDeleteRoutine = (routine: Academics.IClassRoutineList) => {
    if (!classId) {
      return
    }
    dispatch(
      deleteClassRoutineAction({
        classId,
        routineId: routine.class_routine_details.id,
        onSuccess: refreshRoutines,
      })
    )
  }

  return (
    <Stack spacing={2}>
      <Card sx={{ p: 2, borderRadius: 2 }}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          alignItems={{ xs: 'stretch', md: 'flex-end' }}
        >
          <Box flex={1} minWidth={180}>
            <Typography fontSize={12.5} fontWeight={500} mb={0.75}>
              Class
            </Typography>
            <AsyncSelectField
              placeholder="Select class"
              loadOptions={remappedClassList}
              value={selectedClass}
              onChange={(val) => {
                setSelectedClass(val as ISelectOption | null)
              }}
              {...routineSelectPortalProps}
              styles={selectStyles}
            />
          </Box>
          <Box flex={1} minWidth={180}>
            <Typography fontSize={12.5} fontWeight={500} mb={0.75}>
              Section
            </Typography>
            <SelectField
              placeholder="Select section"
              options={sectionOptions}
              value={selectedSection}
              onChange={(val) => {
                setSelectedSection(val as ISelectOption | null)
              }}
              isDisabled={!sectionOptions.length}
              {...routineSelectPortalProps}
              styles={selectStyles}
            />
          </Box>
          <Box flex={1} minWidth={180}>
            <Typography fontSize={12.5} fontWeight={500} mb={0.75}>
              Schedule Template
            </Typography>
            <SelectField
              placeholder="Select template"
              options={templateOptions}
              value={selectedTemplate}
              onChange={(val) => {
                setSelectedTemplate(val as ISelectOption | null)
              }}
              isDisabled={!templateOptions.length}
              {...routineSelectPortalProps}
              styles={selectStyles}
            />
          </Box>
        </Stack>
      </Card>

      <Stack direction="row" flexWrap="wrap" gap={1}>
        {ROUTINE_TABS.map((tab) => {
          const isActive = activeTab === tab.key

          return (
            <Box
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              sx={{
                px: 2,
                py: 1,
                borderRadius: 2,
                cursor: 'pointer',
                fontSize: 13.5,
                fontWeight: isActive ? 600 : 500,
                bgcolor: isActive ? colors.blue[600] : '#fff',
                color: isActive ? '#fff' : colors.grey[700],
                border: `1px solid ${
                  isActive ? colors.blue[600] : colors.grey[300]
                }`,
                transition: 'all 0.2s ease',
              }}
            >
              {tab.label}
            </Box>
          )
        })}
      </Stack>

      <Card sx={{ p: { xs: 1.5, sm: 2 }, borderRadius: 2 }}>
        {activeTab === 'routine' ? (
          <Box>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1}
              justifyContent="space-between"
              alignItems={{ xs: 'flex-start', sm: 'center' }}
              mb={2}
            >
              <Box>
                <Typography fontSize={15} fontWeight={600}>
                  Class Routine
                </Typography>
                <Typography fontSize={12.5} color={colors.grey[600]}>
                  {selectedSection
                    ? `${selectedClass?.label} - ${selectedSection.label}`
                    : 'Select a section to view its routine'}
                </Typography>
              </Box>
              <ButtonComp
                size="small"
                startIcon={<GoPlus />}
                disabled={!classId || !sectionId}
                onClick={() => handleOpenAssign(null)}
              >
                Assign Routine
              </ButtonComp>
            </Stack>
            <RoutineGrid
              routineList={routineList}
              workingDayList={workingDayList}
              timeSlotList={timeSlotList}
              templateId={selectedTemplate?.value ?? null}
              loading={routineLoading}
              emptyText="No routine assigned yet. Click Assign Routine to get started."
              onAssign={handleOpenAssign}
              onEdit={handleOpenEdit}
              onDelete={handleDeleteRoutine}
            />
          </Box>
        ) : null}

        {activeTab === 'time-slots' ? (
          <TimeSlotsPanel
            classId={classId}
            timeSlotList={timeSlotList}
            workingDayList={workingDayList}
            scheduleTemplateList={scheduleTemplateList}
            onRefresh={refreshAll}
          />
        ) : null}

        {activeTab === 'working-days' ? (
          <WorkingDaysPanel classId={classId} onRefresh={refreshAll} />
        ) : null}

        {activeTab === 'templates' ? (
          <ScheduleTemplatesPanel classId={classId} onRefresh={refreshAll} />
        ) : null}
      </Card>

      <AssignRoutineModal
        open={openAssignModal}
        onClose={() => {
          setOpenAssignModal(false)
          setAssignDefaults(null)
          setEditRoutine(null)
        }}
        classId={classId}
        timeSlotList={timeSlotList}
        workingDayList={workingDayList}
        details={editRoutine}
        defaults={assignDefaults}
        onSuccess={refreshRoutines}
      />
    </Stack>
  )
}
