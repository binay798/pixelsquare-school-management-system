import { Box, Stack, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import SpringModal from '@src/components/modal/modal.component'
import { ButtonComp } from '@src/components/button/button.component'
import { InputField } from '@src/components/input/input.component'
import { SelectField } from '@src/components/select/select.component'
import { colors } from '@src/helpers/colors.helpers'
import { useDispatch, useSelector } from '@src/store/hooks.store'
import { duplicateFeeTemplateAction } from '@src/store/redux/dashboard/fee/fee.config.slice'
import { IOption } from '../../../fees.helpers'

interface Props {
  open: boolean
  onClose: () => void
  template: Fee.IFeeTemplate | null
  onSaved: () => void
}

/** Duplicate a template (`POST /fees/templates/:id/duplicate`). */
export function DuplicateTemplateModal({
  open,
  onClose,
  template,
  onSaved,
}: Props) {
  const dispatch = useDispatch()
  const { data: academicYears } = useSelector(
    (store) => store.academicYear.academicYearList
  )
  const { loading } = useSelector((store) => store.feeConfig.templateMutation)

  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [academicYearId, setAcademicYearId] = useState<number | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open || !template) {
      return
    }

    setCode(`${template.code}-COPY`)
    setName(`${template.name} (copy)`)
    setAcademicYearId(template.academic_year_id)
    setError('')
  }, [open, template])

  const yearOptions: IOption[] = (academicYears ?? []).map((year) => ({
    value: String(year.id),
    label: year.name,
  }))

  const submit = () => {
    if (!template) {
      return
    }

    if (code.trim().length < 2) {
      setError('A code of at least 2 characters is required.')

      return
    }

    dispatch(
      duplicateFeeTemplateAction({
        templateId: template.id,
        payload: {
          code: code.trim().toUpperCase(),
          name: name.trim() || undefined,
          academic_year_id: academicYearId ?? undefined,
        },
        onSuccess: () => {
          onSaved()
          onClose()
        },
      })
    )
  }

  return (
    <SpringModal open={open} close={onClose} size="sm">
      <Box sx={{ minWidth: { xs: 'auto', sm: 460 } }}>
        <Typography fontSize={16} fontWeight={700} color={colors.grey[900]}>
          Duplicate template
        </Typography>
        <Typography fontSize={12.5} color={colors.grey[500]} mt={0.25} mb={2}>
          The copy keeps every fee component and is created as a DRAFT so it can
          be reviewed before billing.
        </Typography>

        <Stack spacing={1.5}>
          <InputField
            labelDetail={{ text: 'New code', required: true }}
            value={code}
            error={Boolean(error)}
            helperText={error}
            onChange={(event) => setCode(event.target.value.toUpperCase())}
          />
          <InputField
            labelDetail={{ text: 'New name', required: false }}
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <Box>
            <Typography fontSize={13} color={colors.grey[800]} mb={1}>
              Academic year
            </Typography>
            <SelectField
              options={yearOptions}
              value={
                yearOptions.find(
                  (option) => option.value === String(academicYearId)
                ) ?? null
              }
              onChange={(option) =>
                setAcademicYearId(
                  option ? Number((option as IOption).value) : null
                )
              }
            />
          </Box>
        </Stack>

        <Stack direction="row" spacing={1} justifyContent="flex-end" mt={2.5}>
          <ButtonComp variant="outlined" color="error" onClick={onClose}>
            Cancel
          </ButtonComp>
          <ButtonComp loading={loading} onClick={submit}>
            Duplicate
          </ButtonComp>
        </Stack>
      </Box>
    </SpringModal>
  )
}
