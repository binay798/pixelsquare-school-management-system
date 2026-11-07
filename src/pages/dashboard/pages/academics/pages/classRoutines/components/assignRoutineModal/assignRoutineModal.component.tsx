import { Box, FormControl, FormLabel, Stack, Typography } from '@mui/material'
import { useFormik } from 'formik'
import { useMemo } from 'react'
import { StylesConfig } from 'react-select'
import { ButtonComp } from '@src/components/button/button.component'
import { InputField } from '@src/components/input/input.component'
import SpringModal from '@src/components/modal/modal.component'
import {
  AsyncSelectField,
  SelectField,
  customReactSelectStyles,
} from '@src/components/select/select.component'
import { colors } from '@src/helpers/colors.helpers'
import { useDispatch, useSelector } from '@src/store/hooks.store'
import { getClassSectionList } from '@src/store/redux/dashboard/academics/classSections/sections.service'
import { subjectServices } from '@src/store/redux/dashboard/academics/subjects/subjects.service'
import { teacherServices } from '@src/store/redux/dashboard/teachers/teachers.service'
import {
  createClassRoutineAction,
  updateClassRoutineAction,
} from '@src/store/redux/dashboard/academics/classRoutines/classRoutines.slice'
import { assignRoutineSchema } from '../../classRoutines.schema'
import { IAssignSlotPayload } from '../routineGrid/routineGrid.component'
import {
  formatRoutineTime,
  routineSelectPortalProps,
} from '../../classRoutines.helpers'

const selectStyles: StylesConfig = {
  ...customReactSelectStyles,
  menuList: () => ({
    maxHeight: 180,
    overflowY: 'auto',
  }),
}

interface ISelectOption {
  label: string
  value: number
}

interface Props {
  open: boolean
  onClose: () => void
  classId: number | null
  timeSlotList: Academics.ITimeSlotList[] | null
  workingDayList: Academics.IWorkingDayList[] | null
  details: Academics.IClassRoutineList | null
  defaults?: IAssignSlotPayload | null
  onSuccess: () => void
}

export function AssignRoutineModal(props: Props) {
  const dispatch = useDispatch()
  const { loading: createLoading } = useSelector(
    (store) => store.classRoutines.createRoutine
  )
  const { loading: updateLoading } = useSelector(
    (store) => store.classRoutines.updateRoutine
  )

  const editMode = Boolean(props.details)

  const workingDayOptions: ISelectOption[] = useMemo(
    () =>
      (props.workingDayList ?? [])
        .map((el) => el.working_day_details)
        .filter((el) => el.is_working_day)
        .map((el) => ({ label: el.name, value: el.id })),
    [props.workingDayList]
  )

  const remappedSectionList = async (): Promise<ISelectOption[]> => {
    if (!props.classId) {
      return []
    }
    const data = await getClassSectionList(props.classId)

    return (
      data?.data?.map((el) => ({
        label: `${el.class_details?.name} - ${el.section_details?.name}`,
        value: el.section_details?.id,
      })) ?? []
    )
  }

  const remappedTeacherList = async (): Promise<ISelectOption[]> => {
    const data = await teacherServices.getTeacherList(1, 500)

    return (
      data?.data?.rows?.map((el) => ({
        label: `${el.user_profile_details?.firstname ?? ''} ${
          el.user_profile_details?.lastname ?? ''
        }`.trim(),
        value: el.teacher_details?.id,
      })) ?? []
    )
  }

  const remappedSubjectList = async (): Promise<ISelectOption[]> => {
    if (!props.classId) {
      return []
    }
    const data = await subjectServices.getSubjectListService(
      props.classId,
      1,
      500
    )

    return (
      data?.data?.map((el) => ({
        label: el.subject_details?.name,
        value: el.subject_id,
      })) ?? []
    )
  }

  const getDefaultTimeSlot = (): ISelectOption | null => {
    if (!props.defaults || !props.timeSlotList) {
      return null
    }
    const matched = props.timeSlotList.find(
      (el) =>
        el.time_slot_details.working_day_id === props.defaults?.workingDayId &&
        el.time_slot_details.name === props.defaults?.timeSlotSeries.name &&
        el.time_slot_details.start_time ===
          props.defaults?.timeSlotSeries.start_time &&
        el.time_slot_details.end_time ===
          props.defaults?.timeSlotSeries.end_time
    )

    if (!matched) {
      return null
    }

    return {
      label: matched.time_slot_details.name,
      value: matched.time_slot_details.id,
    }
  }
  const formik = useFormik({
    initialValues: {
      class_section_id: props.details
        ? {
            label: props.details.class_section_details?.name,
            value: props.details.class_section_details?.id,
          }
        : (null as ISelectOption | null),
      teacher_id: props.details
        ? {
            label: `${props.details.user_profile_details?.firstname ?? ''} ${
              props.details.user_profile_details?.lastname ?? ''
            }`.trim(),
            value: props.details.class_routine_details?.teacher_id,
          }
        : (null as ISelectOption | null),
      subject_id: props.details
        ? {
            label: props.details.subject_details?.name,
            value: props.details.subject_details?.id,
          }
        : (null as ISelectOption | null),
      working_day_id: props.details
        ? {
            label: props.details.working_day_details?.name,
            value: props.details.working_day_details?.id,
          }
        : props.defaults
        ? {
            label: props.defaults.workingDayName,
            value: props.defaults.workingDayId,
          }
        : (null as ISelectOption | null),
      time_slot_id: props.details
        ? {
            label: props.details.time_slot_details?.name,
            value: props.details.time_slot_details?.id,
          }
        : getDefaultTimeSlot(),
    },
    enableReinitialize: true,
    validationSchema: assignRoutineSchema,
    onSubmit: (values) => {
      if (!props.classId) {
        return
      }

      const onSuccess = () => {
        props.onClose()
        props.onSuccess()
      }

      if (props.details) {
        dispatch(
          updateClassRoutineAction({
            classId: props.classId,
            routineId: props.details.class_routine_details.id,
            body: {
              working_day_id: values.working_day_id?.value as number,
              time_slot_id: values.time_slot_id?.value as number,
            },
            onSuccess,
          })
        )

        return
      }

      dispatch(
        createClassRoutineAction({
          classId: props.classId,
          body: {
            class_section_id: values.class_section_id?.value as number,
            teacher_id: values.teacher_id?.value as number,
            subject_id: values.subject_id?.value as number,
            working_day_id: values.working_day_id?.value as number,
            time_slot_id: values.time_slot_id?.value as number,
          },
          onSuccess,
        })
      )
    },
  })

  const timeSlotOptions: ISelectOption[] = useMemo(() => {
    const workingDayId = formik.values.working_day_id?.value

    return (props.timeSlotList ?? [])
      .filter(
        (el) =>
          el.time_slot_details.working_day_id === workingDayId &&
          el.time_slot_details.slot_type !== 'break'
      )
      .sort(
        (a, b) =>
          (a.time_slot_details.sequence_order ?? 0) -
          (b.time_slot_details.sequence_order ?? 0)
      )
      .map((el) => ({
        label: `${el.time_slot_details.name} (${formatRoutineTime(
          el.time_slot_details.start_time
        )} - ${formatRoutineTime(el.time_slot_details.end_time)})`,
        value: el.time_slot_details.id,
      }))
  }, [props.timeSlotList, formik.values.working_day_id?.value])

  const fieldError = (key: keyof typeof formik.errors) =>
    Boolean(formik.touched[key]) && Boolean(formik.errors[key])

  const helperText = (key: keyof typeof formik.errors) =>
    fieldError(key) ? String(formik.errors[key]) : ''

  return (
    <SpringModal open={props.open} close={props.onClose} size="md">
      <Box>
        <Typography variant="h6" fontWeight={600} mb={0.5}>
          {editMode ? 'Edit' : 'Assign'} Routine
        </Typography>
        <Typography fontSize={13} color={colors.grey[600]} mb={2.5}>
          {editMode
            ? 'Update the working day and time slot of this routine. Subject and teacher cannot be changed here.'
            : 'Assign a subject and teacher to a period of the class routine.'}
        </Typography>
        <form onSubmit={formik.handleSubmit}>
          <Stack spacing={2}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <FormControl fullWidth>
                <FormLabel
                  sx={{ fontSize: 13, mb: 1, color: colors.grey[800] }}
                >
                  Class Section
                </FormLabel>
                <AsyncSelectField
                  placeholder="Select class section"
                  loadOptions={remappedSectionList}
                  defaultOptions
                  isDisabled={!props.classId || editMode}
                  value={formik.values.class_section_id}
                  onChange={(e) =>
                    formik.setFieldValue(
                      'class_section_id',
                      e as ISelectOption | null
                    )
                  }
                  {...routineSelectPortalProps}
                  styles={selectStyles}
                />
                {fieldError('class_section_id') ? (
                  <Typography fontSize={11.5} color="error" mt={0.5}>
                    {helperText('class_section_id')}
                  </Typography>
                ) : null}
              </FormControl>
              <FormControl fullWidth>
                <FormLabel
                  sx={{ fontSize: 13, mb: 1, color: colors.grey[800] }}
                >
                  Teacher
                </FormLabel>
                <AsyncSelectField
                  placeholder="Select teacher"
                  loadOptions={remappedTeacherList}
                  defaultOptions
                  isDisabled={!props.classId || editMode}
                  value={formik.values.teacher_id}
                  onChange={(e) =>
                    formik.setFieldValue(
                      'teacher_id',
                      e as ISelectOption | null
                    )
                  }
                  {...routineSelectPortalProps}
                  styles={selectStyles}
                />
                {fieldError('teacher_id') ? (
                  <Typography fontSize={11.5} color="error" mt={0.5}>
                    {helperText('teacher_id')}
                  </Typography>
                ) : null}
              </FormControl>
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <FormControl fullWidth>
                <FormLabel
                  sx={{ fontSize: 13, mb: 1, color: colors.grey[800] }}
                >
                  Subject
                </FormLabel>
                <AsyncSelectField
                  placeholder="Select subject"
                  loadOptions={remappedSubjectList}
                  defaultOptions
                  isDisabled={!props.classId || editMode}
                  value={formik.values.subject_id}
                  onChange={(e) =>
                    formik.setFieldValue(
                      'subject_id',
                      e as ISelectOption | null
                    )
                  }
                  {...routineSelectPortalProps}
                  styles={selectStyles}
                />
                {fieldError('subject_id') ? (
                  <Typography fontSize={11.5} color="error" mt={0.5}>
                    {helperText('subject_id')}
                  </Typography>
                ) : null}
              </FormControl>
              <FormControl fullWidth>
                <FormLabel
                  sx={{ fontSize: 13, mb: 1, color: colors.grey[800] }}
                >
                  Working Day
                </FormLabel>
                <SelectField
                  placeholder="Select working day"
                  options={workingDayOptions}
                  value={formik.values.working_day_id}
                  onChange={(e) => {
                    formik.setFieldValue(
                      'working_day_id',
                      e as ISelectOption | null
                    )
                    formik.setFieldValue('time_slot_id', null)
                  }}
                  {...routineSelectPortalProps}
                  styles={selectStyles}
                />
                {fieldError('working_day_id') ? (
                  <Typography fontSize={11.5} color="error" mt={0.5}>
                    {helperText('working_day_id')}
                  </Typography>
                ) : null}
              </FormControl>
            </Stack>

            <FormControl fullWidth>
              <FormLabel sx={{ fontSize: 13, mb: 1, color: colors.grey[800] }}>
                Time Slot
              </FormLabel>
              <SelectField
                placeholder={
                  formik.values.working_day_id
                    ? 'Select time slot'
                    : 'Select a working day first'
                }
                options={timeSlotOptions}
                isDisabled={!formik.values.working_day_id}
                value={formik.values.time_slot_id}
                onChange={(e) =>
                  formik.setFieldValue(
                    'time_slot_id',
                    e as ISelectOption | null
                  )
                }
                {...routineSelectPortalProps}
                styles={selectStyles}
              />
              {fieldError('time_slot_id') ? (
                <Typography fontSize={11.5} color="error" mt={0.5}>
                  {helperText('time_slot_id')}
                </Typography>
              ) : null}
            </FormControl>

            {!editMode && props.defaults ? (
              <InputField
                labelDetail={{ text: 'Period', required: false }}
                value={`${
                  props.defaults.timeSlotSeries.name
                } (${formatRoutineTime(
                  props.defaults.timeSlotSeries.start_time
                )} - ${formatRoutineTime(
                  props.defaults.timeSlotSeries.end_time
                )})`}
                disabled
              />
            ) : null}
          </Stack>

          <Stack direction="row" mt={3} gap={2} justifyContent="flex-end">
            <ButtonComp size="medium" variant="text" onClick={props.onClose}>
              Cancel
            </ButtonComp>
            <ButtonComp
              type="submit"
              size="medium"
              loading={createLoading || updateLoading}
            >
              {editMode ? 'Update' : 'Assign'}
            </ButtonComp>
          </Stack>
        </form>
      </Box>
    </SpringModal>
  )
}
