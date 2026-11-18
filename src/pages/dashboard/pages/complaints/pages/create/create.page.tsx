import {
  Box,
  Checkbox,
  FormControlLabel,
  Stack,
  Typography,
} from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Save } from 'lucide-react'
import toast from 'react-hot-toast'
import { ButtonComp } from '@src/components/button/button.component'
import { InputField } from '@src/components/input/input.component'
import { SelectField } from '@src/components/select/select.component'
import { colors } from '@src/helpers/colors.helpers'
import { useComplaintPermissions } from '@src/hooks/useComplaintPermissions.hooks'
import { useDispatch, useSelector } from '@src/store/hooks.store'
import { createComplaintAction } from '@src/store/redux/dashboard/complaints/complaints.slice'
import { getComplaintCategoriesAction } from '@src/store/redux/dashboard/complaints/complaintConfig.slice'
import {
  COMPLAINT_BASE_PATH,
  COMPLAINT_CHANNEL_OPTIONS,
  COMPLAINT_PRIORITY_OPTIONS,
  COMPLAINT_SEVERITY_OPTIONS,
} from '../../complaints.helpers'

const controlStyles = {
  control: (base: Record<string, unknown>) => ({
    ...base,
    minHeight: 38,
    fontSize: 13,
  }),
}

interface IFormState {
  title: string
  description: string
  categoryId: number | ''
  priority: Complaint.Priority
  severity: Complaint.Severity
  channel: Complaint.Channel
  isAnonymous: boolean
  isConfidential: boolean
  complainantName: string
  complainantPhone: string
  complainantEmail: string
}

const EMPTY_FORM: IFormState = {
  title: '',
  description: '',
  categoryId: '',
  priority: 'normal',
  severity: 'medium',
  channel: 'walk_in',
  isAnonymous: false,
  isConfidential: false,
  complainantName: '',
  complainantPhone: '',
  complainantEmail: '',
}

/**
 * Intake form: the office logs a complaint it received at the counter, by phone,
 * by letter or by e-mail, on behalf of the complainant.
 */
export function CreateComplaintPage() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { can } = useComplaintPermissions()

  const { data: categories, loading: categoriesLoading } = useSelector(
    (store) => store.complaintConfig.categories
  )
  const { loading: creating } = useSelector(
    (store) => store.complaints.createComplaint
  )

  const [form, setForm] = useState<IFormState>(EMPTY_FORM)

  useEffect(() => {
    dispatch(getComplaintCategoriesAction(false))
  }, [dispatch])

  const categoryOptions = useMemo(
    () =>
      (categories ?? []).map((category) => ({
        label: `${category.name} · ${category.default_priority}/${category.default_severity}`,
        value: category.id,
      })),
    [categories]
  )

  const selectedCategory = (categories ?? []).find(
    (category) => Number(category.id) === Number(form.categoryId)
  )

  const patch = (next: Partial<IFormState>) =>
    setForm((prev) => ({ ...prev, ...next }))

  /** Choosing a category pre-fills the defaults the school configured. */
  const pickCategory = (categoryId: number) => {
    const category = (categories ?? []).find(
      (item) => Number(item.id) === Number(categoryId)
    )

    patch({
      categoryId,
      priority: category?.default_priority ?? form.priority,
      severity: category?.default_severity ?? form.severity,
    })
  }

  const submit = () => {
    if (!form.categoryId) {
      toast.error('Choose the category of the complaint.')
      return
    }

    if (form.title.trim().length < 3) {
      toast.error('The title needs at least 3 characters.')
      return
    }

    if (!form.description.trim()) {
      toast.error('Describe the complaint.')
      return
    }

    if (!form.isAnonymous && !form.complainantName.trim()) {
      toast.error(
        'A complainant name is required unless the complaint is anonymous.'
      )
      return
    }

    dispatch(
      createComplaintAction({
        title: form.title.trim(),
        description: form.description,
        category_id: Number(form.categoryId),
        priority: form.priority,
        severity: form.severity,
        channel: form.channel,
        is_anonymous: form.isAnonymous,
        is_confidential: form.isConfidential,
        complainant_name: form.isAnonymous
          ? undefined
          : form.complainantName.trim() || undefined,
        complainant_phone: form.isAnonymous
          ? undefined
          : form.complainantPhone.trim() || undefined,
        complainant_email: form.isAnonymous
          ? undefined
          : form.complainantEmail.trim() || undefined,
        onSuccess: (id) => navigate(`${COMPLAINT_BASE_PATH}/${id}`),
      })
    )
  }

  if (!can('complaint.desk.create')) {
    return (
      <Stack p={3}>
        <Typography fontSize={14} color={colors.grey[700]}>
          You are not allowed to log complaints.
        </Typography>
      </Stack>
    )
  }

  return (
    <Stack spacing={2} p={{ xs: 2, md: 3 }}>
      <Stack direction="row" spacing={1.5} alignItems="center">
        <ButtonComp
          size="small"
          variant="text"
          startIcon={<ArrowLeft size={15} />}
          onClick={() => navigate(COMPLAINT_BASE_PATH)}
        >
          Back to the desk
        </ButtonComp>
      </Stack>

      <Box>
        <Typography fontSize={20} fontWeight={700} color={colors.grey[900]}>
          Log a complaint
        </Typography>
        <Typography fontSize={13} color={colors.grey[600]}>
          Intake on behalf of a student, a guardian or a staff member. The
          ticket number and the SLA deadline are assigned automatically.
        </Typography>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: {
            xs: '1fr',
            lg: 'minmax(0, 2fr) minmax(0, 1fr)',
          },
          alignItems: 'start',
        }}
      >
        <Stack
          spacing={2}
          sx={{
            borderRadius: 3,
            border: `1px solid ${colors.grey[200]}`,
            bgcolor: '#fff',
            p: 2.5,
          }}
        >
          <InputField
            labelDetail={{ text: 'Title', required: true }}
            placeholder="Short summary of the grievance"
            value={form.title}
            onChange={(event) => patch({ title: event.target.value })}
          />

          <InputField
            labelDetail={{ text: 'Description', required: true }}
            placeholder="What happened? Who is involved? When?"
            multiline
            minRows={6}
            value={form.description}
            onChange={(event) => patch({ description: event.target.value })}
          />

          <Box
            sx={{
              display: 'grid',
              gap: 1.5,
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, minmax(0, 1fr))',
              },
            }}
          >
            <Box>
              <Typography fontSize={13} fontWeight={500} mb={0.75}>
                Category *
              </Typography>
              <SelectField
                placeholder={
                  categoriesLoading ? 'Loading…' : 'Select a category'
                }
                options={categoryOptions}
                isLoading={categoriesLoading}
                value={
                  categoryOptions.find(
                    (option) => Number(option.value) === Number(form.categoryId)
                  ) ?? null
                }
                onChange={(option) =>
                  pickCategory((option as { value: number } | null)?.value ?? 0)
                }
                styles={controlStyles}
              />
              {selectedCategory ? (
                <Typography fontSize={11.5} color={colors.grey[500]} mt={0.5}>
                  Defaults: {selectedCategory.default_priority} priority,{' '}
                  {selectedCategory.default_severity} severity.
                </Typography>
              ) : null}
            </Box>

            <Box>
              <Typography fontSize={13} fontWeight={500} mb={0.75}>
                Channel
              </Typography>
              <SelectField
                options={COMPLAINT_CHANNEL_OPTIONS}
                value={
                  COMPLAINT_CHANNEL_OPTIONS.find(
                    (option) => option.value === form.channel
                  ) ?? null
                }
                onChange={(option) =>
                  patch({
                    channel:
                      (option as { value: Complaint.Channel } | null)?.value ??
                      'walk_in',
                  })
                }
                styles={controlStyles}
              />
            </Box>

            <Box>
              <Typography fontSize={13} fontWeight={500} mb={0.75}>
                Priority
              </Typography>
              <SelectField
                options={COMPLAINT_PRIORITY_OPTIONS}
                value={
                  COMPLAINT_PRIORITY_OPTIONS.find(
                    (option) => option.value === form.priority
                  ) ?? null
                }
                onChange={(option) =>
                  patch({
                    priority:
                      (option as { value: Complaint.Priority } | null)?.value ??
                      'normal',
                  })
                }
                styles={controlStyles}
              />
            </Box>

            <Box>
              <Typography fontSize={13} fontWeight={500} mb={0.75}>
                Severity
              </Typography>
              <SelectField
                options={COMPLAINT_SEVERITY_OPTIONS}
                value={
                  COMPLAINT_SEVERITY_OPTIONS.find(
                    (option) => option.value === form.severity
                  ) ?? null
                }
                onChange={(option) =>
                  patch({
                    severity:
                      (option as { value: Complaint.Severity } | null)?.value ??
                      'medium',
                  })
                }
                styles={controlStyles}
              />
            </Box>
          </Box>
        </Stack>

        <Stack
          spacing={2}
          sx={{
            borderRadius: 3,
            border: `1px solid ${colors.grey[200]}`,
            bgcolor: '#fff',
            p: 2.5,
          }}
        >
          <Typography fontSize={13} fontWeight={700} color={colors.grey[800]}>
            Complainant
          </Typography>

          <FormControlLabel
            control={
              <Checkbox
                size="small"
                checked={form.isAnonymous}
                onChange={(event) =>
                  patch({
                    isAnonymous: event.target.checked,
                    complainantName: '',
                    complainantPhone: '',
                    complainantEmail: '',
                  })
                }
              />
            }
            label={
              <Typography fontSize={12.5} color={colors.grey[700]}>
                Anonymous complaint
              </Typography>
            }
          />

          {form.isAnonymous ? (
            <Typography
              fontSize={11.5}
              color={colors.grey[600]}
              sx={{
                bgcolor: colors.grey[50],
                border: `1px dashed ${colors.grey[300]}`,
                borderRadius: 2,
                p: 1,
              }}
            >
              No complainant identity will be stored. This is enforced by the
              database, not only by this form.
            </Typography>
          ) : (
            <>
              <InputField
                labelDetail={{ text: 'Full name', required: true }}
                placeholder="Name of the complainant"
                value={form.complainantName}
                onChange={(event) =>
                  patch({ complainantName: event.target.value })
                }
              />
              <InputField
                labelDetail={{ text: 'Phone', required: false }}
                placeholder="98XXXXXXXX"
                value={form.complainantPhone}
                onChange={(event) =>
                  patch({ complainantPhone: event.target.value })
                }
              />
              <InputField
                labelDetail={{ text: 'Email', required: false }}
                placeholder="name@example.com"
                value={form.complainantEmail}
                onChange={(event) =>
                  patch({ complainantEmail: event.target.value })
                }
              />
            </>
          )}

          <FormControlLabel
            control={
              <Checkbox
                size="small"
                checked={form.isConfidential}
                onChange={(event) =>
                  patch({ isConfidential: event.target.checked })
                }
              />
            }
            label={
              <Typography fontSize={12.5} color={colors.grey[700]}>
                Confidential (admins and the assignee only)
              </Typography>
            }
          />
          {form.isConfidential ? (
            <Typography fontSize={11.5} color={colors.orange[800]}>
              Staff members will not see this ticket in the desk until they are
              assigned to it.
            </Typography>
          ) : null}

          <Stack direction="row" spacing={1} justifyContent="flex-end" mt={1}>
            <ButtonComp
              size="small"
              variant="text"
              onClick={() => navigate(COMPLAINT_BASE_PATH)}
            >
              Cancel
            </ButtonComp>
            <ButtonComp
              size="small"
              variant="contained"
              startIcon={<Save size={15} />}
              loading={creating}
              onClick={submit}
            >
              Log complaint
            </ButtonComp>
          </Stack>
        </Stack>
      </Box>
    </Stack>
  )
}
