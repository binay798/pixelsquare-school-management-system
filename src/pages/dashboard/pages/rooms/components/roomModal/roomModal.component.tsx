import { Box, FormControl, FormLabel, Stack, Typography } from '@mui/material'
import { useFormik } from 'formik'
import { useMemo } from 'react'
import { ButtonComp } from '@src/components/button/button.component'
import {
  InputField,
  TextareaField,
} from '@src/components/input/input.component'
import SpringModal from '@src/components/modal/modal.component'
import { SelectField } from '@src/components/select/select.component'
import { colors } from '@src/helpers/colors.helpers'
import { useDispatch, useSelector } from '@src/store/hooks.store'
import { saveRoomAction } from '@src/store/redux/dashboard/rooms/rooms.slice'
import { roomFormSchema } from '../../rooms.schema'
import {
  ROOM_STATUS_OPTIONS,
  WEEKDAY_OPTIONS,
  titleCase,
} from '../../rooms.helpers'

interface Props {
  open: boolean
  onClose: () => void
  master: Rooms.IMasterData | null
  room?: Rooms.IRoomListRow | null
  onSaved: () => void
}

type Option = {
  label: string
  value: string | number
  quantity?: number
  condition?: string
}

export function RoomModal({ open, onClose, master, room, onSaved }: Props) {
  const dispatch = useDispatch()
  const { loading } = useSelector((store) => store.rooms.mutation)
  const isEdit = Boolean(room)
  const details = room?.room_details

  const buildingOptions: Option[] = useMemo(
    () =>
      (master?.buildings ?? []).map((building) => ({
        label: `${building.name} (${building.code})`,
        value: building.id,
      })),
    [master?.buildings]
  )

  const roomTypeOptions: Option[] = useMemo(
    () =>
      (master?.room_types ?? []).map((type) => ({
        label: type.name,
        value: type.id,
      })),
    [master?.room_types]
  )

  const facilityOptions: Option[] = useMemo(
    () =>
      (master?.facilities ?? []).map((facility) => ({
        label: facility.name,
        value: facility.id,
      })),
    [master?.facilities]
  )

  const formik = useFormik({
    initialValues: {
      name: details?.name ?? '',
      code: details?.code ?? '',
      capacity: details?.capacity ?? 40,
      area: details?.area ? Number(details.area) : (null as number | null),
      status: {
        label: titleCase(details?.status ?? 'available'),
        value: details?.status ?? 'available',
      } as Option,
      building_id: room?.building_details
        ? {
            label: `${room.building_details.name} (${room.building_details.code})`,
            value: room.building_details.id,
          }
        : (null as Option | null),
      floor_id: room?.floor_details
        ? { label: room.floor_details.name, value: room.floor_details.id }
        : (null as Option | null),
      room_type_id: room?.room_type_details
        ? {
            label: room.room_type_details.name,
            value: room.room_type_details.id,
          }
        : (null as Option | null),
      description: details?.description ?? '',
      notes: details?.notes ?? '',
      photo_url: details?.photo_url ?? '',
      available_from: details?.available_from?.slice(0, 5) ?? '',
      available_to: details?.available_to?.slice(0, 5) ?? '',
      available_days: (details?.available_days ?? []).map((day) => ({
        label:
          WEEKDAY_OPTIONS.find((option) => option.value === day)?.label ??
          String(day),
        value: day,
      })) as Option[],
      facilities: (room?.facilities_details ?? []).map((item) => ({
        label: item.facility_details.name,
        value: item.facility_id,
        quantity: item.quantity,
        condition: item.condition,
      })) as Option[],
    },
    enableReinitialize: true,
    validationSchema: roomFormSchema,
    onSubmit: (values) => {
      const body = {
        name: values.name.trim(),
        code: values.code.trim(),
        capacity: Number(values.capacity),
        area:
          values.area === null ||
          values.area === undefined ||
          Number.isNaN(values.area)
            ? null
            : Number(values.area),
        status: values.status.value,
        building_id: values.building_id?.value ?? null,
        floor_id: values.floor_id?.value ?? null,
        room_type_id: values.room_type_id?.value ?? null,
        description: values.description?.trim() || null,
        notes: values.notes?.trim() || null,
        photo_url: values.photo_url?.trim() || null,
        available_days: values.available_days.length
          ? values.available_days.map((day) => Number(day.value))
          : null,
        available_from: values.available_from || null,
        available_to: values.available_to || null,
        facilities: values.facilities.map((facility) => ({
          facility_id: Number(facility.value),
          quantity: facility.quantity ?? 1,
          condition: facility.condition ?? 'good',
        })),
      }

      dispatch(
        saveRoomAction({
          roomId: details?.id,
          body,
          onSuccess: () => {
            onClose()
            onSaved()
          },
        })
      )
    },
  })

  const floorOptions: Option[] = useMemo(() => {
    const buildingId = formik.values.building_id?.value

    return (master?.floors ?? [])
      .filter(
        (floor) =>
          !buildingId || Number(floor.building_id) === Number(buildingId)
      )
      .map((floor) => ({ label: floor.name, value: floor.id }))
  }, [master?.floors, formik.values.building_id?.value])

  const fieldError = (key: keyof typeof formik.errors) =>
    Boolean(formik.touched[key]) && Boolean(formik.errors[key])

  return (
    <SpringModal open={open} close={onClose} size="lg">
      <Box>
        <Typography variant="h6" fontWeight={700} mb={0.5}>
          {isEdit ? 'Edit room' : 'Create room'}
        </Typography>
        <Typography fontSize={13} color={colors.grey[600]} mb={2.5}>
          Rooms are reusable resources. A room is not tied to a class: assign it
          per section, timetable period or booking instead.
        </Typography>

        <form onSubmit={formik.handleSubmit}>
          <Stack spacing={2}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <InputField
                placeholder="Room name"
                labelDetail={{ text: 'Room name', required: true }}
                name="name"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={fieldError('name')}
                helperText={
                  formik.touched.name ? formik.errors.name : undefined
                }
              />
              <InputField
                placeholder="RM-101"
                labelDetail={{ text: 'Room code', required: true }}
                name="code"
                value={formik.values.code}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={fieldError('code')}
                helperText={
                  formik.touched.code ? formik.errors.code : undefined
                }
              />
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <FormControl fullWidth>
                <FormLabel
                  sx={{ fontSize: 13, mb: 1, color: colors.grey[800] }}
                >
                  Building (optional)
                </FormLabel>
                <SelectField
                  isClearable
                  placeholder="Select building"
                  options={buildingOptions}
                  value={formik.values.building_id}
                  onChange={(option) => {
                    formik.setFieldValue('building_id', option as Option | null)
                    formik.setFieldValue('floor_id', null)
                  }}
                />
              </FormControl>
              <FormControl fullWidth>
                <FormLabel
                  sx={{ fontSize: 13, mb: 1, color: colors.grey[800] }}
                >
                  Floor (optional)
                </FormLabel>
                <SelectField
                  isClearable
                  placeholder="Select floor"
                  options={floorOptions}
                  value={formik.values.floor_id}
                  onChange={(option) =>
                    formik.setFieldValue('floor_id', option as Option | null)
                  }
                />
              </FormControl>
              <FormControl fullWidth>
                <FormLabel
                  sx={{ fontSize: 13, mb: 1, color: colors.grey[800] }}
                >
                  Room type
                </FormLabel>
                <SelectField
                  isClearable
                  placeholder="Select type"
                  options={roomTypeOptions}
                  value={formik.values.room_type_id}
                  onChange={(option) =>
                    formik.setFieldValue(
                      'room_type_id',
                      option as Option | null
                    )
                  }
                />
              </FormControl>
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <InputField
                type="number"
                placeholder="40"
                labelDetail={{ text: 'Capacity', required: true }}
                name="capacity"
                value={formik.values.capacity}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={fieldError('capacity')}
                helperText={
                  formik.touched.capacity ? formik.errors.capacity : undefined
                }
              />
              <InputField
                type="number"
                placeholder="48.5"
                labelDetail={{ text: 'Area (sq. m)', required: false }}
                name="area"
                value={formik.values.area ?? ''}
                onChange={(event) =>
                  formik.setFieldValue(
                    'area',
                    event.target.value === ''
                      ? null
                      : Number(event.target.value)
                  )
                }
                error={fieldError('area')}
                helperText={
                  formik.touched.area ? formik.errors.area : undefined
                }
              />
              <FormControl fullWidth>
                <FormLabel
                  sx={{ fontSize: 13, mb: 1, color: colors.grey[800] }}
                >
                  Physical status
                </FormLabel>
                <SelectField
                  options={ROOM_STATUS_OPTIONS}
                  value={formik.values.status}
                  onChange={(option) =>
                    formik.setFieldValue('status', option as Option)
                  }
                />
              </FormControl>
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <InputField
                type="time"
                labelDetail={{ text: 'Opens at', required: false }}
                name="available_from"
                value={formik.values.available_from}
                onChange={formik.handleChange}
              />
              <InputField
                type="time"
                labelDetail={{ text: 'Closes at', required: false }}
                name="available_to"
                value={formik.values.available_to}
                onChange={formik.handleChange}
                error={fieldError('available_to')}
                helperText={
                  formik.touched.available_to
                    ? formik.errors.available_to
                    : undefined
                }
              />
              <FormControl fullWidth>
                <FormLabel
                  sx={{ fontSize: 13, mb: 1, color: colors.grey[800] }}
                >
                  Available days (empty = every day)
                </FormLabel>
                <SelectField
                  isMulti
                  placeholder="Every day"
                  options={WEEKDAY_OPTIONS}
                  value={formik.values.available_days}
                  onChange={(options) =>
                    formik.setFieldValue(
                      'available_days',
                      (options ?? []) as Option[]
                    )
                  }
                  styles={{ menuList: (base) => ({ ...base, maxHeight: 180 }) }}
                />
              </FormControl>
            </Stack>

            <FormControl fullWidth>
              <FormLabel sx={{ fontSize: 13, mb: 1, color: colors.grey[800] }}>
                Facilities & equipment
              </FormLabel>
              <SelectField
                isMulti
                placeholder="Projector, computers, smartboard..."
                options={facilityOptions}
                value={formik.values.facilities}
                onChange={(options) =>
                  formik.setFieldValue(
                    'facilities',
                    (options ?? []) as Option[]
                  )
                }
                styles={{ menuList: (base) => ({ ...base, maxHeight: 180 }) }}
              />
            </FormControl>

            <TextareaField
              variant="outlined"
              labelDetail={{ text: 'Description', required: false }}
              minRows={2}
              name="description"
              value={formik.values.description ?? ''}
              onChange={formik.handleChange}
            />
            <TextareaField
              variant="outlined"
              labelDetail={{ text: 'Internal notes', required: false }}
              minRows={2}
              name="notes"
              value={formik.values.notes ?? ''}
              onChange={formik.handleChange}
            />
            <InputField
              placeholder="https://..."
              labelDetail={{ text: 'Photo URL', required: false }}
              name="photo_url"
              value={formik.values.photo_url ?? ''}
              onChange={formik.handleChange}
            />

            <Stack direction="row" gap={2} justifyContent="flex-end">
              <ButtonComp variant="text" onClick={onClose}>
                Cancel
              </ButtonComp>
              <ButtonComp
                type="submit"
                loading={loading}
                disabled={!formik.dirty}
              >
                {isEdit ? 'Save changes' : 'Create room'}
              </ButtonComp>
            </Stack>
          </Stack>
        </form>
      </Box>
    </SpringModal>
  )
}
