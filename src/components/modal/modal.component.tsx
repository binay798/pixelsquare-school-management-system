/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react'
import Modal, { ModalProps } from '@mui/material/Modal'
import { useSpring, animated, config } from '@react-spring/web'
import { AnimatedBox, BackdropContainer, CloseContainer } from './modal.styles'
import { CloseBtn } from '../button/button.component'
import { Box, Card } from '@mui/material'
import { omit } from 'lodash'
import './modal.css'

interface FadeProps {
  children: React.ReactElement
  in?: boolean
  onClick?: any
  onEnter?: (node: HTMLElement, isAppearing: boolean) => void
  onExited?: (node: HTMLElement, isAppearing: boolean) => void
  ownerState?: any
}

const Fade = React.forwardRef<HTMLDivElement, FadeProps>(
  function Fade(props, ref) {
    const { children, in: open, onClick, onEnter, onExited, ...other } = props
    const style = useSpring({
      from: { opacity: 0 },
      to: { opacity: open ? 1 : 0 },
      onStart: () => {
        if (open && onEnter) {
          onEnter(null as any, true)
        }
      },
      onRest: () => {
        if (!open && onExited) {
          onExited(null as any, true)
        }
      },
      config: config.stiff,
    })

    return (
      <animated.div ref={ref} style={style} {...other}>
        {React.cloneElement(children, { onClick })}
      </animated.div>
    )
  }
)

const customContainer = document.getElementById('modal-portal')
interface ModalMainProps extends ModalProps {
  noPadding?: boolean
  open: boolean
  close: () => void
  children: React.ReactElement
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xlg'
}
export default function SpringModal({
  noPadding = false,
  size = 'sm',
  ...props
}: ModalMainProps) {
  const handleClose = () => {
    props.close()
  }
  const boxStyle = useSpring({
    from: { scale: 0.8 },
    to: { scale: props.open ? 1 : 0.8 },

    config: config.stiff,
  })

  return (
    <div>
      <Modal
        aria-labelledby="spring-modal-title"
        aria-describedby="spring-modal-description"
        // open={props.open}
        onClose={handleClose}
        closeAfterTransition
        hideBackdrop={true}
        container={customContainer}
        {...omit(props, 'noPadding', 'close', 'size')}
      >
        <Fade in={props.open}>
          <BackdropContainer>
            <AnimatedBox style={{ ...boxStyle }}>
              <Card
                sx={{
                  padding: noPadding ? 0 : '20px',
                  borderColor: 'secondary.dark',
                  maxHeight: '90vh',
                  maxWidth: '90vw',
                }}
              >
                <CloseContainer>
                  <CloseBtn onClick={handleClose} />
                </CloseContainer>
                <Box className="custom-modal" sx={{ width: '100%' }}>
                  <Box className={size}>{props.children}</Box>
                </Box>
              </Card>
            </AnimatedBox>
          </BackdropContainer>
        </Fade>
      </Modal>
    </div>
  )
}
