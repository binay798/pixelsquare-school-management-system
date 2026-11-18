import {
  Box,
  Checkbox,
  FormControlLabel,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tabs,
  Typography,
} from '@mui/material'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Pencil, Plus, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { ButtonComp } from '@src/components/button/button.component'
import { InputField } from '@src/components/input/input.component'
import { SelectField } from '@src/components/select/select.component'
import SpringModal from '@src/components/modal/modal.component'
import { DeleteConfirmationModal } from '@src/components/confirmationModal/deleteConfirmationModal.component'
import { colors } from '@src/helpers/colors.helpers'
import { useComplaintPermissions } from '@src/hooks/useComplaintPermissions.hooks'
import { useDispatch, useSelector } from '@src/store/hooks.store'
import {
  createComplaintCategoryAction,
  createComplaintSlaPolicyAction,
  deleteComplaintCategoryAction,
  deleteComplaintSlaPolicyAction,
  getComplaintCategoriesAction,
  getComplaintSlaPoliciesAction,
  updateComplaintCategoryAction,
  updateComplaintSlaPolicyAction,
} from '@src/store/redux/dashboard/complaints/complaintConfig.slice'
import {
  COMPLAINT_BASE_PATH,
  COMPLAINT_PRIORITY_OPTIONS,
  COMPLAINT_SEVERITY_OPTIONS,
  formatSlaMinutes,
} from '../../complaints.helpers'

const controlStyles = {
  control: (base: Record<string, unknown>) => ({
    ...base,
    minHeight: 36,
    fontSize: 13,
  }),
}

interface ICategoryForm {
  id?: number
  name: string
  code: string
  description: string
  default_priority: Complaint.Priority
  default_severity: Complaint.Severity
  sort_order: number
  is_active: boolean
}

const EMPTY_CATEGORY: ICategoryForm = {
  name: '',
  code: '',
  description: '',
  default_priority: 'normal',
  default_severity: 'medium',
  sort_order: 0,
  is_active: true,
}

interface IPolicyForm {
  id?: number
  category_id: number | ''
  severity: Complaint.Severity | ''
  first_response_minutes: number
  resolution_minutes: number
  level_1_after_minutes: number
  level_2_after_minutes: number
  is_active: boolean
}

const EMPTY_POLICY: IPolicyForm = {
  category_id: '',
  severity: '',
  first_response_minutes: 1440,
  resolution_minutes: 4320,
  level_1_after_minutes: 4320,
  level_2_after_minutes: 7200,
  is_active: true,
}

export function ComplaintConfigPage() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { can } = useComplaintPermissions()

  const { data: categories } = useSelector(
    (store) => store.complaintConfig.categories
  )
  const { data: policies } = useSelector(
    (store) => store.complaintConfig.slaPolicies
  )
  const { loading: categorySaving } = useSelector(
    (store) => store.complaintConfig.categoryMutation
  )
  const { loading: policySaving } = useSelector(
    (store) => store.complaintConfig.policyMutation
  )

  const [tab, setTab] = useState<'categories' | 'sla'>('categories')
  const [categoryForm, setCategoryForm] =
    useState<ICategoryForm>(EMPTY_CATEGORY)
  const [categoryOpen, setCategoryOpen] = useState(false)
  const [deleteCategoryId, setDeleteCategoryId] = useState<number | null>(null)

  const [policyForm, setPolicyForm] = useState<IPolicyForm>(EMPTY_POLICY)
  const [policyOpen, setPolicyOpen] = useState(false)
  const [deletePolicyId, setDeletePolicyId] = useState<number | null>(null)

  const reload = () => {
    dispatch(getComplaintCategoriesAction(true))
    dispatch(getComplaintSlaPoliciesAction())
  }

  useEffect(() => {
    reload()
  }, [dispatch])

  const openCategory = (category?: Complaint.ICategory) => {
    setCategoryForm(
      category
        ? {
            id: category.id,
            name: category.name,
            code: category.code,
            description: category.description ?? '',
            default_priority: category.default_priority,
            default_severity: category.default_severity,
            sort_order: category.sort_order,
            is_active: category.is_active,
          }
        : EMPTY_CATEGORY
    )
    setCategoryOpen(true)
  }

  const submitCategory = () => {
    if (categoryForm.name.trim().length < 2) {
      toast.error('The name needs at least 2 characters.')
      return
    }

    if (!/^[a-z0-9_]+$/.test(categoryForm.code.trim())) {
      toast.error(
        'The code accepts lower case letters, digits and underscores.'
      )
      return
    }

    const payload = {
      name: categoryForm.name.trim(),
      code: categoryForm.code.trim(),
      description: categoryForm.description.trim() || null,
      default_priority: categoryForm.default_priority,
      default_severity: categoryForm.default_severity,
      sort_order: Number(categoryForm.sort_order) || 0,
      is_active: categoryForm.is_active,
    }

    const onSuccess = () => {
      setCategoryOpen(false)
      reload()
    }

    if (categoryForm.id) {
      dispatch(
        updateComplaintCategoryAction({
          categoryId: categoryForm.id,
          payload,
          onSuccess,
        })
      )
      return
    }

    dispatch(createComplaintCategoryAction({ payload, onSuccess }))
  }

  const openPolicy = (policy?: Complaint.ISlaPolicy) => {
    setPolicyForm(
      policy
        ? {
            id: policy.id,
            category_id: policy.category_id ?? '',
            severity: policy.severity ?? '',
            first_response_minutes: policy.first_response_minutes,
            resolution_minutes: policy.resolution_minutes,
            level_1_after_minutes: policy.level_1_after_minutes ?? 0,
            level_2_after_minutes: policy.level_2_after_minutes ?? 0,
            is_active: policy.is_active,
          }
        : EMPTY_POLICY
    )
    setPolicyOpen(true)
  }

  const submitPolicy = () => {
    if (policyForm.resolution_minutes < policyForm.first_response_minutes) {
      toast.error(
        'The resolution target cannot be shorter than the response target.'
      )
      return
    }

    const payload = {
      category_id: policyForm.category_id
        ? Number(policyForm.category_id)
        : null,
      severity: policyForm.severity || null,
      first_response_minutes: Number(policyForm.first_response_minutes),
      resolution_minutes: Number(policyForm.resolution_minutes),
      level_1_after_minutes: policyForm.level_1_after_minutes
        ? Number(policyForm.level_1_after_minutes)
        : null,
      level_2_after_minutes: policyForm.level_2_after_minutes
        ? Number(policyForm.level_2_after_minutes)
        : null,
      is_active: policyForm.is_active,
    }

    const onSuccess = () => {
      setPolicyOpen(false)
      reload()
    }

    if (policyForm.id) {
      dispatch(
        updateComplaintSlaPolicyAction({
          policyId: policyForm.id,
          payload,
          onSuccess,
        })
      )
      return
    }

    dispatch(createComplaintSlaPolicyAction({ payload, onSuccess }))
  }

  if (!can('complaint.config.manage')) {
    return (
      <Stack p={3} spacing={1.5}>
        <Typography fontSize={15} fontWeight={600} color={colors.grey[800]}>
          Configuration is restricted to administrators.
        </Typography>
        <ButtonComp
          size="small"
          variant="outlined"
          startIcon={<ArrowLeft size={15} />}
          onClick={() => navigate(COMPLAINT_BASE_PATH)}
        >
          Back to the desk
        </ButtonComp>
      </Stack>
    )
  }

  return (
    <Stack spacing={2} p={{ xs: 2, md: 3 }}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', md: 'center' }}
        spacing={1.5}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <ButtonComp
            size="small"
            variant="text"
            startIcon={<ArrowLeft size={15} />}
            onClick={() => navigate(COMPLAINT_BASE_PATH)}
          >
            Desk
          </ButtonComp>
          <Box>
            <Typography fontSize={20} fontWeight={700} color={colors.grey[900]}>
              Categories & SLA
            </Typography>
            <Typography fontSize={12.5} color={colors.grey[600]}>
              The taxonomy of the desk and the response targets the sweep uses.
            </Typography>
          </Box>
        </Stack>

        <ButtonComp
          size="small"
          variant="contained"
          startIcon={<Plus size={15} />}
          onClick={() => (tab === 'categories' ? openCategory() : openPolicy())}
        >
          {tab === 'categories' ? 'New category' : 'New SLA policy'}
        </ButtonComp>
      </Stack>

      <Tabs
        value={tab}
        onChange={(_, value) => setTab(value)}
        sx={{ borderBottom: `1px solid ${colors.grey[200]}` }}
      >
        <Tab value="categories" label="Categories" />
        <Tab value="sla" label="SLA policies" />
      </Tabs>

      {tab === 'categories' ? (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Code</TableCell>
              <TableCell>Defaults</TableCell>
              <TableCell>Used by</TableCell>
              <TableCell>Active</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(categories ?? []).map((category) => (
              <TableRow key={category.id}>
                <TableCell>{category.name}</TableCell>
                <TableCell>{category.code}</TableCell>
                <TableCell>
                  {category.default_priority} / {category.default_severity}
                </TableCell>
                <TableCell>{category.usage_count}</TableCell>
                <TableCell>
                  <Checkbox
                    size="small"
                    checked={category.is_active}
                    onChange={(event) =>
                      dispatch(
                        updateComplaintCategoryAction({
                          categoryId: category.id,
                          payload: { is_active: event.target.checked },
                          onSuccess: reload,
                        })
                      )
                    }
                  />
                </TableCell>
                <TableCell align="right">
                  <ButtonComp
                    size="small"
                    variant="text"
                    onClick={() => openCategory(category)}
                    startIcon={<Pencil size={13} />}
                  >
                    Edit
                  </ButtonComp>
                  <ButtonComp
                    size="small"
                    variant="text"
                    color="error"
                    onClick={() => setDeleteCategoryId(category.id)}
                    startIcon={<Trash2 size={13} />}
                  >
                    Delete
                  </ButtonComp>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Scope</TableCell>
              <TableCell>First response</TableCell>
              <TableCell>Resolution</TableCell>
              <TableCell>L1 / L2</TableCell>
              <TableCell>Active</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(policies ?? []).map((policy) => (
              <TableRow key={policy.id}>
                <TableCell>
                  {policy.category_name ?? 'All categories'} ·{' '}
                  {policy.severity ?? 'all severities'}
                </TableCell>
                <TableCell>
                  {formatSlaMinutes(policy.first_response_minutes)}
                </TableCell>
                <TableCell>
                  {formatSlaMinutes(policy.resolution_minutes)}
                </TableCell>
                <TableCell>
                  {formatSlaMinutes(policy.level_1_after_minutes)} /{' '}
                  {formatSlaMinutes(policy.level_2_after_minutes)}
                </TableCell>
                <TableCell>
                  <Checkbox
                    size="small"
                    checked={policy.is_active}
                    onChange={(event) =>
                      dispatch(
                        updateComplaintSlaPolicyAction({
                          policyId: policy.id,
                          payload: { is_active: event.target.checked },
                          onSuccess: reload,
                        })
                      )
                    }
                  />
                </TableCell>
                <TableCell align="right">
                  <ButtonComp
                    size="small"
                    variant="text"
                    onClick={() => openPolicy(policy)}
                    startIcon={<Pencil size={13} />}
                  >
                    Edit
                  </ButtonComp>
                  <ButtonComp
                    size="small"
                    variant="text"
                    color="error"
                    onClick={() => setDeletePolicyId(policy.id)}
                    startIcon={<Trash2 size={13} />}
                  >
                    Delete
                  </ButtonComp>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <SpringModal
        open={categoryOpen}
        close={() => setCategoryOpen(false)}
        size="sm"
      >
        <Stack spacing={1.5} p={2.5}>
          <Typography fontSize={15} fontWeight={700} color={colors.grey[900]}>
            {categoryForm.id ? 'Edit category' : 'New category'}
          </Typography>

          <InputField
            labelDetail={{ text: 'Name', required: true }}
            value={categoryForm.name}
            onChange={(event) =>
              setCategoryForm((prev) => ({ ...prev, name: event.target.value }))
            }
          />
          <InputField
            labelDetail={{ text: 'Code', required: true }}
            placeholder="e.g. facility_infrastructure"
            value={categoryForm.code}
            onChange={(event) =>
              setCategoryForm((prev) => ({ ...prev, code: event.target.value }))
            }
          />
          <InputField
            labelDetail={{ text: 'Description', required: false }}
            multiline
            minRows={2}
            value={categoryForm.description}
            onChange={(event) =>
              setCategoryForm((prev) => ({
                ...prev,
                description: event.target.value,
              }))
            }
          />

          <Stack direction="row" spacing={1.5}>
            <Box flex={1}>
              <Typography fontSize={12.5} mb={0.75}>
                Default priority
              </Typography>
              <SelectField
                options={COMPLAINT_PRIORITY_OPTIONS}
                value={
                  COMPLAINT_PRIORITY_OPTIONS.find(
                    (option) => option.value === categoryForm.default_priority
                  ) ?? null
                }
                onChange={(option) =>
                  setCategoryForm((prev) => ({
                    ...prev,
                    default_priority:
                      (option as { value: Complaint.Priority } | null)?.value ??
                      'normal',
                  }))
                }
                styles={controlStyles}
              />
            </Box>
            <Box flex={1}>
              <Typography fontSize={12.5} mb={0.75}>
                Default severity
              </Typography>
              <SelectField
                options={COMPLAINT_SEVERITY_OPTIONS}
                value={
                  COMPLAINT_SEVERITY_OPTIONS.find(
                    (option) => option.value === categoryForm.default_severity
                  ) ?? null
                }
                onChange={(option) =>
                  setCategoryForm((prev) => ({
                    ...prev,
                    default_severity:
                      (option as { value: Complaint.Severity } | null)?.value ??
                      'medium',
                  }))
                }
                styles={controlStyles}
              />
            </Box>
          </Stack>

          <FormControlLabel
            control={
              <Checkbox
                size="small"
                checked={categoryForm.is_active}
                onChange={(event) =>
                  setCategoryForm((prev) => ({
                    ...prev,
                    is_active: event.target.checked,
                  }))
                }
              />
            }
            label={<Typography fontSize={12.5}>Active</Typography>}
          />

          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <ButtonComp
              size="small"
              variant="text"
              onClick={() => setCategoryOpen(false)}
            >
              Cancel
            </ButtonComp>
            <ButtonComp
              size="small"
              variant="contained"
              loading={categorySaving}
              onClick={submitCategory}
            >
              Save
            </ButtonComp>
          </Stack>
        </Stack>
      </SpringModal>

      <SpringModal
        open={policyOpen}
        close={() => setPolicyOpen(false)}
        size="sm"
      >
        <Stack spacing={1.5} p={2.5}>
          <Typography fontSize={15} fontWeight={700} color={colors.grey[900]}>
            {policyForm.id ? 'Edit SLA policy' : 'New SLA policy'}
          </Typography>

          <Typography fontSize={12.5}>Category (empty = all)</Typography>
          <SelectField
            isClearable
            options={(categories ?? []).map((category) => ({
              label: category.name,
              value: category.id,
            }))}
            value={
              (categories ?? [])
                .map((category) => ({
                  label: category.name,
                  value: category.id,
                }))
                .find((option) => option.value === policyForm.category_id) ??
              null
            }
            onChange={(option) =>
              setPolicyForm((prev) => ({
                ...prev,
                category_id: (option as { value: number } | null)?.value ?? '',
              }))
            }
            styles={controlStyles}
          />

          <Typography fontSize={12.5}>Severity (empty = all)</Typography>
          <SelectField
            isClearable
            options={COMPLAINT_SEVERITY_OPTIONS}
            value={
              COMPLAINT_SEVERITY_OPTIONS.find(
                (option) => option.value === policyForm.severity
              ) ?? null
            }
            onChange={(option) =>
              setPolicyForm((prev) => ({
                ...prev,
                severity:
                  (option as { value: Complaint.Severity } | null)?.value ?? '',
              }))
            }
            styles={controlStyles}
          />

          <Stack direction="row" spacing={1.5}>
            <InputField
              labelDetail={{ text: 'First response (min)', required: true }}
              type="number"
              value={policyForm.first_response_minutes}
              onChange={(event) =>
                setPolicyForm((prev) => ({
                  ...prev,
                  first_response_minutes: Number(event.target.value),
                }))
              }
            />
            <InputField
              labelDetail={{ text: 'Resolution (min)', required: true }}
              type="number"
              value={policyForm.resolution_minutes}
              onChange={(event) =>
                setPolicyForm((prev) => ({
                  ...prev,
                  resolution_minutes: Number(event.target.value),
                }))
              }
            />
          </Stack>

          <Stack direction="row" spacing={1.5}>
            <InputField
              labelDetail={{ text: 'Level 1 (min)', required: false }}
              type="number"
              value={policyForm.level_1_after_minutes}
              onChange={(event) =>
                setPolicyForm((prev) => ({
                  ...prev,
                  level_1_after_minutes: Number(event.target.value),
                }))
              }
            />
            <InputField
              labelDetail={{ text: 'Level 2 (min)', required: false }}
              type="number"
              value={policyForm.level_2_after_minutes}
              onChange={(event) =>
                setPolicyForm((prev) => ({
                  ...prev,
                  level_2_after_minutes: Number(event.target.value),
                }))
              }
            />
          </Stack>

          <FormControlLabel
            control={
              <Checkbox
                size="small"
                checked={policyForm.is_active}
                onChange={(event) =>
                  setPolicyForm((prev) => ({
                    ...prev,
                    is_active: event.target.checked,
                  }))
                }
              />
            }
            label={<Typography fontSize={12.5}>Active</Typography>}
          />

          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <ButtonComp
              size="small"
              variant="text"
              onClick={() => setPolicyOpen(false)}
            >
              Cancel
            </ButtonComp>
            <ButtonComp
              size="small"
              variant="contained"
              loading={policySaving}
              onClick={submitPolicy}
            >
              Save
            </ButtonComp>
          </Stack>
        </Stack>
      </SpringModal>

      <DeleteConfirmationModal
        open={Boolean(deleteCategoryId)}
        heading="Delete this category?"
        confirmText="Delete"
        onClose={() => setDeleteCategoryId(null)}
        onConfirmationClick={() => {
          if (!deleteCategoryId) {
            return
          }

          dispatch(
            deleteComplaintCategoryAction({
              categoryId: deleteCategoryId,
              onSuccess: () => {
                setDeleteCategoryId(null)
                reload()
              },
            })
          )
        }}
      >
        <Typography fontSize={13} color={colors.grey[700]}>
          A category already used by a complaint cannot be deleted: deactivate
          it instead so the history stays readable.
        </Typography>
      </DeleteConfirmationModal>

      <DeleteConfirmationModal
        open={Boolean(deletePolicyId)}
        heading="Delete this SLA policy?"
        confirmText="Delete"
        onClose={() => setDeletePolicyId(null)}
        onConfirmationClick={() => {
          if (!deletePolicyId) {
            return
          }

          dispatch(
            deleteComplaintSlaPolicyAction({
              policyId: deletePolicyId,
              onSuccess: () => {
                setDeletePolicyId(null)
                reload()
              },
            })
          )
        }}
      >
        <Typography fontSize={13} color={colors.grey[700]}>
          A policy already applied to a complaint cannot be deleted: deactivate
          it instead.
        </Typography>
      </DeleteConfirmationModal>
    </Stack>
  )
}
