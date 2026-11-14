import {
  Box,
  Pagination,
  Stack,
  Tab,
  Tabs,
  Tooltip,
  Typography,
} from '@mui/material'
import { useCallback, useEffect, useState } from 'react'
import { BadgePercent, Check, Plus, RotateCcw, UserPlus, X } from 'lucide-react'
import { colors } from '@src/helpers/colors.helpers'
import { ButtonComp } from '@src/components/button/button.component'
import { SelectField } from '@src/components/select/select.component'
import { useFeePermissions } from '@src/hooks/useFeePermissions.hooks'
import { useDispatch, useSelector } from '@src/store/hooks.store'
import {
  decideConcessionAction,
  getConcessionsAction,
  getScholarshipsAction,
} from '@src/store/redux/dashboard/fee/fee.config.slice'
import {
  IConcessionFilters,
  IScholarshipFilters,
} from '@src/store/redux/dashboard/fee/fee.service'
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
  CONCESSION_STATUS_META,
  CONCESSION_STATUS_OPTIONS,
  DISCOUNT_CATEGORY_OPTIONS,
  formatDate,
  formatMoney,
  IOption,
} from '../../fees.helpers'
import { useFeeReference } from '../../hooks/useFeeReference.hooks'
import { ScholarshipFormModal } from './components/scholarshipFormModal.component'
import { AssignConcessionModal } from './components/assignConcessionModal.component'

const PAGE_LIMIT = 20

const ACTIVE_OPTIONS: IOption[] = [
  { value: 'true', label: 'Active' },
  { value: 'false', label: 'Inactive' },
]

export function FeeScholarshipsPage() {
  const dispatch = useDispatch()
  const { can } = useFeePermissions()
  const { years } = useFeeReference()

  const { data: rules, loading: rulesLoading } = useSelector(
    (store) => store.feeConfig.scholarships
  )
  const { data: concessions, loading: concessionsLoading } = useSelector(
    (store) => store.feeConfig.concessions
  )
  const { loading: mutating } = useSelector(
    (store) => store.feeConfig.concessionMutation
  )

  const [tab, setTab] = useState(0)
  const [ruleFilters, setRuleFilters] = useState<IScholarshipFilters>({})
  const [concessionFilters, setConcessionFilters] =
    useState<IConcessionFilters>({})
  const [rulePage, setRulePage] = useState(1)
  const [concessionPage, setConcessionPage] = useState(1)

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Fee.IScholarship | null>(null)
  const [assignTarget, setAssignTarget] = useState<Fee.IScholarship | null>(
    null
  )

  const loadRules = useCallback(() => {
    dispatch(
      getScholarshipsAction({
        filters: ruleFilters,
        page: rulePage,
        limit: PAGE_LIMIT,
      })
    )
  }, [dispatch, ruleFilters, rulePage])

  const loadConcessions = useCallback(() => {
    dispatch(
      getConcessionsAction({
        filters: concessionFilters,
        page: concessionPage,
        limit: PAGE_LIMIT,
      })
    )
  }, [dispatch, concessionFilters, concessionPage])

  useEffect(() => {
    loadRules()
  }, [loadRules])

  useEffect(() => {
    loadConcessions()
  }, [loadConcessions])

  const ruleColumns: IFeeColumn<Fee.IScholarship>[] = [
    {
      key: 'name',
      label: 'Scholarship / discount',
      render: (row) => <FeeCellStack primary={row.name} secondary={row.code} />,
    },
    {
      key: 'discount_category',
      label: 'Category',
      hideBelow: 'sm',
      render: (row) => (
        <Typography fontSize={12} color={colors.grey[700]}>
          {DISCOUNT_CATEGORY_OPTIONS.find(
            (option) => option.value === row.discount_category
          )?.label ?? row.discount_category}
        </Typography>
      ),
    },
    {
      key: 'discount_value',
      label: 'Value',
      align: 'right',
      render: (row) => (
        <FeeAmount
          value={
            row.discount_type === 'PERCENTAGE'
              ? `${row.discount_value}%`
              : formatMoney(row.discount_value)
          }
          strong
        />
      ),
    },
    {
      key: 'calculation_priority',
      label: 'Priority',
      align: 'right',
      hideBelow: 'lg',
      render: (row) => (
        <Typography fontSize={12.5} color={colors.grey[700]}>
          {row.calculation_priority}
        </Typography>
      ),
    },
    {
      key: 'valid_from',
      label: 'Validity',
      hideBelow: 'md',
      render: (row) => (
        <FeeCellStack
          primary={formatDate(row.valid_from)}
          secondary={
            row.valid_until
              ? `until ${formatDate(row.valid_until)}`
              : 'open ended'
          }
        />
      ),
    },
    {
      key: 'is_active',
      label: 'Status',
      render: (row) => (
        <FeeStatusChip
          meta={
            row.is_active
              ? {
                  label: 'Active',
                  text: '#047857',
                  bg: '#ecfdf5',
                  border: '#a7f3d0',
                  dot: '#10b981',
                }
              : {
                  label: 'Inactive',
                  text: '#475569',
                  bg: '#f1f5f9',
                  border: '#e2e8f0',
                  dot: '#94a3b8',
                }
          }
        />
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (row) => (
        <Stack direction="row" spacing={0.25} justifyContent="flex-end">
          {can('fee.scholarships.manage') ? (
            <>
              <Tooltip title="Edit rule">
                <span>
                  <ButtonComp
                    size="small"
                    variant="text"
                    onClick={() => {
                      setEditing(row)
                      setFormOpen(true)
                    }}
                    sx={{ minWidth: 0, px: 0.75 }}
                  >
                    <BadgePercent size={14} />
                  </ButtonComp>
                </span>
              </Tooltip>
              <Tooltip title="Assign to a student">
                <span>
                  <ButtonComp
                    size="small"
                    variant="text"
                    onClick={() => setAssignTarget(row)}
                    sx={{ minWidth: 0, px: 0.75 }}
                  >
                    <UserPlus size={14} />
                  </ButtonComp>
                </span>
              </Tooltip>
            </>
          ) : null}
        </Stack>
      ),
    },
  ]

  const concessionColumns: IFeeColumn<Fee.IConcession>[] = [
    {
      key: 'student_id',
      label: 'Student',
      render: (row) => (
        <FeeCellStack
          primary={`Student #${row.student_id}`}
          secondary={`Concession #${row.id}`}
        />
      ),
    },
    {
      key: 'name',
      label: 'Scholarship',
      render: (row) => (
        <FeeCellStack
          primary={row.name}
          secondary={`${row.code} · ${
            row.discount_type === 'PERCENTAGE'
              ? `${row.discount_value}%`
              : formatMoney(row.discount_value)
          }`}
        />
      ),
    },
    {
      key: 'valid_from',
      label: 'Validity',
      hideBelow: 'md',
      render: (row) => (
        <FeeCellStack
          primary={formatDate(row.valid_from)}
          secondary={
            row.valid_until ? `until ${formatDate(row.valid_until)}` : undefined
          }
        />
      ),
    },
    {
      key: 'approval_status',
      label: 'Approval',
      render: (row) => (
        <FeeStatusChip meta={CONCESSION_STATUS_META[row.approval_status]} />
      ),
    },
    {
      key: 'actions',
      label: 'Decision',
      align: 'right',
      render: (row) => {
        const decided = row.approval_status !== 'PENDING'

        return can('fee.scholarships.manage') ? (
          <Stack direction="row" spacing={0.25} justifyContent="flex-end">
            {!decided ? (
              <>
                <Tooltip title="Approve">
                  <span>
                    <ButtonComp
                      size="small"
                      variant="text"
                      color="success"
                      onClick={() =>
                        dispatch(
                          decideConcessionAction({
                            concessionId: row.id,
                            decision: 'APPROVED',
                            onSuccess: () => loadConcessions(),
                          })
                        )
                      }
                      sx={{ minWidth: 0, px: 0.75 }}
                    >
                      <Check size={14} />
                    </ButtonComp>
                  </span>
                </Tooltip>
                <Tooltip title="Reject">
                  <span>
                    <ButtonComp
                      size="small"
                      variant="text"
                      color="error"
                      onClick={() =>
                        dispatch(
                          decideConcessionAction({
                            concessionId: row.id,
                            decision: 'REJECTED',
                            onSuccess: () => loadConcessions(),
                          })
                        )
                      }
                      sx={{ minWidth: 0, px: 0.75 }}
                    >
                      <X size={14} />
                    </ButtonComp>
                  </span>
                </Tooltip>
              </>
            ) : row.approval_status === 'APPROVED' ? (
              <Tooltip title="Revoke">
                <span>
                  <ButtonComp
                    size="small"
                    variant="text"
                    color="error"
                    onClick={() =>
                      dispatch(
                        decideConcessionAction({
                          concessionId: row.id,
                          decision: 'REVOKED',
                          onSuccess: () => loadConcessions(),
                        })
                      )
                    }
                    sx={{ minWidth: 0, px: 0.75 }}
                  >
                    <RotateCcw size={14} />
                  </ButtonComp>
                </span>
              </Tooltip>
            ) : (
              <Typography fontSize={12} color={colors.grey[400]}>
                —
              </Typography>
            )}
          </Stack>
        ) : (
          <Typography fontSize={12} color={colors.grey[400]}>
            —
          </Typography>
        )
      },
    },
  ]

  const ruleTotal = Number(rules?.total ?? 0)
  const rulePages = Math.max(1, Math.ceil(ruleTotal / PAGE_LIMIT))
  const concessionTotal = Number(concessions?.total ?? 0)
  const concessionPages = Math.max(1, Math.ceil(concessionTotal / PAGE_LIMIT))

  return (
    <Box>
      <FeePageHeader
        title="Scholarships & discounts"
        subtitle="Define concession rules and assign them to students. The backend engine owns the calculation order and the rounding."
        backTo="/dashboard/fees"
        actions={
          can('fee.scholarships.manage') ? (
            <>
              <ButtonComp
                variant="outlined"
                size="small"
                startIcon={<UserPlus size={14} />}
                disabled={!rules?.rows?.length}
                onClick={() => setAssignTarget(rules?.rows?.[0] ?? null)}
              >
                Assign to student
              </ButtonComp>
              <ButtonComp
                startIcon={<Plus size={15} />}
                onClick={() => {
                  setEditing(null)
                  setFormOpen(true)
                }}
              >
                New rule
              </ButtonComp>
            </>
          ) : null
        }
      />

      <Tabs
        value={tab}
        onChange={(_, value) => setTab(value)}
        sx={{ mb: 1.75, borderBottom: `1px solid ${colors.grey[200]}` }}
      >
        <Tab label={`Rules (${ruleTotal})`} sx={{ fontSize: 13 }} />
        <Tab
          label={`Student concessions (${concessionTotal})`}
          sx={{ fontSize: 13 }}
        />
      </Tabs>

      {tab === 0 ? (
        <>
          <Box mb={1.75}>
            <FeeFilterBar
              active={Boolean(
                ruleFilters.academic_year_id ||
                  ruleFilters.category ||
                  ruleFilters.is_active !== undefined
              )}
              onClear={() => {
                setRuleFilters({})
                setRulePage(1)
              }}
              columns={3}
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
                      (option) =>
                        option.value === String(ruleFilters.academic_year_id)
                    ) ?? null
                  }
                  onChange={(option) => {
                    setRuleFilters((prev) => ({
                      ...prev,
                      academic_year_id: (option as IOption | null)?.value
                        ? Number((option as IOption).value)
                        : undefined,
                    }))
                    setRulePage(1)
                  }}
                />
              </Box>
              <Box>
                <Typography fontSize={12} color={colors.grey[600]} mb={0.75}>
                  Category
                </Typography>
                <SelectField
                  isClearable
                  placeholder="All categories"
                  options={DISCOUNT_CATEGORY_OPTIONS}
                  value={
                    DISCOUNT_CATEGORY_OPTIONS.find(
                      (option) => option.value === ruleFilters.category
                    ) ?? null
                  }
                  onChange={(option) => {
                    setRuleFilters((prev) => ({
                      ...prev,
                      category: (option as IOption | null)?.value ?? undefined,
                    }))
                    setRulePage(1)
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
                  options={ACTIVE_OPTIONS}
                  value={
                    ACTIVE_OPTIONS.find(
                      (option) => option.value === String(ruleFilters.is_active)
                    ) ?? null
                  }
                  onChange={(option) => {
                    const value = (option as IOption | null)?.value
                    setRuleFilters((prev) => ({
                      ...prev,
                      is_active:
                        value === undefined ? undefined : value === 'true',
                    }))
                    setRulePage(1)
                  }}
                />
              </Box>
            </FeeFilterBar>
          </Box>

          <FeePanel
            noPadding
            footer={
              rulePages > 1 ? (
                <Pagination
                  count={rulePages}
                  page={rulePage}
                  onChange={(_, value) => setRulePage(value)}
                  size="small"
                  color="primary"
                />
              ) : null
            }
          >
            <FeeDataTable
              columns={ruleColumns}
              rows={rules?.rows ?? []}
              rowKey={(row) => row.id}
              loading={rulesLoading}
              skeletonRows={5}
              emptyTitle="No scholarships or discounts"
              emptyDescription="Create a rule to start granting concessions."
            />
          </FeePanel>
        </>
      ) : null}

      {tab === 1 ? (
        <>
          <Box mb={1.75}>
            <FeeFilterBar
              active={Boolean(concessionFilters.approval_status)}
              onClear={() => {
                setConcessionFilters({})
                setConcessionPage(1)
              }}
              columns={3}
            >
              <Box>
                <Typography fontSize={12} color={colors.grey[600]} mb={0.75}>
                  Approval status
                </Typography>
                <SelectField
                  isClearable
                  placeholder="All statuses"
                  options={CONCESSION_STATUS_OPTIONS}
                  value={
                    CONCESSION_STATUS_OPTIONS.find(
                      (option) =>
                        option.value === concessionFilters.approval_status
                    ) ?? null
                  }
                  onChange={(option) => {
                    setConcessionFilters((prev) => ({
                      ...prev,
                      approval_status:
                        (option as IOption | null)?.value ?? undefined,
                    }))
                    setConcessionPage(1)
                  }}
                />
              </Box>
            </FeeFilterBar>
          </Box>

          <FeePanel
            noPadding
            footer={
              concessionPages > 1 ? (
                <Pagination
                  count={concessionPages}
                  page={concessionPage}
                  onChange={(_, value) => setConcessionPage(value)}
                  size="small"
                  color="primary"
                />
              ) : null
            }
          >
            <FeeDataTable
              columns={concessionColumns}
              rows={concessions?.rows ?? []}
              rowKey={(row) => row.id}
              loading={concessionsLoading || mutating}
              skeletonRows={5}
              emptyTitle="No concessions assigned"
              emptyDescription="Assign a scholarship to a student to see it here."
            />
          </FeePanel>
        </>
      ) : null}

      <ScholarshipFormModal
        open={formOpen}
        scholarship={editing}
        onClose={() => {
          setFormOpen(false)
          setEditing(null)
        }}
        onSaved={loadRules}
      />

      <AssignConcessionModal
        open={Boolean(assignTarget)}
        scholarship={assignTarget}
        scholarships={rules?.rows ?? []}
        onClose={() => setAssignTarget(null)}
        onSaved={loadConcessions}
      />
    </Box>
  )
}
