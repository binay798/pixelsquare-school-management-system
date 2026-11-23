import { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Box,
  FormControl,
  FormLabel,
  Stack,
  Typography,
} from '@mui/material'
import { useFormik } from 'formik'
import { ButtonComp } from '@src/components/button/button.component'
import {
  InputField,
  TextareaField,
} from '@src/components/input/input.component'
import SpringModal from '@src/components/modal/modal.component'
import { SelectField } from '@src/components/select/select.component'
import { colors } from '@src/helpers/colors.helpers'
import { useDispatch, useSelector } from '@src/store/hooks.store'
import { createBookingAction } from '@src/store/redux/dashboard/rooms/rooms.slice'
import {
  checkRoomAvailabilityService,
  getRoomListService,
} from '@src/store/redux/dashboard/rooms/rooms.service'
import { bookingFormSchema } from '../../rooms.schema'
import { ROOM_PURPOSE_OPTIONS, WEEKDAY_OPTIONS } from '../../rooms.helpers'

interface Props {
  open: boolean
  onClose: () => void
  onSaved: () => void
  defaults?: { roomId?: number; date?: string }
}

type Option = { label: string; value: string | number }

export function BookingModal({ open, onClose, onSaved, defaults }: Props) {
  const dispatch = useDispatch()
  const { loading } = useSelector((store) => store.rooms.mutation)
  const [rooms, setRooms] = useState<Rooms.IRoomListRow[]>([])
  const [checking, setChecking] = useState(false)
  const [checkResult, setCheckResult] = useState<{
    available: boolean
    reason?: string
  } | null>(null)

  useEffect(() => {
    getRoomListService({ limit: 500 })
      .then((res) => setRooms(res.rows))
      .catch(() => setRooms([]))
  }, [])

  const formik = useFormik({
    initialValues: {
      room_id: defaults?.roomId
        ? { label: String(defaults.roomId), value: defaults.roomId }
        : (null as Option | null),
      purpose_type: { label: 'Event', value: 'event' } as Option,
      title: '',
      description: '',
      booking_date: defaults?.date ?? new Date().toISOString().slice(0, 10),
      start_time: '09:00',
      end_time: '10:00',
      expected_capacity: null as number | null,
      booking_type: { label: 'One time', value: 'one_time' } as Option,
      recurrence_frequency: { label: 'Weekly', value: 'weekly' } as Option,
      recurrence_until: '',
      recurrence_days: [{ label: 'Sunday', value: 0 }] as Option[],
    },
    enableReinitialize: true,
    validationSchema: bookingFormSchema,
    onSubmit: (values) => {
      const body: Record<string, unknown> = {
        room_id: values.room_id?.value,
        purpose_type: values.purpose_type.value,
        title: values.title.trim(),
        description: values.description?.trim() || null,
        booking_date: values.booking_date,
        start_time: values.start_time,
        end_time: values.end_time,
        expected_capacity: values.expected_capacity,
        booking_type: values.booking_type.value,
      }

      if (values.booking_type.value === 'recurring') {
        body.recurrence = {
          frequency: values.recurrence_frequency.value,
          interval: 1,
          days_of_week:
            values.recurrence_frequency.value === 'weekly'
              ? values.recurrence_days.map((day) => Number(day.value))
              : undefined,
          until: values.recurrence_until || values.booking_date,
        }
      }

      dispatch(
        createBookingAction({
          body,
          onSuccess: () => {
            onClose()
            onSaved()
          },
        })
      )
    },
  })

  const roomOptions: Option[] = useMemo(
    () =>
      rooms
        .filter((room) => room.room_details.status === 'available')
        .map((room) => ({
          label: `${room.room_details.name} (${room.room_details.code}) · ${room.room_details.capacity} seats`,
          value: room.room_details.id,
        })),
    [rooms]
  )

  const selectedRoom = rooms.find(
    (room) => room.room_details.id === formik.values.room_id?.value
  )

  const handleCheck = async () => {
    setChecking(true)
    setCheckResult(null)

    try {
      const result = await checkRoomAvailabilityService({
        room_id: formik.values.room_id?.value,
        booking_date: formik.values.booking_date,
        start_time: formik.values.start_time,
        end_time: formik.values.end_time,
        expected_capacity: formik.values.expected_capacity,
      })
      setCheckResult(result)
    } catch {
      setCheckResult({ available: false, reason: 'Could not check this slot.' })
    } finally {
      setChecking(false)
    }
  }

  return (
    <SpringModal open={open} close={onClose} size="md">
      <Box>
        <Typography variant="h6" fontWeight={700} mb={0.5}>
          Book a room
        </Typography>
        <Typography fontSize={13} color={colors.grey[600]} mb={2.5}>
          The availability engine rejects overlapping bookings, timetable
          periods, teacher and section clashes and maintenance windows.
        </Typography>

        <form onSubmit={formik.handleSubmit}>
          <Stack spacing={2}>
            <FormControl fullWidth>
              <FormLabel sx={{ fontSize: 13, mb: 1, color: colors.grey[800] }}>
                Room
              </FormLabel>
              <SelectField
                placeholder="Select room"
                options={roomOptions}
                value={formik.values.room_id}
                onChange={(option) => {
                  setCheckResult(null)
                  formik.setFieldValue('room_id', option as Option | null)
                }}
              />
            </FormControl>

            <InputField
              placeholder="Parent meeting, SEE mock exam..."
              labelDetail={{ text: 'Title', required: true }}
              name="title"
              value={formik.values.title}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={Boolean(formik.touched.title && formik.errors.title)}
              helperText={
                formik.touched.title ? formik.errors.title : undefined
              }
            />

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <FormControl fullWidth>
                <FormLabel
                  sx={{ fontSize: 13, mb: 1, color: colors.grey[800] }}
                >
                  Purpose
                </FormLabel>
                <SelectField
                  options={ROOM_PURPOSE_OPTIONS}
                  value={formik.values.purpose_type}
                  onChange={(option) =>
                    formik.setFieldValue('purpose_type', option as Option)
                  }
                />
              </FormControl>
              <InputField
                type="number"
                placeholder={String(selectedRoom?.room_details.capacity ?? 40)}
                labelDetail={{ text: 'Expected attendance', required: false }}
                name="expected_capacity"
                value={formik.values.expected_capacity ?? ''}
                onChange={(event) =>
                  formik.setFieldValue(
                    'expected_capacity',
                    event.target.value === ''
                      ? null
                      : Number(event.target.value)
                  )
                }
              />
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <InputField
                type="date"
                labelDetail={{ text: 'Date', required: true }}
                name="booking_date"
                value={formik.values.booking_date}
                onChange={(event) => {
                  setCheckResult(null)
                  formik.handleChange(event)
                }}
              />
              <InputField
                type="time"
                labelDetail={{ text: 'From', required: true }}
                name="start_time"
                value={formik.values.start_time}
                onChange={(event) => {
                  setCheckResult(null)
                  formik.handleChange(event)
                }}
              />
              <InputField
                type="time"
                labelDetail={{ text: 'To', required: true }}
                name="end_time"
                value={formik.values.end_time}
                onChange={(event) => {
                  setCheckResult(null)
                  formik.handleChange(event)
                }}
                error={Boolean(
                  formik.touched.end_time && formik.errors.end_time
                )}
                helperText={
                  formik.touched.end_time ? formik.errors.end_time : undefined
                }
              />
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <FormControl fullWidth>
                <FormLabel
                  sx={{ fontSize: 13, mb: 1, color: colors.grey[800] }}
                >
                  Booking type
                </FormLabel>
                <SelectField
                  options={[
                    { label: 'One time', value: 'one_time' },
                    { label: 'Recurring', value: 'recurring' },
                  ]}
                  value={formik.values.booking_type}
                  onChange={(option) =>
                    formik.setFieldValue('booking_type', option as Option)
                  }
                />
              </FormControl>
              {formik.values.booking_type.value === 'recurring' ? (
                <FormControl fullWidth>
                  <FormLabel
                    sx={{ fontSize: 13, mb: 1, color: colors.grey[800] }}
                  >
                    Repeats
                  </FormLabel>
                  <SelectField
                    options={[
                      { label: 'Daily', value: 'daily' },
                      { label: 'Weekly', value: 'weekly' },
                    ]}
                    value={formik.values.recurrence_frequency}
                    onChange={(option) =>
                      formik.setFieldValue(
                        'recurrence_frequency',
                        option as Option
                      )
                    }
                  />
                </FormControl>
              ) : null}
            </Stack>

            {formik.values.booking_type.value === 'recurring' ? (
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <InputField
                  type="date"
                  labelDetail={{ text: 'Repeat until', required: true }}
                  name="recurrence_until"
                  value={formik.values.recurrence_until}
                  onChange={formik.handleChange}
                />
                {formik.values.recurrence_frequency.value === 'weekly' ? (
                  <FormControl fullWidth>
                    <FormLabel
                      sx={{ fontSize: 13, mb: 1, color: colors.grey[800] }}
                    >
                      Weekdays
                    </FormLabel>
                    <SelectField
                      isMulti
                      options={WEEKDAY_OPTIONS}
                      value={formik.values.recurrence_days}
                      onChange={(options) =>
                        formik.setFieldValue(
                          'recurrence_days',
                          (options ?? []) as Option[]
                        )
                      }
                      styles={{
                        menuList: (base) => ({ ...base, maxHeight: 180 }),
                      }}
                    />
                  </FormControl>
                ) : null}
              </Stack>
            ) : null}

            <TextareaField
              variant="outlined"
              labelDetail={{ text: 'Description', required: false }}
              minRows={2}
              name="description"
              value={formik.values.description ?? ''}
              onChange={formik.handleChange}
            />

            {checkResult ? (
              <Alert severity={checkResult.available ? 'success' : 'error'}>
                {checkResult.available
                  ? 'This room is free for the selected slot.'
                  : checkResult.reason ?? 'This room is not available.'}
              </Alert>
            ) : null}

            <Stack direction="row" gap={2} justifyContent="flex-end">
              <ButtonComp variant="text" onClick={onClose}>
                Cancel
              </ButtonComp>
              <ButtonComp
                variant="outlined"
                loading={checking}
                disabled={
                  !formik.values.room_id ||
                  formik.values.booking_type.value === 'recurring'
                }
                onClick={handleCheck}
              >
                Check availability
              </ButtonComp>
              <ButtonComp
                type="submit"
                loading={loading}
                disabled={!formik.dirty}
              >
                Confirm booking
              </ButtonComp>
            </Stack>
          </Stack>
        </form>
      </Box>
    </SpringModal>
  )
}
