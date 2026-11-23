import { Box, Stack, Typography } from '@mui/material'
import { useFormik } from 'formik'
import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { ButtonComp } from '@src/components/button/button.component'
import {
  InputField,
  TextareaField,
} from '@src/components/input/input.component'
import SpringModal from '@src/components/modal/modal.component'
import { errResponse } from '@src/helpers/errResponse.helper'
import {
  createFacilityService,
  createRoomTypeService,
  updateFacilityService,
  updateRoomTypeService,
} from '@src/store/redux/dashboard/rooms/rooms.service'
import { masterRecordFormSchema } from '../../rooms.schema'

type Kind = 'room-type' | 'facility'

interface Props {
  open: boolean
  onClose: () => void
  kind: Kind
  record?: Rooms.IRoomType | Rooms.IFacility | null
  onSaved: () => void
}

export function MasterRecordModal({
  open,
  onClose,
  kind,
  record,
  onSaved,
}: Props) {
  const [saving, setSaving] = useState(false)
  const isRoomType = kind === 'room-type'
  const label = isRoomType ? 'room type' : 'facility'

  const formik = useFormik({
    initialValues: {
      name: record?.name ?? '',
      code: record?.code ?? '',
      description: record?.description ?? '',
    },
    enableReinitialize: true,
    validationSchema: masterRecordFormSchema,
    onSubmit: async (values) => {
      setSaving(true)

      try {
        const body = {
          name: values.name.trim(),
          code: values.code.trim(),
          description: values.description?.trim() || null,
        }

        if (isRoomType) {
          if (record) {
            await updateRoomTypeService(record.id, body)
          } else {
            await createRoomTypeService(body)
          }
        } else if (record) {
          await updateFacilityService(record.id, body)
        } else {
          await createFacilityService(body)
        }

        toast.success(`${label} saved.`)
        onSaved()
        onClose()
      } catch (error) {
        toast.error(errResponse(error))
      } finally {
        setSaving(false)
      }
    },
  })

  return (
    <SpringModal open={open} close={onClose}>
      <Box>
        <Typography variant="h6" fontWeight={700} mb={2}>
          {record ? 'Edit' : 'Create'} {label}
        </Typography>
        <form onSubmit={formik.handleSubmit}>
          <Stack spacing={2}>
            <InputField
              placeholder={isRoomType ? 'Science Lab' : 'Projector'}
              labelDetail={{ text: 'Name', required: true }}
              name="name"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={Boolean(formik.touched.name && formik.errors.name)}
              helperText={formik.touched.name ? formik.errors.name : undefined}
            />
            <InputField
              placeholder={isRoomType ? 'LAB' : 'PROJECTOR'}
              labelDetail={{ text: 'Code', required: true }}
              name="code"
              value={formik.values.code}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={Boolean(formik.touched.code && formik.errors.code)}
              helperText={formik.touched.code ? formik.errors.code : undefined}
            />
            <TextareaField
              variant="outlined"
              labelDetail={{ text: 'Description', required: false }}
              minRows={2}
              name="description"
              value={formik.values.description ?? ''}
              onChange={formik.handleChange}
            />
          </Stack>
          <Stack direction="row" mt={3} gap={2} justifyContent="flex-end">
            <ButtonComp variant="text" onClick={onClose}>
              Cancel
            </ButtonComp>
            <ButtonComp type="submit" loading={saving} disabled={!formik.dirty}>
              Save
            </ButtonComp>
          </Stack>
        </form>
      </Box>
    </SpringModal>
  )
}
