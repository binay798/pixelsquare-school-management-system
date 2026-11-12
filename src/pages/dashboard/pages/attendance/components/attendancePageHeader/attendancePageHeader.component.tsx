import { Box, Stack, Typography } from '@mui/material'
import { ReactNode } from 'react'
import { colors } from '@src/helpers/colors.helpers'

interface Props {
  title: string
  subtitle: string
  /** short context values printed next to the title (class section, day) */
  badges?: string[]
  actions?: ReactNode
}

/** Title block shared by the three attendance screens. */
export function AttendancePageHeader({
  title,
  subtitle,
  badges = [],
  actions,
}: Props) {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      alignItems={{ xs: 'stretch', sm: 'flex-start' }}
      justifyContent="space-between"
      spacing={1.5}
    >
      <Box>
        <Typography
          sx={{
            fontSize: 19,
            fontWeight: 700,
            color: colors.grey[900],
            lineHeight: 1.3,
          }}
        >
          {title}
        </Typography>
        <Typography sx={{ fontSize: 12.5, color: colors.grey[500], mt: 0.25 }}>
          {subtitle}
        </Typography>
        {badges.length > 0 ? (
          <Stack
            direction="row"
            spacing={0.75}
            flexWrap="wrap"
            rowGap={0.75}
            mt={1}
          >
            {badges.map((badge) => (
              <Box
                key={badge}
                sx={{
                  px: 1,
                  py: 0.3,
                  borderRadius: 5,
                  border: `1px solid ${colors.grey[200]}`,
                  bgcolor: colors.grey[50],
                  fontSize: 11.5,
                  fontWeight: 600,
                  color: colors.grey[700],
                }}
              >
                {badge}
              </Box>
            ))}
          </Stack>
        ) : null}
      </Box>

      {actions ? (
        <Stack direction="row" alignItems="center" spacing={1}>
          {actions}
        </Stack>
      ) : null}
    </Stack>
  )
}
