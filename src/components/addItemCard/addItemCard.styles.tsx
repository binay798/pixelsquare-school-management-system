import styled from '@emotion/styled'
import { Card } from '@mui/material'
import { colors } from '@src/helpers/colors.helpers'

export const AddItemStyledCard = styled(Card)`
  width: 15rem;
  height: 10rem;
  border-style: dashed;
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-color: #5e5ea9;
  color: #121244;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    background-color: ${colors.cyan[50]};
  }
`
