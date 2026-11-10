import {
  Box,
  InputAdornment,
  Pagination,
  Stack,
  Typography,
} from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BellRing, CheckCheck, Plus, Search } from 'lucide-react'
import { ButtonComp } from '@src/components/button/button.component'
import { CustomSwitch } from '@src/components/switch/switch.component'
import { InputField } from '@src/components/input/input.component'
import { SelectField } from '@src/components/select/select.component'
import { StylesConfig } from 'react-select'
import { colors } from '@src/helpers/colors.helpers'
import { ROLE } from '@src/constants/users.constants'
import { useDebounceValue } from '@src/hooks/useDebounceValue.hooks'
import { useDispatch, useSelector } from '@src/store/hooks.store'
import {
  getAnnouncementFeedAction,
  getAnnouncementUnreadSummaryAction,
} from '@src/store/redux/dashboard/academics/announcements/announcements.slice'
import { IAnnouncementFeedFilters } from '@src/store/redux/dashboard/academics/announcements/announcements.service'
import {
  ANNOUNCEMENT_BASE_PATH,
  ANNOUNCEMENT_CATEGORY_OPTIONS,
  ANNOUNCEMENT_PRIORITY_OPTIONS,
} from '../../announcements.helpers'
import {
  AnnouncementCard,
  AnnouncementCardSkeleton,
} from '../../components/announcementCard/announcementCard.component'

const PAGE_LIMIT = 10

const AUTHOR_ROLES: string[] = [
  ROLE.superadmin,
  ROLE.admin,
  ROLE.teacher,
  ROLE.staff,
]

const MANAGER_ROLES: string[] = [ROLE.superadmin, ROLE.admin, ROLE.staff]

const controlStyles: StylesConfig = {
  control: (base) => ({
    ...base,
    minHeight: 36,
    fontSize: 13,
  }),
}

export function AnnouncementFeedPage() {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const { data: auth } = useSelector((store) => store.auth.user)
  const { data: feed, loading } = useSelector(
    (store) => store.announcements.feedList
  )
  const { data: summary } = useSelector(
    (store) => store.announcements.unreadSummary
  )

  const [filters, setFilters] = useState<IAnnouncementFeedFilters>({
    category: '',
    priority: '',
    unreadOnly: false,
    requireAcknowledgementOnly: false,
    search: '',
  })
  const [searchText, setSearchText] = useState('')
  const [page, setPage] = useState(1)
  const debouncedSearch = useDebounceValue(searchText, 400)

  const userRoles = auth?.userRoles ?? []
  const isAuthor = useMemo(
    () => userRoles.some((role) => AUTHOR_ROLES.includes(role)),
    [userRoles]
  )
  const isManager = useMemo(
    () => userRoles.some((role) => MANAGER_ROLES.includes(role)),
    [userRoles]
  )

  useEffect(() => {
    const current = filters.search ?? ''
    if (debouncedSearch.trim() !== current) {
      setFilters((prev) => ({ ...prev, search: debouncedSearch.trim() }))
    }
  }, [debouncedSearch])

  useEffect(() => {
    setPage(1)
  }, [filters])

  useEffect(() => {
    dispatch(getAnnouncementFeedAction({ filters, page, limit: PAGE_LIMIT }))
    dispatch(getAnnouncementUnreadSummaryAction())
  }, [dispatch, filters, page])

  const rows = feed?.rows ?? []
  const total = Number(feed?.total ?? 0)
  const totalPages = Math.max(1, Math.ceil(total / PAGE_LIMIT))

  return (
    <Box>
      <Stack
        mb={2.5}
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', md: 'center' }}
      >
        <Box>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="h5" fontWeight={700} color={colors.grey[900]}>
              Notice board
            </Typography>
            {Number(summary?.unread_count ?? 0) > 0 ? (
              <Stack
                direction="row"
                spacing={0.4}
                alignItems="center"
                sx={{
                  px: 0.9,
                  py: 0.2,
                  borderRadius: 999,
                  bgcolor: colors.blue[50],
                  border: `1px solid ${colors.blue[200]}`,
                  color: colors.blue[700],
                }}
              >
                <BellRing size={11} />
                <Typography fontSize={11} fontWeight={700} color="inherit">
                  {summary?.unread_count} unread
                </Typography>
              </Stack>
            ) : null}
            {Number(summary?.pending_acknowledgement_count ?? 0) > 0 ? (
              <Stack
                direction="row"
                spacing={0.4}
                alignItems="center"
                sx={{
                  px: 0.9,
                  py: 0.2,
                  borderRadius: 999,
                  bgcolor: colors.amber[50],
                  border: `1px solid ${colors.amber[200]}`,
                  color: colors.amber[800],
                }}
              >
                <CheckCheck size={11} />
                <Typography fontSize={11} fontWeight={700} color="inherit">
                  {summary?.pending_acknowledgement_count} to acknowledge
                </Typography>
              </Stack>
            ) : null}
          </Stack>
          <Typography variant="body2" mt={0.5} color={colors.grey[600]}>
            Every notice published to you, your classes and your role.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
          {isManager ? (
            <ButtonComp
              size="small"
              variant="outlined"
              onClick={() => navigate(ANNOUNCEMENT_BASE_PATH)}
            >
              Manage board
            </ButtonComp>
          ) : null}
          {isAuthor ? (
            <ButtonComp
              size="small"
              startIcon={<Plus size={15} />}
              onClick={() => navigate(`${ANNOUNCEMENT_BASE_PATH}/create`)}
            >
              New announcement
            </ButtonComp>
          ) : null}
        </Stack>
      </Stack>

      <Box
        sx={{
          borderRadius: 3,
          border: `1px solid ${colors.grey[200]}`,
          bgcolor: '#fff',
          p: 1.75,
          mb: 2.5,
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gap: 1.25,
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, minmax(0, 1fr))',
              lg: 'repeat(3, minmax(0, 1fr))',
            },
          }}
        >
          <SelectField
            placeholder="All categories"
            options={ANNOUNCEMENT_CATEGORY_OPTIONS}
            isClearable
            value={
              ANNOUNCEMENT_CATEGORY_OPTIONS.find(
                (option) => option.value === filters.category
              ) ?? null
            }
            onChange={(option) =>
              setFilters((prev) => ({
                ...prev,
                category:
                  (option as { value: Announcement.Category } | null)?.value ??
                  '',
              }))
            }
            styles={controlStyles}
          />
          <SelectField
            placeholder="Any priority"
            options={ANNOUNCEMENT_PRIORITY_OPTIONS}
            isClearable
            value={
              ANNOUNCEMENT_PRIORITY_OPTIONS.find(
                (option) => option.value === filters.priority
              ) ?? null
            }
            onChange={(option) =>
              setFilters((prev) => ({
                ...prev,
                priority:
                  (option as { value: Announcement.Priority } | null)?.value ??
                  '',
              }))
            }
            styles={controlStyles}
          />
          <InputField
            placeholder="Search the notice board"
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
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          mt={1.5}
          alignItems={{ xs: 'flex-start', sm: 'center' }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <CustomSwitch
              checked={Boolean(filters.unreadOnly)}
              onChange={(event) =>
                setFilters((prev) => ({
                  ...prev,
                  unreadOnly: event.target.checked,
                }))
              }
            />
            <Typography fontSize={12.5} color={colors.grey[700]}>
              Unread only
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <CustomSwitch
              checked={Boolean(filters.requireAcknowledgementOnly)}
              onChange={(event) =>
                setFilters((prev) => ({
                  ...prev,
                  requireAcknowledgementOnly: event.target.checked,
                }))
              }
            />
            <Typography fontSize={12.5} color={colors.grey[700]}>
              Waiting for my acknowledgement
            </Typography>
          </Stack>
        </Stack>
      </Box>

      {loading ? <AnnouncementCardSkeleton count={4} /> : null}

      {!loading && rows.length === 0 ? (
        <Box
          sx={{
            borderRadius: 3,
            border: `1px dashed ${colors.grey[300]}`,
            bgcolor: '#fff',
            py: 7,
            textAlign: 'center',
          }}
        >
          <Typography fontSize={15} fontWeight={600} color={colors.grey[800]}>
            Nothing on your board right now
          </Typography>
          <Typography fontSize={12.5} color={colors.grey[500]} mt={0.5}>
            Notices published to you will show up here.
          </Typography>
        </Box>
      ) : null}

      {!loading && rows.length > 0 ? (
        <Stack spacing={1.5}>
          {rows.map((row) => (
            <AnnouncementCard
              key={row.announcement_details.id}
              row={row}
              onClick={() =>
                navigate(
                  `${ANNOUNCEMENT_BASE_PATH}/${row.announcement_details.id}`
                )
              }
            />
          ))}
        </Stack>
      ) : null}

      {!loading && totalPages > 1 ? (
        <Stack alignItems="center" mt={3}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, value) => setPage(value)}
            color="primary"
            size="small"
          />
        </Stack>
      ) : null}
    </Box>
  )
}
