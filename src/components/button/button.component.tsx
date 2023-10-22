import {
  Button,
  ButtonProps,
  IconButton,
  IconButtonProps,
  Tooltip,
  TooltipProps,
} from '@mui/material'
import { IconBtn } from './button.styles'
import { AiOutlineClose } from 'react-icons/ai'
import React from 'react'

export function CloseBtn({ ...rest }: IconButtonProps) {
  return (
    <IconBtn {...rest} disableFocusRipple disableTouchRipple size={'small'}>
      <AiOutlineClose size={16} />
    </IconBtn>
  )
}

interface TooltipBtnProps {
  tooltipTitle: string
  buttonProps?: ButtonProps
  placement?: TooltipProps['placement']
  children?: React.ReactNode
}
export function TooltipBtn(props: TooltipBtnProps) {
  return (
    <Tooltip title={props.tooltipTitle} placement={props.placement}>
      <Button {...props.buttonProps}>{props.children}</Button>
    </Tooltip>
  )
}

interface TooltipIconBtnProps {
  buttonProps?: IconButtonProps
  tooltipTitle: string
  placement?: TooltipProps['placement']
  children?: React.ReactNode
}
export function TooltipIconBtn(props: TooltipIconBtnProps) {
  return (
    <Tooltip title={props.tooltipTitle} placement={props.placement}>
      <IconButton {...props.buttonProps}>{props.children}</IconButton>
    </Tooltip>
  )
}
