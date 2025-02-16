import styled from '@emotion/styled'
import {
  Card,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material'
import { animated } from '@react-spring/web'
import { colors } from '@src/helpers/colors.helpers'

export const Container = styled(Card)`
  height: 100vh;
  border-radius: 0px;
  background-color: #0f0b26;
  border: none;
`

export const ListItemTitle = styled(ListItemText)`
  span {
    color: inherit;
    font-weight: normal;
    font-size: 14px;
  }
`

export const ListContainer = styled(List)`
  overflow-y: scroll;
  position: relative;
  height: 85vh;
  overflow-x: hidden;

  &:hover::-webkit-scrollbar-thumb {
    opacity: 1;
    background: ${colors.grey[700]};
  }

  &::-webkit-scrollbar {
    width: 7px;
    opacity: 0;
  }
  &::-webkit-scrollbar-thumb {
    background-clip: content-box;
    border: 4px solid transparent;
    border-radius: 7px;
    background: transparent;
    transition: 0.3s;
  }

  &::-webkit-scrollbar-button {
    width: 0;
    height: 0;
    display: none;
  }

  &::-webkit-scrollbar-corner {
    background-color: transparent;
  }
`
export const ListItemIconContainer = styled(ListItemIcon)`
  min-width: 40px;
  color: inherit;
  svg {
    margin-top: -3px;
    width: 20px;
    height: 20px;
  }
`
export const ListItemBtn = styled(ListItemButton)`
  margin: 0.5rem 1rem;
  border-radius: 0.6rem;
  color: ${colors.grey[400]};
  &:hover {
    background: #635bff;
    color: white;
  }
`
export const ToggleIcon = styled(animated.div)`
  display: flex;
`
