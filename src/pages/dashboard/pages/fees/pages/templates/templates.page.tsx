import { Box, Pagination, Stack, Tooltip, Typography } from '@mui/material'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Copy, Eye, Layers, Pencil, Plus } from 'lucide-react'
import { colors } from '@src/helpers/colors.helpers'
import { ButtonComp } from '@src/components/button/button.component'
import { SelectField } from '@src/components/select/select.component'
import { ConfirmationModal } from '@src/components/confirmationModal/confirmationModal.component'
import { useFeePermissions } from '@src/hooks/useFeePermissions.hooks'
import { useDispatch, useSelector } from '@src/store/hooks.store'
import {
  deactivateFeeTemplateAction,
  getFeeTemplatesAction,
} from '@src/store/redux/dashboard/fee/fee.config.slice'
import { ITemplateFilters } from '@src/store/redux/dashboard/fee/fee.service'
import {
  FeeAmount,
  FeeCellStack,
  FeeDataTable,
  IFeeColumn,
} from '../../components/feeDataTable.component'
import { FeePageHeader } from '../../components/feePageHeader.component'
import { FeePanel } from '../../components/feePanel.component'
import { FeeFilterBar } from '../../components/feeFilterBar.component'
import { FeeStatusChip } from '../../components/feeStatusChip.component'
import {
  formatDate,
  formatMoney,
  IOption,
  TEMPLATE_STATUS_META,
  TEMPLATE_STATUS_OPTIONS,
} from '../../fees.helpers'
import { useFeeReference } from '../../hooks/useFeeReference.hooks'
import { TemplateBuilderModal } from './components/templateBuilderModal.component'
import { TemplateDetailModal } from './components/templateDetailModal.component'
import { DuplicateTemplateModal } from './components/duplicateTemplateModal.component'

const PAGE_LIMIT = 20

export function FeeTemplatesPage() {
  const dispatch = useDispatch()
  const { can } = useFeePermissions()
  const { years, classes, sectionsOf, ensureSections } = useFeeReference()

  const { data: list, loading } = useSelector(
    (store) => store.feeConfig.templates
  )
  const { loading: mutating } = useSelector(
    (store) => store.feeConfig.templateMutation
  )

  const [filters, setFilters] = useState<ITemplateFilters>({})
  const [page, setPage] = useState(1)
  const [builderOpen, setBuilderOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [viewId, setViewId] = useState<number | null>(null)
  const [duplicateTarget, setDuplicateTarget] =
    useState<Fee.IFeeTemplate | null>(null)
  const [deactivateTarget, setDeactivateTarget] =
    useState<Fee.IFeeTemplate | null>(null)

  const load = useCallback(() => {
    dispatch(getFeeTemplatesAction({ filters, page, limit: PAGE_LIMIT }))
  }, [dispatch, filters, page])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    ensureSections(filters.class_id)
  }, [filters.class_id, ensureSections])

  const sectionOptions: IOption[] = useMemo(
    () =>
      sectionsOf(filters.class_id).map((section) => ({
        value: String(section.id),
        label: section.name,
      })),
    [filters.class_id, sectionsOf(filters.class_id)]
  )

  const columns: IFeeColumn<Fee.IFeeTemplate>[] = [
    {
      key: 'name',
      label: 'Template',
      render: (row) => <FeeCellStack primary={row.name} secondary={row.code} />,
    },
    {
      key: 'academic_year_id',
      label: 'Academic year',
      hideBelow: 'md',
      render: (row) => (
        <Typography fontSize={12} color={colors.grey[700]}>
          {years.find((year) => year.value === String(row.academic_year_id))
            ?.label ?? `#${row.academic_year_id}`}
        </Typography>
      ),
    },
    {
      key: 'class_id',
      label: 'Class / section',
      hideBelow: 'sm',
      render: (row) => (
        <FeeCellStack
          primary={
            classes.find((item) => item.value === String(row.class_id))
              ?.label ?? 'All classes'
          }
          secondary={
            row.section_id
              ? sectionsOf(row.class_id).find(
                  (section) => String(section.id) === String(row.section_id)
                )?.name
              : undefined
          }
        />
      ),
    },
    {
      key: 'total_amount',
      label: 'Total',
      align: 'right',
      render: (row) => (
        <FeeAmount value={formatMoney(row.total_amount)} strong />
      ),
    },
    {
      key: 'item_count',
      label: 'Components',
      align: 'right',
      hideBelow: 'lg',
      render: (row) => (
        <Typography fontSize={12.5} color={colors.grey[700]}>
          {Number(row.item_count ?? 0)}
        </Typography>
      ),
    },
    {
      key: 'effective_from',
      label: 'Effective',
      hideBelow: 'lg',
      render: (row) => (
        <FeeCellStack
          primary={formatDate(row.effective_from)}
          secondary={
            row.effective_to
              ? `until ${formatDate(row.effective_to)}`
              : undefined
          }
        />
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <FeeStatusChip meta={TEMPLATE_STATUS_META[row.status]} />
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (row) => (
        <Stack direction="row" spacing={0.25} justifyContent="flex-end">
          <Tooltip title="View components">
            <span>
              <ButtonComp
                size="small"
                variant="text"
                onClick={() => setViewId(row.id)}
                sx={{ minWidth: 0, px: 0.75 }}
              >
                <Eye size={14} />
              </ButtonComp>
            </span>
          </Tooltip>
          {can('fee.templates.update') ? (
            <Tooltip title="Edit">
              <span>
                <ButtonComp
                  size="small"
                  variant="text"
                  onClick={() => {
                    setEditingId(row.id)
                    setBuilderOpen(true)
                  }}
                  sx={{ minWidth: 0, px: 0.75 }}
                >
                  <Pencil size={14} />
                </ButtonComp>
              </span>
            </Tooltip>
          ) : null}
          {can('fee.templates.create') ? (
            <Tooltip title="Duplicate">
              <span>
                <ButtonComp
                  size="small"
                  variant="text"
                  onClick={() => setDuplicateTarget(row)}
                  sx={{ minWidth: 0, px: 0.75 }}
                >
                  <Copy size={14} />
                </ButtonComp>
              </span>
            </Tooltip>
          ) : null}
        </Stack>
      ),
    },
  ]

  const total = Number(list?.total ?? 0)
  const totalPages = Math.max(1, Math.ceil(total / PAGE_LIMIT))

  return (
    <Box>
      <FeePageHeader
        title="Fee templates"
        subtitle="Bundle the fee components billed together for a class and an academic year."
        backTo="/dashboard/fees"
        actions={
          can('fee.templates.create') ? (
            <ButtonComp
              startIcon={<Plus size={15} />}
              onClick={() => {
                setEditingId(null)
                setBuilderOpen(true)
              }}
            >
              New template
            </ButtonComp>
          ) : null
        }
      />

      <Box mb={1.75}>
        <FeeFilterBar
          active={Boolean(
            filters.academic_year_id || filters.class_id || filters.status
          )}
          onClear={() => {
            setFilters({})
            setPage(1)
          }}
          columns={4}
        >
          <Box>
            <Typography fontSize={12} color={colors.grey[600]} mb={0.75}>
              Academic year
            </Typography>
            <SelectField
              isClearable
              placeholder="All years"
              options={years}
              value={
                years.find(
                  (option) => option.value === String(filters.academic_year_id)
                ) ?? null
              }
              onChange={(option) => {
                setFilters((prev) => ({
                  ...prev,
                  academic_year_id: (option as IOption | null)?.value
                    ? Number((option as IOption).value)
                    : undefined,
                }))
                setPage(1)
              }}
            />
          </Box>
          <Box>
            <Typography fontSize={12} color={colors.grey[600]} mb={0.75}>
              Class
            </Typography>
            <SelectField
              isClearable
              placeholder="All classes"
              options={classes}
              value={
                classes.find(
                  (option) => option.value === String(filters.class_id)
                ) ?? null
              }
              onChange={(option) => {
                setFilters((prev) => ({
                  ...prev,
                  class_id: (option as IOption | null)?.value
                    ? Number((option as IOption).value)
                    : undefined,
                  section_id: undefined,
                }))
                setPage(1)
              }}
            />
          </Box>
          <Box>
            <Typography fontSize={12} color={colors.grey[600]} mb={0.75}>
              Section
            </Typography>
            <SelectField
              isClearable
              isDisabled={!filters.class_id}
              placeholder="All sections"
              options={sectionOptions}
              value={
                sectionOptions.find(
                  (option) => option.value === String(filters.section_id)
                ) ?? null
              }
              onChange={(option) => {
                setFilters((prev) => ({
                  ...prev,
                  section_id: (option as IOption | null)?.value
                    ? Number((option as IOption).value)
                    : undefined,
                }))
                setPage(1)
              }}
            />
          </Box>
          <Box>
            <Typography fontSize={12} color={colors.grey[600]} mb={0.75}>
              Status
            </Typography>
            <SelectField
              isClearable
              placeholder="All statuses"
              options={TEMPLATE_STATUS_OPTIONS}
              value={
                TEMPLATE_STATUS_OPTIONS.find(
                  (option) => option.value === filters.status
                ) ?? null
              }
              onChange={(option) => {
                setFilters((prev) => ({
                  ...prev,
                  status: (option as IOption | null)?.value ?? undefined,
                }))
                setPage(1)
              }}
            />
          </Box>
        </FeeFilterBar>
      </Box>

      <FeePanel
        noPadding
        title={`${total} template${total === 1 ? '' : 's'}`}
        footer={
          totalPages > 1 ? (
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, value) => setPage(value)}
              size="small"
              color="primary"
            />
          ) : null
        }
      >
        <FeeDataTable
          columns={columns}
          rows={list?.rows ?? []}
          rowKey={(row) => row.id}
          loading={loading}
          skeletonRows={6}
          emptyIcon={<Layers size={20} />}
          emptyTitle="No fee templates"
          emptyDescription="Build a template to define what a class is billed every term."
          emptyAction={
            can('fee.templates.create') ? (
              <ButtonComp
                size="small"
                startIcon={<Plus size={14} />}
                onClick={() => {
                  setEditingId(null)
                  setBuilderOpen(true)
                }}
              >
                New template
              </ButtonComp>
            ) : null
          }
        />
      </FeePanel>

      <TemplateBuilderModal
        open={builderOpen}
        templateId={editingId}
        onClose={() => {
          setBuilderOpen(false)
          setEditingId(null)
        }}
        onSaved={load}
      />

      <TemplateDetailModal
        open={Boolean(viewId)}
        templateId={viewId}
        onClose={() => setViewId(null)}
        onEdit={(id) => {
          setEditingId(id)
          setBuilderOpen(true)
        }}
      />

      <DuplicateTemplateModal
        open={Boolean(duplicateTarget)}
        template={duplicateTarget}
        onClose={() => setDuplicateTarget(null)}
        onSaved={load}
      />

      <ConfirmationModal
        open={Boolean(deactivateTarget)}
        onClose={() => setDeactivateTarget(null)}
        heading="Deactivate this template?"
        confirmText="Deactivate"
        confirmLoader={mutating}
        onConfirmationClick={() => {
          if (!deactivateTarget) {
            return
          }
          dispatch(
            deactivateFeeTemplateAction({
              templateId: deactivateTarget.id,
              onSuccess: () => {
                setDeactivateTarget(null)
                load()
              },
            })
          )
        }}
      >
        <Typography fontSize={13} color={colors.grey[700]}>
          The template will stop being billable. Existing invoices are not
          affected.
        </Typography>
      </ConfirmationModal>
    </Box>
  )
}
