import {
  Box,
  Checkbox,
  FormControlLabel,
  InputAdornment,
  Pagination,
  Stack,
  Typography,
} from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, RotateCcw, Search, Settings2, ShieldCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import { ButtonComp } from '@src/components/button/button.component'
import { InputField } from '@src/components/input/input.component'
import { SelectField } from '@src/components/select/select.component'
import { colors } from '@src/helpers/colors.helpers'
import { useDebounceValue } from '@src/hooks/useDebounceValue.hooks'
import { useComplaintPermissions } from '@src/hooks/useComplaintPermissions.hooks'
import { useDispatch, useSelector } from '@src/store/hooks.store'
import {
  getComplaintListAction,
  getComplaintStatsAction,
  runComplaintSlaSweepAction,
} from '@src/store/redux/dashboard/complaints/complaints.slice'
import { IComplaintFilters } from '@src/store/redux/dashboard/complaints/complaints.service'
import { getComplaintCategoriesAction } from '@src/store/redux/dashboard/complaints/complaintConfig.slice'
import {
  COMPLAINT_BASE_PATH,
  COMPLAINT_PRIORITY_OPTIONS,
  COMPLAINT_SLA_FILTER_OPTIONS,
  COMPLAINT_STATUS_FILTER_OPTIONS,
} from './complaints.helpers'
import {
  ComplaintStatCards,
  TComplaintStatKey,
} from './components/statCards/complaintStatCards.component'
import { ComplaintTable } from './components/complaintTable/complaintTable.component'

const PAGE_LIMIT = 10

const statusOptions = [
  { label: 'Open (all)', value: '' },
  ...COMPLAINT_STATUS_FILTER_OPTIONS,
]

export function ComplaintListPage() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { can } = useComplaintPermissions()

  const { data: list, loading } = useSelector(
    (store) => store.complaints.complaintList
  )
  const { data: stats, loading: statsLoading } = useSelector(
    (store) => store.complaints.complaintStats
  )
  const { data: categories } = useSelector(
    (store) => store.complaintConfig.categories
  )
  const { loading: sweeping } = useSelector(
    (store) => store.complaints.sweepMutation
  )

  const [filters, setFilters] = useState<IComplaintFilters>({ status: '' })
  const [statKey, setStatKey] = useState<TComplaintStatKey | ''>('')
  const [searchText, setSearchText] = useState('')
  const debouncedSearch = useDebounceValue(searchText, 400)
  const [page, setPage] = useState(1)

  useEffect(() => {
    dispatch(getComplaintCategoriesAction(false))
  }, [dispatch])

  useEffect(() => {
    setPage(1)
  }, [filters])

  useEffect(() => {
    const current = filters.search ?? ''
    if (debouncedSearch.trim() !== current) {
      setFilters((prev) => ({ ...prev, search: debouncedSearch.trim() }))
    }
  }, [debouncedSearch])

  useEffect(() => {
    dispatch(getComplaintListAction({ filters, page, limit: PAGE_LIMIT }))
    dispatch(getComplaintStatsAction())
  }, [dispatch, filters, page])

  const categoryOptions = useMemo(
    () =>
      (categories ?? []).map((category) => ({
        label: category.name,
        value: category.id,
      })),
    [categories]
  )

  const rows = list?.rows ?? []
  const total = Number(list?.total ?? 0)
  const totalPages = Math.max(1, Math.ceil(total / PAGE_LIMIT))

  const applyStatKey = (key: TComplaintStatKey) => {
    setStatKey(key)

    setFilters((prev) => ({
      ...prev,
      status: key === 'escalated' ? 'escalated' : '',
      unassigned: key === 'unassigned' ? true : undefined,
      sla: key === 'overdue' ? 'breached' : '',
    }))
  }

  const resetFilters = () => {
    setStatKey('')
    setSearchText('')
    setFilters({ status: '' })
    setPage(1)
  }

  const runSweep = () => {
    dispatch(
      runComplaintSlaSweepAction({
        onSuccess: (result) => {
          toast.success(
            `Scanned ${result.scanned} · breached ${result.breached} · escalated ${result.escalated} · closed ${result.autoClosed}`
          )
          dispatch(getComplaintListAction({ filters, page, limit: PAGE_LIMIT }))
          dispatch(getComplaintStatsAction())
        },
      })
    )
  }

  return (
    <Stack spacing={2} p={{ xs: 2, md: 3 }}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        alignItems={{ xs: 'flex-start', md: 'center' }}
        justifyContent="space-between"
        spacing={1.5}
      >
        <Box>
          <Typography fontSize={20} fontWeight={700} color={colors.grey[900]}>
            Complaint desk
          </Typography>
          <Typography fontSize={13} color={colors.grey[600]}>
            Every grievance logged by the school office, with its SLA clock and
            audit trail.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} flexWrap="wrap">
          {can('complaint.desk.create') ? (
            <ButtonComp
              size="small"
              variant="contained"
              startIcon={<Plus size={15} />}
              onClick={() => navigate(`${COMPLAINT_BASE_PATH}/create`)}
            >
              Log complaint
            </ButtonComp>
          ) : null}
          {can('complaint.config.manage') ? (
            <ButtonComp
              size="small"
              variant="outlined"
              startIcon={<ShieldCheck size={15} />}
              loading={sweeping}
              onClick={runSweep}
            >
              Run SLA sweep
            </ButtonComp>
          ) : null}
          {can('complaint.config.manage') ? (
            <ButtonComp
              size="small"
              variant="text"
              startIcon={<Settings2 size={15} />}
              onClick={() => navigate(`${COMPLAINT_BASE_PATH}/config`)}
            >
              Categories & SLA
            </ButtonComp>
          ) : null}
        </Stack>
      </Stack>

      <ComplaintStatCards
        stats={stats}
        loading={statsLoading}
        activeKey={statKey}
        onSelect={applyStatKey}
      />

      <Box
        sx={{
          borderRadius: 3,
          border: `1px solid ${colors.grey[200]}`,
          bgcolor: '#fff',
          p: 1.75,
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gap: 1.25,
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, minmax(0, 1fr))',
              lg: 'repeat(5, minmax(0, 1fr))',
            },
          }}
        >
          <SelectField
            placeholder="Any status"
            options={statusOptions}
            value={
              statusOptions.find(
                (option) => option.value === (filters.status ?? '')
              ) ?? null
            }
            onChange={(option) =>
              setFilters((prev) => ({
                ...prev,
                status:
                  (option as { value: Complaint.Status | '' } | null)?.value ??
                  '',
              }))
            }
            styles={{
              control: (base) => ({ ...base, minHeight: 36, fontSize: 13 }),
            }}
          />
          <SelectField
            placeholder="Any category"
            options={categoryOptions}
            isClearable
            value={
              categoryOptions.find(
                (option) => option.value === filters.categoryId
              ) ?? null
            }
            onChange={(option) =>
              setFilters((prev) => ({
                ...prev,
                categoryId: (option as { value: number } | null)?.value ?? '',
              }))
            }
            styles={{
              control: (base) => ({ ...base, minHeight: 36, fontSize: 13 }),
            }}
          />
          <SelectField
            placeholder="Any priority"
            options={COMPLAINT_PRIORITY_OPTIONS}
            isClearable
            value={
              COMPLAINT_PRIORITY_OPTIONS.find(
                (option) => option.value === filters.priority
              ) ?? null
            }
            onChange={(option) =>
              setFilters((prev) => ({
                ...prev,
                priority:
                  (option as { value: Complaint.Priority } | null)?.value ?? '',
              }))
            }
            styles={{
              control: (base) => ({ ...base, minHeight: 36, fontSize: 13 }),
            }}
          />
          <SelectField
            placeholder="Any SLA state"
            options={COMPLAINT_SLA_FILTER_OPTIONS}
            isClearable
            value={
              COMPLAINT_SLA_FILTER_OPTIONS.find(
                (option) => option.value === filters.sla
              ) ?? null
            }
            onChange={(option) =>
              setFilters((prev) => ({
                ...prev,
                sla:
                  (
                    option as {
                      value: 'breached' | 'due_soon' | 'on_track'
                    } | null
                  )?.value ?? '',
              }))
            }
            styles={{
              control: (base) => ({ ...base, minHeight: 36, fontSize: 13 }),
            }}
          />
          <InputField
            placeholder="Search number, title, complainant"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            startAdornment={
              <InputAdornment position="start">
                <Search size={16} color={colors.grey[500]} />
              </InputAdornment>
            }
          />
        </Box>

        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          mt={1.5}
        >
          <FormControlLabel
            control={
              <Checkbox
                size="small"
                checked={Boolean(filters.includeClosed)}
                onChange={(event) =>
                  setFilters((prev) => ({
                    ...prev,
                    includeClosed: event.target.checked || undefined,
                  }))
                }
              />
            }
            label={
              <Typography fontSize={12.5} color={colors.grey[700]}>
                Show closed / withdrawn / rejected
              </Typography>
            }
          />
          <ButtonComp
            size="small"
            variant="text"
            startIcon={<RotateCcw size={13} />}
            onClick={resetFilters}
          >
            Reset
          </ButtonComp>
        </Stack>
      </Box>

      <ComplaintTable
        rows={rows}
        loading={loading}
        onView={(row) => navigate(`${COMPLAINT_BASE_PATH}/${row.id}`)}
        emptyMessage={
          statKey || filters.search || filters.categoryId || filters.priority
            ? 'No complaints match these filters.'
            : 'No complaints logged yet.'
        }
      />

      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography fontSize={12.5} color={colors.grey[600]}>
          {total} complaint{total === 1 ? '' : 's'}
        </Typography>
        <Pagination
          size="small"
          shape="rounded"
          page={page}
          count={totalPages}
          onChange={(_, value) => setPage(value)}
        />
      </Stack>
    </Stack>
  )
}
