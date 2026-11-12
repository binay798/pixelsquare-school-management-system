import { Box, Stack, Typography } from '@mui/material'
import { RotateCcw, SlidersHorizontal } from 'lucide-react'
import { ReactNode } from 'react'
import { ButtonComp } from '@src/components/button/button.component'
import { colors } from '@src/helpers/colors.helpers'

interface Props {
  children: ReactNode
  /** extra context printed next to the title (academic year, class section) */
  context?: ReactNode
  onReset?: () => void
  hasActiveFilters?: boolean
  /** number of columns of the grid on large screens */
  columns?: number
}

/**
 * Shell of the filter bar of the three attendance screens: the pages only pass
 * their own fields, so the spacing and the "Clear" action stay identical.
 */
export function AttendanceFilters({
  children,
  context,
  onReset,
  hasActiveFilters = false,
  columns = 3,
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
        flexWrap="wrap"
        rowGap={1}
        spacing={1}
        mb={1.5}
      >
        <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
          <SlidersHorizontal size={15} color={colors.grey[600]} />
          <Typography fontSize={13} fontWeight={600} color={colors.grey[800]}>
            Filters
          </Typography>
          {context}
        </Stack>
        {onReset && hasActiveFilters ? (
          <ButtonComp
            size="small"
            variant="text"
            startIcon={<RotateCcw size={13} />}
            onClick={onReset}
          >
            Clear
          </ButtonComp>
        ) : null}
      </Stack>

      <Box
        sx={{
          display: 'grid',
          gap: 1.5,
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, minmax(0, 1fr))',
            lg: `repeat(${columns}, minmax(0, 1fr))`,
          },
        }}
      >
        {children}
      </Box>
    </Box>
  )
}

/** Small uppercase label shared by every field of the filter bar. */
export function AttendanceFieldLabel({ children }: { children: ReactNode }) {
  return (
    <Typography
      sx={{
        fontSize: 11.5,
        fontWeight: 700,
        letterSpacing: 0.4,
        textTransform: 'uppercase',
        color: colors.grey[500],
        mb: 0.75,
      }}
    >
      {children}
    </Typography>
  )
}
