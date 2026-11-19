import { api } from '@src/helpers/api.helpers'

/**
 * Admin dashboard API client.
 *
 * Four independent endpoints of `backend/src/dashboard/dashboard.routes.ts`:
 * each widget group loads, fails and retries on its own, so a slow finance
 * query never blocks the header or the academic charts.
 */
export type TOverviewRange = { date_from: string; date_to: string }

const unwrap = <T>(response: { data: Api.Base<T> }) => response.data.data.data

const getSummaryService = async (range: TOverviewRange) => {
  const res = await api<Api.Base<Dashboard.ISummary>>('get')(
    'dashboard/summary',
    range
  )

  return unwrap(res)
}

const getAcademicsService = async (range: TOverviewRange) => {
  const res = await api<Api.Base<Dashboard.IAcademics>>('get')(
    'dashboard/academics',
    range
  )

  return unwrap(res)
}

const getFinanceService = async (range: TOverviewRange) => {
  const res = await api<Api.Base<Dashboard.IFinance>>('get')(
    'dashboard/finance',
    range
  )

  return unwrap(res)
}

const getFeedService = async (limit = 12) => {
  const res = await api<Api.Base<Dashboard.IFeed>>('get')('dashboard/feed', {
    limit,
  })

  return unwrap(res)
}

export const overviewServices = {
  getSummaryService,
  getAcademicsService,
  getFinanceService,
  getFeedService,
}
