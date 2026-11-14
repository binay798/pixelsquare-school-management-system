import {
  Box,
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
import { ReactNode } from 'react'
import { colors } from '@src/helpers/colors.helpers'
import { FeeEmptyState } from './feeEmptyState.component'

export interface IFeeColumn<T> {
  key: string
  label: ReactNode
  align?: 'left' | 'right' | 'center'
  width?: number | string
  render?: (row: T, index: number) => ReactNode
  /** Hide the column below this breakpoint to keep small screens usable. */
  hideBelow?: 'sm' | 'md' | 'lg'
  nowrap?: boolean
}

interface Props<T> {
  columns: IFeeColumn<T>[]
  rows: T[]
  rowKey: (row: T) => string | number
  loading?: boolean
  skeletonRows?: number
  onRowClick?: (row: T) => void
  emptyTitle?: string
  emptyDescription?: string
  emptyAction?: ReactNode
  emptyIcon?: ReactNode
  footer?: ReactNode
  maxHeight?: number | string
  dense?: boolean
}

const headerCellSx = {
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: 0.4,
  textTransform: 'uppercase' as const,
  color: colors.grey[500],
  borderBottom: `1px solid ${colors.grey[200]}`,
  bgcolor: '#fff',
  py: 1.1,
  whiteSpace: 'nowrap' as const,
}

const hideSx = (breakpoint?: 'sm' | 'md' | 'lg') => {
  if (!breakpoint) {
    return undefined
  }

  return { display: { xs: 'none', [breakpoint]: 'table-cell' } }
}

/**
 * Table used by every fee listing.
 *
 * It renders a skeleton while loading, a real empty state when the API returns
 * no rows (never fake data) and keeps financial columns right aligned with
 * tabular figures.
 */
export function FeeDataTable<T>({
  columns,
  rows,
  rowKey,
  loading = false,
  skeletonRows = 5,
  onRowClick,
  emptyTitle = 'No records found',
  emptyDescription,
  emptyAction,
  emptyIcon,
  footer,
  maxHeight,
  dense = false,
}: Props<T>) {
  const showEmpty = !loading && rows.length === 0

  return (
    <Box>
      <TableContainer sx={{ maxHeight, borderRadius: 0, bgcolor: '#fff' }}>
        <Table size="small" stickyHeader={Boolean(maxHeight)}>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.key}
                  align={column.align ?? 'left'}
                  sx={{
                    ...headerCellSx,
                    width: column.width,
                    ...hideSx(column.hideBelow),
                  }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading
              ? Array.from({ length: skeletonRows }).map((_, rowIndex) => (
                  <TableRow key={`skeleton-${rowIndex}`}>
                    {columns.map((column) => (
                      <TableCell
                        key={column.key}
                        sx={{
                          py: dense ? 1 : 1.4,
                          ...hideSx(column.hideBelow),
                        }}
                      >
                        <Skeleton height={22} />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : rows.map((row, index) => (
                  <TableRow
                    key={rowKey(row)}
                    hover={Boolean(onRowClick)}
                    onClick={() => onRowClick?.(row)}
                    sx={{
                      cursor: onRowClick ? 'pointer' : 'default',
                      '&:last-of-type td': { borderBottom: 0 },
                    }}
                  >
                    {columns.map((column) => (
                      <TableCell
                        key={column.key}
                        align={column.align ?? 'left'}
                        sx={{
                          py: dense ? 0.9 : 1.25,
                          fontSize: 12.5,
                          color: colors.grey[800],
                          borderBottom: `1px solid ${colors.grey[100]}`,
                          whiteSpace: column.nowrap ? 'nowrap' : undefined,
                          fontVariantNumeric:
                            column.align === 'right'
                              ? 'tabular-nums'
                              : undefined,
                          ...hideSx(column.hideBelow),
                        }}
                      >
                        {column.render
                          ? column.render(row, index)
                          : String(
                              (row as Record<string, unknown>)[column.key] ??
                                '—'
                            )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </TableContainer>

      {showEmpty ? (
        <FeeEmptyState
          title={emptyTitle}
          description={emptyDescription}
          action={emptyAction}
          icon={emptyIcon}
        />
      ) : null}

      {footer ? (
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="flex-end"
          spacing={1}
          sx={{ px: 1.5, py: 1, borderTop: `1px solid ${colors.grey[100]}` }}
        >
          {footer}
        </Stack>
      ) : null}
    </Box>
  )
}

interface AmountProps {
  value: ReactNode
  strong?: boolean
  tone?: 'default' | 'danger' | 'success' | 'muted'
}

/** Right aligned money cell with tabular figures. */
export function FeeAmount({ value, strong, tone = 'default' }: AmountProps) {
  const color =
    tone === 'danger'
      ? colors.red[600]
      : tone === 'success'
      ? colors.green[700]
      : tone === 'muted'
      ? colors.grey[500]
      : colors.grey[900]

  return (
    <Typography
      component="span"
      fontSize={12.5}
      fontWeight={strong ? 700 : 500}
      color={color}
      sx={{ fontVariantNumeric: 'tabular-nums' }}
    >
      {value}
    </Typography>
  )
}

/** Two line cell (primary + muted secondary), the most common fee pattern. */
export function FeeCellStack({
  primary,
  secondary,
}: {
  primary: ReactNode
  secondary?: ReactNode
}) {
  return (
    <Stack spacing={0.15}>
      <Typography fontSize={12.5} fontWeight={600} color={colors.grey[900]}>
        {primary}
      </Typography>
      {secondary ? (
        <Typography fontSize={11.5} color={colors.grey[500]}>
          {secondary}
        </Typography>
      ) : null}
    </Stack>
  )
}
