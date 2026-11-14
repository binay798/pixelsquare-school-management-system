import { Box, Stack, SxProps, Theme, Typography } from '@mui/material'
import { ReactNode } from 'react'
import { colors } from '@src/helpers/colors.helpers'

interface Props {
  title?: ReactNode
  subtitle?: ReactNode
  action?: ReactNode
  children: ReactNode
  /** Remove the inner padding (tables that manage their own spacing). */
  noPadding?: boolean
  footer?: ReactNode
  sx?: SxProps<Theme>
}

/** Bordered surface used across the fee module (filters, charts, tables). */
export function FeePanel({
  title,
  subtitle,
  action,
  children,
  noPadding = false,
  footer,
  sx,
}: Props) {
  return (
    <Box
      sx={{
        borderRadius: 3,
        border: `1px solid ${colors.grey[200]}`,
        bgcolor: '#fff',
        overflow: 'hidden',
        ...sx,
      }}
    >
      {title || action ? (
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1}
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          justifyContent="space-between"
          sx={{ px: 2, pt: 1.75, pb: noPadding ? 1.25 : 0 }}
        >
          <Box>
            {title ? (
              <Typography
                fontSize={14}
                fontWeight={700}
                color={colors.grey[900]}
              >
                {title}
              </Typography>
            ) : null}
            {subtitle ? (
              <Typography fontSize={12} color={colors.grey[500]} mt={0.25}>
                {subtitle}
              </Typography>
            ) : null}
          </Box>
          {action ? (
            <Stack direction="row" spacing={0.75} alignItems="center">
              {action}
            </Stack>
          ) : null}
        </Stack>
      ) : null}

      <Box sx={{ p: noPadding ? 0 : 2, pt: noPadding ? 0 : 1.75 }}>
        {children}
      </Box>

      {footer ? (
        <Box
          sx={{ px: 2, py: 1.25, borderTop: `1px solid ${colors.grey[100]}` }}
        >
          {footer}
        </Box>
      ) : null}
    </Box>
  )
}
