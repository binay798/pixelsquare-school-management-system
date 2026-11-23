import { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Box,
  Checkbox,
  FormControl,
  FormControlLabel,
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
import { saveAllocationAction } from '@src/store/redux/dashboard/rooms/rooms.slice'
import {
  getRoomListService,
  getSectionOverviewService,
} from '@src/store/redux/dashboard/rooms/rooms.service'
import { allocationFormSchema } from '../../rooms.schema'
import { formatDate } from '../../rooms.helpers'

interface Props {
  open: boolean
  onClose: () => void
  master: Rooms.IMasterData | null
  allocation?: Rooms.IAllocationListRow | null
  onSaved: () => void
}

type Option = { label: string; value: number }

export function AllocationModal({
  open,
  onClose,
  master,
  allocation,
  onSaved,
}: Props) {
  const dispatch = useDispatch()
  const { loading } = useSelector((store) => store.rooms.mutation)
  const [rooms, setRooms] = useState<Rooms.IRoomListRow[]>([])
  const [sections, setSections] = useState<Rooms.ISectionOverviewRow[]>([])

  const academicYears = master?.academic_years ?? []
  const defaultYear =
    academicYears.find((year) => year.is_active) ?? academicYears[0]

  const formik = useFormik({
    initialValues: {
      academic_year_id: allocation
        ? {
            label: allocation.academic_year_details.name,
            value: allocation.academic_year_details.id,
          }
        : defaultYear
        ? { label: defaultYear.name, value: defaultYear.id }
        : (null as Option | null),
      section_id: allocation
        ? {
            label: `${allocation.class_details.name} ${allocation.section_details.name}`,
            value: allocation.section_details.id,
          }
        : (null as Option | null),
      room_id: allocation
        ? {
            label: `${allocation.room_details?.name ?? 'Room'} (${
              allocation.room_details?.code ?? ''
            })`,
            value: allocation.allocation_details.room_id,
          }
        : (null as Option | null),
      effective_from:
        allocation?.allocation_details.effective_from ??
        new Date().toISOString().slice(0, 10),
      effective_to: allocation?.allocation_details.effective_to ?? '',
      is_primary: allocation?.allocation_details.is_primary ?? true,
      notes: allocation?.allocation_details.notes ?? '',
    },
    enableReinitialize: true,
    validationSchema: allocationFormSchema,
    onSubmit: (values) => {
      const body = {
        academic_year_id: values.academic_year_id?.value,
        section_id: values.section_id?.value,
        room_id: values.room_id?.value,
        effective_from: values.effective_from,
        effective_to: values.effective_to || null,
        is_primary: values.is_primary,
        notes: values.notes?.trim() || null,
      }

      dispatch(
        saveAllocationAction({
          allocationId: allocation?.allocation_details.id,
          body,
          onSuccess: () => {
            onClose()
            onSaved()
          },
        })
      )
    },
  })

  const academicYearId = formik.values.academic_year_id?.value

  useEffect(() => {
    if (!academicYearId) {
      return
    }

    getSectionOverviewService(academicYearId)
      .then(setSections)
      .catch(() => setSections([]))
  }, [academicYearId])

  useEffect(() => {
    getRoomListService({ limit: 500 })
      .then((res) => setRooms(res.rows))
      .catch(() => setRooms([]))
  }, [])

  const sectionOptions: Option[] = useMemo(
    () =>
      sections
        .filter(
          (section) =>
            !section.allocation_id ||
            section.section_details.id === allocation?.section_details.id
        )
        .map((section) => ({
          label: `${section.class_details.name} ${section.section_details.name} · ${section.enrolled_students} students`,
          value: section.section_details.id,
        })),
    [sections, allocation]
  )

  const roomOptions: Option[] = useMemo(
    () =>
      rooms
        .filter(
          (room) =>
            room.room_details.status === 'available' ||
            room.room_details.id === allocation?.allocation_details.room_id
        )
        .map((room) => ({
          label: `${room.room_details.name} (${room.room_details.code}) · ${room.room_details.capacity} seats`,
          value: room.room_details.id,
        })),
    [rooms, allocation]
  )

  const selectedSection = sections.find(
    (section) => section.section_details.id === formik.values.section_id?.value
  )
  const selectedRoom = rooms.find(
    (room) => room.room_details.id === formik.values.room_id?.value
  )
  const overCapacity =
    Boolean(selectedSection && selectedRoom) &&
    (selectedSection?.enrolled_students ?? 0) >
      (selectedRoom?.room_details.capacity ?? 0)

  return (
    <SpringModal open={open} close={onClose} size="md">
      <Box>
        <Typography variant="h6" fontWeight={700} mb={0.5}>
          {allocation ? 'Edit allocation' : 'Allocate a classroom'}
        </Typography>
        <Typography fontSize={13} color={colors.grey[600]} mb={2.5}>
          The allocation is effective dated, so a section can change room during
          the year without losing its history.
        </Typography>

        <form onSubmit={formik.handleSubmit}>
          <Stack spacing={2}>
            <FormControl fullWidth>
              <FormLabel sx={{ fontSize: 13, mb: 1, color: colors.grey[800] }}>
                Academic year
              </FormLabel>
              <SelectField
                placeholder="Select academic year"
                options={academicYears.map((year) => ({
                  label: year.name,
                  value: year.id,
                }))}
                value={formik.values.academic_year_id}
                onChange={(option) => {
                  formik.setFieldValue('academic_year_id', option as Option)
                  formik.setFieldValue('section_id', null)
                }}
                isDisabled={Boolean(allocation)}
              />
            </FormControl>

            <FormControl fullWidth>
              <FormLabel sx={{ fontSize: 13, mb: 1, color: colors.grey[800] }}>
                Class section
              </FormLabel>
              <SelectField
                placeholder="Select section"
                options={sectionOptions}
                value={formik.values.section_id}
                onChange={(option) =>
                  formik.setFieldValue('section_id', option as Option | null)
                }
                isDisabled={Boolean(allocation)}
              />
            </FormControl>

            <FormControl fullWidth>
              <FormLabel sx={{ fontSize: 13, mb: 1, color: colors.grey[800] }}>
                Room
              </FormLabel>
              <SelectField
                placeholder="Select room"
                options={roomOptions}
                value={formik.values.room_id}
                onChange={(option) =>
                  formik.setFieldValue('room_id', option as Option | null)
                }
              />
            </FormControl>

            {overCapacity ? (
              <Alert severity="warning">
                This section has {selectedSection?.enrolled_students} enrolled
                students but the room only holds{' '}
                {selectedRoom?.room_details.capacity}.
              </Alert>
            ) : null}

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <InputField
                type="date"
                labelDetail={{ text: 'Effective from', required: true }}
                name="effective_from"
                value={formik.values.effective_from}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={Boolean(
                  formik.touched.effective_from && formik.errors.effective_from
                )}
                helperText={
                  formik.touched.effective_from
                    ? formik.errors.effective_from
                    : undefined
                }
              />
              <InputField
                type="date"
                labelDetail={{
                  text: 'Effective to (optional)',
                  required: false,
                }}
                name="effective_to"
                value={formik.values.effective_to ?? ''}
                onChange={formik.handleChange}
                error={Boolean(
                  formik.touched.effective_to && formik.errors.effective_to
                )}
                helperText={
                  formik.touched.effective_to
                    ? formik.errors.effective_to
                    : undefined
                }
              />
            </Stack>

            <FormControlLabel
              control={
                <Checkbox
                  checked={formik.values.is_primary}
                  onChange={(event) =>
                    formik.setFieldValue('is_primary', event.target.checked)
                  }
                />
              }
              label="Primary classroom of the section"
            />

            <TextareaField
              variant="outlined"
              labelDetail={{ text: 'Notes', required: false }}
              minRows={2}
              name="notes"
              value={formik.values.notes ?? ''}
              onChange={formik.handleChange}
            />

            {allocation ? (
              <Typography fontSize={12} color={colors.grey[600]}>
                Currently effective since{' '}
                {formatDate(allocation.allocation_details.effective_from)}.
              </Typography>
            ) : null}

            <Stack direction="row" gap={2} justifyContent="flex-end">
              <ButtonComp variant="text" onClick={onClose}>
                Cancel
              </ButtonComp>
              <ButtonComp
                type="submit"
                loading={loading}
                disabled={!formik.dirty}
              >
                {allocation ? 'Save changes' : 'Allocate room'}
              </ButtonComp>
            </Stack>
          </Stack>
        </form>
      </Box>
    </SpringModal>
  )
}
