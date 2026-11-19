import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useDispatch, useSelector } from '@src/store/hooks.store'
import { getProfileAction } from '@src/store/redux/dashboard/account/profile/profile.slice'
import {
  loadDashboardAcademics,
  loadDashboardFeed,
  loadDashboardFinance,
  loadDashboardSummary,
} from '@src/store/redux/dashboard/overview/overview.slice'
import { buildDashboardRange, TDashboardRangeKey } from '../dashboard.helpers'

/**
 * One hook per dashboard surface:
 * - `useDashboardData` owns the four independent widget groups and their retries;
 * - `useDashboardIdentity` resolves the greeting name, roles and active year.
 */

export function useDashboardData() {
  const dispatch = useDispatch()

  const summary = useSelector((store) => store.dashboardOverview.summary)
  const academics = useSelector((store) => store.dashboardOverview.academics)
  const finance = useSelector((store) => store.dashboardOverview.finance)
  const feed = useSelector((store) => store.dashboardOverview.feed)

  const [rangeKey, setRangeKey] = useState<TDashboardRangeKey>('month')
  const range = useMemo(() => buildDashboardRange(rangeKey), [rangeKey])
  /** Last range that was fetched, so StrictMode cannot dispatch twice. */
  const lastLoadedRange = useRef<string | null>(null)

  const reloadSummary = useCallback(() => {
    void dispatch(loadDashboardSummary(range))
  }, [dispatch, range])

  const reloadAcademics = useCallback(() => {
    void dispatch(loadDashboardAcademics(range))
  }, [dispatch, range])

  const reloadFinance = useCallback(() => {
    void dispatch(loadDashboardFinance(range))
  }, [dispatch, range])

  const reloadFeed = useCallback(() => {
    void dispatch(loadDashboardFeed({ limit: 12 }))
  }, [dispatch])

  const refresh = useCallback(() => {
    reloadSummary()
    reloadAcademics()
    reloadFinance()
    reloadFeed()
  }, [reloadSummary, reloadAcademics, reloadFinance, reloadFeed])

  useEffect(() => {
    const key = `${range.date_from}|${range.date_to}`

    if (lastLoadedRange.current === key) {
      return
    }

    lastLoadedRange.current = key
    refresh()
    // The range is the only meaningful input: changing it refetches every widget.
  }, [range.date_from, range.date_to, refresh])

  const refreshing =
    summary.loading || academics.loading || finance.loading || feed.loading
  const hasLoaded = Boolean(
    summary.data || academics.data || finance.data || feed.data
  )

  return {
    summary,
    academics,
    finance,
    feed,
    range,
    rangeKey,
    setRangeKey,
    refresh,
    retry: {
      summary: reloadSummary,
      academics: reloadAcademics,
      finance: reloadFinance,
      feed: reloadFeed,
    },
    refreshing,
    hasLoaded,
  }
}

export function useDashboardIdentity() {
  const dispatch = useDispatch()
  /** The profile is optional: never retry it in a loop when the call fails. */
  const profileRequested = useRef(false)

  const roles = useSelector((store) => store.auth.user.data?.userRoles) ?? []
  const email = useSelector((store) => store.auth.user.data?.user.email)
  const profile = useSelector((store) => store.accountProfile.details.data)
  const profileLoading = useSelector(
    (store) => store.accountProfile.details.loading
  )
  const activeYear = useSelector(
    (store) => store.academicYear.activeAcademicYearOfSchool.data
  )
  const school = useSelector((store) => store.manageSchool.schoolDetail.data)

  useEffect(() => {
    if (!profile && !profileLoading && !profileRequested.current) {
      profileRequested.current = true
      void dispatch(getProfileAction({}))
    }
    // Only re-run while the profile is still missing.
  }, [dispatch, profile, profileLoading])

  const fullName = useMemo(() => {
    const fromProfile = [profile?.firstname, profile?.lastname]
      .filter(Boolean)
      .join(' ')
      .trim()

    if (fromProfile) {
      return fromProfile
    }

    const localPart = email?.split('@')[0]?.replace(/[._-]+/g, ' ')

    return localPart
      ? localPart.replace(/\b\w/g, (letter: string) => letter.toUpperCase())
      : 'Administrator'
  }, [profile?.firstname, profile?.lastname, email])

  const greetingName = fullName.split(' ')[0] ?? 'Administrator'

  return { roles, email, fullName, greetingName, activeYear, school }
}
