import styled from '@emotion/styled'
import { Paper, TableCell } from '@mui/material'
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
