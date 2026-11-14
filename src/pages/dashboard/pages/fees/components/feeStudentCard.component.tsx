import { Avatar, Box, Skeleton, Stack, Typography } from '@mui/material'
import { GraduationCap, Phone, Users } from 'lucide-react'
import { colors } from '@src/helpers/colors.helpers'
import { fullName, initialsOf } from '../fees.helpers'

interface Props {
  student: Students.IStudentDetail | null
  loading?: boolean
  /** Extra content rendered on the right (e.g. wallet balance). */
  aside?: React.ReactNode
  compact?: boolean
}

/**
 * Identity card of a student used by the collection, wallet, invoice detail and
 * concession screens. Data comes from `GET /students/:studentId`.
 */
export function FeeStudentCard({
  student,
  loading = false,
  aside,
  compact = false,
}: Props) {
  if (loading) {
    return (
      <Box
        sx={{
          p: 1.75,
          borderRadius: 3,
          border: `1px solid ${colors.grey[200]}`,
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Skeleton variant="circular" width={44} height={44} />
          <Box flex={1}>
            <Skeleton width="50%" height={22} />
            <Skeleton width="30%" height={18} />
          </Box>
        </Stack>
      </Box>
    )
  }

  if (!student) {
    return (
      <Box
        sx={{
          p: 2,
          borderRadius: 3,
          border: `1px dashed ${colors.grey[300]}`,
          bgcolor: colors.grey[50],
          textAlign: 'center',
        }}
      >
        <Typography fontSize={12.5} color={colors.grey[500]}>
          Select a student to continue.
        </Typography>
      </Box>
    )
  }

  const profile = student.user_profile_details
  const guardians = student.guardians ?? []
  const billingGuardian =
    guardians.find(
      (guardian) =>
        (guardian.link_details as unknown as { is_billing_contact?: boolean })
          .is_billing_contact
    ) ?? guardians[0]

  return (
    <Box
      sx={{
        p: 1.75,
        borderRadius: 3,
        border: `1px solid ${colors.grey[200]}`,
        bgcolor: '#fff',
      }}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1.5}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar
            sx={{
              width: 44,
              height: 44,
              bgcolor: colors.blue[50],
              color: colors.blue[700],
              fontWeight: 700,
              fontSize: 15,
            }}
          >
            {initialsOf(profile?.firstname, profile?.lastname)}
          </Avatar>
          <Box>
            <Typography fontSize={15} fontWeight={700} color={colors.grey[900]}>
              {fullName(profile?.firstname, profile?.lastname)}
            </Typography>
            <Stack
              direction="row"
              spacing={1.5}
              flexWrap="wrap"
              rowGap={0.5}
              mt={0.25}
            >
              <Stack direction="row" spacing={0.5} alignItems="center">
                <GraduationCap size={13} color={colors.grey[500]} />
                <Typography fontSize={12} color={colors.grey[600]}>
                  {student.class_details?.name ?? 'No class'}
                  {student.class_section_details?.name
                    ? ` · ${student.class_section_details.name}`
                    : ''}
                  {student.student_academic_year_details?.roll_no
                    ? ` · Roll ${student.student_academic_year_details.roll_no}`
                    : ''}
                </Typography>
              </Stack>
              <Typography fontSize={12} color={colors.grey[500]}>
                Student ID #{student.student_details?.id}
              </Typography>
              {profile?.mobile ? (
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <Phone size={12} color={colors.grey[500]} />
                  <Typography fontSize={12} color={colors.grey[600]}>
                    {profile.mobile}
                  </Typography>
                </Stack>
              ) : null}
            </Stack>
            {!compact ? (
              <Stack
                direction="row"
                spacing={0.5}
                alignItems="center"
                mt={0.75}
              >
                <Users size={12} color={colors.grey[500]} />
                <Typography fontSize={11.5} color={colors.grey[600]}>
                  {billingGuardian
                    ? `Billing guardian: ${fullName(
                        billingGuardian.user_profile_details?.firstname,
                        billingGuardian.user_profile_details?.lastname
                      )}${
                        billingGuardian.user_profile_details?.mobile
                          ? ` · ${billingGuardian.user_profile_details.mobile}`
                          : ''
                      }`
                    : 'No guardian linked to this student'}
                </Typography>
              </Stack>
            ) : null}
          </Box>
        </Stack>
        {aside ? <Box>{aside}</Box> : null}
      </Stack>
    </Box>
  )
}
