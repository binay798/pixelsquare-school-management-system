import styled from '@emotion/styled'
import { InputField } from '@src/components/input/input.component'
import { colors } from '@src/helpers/colors.helpers'

export const DashboardHeaderContainer = styled.div`
  background-color: white;
  padding: 1rem;
  width: 100%;
  border-bottom: 1px solid ${colors.grey[300]};
  position: sticky;
  top: 0;
  z-index: 5;
`
export const HeaderSearchField = styled(InputField)`
  font-size: 0.8rem;
  border: none;
  background-color: ${colors.grey[200]};
  width: 20rem;
  /* width: 100%; */

  & .MuiOutlinedInput-notchedOutline {
    border: none;
  }

  input {
    color: ${colors.grey[800]};
  }
`
