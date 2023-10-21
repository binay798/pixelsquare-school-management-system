/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react'
import Modal from '@mui/material/Modal'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { useSpring, animated, config } from '@react-spring/web'
import { AnimatedBox, BackdropContainer, CloseContainer } from './modal.styles'
import { CloseBtn } from '../button/button.component'

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
}
export default function SpringModal({ noPadding = false }: ModalProps) {
  const [open, setOpen] = React.useState(false)
  const handleOpen = () => setOpen(true)
  const handleClose = () => {
    setOpen(false)
  }
  const boxStyle = useSpring({
    from: { scale: 0.8 },
    to: { scale: open ? 1 : 0.8 },

    config: config.stiff,
  })

  return (
    <div>
      <Button onClick={handleOpen}>Open modal</Button>
      <Modal
        aria-labelledby="spring-modal-title"
        aria-describedby="spring-modal-description"
        open={open}
        onClose={handleClose}
        closeAfterTransition
        hideBackdrop={true}
      >
        <Fade in={open}>
          <BackdropContainer>
            <AnimatedBox
              style={{ ...boxStyle, padding: noPadding ? '0px' : '20px' }}
            >
              <CloseContainer>
                <CloseBtn onClick={handleClose} />
              </CloseContainer>
              <Typography
                id="spring-modal-title"
                variant="h6"
                component="h2"
                onClick={handleClose}
              >
                Text in a modal
              </Typography>
              <Typography id="spring-modal-description" sx={{ mt: 2 }}>
                Duis mollis, est non commodo luctus, nisi erat porttitor ligula.
              </Typography>
            </AnimatedBox>
          </BackdropContainer>
        </Fade>
      </Modal>
    </div>
  )
}
