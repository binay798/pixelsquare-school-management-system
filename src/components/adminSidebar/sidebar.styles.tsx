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
  width: 280px;
  border-radius: 0px;
  background-color: #0f0b26;
  border: none;
`

export const ListItemTitle = styled(ListItemText)`
  span {
    color: ${colors.grey[200]};
    font-weight: bold;
    font-size: 12px;
  }
`

export const ListContainer = styled(List)`
  overflow-y: scroll;
  position: relative;
  height: 85vh;

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

  svg {
    margin-top: -3px;
    color: ${colors.grey[200]};
    width: 24px;
    height: 24px;
  }
`
export const ListItemBtn = styled(ListItemButton)`
  &:hover {
    background: #0c253d7b;
  }
`
export const ToggleIcon = styled(animated.div)`
  display: flex;
`
