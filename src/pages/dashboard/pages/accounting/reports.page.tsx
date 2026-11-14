import { Box, Stack, Tab, Tabs, Typography } from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Download, RefreshCw, Scale, Wallet } from 'lucide-react'
import { ButtonComp } from '@src/components/button/button.component'
import { SelectField } from '@src/components/select/select.component'
import { colors } from '@src/helpers/colors.helpers'
import { useDispatch, useSelector } from '@src/store/hooks.store'
import { getAccountsAction } from '@src/store/redux/dashboard/accounting/accounting.slice'
import { IAccountFilters } from '@src/store/redux/dashboard/accounting/accounting.service'
import { downloadCsv } from '../fees/fees.helpers'
import {
  FeeAmount,
  FeeDataTable,
  IFeeColumn,
} from '../fees/components/feeDataTable.component'
import { FeePageHeader } from '../fees/components/feePageHeader.component'
import { FeePanel } from '../fees/components/feePanel.component'
import { FeeFilterBar } from '../fees/components/feeFilterBar.component'
import {
  FeeStatCard,
  FeeStatGrid,
} from '../fees/components/feeStatCard.component'
import { FeeStatusChip } from '../fees/components/feeStatusChip.component'
import {
  ACCOUNT_ACTIVE_OPTIONS,
  ACCOUNT_TYPE_META,
  ACCOUNT_TYPE_OPTIONS,
  ACCOUNT_TYPE_ORDER,
  ACCOUNTING_BASE_PATH,
  fromMinor,
  IOption,
  toMinor,
} from './accounting.helpers'

type TTab = 'trial' | 'movement'

interface ITrialRow {
  id: number
  account_code: string
  account_name: string
  account_type: Accounting.AccountType
  is_active: boolean
  debitMinor: number
  creditMinor: number
}

interface IMovementRow {
  account_type: Accounting.AccountType
  accounts: number
  debitMinor: number
  creditMinor: number
  netMinor: number
}

const REPORT_LIMIT = 500

/**
 * Financial reports (`/dashboard/accounting/reports`).
 *
 * The backend exposes no dedicated reporting endpoint yet, so every figure on
 * this screen is aggregated in the browser from the posted movement returned by
 * `GET /accounting/accounts` (`total_debit` / `total_credit` per account). No
 * number is invented: accounts without movement are simply shown with zeros.
 *
 * Deferred (no backend endpoint yet): audit log and bank reconciliation.
 */
export function AccountingReportsPage() {
  const dispatch = useDispatch()

  const { data, loading } = useSelector((store) => store.accounting.accounts)

  const [tab, setTab] = useState<TTab>('trial')
  const [filters, setFilters] = useState<IAccountFilters>({})

  useEffect(() => {
    dispatch(
      getAccountsAction({
        filters,
        page: 1,
        limit: REPORT_LIMIT,
      })
    )
  }, [dispatch, filters])

  const accounts = (data?.rows ?? []) as Accounting.IAccountWithBalance[]
  const total = Number(data?.total ?? 0)

  const trialRows = useMemo<ITrialRow[]>(
    () =>
      accounts
        .map((account) => {
          const net =
            toMinor(account.total_debit) - toMinor(account.total_credit)

          return {
            id: account.id,
            account_code: account.account_code,
            account_name: account.account_name,
            account_type: account.account_type,
            is_active: account.is_active,
            debitMinor: net > 0 ? net : 0,
            creditMinor: net < 0 ? -net : 0,
          }
        })
        .sort(
          (left, right) =>
            ACCOUNT_TYPE_ORDER.indexOf(left.account_type) -
              ACCOUNT_TYPE_ORDER.indexOf(right.account_type) ||
            left.account_code.localeCompare(right.account_code)
        ),
    [accounts]
  )

  const movementRows = useMemo<IMovementRow[]>(
    () =>
      ACCOUNT_TYPE_ORDER.map((accountType) => {
        const scoped = accounts.filter(
          (account) => account.account_type === accountType
        )
        const debitMinor = scoped.reduce(
          (sum, account) => sum + toMinor(account.total_debit),
          0
        )
        const creditMinor = scoped.reduce(
          (sum, account) => sum + toMinor(account.total_credit),
          0
        )

        return {
          account_type: accountType,
          accounts: scoped.length,
          debitMinor,
          creditMinor,
          netMinor: debitMinor - creditMinor,
        }
      }).filter((row) => row.accounts > 0),
    [accounts]
  )

  const totals = useMemo(() => {
    const debitMinor = trialRows.reduce((sum, row) => sum + row.debitMinor, 0)
    const creditMinor = trialRows.reduce((sum, row) => sum + row.creditMinor, 0)

    return {
      debitMinor,
      creditMinor,
      differenceMinor: debitMinor - creditMinor,
      balanced: debitMinor === creditMinor,
    }
  }, [trialRows])

  const trialColumns: IFeeColumn<ITrialRow>[] = [
    {
      key: 'account',
      label: 'Account',
      render: (row) => (
        <Link
          to={`${ACCOUNTING_BASE_PATH}/accounts/${row.id}`}
          style={{ textDecoration: 'none' }}
        >
          <Typography fontSize={13} fontWeight={600} color={colors.grey[900]}>
            {row.account_code} · {row.account_name}
          </Typography>
          <Typography fontSize={11.5} color={colors.grey[500]}>
            {ACCOUNT_TYPE_META[row.account_type].label}
            {row.is_active ? '' : ' · inactive'}
          </Typography>
        </Link>
      ),
    },
    {
      key: 'type',
      label: 'Type',
      hideBelow: 'md',
      render: (row) => (
        <FeeStatusChip meta={ACCOUNT_TYPE_META[row.account_type]} />
      ),
    },
    {
      key: 'debit',
      label: 'Debit',
      align: 'right',
      render: (row) => (
        <FeeAmount
          value={row.debitMinor ? fromMinor(row.debitMinor) : '—'}
          tone={row.debitMinor ? 'default' : 'muted'}
        />
      ),
    },
    {
      key: 'credit',
      label: 'Credit',
      align: 'right',
      render: (row) => (
        <FeeAmount
          value={row.creditMinor ? fromMinor(row.creditMinor) : '—'}
          tone={row.creditMinor ? 'default' : 'muted'}
        />
      ),
    },
  ]

  const movementColumns: IFeeColumn<IMovementRow>[] = [
    {
      key: 'type',
      label: 'Account type',
      render: (row) => (
        <FeeStatusChip meta={ACCOUNT_TYPE_META[row.account_type]} />
      ),
    },
    {
      key: 'accounts',
      label: 'Accounts',
      align: 'right',
      hideBelow: 'sm',
      render: (row) => (
        <Typography fontSize={12.5} color={colors.grey[700]}>
          {row.accounts}
        </Typography>
      ),
    },
    {
      key: 'debit',
      label: 'Total debit',
      align: 'right',
      render: (row) => <FeeAmount value={fromMinor(row.debitMinor)} />,
    },
    {
      key: 'credit',
      label: 'Total credit',
      align: 'right',
      render: (row) => <FeeAmount value={fromMinor(row.creditMinor)} />,
    },
    {
      key: 'net',
      label: 'Net movement',
      align: 'right',
      render: (row) => (
        <FeeAmount
          value={fromMinor(row.netMinor)}
          strong
          tone={row.netMinor < 0 ? 'danger' : 'success'}
        />
      ),
    },
  ]

  const exportReport = () => {
    if (tab === 'trial') {
      downloadCsv(
        'trial-balance',
        [
          { key: 'code', label: 'Account code' },
          { key: 'name', label: 'Account name' },
          { key: 'type', label: 'Type' },
          { key: 'debit', label: 'Debit' },
          { key: 'credit', label: 'Credit' },
        ],
        trialRows.map((row) => ({
          code: row.account_code,
          name: row.account_name,
          type: ACCOUNT_TYPE_META[row.account_type].label,
          debit: row.debitMinor ? fromMinor(row.debitMinor) : '',
          credit: row.creditMinor ? fromMinor(row.creditMinor) : '',
        }))
      )

      return
    }

    downloadCsv(
      'movement-by-type',
      [
        { key: 'type', label: 'Account type' },
        { key: 'accounts', label: 'Accounts' },
        { key: 'debit', label: 'Total debit' },
        { key: 'credit', label: 'Total credit' },
        { key: 'net', label: 'Net movement' },
      ],
      movementRows.map((row) => ({
        type: ACCOUNT_TYPE_META[row.account_type].label,
        accounts: row.accounts,
        debit: fromMinor(row.debitMinor),
        credit: fromMinor(row.creditMinor),
        net: fromMinor(row.netMinor),
      }))
    )
  }

  return (
    <Box>
      <FeePageHeader
        title="Financial reports"
        subtitle="Trial balance and movement by account type, aggregated from the posted debit/credit of every account."
        actions={
          <>
            <ButtonComp
              size="small"
              variant="outlined"
              startIcon={<RefreshCw size={14} />}
              disabled={loading}
              onClick={() =>
                dispatch(
                  getAccountsAction({
                    filters,
                    page: 1,
                    limit: REPORT_LIMIT,
                  })
                )
              }
            >
              Refresh
            </ButtonComp>
            <ButtonComp
              size="small"
              startIcon={<Download size={14} />}
              disabled={loading || accounts.length === 0}
              onClick={exportReport}
            >
              Export CSV
            </ButtonComp>
          </>
        }
      />

      <Box sx={{ borderBottom: `1px solid ${colors.grey[200]}`, mb: 2 }}>
        <Tabs
          value={tab}
          onChange={(_, value: TTab) => setTab(value)}
          sx={{ minHeight: 36 }}
        >
          <Tab value="trial" label="Trial balance" sx={{ fontSize: 13 }} />
          <Tab
            value="movement"
            label="Movement by type"
            sx={{ fontSize: 13 }}
          />
        </Tabs>
      </Box>

      <FeeStatGrid columns={{ xs: 2, md: 4 }}>
        <FeeStatCard
          label="Accounts"
          value={total}
          caption={
            total > accounts.length
              ? `First ${accounts.length} of ${total} loaded`
              : 'Every account in the chart'
          }
          icon={<Wallet size={15} />}
          loading={loading && accounts.length === 0}
        />
        <FeeStatCard
          label="Total debit"
          value={fromMinor(totals.debitMinor)}
          caption="Debit balances after netting"
          accent={colors.blue[700]}
          soft={colors.blue[50]}
          loading={loading && accounts.length === 0}
        />
        <FeeStatCard
          label="Total credit"
          value={fromMinor(totals.creditMinor)}
          caption="Credit balances after netting"
          accent={colors.green[700]}
          soft={colors.green[50]}
          loading={loading && accounts.length === 0}
        />
        <FeeStatCard
          label={totals.balanced ? 'Balanced' : 'Out of balance'}
          value={fromMinor(totals.differenceMinor)}
          caption={
            totals.balanced ? 'Debit equals credit' : 'Debit and credit differ'
          }
          accent={totals.balanced ? colors.green[700] : colors.red[600]}
          soft={totals.balanced ? colors.green[50] : colors.red[50]}
          icon={<Scale size={15} />}
          loading={loading && accounts.length === 0}
        />
      </FeeStatGrid>

      <Box my={2}>
        <FeeFilterBar
          columns={3}
          title="Report scope"
          active={Boolean(
            filters.account_type || filters.is_active !== undefined
          )}
          onClear={() => setFilters({})}
        >
          <Box>
            <Typography fontSize={13} color={colors.grey[800]} mb={1}>
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
              onChange={(option) =>
                setFilters((prev) => ({
                  ...prev,
                  account_type: (
                    option as IOption<Accounting.AccountType> | null
                  )?.value,
                }))
              }
            />
          </Box>
          <Box>
            <Typography fontSize={13} color={colors.grey[800]} mb={1}>
              State
            </Typography>
            <SelectField
              isClearable
              placeholder="Active and inactive"
              options={ACCOUNT_ACTIVE_OPTIONS}
              value={
                ACCOUNT_ACTIVE_OPTIONS.find(
                  (option) => option.value === String(filters.is_active)
                ) ?? null
              }
              onChange={(option) => {
                const value = (option as IOption<string> | null)?.value

                setFilters((prev) => ({
                  ...prev,
                  is_active: value === undefined ? undefined : value === 'true',
                }))
              }}
            />
          </Box>
        </FeeFilterBar>
      </Box>

      <FeePanel
        noPadding
        title={tab === 'trial' ? 'Trial balance' : 'Movement by account type'}
        subtitle={
          tab === 'trial'
            ? 'Each account shows its net balance on the debit or the credit side.'
            : 'Posted debit and credit summed per account type.'
        }
        footer={
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', sm: 'center' }}
          >
            <Typography fontSize={11.5} color={colors.grey[500]}>
              Built from the accounts endpoint (posted movement). Audit log and
              reconciliation stay deferred until the backend exposes them.
            </Typography>
            <Stack direction="row" spacing={2}>
              <Typography fontSize={12} color={colors.grey[600]}>
                Debit <strong>{fromMinor(totals.debitMinor)}</strong>
              </Typography>
              <Typography fontSize={12} color={colors.grey[600]}>
                Credit <strong>{fromMinor(totals.creditMinor)}</strong>
              </Typography>
            </Stack>
          </Stack>
        }
      >
        <FeeDataTable<ITrialRow | IMovementRow>
          columns={
            (tab === 'trial' ? trialColumns : movementColumns) as IFeeColumn<
              ITrialRow | IMovementRow
            >[]
          }
          rows={tab === 'trial' ? trialRows : movementRows}
          rowKey={(row) => ('id' in row ? row.id : row.account_type)}
          loading={loading}
          skeletonRows={6}
          dense
          emptyIcon={<Scale size={20} />}
          emptyTitle="Nothing to report yet"
          emptyDescription="Post journal entries to populate the trial balance."
        />
      </FeePanel>
    </Box>
  )
}
