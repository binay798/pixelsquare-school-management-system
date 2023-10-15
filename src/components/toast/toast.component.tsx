import { useTransition } from '@react-spring/web'
import { Container, ToastItemContainer } from './toast.styes'
import { useState } from 'react'
import { Stack } from '@mui/material'

export function Toast() {
  const [item, setItem] = useState<string[]>([])

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     setItem((prev) => [...prev, 'new'])
  //   }, 1000)

  //   return () => {
  //     clearInterval(interval)
  //   }
  // }, [])

  return (
    <Container>
      <Stack direction="column" gap={2}>
        {item?.map((data, id) => <ToastItem key={id} data={data} />)}
      </Stack>
      <button
        onClick={() => setItem((prev) => [...prev, 'new' + ' ' + Date.now()])}
      >
        Add new toast
      </button>
    </Container>
  )
}

function ToastItem(props: { data: string }) {
  const move = useTransition(0, {
    from: { opacity: 0, translateY: '100px', height: '10px' },
    enter: { opacity: 1, translateY: '0px', height: '100px' },
    leave: { opacity: 1, translateY: '100px' },
    // from: { opacity: 0, transform: 'translate3d(0, -40px, 0)' },
    // enter: { opacity: 1, transform: 'translate3d(0, 0, 0)' },
    // leave: { opacity: 0, transform: 'translate3d(0, -40px, 0)' },
    duration: 5000,
  })

  return move((style) => (
    <ToastItemContainer style={{ ...style, transformOrigin: 'center' }}>
      Item {props.data}
    </ToastItemContainer>
  ))
}
