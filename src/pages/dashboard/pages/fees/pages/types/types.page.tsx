import {
  Box,
  InputAdornment,
  Pagination,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Pencil, Plus, Power, Search, Tags } from 'lucide-react'
import { colors } from '@src/helpers/colors.helpers'
import { ButtonComp } from '@src/components/button/button.component'
import { InputField } from '@src/components/input/input.component'
import { SelectField } from '@src/components/select/select.component'
import { ConfirmationModal } from '@src/components/confirmationModal/confirmationModal.component'
import { useDebounceValue } from '@src/hooks/useDebounceValue.hooks'
import { useFeePermissions } from '@src/hooks/useFeePermissions.hooks'
import { useDispatch, useSelector } from '@src/store/hooks.store'
import {
  deactivateFeeTypeAction,
  getFeeTypesAction,
} from '@src/store/redux/dashboard/fee/fee.config.slice'
import { IFeeTypeFilters } from '@src/store/redux/dashboard/fee/fee.service'
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
import { FEE_CATEGORY_OPTIONS, formatMoney, IOption } from '../../fees.helpers'
import { useFeeAccounts } from '../../hooks/useFeeAccounts.hooks'
import { FeeTypeFormModal } from './components/feeTypeFormModal.component'

const PAGE_LIMIT = 20

const STATUS_OPTIONS: IOption[] = [
  { value: 'true', label: 'Active' },
  { value: 'false', label: 'Inactive' },
]

const ACTIVE_META = {
  label: 'Active',
  text: '#047857',
  bg: '#ecfdf5',
  border: '#a7f3d0',
  dot: '#10b981',
}
const INACTIVE_META = {
  label: 'Inactive',
  text: '#475569',
  bg: '#f1f5f9',
  border: '#e2e8f0',
  dot: '#94a3b8',
}

export function FeeTypesPage() {
  const dispatch = useDispatch()
  const { can } = useFeePermissions()
  const { accounts } = useFeeAccounts()

  const { data: list, loading } = useSelector(
    (store) => store.feeConfig.feeTypes
  )
  const { loading: mutating } = useSelector(
    (store) => store.feeConfig.feeTypeMutation
  )

  const [filters, setFilters] = useState<IFeeTypeFilters>({})
  const [searchText, setSearchText] = useState('')
  const debouncedSearch = useDebounceValue(searchText, 400)
  const [page, setPage] = useState(1)

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Fee.IFeeType | null>(null)
  const [deactivateTarget, setDeactivateTarget] = useState<Fee.IFeeType | null>(
    null
  )

  useEffect(() => {
    const term = debouncedSearch.trim()

    setFilters((prev) =>
      (prev.search ?? '') === term ? prev : { ...prev, search: term }
    )
    setPage(1)
  }, [debouncedSearch])

  const load = useCallback(() => {
    dispatch(getFeeTypesAction({ filters, page, limit: PAGE_LIMIT }))
  }, [dispatch, filters, page])

  useEffect(() => {
    load()
  }, [load])

  const accountLabel = useMemo(() => {
    const map = new Map(accounts.map((account) => [account.id, account]))

    return (feeType: Fee.IFeeType) => {
      if (feeType.account_code || feeType.account_name) {
        return `${feeType.account_code ?? ''} ${
          feeType.account_name ?? ''
        }`.trim()
      }

      const account = feeType.accounting_account_id
        ? map.get(feeType.accounting_account_id)
        : undefined

      return account
        ? `${account.account_code} · ${account.account_name}`
        : 'System default'
    }
  }, [accounts])

  const columns: IFeeColumn<Fee.IFeeType>[] = [
    {
      key: 'name',
      label: 'Fee type',
      render: (row) => <FeeCellStack primary={row.name} secondary={row.code} />,
    },
    {
      key: 'category',
      label: 'Category',
      hideBelow: 'sm',
      render: (row) => (
        <Typography fontSize={12} color={colors.grey[700]}>
          {FEE_CATEGORY_OPTIONS.find((option) => option.value === row.category)
            ?.label ?? row.category}
        </Typography>
      ),
    },
    {
      key: 'default_amount',
      label: 'Default amount',
      align: 'right',
      render: (row) => <FeeAmount value={formatMoney(row.default_amount)} />,
    },
    {
      key: 'accounting_account_id',
      label: 'Revenue account',
      hideBelow: 'lg',
      render: (row) => (
        <Typography fontSize={11.5} color={colors.grey[600]}>
          {accountLabel(row)}
        </Typography>
      ),
    },
    {
      key: 'is_mandatory',
      label: 'Type',
      hideBelow: 'md',
      render: (row) => (
        <FeeCellStack
          primary={row.is_mandatory ? 'Mandatory' : 'Optional'}
          secondary={row.is_recurring ? 'Recurring' : 'One time'}
        />
      ),
    },
    {
      key: 'is_active',
      label: 'Status',
      render: (row) => (
        <FeeStatusChip meta={row.is_active ? ACTIVE_META : INACTIVE_META} />
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (row) => (
        <Stack direction="row" spacing={0.25} justifyContent="flex-end">
          {can('fee.types.update') ? (
            <Tooltip title="Edit">
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
                  <Pencil size={14} />
                </ButtonComp>
              </span>
            </Tooltip>
          ) : null}
          {can('fee.types.update') && row.is_active ? (
            <Tooltip title="Deactivate">
              <span>
                <ButtonComp
                  size="small"
                  variant="text"
                  color="error"
                  onClick={() => setDeactivateTarget(row)}
                  sx={{ minWidth: 0, px: 0.75 }}
                >
                  <Power size={14} />
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
        title="Fee types"
        subtitle="Every billable item of the school and the revenue account it posts to."
        backTo="/dashboard/fees"
        actions={
          can('fee.types.create') ? (
            <ButtonComp
              startIcon={<Plus size={15} />}
              onClick={() => {
                setEditing(null)
                setFormOpen(true)
              }}
            >
              New fee type
            </ButtonComp>
          ) : null
        }
      />

      <Box mb={1.75}>
        <FeeFilterBar
          active={Boolean(
            filters.category ||
              filters.is_active !== undefined ||
              filters.search
          )}
          onClear={() => {
            setSearchText('')
            setFilters({})
            setPage(1)
          }}
          columns={3}
        >
          <Box>
            <Typography fontSize={12} color={colors.grey[600]} mb={0.75}>
              Search
            </Typography>
            <InputField
              placeholder="Fee name or code"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              startAdornment={
                <InputAdornment position="start">
                  <Search size={15} color={colors.grey[500]} />
                </InputAdornment>
              }
            />
          </Box>
          <Box>
            <Typography fontSize={12} color={colors.grey[600]} mb={0.75}>
              Category
            </Typography>
            <SelectField
              isClearable
              placeholder="All categories"
              options={FEE_CATEGORY_OPTIONS}
              value={
                FEE_CATEGORY_OPTIONS.find(
                  (option) => option.value === filters.category
                ) ?? null
              }
              onChange={(option) => {
                setFilters((prev) => ({
                  ...prev,
                  category: (option as IOption | null)?.value ?? undefined,
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
              options={STATUS_OPTIONS}
              value={
                STATUS_OPTIONS.find(
                  (option) => option.value === String(filters.is_active)
                ) ?? null
              }
              onChange={(option) => {
                const value = (option as IOption | null)?.value
                setFilters((prev) => ({
                  ...prev,
                  is_active: value === undefined ? undefined : value === 'true',
                }))
                setPage(1)
              }}
            />
          </Box>
        </FeeFilterBar>
      </Box>

      <FeePanel
        noPadding
        title={`${total} fee type${total === 1 ? '' : 's'}`}
        subtitle="Amounts are stored as decimal strings and converted to minor units by the backend."
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
          emptyIcon={<Tags size={20} />}
          emptyTitle="No fee types yet"
          emptyDescription="Create the billable definitions of the school before building fee templates."
          emptyAction={
            can('fee.types.create') ? (
              <ButtonComp
                size="small"
                startIcon={<Plus size={14} />}
                onClick={() => {
                  setEditing(null)
                  setFormOpen(true)
                }}
              >
                New fee type
              </ButtonComp>
            ) : null
          }
        />
      </FeePanel>

      <FeeTypeFormModal
        open={formOpen}
        feeType={editing}
        onClose={() => {
          setFormOpen(false)
          setEditing(null)
        }}
        onSaved={load}
      />

      <ConfirmationModal
        open={Boolean(deactivateTarget)}
        onClose={() => setDeactivateTarget(null)}
        heading="Deactivate this fee type?"
        confirmText="Deactivate"
        confirmLoader={mutating}
        onConfirmationClick={() => {
          if (!deactivateTarget) {
            return
          }
          dispatch(
            deactivateFeeTypeAction({
              feeTypeId: deactivateTarget.id,
              onSuccess: () => {
                setDeactivateTarget(null)
                load()
              },
            })
          )
        }}
      >
        <Typography fontSize={13} color={colors.grey[700]}>
          <strong>{deactivateTarget?.name}</strong> will no longer be selectable
          in new templates or invoices. Issued invoices keep their snapshot.
        </Typography>
      </ConfirmationModal>
    </Box>
  )
}
