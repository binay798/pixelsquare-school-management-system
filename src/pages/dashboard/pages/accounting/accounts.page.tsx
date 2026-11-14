import {
  Box,
  IconButton,
  InputAdornment,
  Pagination,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  GitBranch,
  List,
  Pencil,
  Plus,
  Power,
  Search,
  Wallet,
} from 'lucide-react'
import { ButtonComp } from '@src/components/button/button.component'
import { InputField } from '@src/components/input/input.component'
import { SelectField } from '@src/components/select/select.component'
import { ConfirmationModal } from '@src/components/confirmationModal/confirmationModal.component'
import { colors } from '@src/helpers/colors.helpers'
import { useDebounceValue } from '@src/hooks/useDebounceValue.hooks'
import { useAccountingPermissions } from '@src/hooks/useAccountingPermissions.hooks'
import { useDispatch, useSelector } from '@src/store/hooks.store'
import {
  deleteAccountAction,
  getAccountTreeAction,
  getAccountsAction,
  setupChartOfAccountsAction,
} from '@src/store/redux/dashboard/accounting/accounting.slice'
import { IAccountFilters } from '@src/store/redux/dashboard/accounting/accounting.service'
import {
  FeeAmount,
  FeeCellStack,
  FeeDataTable,
  IFeeColumn,
} from '../fees/components/feeDataTable.component'
import { FeeEmptyState } from '../fees/components/feeEmptyState.component'
import { FeePageHeader } from '../fees/components/feePageHeader.component'
import { FeePanel } from '../fees/components/feePanel.component'
import { FeeFilterBar } from '../fees/components/feeFilterBar.component'
import { FeeStatusChip } from '../fees/components/feeStatusChip.component'
import {
  ACCOUNT_ACTIVE_OPTIONS,
  ACCOUNT_SUBTYPE_LABEL,
  ACCOUNT_TYPE_META,
  ACCOUNT_TYPE_OPTIONS,
  ACCOUNTING_BASE_PATH,
  accountBalance,
  formatMoney,
  IOption,
} from './accounting.helpers'
import { AccountFormModal } from './components/accountFormModal.component'

const PAGE_LIMIT = 25

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

/** Chart of accounts: flat listing with posted movement, plus a tree view. */
export function AccountingAccountsPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { canManageAccounts } = useAccountingPermissions()

  const { data, loading } = useSelector((store) => store.accounting.accounts)
  const tree = useSelector((store) => store.accounting.accountTree)
  const { loading: settingUp } = useSelector(
    (store) => store.accounting.chartSetup
  )
  const { loading: mutating } = useSelector(
    (store) => store.accounting.accountMutation
  )

  const [view, setView] = useState<'table' | 'tree'>('table')
  const [filters, setFilters] = useState<IAccountFilters>({})
  const [searchText, setSearchText] = useState('')
  const debouncedSearch = useDebounceValue(searchText, 400)
  const [page, setPage] = useState(1)

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Accounting.IAccount | null>(null)
  const [deactivateTarget, setDeactivateTarget] =
    useState<Accounting.IAccount | null>(null)

  useEffect(() => {
    const term = debouncedSearch.trim()

    setFilters((prev) =>
      (prev.search ?? '') === term ? prev : { ...prev, search: term }
    )
    setPage(1)
  }, [debouncedSearch])

  const load = useCallback(() => {
    dispatch(getAccountsAction({ filters, page, limit: PAGE_LIMIT }))
  }, [dispatch, filters, page])

  useEffect(() => {
    if (view === 'table') {
      load()
    }
  }, [load, view])

  useEffect(() => {
    if (view === 'tree') {
      dispatch(getAccountTreeAction({ filters }))
    }
  }, [dispatch, filters, view])

  const total = Number(data?.total ?? 0)
  const totalPages = Math.ceil(total / PAGE_LIMIT)

  const rows = data?.rows ?? []

  const columns: IFeeColumn<Accounting.IAccountWithBalance>[] = [
    {
      key: 'account',
      label: 'Account',
      render: (row) => (
        <FeeCellStack
          primary={`${row.account_code} · ${row.account_name}`}
          secondary={row.description ?? '—'}
        />
      ),
    },
    {
      key: 'type',
      label: 'Type',
      hideBelow: 'sm',
      render: (row) => (
        <FeeStatusChip meta={ACCOUNT_TYPE_META[row.account_type]} />
      ),
    },
    {
      key: 'subtype',
      label: 'Subtype',
      hideBelow: 'lg',
      render: (row) => (
        <Typography fontSize={11.5} color={colors.grey[600]}>
          {row.account_subtype
            ? ACCOUNT_SUBTYPE_LABEL[row.account_subtype]
            : '—'}
        </Typography>
      ),
    },
    {
      key: 'normal_balance',
      label: 'Normal',
      hideBelow: 'md',
      render: (row) => (
        <Typography fontSize={11.5} color={colors.grey[700]}>
          {row.normal_balance === 'DEBIT' ? 'Debit' : 'Credit'}
        </Typography>
      ),
    },
    {
      key: 'total_debit',
      label: 'Debit',
      align: 'right',
      hideBelow: 'md',
      render: (row) => (
        <FeeAmount value={formatMoney(row.total_debit)} tone="muted" />
      ),
    },
    {
      key: 'total_credit',
      label: 'Credit',
      align: 'right',
      hideBelow: 'md',
      render: (row) => (
        <FeeAmount value={formatMoney(row.total_credit)} tone="muted" />
      ),
    },
    {
      key: 'balance',
      label: 'Balance',
      align: 'right',
      render: (row) => (
        <FeeAmount value={formatMoney(accountBalance(row))} strong />
      ),
    },
    {
      key: 'is_active',
      label: 'Status',
      align: 'center',
      render: (row) => (
        <FeeStatusChip meta={row.is_active ? ACTIVE_META : INACTIVE_META} />
      ),
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      width: 96,
      render: (row) => (
        <Stack
          direction="row"
          spacing={0.25}
          justifyContent="flex-end"
          onClick={(event) => event.stopPropagation()}
        >
          {canManageAccounts ? (
            <Tooltip title="Edit account">
              <IconButton
                size="small"
                onClick={() => {
                  setEditing(row)
                  setFormOpen(true)
                }}
              >
                <Pencil size={14} />
              </IconButton>
            </Tooltip>
          ) : null}
          {canManageAccounts && row.is_active && !row.is_system_account ? (
            <Tooltip title="Deactivate account">
              <IconButton size="small" onClick={() => setDeactivateTarget(row)}>
                <Power size={14} color={colors.red[500]} />
              </IconButton>
            </Tooltip>
          ) : null}
        </Stack>
      ),
    },
  ]

  const filtersActive = Boolean(
    filters.search || filters.account_type || filters.is_active !== undefined
  )

  return (
    <Box>
      <FeePageHeader
        title="Chart of accounts"
        subtitle="Every ledger account of the school with its posted movement. System accounts are provisioned by the backend and cannot be deactivated."
        backTo={ACCOUNTING_BASE_PATH}
        actions={
          <>
            <ButtonComp
              size="small"
              variant="outlined"
              startIcon={
                view === 'table' ? <GitBranch size={14} /> : <List size={14} />
              }
              onClick={() => setView(view === 'table' ? 'tree' : 'table')}
            >
              {view === 'table' ? 'Tree view' : 'List view'}
            </ButtonComp>
            {canManageAccounts ? (
              <>
                <ButtonComp
                  size="small"
                  variant="outlined"
                  loading={settingUp}
                  onClick={() =>
                    dispatch(
                      setupChartOfAccountsAction({
                        onSuccess: () => {
                          setView('table')
                          load()
                        },
                      })
                    )
                  }
                >
                  Provision defaults
                </ButtonComp>
                <ButtonComp
                  size="small"
                  startIcon={<Plus size={14} />}
                  onClick={() => {
                    setEditing(null)
                    setFormOpen(true)
                  }}
                >
                  New account
                </ButtonComp>
              </>
            ) : null}
          </>
        }
      />

      <Box mb={2}>
        <FeeFilterBar
          active={filtersActive}
          onClear={() => {
            setSearchText('')
            setFilters({})
            setPage(1)
          }}
        >
          <Box>
            <Typography fontSize={12.5} color={colors.grey[800]} mb={0.75}>
              Search
            </Typography>
            <InputField
              placeholder="Code or name"
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
            <Typography fontSize={12.5} color={colors.grey[800]} mb={0.75}>
              Account type
            </Typography>
            <SelectField
              isClearable
              placeholder="All types"
              options={ACCOUNT_TYPE_OPTIONS}
              value={
                ACCOUNT_TYPE_OPTIONS.find(
                  (option) => option.value === filters.account_type
                ) ?? null
              }
              onChange={(option) => {
                setFilters((prev) => ({
                  ...prev,
                  account_type: (
                    option as IOption<Accounting.AccountType> | null
                  )?.value,
                }))
                setPage(1)
              }}
            />
          </Box>
          <Box>
            <Typography fontSize={12.5} color={colors.grey[800]} mb={0.75}>
              Status
            </Typography>
            <SelectField
              isClearable
              placeholder="All accounts"
              options={ACCOUNT_ACTIVE_OPTIONS}
              value={
                ACCOUNT_ACTIVE_OPTIONS.find(
                  (option) =>
                    option.value ===
                    (filters.is_active === undefined
                      ? undefined
                      : String(filters.is_active))
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

      {view === 'table' ? (
        <FeePanel
          noPadding
          title={`${total} account${total === 1 ? '' : 's'}`}
          subtitle="Debit / credit totals are the posted movement of each account."
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
            rows={rows}
            rowKey={(row) => row.id}
            loading={loading}
            skeletonRows={8}
            onRowClick={(row) =>
              navigate(`${ACCOUNTING_BASE_PATH}/accounts/${row.id}`)
            }
            emptyIcon={<Wallet size={20} />}
            emptyTitle="No accounts found"
            emptyDescription={
              filtersActive
                ? 'No account matches the current filters.'
                : 'Provision the default chart of accounts to start recording double entry transactions.'
            }
            emptyAction={
              canManageAccounts && !filtersActive ? (
                <ButtonComp
                  size="small"
                  loading={settingUp}
                  onClick={() =>
                    dispatch(
                      setupChartOfAccountsAction({
                        onSuccess: () => load(),
                      })
                    )
                  }
                >
                  Provision chart
                </ButtonComp>
              ) : null
            }
          />
        </FeePanel>
      ) : (
        <FeePanel
          noPadding
          title="Account hierarchy"
          subtitle="Parent / child structure returned by the tree endpoint"
        >
          {tree.data?.length ? (
            <Box>
              {tree.data.map((node) => (
                <AccountTreeRows
                  key={node.id}
                  node={node}
                  depth={0}
                  onOpen={(id) =>
                    navigate(`${ACCOUNTING_BASE_PATH}/accounts/${id}`)
                  }
                />
              ))}
            </Box>
          ) : (
            <FeeEmptyState
              icon={<GitBranch size={20} />}
              title={tree.loading ? 'Loading hierarchy' : 'No accounts found'}
              description={
                tree.loading
                  ? 'Fetching the account tree from the accounting API.'
                  : 'Provision the default chart of accounts to see the hierarchy.'
              }
            />
          )}
        </FeePanel>
      )}

      <AccountFormModal
        open={formOpen}
        account={editing}
        onClose={() => setFormOpen(false)}
        onSaved={() => {
          if (view === 'tree') {
            dispatch(getAccountTreeAction({ filters }))
          } else {
            load()
          }
        }}
      />

      <ConfirmationModal
        open={Boolean(deactivateTarget)}
        heading={`Deactivate ${deactivateTarget?.account_code ?? ''} ${
          deactivateTarget?.account_name ?? ''
        }?`}
        confirmText="Deactivate"
        confirmLoader={mutating}
        onClose={() => setDeactivateTarget(null)}
        onConfirmationClick={() => {
          if (!deactivateTarget) {
            return
          }

          dispatch(
            deleteAccountAction({
              accountId: deactivateTarget.id,
              onSuccess: () => {
                setDeactivateTarget(null)
                load()
              },
            })
          )
        }}
      >
        <Typography fontSize={13} color={colors.grey[600]}>
          Deactivated accounts keep their historical ledger lines but can no
          longer be selected on new journal entries.
        </Typography>
      </ConfirmationModal>
    </Box>
  )
}

interface ITreeRowProps {
  node: Accounting.IAccountNode
  depth: number
  onOpen: (accountId: number) => void
}

/** Recursive row of the account hierarchy (one line per account). */
function AccountTreeRows({ node, depth, onOpen }: ITreeRowProps) {
  return (
    <>
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        onClick={() => onOpen(node.id)}
        sx={{
          pl: 2 + depth * 2.5,
          pr: 2,
          py: 1.15,
          cursor: 'pointer',
          borderBottom: `1px solid ${colors.grey[100]}`,
          '&:hover': { bgcolor: colors.grey[50] },
        }}
      >
        <Typography
          fontSize={11.5}
          color={colors.grey[500]}
          sx={{ minWidth: 76 }}
        >
          {node.account_code}
        </Typography>
        <Typography
          fontSize={12.5}
          fontWeight={depth === 0 ? 700 : 500}
          color={colors.grey[900]}
          flex={1}
          noWrap
        >
          {node.account_name}
        </Typography>
        {!node.is_active ? (
          <Typography fontSize={11} color={colors.grey[400]}>
            Inactive
          </Typography>
        ) : null}
        <FeeStatusChip meta={ACCOUNT_TYPE_META[node.account_type]} />
      </Stack>
      {node.children?.map((child) => (
        <AccountTreeRows
          key={child.id}
          node={child}
          depth={depth + 1}
          onOpen={onOpen}
        />
      ))}
    </>
  )
}
