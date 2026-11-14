import { Box, Skeleton, Stack, Typography } from '@mui/material'
import { ArrowLeft } from 'lucide-react'
import { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { ButtonComp } from '@src/components/button/button.component'
import { colors } from '@src/helpers/colors.helpers'

interface Props {
  title: string
  subtitle?: string
  actions?: ReactNode
  /** Shows a back button that navigates to this path. */
  backTo?: string
  backLabel?: string
  meta?: ReactNode
  loading?: boolean
}

/** Standard header of every fee screen (title, description, actions, back). */
export function FeePageHeader({
  title,
  subtitle,
  actions,
  backTo,
  backLabel = 'Back',
  meta,
  loading = false,
}: Props) {
  const navigate = useNavigate()

  return (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      spacing={{ xs: 1.5, md: 2 }}
      alignItems={{ xs: 'flex-start', md: 'center' }}
      justifyContent="space-between"
      mb={2.5}
    >
      <Stack direction="row" spacing={1.25} alignItems="flex-start">
        {backTo ? (
          <ButtonComp
            size="small"
            variant="text"
            startIcon={<ArrowLeft size={15} />}
            onClick={() => navigate(backTo)}
            sx={{ mt: 0.25, px: 1 }}
          >
            {backLabel}
          </ButtonComp>
        ) : null}
        <Box>
          {loading ? (
            <Skeleton width={220} height={34} />
          ) : (
            <Typography
              variant="h5"
              fontWeight={700}
              fontSize={{ xs: 20, md: 24 }}
              color={colors.grey[900]}
            >
              {title}
            </Typography>
          )}
          {subtitle ? (
            <Typography
              variant="body2"
              mt={0.5}
              color={colors.grey[600]}
              maxWidth={720}
            >
              {subtitle}
            </Typography>
          ) : null}
          {meta ? <Box mt={1}>{meta}</Box> : null}
        </Box>
      </Stack>

      {actions ? (
        <Stack
          direction="row"
          spacing={1}
          flexWrap="wrap"
          rowGap={1}
          alignItems="center"
        >
          {actions}
        </Stack>
      ) : null}
    </Stack>
  )
}
