import { Box, Pagination, Tooltip, Typography } from '@mui/material'
import { useCallback, useEffect, useState } from 'react'
import { Ban, Plus, UserPlus } from 'lucide-react'
import { colors } from '@src/helpers/colors.helpers'
import { ButtonComp } from '@src/components/button/button.component'
import { SelectField } from '@src/components/select/select.component'
import { ConfirmationModal } from '@src/components/confirmationModal/confirmationModal.component'
import { useFeePermissions } from '@src/hooks/useFeePermissions.hooks'
import { useDispatch, useSelector } from '@src/store/hooks.store'
import {
  cancelAssignmentAction,
  getAssignmentsAction,
} from '@src/store/redux/dashboard/fee/fee.config.slice'
import { IAssignmentFilters } from '@src/store/redux/dashboard/fee/fee.service'
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
  FeeStudentSelect,
  IStudentOption,
} from '../../components/feeStudentSelect.component'
import {
  ASSIGNMENT_STATUS_META,
  ASSIGNMENT_STATUS_OPTIONS,
  formatDate,
  formatMoney,
  IOption,
} from '../../fees.helpers'
import { useFeeReference } from '../../hooks/useFeeReference.hooks'
import {
  AssignFeeModal,
  BulkAssignModal,
} from './components/assignModals.component'

const PAGE_LIMIT = 20

export function FeeAssignmentsPage() {
  const dispatch = useDispatch()
  const { can } = useFeePermissions()
  const { years } = useFeeReference()

  const { data: list, loading } = useSelector(
    (store) => store.feeConfig.assignments
  )
  const { loading: mutating } = useSelector(
    (store) => store.feeConfig.assignmentMutation
  )

  const [filters, setFilters] = useState<IAssignmentFilters>({})
  const [page, setPage] = useState(1)
  const [student, setStudent] = useState<IStudentOption | null>(null)
  const [assignOpen, setAssignOpen] = useState(false)
  const [bulkOpen, setBulkOpen] = useState(false)
  const [cancelTarget, setCancelTarget] = useState<Fee.IAssignment | null>(null)

  const load = useCallback(() => {
    dispatch(getAssignmentsAction({ filters, page, limit: PAGE_LIMIT }))
  }, [dispatch, filters, page])

  useEffect(() => {
    load()
  }, [load])

  const columns: IFeeColumn<Fee.IAssignment>[] = [
    {
      key: 'student_id',
      label: 'Student',
      render: (row) => (
        <FeeCellStack
          primary={`Student #${row.student_id}`}
          secondary={
            row.class_id ? `Class #${row.class_id}` : 'No class on record'
          }
        />
      ),
    },
    {
      key: 'fee_template_id',
      label: 'Template',
      render: (row) => (
        <FeeCellStack
          primary={row.template_name ?? 'Custom assignment'}
          secondary={row.template_code ?? undefined}
        />
      ),
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
      key: 'assigned_amount',
      label: 'Assigned amount',
      align: 'right',
      hideBelow: 'sm',
      render: (row) => <FeeAmount value={formatMoney(row.assigned_amount)} />,
    },
    {
      key: 'effective_from',
      label: 'Validity',
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
        <FeeStatusChip meta={ASSIGNMENT_STATUS_META[row.status]} />
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (row) =>
        can('fee.assignments.manage') &&
        (row.status === 'ACTIVE' || row.status === 'EXEMPTED') ? (
          <Tooltip title="Cancel assignment">
            <span>
              <ButtonComp
                size="small"
                variant="text"
                color="error"
                onClick={() => setCancelTarget(row)}
                sx={{ minWidth: 0, px: 0.75 }}
              >
                <Ban size={14} />
              </ButtonComp>
            </span>
          </Tooltip>
        ) : (
          <Typography fontSize={12} color={colors.grey[400]}>
            —
          </Typography>
        ),
    },
  ]

  const total = Number(list?.total ?? 0)
  const totalPages = Math.max(1, Math.ceil(total / PAGE_LIMIT))

  return (
    <Box>
      <FeePageHeader
        title="Student fee assignments"
        subtitle="Link a fee template to a student for an academic year. Assignments drive which template the invoice generator uses."
        backTo="/dashboard/fees"
        actions={
          can('fee.assignments.manage') ? (
            <>
              <ButtonComp
                variant="outlined"
                size="small"
                startIcon={<UserPlus size={14} />}
                onClick={() => setBulkOpen(true)}
              >
                Bulk assign
              </ButtonComp>
              <ButtonComp
                startIcon={<Plus size={15} />}
                onClick={() => setAssignOpen(true)}
              >
                Assign template
              </ButtonComp>
            </>
          ) : null
        }
      />

      <Box mb={1.75}>
        <FeeFilterBar
          active={Boolean(
            filters.student_id || filters.academic_year_id || filters.status
          )}
          onClear={() => {
            setStudent(null)
            setFilters({})
            setPage(1)
          }}
          columns={3}
        >
          <Box>
            <Typography fontSize={12} color={colors.grey[600]} mb={0.75}>
              Student
            </Typography>
            <FeeStudentSelect
              value={student}
              placeholder="Filter by student"
              onChange={(option) => {
                setStudent(option)
                setFilters((prev) => ({
                  ...prev,
                  student_id: option?.value,
                }))
                setPage(1)
              }}
            />
          </Box>
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
              Status
            </Typography>
            <SelectField
              isClearable
              placeholder="All statuses"
              options={ASSIGNMENT_STATUS_OPTIONS}
              value={
                ASSIGNMENT_STATUS_OPTIONS.find(
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
        title={`${total} assignment${total === 1 ? '' : 's'}`}
        subtitle="Active assignments are the ones the invoice generator can bill."
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
          emptyTitle="No fee assignments"
          emptyDescription="Assign a fee template to a student (or a whole class) to start billing."
        />
      </FeePanel>

      <AssignFeeModal
        open={assignOpen}
        onClose={() => setAssignOpen(false)}
        onSaved={load}
        studentId={filters.student_id ?? null}
      />

      <BulkAssignModal
        open={bulkOpen}
        onClose={() => setBulkOpen(false)}
        onSaved={load}
      />

      <ConfirmationModal
        open={Boolean(cancelTarget)}
        onClose={() => setCancelTarget(null)}
        heading="Cancel this assignment?"
        confirmText="Cancel assignment"
        cancelText="Keep assignment"
        confirmLoader={mutating}
        onConfirmationClick={() => {
          if (!cancelTarget) {
            return
          }
          dispatch(
            cancelAssignmentAction({
              assignmentId: cancelTarget.id,
              onSuccess: () => {
                setCancelTarget(null)
                load()
              },
            })
          )
        }}
      >
        <Typography fontSize={13} color={colors.grey[700]}>
          The assignment of{' '}
          <strong>{cancelTarget?.template_name ?? 'the template'}</strong> to
          student #{cancelTarget?.student_id} will be cancelled. Issued invoices
          are not affected.
        </Typography>
      </ConfirmationModal>
    </Box>
  )
}
