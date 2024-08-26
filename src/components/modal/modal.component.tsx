/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react'
import Modal from '@mui/material/Modal'
import { useSpring, animated, config } from '@react-spring/web'
import { AnimatedBox, BackdropContainer, CloseContainer } from './modal.styles'
import { CloseBtn } from '../button/button.component'
import { Card } from '@mui/material'

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

interface ModalProps {
  noPadding?: boolean
  disableOutsideClick?: boolean
  open: boolean
  close: () => void
  children: React.ReactNode
}
export default function SpringModal({
  noPadding = false,
  ...props
}: ModalProps) {
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
        open={props.open}
        onClose={handleClose}
        closeAfterTransition
        hideBackdrop={true}
      >
        <Fade in={props.open}>
          <BackdropContainer>
            <AnimatedBox style={{ ...boxStyle }}>
              <Card
                sx={{
                  padding: noPadding ? 0 : '20px',
                  borderColor: 'secondary.dark',
                }}
              >
                <CloseContainer>
                  <CloseBtn onClick={handleClose} />
                </CloseContainer>
                {props.children}
              </Card>
            </AnimatedBox>
          </BackdropContainer>
        </Fade>
      </Modal>
    </div>
  )
}
