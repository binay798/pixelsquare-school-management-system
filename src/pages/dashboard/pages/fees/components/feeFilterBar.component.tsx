import { Box, Stack, Typography } from '@mui/material'
import { ReactNode } from 'react'
import { RotateCcw, SlidersHorizontal } from 'lucide-react'
import { ButtonComp } from '@src/components/button/button.component'
import { colors } from '@src/helpers/colors.helpers'

interface Props {
  children: ReactNode
  onClear?: () => void
  active?: boolean
  title?: string
  footer?: ReactNode
  /** Columns on large screens, defaults to 4. */
  columns?: number
}

/**
 * Filter surface shared by every fee listing. Keeps the search / selects /
 * date range in the same visual rhythm across the module.
 */
export function FeeFilterBar({
  children,
  onClear,
  active = false,
  title = 'Filters',
  footer,
  columns = 4,
}: Props) {
  return (
    <Box
      sx={{
        borderRadius: 3,
        border: `1px solid ${colors.grey[200]}`,
        bgcolor: '#fff',
        p: 1.75,
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        mb={1.25}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <SlidersHorizontal size={15} color={colors.grey[600]} />
          <Typography fontSize={13} fontWeight={600} color={colors.grey[800]}>
            {title}
          </Typography>
        </Stack>
        {active && onClear ? (
          <ButtonComp
            size="small"
            variant="text"
            startIcon={<RotateCcw size={13} />}
            onClick={onClear}
          >
            Clear
          </ButtonComp>
        ) : null}
      </Stack>

      <Box
        sx={{
          display: 'grid',
          gap: 1.25,
          gridTemplateColumns: {
            xs: '1fr',
            sm: `repeat(2, minmax(0, 1fr))`,
            lg: `repeat(${columns}, minmax(0, 1fr))`,
          },
        }}
      >
        {children}
      </Box>

      {footer ? (
        <Box mt={1.25} pt={1.25} borderTop={`1px dashed ${colors.grey[200]}`}>
          {footer}
        </Box>
      ) : null}
    </Box>
  )
}
