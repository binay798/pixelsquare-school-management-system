import { useTransition, animated } from '@react-spring/web'
import { Container, ToastItemContainer, ToastTypeImage } from './toast.styes'
import { Stack, Typography } from '@mui/material'
import { useSelector } from '@src/store/hooks.store'
import { ToastProvider, useToast } from './toast.hooks'
import { useEffect } from 'react'
import { CloseBtn } from '../button/button.component'
import tick from '../../assets/images/tick.png'
import closePng from '../../assets/images/close.png'

export function Toast(props: { children: React.ReactNode }) {
  const { data: items } = useSelector((state) => state.toast)
  const transitions = useTransition(items, {
    from: {
      opacity: 0,
      height: 0,
      life: '100%',
      transformOrigin: 'center center',
      scale: 0.7,
    },
    key: (item: { id: number }) => item.id,
    enter: (item) => async (next) => {
      await next({
        opacity: 1,
        height: item.height + 10,
        scale: 1,
      })
      await next({ life: '0%' })
    },
    leave: [{ opacity: 0, scale: 0.7, height: 0 }],
  })

  return (
    <ToastProvider.Provider value={items}>
      <Container>
        <Stack direction="column" gap={0}>
          {transitions(({ ...style }, item) => (
            <animated.div
              key={item.id}
              style={{
                ...style,
              }}
            >
              <ToastItem data={item} />
            </animated.div>
          ))}
        </Stack>
      </Container>
      {props.children}
    </ToastProvider.Provider>
  )
}

function ToastItem(props: {
  data: { id: number; message: string; type: 'success' | 'error' }
}) {
  const toast = useToast()
  useEffect(() => {
    const timeout = setTimeout(() => {
      toast.remove(props.data.id)
    }, 7000)

    return () => {
      clearTimeout(timeout)
    }
  }, [])

  const removeToast = () => {
    toast.remove(props.data.id)
  }

  return (
    <ToastItemContainer>
      <Stack
        direction="row"
        gap={2}
        alignItems={'center'}
        justifyContent={'space-between'}
      >
        <ToastTypeImage
          src={props.data.type === 'success' ? tick : closePng}
          alt="tick"
        />
        <Typography variant="body2">
          Item {props.data.message} hello ther and welcome htere and there
        </Typography>
        <CloseBtn onClick={removeToast} />
      </Stack>
    </ToastItemContainer>
  )
}
