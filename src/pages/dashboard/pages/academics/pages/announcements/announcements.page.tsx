import { Box, Pagination, Stack, Typography } from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Megaphone, Newspaper, Plus } from 'lucide-react'
import { ButtonComp } from '@src/components/button/button.component'
import { DeleteConfirmationModal } from '@src/components/confirmationModal/deleteConfirmationModal.component'
import { colors } from '@src/helpers/colors.helpers'
import { ROLE } from '@src/constants/users.constants'
import { useDispatch, useSelector } from '@src/store/hooks.store'
import {
  deleteAnnouncementAction,
  getAnnouncementListAction,
  getAnnouncementStatsAction,
  updateAnnouncementStatusAction,
} from '@src/store/redux/dashboard/academics/announcements/announcements.slice'
import { IAnnouncementFilters } from '@src/store/redux/dashboard/academics/announcements/announcements.service'
import { ANNOUNCEMENT_BASE_PATH } from './announcements.helpers'
import { AnnouncementStatCards } from './components/statCards/announcementStatCards.component'
import { AnnouncementFilterBar } from './components/filterBar/announcementFilterBar.component'
import { AnnouncementTable } from './components/announcementTable/announcementTable.component'
import { AnnouncementFeedPage } from './pages/feed/feed.page'

const PAGE_LIMIT = 10

const MANAGER_ROLES: string[] = [ROLE.superadmin, ROLE.admin, ROLE.staff]
const AUTHOR_ROLES: string[] = [
  ROLE.superadmin,
  ROLE.admin,
  ROLE.teacher,
  ROLE.staff,
]

export function AnnouncementListPage() {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const { data: auth } = useSelector((store) => store.auth.user)
  const { data: list, loading } = useSelector(
    (store) => store.announcements.announcementList
  )
  const { data: stats, loading: statsLoading } = useSelector(
    (store) => store.announcements.announcementStats
  )
  const { loading: deleting } = useSelector(
    (store) => store.announcements.deleteAnnouncement
  )

  const [filters, setFilters] = useState<IAnnouncementFilters>({
    status: '',
    category: '',
    priority: '',
    audienceType: '',
    search: '',
  })
  const [page, setPage] = useState(1)
  const [deleteTarget, setDeleteTarget] =
    useState<Announcement.IListRow | null>(null)

  const userRoles = auth?.userRoles ?? []
  const isManager = useMemo(
    () => userRoles.some((role) => MANAGER_ROLES.includes(role)),
    [userRoles]
  )
  const isAuthor = useMemo(
    () => userRoles.some((role) => AUTHOR_ROLES.includes(role)),
    [userRoles]
  )

  useEffect(() => {
    setPage(1)
  }, [filters])

  useEffect(() => {
    if (!isManager) {
      return
    }
    dispatch(getAnnouncementListAction({ filters, page, limit: PAGE_LIMIT }))
    dispatch(getAnnouncementStatsAction())
  }, [dispatch, filters, page, isManager])

  if (!isManager) {
    return <AnnouncementFeedPage />
  }

  const rows = list?.rows ?? []
  const total = Number(list?.total ?? 0)
  const totalPages = Math.max(1, Math.ceil(total / PAGE_LIMIT))

  const refresh = () => {
    dispatch(getAnnouncementListAction({ filters, page, limit: PAGE_LIMIT }))
    dispatch(getAnnouncementStatsAction())
  }

  const handleDelete = () => {
    if (!deleteTarget) {
      return
    }
    dispatch(
      deleteAnnouncementAction({
        announcementId: deleteTarget.announcement_details.id,
        onSuccess: () => {
          setDeleteTarget(null)
          refresh()
        },
      })
    )
  }

  const handleStatusChange = (
    row: Announcement.IListRow,
    status: Announcement.Status
  ) => {
    dispatch(
      updateAnnouncementStatusAction({
        announcementId: row.announcement_details.id,
        body: { status },
        onSuccess: refresh,
      })
    )
  }

  return (
    <Box>
      <Stack
        mb={3}
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', md: 'center' }}
      >
        <Box>
          <Typography variant="h5" fontWeight={700} color={colors.grey[900]}>
            Announcements
          </Typography>
          <Typography variant="body2" mt={0.5} color={colors.grey[600]}>
            Publish notices to the whole school or to a hand picked audience,
            schedule them and track who has read and acknowledged them.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
          <ButtonComp
            size="small"
            variant="outlined"
            startIcon={<Newspaper size={15} />}
            onClick={() => navigate(`${ANNOUNCEMENT_BASE_PATH}/feed`)}
          >
            My notice board
          </ButtonComp>
          {isAuthor ? (
            <ButtonComp
              startIcon={<Plus size={16} />}
              onClick={() => navigate(`${ANNOUNCEMENT_BASE_PATH}/create`)}
            >
              New announcement
            </ButtonComp>
          ) : null}
        </Stack>
      </Stack>

      <AnnouncementStatCards
        stats={stats}
        loading={statsLoading}
        activeStatus={filters.status ?? ''}
        onSelect={(status) => setFilters((prev) => ({ ...prev, status }))}
      />

      <Box mt={2.5}>
        <AnnouncementFilterBar filters={filters} onChange={setFilters} />
      </Box>

      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        mt={2.5}
        mb={1.5}
      >
        <Stack direction="row" alignItems="center" spacing={0.75}>
          <Megaphone size={14} color={colors.grey[500]} />
          <Typography fontSize={13} color={colors.grey[600]}>
            Showing{' '}
            <Box component="span" fontWeight={700} color={colors.grey[900]}>
              {rows.length}
            </Box>{' '}
            of{' '}
            <Box component="span" fontWeight={700} color={colors.grey[900]}>
              {total}
            </Box>{' '}
            announcements
          </Typography>
        </Stack>
      </Stack>

      <AnnouncementTable
        rows={rows}
        loading={loading}
        canModify
        onView={(row) =>
          navigate(`${ANNOUNCEMENT_BASE_PATH}/${row.announcement_details.id}`)
        }
        onEdit={(row) =>
          navigate(
            `${ANNOUNCEMENT_BASE_PATH}/${row.announcement_details.id}/edit`
          )
        }
        onRecipients={(row) =>
          navigate(
            `${ANNOUNCEMENT_BASE_PATH}/${row.announcement_details.id}/recipients`
          )
        }
        onDelete={setDeleteTarget}
        onStatusChange={handleStatusChange}
      />

      {totalPages > 1 ? (
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

      <DeleteConfirmationModal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirmationClick={handleDelete}
        confirmLoader={deleting}
        heading="Delete this announcement?"
      >
        <Typography fontSize={13.5} color={colors.grey[700]}>
          The notice, its audience and every read / acknowledgement receipt will
          be removed permanently.
        </Typography>
      </DeleteConfirmationModal>
    </Box>
  )
}
