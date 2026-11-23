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
  createFloorService,
  updateFloorService,
} from '@src/store/redux/dashboard/rooms/rooms.service'
import { floorFormSchema } from '../../rooms.schema'

interface Props {
  open: boolean
  onClose: () => void
  buildingId: number | null
  floor?: Rooms.IFloor | null
  onSaved: () => void
}

export function FloorModal({
  open,
  onClose,
  buildingId,
  floor,
  onSaved,
}: Props) {
  const [saving, setSaving] = useState(false)

  const formik = useFormik({
    initialValues: {
      name: floor?.name ?? '',
      floor_number: floor?.floor_number ?? 0,
      description: floor?.description ?? '',
    },
    enableReinitialize: true,
    validationSchema: floorFormSchema,
    onSubmit: async (values) => {
      if (!buildingId) {
        return
      }

      setSaving(true)

      try {
        const body = {
          name: values.name.trim(),
          floor_number: Number(values.floor_number),
          description: values.description?.trim() || null,
        }

        if (floor) {
          await updateFloorService(buildingId, floor.id, body)
        } else {
          await createFloorService(buildingId, body)
        }

        toast.success(floor ? 'Floor updated.' : 'Floor created.')
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
          {floor ? 'Edit floor' : 'Add floor'}
        </Typography>
        <form onSubmit={formik.handleSubmit}>
          <Stack spacing={2}>
            <InputField
              placeholder="Ground Floor"
              labelDetail={{ text: 'Floor name', required: true }}
              name="name"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={Boolean(formik.touched.name && formik.errors.name)}
              helperText={formik.touched.name ? formik.errors.name : undefined}
            />
            <InputField
              type="number"
              placeholder="0"
              labelDetail={{ text: 'Floor number', required: true }}
              name="floor_number"
              value={formik.values.floor_number}
              onChange={(event) =>
                formik.setFieldValue('floor_number', Number(event.target.value))
              }
              onBlur={formik.handleBlur}
              error={Boolean(
                formik.touched.floor_number && formik.errors.floor_number
              )}
              helperText={
                formik.touched.floor_number
                  ? formik.errors.floor_number
                  : undefined
              }
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
              {floor ? 'Save changes' : 'Add floor'}
            </ButtonComp>
          </Stack>
        </form>
      </Box>
    </SpringModal>
  )
}
