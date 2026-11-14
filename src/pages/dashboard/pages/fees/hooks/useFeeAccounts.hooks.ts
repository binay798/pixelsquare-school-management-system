import { useEffect } from 'react'
import { useDispatch, useSelector } from '@src/store/hooks.store'
import { getAccountOptionsAction } from '@src/store/redux/dashboard/fee/fee.dashboard.slice'

/**
 * Chart of accounts of the school (`GET /accounting/accounts/options`).
 *
 * Loaded once and cached in the store: fee types and late fee rules map their
 * revenue to a real account, the id is never hardcoded in the UI.
 */
export function useFeeAccounts() {
  const dispatch = useDispatch()
  const { data, loading } = useSelector((store) => store.feeDashboard.accounts)

  useEffect(() => {
    if (!data && !loading) {
      dispatch(getAccountOptionsAction({}))
    }
  }, [dispatch, data, loading])

  return { accounts: data ?? [], loading }
}
