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
import { saveMaintenanceAction } from '@src/store/redux/dashboard/rooms/rooms.slice'
import { getRoomListService } from '@src/store/redux/dashboard/rooms/rooms.service'
import { maintenanceFormSchema } from '../../rooms.schema'
import { MAINTENANCE_STATUS_OPTIONS, titleCase } from '../../rooms.helpers'

interface Props {
  open: boolean
  onClose: () => void
  record?: Rooms.IMaintenanceListRow | null
  onSaved: () => void
}

type Option = { label: string; value: string | number }

export function MaintenanceModal({ open, onClose, record, onSaved }: Props) {
  const dispatch = useDispatch()
  const { loading } = useSelector((store) => store.rooms.mutation)
  const [rooms, setRooms] = useState<Rooms.IRoomListRow[]>([])
  const details = record?.maintenance_details

  useEffect(() => {
    getRoomListService({ limit: 500 })
      .then((res) => setRooms(res.rows))
      .catch(() => setRooms([]))
  }, [])

  const formik = useFormik({
    initialValues: {
      room_id: record
        ? {
            label: `${record.room_details.name} (${record.room_details.code})`,
            value: record.room_details.id,
          }
        : (null as Option | null),
      issue: details?.issue ?? '',
      description: details?.description ?? '',
      maintenance_date:
        details?.maintenance_date ?? new Date().toISOString().slice(0, 10),
      scheduled_from: details?.scheduled_from ?? '',
      scheduled_to: details?.scheduled_to ?? '',
      status: {
        label: titleCase(details?.status ?? 'open'),
        value: details?.status ?? 'open',
      } as Option,
      cost: details?.cost ? Number(details.cost) : (null as number | null),
      remarks: details?.remarks ?? '',
    },
    enableReinitialize: true,
    validationSchema: maintenanceFormSchema,
    onSubmit: (values) => {
      const body = {
        room_id: values.room_id?.value,
        issue: values.issue.trim(),
        description: values.description?.trim() || null,
        maintenance_date: values.maintenance_date,
        scheduled_from: values.scheduled_from || null,
        scheduled_to: values.scheduled_to || null,
        status: values.status.value,
        cost: values.cost,
        remarks: values.remarks?.trim() || null,
      }

      dispatch(
        saveMaintenanceAction({
          maintenanceId: details?.id,
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
      rooms.map((room) => ({
        label: `${room.room_details.name} (${room.room_details.code}) · ${room.room_details.status}`,
        value: room.room_details.id,
      })),
    [rooms]
  )

  const blocksRoom = ['open', 'in_progress'].includes(
    String(formik.values.status.value)
  )

  return (
    <SpringModal open={open} close={onClose} size="md">
      <Box>
        <Typography variant="h6" fontWeight={700} mb={0.5}>
          {record ? 'Update maintenance' : 'Record maintenance'}
        </Typography>
        <Typography fontSize={13} color={colors.grey[600]} mb={2.5}>
          A blocking maintenance record (open or in progress) makes the room
          unavailable for new bookings until it is completed or cancelled.
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
                onChange={(option) =>
                  formik.setFieldValue('room_id', option as Option | null)
                }
                isDisabled={Boolean(record)}
              />
            </FormControl>

            <InputField
              placeholder="Broken projector, leaking roof..."
              labelDetail={{ text: 'Issue', required: true }}
              name="issue"
              value={formik.values.issue}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={Boolean(formik.touched.issue && formik.errors.issue)}
              helperText={
                formik.touched.issue ? formik.errors.issue : undefined
              }
            />

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <InputField
                type="date"
                labelDetail={{ text: 'Reported on', required: true }}
                name="maintenance_date"
                value={formik.values.maintenance_date}
                onChange={formik.handleChange}
              />
              <InputField
                type="date"
                labelDetail={{
                  text: 'Blocked from (optional)',
                  required: false,
                }}
                name="scheduled_from"
                value={formik.values.scheduled_from ?? ''}
                onChange={formik.handleChange}
              />
              <InputField
                type="date"
                labelDetail={{ text: 'Blocked to (optional)', required: false }}
                name="scheduled_to"
                value={formik.values.scheduled_to ?? ''}
                onChange={formik.handleChange}
                error={Boolean(
                  formik.touched.scheduled_to && formik.errors.scheduled_to
                )}
                helperText={
                  formik.touched.scheduled_to
                    ? formik.errors.scheduled_to
                    : undefined
                }
              />
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <FormControl fullWidth>
                <FormLabel
                  sx={{ fontSize: 13, mb: 1, color: colors.grey[800] }}
                >
                  Status
                </FormLabel>
                <SelectField
                  options={MAINTENANCE_STATUS_OPTIONS}
                  value={formik.values.status}
                  onChange={(option) =>
                    formik.setFieldValue('status', option as Option)
                  }
                />
              </FormControl>
              <InputField
                type="number"
                placeholder="0.00"
                labelDetail={{ text: 'Cost (NPR)', required: false }}
                name="cost"
                value={formik.values.cost ?? ''}
                onChange={(event) =>
                  formik.setFieldValue(
                    'cost',
                    event.target.value === ''
                      ? null
                      : Number(event.target.value)
                  )
                }
              />
            </Stack>

            {blocksRoom ? (
              <Alert severity="info">
                While this record is open or in progress, the room is blocked
                for every new booking and section allocation.
              </Alert>
            ) : null}

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
              labelDetail={{ text: 'Remarks', required: false }}
              minRows={2}
              name="remarks"
              value={formik.values.remarks ?? ''}
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
                {record ? 'Save changes' : 'Record maintenance'}
              </ButtonComp>
            </Stack>
          </Stack>
        </form>
      </Box>
    </SpringModal>
  )
}
