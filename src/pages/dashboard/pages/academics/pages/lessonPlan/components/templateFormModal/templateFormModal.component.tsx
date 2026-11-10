import { Box, Checkbox, Divider, Stack, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import SpringModal from '@src/components/modal/modal.component'
import { ButtonComp } from '@src/components/button/button.component'
import { InputField } from '@src/components/input/input.component'
import { TinyMceEditor } from '@src/components/tinyMce/tinyMceEditor.component'
import { CustomSwitch } from '@src/components/switch/switch.component'
import { colors } from '@src/helpers/colors.helpers'
import { ICreateLessonPlanTemplateDto } from '@src/store/redux/dashboard/academics/lessonPlans/lessonPlans.service'

interface Props {
  open: boolean
  onClose: () => void
  template: LessonPlan.ITemplate | null
  loading?: boolean
  onSubmit: (body: ICreateLessonPlanTemplateDto) => void
}

export const STANDARD_TEMPLATE_FIELDS: LessonPlan.ITemplateField[] = [
  { key: 'objectives', label: 'Learning objectives', required: true },
  { key: 'methodology', label: 'Methodology', required: false },
  { key: 'resources', label: 'Resources required', required: false },
  { key: 'assessment', label: 'Assessment', required: false },
  { key: 'homework', label: 'Homework', required: false },
]

export function TemplateFormModal({
  open,
  onClose,
  template,
  loading = false,
  onSubmit,
}: Props) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [isDefault, setIsDefault] = useState(false)
  const [fields, setFields] = useState<LessonPlan.ITemplateField[]>(
    STANDARD_TEMPLATE_FIELDS
  )
  const [defaultObjectives, setDefaultObjectives] = useState('')
  const [defaultMethodology, setDefaultMethodology] = useState('')
  const [defaultAssessment, setDefaultAssessment] = useState('')

  useEffect(() => {
    if (!open) {
      return
    }
    setName(template?.name ?? '')
    setDescription(template?.description ?? '')
    setIsActive(template?.is_active ?? true)
    setIsDefault(template?.is_default ?? false)
    setFields(
      template && template.fields?.length > 0
        ? template.fields
        : STANDARD_TEMPLATE_FIELDS
    )
    setDefaultObjectives(template?.default_objectives ?? '')
    setDefaultMethodology(template?.default_methodology ?? '')
    setDefaultAssessment(template?.default_assessment ?? '')
  }, [open, template])

  const updateField = (
    index: number,
    key: keyof LessonPlan.ITemplateField,
    value: string | boolean
  ) => {
    setFields((prev) =>
      prev.map((field, fieldIndex) =>
        fieldIndex === index ? { ...field, [key]: value } : field
      )
    )
  }

  const addField = () => {
    const usedKeys = fields.map((field) => field.key)
    const nextStandard = STANDARD_TEMPLATE_FIELDS.find(
      (field) => !usedKeys.includes(field.key)
    )
    setFields((prev) => [
      ...prev,
      nextStandard ?? { key: '', label: '', required: false },
    ])
  }

  const removeField = (index: number) => {
    setFields((prev) => prev.filter((_, fieldIndex) => fieldIndex !== index))
  }

  const handleSubmit = () => {
    const cleanedFields = fields
      .filter((field) => field.key.trim() && field.label.trim())
      .map((field) => ({
        key: field.key.trim(),
        label: field.label.trim(),
        required: Boolean(field.required),
        ...(field.placeholder?.trim()
          ? { placeholder: field.placeholder.trim() }
          : {}),
      }))

    onSubmit({
      name: name.trim(),
      ...(description.trim() ? { description: description.trim() } : {}),
      is_active: isActive,
      is_default: isDefault,
      fields: cleanedFields,
      ...(defaultObjectives.trim()
        ? { default_objectives: defaultObjectives.trim() }
        : {}),
      ...(defaultMethodology.trim()
        ? { default_methodology: defaultMethodology.trim() }
        : {}),
      ...(defaultAssessment.trim()
        ? { default_assessment: defaultAssessment.trim() }
        : {}),
    })
  }

  return (
    <SpringModal open={open} close={onClose} size="sm">
      <Box sx={{ width: '100%' }}>
        <Typography fontSize={17} fontWeight={700} color={colors.grey[900]}>
          {template ? 'Edit plan template' : 'New plan template'}
        </Typography>
        <Typography fontSize={12.5} color={colors.grey[600]} mt={0.25} mb={2}>
          Templates define which fields a teacher must fill while preparing a
          lesson plan.
        </Typography>

        <Box
          sx={{
            display: 'grid',
            gap: 1.5,
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
          }}
        >
          <InputField
            placeholder="Template name"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <InputField
            placeholder="Short description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </Box>

        <Stack direction="row" spacing={4} mt={1.5}>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <CustomSwitch
              checked={isActive}
              onChange={(event) => setIsActive(event.target.checked)}
            />
            <Typography fontSize={12.5} color={colors.grey[700]}>
              Active
            </Typography>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <CustomSwitch
              checked={isDefault}
              onChange={(event) => setIsDefault(event.target.checked)}
            />
            <Typography fontSize={12.5} color={colors.grey[700]}>
              School default
            </Typography>
          </Stack>
        </Stack>

        <Divider sx={{ my: 2 }} />

        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          mb={1}
        >
          <Typography fontSize={13} fontWeight={700} color={colors.grey[800]}>
            Fields
          </Typography>
          <ButtonComp
            size="small"
            variant="text"
            startIcon={<Plus size={14} />}
            onClick={addField}
          >
            Add field
          </ButtonComp>
        </Stack>

        <Stack spacing={1}>
          {fields.map((field, index) => (
            <Stack
              key={`${field.key}-${index}`}
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1}
              alignItems={{ xs: 'stretch', sm: 'center' }}
            >
              <Box sx={{ width: { xs: '100%', sm: 130 } }}>
                <InputField
                  placeholder="key"
                  value={field.key}
                  onChange={(event) =>
                    updateField(index, 'key', event.target.value)
                  }
                />
              </Box>
              <Box flex={1}>
                <InputField
                  placeholder="Label shown to the teacher"
                  value={field.label}
                  onChange={(event) =>
                    updateField(index, 'label', event.target.value)
                  }
                />
              </Box>
              <Stack direction="row" alignItems="center" spacing={0.25}>
                <Checkbox
                  size="small"
                  checked={Boolean(field.required)}
                  onChange={(event) =>
                    updateField(index, 'required', event.target.checked)
                  }
                  sx={{ p: 0.5 }}
                />
                <Typography fontSize={11.5} color={colors.grey[600]}>
                  Required
                </Typography>
              </Stack>
              <Box
                component="button"
                onClick={() => removeField(index)}
                sx={{
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  color: colors.grey[400],
                  display: 'flex',
                  '&:hover': { color: colors.red[400] },
                }}
              >
                <Trash2 size={15} />
              </Box>
            </Stack>
          ))}
        </Stack>

        <Divider sx={{ my: 2 }} />

        <Typography
          fontSize={13}
          fontWeight={700}
          color={colors.grey[800]}
          mb={1}
        >
          Default content pre-filled for teachers
        </Typography>
        <Stack spacing={1.25}>
          <TinyMceEditor
            placeholder="Default learning objectives"
            height={140}
            compact
            value={defaultObjectives}
            onChange={setDefaultObjectives}
          />
          <TinyMceEditor
            placeholder="Default methodology"
            height={140}
            compact
            value={defaultMethodology}
            onChange={setDefaultMethodology}
          />
          <TinyMceEditor
            placeholder="Default assessment"
            height={140}
            compact
            value={defaultAssessment}
            onChange={setDefaultAssessment}
          />
        </Stack>

        <Stack direction="row" spacing={1} justifyContent="flex-end" mt={2.5}>
          <ButtonComp variant="outlined" size="medium" onClick={onClose}>
            Cancel
          </ButtonComp>
          <ButtonComp
            size="medium"
            loading={loading}
            disabled={!name.trim()}
            onClick={handleSubmit}
          >
            {template ? 'Save template' : 'Create template'}
          </ButtonComp>
        </Stack>
      </Box>
    </SpringModal>
  )
}
