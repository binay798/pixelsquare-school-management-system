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
  createBuildingService,
  updateBuildingService,
} from '@src/store/redux/dashboard/rooms/rooms.service'
import { buildingFormSchema } from '../../rooms.schema'

interface Props {
  open: boolean
  onClose: () => void
  building?: Rooms.IBuilding | null
  onSaved: () => void
}

export function BuildingModal({ open, onClose, building, onSaved }: Props) {
  const [saving, setSaving] = useState(false)

  const formik = useFormik({
    initialValues: {
      name: building?.name ?? '',
      code: building?.code ?? '',
      description: building?.description ?? '',
    },
    enableReinitialize: true,
    validationSchema: buildingFormSchema,
    onSubmit: async (values) => {
      setSaving(true)

      try {
        const body = {
          name: values.name.trim(),
          code: values.code.trim(),
          description: values.description?.trim() || null,
        }

        if (building) {
          await updateBuildingService(building.id, body)
        } else {
          await createBuildingService(body)
        }

        toast.success(building ? 'Building updated.' : 'Building created.')
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
          {building ? 'Edit building' : 'Create building'}
        </Typography>
        <form onSubmit={formik.handleSubmit}>
          <Stack spacing={2}>
            <InputField
              placeholder="Main Building"
              labelDetail={{ text: 'Building name', required: true }}
              name="name"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={Boolean(formik.touched.name && formik.errors.name)}
              helperText={formik.touched.name ? formik.errors.name : undefined}
            />
            <InputField
              placeholder="BLK-A"
              labelDetail={{ text: 'Building code', required: true }}
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
              {building ? 'Save changes' : 'Create building'}
            </ButtonComp>
          </Stack>
        </form>
      </Box>
    </SpringModal>
  )
}
