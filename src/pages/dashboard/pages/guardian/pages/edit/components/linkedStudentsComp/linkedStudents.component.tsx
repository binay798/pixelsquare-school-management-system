import { Avatar, Box, Chip, Stack, Typography } from '@mui/material'
import { ButtonComp } from '@src/components/button/button.component'
import { TableComp } from '@src/components/tableComp/tableComp.components'
import { CustomSwitch } from '@src/components/switch/switch.component'
import { colors } from '@src/helpers/colors.helpers'
import { getImageUrl } from '@src/helpers/getImageUrl.helpers'
import { useDispatch, useSelector } from '@src/store/hooks.store'
import {
  detachStudentFromGuardianAction,
  getGuardianStudentsAction,
  updateGuardianStudentLinkAction,
} from '@src/store/redux/dashboard/guardian/guardian.slice'
import { useEffect, useState } from 'react'
import { GoPlus } from 'react-icons/go'
import { LinkStudentModal } from '../linkStudentModal/linkStudentModal.component'
import { relationshipLabel } from '../../guardian.constants'

interface Props {
  guardianId: number
}

interface ITableRow {
  id: number
  custom: string
  name: string
  rollNo: string
  className: string
  relationship: string
  isPrimary: boolean
  canPickup: boolean
  canViewAcademics: boolean
  canViewFees: boolean
  receivesAnnouncements: boolean
  isEmergencyContact: boolean
  photo: string
  link: Guardian.IStudentGuardianLink
}

export function LinkedStudentsComp(props: Props) {
  const dispatch = useDispatch()
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [search, setSearch] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)
  const [modalOpen, setModalOpen] = useState(false)

  const { data, loading } = useSelector(
    (store) => store.guardians.linkedStudents
  )
  const linkLoading = useSelector((store) => store.guardians.link)

  useEffect(() => {
    dispatch(
      getGuardianStudentsAction({
        guardianId: props.guardianId,
        page,
        limit,
        search,
      })
    )
  }, [props.guardianId, page, limit, search, refreshKey])

  const reload = () => setRefreshKey((key) => key + 1)

  const togglePermission = (
    item: ITableRow,
    key: keyof Guardian.IPermissionFlags,
    checked: boolean
  ) => {
    dispatch(
      updateGuardianStudentLinkAction({
        guardianId: props.guardianId,
        studentId: item.id,
        payload: { [key]: checked },
        onSuccess: reload,
      })
    )
  }

  const makePrimary = (item: ITableRow) => {
    dispatch(
      updateGuardianStudentLinkAction({
        guardianId: props.guardianId,
        studentId: item.id,
        payload: { is_primary: true },
        onSuccess: reload,
      })
    )
  }

  const rows: ITableRow[] = (data?.rows ?? []).map((row) => ({
    id: row.student_details.id,
    custom: '',
    photo: row.asset_details?.path ? getImageUrl(row.asset_details.path) : '',
    name: [
      row.user_profile_details.firstname,
      row.user_profile_details.lastname,
    ]
      .filter(Boolean)
      .join(' '),
    rollNo: row.student_academic_year_details?.roll_no
      ? String(row.student_academic_year_details.roll_no)
      : '—',
    className: `${row.class_details?.name ?? '—'}${
      row.class_section_details?.name
        ? ` - ${row.class_section_details.name}`
        : ''
    }`,
    relationship: relationshipLabel(row.link_details.relationship),
    isPrimary: row.link_details.is_primary,
    canPickup: row.link_details.can_pickup_student,
    canViewAcademics: row.link_details.can_view_academics,
    canViewFees: row.link_details.can_view_fees,
    receivesAnnouncements: row.link_details.receives_announcements,
    isEmergencyContact: row.link_details.is_emergency_contact,
    link: row.link_details,
  }))

  return (
    <Box>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        mb={2}
      >
        <Box>
          <Typography variant="subtitle1" fontWeight={600}>
            Linked Students
          </Typography>
          <Typography variant="body2" color={colors.grey[600]}>
            Students attached to this guardian. Toggle a permission to update it
            instantly.
          </Typography>
        </Box>
        <ButtonComp
          size="small"
          startIcon={<GoPlus />}
          onClick={() => setModalOpen(true)}
        >
          Link Student
        </ButtonComp>
      </Stack>

      <TableComp
        columns={[
          {
            field: 'photo',
            name: 'Photo',
            render: (_, item) => (
              <Avatar src={item.photo} alt={item.name}>
                {item.name.charAt(0)}
              </Avatar>
            ),
          },
          { field: 'name', name: 'Student' },
          { field: 'rollNo', name: 'Roll No' },
          { field: 'className', name: 'Class' },
          { field: 'relationship', name: 'Relationship' },
          {
            field: 'custom',
            name: 'Primary',
            render: (_, item) =>
              item.isPrimary ? (
                <Chip size="small" color="primary" label="Primary" />
              ) : (
                <ButtonComp
                  variant="text"
                  size="small"
                  disabled={linkLoading.update}
                  onClick={() => makePrimary(item)}
                >
                  Make primary
                </ButtonComp>
              ),
          },
          {
            field: 'custom',
            name: 'Permissions',
            render: (_: React.ReactNode, item: ITableRow) => (
              <Stack direction="row" spacing={1}>
                {(
                  [
                    ['can_pickup_student', item.canPickup, 'Pickup'],
                    ['can_view_academics', item.canViewAcademics, 'Academics'],
                    ['can_view_fees', item.canViewFees, 'Fees'],
                    [
                      'receives_announcements',
                      item.receivesAnnouncements,
                      'Announcements',
                    ],
                    [
                      'is_emergency_contact',
                      item.isEmergencyContact,
                      'Emergency',
                    ],
                  ] as [keyof Guardian.IPermissionFlags, boolean, string][]
                ).map(([key, checked, label]) => (
                  <Stack key={key} alignItems="center" spacing={0.5}>
                    <CustomSwitch
                      size="small"
                      checked={checked}
                      disabled={linkLoading.update}
                      onChange={(event) =>
                        togglePermission(item, key, event.target.checked)
                      }
                    />
                    <Typography variant="caption" color={colors.grey[600]}>
                      {label}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            ),
          },
        ]}
        data={rows}
        loading={loading}
        count={Number(data?.total ?? 0)}
        rowsPerPage={limit}
        page={page}
        limits={[limit]}
        onPageChange={setPage}
        search={(value) => {
          setSearch(value)
          setPage(1)
        }}
        actions={{
          onDelete: (item, onClose) => {
            dispatch(
              detachStudentFromGuardianAction({
                guardianId: props.guardianId,
                studentId: item.id,
                onSuccess: () => {
                  onClose?.()
                  reload()
                },
              })
            )
          },
        }}
        deleteConfirmLoader={linkLoading.detach}
        deleteConfirmationModalDescription={
          <Typography>
            Detaching this student removes all permissions granted to the
            guardian for that student. This action cannot be undone.
          </Typography>
        }
      />

      {modalOpen && (
        <LinkStudentModal
          open={modalOpen}
          guardianId={props.guardianId}
          onClose={() => setModalOpen(false)}
          onSuccess={reload}
        />
      )}
    </Box>
  )
}
