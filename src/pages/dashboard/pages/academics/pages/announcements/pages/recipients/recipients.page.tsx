import {
  Box,
  InputAdornment,
  Pagination,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  CheckCheck,
  CheckCircle2,
  Clock,
  Search,
  XCircle,
} from 'lucide-react'
import { ButtonComp } from '@src/components/button/button.component'
import { InputField } from '@src/components/input/input.component'
import { SelectField } from '@src/components/select/select.component'
import { StylesConfig } from 'react-select'
import { colors } from '@src/helpers/colors.helpers'
import { useDebounceValue } from '@src/hooks/useDebounceValue.hooks'
import { useDispatch, useSelector } from '@src/store/hooks.store'
import {
  getAnnouncementAnalyticsAction,
  getAnnouncementDetailAction,
  getAnnouncementRecipientsAction,
} from '@src/store/redux/dashboard/academics/announcements/announcements.slice'
import { IAnnouncementRecipientFilters } from '@src/store/redux/dashboard/academics/announcements/announcements.service'
import {
  ANNOUNCEMENT_BASE_PATH,
  formatAnnouncementDateTime,
  getPersonName,
} from '../../announcements.helpers'

const PAGE_LIMIT = 20

const READ_STATE_OPTIONS: {
  label: string
  value: Announcement.ReadState | ''
}[] = [
  { label: 'All recipients', value: '' },
  { label: 'Read', value: 'read' },
  { label: 'Unread', value: 'unread' },
  { label: 'Acknowledged', value: 'acknowledged' },
  { label: 'Pending acknowledgement', value: 'pending' },
]

const controlStyles: StylesConfig = {
  control: (base) => ({
    ...base,
    minHeight: 36,
    minWidth: 210,
    fontSize: 13,
  }),
}

const headerCellSx = {
  fontSize: 11.5,
  fontWeight: 700,
  letterSpacing: 0.4,
  textTransform: 'uppercase' as const,
  color: colors.grey[500],
  borderBottom: `1px solid ${colors.grey[200]}`,
  py: 1.25,
  whiteSpace: 'nowrap' as const,
}

const summaryCardSx = {
  flex: 1,
  minWidth: 150,
  border: `1px solid ${colors.grey[200]}`,
  borderRadius: 2.5,
  bgcolor: '#fff',
  p: 1.75,
}

function SummaryTile({
  label,
  value,
  tone,
}: {
  label: string
  value: number | string
  tone: string
}) {
  return (
    <Box sx={summaryCardSx}>
      <Typography fontSize={11.5} color={colors.grey[500]} mb={0.25}>
        {label}
      </Typography>
      <Typography fontSize={20} fontWeight={700} color={tone}>
        {value}
      </Typography>
    </Box>
  )
}

export function AnnouncementRecipientsPage() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { announcementId } = useParams()
  const noticeId = Number(announcementId)

  const { data: detail } = useSelector(
    (store) => store.announcements.announcementDetail
  )
  const { data: recipients, loading } = useSelector(
    (store) => store.announcements.recipientList
  )
  const { data: analytics } = useSelector(
    (store) => store.announcements.analytics
  )

  const [readState, setReadState] = useState<Announcement.ReadState | ''>('')
  const [searchText, setSearchText] = useState('')
  const [page, setPage] = useState(1)
  const debouncedSearch = useDebounceValue(searchText, 400)

  const filters = useMemo<IAnnouncementRecipientFilters>(
    () => ({
      readState,
      search: debouncedSearch.trim(),
    }),
    [debouncedSearch, readState]
  )

  useEffect(() => {
    if (!noticeId) {
      return
    }
    dispatch(getAnnouncementDetailAction(noticeId))
    dispatch(getAnnouncementAnalyticsAction(noticeId))
  }, [dispatch, noticeId])

  useEffect(() => {
    setPage(1)
  }, [filters])

  useEffect(() => {
    if (!noticeId) {
      return
    }
    dispatch(
      getAnnouncementRecipientsAction({
        announcementId: noticeId,
        filters,
        page,
        limit: PAGE_LIMIT,
      })
    )
  }, [dispatch, filters, noticeId, page])

  const notice = detail?.announcement_details ?? null
  const rows = recipients?.rows ?? []
  const total = Number(recipients?.total ?? 0)
  const totalPages = Math.max(1, Math.ceil(total / PAGE_LIMIT))
  const requireAcknowledgement = Boolean(notice?.require_acknowledgement)

  return (
    <Box>
      <Stack
        direction="row"
        alignItems="center"
        spacing={1}
        mb={2}
        flexWrap="wrap"
        gap={1}
      >
        <ButtonComp
          variant="outlined"
          color="inherit"
          size="small"
          startIcon={<ArrowLeft size={15} />}
          onClick={() => navigate(`${ANNOUNCEMENT_BASE_PATH}/${noticeId}`)}
        >
          Back
        </ButtonComp>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="h6" fontWeight={700} color={colors.grey[900]}>
            Recipients
          </Typography>
          <Typography fontSize={12.5} color={colors.grey[600]} noWrap>
            {notice?.title ?? 'Delivery report'}
          </Typography>
        </Box>
        <ButtonComp
          variant="outlined"
          size="small"
          onClick={() => navigate(ANNOUNCEMENT_BASE_PATH)}
        >
          All announcements
        </ButtonComp>
      </Stack>

      <Stack direction="row" spacing={1.5} mb={2} flexWrap="wrap" gap={1.5}>
        <SummaryTile
          label="Recipients"
          value={Number(analytics?.recipient_count ?? total)}
          tone={colors.grey[900]}
        />
        <SummaryTile
          label="Read"
          value={Number(analytics?.read_count ?? 0)}
          tone={colors.blue[700]}
        />
        <SummaryTile
          label="Unread"
          value={Number(analytics?.unread_count ?? 0)}
          tone={colors.orange[700]}
        />
        {requireAcknowledgement ? (
          <>
            <SummaryTile
              label="Acknowledged"
              value={Number(analytics?.acknowledgement_count ?? 0)}
              tone={colors.green[700]}
            />
            <SummaryTile
              label="Pending acknowledgement"
              value={Number(analytics?.pending_acknowledgement_count ?? 0)}
              tone={colors.red[600]}
            />
          </>
        ) : null}
      </Stack>

      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={1.5}
        mb={2}
        alignItems={{ xs: 'stretch', md: 'center' }}
      >
        <SelectField
          placeholder="Filter by delivery state"
          options={READ_STATE_OPTIONS}
          value={
            READ_STATE_OPTIONS.find((option) => option.value === readState) ??
            READ_STATE_OPTIONS[0]
          }
          onChange={(option) =>
            setReadState(
              (option as { value: Announcement.ReadState | '' } | null)
                ?.value ?? ''
            )
          }
          styles={controlStyles}
          isSearchable={false}
        />
        <Box sx={{ flex: 1, minWidth: 220 }}>
          <InputField
            placeholder="Search recipients by name or email"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            startAdornment={
              <InputAdornment position="start">
                <Search size={16} color={colors.grey[500]} />
              </InputAdornment>
            }
          />
        </Box>
      </Stack>

      <TableContainer
        sx={{
          borderRadius: 3,
          border: `1px solid ${colors.grey[200]}`,
          bgcolor: '#fff',
          overflow: 'hidden',
        }}
      >
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={headerCellSx}>Recipient</TableCell>
              <TableCell sx={headerCellSx}>Email</TableCell>
              <TableCell sx={headerCellSx}>Read</TableCell>
              {requireAcknowledgement ? (
                <TableCell sx={headerCellSx}>Acknowledgement</TableCell>
              ) : null}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading
              ? Array.from({ length: 6 }).map((_, index) => (
                  <TableRow key={index}>
                    {Array.from({ length: requireAcknowledgement ? 4 : 3 }).map(
                      (__, cellIndex) => (
                        <TableCell key={cellIndex}>
                          <Skeleton height={26} />
                        </TableCell>
                      )
                    )}
                  </TableRow>
                ))
              : null}

            {!loading && rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={requireAcknowledgement ? 4 : 3}>
                  <Stack alignItems="center" py={6} spacing={0.5}>
                    <Typography
                      fontSize={14}
                      fontWeight={600}
                      color={colors.grey[700]}
                    >
                      No recipients found
                    </Typography>
                    <Typography fontSize={12} color={colors.grey[500]}>
                      Adjust the delivery state or the search text.
                    </Typography>
                  </Stack>
                </TableCell>
              </TableRow>
            ) : null}

            {!loading
              ? rows.map((row) => (
                  <TableRow key={row.user_id} hover>
                    <TableCell>
                      <Typography
                        fontSize={13}
                        fontWeight={600}
                        color={colors.grey[800]}
                      >
                        {getPersonName(row.user_profile_details)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography fontSize={12.5} color={colors.grey[600]}>
                        {row.email}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        {row.is_read ? (
                          <CheckCircle2 size={14} color={colors.green[600]} />
                        ) : (
                          <XCircle size={14} color={colors.grey[400]} />
                        )}
                        <Typography
                          fontSize={12}
                          color={
                            row.is_read ? colors.grey[800] : colors.grey[500]
                          }
                        >
                          {row.is_read
                            ? formatAnnouncementDateTime(row.read_at)
                            : 'Not opened'}
                        </Typography>
                      </Stack>
                    </TableCell>
                    {requireAcknowledgement ? (
                      <TableCell>
                        <Stack
                          direction="row"
                          spacing={0.5}
                          alignItems="center"
                        >
                          {row.acknowledged_at ? (
                            <CheckCheck size={14} color={colors.green[600]} />
                          ) : (
                            <Clock size={14} color={colors.amber[600]} />
                          )}
                          <Typography
                            fontSize={12}
                            color={
                              row.acknowledged_at
                                ? colors.grey[800]
                                : colors.amber[700]
                            }
                          >
                            {row.acknowledged_at
                              ? formatAnnouncementDateTime(row.acknowledged_at)
                              : 'Pending'}
                          </Typography>
                        </Stack>
                      </TableCell>
                    ) : null}
                  </TableRow>
                ))
              : null}
          </TableBody>
        </Table>
      </TableContainer>

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
