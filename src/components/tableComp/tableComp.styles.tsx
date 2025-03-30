import styled from '@emotion/styled'
import { Paper, TableCell, TableRow } from '@mui/material'
import { colors } from '@src/helpers/colors.helpers'

export const TablePaper = styled(Paper)`
  box-shadow:
    rgba(0, 0, 0, 0.05) 0px 6px 24px 0px,
    rgba(0, 0, 0, 0.08) 0px 0px 0px 1px;
  border-radius: 16px;
`
export const THeadCell = styled(TableCell)`
  color: ${colors.grey[300]};
`

export const StyledTableRow = styled(TableRow)(() => ({
  '&:nth-of-type(odd)': {
    backgroundColor: colors.grey[100],
  },
  // Optional: Define styles for even rows if desired
  // '&:nth-of-type(even)': {
  //   backgroundColor: theme.palette.action.selected,
  // },
}))

export const EmptyImg = styled.img`
  display: block;
  object-fit: contain;
  width: 6rem;
  height: 6rem;
  opacity: 0.5;
`
