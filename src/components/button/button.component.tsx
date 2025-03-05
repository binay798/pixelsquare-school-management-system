import {
  Button,
  ButtonProps,
  CircularProgress,
  IconButton,
  IconButtonProps,
  Stack,
  Tooltip,
  TooltipProps,
} from '@mui/material'
import { AiOutlineClose } from 'react-icons/ai'
import React from 'react'
import { omit } from 'lodash'
import { colors } from '@src/helpers/colors.helpers'

interface CloseBtnProps extends IconButtonProps {
  placement?: TooltipProps['placement']
}
export function CloseBtn({ placement, ...rest }: CloseBtnProps) {
  return (
    <TooltipIconBtn
      tooltipTitle=""
      placement={placement}
      {...rest}
      disableFocusRipple
      disableTouchRipple
      size={'small'}
    >
      <AiOutlineClose size={16} />
    </TooltipIconBtn>
  )
}

interface TooltipBtnProps extends ButtonProps {
  tooltipTitle: string
  placement?: TooltipProps['placement']
  children?: React.ReactNode
  loading?: boolean
}
export function TooltipBtn(props: TooltipBtnProps) {
  return (
    <Tooltip title={props.tooltipTitle} placement={props.placement}>
      <Button
        {...omit(props, 'loading', 'tooltipTitle', 'placement')}
        disabled={props.loading}
      >
        <Stack direction="row" alignItems="center" gap={1}>
          {props.loading ? (
            <CircularProgress size={18} sx={{ color: colors.grey[400] }} />
          ) : null}
          {props.children}
        </Stack>
      </Button>
    </Tooltip>
  )
}

interface ButtonCompProps extends ButtonProps {
  loading?: boolean
  tooltipTitle?: string
  tooltipPlacement?: TooltipProps['placement']
}
export function ButtonComp(props: ButtonCompProps) {
  let loaderSize = 14
  if (props.size === 'small') {
    loaderSize = 12
  } else if (props.size === 'large') {
    loaderSize = 16
  } else if (props.size === 'medium') {
    loaderSize = 15
  }

  return (
    <Tooltip title={props.tooltipTitle} placement={props.tooltipPlacement}>
      <Button
        {...omit(props, 'loading')}
        disabled={props.loading || props.disabled}
      >
        <Stack direction="row" alignItems="center" gap={1}>
          {props.children}
          {props.loading ? (
            <CircularProgress
              size={loaderSize}
              sx={{ color: colors.lightBlue[50] }}
            />
          ) : null}
        </Stack>
      </Button>
    </Tooltip>
  )
}

interface TooltipIconBtnProps extends IconButtonProps {
  tooltipTitle: string
  placement?: TooltipProps['placement']
  children?: React.ReactNode
}
export function TooltipIconBtn(props: TooltipIconBtnProps) {
  return (
    <Tooltip title={props.tooltipTitle} placement={props.placement}>
      <IconButton {...omit(props, 'tooltipTitle', 'placement')}>
        {props.children}
      </IconButton>
    </Tooltip>
  )
}
